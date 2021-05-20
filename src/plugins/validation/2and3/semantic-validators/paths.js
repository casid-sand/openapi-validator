// Assertation 1:
// Path parameters definition, either at the path-level or the operation-level, need matching paramater declarations

// Assertation 2:
// Path parameter declarations do not allow empty names (/path/{} is not valid)

// Assertation 3:
// Path strings must be (equivalently) different (Example: /pet/{petId} and /pet/{petId2} are equivalently the same and would generate an error)

// Assertation 4:
// Paths must have unique (name + in combination) parameters

// Assertation 5:
// Paths cannot have literal query strings in them.
// Handled by the Spectral rule, path-not-include-query

// Assertation 7:
// Paths parts should be at plural : ending with s, x or z, or having first word ending with it

// Assertation 8:
// Resources and identifier must be alternated in path
// NB : version is excluded

// Assertation 9:
// Path must contains 6 depths max (alternating resources and identifier Assertation 8).
// NB : version is excluded

// Assertation 10:
// Path should not end with a "/"

//Assertation 11 
// If version is in path, it should be equal than version of API

// Assertation 12:
// check if basePath/server is include in path URI

// Assertation 13:
// check if API has a health (or status) endpoint

const each = require('lodash/each');
const findIndex = require('lodash/findIndex');
const isPlainObject = require('lodash/isPlainObject');
const MessageCarrier = require('../../../utils/messageCarrier');

const templateRegex = /\{(.*?)\}/g;
const versionInPathRegex = /^(?:v(?:ersion)?[\_\-\.]?)?(\d+)(\.\d+)?(\.\d+)?$/;
const parameterRegex = /^{.*}$/;

const pluralFirstWordLowerCase = /^[a-z][a-z0-9]*[sxz](?:[\_\-\.][a-z0-9]+)*$/; // example : learnings_opt_out or learningx-opt-out or learningz.opt.Out
const pluralFirstWordCamelCase = /^[a-zA-Z][a-z0-9]*[sxz](?:[A-Z][a-z0-9]+)*$/; // example : learningxOptOut or LearningsOptOut

const recommendedHealthOperationName = 'health';
const authorizedHealthOperationNames = [recommendedHealthOperationName, 'status', 'ping'];

const pathApiPart = 'api';
const pathReservedWords = [pathApiPart, recommendedHealthOperationName, 'metrics'];

