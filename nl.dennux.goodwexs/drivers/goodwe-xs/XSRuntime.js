'use strict';

const ModbusClient = require('../../lib/ModbusClient');
const CONSTANTS = require('../../lib/Constants');

const DEVICE = require('./GW_XS_WL20');
const XSParser = require('./XSParser');
const XSDataUpdater = require('./XSDataUpdater');

class XSRuntime {

  /**
       * Runtime controller for the GoodWe XS device.
       *
       * Responsible for:
       * - Modbus communication
       * - polling
       * - retrieving inverter data
       * - coordinating parser and updater
       *
       * Does not directly update Homey capabilities.
       */
  constructor(device, logger) {

    this.device = device;
    this.logger = logger;

    this.dataUpdater = new XSDataUpdater(
      device,
      logger,
    );

    this.connection = null;

    this.pollTimer = null;
    this.pollInterval = null;

    this.failedPolls = 0;

    this.settings = this.device.getSettings();

  }

  async start() {

    this.logger.info(
      'XS runtime started',
    );

    this.settings = this.device.getSettings();

    this.connection = new ModbusClient(
      this.settings.ip,
      Number(this.settings.port),
      Number(this.settings.unitId),
      Number(this.settings.timeout ?? 5000),
    );

    this.pollInterval = Number(
      this.settings.pollInterval ?? 10,
    ) * 1000;

    await this.updateIdentification();

    await this.startPolling();

  }

  async stop() {

    this.logger.info(
      'XS runtime stopped',
    );

    if (this.pollTimer) {

      this.device.homey.clearInterval(
        this.pollTimer,
      );

      this.pollTimer = null;

    }

    if (this.connection) {

      await this.connection.disconnect()
        .catch((error) => {

          this.logger.error(
            'Failed disconnecting Modbus:',
            error,
          );

        });

    }

  }

  async settingsChanged(
    newSettings,
    changedKeys,
  ) {

    this.settings = newSettings;

    this.logger.debug(
      'Runtime settings changed:',
      changedKeys,
    );

    const connectionSettings = [
      'ip',
      'port',
      'unitId',
      'timeout',
    ];

    const connectionChanged = changedKeys.some(
      (key) => connectionSettings.includes(key),
    );

    if (connectionChanged) {

      this.logger.info(
        'Connection settings changed, recreating Modbus connection',
      );

      await this.recreateConnection();

    }

    if (changedKeys.includes('pollInterval')) {

      this.pollInterval = Number(
        this.settings.pollInterval ?? 10,
      ) * 1000;

      await this.restartPolling();

    }

  }

  async recreateConnection() {

    if (this.connection) {

      await this.connection.disconnect();

    }

    this.connection = new ModbusClient(
      this.settings.ip,
      Number(this.settings.port),
      Number(this.settings.unitId),
      Number(this.settings.timeout ?? 5000),
    );

  }

  async restartPolling() {

    this.logger.debug(
      'Restart polling with interval:',
      this.pollInterval,
    );

    if (this.pollTimer) {

      this.device.homey.clearInterval(
        this.pollTimer,
      );

      this.pollTimer = null;

    }

    this.pollTimer = this.device.homey.setInterval(
      () => this.poll(),
      this.pollInterval,
    );

  }

  /**
    * Executes one polling cycle.
    *
    * Updates live inverter data and periodically checks
    * identification information.
    */
  async poll() {

    await this.updateLiveData();

    await this.checkIdentification();

  }

