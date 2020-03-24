# MH-Z19B
Communication with the MH-Z19B IR CO2 sensor for Node.js

## Declare
```let mhz19b = new MHZ19B();```

## Commands
Promise based
```
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
mhz19b.on('CO2', (data) => {
    console.log(`${data.co2}`);
});
mhz19b.readCO2();
```

Calibrate sensor - set current level to 400 (do outside)
```
mhz19b.calibrate();
```

Enable / Disable ABL mode (auto-recalibration to 400 ppm every 24 hours)
```
mhz19b.abcOn();
mhz19b.abcOff();
```