module.exports.validate = function({ resolvedSpec }, config) {
  const messages = new MessageCarrier();

  config = config.paths;

  const paths = resolvedSpec.paths;
  const hasPaths = paths && typeof paths === 'object';

  let apiHasRecommendedHealthEndpoint = false;
  let apiHasAuthorizedHealthEndpoint = false;
  let healthEndPoint;

  if (hasPaths) {

    const seenRealPaths = {};

    const tallyRealPath = path => {
        // ~~ is a flag for a removed template string
        const realPath = path.replace(templateRegex, '~~');
        const prev = seenRealPaths[realPath];
        seenRealPaths[realPath] = true;
        // returns if it was previously seen
        return !!prev;
    };

    each(resolvedSpec.paths, (path, pathName) => {
        if (!path || !pathName) {
            return;
        }

        let resourcesMalFormed = '';
        let resourcesAlternated = true;
        let depthPath = 0;
        let numberOfLevels = 0;
        let isHealthPath = true;
        let isRecommendedHealthEndpoint = false;
        let isAuthorizedHealthEndpoint = false;

        const pathElements = pathName.split('/');
        pathElements.map(substr => {
            depthPath += 1;
            substr = substr.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            
            //check if root path (number 1), or if it's the version or if it's a reserved Word
            if (depthPath > 1) {
                if (! (versionInPathRegex.test(substr.toLowerCase()))
                    && ! (pathReservedWords.includes(substr.toLowerCase()))) {
                    
                    numberOfLevels += 1;

                    //check all path elements plural, except parameters
                    if (substr.length > 0 && !parameterRegex.test(substr)) {
                        const lastPathChar = substr.charAt(substr.length-1).toLowerCase();

                        // Assertation 7 : checks elements
                        //checks last word last char
                        if(lastPathChar != "s" && lastPathChar != "x" && lastPathChar != "z") {

                            //check first word depending on case
                            let firstWordPlural = false;
                            if (substr.indexOf('_') > -1 || substr.indexOf('-') > -1 || substr.indexOf('.') > -1 ) {
                                firstWordPlural = pluralFirstWordLowerCase.test(substr.toLowerCase());
                            } else {
                                //check in camelCase
                                firstWordPlural = pluralFirstWordCamelCase.test(substr);
                            }

                            if (firstWordPlural === false) {
                                if (resourcesMalFormed == '') {
                                    resourcesMalFormed = `'${substr}'`;

                                } else {
                                    resourcesMalFormed = `${resourcesMalFormed}, '${substr}'`;
                                }
                            }
                        }
                    }

                    //Assertation 8
                    //even number must levels must be parameters, and odd must be resources
                    if ( (numberOfLevels % 2 == 0) != parameterRegex.test(substr) ) {
                        resourcesAlternated = false;
                    }
                }

                // Assertation 13 : first part => check each pathElement
                if (!versionInPathRegex.test(substr.toLowerCase()) && pathApiPart !== substr && substr !== '') {
                    if (authorizedHealthOperationNames.includes(substr)) {
                        isAuthorizedHealthEndpoint = true;
                        if (recommendedHealthOperationName === substr) {
                            isRecommendedHealthEndpoint = true;
                        }
                    } else {
                        //if path contains other strings than api, vX or health words : it's not a real health path
                        isHealthPath = false;
                    }
                }
            }
        });

        // Assertation 13 : second part => check path consistence
        if (isHealthPath) {
            if (isRecommendedHealthEndpoint) {
                healthEndPoint = pathName;
                apiHasRecommendedHealthEndpoint = true;
            } else if (isAuthorizedHealthEndpoint) {
                //if the recommended is already found, authorized is not kept
                if (!apiHasRecommendedHealthEndpoint) {
                    healthEndPoint = pathName;
                    apiHasAuthorizedHealthEndpoint = true;
                }
            }
        }

        // Assertation 7 : unique message
        const checkResourcesPlural = config.plural_path_segments;
        if (resourcesMalFormed != '' && checkResourcesPlural != 'off') {
            messages.addTypedMessage(
                `paths.${pathName}`,
                `Resources in paths should be plural (with an 's', 'x' or 'z') : ${resourcesMalFormed}.`,
                checkResourcesPlural,
                'path_without_plural',
                'semantic',
                'CTMO.STANDARD-CODAGE-03'
            );
        }

        // Assertation 9
        let checkPathDepth = 'off';
        let maxPathDepth = 0;
        if (config.max_path_levels) {
            checkPathDepth = config.max_path_levels[0];
            maxPathDepth = config.max_path_levels[1];
        }
        if (numberOfLevels > maxPathDepth && checkPathDepth != 'off') {
            messages.addTypedMessage(
                `paths.${pathName}`,
                `Path must contain 6 depths maximum (3 levels alternating resource and identifier).`,
                checkPathDepth,
                'path_depth',
                'convention',
                'CTMO.STANDARD-CODAGE-05'
            );
        }

        //Assertation 8 : message management
        const checkResourcesAlternated = config.alternate_resources_and_identifiers;
        if (!resourcesAlternated && checkResourcesAlternated != 'off') {
            messages.addTypedMessage(
                `paths.${pathName}`,
                `Path must alternate resource type and identifier (eg 'resource/{id}/subresource/{id}').`,
                checkResourcesAlternated,
                'path_without_alternate',
                'convention',
                'CTMO.STANDARD-CODAGE-04'
            );
        }

        //Assertation 10
        const checkFinalSlash = config.path_ending_with_slash;
        if (checkFinalSlash != 'off' && numberOfLevels > 0 && pathName.length > 1 && pathName.charAt(pathName.length-1) == "/") {
            messages.addTypedMessage(
                `paths.${pathName}`,
                `Path should not end with a '/'.`,
                checkFinalSlash,
                'path_trailing_slash',
                'convention',
                'CTMO.STANDARD-CODAGE-11'
            );
        }

        const parametersFromPath = path.parameters ? path.parameters.slice() : [];

        const availableParameters = parametersFromPath.map((param, i) => {
            if (!isPlainObject(param)) {
                return;
            }
            param.$$path = `paths.${pathName}.parameters[${i}]`;
            return param;
        });

        each(path, (operation, operationName) => {
            if (
                operation &&
                operation.parameters &&
                Array.isArray(operation.parameters)
            ) {
                availableParameters.push(
                ...operation.parameters.map((param, i) => {
                    if (!isPlainObject(param)) {
                        return;
                    }
                    param.$$path = `paths.${pathName}.${operationName}.parameters[${i}]`;
                    return param;
                })
                );
            }
        });

        // Assertation 3
        const hasBeenSeen = tallyRealPath(pathName);
        if (hasBeenSeen) {
            messages.addMessage(
                `paths.${pathName}`,
                'Equivalent paths are not allowed.',
                'error',
                'equivalent_paths'
            );
        }

        // Assertation 4
        each(parametersFromPath, (parameterDefinition, i) => {
            const nameAndInComboIndex = findIndex(parametersFromPath, {
                name: parameterDefinition.name,
                in: parameterDefinition.in
            });
            // comparing the current index against the first found index is good, because
            // it cuts down on error quantity when only two parameters are involved,
            // i.e. if param1 and param2 conflict, this will only complain about param2.
            // it also will favor complaining about parameters later in the spec, which
            // makes more sense to the user.
            if (i !== nameAndInComboIndex && parameterDefinition.in) {
                messages.addMessage(
                `paths.${pathName}.parameters[${i}]`,
                "Path parameters must have unique 'name' + 'in' properties",
                'error',
                'duplicate_parameter'
                );
            }
        });

        let pathTemplates = pathName.match(templateRegex) || [];
        pathTemplates = pathTemplates.map(str =>
            str.replace('{', '').replace('}', '')
        );

        // Assertation 1
        each(availableParameters, (parameterDefinition, i) => {
            if (
                isPlainObject(parameterDefinition) &&
                parameterDefinition.in === 'path' &&
                pathTemplates.indexOf(parameterDefinition.name) === -1
            ) {
                messages.addMessage(
                    parameterDefinition.$$path || `paths.${pathName}.parameters[${i}]`,
                    `Path parameter was defined but never used: ${
                        parameterDefinition.name
                    }.`,
                    'error',
                    'unused_parameter'
                );
            }
        });

        
        pathTemplates.forEach(parameter => {
            // Assertation 2

            if (parameter === '') {
                // it was originally "{}"
                messages.addMessage(
                    `paths.${pathName}`,
                    'Empty path parameter declarations are not valid',
                    'error',
                    'empty_path_parameter'
                );
            }
        });

    });

    // Assertation 13 : last part => check is one path is ok
    const health_path_unexist = config.health_path_unexist
    if (health_path_unexist != 'off') {
        if (apiHasRecommendedHealthEndpoint) {
            messages.addTypedMessage(
                `paths.${healthEndPoint}`,
                `API healthcheck operation is ${healthEndPoint}.`,
                'info',
                'api_healthcheck',
                'convention',
                'CTMO.STANDARD-CODAGE-20'
            );
        } else if (apiHasAuthorizedHealthEndpoint) {
            messages.addTypedMessage(
                `paths.${healthEndPoint}`,
                `API has a healthcheck operation but it is not the recommended one ('health') : ${healthEndPoint}.`,
                health_path_unexist,
                'api_healthcheck',
                'convention',
                'CTMO.STANDARD-CODAGE-20'
            );
        } else {
            messages.addTypedMessage(
                `paths`,
                `API has no healthcheck operation.`,
                health_path_unexist,
                'api_healthcheck',
                'convention',
                'CTMO.STANDARD-CODAGE-20'
            );
        }
    }

  }

  return messages;
};
