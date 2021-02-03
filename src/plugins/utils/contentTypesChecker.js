// Assertation 1:
// check if global consumes or produces field is not in JSON

const { isArray } = require('lodash');

const jsonContentTypes = ['application/json','application/hal+json', 'application/problem+json'];
const recommendedContentTypes = jsonContentTypes;
const allowedContentTypes = ['text/xml','application/yaml', 'text/csv', 'text/plain', 'application/pdf'];


module.exports.contentTypeIsJson = function (contentType) {
    const contentTypeStr = `${contentType}`;
    if (jsonContentTypes.includes(contentTypeStr) 
        || (contentTypeStr.startsWith('application/') && contentTypeStr.endsWith('+json'))) {
        return true;
    } else {
        return false;
    }
}

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
                this.validateContentType(typeItem, checkTypeLevel, consumeOrProduceName, `${pathToObject}.${i}`, messages);
            }
        }
    }
}

module.exports.validateContentType = function (contentType, checkTypeLevel, consumeOrProduceName, pathToObject, messages) {
    if (typeof contentType === 'string') {
                
        const isJson = recommendedContentTypes.includes(contentType);

        if (!isJson) {
            if (contentType.includes('json')) {
                messages.addTypedMessage(
                    `${pathToObject}`,
                    `JSON ${consumeOrProduceName} Content-type must be ${this.stringifyRecommendedContentTypes()}, without charset.`,
                    `warning`,
                    'convention',
                    'CTMO.STANDARD-CODAGE-15'
                );
            } else {
                messages.addTypedMessage(
                    `${pathToObject}`,
                    `${consumeOrProduceName} Content-Type must be JSON (${this.stringifyRecommendedContentTypes()}).`,
                    checkTypeLevel,
                    'convention',
                    'CTMO.STANDARD-CODAGE-15'
                );
            }
        }
    } else {
        messages.addTypedMessage(
            `${pathToObject}`,
            `${consumeOrProduceName} Content-Type must be a string.`,
            checkTypeLevel,
            'convention',
            'CTMO.STANDARD-CODAGE-15'
        );
    }
}


module.exports.stringifyRecommendedContentTypes = function  () {
    let result = ""
    recommendedContentTypes.forEach(contentTypes => {
        if (result !== "") {
            result = `${result} or `;
        }
        result = `${result}'${contentTypes}'`
    });
    return result;
}