// Assertation 1:
// check if x-data are defined in each path/operation or at global level

// Assertation 2:
// check if x-data-is-file is defined and is a string

// Assertation 3:
// check if x-source is defined in info for swagger 2 or in server for openapi 3

const MessageCarrier = require('../../../utils/messageCarrier');
const getVersion = require('../../../../cli-validator/utils/getOpenApiVersion');

//All extensions can be declared at info, path or operation (except for x-data-is-file not declared in this array )
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

const xSourceAcceptedValues = ['helissng', 'intradef'];
const sourceExtensionName = "x-source";
const isFileExtenstionName = "x-data-is-file";


const numberRegex = /^\d+((\,|\.)(\d)+)?$/;

module.exports.validate = function({ jsSpec }, config) {
    const messages = new MessageCarrier();

    let info = jsSpec.info;
    const hasInfo = info && typeof info === 'object';

    if (config.extensions && config.extensions.data_extensions) {
        // Assertation 1
        const checkDataExtension = config.extensions.data_extensions;
        if (checkDataExtension != 'off') {
            let infoExtensionsValues = {};
           
            infoExtensionsValues = checkAllExtensionsValues(info, ['info'], messages, checkDataExtension);

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

                            // Assertation 2
                            const jsExtensionDataIsFile = jsSpec.paths[pathName][operationName][isFileExtenstionName];
                            if (jsExtensionDataIsFile != undefined) {
                                const hasExtensionDataIsFile =
                                    typeof jsExtensionDataIsFile === "string" && jsExtensionDataIsFile.length > 0;
                                if (!hasExtensionDataIsFile) {
                                    hasError = true;
                                    messages.addTypedMessage(
                                        ['paths', pathName, operationName, isFileExtenstionName],
                                        `'${isFileExtenstionName}' value must be a non-empty string.`,
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

        // Assertation 3
        //search x-source-extension
        const versionLanguage = getVersion(jsSpec);
        if (versionLanguage === "2") {
            let hasXSource = false;
            if (hasInfo) {
                let xsourceValue = info[sourceExtensionName];
                hasXSource = xsourceValue && typeof xsourceValue === 'string';

                if (hasXSource) {
                    xsourceValue = xsourceValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    if (xSourceAcceptedValues.indexOf(xsourceValue) === -1) {
                        messages.addTypedMessage(
                            ['info', sourceExtensionName],
                            `'${sourceExtensionName}' value must be one of ${xSourceAcceptedValues.toString()}.`,
                            checkDataExtension,
                            'convention',
                            'CTMO.STANDARD-CODAGE-23'
                        );
                    }
                }
            }
            if (!hasXSource) {
                messages.addTypedMessage(
                    ['info', sourceExtensionName],
                    `'${sourceExtensionName}' value must be defined and a non-empty string.`,
                    checkDataExtension,
                    'convention',
                    'CTMO.STANDARD-CODAGE-23'
                );
            }
        } else {
            let hasOneServer = false;

            const serversList = jsSpec.servers;
            const hasServers = serversList && typeof serversList === 'object';
            if (hasServers) {
                for (let i = 0, len = serversList.length; i < len; i++) {
                    hasOneServer = true;
                    const server = serversList[i];

                    let serverSourceValue = server[sourceExtensionName];
                    const hasXSource = serverSourceValue && typeof serverSourceValue === 'string';
                    if (hasXSource) {
                        serverSourceValue = serverSourceValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        if (xSourceAcceptedValues.indexOf(serverSourceValue) === -1) {
                            messages.addTypedMessage(
                                ['servers', `${i}`],
                                `'${sourceExtensionName}' value must be one of ${xSourceAcceptedValues.toString()}.`,
                                checkDataExtension,
                                'convention',
                                'CTMO.STANDARD-CODAGE-23'
                            );
                        }
                    } else {
                        messages.addTypedMessage(
                            ['servers', `${i}`],
                            `'${sourceExtensionName}' value must be defined and a non-empty string.`,
                            checkDataExtension,
                            'convention',
                            'CTMO.STANDARD-CODAGE-23'
                        );
                    }
                }
            }

            //if no server, add an error for x-source
            if (!hasOneServer) {
                messages.addTypedMessage(
                    ['servers'],
                    `'${sourceExtensionName}' value must be defined in 'servers'.`,
                    checkDataExtension,
                    'convention',
                    'CTMO.STANDARD-CODAGE-23'
                );
            }
        }
    }

    return messages;
};

function checkAllExtensionsValues(jsObject, pathToObjectArray, messages, messageLevel) {
    
    //search shared extensions
    const extensionsKeys = Object.keys(sharedDataExtensionsDefinition);
    const extensionsValues = {};
    extensionsKeys.forEach(extensionKey=> {

        extensionsValues[extensionKey] = null;
        const pathToExtensionArray = pathToObjectArray.slice();
        pathToExtensionArray.push(extensionKey);

        const extensionDefinition = sharedDataExtensionsDefinition[extensionKey];
        extensionDefinition.name = extensionKey;

        const extensionValue = checkExtensionValue (jsObject, pathToExtensionArray, extensionDefinition, messages, messageLevel);
        
        extensionsValues[extensionKey] = extensionValue;
    });
    return extensionsValues;
}

function checkExtensionValue(jsObject, pathToObjectArray, extensionDefinition, messages, messageLevel) {

    let jsExtensionValue;
    if (jsObject != null) {
        jsExtensionValue = jsObject[extensionDefinition.name];
    } else {
        jsExtensionValue = undefined;
    }
    let hasCorrectExtensionValue = false;
    let hasError = false;

    if (jsExtensionValue != undefined) {
        jsExtensionValue = jsExtensionValue.toString().trim();

        if (extensionDefinition.type === 'string') {
            
            hasCorrectExtensionValue =
                typeof jsExtensionValue === "string" && jsExtensionValue.length > 0;
            if (!hasCorrectExtensionValue) {
                hasError = true;
                messages.addTypedMessage(
                    pathToObjectArray,
                    `'${extensionDefinition.name}' value must be a non-empty string.`,
                    messageLevel,
                    'convention',
                    'CTMO.STANDARD-CODAGE-23'
                );
            } else {
                if (extensionDefinition.values) {
                    //lower case conversion and remove "e" with accents
                    const valueToFind = jsExtensionValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    if (extensionDefinition.values.indexOf(valueToFind) === -1) {
                        hasError = true;
                        hasCorrectExtensionValue = false;
                        messages.addTypedMessage(
                            pathToObjectArray,
                            `'${extensionDefinition.name}' value must be one of ${extensionDefinition.values.toString()}.`,
                            messageLevel,
                            'convention',
                            'CTMO.STANDARD-CODAGE-23'
                        );
                    }
                }
            }
        } else if (extensionDefinition.type === 'number') {
            if (jsExtensionValue.length === 0 || !numberRegex.test(jsExtensionValue)) {
                hasError = true;
                hasCorrectExtensionValue = false;
                messages.addTypedMessage(
                    pathToObjectArray,
                    `'${extensionDefinition.name}' value must be a number.`,
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
