'use strict';

module.exports = class MessageCarrier {
  constructor() {
    this._messages = {
      error: [],
      warning: []
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

  // status should be 'off', 'error', or 'warning'
  addMessage(path, message, status) {
    if (this._messages[status]) {
      this._messages[status].push({
        path: path,
        message: message
      });
    }
  }

  // status should be 'off', 'error', or 'warning'
  addTypedMessage(path, message, status, type=null, rule=null) {
    if (this._messages[status]) {
      this._messages[status].push({
        path: path,
        message: message,
        type: type, /*structural, semantic, convention, documentation*/
        rule: rule
      });
    }
  }

  addMessageWithAuthId(path, message, authId, status) {
    if (this._messages[status]) {
      this._messages[status].push({
        path: path,
        message: message,
        authId: authId
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

  displayErro(number) {
    this.displayMessage("error", number);
  }
};
