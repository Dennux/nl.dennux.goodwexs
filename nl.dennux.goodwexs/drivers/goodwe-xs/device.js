'use strict';

const Homey = require('homey');

const ModbusClient = require('../../lib/ModbusClient');
const DEVICE = require('./GW2500XS_WL20');
const GoodWeParser = require('./GoodWeParser');
const CONSTANTS = require('../../lib/Constants');


class GoodWeXSDevice extends Homey.Device {


  async onInit() {

    this.log(
      `GoodWe 2500-XS "${this.getName()}" initialized`
    );
    this.failedPolls = 0;

    this.settings = this.getSettings();


    if (this.settings.debug) {

      this.log(
        '[DEBUG] Device settings:',
        this.settings
      );

    }


    this.connection = new ModbusClient(
      this.settings.ip,
      Number(this.settings.port),
      Number(this.settings.unitId),
      Number(this.settings.timeout ?? 5000)
    );


    this.pollInterval =
      Number(this.settings.pollInterval ?? 10) * 1000;

    await this.updateIdentification();

    await this.startPolling();

  }
  async updateIdentification() {

    try {

      if (this.settings.debug) {

        this.log(
          '[DEBUG] Reading identification data'
        );

      }

      await this.connection.connect();

      const registers =
        await this.connection.readHoldingRegisters(
          CONSTANTS.MODBUS.IDENTIFICATION.START,
          CONSTANTS.MODBUS.IDENTIFICATION.COUNT
        );

      await this.connection.disconnect();

      const identification =
        GoodWeParser.parseIdentification(registers);


      const now = new Date();

      const lastUpdated =
        now.toLocaleString(
          this.homey.i18n.getLanguage(),
          {
            dateStyle: 'short',
            timeStyle: 'short'
          }
        );


      await this.setSettings({

        model:
          identification.model,

        serialNumber:
          identification.serialNumber,

        firmware:
          identification.firmware.version,

        lastUpdated

      });


      await this.setStoreValue(
        'identification',
        {
          serialNumber:
            identification.serialNumber,

          firmware:
            identification.firmware.version
        }
      );


      await this.setStoreValue(
        'lastIdentificationCheck',
        now.toISOString()
      );


      if (this.settings.debug) {

        this.log(
          '[DEBUG] Identification updated:',
          identification
        );

      }


    } catch (error) {


      await this.connection.disconnect()
        .catch(disconnectError => {

          this.error(
            'Identification disconnect failed:',
            disconnectError
          );

        });


      this.error(
        'Failed reading identification:',
        error
      );

    }

  }

 async checkIdentification() {

    if (this.settings.debug) {

        this.log(
            '[DEBUG] Checking identification age'
        );

    }


    const lastCheck =
        await this.getStoreValue(
            'lastIdentificationCheck'
        );


    if (!lastCheck) {

        if (this.settings.debug) {

            this.log(
                '[DEBUG] No previous identification check found'
            );

        }

        await this.updateIdentification();

        return;
    }


    const age =
        Date.now() - new Date(lastCheck).getTime();


    const hours =
        Math.round(
            age / (1000 * 60 * 60)
        );


    if (this.settings.debug) {

        this.log(
            `[DEBUG] Last identification check was ${hours} hours ago`
        );

    }


    if (age >= 24 * 60 * 60 * 1000) {

        if (this.settings.debug) {

            this.log(
                '[DEBUG] Identification check required'
            );

        }

        await this.updateIdentification();

    } else {

        if (this.settings.debug) {

            this.log(
                '[DEBUG] Identification check skipped'
            );

        }

    }

}


  async poll() {

    await this.updateLiveData();

    await this.checkIdentification();

  }

  async startPolling() {

    await this.updateLiveData();


    this.pollTimer = this.homey.setInterval(
      () => this.poll(),
      this.pollInterval
    );

  }

  async updateHistory(data) {

    const now = new Date();
    const today =
      `${now.getFullYear()}-` +
      `${String(now.getMonth() + 1).padStart(2, '0')}-` +
      `${String(now.getDate()).padStart(2, '0')}`;


    const dailyYield = data.dailyYield;

    if (typeof dailyYield !== 'number') {
      return;
    }


    let history =
      this.getStoreValue('dailyYieldHistory') || {};


    if (history[today] === dailyYield) {
      return;
    }


    history[today] = dailyYield;


    await this.setStoreValue(
      'dailyYieldHistory',
      history
    );

  }



