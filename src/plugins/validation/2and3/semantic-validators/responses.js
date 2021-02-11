const each = require('lodash/each');
const { walk, isResponseObject } = require('../../../utils');
const headerNameChecker = require('../../../utils/headerNameChecker');
const MessageCarrier = require('../../../utils/messageCarrier');

const INLINE_SCHEMA_MESSAGE =
  'Response schemas should be defined with a named ref.';

module.exports.validate = function({ jsSpec, isOAS3 }, config) {
  const messages = new MessageCarrier();

  walk(jsSpec, [], function(obj, path) {
    const isRef = !!obj.$ref;

    let checkHeaderWithX = 'off';
    let headerCaseConventionValue;
    let checkHeaderCaseConvention = 'off';
    if (config.common) {
        checkHeaderWithX = config.common.header_starting_with_x;
        if (config.common.header_name_case_convention && Array.isArray(config.common.header_name_case_convention)) {
            checkHeaderCaseConvention = config.common.header_name_case_convention[0];
            if (checkHeaderCaseConvention !== 'off') {
                headerCaseConventionValue = config.common.header_name_case_convention[1];
            }
        }
    }

    if (isResponseObject(path, isOAS3) && !isRef) {
      each(obj, (response, responseKey) => {
        if (isOAS3) {
          each(response.content, (mediaType, mediaTypeKey) => {
            const combinedSchemaTypes = ['allOf', 'oneOf', 'anyOf'];

            if (
              mediaType.schema &&
              (mediaTypeKey.startsWith('application/json')
              || mediaTypeKey === 'application/hal+json'
              || mediaTypeKey === 'application/problem+json')
            ) {
              const hasCombinedSchema =
                mediaType.schema.allOf ||
                mediaType.schema.anyOf ||
                mediaType.schema.oneOf;

              if (hasCombinedSchema) {
                combinedSchemaTypes.forEach(schemaType => {
                  if (mediaType.schema[schemaType]) {
                    for (
                      let i = 0;
                      i < mediaType.schema[schemaType].length;
                      i++
                    ) {
                      const hasInlineSchema = !mediaType.schema[schemaType][i]
                        .$ref;
                      if (hasInlineSchema) {
                        messages.addMessage(
                          [
                            ...path,
                            responseKey,
                            'content',
                            mediaTypeKey,
                            'schema',
                            schemaType,
                            i
                          ],
                          INLINE_SCHEMA_MESSAGE,
                          config.responses.inline_response_schema,
                          'inline_response_schema'
                        );
                      }
                    }
                  }
                });
              } else if (!mediaType.schema.$ref) {
                messages.addMessage(
                  [...path, responseKey, 'content', mediaTypeKey, 'schema'],
                  INLINE_SCHEMA_MESSAGE,
                  config.responses.inline_response_schema,
                  'inline_response_schema'
                );
              }
            }
          });

        } else {
          // oas 2 allows extensions for responses, dont validate inside of these
          if (responseKey.startsWith('x-')) {
              return;
          }

          const hasInlineSchema = response.schema && !response.schema.$ref;
          if (hasInlineSchema) {
            messages.addMessage(
              [...path, responseKey, 'schema'],
              INLINE_SCHEMA_MESSAGE,
              config.responses.inline_response_schema,
              'inline_response_schema'
            );
          }
          
        }


        //Checks header naming convention
        if (response.headers) {
            const headers = response.headers;
            if (headers) {
                const headerNames = Object.keys(headers);
                headerNames.forEach(headerName => {
                    headerNameChecker.checkHeaderName(headerName, checkHeaderCaseConvention, headerCaseConventionValue, checkHeaderWithX, [...path, responseKey, 'headers', headerName], messages);
                });
            }
          }

      });
    }
  });

  return messages;
};


