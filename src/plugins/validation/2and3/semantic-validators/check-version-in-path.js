// Assertation 1:
// check if version is in basePath (swagger2) or in server (openapi3) or in each uri

// Assertation 2:
// check if version is correct between path and info

const MessageCarrier = require('../../../utils/messageCarrier');
const getVersion = require('../../../../cli-validator/utils/getOpenApiVersion');

const versionInPathRegex = /^(?:v(?:ersion)?[\_\-\.]?)?(\d+)(\.\d+)?(\.\d+)?$/;
const versionNameRegex = /^(?:v(?:ersion)?[\_\-\. ]*)?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?(.*)$/;

module.exports.validate = function({ jsSpec }, config) {
    const messages = new MessageCarrier();

    if (config.extensions && config.extensions.version_in_path) {
        const checkVersionInPath = config.extensions.version_in_path;
        if (checkVersionInPath != 'off') {
            console.log("checkVersionInPath");

            let info = jsSpec.info;
            const hasInfo = info && typeof info === 'object';
            let hasApiVersion = false;
            let apiVersionString;
            let apiversionComponents = [];

            if (hasInfo) {
                console.log("info present");
                apiVersionString = info.version;
                hasApiVersion =
                    typeof apiVersionString === 'string' && apiVersionString.toString().trim().length > 0;

                if (hasApiVersion) {
                    console.log("version present");
                    apiVersionString = apiVersionString.toLowerCase();
                    apiversionComponents = apiVersionString.match(versionNameRegex);
                }
            }

            const versionLanguage = getVersion(jsSpec);

            let hasApiVersionInBasePath = false;

            if (versionLanguage == "2") {

                //if version 2 (swagger) : check basePath

                console.log("swagger 2");

                const basePath = jsSpec.basePath;
                const hasBasePath = basePath && typeof basePath === 'string';

                if (hasBasePath) {
                    
                    console.log("basePath present");
                    
                    let hasVersionElementInBasePath = false;
                    //parse each url element : separates by /
                    basePath.split('/').map(basePathElement => {

                        if (basePathElement !== "") {
                        
                            console.log(`basePath element: ${basePathElement}`);

                            basePathElement = basePathElement.toLowerCase();
                            if (versionInPathRegex.test(basePathElement)) {
                                //duplicate version in path
                                if (hasVersionElementInBasePath === true) {
                                    console.log("version doublon");
                                    messages.addTypedMessage(
                                        `basePath`,
                                        `Version identifier is duplicate in basePath.`,
                                        checkVersionInPath,
                                        'convention',
                                        'CTMO.Regle-14'
                                    );
                                }
                                hasVersionElementInBasePath = true;

                                //if version is declared in info, compare it
                                if (hasApiVersion === true) {
                                    
                                    const hasCorrectVersionNumber = isVersionSimilar(basePathElement, apiversionComponents);

                                    if (hasCorrectVersionNumber === true) {
                                        console.log("version correcte");
                                        hasApiVersionInBasePath= true;
                                    } else {
                                        console.log("version incorrecte");
                                        messages.addTypedMessage(
                                            `basePath`,
                                            `Version in basePath doesn't match API version : ${basePathElement} doesn't match ${apiVersionString}.`,
                                            checkVersionInPath,
                                            'convention',
                                            'CTMO.Regle-14'
                                        );
                                    }
                                } else {
                                    hasApiVersionInBasePath = true;
                                }
                            }
                        }
                    });
                }
            } else if (versionLanguage === "3") {
                //if version 3 (openapi) : check each server url

                console.log("openapi 3");

                const serversList = jsSpec.servers;
                const hasServers = serversList && typeof serversList === 'object';
                let serversWithoutVersion = [];
                let hasOneServerWithVersion = false;

                if (hasServers) {
                    console.log("servers present");
                    for (let i = 0, len = serversList.length; i < len; i++) {
                        console.log(`server num ${i}`);
                        const server = serversList[i];
                        console.log(`server ${server}`);
                        const serverUrl = server.url;
                        console.log(`serverUrl ${serverUrl}`);

                        if (serverUrl && typeof serverUrl === "string" && serverUrl.toString().trim().length > 0) {

                            let hasVersionElementInServer = false;
                            let hasCorrectVersionInServer = false;

                            //parse each url element : separates by /
                            serverUrl.split('/').map(serverUrlElement => {

                                if (serverUrlElement !== "") {
                                
                                    console.log(`server url element: ${serverUrlElement}`);

                                    serverUrlElement = serverUrlElement.toLowerCase();
                                    if (versionInPathRegex.test(serverUrlElement)) {
                                        //duplicate version in path
                                        if (hasVersionElementInServer === true) {
                                            console.log("version doublon");
                                            messages.addTypedMessage(
                                                [`servers`, `${i}`],
                                                `Version identifier is duplicate in basePath.`,
                                                checkVersionInPath,
                                                'convention',
                                                'CTMO.Regle-14'
                                            );
                                        }
                                        hasVersionElementInServer = true;

                                        //if version is declared in info, compare it
                                        if (hasApiVersion === true) {
                                            
                                            const hasCorrectVersionNumber = isVersionSimilar(serverUrlElement, apiversionComponents);

                                            if (hasCorrectVersionNumber === true) {
                                                console.log("version correcte");
                                                hasCorrectVersionInServer= true;
                                            } else {
                                                console.log("version incorrecte");
                                                messages.addTypedMessage(
                                                    [`servers`, `${i}`],
                                                    `Version in server doesn't match API version : ${serverUrlElement} doesn't match ${apiVersionString}.`,
                                                    checkVersionInPath,
                                                    'convention',
                                                    'CTMO.Regle-14'
                                                );
                                            }
                                        } else {
                                            hasCorrectVersionInServer = true;
                                        }
                                    }
                                }
                                
                            });

                            if (hasCorrectVersionInServer === true) {
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
                            console.log(`version manquante dans ${serversWithoutVersion.length} serveur`);
                            let serversNumberStr = "";
                            for (let i = 0, len = serversWithoutVersion.length; i < len; i++) {
                                if (serversNumberStr !== "") {
                                    serversNumberStr = `${serversNumberStr}, `;
                                }
                                serversNumberStr = `${serversNumberStr}${serversWithoutVersion[i]}`;
                            }
                            messages.addTypedMessage(
                                `servers`,
                                `Version must be declared in all servers, or in none, but is missing in elements : ${serversNumberStr}`,
                                checkVersionInPath,
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

            if (hasPaths) {
                const pathNames = Object.keys(jsSpec.paths);
                pathNames.forEach(pathName => {
                    console.log(`**pathName: ${pathName}`);
                    let pathHasVersion = false;

                    //parse each url element : separates by /
                    pathName.split('/').map(pathElement => {

                        if (pathElement !== "") {
                        
                            console.log(` --pathElement element: ${pathElement}`);
                            pathElement = pathElement.toLowerCase();

                            let hasVersionInPathName = false;

                            if (versionInPathRegex.test(pathElement)) {
                                //duplicate version in path
                                if (hasVersionInPathName === true) {
                                    console.log("version doublon in path");
                                    messages.addTypedMessage(
                                        ['paths', pathName],
                                        `Version identifier is duplicate in path.`,
                                        checkVersionInPath,
                                        'convention',
                                        'CTMO.Regle-14'
                                    );
                                }
                                hasVersionInPathName = true;

                                if (hasApiVersionInBasePath === true) {
                                    console.log("version doublon in path/basePath");
                                    messages.addTypedMessage(
                                        ['paths', pathName],
                                        `Version identifier of basePath is duplicate in path.`,
                                        'warning',
                                        'convention',
                                        'CTMO.Regle-14'
                                    );
                                }

                                //if version is declared in info, compare it
                                if (hasApiVersion === true) {
                                    
                                    const hasCorrectVersionNumber = isVersionSimilar(pathElement, apiversionComponents);

                                    if (hasCorrectVersionNumber === true) {
                                        console.log("version correcte");
                                        pathHasVersion= true;
                                    } else {
                                        console.log("version incorrecte");
                                        messages.addTypedMessage(
                                            ['paths', pathName],
                                            `Version in path doesn't match API version : ${pathElement} doesn't match ${apiVersionString}.`,
                                            checkVersionInPath,
                                            'convention',
                                            'CTMO.Regle-14'
                                        );
                                    }
                                } else {
                                    pathHasVersion = true;
                                }
                            } 
                        }
                    });

                    //at least one path without version
                    if (pathHasVersion === false) {
                        hasOnePathWithoutVersion = true;
                    }
                });

                if (hasOnePathWithoutVersion && !hasApiVersionInBasePath) {
                    console.log("no version declared at all");
                    messages.addTypedMessage(
                        `basePath`,
                        `Version must defined in basePath/server, or in each path.`,
                        checkVersionInPath,
                        'convention',
                        'CTMO.Regle-14'
                    );
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