  async updateLiveData() {

    const registers =
      await this.readLiveData();


    if (!registers) {

      this.failedPolls++;


      if (this.settings.debug) {

        this.log(
          `[DEBUG] Failed polls: ${this.failedPolls}`
        );

      }


      if (this.failedPolls >= CONSTANTS.CONNECTION.MAX_FAILED_POLLS) {

        await this.setCapabilityValue(
          'connection_status',
          this.homey.__('connection_status.disconnected')
        );


        await this.setCapabilityValue(
          'alarm_generic',
          true
        );

      }


      return;

    }


    // Connection restored

    if (this.failedPolls > 0) {

      this.log(
        'GoodWe connection restored'
      );

    }


    this.failedPolls = 0;


    await this.setCapabilityValue(
      'connection_status',
      this.homey.__('connection_status.connected')
    );
    await this.setCapabilityValue(
      'alarm_generic',
      false
    );


    const data =
      GoodWeParser.parseLiveData(registers);


    if (this.settings.debug) {

      this.log(
        '[DEBUG] Parsed live data:',
        data
      );

    }

    await this.updateHistory(data);

    await this.updateCapabilities(data);

  }


  async readLiveData() {

    let registers = null;

    try {

      if (this.settings.debug) {
        this.log('[DEBUG] Reading live data');
      }


      await this.connection.connect();


      registers =
        await this.connection.readHoldingRegisters(
          DEVICE.LIVE_DATA.START,
          DEVICE.LIVE_DATA.COUNT
        );


      await this.connection.disconnect();


      if (this.settings.debug) {

        this.log(
          '[DEBUG] Live data registers received:',
          registers.length
        );

        this.log(
          '[DEBUG] First registers:',
          registers.slice(0, 10)
        );

      }


      return registers;


    } catch (error) {


      await this.connection.disconnect()
        .catch(disconnectError => {

          this.error(
            '[DEBUG] Disconnect failed:',
            disconnectError
          );

        });


      this.error(
        'Failed reading live data:',
        error
      );


      return null;

    }

  }


  async onDeleted() {

    if (this.pollTimer) {

      this.homey.clearInterval(
        this.pollTimer
      );

    }


    if (this.connection) {

      await this.connection.disconnect()
        .catch(error => this.error(error));

    }

  }

  async updateCapabilities(data) {

    await this.setCapabilityValue(
      'measure_power',
      data.power
    );


    await this.setCapabilityValue(
      'measure_power.total_input',
      data.dcInputPower
    );


    await this.setCapabilityValue(
      'measure_power.apparent',
      data.apparentPower
    );


    await this.setCapabilityValue(
      'meter_power',
      data.totalYield
    );


    await this.setCapabilityValue(
      'meter_power.daily',
      data.dailyYield
    );


    await this.setCapabilityValue(
      'measure_voltage',
      data.mpptVoltage
    );


    await this.setCapabilityValue(
      'measure_voltage.grid',
      data.gridVoltage
    );


    await this.setCapabilityValue(
      'measure_current',
      data.mpptCurrent
    );


    await this.setCapabilityValue(
      'measure_current.grid',
      data.gridCurrent
    );


    await this.setCapabilityValue(
      'measure_current.leakage',
      data.leakageCurrent
    );


    await this.setCapabilityValue(
      'measure_temperature',
      data.temperature
    );


    await this.setCapabilityValue(
      'inverter_timestamp',
      data.inverterTimestamp
    );


    await this.setCapabilityValue(
      'inverter_efficiency',
      data.efficiency
    );


    await this.setCapabilityValue(
      'inverter_grid_frequency',
      data.gridFrequency
    );


    await this.setCapabilityValue(
      'inverter_power_factor',
      data.powerFactor
    );


    await this.setCapabilityValue(
      'inverter_fault_code',
      data.faultCode
    );


    await this.setCapabilityValue(
      'inverter_operating_hours',
      data.operatingHours
    );


    await this.setCapabilityValue(
      'inverter_rssi',
      data.rssi
    );
    const inverterFault =
      data.workModeCode === 2 ||
      data.faultCode !== '0x00000000';

    const workMode =
      this.homey.__(
        `work_mode.${data.workModeCode}`
      );


    await this.setCapabilityValue(
      'inverter_work_mode',
      workMode
    );


    await this.setCapabilityValue(
      'alarm_generic',
      inverterFault
    );



  }

}


module.exports = GoodWeXSDevice;