'use strict';

const Homey = require('homey');
const CONSTANTS = require('../../lib/Constants');



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

    async onPair(session) {

        this.log('Pair session started');

        session.setHandler('testConnection', async (data) => {

             validateConnectionSettings(data);
             
            this.log('Connection settings received:', data);

            return true;

        });

    }

    async onPairListDevices() {
        return [
            {
                name: 'GoodWe 2500-XS',
                data: {
                    id: 'goodwe-xs'
                }
            }
        ];
    }

    
    

}

module.exports = GoodWeXSDriver;