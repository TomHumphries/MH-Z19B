# MH-Z19B
Communication with the MH-Z19B IR CO2 sensor for Node.js

## Declare
```let mhz19b = new MHZ19B('/dev/serial0');```
The default UART port is _'/dev/serial0'_ 

## Commands
Promise based
```
let mhz19b = new MHZ19B();
mhz19b.readCO2()
    .then(data => {
            console.log('CO2 reading', data);
        })
    .catch(err => {
        console.log('error', err);
    })
```


Event based
```
let mhz19b = new MHZ19B();
mhz19b.on('CO2', (data) => {
    console.log(`${data.co2}`);
});
mhz19b.readCO2();
```

Calibrate sensor baseline - set current level to 400 (do outside)
```
let mhz19b = new MHZ19B();
mhz19b.calibrate();
```

Enable / Disable ABC mode (auto-recalibration to 400 ppm every 24 hours)
```
let mhz19b = new MHZ19B();
mhz19b.abcOn();
mhz19b.abcOff();
```