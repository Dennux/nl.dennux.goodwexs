'use strict';

const Homey = require('homey');

class GoodWeXSDevice extends Homey.Device {

  async onInit() {
    this.log(`GoodWe 2500-XS "${this.getName()}" initialized`);
  }

}

module.exports = GoodWeXSDevice;