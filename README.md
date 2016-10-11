# homebridge-contactsensor

## Installation
1.	Install Homebridge using `npm install -g homebridge`
2.	Install this plugin `npm install -g homebridge-contactsensor`
3.	Update your configuration file - see below for an example

Connect the BME280 chip to the I2C bus

## Configuration
* `accessory`: "ContactSensor"
* `name`: descriptive name
* `pins`: object of names to GPIO physical pins

Example configuration:

```json
    "accessories": [
        {
            "accessory": "ContactSensor",
            "name": "Contact Sensors",
            "pins": {
		"Switch A": 24,
		"Switch B": 26,
		"Switch C": 22
	    }
        }
    ]
```

Creates a ContactSensor service for each pin.

## See also

* homebridge-gpio etc

## License

MIT

