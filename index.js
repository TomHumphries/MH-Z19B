const SerialPort   = require('serialport');
const EventEmitter = require('events');

const BYTES_readCO2        = [0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00];
const BYTES_calibrateTo400 = [0xFF, 0x01, 0x87, 0x00, 0x00, 0x00, 0x00, 0x00];
const BYTES_ABCOn          = [0xFF, 0x01, 0x79, 0xA0, 0x00, 0x00, 0x00, 0x00];
const BYTES_ABCOff         = [0xFF, 0x01, 0x79, 0x00, 0x00, 0x00, 0x00, 0x00];

class MHZ19B extends EventEmitter {
    constructor(port = '/dev/serial0') {
        super();
        this.serialPort = new SerialPort(port, { baudRate: 9600 });

        this.buffer = [];
    
        this.resolve;
        this.reject;

        this.serialPort.on('close', () => {
            console.log('MH-Z19B port closed');
            this.close();
        });
        
        this.serialPort.on('error', (err) => {
            console.log('MH-Z19B error', err);
            this.close();
        });

        this.serialPort.on('data', (data) => {
            this.buffer.push(...data);
            if (this.buffer.length < 9) {
                return;
            }
            const reading = this.buffer.splice(0, 9);
            this.buffer = [];
            if (getChecksum(reading) != reading[8]) {
                console.log('MH-Z19B - Bad checksum');
                if (this.reject) {
                    this.reject('Bad checksum');
                    this.reject = null;
                }
                return;
            }
            const co2 = (reading[2] * 256) + reading[3];
            this.emit('data', {co2});
            if (this.resolve) {
                this.resolve(co2);
                this.resolve = null;
                return;
            }
        })
    }

    _sendPacket(packet) {
        const packetClone = [...packet];
        appendChecksum(packetClone);
        this.serialPort.write(packetClone, function (err) {
            if (err) console.log('MH-Z19B send command error', err);
        });
    }

    readCO2() {
        this._sendPacket(BYTES_readCO2);
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        })
    }

    calibrate() {
        console.log('Calibrating MH-Z19B sensor to 400 ppm...');
        this._sendPacket(BYTES_calibrateTo400);
    }
    
    abcOn() {
        console.log('Turning MH-Z19B ABC mode ON...');
        this._sendPacket(BYTES_ABCOn);
    }
    
    abcOff() {
        console.log('Turning MH-Z19B ABC mode OFF...');
        this._sendPacket(BYTES_ABCOff);
    }
    
}

function toHexStr(number) {
    let result = `0x${number.toString(16)}`;
    if (result.length == 3) result += '0';
    return result;
}

function appendChecksum(packet) {
    packet.push(toHexStr(getChecksum(packet)));
}

function getChecksum(packet) {
    let checksum = 0;
    for (i = 1; i < 8; i++) {
        checksum += packet[i];
        if (checksum >= 256) checksum -= 256;
    }
    checksum = 0xff - checksum;
    checksum += 1;
    return checksum;
}

module.exports = MHZ19B;