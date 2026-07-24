'use strict';

const Homey = require('homey');

const Logger = require('../../lib/Logger');
const XSRuntime = require('./XSRuntime');

class GoodWeXSDevice extends Homey.Device {

  async onInit() {

    this.logger = new Logger(
      this,
      this.getSetting('debug'),
    );

    this.logger.info(
      `GoodWe XS series device "${this.getName()}" initialized`,
    );

    this.runtime = new XSRuntime(
      this,
      this.logger,
    );

    await this.runtime.start();

  }

  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }) {

    if (changedKeys.includes('debug')) {

      this.logger.setDebug(
        newSettings.debug,
      );

    }

    await this.runtime.settingsChanged(
      newSettings,
      changedKeys,
    );

  }

  async stopRuntime() {

    if (this.runtime) {

      await this.runtime.stop();

    }

  }

  async onUninit() {

    await this.stopRuntime();

  }

  async onDeleted() {

    await this.stopRuntime();

  }

}

module.exports = GoodWeXSDevice;
