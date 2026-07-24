'use strict';

const Homey = require('homey');

class GoodWeXSApp extends Homey.App {

  async onInit() {
    this.log(`${this.manifest.name.en} v${this.manifest.version} initialized`);
  }

}

module.exports = GoodWeXSApp;
