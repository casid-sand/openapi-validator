// Assertation 1:
// check if global consumes or produces field is not in JSON

const { isArray } = require('lodash');
const MessageCarrier = require('../../../utils/messageCarrier');

const MimeTypeJsonArray = [
    'application/json',  
    'application/hal+json',
    'application/problem+json'
]

module.exports.validate = function({ jsSpec }, config) {

    const messages = new MessageCarrier();

    if (config.operations && config.operations.content_not_in_json) {
        const checkJSon = config.operations.content_not_in_json;
        if (checkJSon != 'off') {
            
            const globalProducesList = jsSpec.produces;
            const globalConsumesList = jsSpec.consumes;
            this.validateContentTypeList(globalProducesList, checkJSon, 'Global produces', 'produces', messages);
            this.validateContentTypeList(globalConsumesList, checkJSon, 'Global consumes', 'consumes', messages);
        }
    }

    return messages;
};

module.exports.validateContentTypeList = function (contentTypeList, checkTypeLevel, consumeOrProduceName, pathToObject, messages) {
    if (contentTypeList !== undefined) {
        if (!isArray(contentTypeList)) {
            messages.addTypedMessage(
                `${pathToObject}`,
                `${consumeOrProduceName} Content-Types must be an array.`,
                checkTypeLevel,
                'convention',
                'CTMO.STANDARD-CODAGE-15'
            );
        } else {
    
            for (let i = 0, len = contentTypeList.length; i < len; i++) {
                let typeItem = contentTypeList[i];
                if (typeof typeItem === 'string') {
                
                    const isJson = MimeTypeJsonArray.includes(typeItem);
            
                    if (!isJson) {
                        if (typeItem.includes('json')) {
                            messages.addTypedMessage(
                                `${pathToObject}.${i}`,
                                `JSON ${consumeOrProduceName} Content-type must be 'application/json' or 'application/hal+json' or 'application/problem+json', without charset.`,
                                `warning`,
                                'convention',
                                'CTMO.STANDARD-CODAGE-15'
                            );
                        } else {
                            messages.addTypedMessage(
                                `${pathToObject}.${i}`,
                                `${consumeOrProduceName} Content-Type must be JSON ('application/json' or 'application/hal+json' or 'application/problem+json').`,
                                checkTypeLevel,
                                'convention',
                                'CTMO.STANDARD-CODAGE-15'
                            );
                        }
                    }
                } else {
                    messages.addTypedMessage(
                        `${pathToObject}.${i}`,
                        `${consumeOrProduceName} Content-Type must be a string.`,
                        checkTypeLevel,
                        'convention',
                        'CTMO.STANDARD-CODAGE-15'
                    );
                }
            }
        }
    }
  }
