// Assertation 1:
// check if x-data are defined in each path/operation or at global level

const MessageCarrier = require('../../../utils/messageCarrier');

//All extensions can be declared at info, path or operation (except for x-data-is-file not declared here)
//If required : each must defined at least at one level
const sharedDataExtensionsDefinition = {
    'x-data-access-authorization': {
        'required': true,
        'type': 'string',
        'values': ['publique', 'necessitant une autorisation du fournisseur api']
    },
    'x-data-access-network': {
        'required': true,
        'type': 'string',
        'values': ['helissng', 'helissng,intradef', 'helissng, intradef', 'intradef']
    },
    'x-data-security-classification': {
        'required': true,
        'type': 'string',
        'values': ['np','dr']
    },
    'x-data-security-mention': {
        'required': true,
        'type': 'string',
        'values': ['aucune','medical','personnel','protection personnel','concours','industrie','technologie','commercial']
    },
    'x-data-use-constraint': {
        'required': true,
        'type': 'string',
        'values': ['aucune','dpcs','rgpd']
    },
    'x-maximum-request-bandwidth': {
        'required': false,
        'type': 'number'
    },
    'x-maximum-request-rate': {
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

            //if (hasInfo) {
                infoExtensionsValues = checkAllExtensionsValues(info, ['info'], messages, checkDataExtension);
            //}

            const paths = jsSpec.paths;
            const hasPaths = paths && typeof paths === 'object';
            const pathsExtensionsValues =  {};
            let atLeastOneExtensionForPaths = false;
            let atLeastOneExtensionForOperations = false;

            if (hasPaths) {

                const pathNames = Object.keys(jsSpec.paths);
                pathNames.forEach(pathName => {

                    const pathExtensionsValues = checkAllExtensionsValues(jsSpec.paths[pathName], ['paths', pathName], messages, checkDataExtension);
                    let keys = Object.keys(pathExtensionsValues);
                    keys.forEach(key=> {
                        if (pathExtensionsValues[key] === false) {
                            //no value defined
                            pathExtensionsValues[key] = infoExtensionsValues[key];
                        } else if (pathExtensionsValues[key] === -1) {
                            //value but incorrect
                            atLeastOneExtensionForPaths = true;
                            pathExtensionsValues[key] = infoExtensionsValues[key];
                        } else {
                            //value ok
                            atLeastOneExtensionForPaths = true;
                        }
                    });

                    pathsExtensionsValues[`${pathName}`] = {};
                    pathsExtensionsValues[`${pathName}`].operations = {};
                    pathsExtensionsValues[`${pathName}`].extensionsValues = pathExtensionsValues;

                    const operations = Object.keys(jsSpec.paths[pathName]);
                    let atLeastOneExtensionForOperationsInPath = false;
                    operations.forEach(operationName => {
                        if (operationName.slice(0, 2) !== 'x-') {
                            let operationExtensionsValues = checkAllExtensionsValues(jsSpec.paths[pathName][operationName], ['paths', pathName, operationName], messages, checkDataExtension);

                            const jsExtensionDataIsFile = jsSpec.paths[pathName][operationName]["x-data-is-file"];
                            if (jsExtensionDataIsFile != undefined) {
                                const hasExtensionDataIsFile =
                                    typeof jsExtensionDataIsFile === "string" && jsExtensionDataIsFile.length > 0;
                                if (!hasExtensionDataIsFile) {
                                    hasError = true;
                                    messages.addTypedMessage(
                                        ['paths', pathName, operationName, "x-data-is-file"],
                                        `'x-data-is-file' value must be a non-empty string.`,
                                        checkDataExtension,
                                        'convention',
                                        'CTMO.STANDARD-CODAGE-23'
                                    );
                                }
                            }

                            let keys = Object.keys(operationExtensionsValues);
                            keys.forEach(key=> {
                                if (operationExtensionsValues[key] === false) {
                                    //no value defined
                                    operationExtensionsValues[key] = pathExtensionsValues[key];
                                } else if (operationExtensionsValues[key] === -1) {
                                    //value but incorrect
                                    atLeastOneExtensionForOperationsInPath = true;
                                    operationExtensionsValues[key] = pathExtensionsValues[key];
                                } else {
                                    //value ok
                                    atLeastOneExtensionForOperationsInPath = true;
                                }

                            });

                            pathsExtensionsValues[`${pathName}`].operations[`${operationName}`] = operationExtensionsValues;
                        }
                        pathsExtensionsValues[`${pathName}`].atLeastOneExtensionForOperationsInPath = atLeastOneExtensionForOperationsInPath;
                        if (atLeastOneExtensionForOperationsInPath) {
                            atLeastOneExtensionForOperations = true;
                        }
                    });
                });

                let pathsKeys = Object.keys(pathsExtensionsValues);
                pathsKeys.forEach(pathName=> {
                    const pathData = pathsExtensionsValues[pathName];

                    let operationKeys = Object.keys(pathData.operations);
                    operationKeys.forEach(operationName=> {
                        const operationData = pathData.operations[operationName];
                        let operationExtensionsKeys = Object.keys(operationData);
                        operationExtensionsKeys.forEach(extensionName=> {
                        });
                    });
                });
            }

            //no x-data at operation or path => only one message for each extension
            if (atLeastOneExtensionForOperations === false && atLeastOneExtensionForPaths === false) {
                const extensionsKeys = Object.keys(sharedDataExtensionsDefinition);
                extensionsKeys.forEach(extensionKey=> {
                    //add message for extension not defined
                    if (sharedDataExtensionsDefinition[extensionKey].required === true && infoExtensionsValues[extensionKey] === false) {
                        messages.addTypedMessage(
                            ['info', extensionKey],
                            `Extension value must be defined in object 'info', 'path' or 'operation' : '${extensionKey}' (recommended on 'info' object).`,
                            checkDataExtension,
                            'convention',
                            'CTMO.STANDARD-CODAGE-23'
                        );
                    }
                });
            } else {
                //at least one x-data is defined for path or operation level
                let pathsKeys = Object.keys(pathsExtensionsValues);
                pathsKeys.forEach(pathName=> {
                    const pathData = pathsExtensionsValues[pathName];
                    if (pathData.atLeastOneExtensionForOperationsInPath === false) {
                        //no x-data in operations of current path => only one message for each extension for this path
                        const extensionsKeys = Object.keys(sharedDataExtensionsDefinition);
                        extensionsKeys.forEach(extensionKey=> {
                            if (sharedDataExtensionsDefinition[extensionKey].required === true && pathData.extensionsValues[extensionKey] === false) {
                                messages.addTypedMessage(
                                    ['paths', pathName, extensionKey],
                                    `Extension value must be defined in object 'info', 'path' or 'operation' : '${extensionKey}' (recommended on 'info' object).`,
                                    checkDataExtension,
                                    'convention',
                                    'CTMO.STANDARD-CODAGE-23'
                                );
                            }
                        });
                    } else {
                        //at least on extension in one operation of path
                        let operationKeys = Object.keys(pathData.operations);
                        operationKeys.forEach(operationName=> {
                            const operationData = pathData.operations[operationName];
                            const extensionsKeys = Object.keys(sharedDataExtensionsDefinition);
                            extensionsKeys.forEach(extensionKey=> {
                                if (sharedDataExtensionsDefinition[extensionKey].required === true && operationData[extensionKey] === false) {
                                    messages.addTypedMessage(
                                        ['paths', pathName, operationName, extensionKey],
                                        `Extension value must be defined in object 'info', 'path' or 'operation' : '${extensionKey}' (recommended on 'info' object).`,
                                        checkDataExtension,
                                        'convention',
                                        'CTMO.STANDARD-CODAGE-23'
                                    );
                                }
                            });
                        });
                    }
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

        extensionsValues[extensionKey] = null;
        const pathToExtensionArray = pathToObjectArray.slice();
        pathToExtensionArray.push(extensionKey);

        const extensionValue = checkExtensionValue (jsObject, pathToExtensionArray, extensionKey, messages, messageLevel);
        
        extensionsValues[extensionKey] = extensionValue;

    });

    return extensionsValues;
}

function checkExtensionValue(jsObject, pathToObjectArray, extensionKey, messages, messageLevel) {

    let jsExtensionValue;
    if (jsObject != null) {
        jsExtensionValue = jsObject[extensionKey];
    } else {
        jsExtensionValue = undefined;
    }
    let hasCorrectExtensionValue = false;
    let hasError = false;

    if (jsExtensionValue != undefined) {
        jsExtensionValue = jsExtensionValue.toString().trim();

        if (sharedDataExtensionsDefinition[extensionKey].type === 'string') {
            
            hasCorrectExtensionValue =
                typeof jsExtensionValue === "string" && jsExtensionValue.length > 0;
            if (!hasCorrectExtensionValue) {
                hasError = true;
                messages.addTypedMessage(
                    pathToObjectArray,
                    `'${extensionKey}' value must be a non-empty string.`,
                    messageLevel,
                    'convention',
                    'CTMO.STANDARD-CODAGE-23'
                );
            } else {
                if (sharedDataExtensionsDefinition[extensionKey].values) {
                    //lower case conversion and remove "e" with accents
                    const valueToFind = jsExtensionValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    if (sharedDataExtensionsDefinition[extensionKey].values.indexOf(valueToFind) === -1) {
                        hasError = true;
                        hasCorrectExtensionValue = false;
                        messages.addTypedMessage(
                            pathToObjectArray,
                            `'${extensionKey}' value must be one of ${sharedDataExtensionsDefinition[extensionKey].values.toString()} - not ${valueToFind}`,
                            messageLevel,
                            'convention',
                            'CTMO.STANDARD-CODAGE-23'
                        );
                    }
                }
            }
        } else if (sharedDataExtensionsDefinition[extensionKey].type === 'number') {
            if (jsExtensionValue.length === 0 || !numberRegex.test(jsExtensionValue)) {
                hasError = true;
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
    if (hasError === true) {
        return -1;
    } else if (hasCorrectExtensionValue) {
        return jsExtensionValue;
    } else {
        return false;
    }
}
