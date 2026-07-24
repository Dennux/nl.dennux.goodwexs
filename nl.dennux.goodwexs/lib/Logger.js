'use strict';

/**
 * Simple logging wrapper for Homey apps.
 *
 * Homey provides log() and error(), but does not provide a built-in
 * debug logger with enable/disable functionality.
 *
 * This wrapper adds debug logging controlled by the device settings,
 * while keeping the original Homey logging behaviour.
 *
 * A single Logger instance should be created by the device and passed
 * to child components (runtime, updater, etc.) so all components share
 * the same debug state.
 */

class Logger {

  /**
   * @param {object} device Homey device instance providing log() and error()
   * @param {boolean} debugEnabled Enable debug logging
   */
  constructor(device, debugEnabled = false) {

    this.device = device;
    this.debugEnabled = debugEnabled;

  }

  /**
   * Update debug logging state.
   * Called when the device debug setting changes.
   *
   * @param {boolean} enabled
   */
  setDebug(enabled) {

    this.debugEnabled = enabled;

  }

  /**
   * Normal information logging.
   * Always forwarded to Homey log().
   *
   * @param  {...any} args
   */
  info(...args) {

    this.device.log(...args);

  }

  /**
   * Debug logging.
   * Only forwarded when debug logging is enabled.
   *
   * @param  {...any} args
   */
  debug(...args) {

    if (this.debugEnabled) {

      this.device.log(
        '[DEBUG]',
        ...args,
      );

    }

  }

  /**
   * Error logging.
   * Always forwarded to Homey error().
   *
   * @param  {...any} args
   */
  error(...args) {

    this.device.error(...args);

  }

}

module.exports = Logger;
