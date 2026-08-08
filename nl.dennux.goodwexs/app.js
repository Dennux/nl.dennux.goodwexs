'use strict';

const Homey = require('homey');

class GoodWeXSApp extends Homey.App {

  async onInit() {
    this.log(`${this.manifest.name.en} v${this.manifest.version} initialized`);

    this.homey.flow
      .getConditionCard('inverter_has_fault')
      .registerRunListener(async (args) => args.device.getInverterFaultStatus());

    this.homey.flow
      .getDeviceTriggerCard('work_mode_changed_to')
      .registerRunListener(async (args, state) => String(state.work_mode_code) === args.work_mode);
  }

}

module.exports = GoodWeXSApp;
