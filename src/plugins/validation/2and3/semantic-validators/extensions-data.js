// Assertation 1:
// check if x-data are defined in each path/operation or at global level

// Assertation 2:
// check if version is in basePath on in each uri

const MessageCarrier = require('../../../utils/messageCarrier');

//All extensions can be declared at info, path or operation (except for x-data-is-file not declared here)
//If required : each must defined at least at one level
const sharedDataExtensionsDefinition = {
    'x-data-access-network': {
        'required': true,
        'type': 'string',
        'values': ['helissng', 'helissng,intradef', 'intradef']
    },
    'x-data-access-authorization': {
        'required': true,
        'type': 'string',
        'values': ['publique', 'nécessitant une autorisation du fournisseur API']
    },
    'x-data-security-classification': {
        'required': true,
        'type': 'string',
        'values': ['np','dr']
    },
    'x-data-security-mention': {
        'required': true,
        'type': 'string',
        'values': ['aucune','médical','personnel','protection personnel','concours','industrie','technologie','commercial']
    },
    'x-data-use-constraint': {
        'required': true,
        'type': 'string',
        'values': ['aucune','dpcs','rgpd']
    },
    'x-maximum-request-rate': {
        'required': false,
        'type': 'number'
    },
    'x-maximum-request-bandwidth': {
        'required': false,
        'type': 'number'
    },
    'x-maximum-request-size': {
        'required': false,
        'type': 'number'
    },
    'x-maximum-response-size': {
        'required': false,
        'type': 'number'
    }
};

const numberRegex = /^\d+((\,|\.)(\d)+)?$/;

module.exports.validate = function({ jsSpec }, config) {
    const messages = new MessageCarrier();

    if (config.extensions && config.extensions.data_extensions) {
        const checkDataExtension = config.extensions.data_extensions;
        if (checkDataExtension != 'off') {
            let infoExtensionsValues = {};

            let info = jsSpec.info;
            const hasInfo = info && typeof info === 'object';

            if (hasInfo) {
                infoExtensionsValues = checkAllExtensionsValues(info, ['info'], messages, checkDataExtension);

                keys = Object.keys(infoExtensionsValues);
                keys.forEach(key=> {
                    console.log(`info ${key} : ${infoExtensionsValues[key]}`);
                });
            }

            const paths = jsSpec.paths;
            const hasPaths = paths && typeof paths === 'object';

            if (hasPaths) {

                const pathNames = Object.keys(jsSpec.paths);
                let atLeastOneExtensionForPaths = false;
                pathNames.forEach(pathName => {
                    console.log("======================================");
                    console.log(`pathName:${pathName}`);

                    const pathExtensionsValues = checkAllExtensionsValues(jsSpec.paths[pathName], ['paths', pathName], messages, checkDataExtension);
                    let keys = Object.keys(pathExtensionsValues);
                    keys.forEach(key=> {
                        if (pathExtensionsValues[key] === false) {
                            pathExtensionsValues[key] = infoExtensionsValues[key];
                        } else {
                            atLeastOneExtensionForPaths = true;
                        }
                        console.log(`  path value of ${key} : ${pathExtensionsValues[key]}`);
                    });

                    const operations = Object.keys(jsSpec.paths[pathName]);
                    let atLeastOneExtensionForOperations = false;
                    operations.forEach(operationName => {
                        if (operationName.slice(0, 2) !== 'x-') {
                            console.log("  ---------------------------");
                            console.log(`     operationName:${operationName}`);
                            let operationExtensionsValues = checkAllExtensionsValues(jsSpec.paths[pathName][operationName], ['paths', pathName, operationName], messages, checkDataExtension);

                            let keys = Object.keys(operationExtensionsValues);
                            keys.forEach(key=> {
                                if (operationExtensionsValues[key] === false) {
                                    operationExtensionsValues[key] = pathExtensionsValues[key];
                                } else {
                                    atLeastOneExtensionForOperations = true;
                                }
                                console.log(`     operation value of ${key} : ${operationExtensionsValues[key]}`);
                            });
                        }
                    });

                    //if (atLeastOneExtensionForOperations === false)

                });

            }
        }
    }

    return messages;
};

function checkAllExtensionsValues(jsObject, pathToObjectArray, messages, messageLevel) {
    const extensionsKeys = Object.keys(sharedDataExtensionsDefinition);
    const extensionsValues = {};
    extensionsKeys.forEach(extensionKey=> {

        extensionsValues[extensionKey] = false;
        pathToObjectArray.push(extensionKey);

        let extensionValue = checkExtensionValue (jsObject, pathToObjectArray, extensionKey, messages, messageLevel);
        
        extensionsValues[extensionKey] = extensionValue;

    });

    return extensionsValues;
}

function checkExtensionValue(jsObject, pathToObjectArray, extensionKey, messages, messageLevel) {

    let jsExtensionValue = jsObject[extensionKey];
    let hasCorrectExtensionValue = false;

    if (jsExtensionValue != undefined) {
        jsExtensionValue = jsExtensionValue.toString().trim();

        if (sharedDataExtensionsDefinition[extensionKey].type === 'string') {
            
            hasCorrectExtensionValue =
                typeof jsExtensionValue === "string" && jsExtensionValue.length > 0;
            if (!hasCorrectExtensionValue) {
                messages.addTypedMessage(
                    pathToObjectArray,
                    `'${extensionKey}' value must be a non-empty string.`,
                    messageLevel,
                    'convention',
                    'CTMO.STANDARD-CODAGE-23'
                );
            } else {
                if (sharedDataExtensionsDefinition[extensionKey].values) {
                    if (sharedDataExtensionsDefinition[extensionKey].values.indexOf(jsExtensionValue) === -1) {
                        hasCorrectExtensionValue = false;
                        messages.addTypedMessage(
                            pathToObjectArray,
                            `'${extensionKey}' value must be one of ${sharedDataExtensionsDefinition[extensionKey].values.toString()}`,
                            messageLevel,
                            'convention',
                            'CTMO.STANDARD-CODAGE-23'
                        );
                    }
                }
            }
        } else if (sharedDataExtensionsDefinition[extensionKey].type === 'number') {
            if (!jsExtensionValue.length > 0 || !numberRegex.test(jsExtensionValue)) {
                hasCorrectExtensionValue = false;
                messages.addTypedMessage(
                    pathToObjectArray,
                    `'${extensionKey}' value must be a number.`,
                    messageLevel,
                    'convention',
                    'CTMO.STANDARD-CODAGE-23'
                );
            } else {
                hasCorrectExtensionValue = true;
            }
        }
    }
    if (hasCorrectExtensionValue) {
        return jsExtensionValue;
    } else {
        return false;
    }
}
