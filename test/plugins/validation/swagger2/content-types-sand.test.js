const expect = require('expect');
const contentTypesValidator = require('../../../../src/plugins/validation/swagger2/semantic-validators/content-types-sand');

describe('validation plugin - semantic - content-types - swagger2', function() {
  
  it('should not complain when json produces and consumes is used', function() {
    const config = {
      operations: {
        wrong_content_type: 'error'
      }
    };

    const spec = {
      consumes: ['application/json'],
      produces: ['application/hal+json'],
      paths: {
        '/CoolPath': {
          post: {
            summary: 'this is a summary',
            operationId: 'operationId',
            parameters: [
              {
                name: 'Parameter',
                in: 'body',
                schema: {
                  required: ['Property'],
                  properties: [
                    {
                      name: 'Property'
                    }
                  ]
                }
              }
            ],
            responses: {
              '200': {
                description: 'content'
              },
              '400': {
                description: 'bad request'
              },
              '500': {
                description: 'internal error'
              }
            }
          }
        }
      }
    };

    const res = contentTypesValidator.validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(0);
  });

  it('should complain when text/json is used or Json with charset', function() {
    const config = {
      operations: {
        wrong_content_type: 'error'
      }
    };

    const spec = {
      consumes: ['application/json','text/json'],
      produces: ['application/json;charset=UTF-8'],
      paths: {
        '/CoolPath': {
          post: {
            summary: 'this is a summary',
            operationId: 'operationId',
            parameters: [
              {
                name: 'Parameter',
                in: 'body',
                schema: {
                  required: ['Property'],
                  properties: [
                    {
                      name: 'Property'
                    }
                  ]
                }
              }
            ],
            responses: {
              '200': {
                description: 'content'
              },
              '400': {
                description: 'bad request'
              },
              '500': {
                description: 'internal error'
              }
            }
          }
        }
      }
    };

    const res = contentTypesValidator.validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(2);
    expect(res.warnings[0].path).toEqual('produces.0');
    expect(res.warnings[0].message).toEqual(`JSON Global produces Content-type must be 'application/json' or 'application/hal+json' or 'application/problem+json', without charset.`);
    expect(res.warnings[1].path).toEqual('consumes.1');
    expect(res.warnings[1].message).toEqual(`JSON Global consumes Content-type must be 'application/json' or 'application/hal+json' or 'application/problem+json', without charset.`);
    expect(res.errors.length).toEqual(0);
  });

  
  it('should complain when text or xml is used', function() {
    const config = {
      operations: {
        wrong_content_type: 'error'
      }
    };

    const spec = {
      consumes: ['text/html'],
      produces: ['application/xml', 'text/xml', 'application/yaml', 'text/plain', 'text/csv', 'application/pdf'],
      paths: {
        '/CoolPath': {
          post: {
            summary: 'this is a summary',
            operationId: 'operationId',
            parameters: [
              {
                name: 'Parameter',
                in: 'body',
                schema: {
                  required: ['Property'],
                  properties: [
                    {
                      name: 'Property'
                    }
                  ]
                }
              }
            ],
            responses: {
              '200': {
                description: 'content'
              },
              '400': {
                description: 'bad request'
              },
              '500': {
                description: 'internal error'
              }
            }
          }
        }
      }
    };

    const res = contentTypesValidator.validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual('consumes.0');
    expect(res.errors[0].message).toEqual(`Global consumes Content-Type must be JSON ('application/json' or 'application/hal+json' or 'application/problem+json').`);
    expect(res.warnings.length).toEqual(6);
    expect(res.warnings[0].path).toEqual('produces.0');
    expect(res.warnings[0].message).toEqual(`Global produces Content-Type should be JSON ('application/json' or 'application/hal+json' or 'application/problem+json'), instead of other allowed content-types ('text/xml' or 'application/xml' or 'application/yaml' or 'text/csv' or 'text/plain' or 'application/pdf').`);
    expect(res.warnings[1].path).toEqual('produces.1');
    expect(res.warnings[1].message).toEqual(`Global produces Content-Type should be JSON ('application/json' or 'application/hal+json' or 'application/problem+json'), instead of other allowed content-types ('text/xml' or 'application/xml' or 'application/yaml' or 'text/csv' or 'text/plain' or 'application/pdf').`);
    expect(res.warnings[2].path).toEqual('produces.2');
    expect(res.warnings[2].message).toEqual(`Global produces Content-Type should be JSON ('application/json' or 'application/hal+json' or 'application/problem+json'), instead of other allowed content-types ('text/xml' or 'application/xml' or 'application/yaml' or 'text/csv' or 'text/plain' or 'application/pdf').`);
    expect(res.warnings[3].path).toEqual('produces.3');
    expect(res.warnings[3].message).toEqual(`Global produces Content-Type should be JSON ('application/json' or 'application/hal+json' or 'application/problem+json'), instead of other allowed content-types ('text/xml' or 'application/xml' or 'application/yaml' or 'text/csv' or 'text/plain' or 'application/pdf').`);
    expect(res.warnings[4].path).toEqual('produces.4');
    expect(res.warnings[4].message).toEqual(`Global produces Content-Type should be JSON ('application/json' or 'application/hal+json' or 'application/problem+json'), instead of other allowed content-types ('text/xml' or 'application/xml' or 'application/yaml' or 'text/csv' or 'text/plain' or 'application/pdf').`);
    expect(res.warnings[5].path).toEqual('produces.5');
    expect(res.warnings[5].message).toEqual(`Global produces Content-Type should be JSON ('application/json' or 'application/hal+json' or 'application/problem+json'), instead of other allowed content-types ('text/xml' or 'application/xml' or 'application/yaml' or 'text/csv' or 'text/plain' or 'application/pdf').`);
    
  });

  it('should complain when consumes or produces are malformed', function() {
    const config = {
      operations: {
        wrong_content_type: 'error'
      }
    };

    const spec = {
      consumes: 'text/html',
      produces: [ 
        {type: 'application/xml'}
      ],
      paths: {
        '/CoolPath': {
          post: {
            summary: 'this is a summary',
            operationId: 'operationId',
            parameters: [
              {
                name: 'Parameter',
                in: 'body',
                schema: {
                  required: ['Property'],
                  properties: [
                    {
                      name: 'Property'
                    }
                  ]
                }
              }
            ],
            responses: {
              '200': {
                description: 'content'
              },
              '400': {
                description: 'bad request'
              },
              '500': {
                description: 'internal error'
              }
            }
          }
        }
      }
    };

    const res = contentTypesValidator.validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].path).toEqual('produces.0');
    expect(res.errors[0].message).toEqual(`Global produces Content-Type must be a string.`);
    expect(res.errors[1].path).toEqual('consumes');
    expect(res.errors[1].message).toEqual(`Global consumes Content-Types must be an array.`);
    expect(res.warnings.length).toEqual(0);
  });

  
});
