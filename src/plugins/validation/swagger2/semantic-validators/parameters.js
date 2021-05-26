// Assertation 1:
// The items property for a parameter is required when its type is set to array

// Assertation 2:
// The type (or schema) property is valid for non body (or body) parameters

const isPlainObject = require('lodash/isPlainObject');
const { isParameterObject, walk } = require('../../../utils');
const MessageCarrier = require('../../../utils/messageCarrier');

module.exports.validate = function({ resolvedSpec }, config) {
  const messages = new MessageCarrier();

  walk(resolvedSpec, [], (obj, path) => {
    const isContentsOfParameterObject = isParameterObject(path, false); // 2nd arg is isOAS3

    // 1
    if (isContentsOfParameterObject) {
      if (obj.type === 'array' && !isPlainObject(obj.items)) {
        messages.addTypedMessage(
          path,
          "Parameters with 'array' type require an 'items' property.",
          'error',
          'parameter_definition',
          'structural'
        );
      }

      if (config && config.parameters) {
        const check_param_definition = config.parameters.parameter_definition;
          if (check_param_definition != 'off' && check_param_definition != 'undefined') {
          if (obj.in && obj.in === 'body') {
            if (obj.type) {
              messages.addTypedMessage(
                path,
                "Parameters in 'body' should NOT have additional properties : type.",
                check_param_definition,
                'parameter_definition',
                'structural'
              );
            }
            if (!obj.schema) {
              messages.addMessage(
                path,
                "Parameters in 'body' have required property 'schema'.",
                check_param_definition,
                'parameter_definition',
                'structural'
              );
            }
          } else {
            if (obj.schema) {
              messages.addMessage(
                path,
                "Parameters not in 'body' should NOT have additional properties : schema.",
                check_param_definition,
                'parameter_definition',
                'structural'
              );
            }
            if (!obj.type) {
              messages.addMessage(
                path,
                "Parameters not in 'body' have required property 'type'.",
                check_param_definition,
                'parameter_definition',
                'structural'
              );
            }
          }
        }
      }
    }
  });

  return messages;
};
