'use strict';

const Homey = require('homey');
const CONSTANTS = require('../../lib/Constants');
const ModbusClient = require('../../lib/ModbusClient');
const XSParser = require('./XSParser');

function validateConnectionSettings(data) {

  if (!data.ip?.trim()) {
    throw new Error('IP address is required.');
  }

  if (!CONSTANTS.IPV4_REGEX.test(data.ip)) {
    throw new Error('Invalid IP address.');
  }

  const port = Number(data.port);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Invalid TCP port.');
  }

  const unitId = Number(data.unitId);

  if (!Number.isInteger(unitId) || unitId < 1 || unitId > 247) {
    throw new Error('Invalid Modbus Unit ID.');
  }

}

class GoodWeXSDriver extends Homey.Driver {

  async onInit() {
    this.log('GoodWe 2500-XS driver initialized');

  }

  async getIdentification(data) {

    const connection = new ModbusClient(
      data.ip,
      Number(data.port),
      Number(data.unitId),
    );

    try {

      await connection.connect();

      const registers = await connection.readHoldingRegisters(
        CONSTANTS.MODBUS.IDENTIFICATION.START,
        CONSTANTS.MODBUS.IDENTIFICATION.COUNT,
      );

      const identification = XSParser.parseIdentification(registers);

      this.log('[DEBUG] Identification:', identification);

      return identification;

    } finally {

      await connection.disconnect().catch((error) => this.error(error));

    }

  }

  async onPair(session) {

    this.log('Pair session started');

    session.setHandler(
      CONSTANTS.PAIR_EVENTS.TEST_CONNECTION,
      async (data) => {

        validateConnectionSettings(data);

        const identification = await this.getIdentification(data);

        this.log(
          '[DEBUG] Pair identification:',
          identification,
        );

        session.setHandler(
          CONSTANTS.PAIR_EVENTS.LIST_DEVICES,
          async () => {

            return [
              {
                name: `${identification.model} (${identification.serialNumber})`,

                data: {
                  id: identification.serialNumber,
                },

                settings: {
                  serialNumber: identification.serialNumber,
                  model: identification.model,
                  firmwareVersion: identification.firmware.version,
                  ip: data.ip,
                  port: Number(data.port),
                  unitId: Number(data.unitId),
                },
              },
            ];

          },
        );

        return true;

      },
    );

  }

}

module.exports = GoodWeXSDriver;
