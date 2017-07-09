'use strict';

const path = require('path');
const child_process = require('child_process');

let Service, Characteristic;

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory('homebridge-contactsensor', 'ContactSensor', ContactSensorPlugin);
};

class ContactSensorPlugin
{
  constructor(log, config) {
    this.log = log;
    this.name = config.name;
    // One possible setup:
    // ground = 20, normally-closed switches tie to ground, open (then pulled up) when pressed
    // wired 22,24,26 physical, but not in order - reordered here
    //  24 # BCM 8 / CE0 - the closest to ground (on the physical switch!)
    //  26 # BCM 7 / CE1
    //  22 # BCM 25
    this.pins = config.pins || {
      "Switch A": 24,
      "Switch B": 26,
      "Switch C": 22
    };

    this.pin2contact = {};
    this.contacts = [];
    const helperPath = path.join(__dirname, 'watchpins.py');
    const args = ['-u', helperPath];

    for (let name of Object.keys(this.pins)) {
      const pin = this.pins[name];

      const subtype = name; 
      const contact = new Service.ContactSensor(name, subtype);
      contact
        .getCharacteristic(Characteristic.ContactSensorState)
        .setValue(false);

      this.pin2contact[pin] = contact;
      this.contacts.push(contact);
      args.push(''+pin);
    }
    console.log('contact sensors', this.pin2contact);
    this.helper = child_process.spawn('python', args);

    this.helper.stderr.on('data', (err) => {
      throw new Error(`watchpins helper error: ${err})`);
    }); 

    this.helper.stdout.on('data', (data) => {
      console.log(`data = |${data}|`);
      const lines = data.toString().trim().split('\n');
      for (let line of lines) {
        let [pin, state] = line.trim().split(' ');
        pin = parseInt(pin, 10);
        state = !!parseInt(state, 10);
        console.log(`pin ${pin} changed state to ${state}`);
  
        const contact = this.pin2contact[pin];
        if (!contact) throw new Error(`received pin event for unconfigured pin: ${pin}`);
        contact
          .getCharacteristic(Characteristic.ContactSensorState)
          .setValue(state);
      }
    });
  }

  getServices() {
    return this.contacts;
  }
}
