// Assertation 1. Request body objects must have a `content` property
// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#requestBodyObject
// covered by Spectral's oas3-schema rule

// Assertation 2. Operations with non-form request bodies should set the `x-codegen-request-body-name`
// annotation (for code generation purposes)

// Assertation 3. Request bodies with application/json content should not use schema
// type: string, format: binary.

// Assertation 4:
// check if response content type is in JSON

// Assertation 5:
// check if request content type is in JSON

const pick = require('lodash/pick');
const each = require('lodash/each');
const { hasRefProperty } = require('../../../utils');
const MessageCarrier = require('../../../utils/messageCarrier');
const findOctetSequencePaths = require('../../../utils/findOctetSequencePaths')
  .findOctetSequencePaths;
const contentTypesChecker = require('../../../utils/contentTypesChecker');

module.exports.validate = function({ resolvedSpec, jsSpec }, config) {
  const messages = new MessageCarrier();

  const configSchemas = config.schemas;

  const REQUEST_BODY_NAME = 'x-codegen-request-body-name';

  // get, head, and delete are not in this list because they are not allowed
  // to have request bodies
  const allowedOps = ['post', 'put', 'patch', 'options', 'trace'];

  const allOps = ['post', 'put', 'patch', 'options', 'trace', 'head', 'get', 'delete'];

  each(resolvedSpec.paths, (path, pathName) => {
    const operations = pick(path, allowedOps);
    each(operations, (op, opName) => {
      if (!op || op['x-sdk-exclude'] === true) {
        return;
      }
      if (op.requestBody) {
        const requestBodyContent = op.requestBody.content;
        const requestBodyMimeTypes =
          op.requestBody.content && Object.keys(requestBodyContent);
        if (requestBodyContent && requestBodyMimeTypes.length) {
          // request body has content
          const firstMimeType = requestBodyMimeTypes[0]; // code generation uses the first mime type
          const oneContentType = requestBodyMimeTypes.length === 1;
          const isJson = contentTypesChecker.contentTypeIsJson(firstMimeType);

          const hasArraySchema =
            requestBodyContent[firstMimeType].schema &&
            requestBodyContent[firstMimeType].schema.type === 'array';

          const hasRequestBodyName =
            op[REQUEST_BODY_NAME] && op[REQUEST_BODY_NAME].trim().length;

          // non-array json responses with only one content type will have
          // the body exploded in sdk generation, no need for name
          const explodingBody = oneContentType && isJson && !hasArraySchema;

          // referenced request bodies have names
          const hasReferencedRequestBody = hasRefProperty(jsSpec, [
            'paths',
            pathName,
            opName,
            'requestBody'
          ]);

          // form params do not need names
          if (
            !isFormParameter(firstMimeType) &&
            !explodingBody &&
            !hasReferencedRequestBody &&
            !hasRequestBodyName
          ) {
            messages.addMessage(
              `paths.${pathName}.${opName}`,
              'Operations with non-form request bodies should set a name with the x-codegen-request-body-name annotation.',
              config.operations.no_request_body_name,
              'no_request_body_name'
            );
          }

          // Assertation 3
          const binaryStringStatus = configSchemas.json_or_param_binary_string;
          if (binaryStringStatus !== 'off') {
            for (const mimeType of requestBodyMimeTypes) {
                const requestBodyContentDefinition = requestBodyContent[mimeType];
                if (contentTypesChecker.contentTypeIsJson(mimeType)) {
                    const schemaPath = `paths.${pathName}.${opName}.requestBody.content.${mimeType}.schema`;
                    const octetSequencePaths = findOctetSequencePaths(
                        requestBodyContentDefinition.schema,
                        schemaPath
                    );
                    for (const path of octetSequencePaths) {
                        messages.addMessage(
                            path,
                            'JSON request/response bodies should not contain binary (type: string, format: binary) values.',
                            binaryStringStatus,
                            'json_or_param_binary_string'
                        );
                    }
                }
            }
          }

        }
      }


    });

    const allOperations = pick(path, allOps);
    each(allOperations, (op, opName) => {

      //Assertation 4 and 5
      if (config.operations && config.operations.wrong_content_type) {
        const checkJSon = config.operations.wrong_content_type;
        if (checkJSon != 'off') {
          const responsesCodes = op.responses;
          if (responsesCodes !== null && responsesCodes !== undefined) {
            const responseCodesKeys = Object.keys(responsesCodes);
            responseCodesKeys.forEach(responseCode => {
              const responsesContents = op.responses[responseCode].content;
              if (responsesContents !== null && responsesContents !== undefined) {
                const responsesContentsKeys = Object.keys(responsesContents);
                responsesContentsKeys.forEach(responseContent => {

                    contentTypesChecker.validateContentType(responseContent, checkJSon, 'Response', `paths.${pathName}.${opName}.responses.${responseCode}.content.${responseContent}`, messages);

                });
              }
            });
          }

          const requestBody = op.requestBody
          if (requestBody !== undefined && typeof requestBody === 'object') {
            const requestContents = op.requestBody.content;
            if (requestContents !== null && requestContents !== undefined) {
              const requestContentsKeys = Object.keys(requestContents);
              requestContentsKeys.forEach(requestContent => {
                contentTypesChecker.validateContentType(requestContent, checkJSon, 'Request body', `paths.${pathName}.${opName}.requestBody.content.${requestContent}`, messages);
              });
            }
          }

        }

      }

    });


  });

  

  return messages;
};

function isFormParameter(mimeType) {
  const formDataMimeTypes = [
    'multipart/form-data',
    'application/x-www-form-urlencoded',
    'application/octet-stream'
  ];
  return formDataMimeTypes.includes(mimeType);
}
