// Assertation 1:
// check if version is in basePath (swagger2) or in server (openapi3) or in each uri

// Assertation 2:
// check if version is correct between path and info

const MessageCarrier = require('../../../utils/messageCarrier');
const getVersion = require('../../../../cli-validator/utils/getOpenApiVersion');

const versionInPathRegex = /^(?:v(?:ersion)?[\_\-\.]?)?(\d+)(\.\d+)?(\.\d+)?$/;
const versionNameRegex = /^(?:v(?:ersion)?[\_\-\. ]*)?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?(.*)$/;

const reservedPathsWithoutVersion = ['health', 'metrics'];

module.exports.validate = function({ jsSpec }, config) {
    const messages = new MessageCarrier();

    if (config.common && config.common.version_in_path) {
        const checkVersionInPath = config.common.version_in_path;
        if (checkVersionInPath != 'off') {

            let info = jsSpec.info;
            const hasInfo = info && typeof info === 'object';
            let hasApiVersion = false;
            let apiVersionString;
            let apiversionComponents = [];

            if (hasInfo) {
                apiVersionString = info.version;
                hasApiVersion =
                    typeof apiVersionString === 'string' && apiVersionString.toString().trim().length > 0;

                if (hasApiVersion) {
                    apiVersionString = apiVersionString.toLowerCase();
                    apiversionComponents = apiVersionString.match(versionNameRegex);
                }
            }

            const versionLanguage = getVersion(jsSpec);

            let hasApiVersionInBasePath = false;

            if (versionLanguage == "2") {

                //if version 2 (swagger) : check basePath

                const basePath = jsSpec.basePath;
                const hasBasePath = basePath && typeof basePath === 'string';

                if (hasBasePath) {
                    
                    let hasVersionElementInBasePath = false;
                    //parse each url element : separates by /
                    basePath.split('/').map(basePathElement => {

                        if (basePathElement !== "") {

                            basePathElement = basePathElement.toLowerCase();
                            if (versionInPathRegex.test(basePathElement)) {
                                //duplicate version in path
                                if (hasVersionElementInBasePath === true) {
                                    messages.addTypedMessage(
                                        [`basePath`],
                                        `Version identifier is duplicate in basePath.`,
                                        'warning',
                                        'inconsistent_version',
                                        'convention',
                                        'CTMO.Regle-14'
                                    );
                                }
                                hasVersionElementInBasePath = true;
                                hasApiVersionInBasePath = true;

                                //if version is declared in info, compare it
                                if (hasApiVersion === true) {
                                    
                                    const hasCorrectVersionNumber = isVersionSimilar(basePathElement, apiversionComponents);

                                    if (hasCorrectVersionNumber === true) {
                                        hasApiVersionInBasePath= true;
                                    } else {
                                        messages.addTypedMessage(
                                            [`basePath`],
                                            `Version in basePath doesn't match API version : ${basePathElement} doesn't match ${apiVersionString}.`,
                                            checkVersionInPath,
                                            'inconsistent_version',
                                            'convention',
                                            'CTMO.Regle-14'
                                        );
                                    }
                                }
                            }
                        }
                    });
                }
            } else if (versionLanguage === "3") {
                //if version 3 (openapi) : check each server url

                const serversList = jsSpec.servers;
                const hasServers = serversList && typeof serversList === 'object';
                let serversWithoutVersion = [];
                let hasOneServerWithVersion = false;

                if (hasServers) {
                    for (let i = 0, len = serversList.length; i < len; i++) {
                        const server = serversList[i];
                        const serverUrl = server.url;

                        if (serverUrl && typeof serverUrl === "string" && serverUrl.toString().trim().length > 0) {

                            let hasVersionElementInServer = false;

                            //parse each url element : separates by /
                            serverUrl.split('/').map(serverUrlElement => {

                                if (serverUrlElement !== "") {

                                    serverUrlElement = serverUrlElement.toLowerCase();
                                    if (versionInPathRegex.test(serverUrlElement)) {
                                        //duplicate version in path
                                        if (hasVersionElementInServer === true) {
                                            messages.addTypedMessage(
                                                [`servers`, `${i}`, 'url'],
                                                `Version identifier is duplicate in url.`,
                                                'warning',
                                                'inconsistent_version',
                                                'convention',
                                                'CTMO.Regle-14'
                                            );
                                        }
                                        hasVersionElementInServer = true;

                                        //if version is declared in info, compare it
                                        if (hasApiVersion === true) {
                                            
                                            const hasCorrectVersionNumber = isVersionSimilar(serverUrlElement, apiversionComponents);

                                            if (hasCorrectVersionNumber === true) {
                                            } else {
                                                messages.addTypedMessage(
                                                    [`servers`, `${i}`, 'url'],
                                                    `Version in server doesn't match API version : ${serverUrlElement} doesn't match ${apiVersionString}.`,
                                                    checkVersionInPath,
                                                    'inconsistent_version',
                                                    'convention',
                                                    'CTMO.Regle-14'
                                                );
                                            }
                                        } 
                                    }
                                }
                                
                            });

                            if (hasVersionElementInServer === true) {
                                hasOneServerWithVersion = true;
                            } else {
                                serversWithoutVersion.push(i);
                            }

                        } else {
                            serversWithoutVersion.push(i);
                        }
                    }

                    //at least one server include version
                    if (hasOneServerWithVersion) {
                        hasApiVersionInBasePath = true;

                        //and at least one without version
                        if (serversWithoutVersion.length> 0) {
                            let serversNumberStr = "";
                            for (let i = 0, len = serversWithoutVersion.length; i < len; i++) {
                                if (serversNumberStr !== "") {
                                    serversNumberStr = `${serversNumberStr}, `;
                                }
                                serversNumberStr = `${serversNumberStr}${serversWithoutVersion[i]}`;
                            }
                            messages.addTypedMessage(
                                [`servers`],
                                `Version must be declared in all servers, or in none, but is missing in elements : ${serversNumberStr}`,
                                checkVersionInPath,
                                'inconsistent_version',
                                'convention',
                                'CTMO.Regle-14'
                            );
                        }
                    } 

                }
            }

            const paths = jsSpec.paths;
            const hasPaths = paths && typeof paths === 'object';
            let hasOnePathWithoutVersion = false;
            let hasOnePathWithVersion = false;

            if (hasPaths) {
                const pathNames = Object.keys(jsSpec.paths);
                pathNames.forEach(pathName => {
                    let pathHasVersion = false;
                    let pathHasReservedWord = false;

                    let depthPath = 0;
                    //parse each url element : separates by /
                    pathName.split('/').map(pathElement => {

                        if (pathElement !== "") {
                            depthPath += 1;
                            pathElement = pathElement.toLowerCase();

                            if (versionInPathRegex.test(pathElement)) {
                                //duplicate version in path
                                if (pathHasVersion === true) {
                                    messages.addTypedMessage(
                                        ['paths', pathName],
                                        `Version identifier is duplicate in path.`,
                                        'warning',
                                        'inconsistent_version',
                                        'convention',
                                        'CTMO.Regle-14'
                                    );
                                }
                                pathHasVersion = true;

                                if (hasApiVersionInBasePath === true) {
                                    messages.addTypedMessage(
                                        ['paths', pathName],
                                        `Version identifier of basePath/server is duplicate in path.`,
                                        'warning',
                                        'inconsistent_version',
                                        'convention',
                                        'CTMO.Regle-14'
                                    );
                                }

                                //if version is declared in info, compare it
                                if (hasApiVersion === true) {
                                    
                                    const hasCorrectVersionNumber = isVersionSimilar(pathElement, apiversionComponents);

                                    if (hasCorrectVersionNumber === true) {
                                        hasOnePathWithVersion= true;
                                    } else {
                                        messages.addTypedMessage(
                                            ['paths', pathName],
                                            `Version in path doesn't match API version : ${pathElement} doesn't match ${apiVersionString}.`,
                                            checkVersionInPath,
                                            'inconsistent_version',
                                            'convention',
                                            'CTMO.Regle-14'
                                        );
                                    }
                                } else {
                                    hasOnePathWithVersion = true;
                                }
                            } else if (reservedPathsWithoutVersion.includes(pathElement) && depthPath === 1 ) {
                                //if starts with a tecnical reserved path
                                pathHasReservedWord = true;
                            }
                        }
                    });

                    //at least one path without version and not a reserved path
                    if (pathHasVersion === false && pathHasReservedWord === false) {
                        hasOnePathWithoutVersion = true;
                    }
                });

                if (!hasApiVersionInBasePath) {

                    let elementName = "";
                    if (versionLanguage == "2") {
                        elementName = `basePath`;
                    } if (versionLanguage == "3") {
                        elementName = `servers`;
                    }

                    if (hasOnePathWithVersion) {
                        if (hasOnePathWithoutVersion) {
                            messages.addTypedMessage(
                                [elementName],
                                `Version should be declared in basePath or servers URL, not in paths, or it should be in all paths.`,
                                checkVersionInPath,
                                'inconsistent_version',
                                'convention',
                                'CTMO.Regle-14'
                            );
                        } else {
                            messages.addTypedMessage(
                                [elementName],
                                `Version should be declared in basePath or servers URL, not in paths.`,
                                'warning',
                                'inconsistent_version',
                                'convention',
                                'CTMO.Regle-14'
                            );
                        }
                    } else {
                        messages.addTypedMessage(
                            [elementName],
                            `Version must be defined in basePath/server (recommended), or in each path, but is missing.`,
                            checkVersionInPath,
                            'inconsistent_version',
                            'convention',
                            'CTMO.Regle-14'
                        );
                    }
                }

            }

        }
    }

    return messages;
};

//Compare version in path with version in API
//check if major is equal, and if minor is equal if declared, and if patch is equal if declared 
function isVersionSimilar(pathPart, apiversionComponents) {
    
    let isVersionSimilar = true;

    const pathversionComponents = pathPart.match(versionNameRegex);
    let hasCorrectVersionNumber = true;
    //check major version number
    if (pathversionComponents[1] == apiversionComponents[1]) {
        //check major version number
        if (pathversionComponents[2] != undefined) {
            if (pathversionComponents[2] == apiversionComponents[2]) {
                //check patch version number
                if (pathversionComponents[3] != undefined) {
                    if (pathversionComponents[3] != apiversionComponents[3]) {
                        isVersionSimilar = false;
                    }
                }
            } else {
                isVersionSimilar = false;
            }
        }
    } else {
        isVersionSimilar = false;
    }

    return isVersionSimilar;
}
