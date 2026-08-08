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

    // Tracks the previous fault state so fault_detected/fault_resolved
    // fire exactly once per transition, not on every poll. `null` means
    // "not known yet" (right after a (re)start) - the first poll only
    // records the state, it never fires a trigger.
    this._previousFault = null;

    // Current real inverter fault status, kept separate from the shared
    // `alarm_generic` capability (which also reflects connection loss).
    // Used by the `inverter_has_fault` condition card. `null` means "not
    // known yet" (before the first poll completes) - getInverterFaultStatus()
    // treats that the same as "no fault" for the condition card, but the
    // distinction stays visible here in the raw state.
    this._inverterHasFault = null;

    // Tracks the previous work mode *code* (not the translated label - the
    // raw code is more reliable to compare and locale-independent) so the
    // work_mode_changed(_to) triggers fire exactly once per transition.
    // `null` means "not known yet".
    this._previousWorkModeCode = null;

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

  /**
   * Called by XSDataUpdater every poll with the *actual* inverter fault
   * state (work mode 2 or a non-zero fault code) - deliberately NOT the
   * shared `alarm_generic` capability, since that also reflects connection
   * loss and would otherwise fire this on a simple WiFi hiccup.
   *
   * Fires `fault_detected` / `fault_resolved` exactly once per transition,
   * and remembers the current state so the `inverter_has_fault` condition
   * card can read it directly - also decoupled from `alarm_generic`.
   */
  async handleFaultTransition(isFaulted) {

    // Always kept current, independent of the edge-detection below, so
    // the condition card reflects real inverter fault status even before
    // the first transition has occurred.
    this._inverterHasFault = isFaulted;

    if (this._previousFault === null || this._previousFault === undefined) {

      // First read after (re)starting - just remember the state, don't fire.
      this._previousFault = isFaulted;
      return;

    }

    if (isFaulted && !this._previousFault) {

      this.logger.info('Inverter fault detected');

      await this.homey.flow
        .getDeviceTriggerCard('fault_detected')
        .trigger(this, {}, {})
        .catch((error) => this.logger.error('Failed to trigger fault_detected:', error));

    } else if (!isFaulted && this._previousFault) {

      this.logger.info('Inverter fault resolved');

      await this.homey.flow
        .getDeviceTriggerCard('fault_resolved')
        .trigger(this, {}, {})
        .catch((error) => this.logger.error('Failed to trigger fault_resolved:', error));

    }

    this._previousFault = isFaulted;

  }

  /**
   * Real inverter fault status (work mode 2 or a non-zero fault code) -
   * used by the `inverter_has_fault` condition card. Deliberately separate
   * from `alarm_generic`, which also reflects connection loss.
   * Returns `false` if no poll has completed yet.
   */
  getInverterFaultStatus() {

    return this._inverterHasFault === true;

  }

  /**
   * Called by XSDataUpdater every poll with the raw work mode code
   * (0=waiting, 1=normal, 2=fault).
   *
   * IMPORTANT: these codes (0/1/2) are specific to this GoodWe XS/DT/MS
   * register map, empirically confirmed on a GW2500-XS-30. Other GoodWe
   * models/firmwares may use different codes or have more than three
   * states - do not assume this mapping holds across the whole GoodWe
   * lineup without re-verifying via QModMaster first.
   *
   * Fires two triggers, both edge-detected (once per transition, not every
   * poll):
   *   - `work_mode_changed`: fires on ANY transition, with the new mode's
   *     translated label as a token.
   *   - `work_mode_changed_to`: fires only when the new mode matches the
   *     mode selected in that specific flow card's dropdown argument - the
   *     run listener in app.js does the actual filtering, this just fires
   *     the card with the new code as a token for it to compare against.
   */
  async handleWorkModeTransition(workModeCode) {

    if (this._previousWorkModeCode === null || this._previousWorkModeCode === undefined) {

      // First read after (re)starting - just remember the state, don't fire.
      this._previousWorkModeCode = workModeCode;
      return;

    }

    if (workModeCode !== this._previousWorkModeCode) {

      const modeLabel = this.homey.__(`work_mode.${workModeCode}`);

      this.logger.info(
        `Work mode changed: ${this._previousWorkModeCode} -> ${workModeCode} (${modeLabel})`,
      );

      await this.homey.flow
        .getDeviceTriggerCard('work_mode_changed')
        .trigger(this, { work_mode: modeLabel }, {})
        .catch((error) => this.logger.error('Failed to trigger work_mode_changed:', error));

      await this.homey.flow
        .getDeviceTriggerCard('work_mode_changed_to')
        .trigger(this, { work_mode: modeLabel }, { work_mode_code: workModeCode })
        .catch((error) => this.logger.error('Failed to trigger work_mode_changed_to:', error));

    }

    this._previousWorkModeCode = workModeCode;

  }

  async onUninit() {

    await this.stopRuntime();

  }

  async onDeleted() {

    await this.stopRuntime();

  }

}

module.exports = GoodWeXSDevice;
