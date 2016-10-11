'use strict';

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

    this.contacts = [];

    for (let name of Object.keys(this.pins)) {
      let pin = this.pins[name];

      const contact = new Service.ContactSensor(name);
      contact
        .getCharacteristic(Characteristic.ContactSensorState)
        .setValue(true);

      this.contacts.push(contact);
    }

    this.humidityService = new Service.HumiditySensor(this.name_humidity);
    this.humidityService
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .on('get', this.getCurrentRelativeHumidity.bind(this));
  }

  getServices() {
    return [this.contacts];
  }
}

