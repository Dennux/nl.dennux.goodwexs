'use strict';

const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

module.exports = {

  IPV4_REGEX,

  CONNECTION: {
    MAX_FAILED_POLLS: 3,
  },

  PAIR_EVENTS: {
    TEST_CONNECTION: 'testConnection',
    LIST_DEVICES: 'list_devices',
  },

};
