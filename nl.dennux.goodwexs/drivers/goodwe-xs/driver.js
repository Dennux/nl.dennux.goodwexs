'use strict';

const Homey = require('homey');
const CONSTANTS = require('../../lib/Constants');
const GoodWeConnection = require('../../lib/GoodWeConnection');
const GoodWeParser = require('../../lib/GoodWeParser');


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


    async readIdentification(data) {

        const connection = new GoodWeConnection(
            data.ip,
            Number(data.port),
            Number(data.unitId)
        );

        try {

            await connection.connect();

            const registers = await connection.readIdentification();

            const identification =
                GoodWeParser.parseIdentification(registers);

            this.log('Identification:', identification);

            return identification;

        } finally {

            await connection.disconnect();

        }

    }


    async onPair(session) {

        this.log('Pair session started');

        session.setHandler(
            CONSTANTS.PAIR_EVENTS.TEST_CONNECTION,
            async (data) => {

                validateConnectionSettings(data);

                const identification =
                    await this.readIdentification(data);

                this.log(
                    'Pair identification:',
                    identification
                );


                session.setHandler(
                    'list_devices',
                    async () => {

                        this.log('LIST DEVICES HANDLER CALLED');

                        return [
                            {
                                name: `${identification.model} (${identification.serialNumber})`,

                                data: {
                                    id: identification.serialNumber
                                },

                                settings: {
                                    serialNumber: identification.serialNumber,
                                    model: identification.model,
                                    firmwareVersion: identification.firmware.version,
                                    ip: data.ip,
                                    port: Number(data.port),
                                    unitId: Number(data.unitId)
                                }
                            }
                        ];

                    }
                );


                return true;

            }
        );

    }

    async onPairListDevices() {

        this.error('========== onPairListDevices CALLED ==========');

        return [
            {
                name: 'TEST GoodWe',

                data: {
                    id: 'test-goodwe'
                }
            }
        ];

        /*   this.log(
               'Creating device from identification:',
               this.identification
           );
   
           return [
               {
                   name: `${this.identification.model} (${this.identification.serialNumber})`,
   
                   data: {
                       id: this.identification.serialNumber
                   },
   
                   settings: {
   
                       serialNumber:
                           this.identification.serialNumber,
   
                       model:
                           this.identification.model,
   
                       firmwareVersion:
                           this.identification.firmware.version
   
                   }
               }
           ];*/

    }




}

module.exports = GoodWeXSDriver;