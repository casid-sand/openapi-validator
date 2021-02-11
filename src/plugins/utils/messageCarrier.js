'use strict';

const typesArray = ['structural', 'semantic', 'convention', 'documentation'];

module.exports = class MessageCarrier {
  constructor() {
    this._messages = {
      error: [],
      warning: [],
      info: [],
      hint: []
    };
  }

  get messages() {
    return this._messages;
  }

  get errors() {
    return this._messages.error;
  }

  get warnings() {
    return this._messages.warning;
  }

  get infos() {
    return this._messages.info;
  }

  get hints() {
    return this._messages.hint;
  }

  // status should be 'off', 'error', 'warning', 'info', or 'hint'
  // rule is the name of the configOption, 'builtin' by default
  addMessage(path, message, status, rule = 'builtin') {
    if (this._messages[status]) {
      this._messages[status].push({
        path: path,
        message: message,
        rule: rule
      });
    }
  }

  // status should be 'off', 'error', or 'warning'
  addTypedMessage(path, message, status, rule = 'builtin', type=null, customizedRule=null) {
    if (this._messages[status]) {

      if (type !== null && !typesArray.includes(type)) {
        console.log(`ERROR - Type is not allowed : ${type}`);
      }
      this._messages[status].push({
        path: path,
        message: message,
        rule: rule,
        type: type, /*structural, semantic, convention, documentation*/
        customizedRule: customizedRule
      });
    }
  }

  // status should be 'off', 'error', 'warning'
  // rule is the name of the configOption, 'builtin' by default
  addMessageWithAuthId(path, message, authId, status, rule = 'builtin') {
    if (this._messages[status]) {
      this._messages[status].push({
        path: path,
        message: message,
        authId: authId, 
        rule: rule
      });
    }
  }

  displayMessage(status, number) {
    if (this._messages[status]) {
      if (this._messages[status][number]) {
        console.log(`Message ${status} - Item ${number} - Path ${this._messages[status][number].path} - ${this._messages[status][number].message}`);
      } else {
        console.log(`WARN - Messages ${status} ${number} empty.`);
      }
    } else {
      console.log(`WARN - Messages ${status} empty.`);
    }
  }

  displayWarning(number) {
    this.displayMessage("warning", number);
  }

  displayError(number) {
    this.displayMessage("error", number);
  }
};