  async updateIdentification() {

    try {

      this.logger.debug(
        'Reading identification data',
      );

      await this.connection.connect();

      const registers = await this.connection.readHoldingRegisters(
        CONSTANTS.MODBUS.IDENTIFICATION.START,
        CONSTANTS.MODBUS.IDENTIFICATION.COUNT,
      );

      await this.connection.disconnect();

      const identification = XSParser.parseIdentification(registers);

      const now = new Date();

      const lastUpdated = now.toLocaleString(
        this.device.homey.i18n.getLanguage(),
        {
          timeZone: this.device.homey.clock.getTimezone(),
          dateStyle: 'short',
          timeStyle: 'short',
        },
      );

      await this.device.setSettings({

        model:
                    identification.model,

        serialNumber:
                    identification.serialNumber,

        firmware:
                    identification.firmware.version,

        lastUpdated,

      });

      this.logger.debug(
        'New lastUpdated value:',
        lastUpdated,
      );

      await this.device.setStoreValue(
        'identification',
        {
          serialNumber:
                        identification.serialNumber,

          firmware:
                        identification.firmware.version,
        },
      );

      await this.device.setStoreValue(
        'lastIdentificationCheck',
        now.toISOString(),
      );

      this.logger.debug(
        'Identification updated:',
        identification,
      );

    } catch (error) {

      await this.connection.disconnect()
        .catch((disconnectError) => {

          this.logger.error(
            'Identification disconnect failed:',
            disconnectError,
          );

        });

      this.logger.error(
        'Failed reading identification:',
        error,
      );

    }

  }

  async checkIdentification() {

    this.logger.debug(
      'Checking identification age',
    );

    const lastCheck = await this.device.getStoreValue(
      'lastIdentificationCheck',
    );

    if (!lastCheck) {

      this.logger.debug(
        'No previous identification check found',
      );

      await this.updateIdentification();

      return;

    }

    const age = Date.now() - new Date(lastCheck).getTime();

    const hours = Math.round(
      age / (1000 * 60 * 60),
    );

    this.logger.debug(
      `Last identification check was ${hours} hours ago`,
    );

    if (age >= 24 * 60 * 60 * 1000) {

      this.logger.debug(
        'Identification check required',
      );

      await this.updateIdentification();

    } else {

      this.logger.debug(
        'Identification check skipped',
      );

    }

  }

  async readLiveData() {

    let registers = null;

    try {

      this.logger.debug(
        'Reading live data',
      );

      await this.connection.connect();

      registers = await this.connection.readHoldingRegisters(
        DEVICE.LIVE_DATA.START,
        DEVICE.LIVE_DATA.COUNT,
      );

      await this.connection.disconnect();

      this.logger.debug(
        'Live data registers received:',
        registers.length,
      );

      this.logger.debug(
        'First registers:',
        registers.slice(0, 10),
      );

      return registers;

    } catch (error) {

      await this.connection.disconnect()
        .catch((disconnectError) => {

          this.logger.error(
            'Disconnect failed:',
            disconnectError,
          );

        });

      this.logger.error(
        'Failed reading live data:',
        error,
      );

      return null;

    }

  }

  async updateLiveData() {

    const registers = await this.readLiveData();

    if (!registers) {

      this.failedPolls++;

      this.logger.debug(
        `Failed polls: ${this.failedPolls}`,
      );

      if (
        this.failedPolls
                >= CONSTANTS.CONNECTION.MAX_FAILED_POLLS
      ) {

        await this.dataUpdater.updateConnectionStatus(
          false,
        );

      }

      return;

    }

    // Connection restored

    if (this.failedPolls > 0) {

      this.logger.info(
        'GoodWe connection restored',
      );

    }

    this.failedPolls = 0;

    await this.dataUpdater.updateConnectionStatus(
      true,
    );

    const data = XSParser.parseLiveData(registers);

    this.logger.debug(
      'Parsed live data:',
      data,
    );

    await this.updateHistory(data);

    await this.dataUpdater.update(data);

  }

  async updateHistory(data) {

    const now = new Date();

    const today = `${now.getFullYear()}-`
            + `${String(now.getMonth() + 1).padStart(2, '0')}-`
            + `${String(now.getDate()).padStart(2, '0')}`;

    const { dailyYield } = data;

    if (typeof dailyYield !== 'number') {

      return;

    }

    const history = await this.device.getStoreValue(
      'dailyYieldHistory',
    ) || {};

    if (history[today] === dailyYield) {

      return;

    }

    history[today] = dailyYield;

    await this.device.setStoreValue(
      'dailyYieldHistory',
      history,
    );

  }

  /**
   * Start the inverter polling cycle.
   *
   * Performs an initial data update before starting
   * the periodic polling timer.
   */
  async startPolling() {

    await this.updateLiveData();

    this.pollTimer = this.device.homey.setInterval(
      () => this.poll(),
      this.pollInterval,
    );

  }

}

module.exports = XSRuntime;
