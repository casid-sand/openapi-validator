// Assertation 1:
// check if global consumes or produces field is not in JSON

const { isArray } = require('lodash');

const jsonContentTypes = ['application/json','application/hal+json', 'application/problem+json'];
const recommendedContentTypes = jsonContentTypes;
const allowedContentTypes = ['text/xml','application/xml','application/yaml', 'text/csv', 'text/plain', 'application/pdf'];


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
                
        const isRecommended = recommendedContentTypes.includes(contentType);

        if (!isRecommended) {
            
            if (contentType.includes('json')) {
                messages.addTypedMessage(
                    `${pathToObject}`,
                    `JSON ${consumeOrProduceName} Content-type must be ${this.stringifyContentTypes(recommendedContentTypes)}, without charset.`,
                    `warning`,
                    'convention',
                    'CTMO.STANDARD-CODAGE-15'
                );
            } else {

                const isAllowed = allowedContentTypes.includes(contentType);

                if (isAllowed) {
                    //if content allowed but not recommended : warning only
                    messages.addTypedMessage(
                        `${pathToObject}`,
                        `${consumeOrProduceName} Content-Type should be JSON (${this.stringifyContentTypes(recommendedContentTypes)}), instead of other allowed content-types (${this.stringifyContentTypes(allowedContentTypes)}).`,
                        'warning',
                        'convention',
                        'CTMO.STANDARD-CODAGE-15'
                    );
                } else {
                    messages.addTypedMessage(
                        `${pathToObject}`,
                        `${consumeOrProduceName} Content-Type must be JSON (${this.stringifyContentTypes(recommendedContentTypes)}).`,
                        checkTypeLevel,
                        'convention',
                        'CTMO.STANDARD-CODAGE-15'
                    );
                }
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


module.exports.stringifyContentTypes = function  (contentTypesList) {
    let result = ""
    contentTypesList.forEach(contentTypes => {
        if (result !== "") {
            result = `${result} or `;
        }
        result = `${result}'${contentTypes}'`
    });
    return result;
}