'use strict';

const Homey = require('homey');

class GoodWeXSDriver extends Homey.Driver {

  async onInit() {
    this.log('GoodWe 2500-XS driver initialized');
  }

}

module.exports = GoodWeXSDriver;