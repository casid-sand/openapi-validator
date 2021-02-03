// Assertation 1:
// check if global consumes or produces field is not in JSON

const { isArray } = require('lodash');
const MessageCarrier = require('../../../utils/messageCarrier');
const contentTypesChecker = require('../../../utils/contentTypesChecker');

const jsonContentTypes = ['application/json','application/hal+json', 'application/problem+json'];
const recommendedContentTypes = jsonContentTypes;
const allowedContentTypes = ['text/xml','application/yaml', 'text/csv', 'text/plain', 'application/pdf'];

module.exports.validate = function({ jsSpec }, config) {

    const messages = new MessageCarrier();

    if (config.operations && config.operations.wrong_content_type) {
        const checkJSon = config.operations.wrong_content_type;
        if (checkJSon != 'off') {
            
            const globalProducesList = jsSpec.produces;
            const globalConsumesList = jsSpec.consumes;
            contentTypesChecker.validateContentTypeList(globalProducesList, checkJSon, 'Global produces', 'produces', messages);
            contentTypesChecker.validateContentTypeList(globalConsumesList, checkJSon, 'Global consumes', 'consumes', messages);
        }
    }

    return messages;
};
