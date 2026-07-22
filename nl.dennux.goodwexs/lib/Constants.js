'use strict';
const IPV4_REGEX =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

module.exports = {

    IPV4_REGEX,
    
    DEFAULTS: {
        PORT: 502,
        UNIT_ID: 247
    },

    PAIR_EVENTS: {
        TEST_CONNECTION: 'testConnection'
    },

    MODBUS: {
        DEFAULT_TIMEOUT: 5000
    }

};