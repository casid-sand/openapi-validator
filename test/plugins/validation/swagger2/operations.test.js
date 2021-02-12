const expect = require("expect");
const {
  validate
} = require('../../../../src/plugins/validation/swagger2/semantic-validators/operations');
const configSwagger2 = require('../../../../src/.defaultsForValidator').defaults.swagger2;

describe('validation plugin - semantic - operations', () => {
  describe("Operations cannot have both a 'body' parameter and a 'formData' parameter", () => {
    it('should complain about a request with 2 body parameters', function() {
      const spec = {
        paths: {
          '/CoolPath': {
            put: {
              consumes: ['consumes'],
              summary: 'this is a summary',
              parameters: [
                {
                  name: 'FirstBodyParameter',
                  in: 'body',
                  schema: {
                    required: ['Property'],
                    properties: [
                      {
                        name: 'Property'
                      }
                    ]
                  }
                },
                {
                  name: 'formDataParam',
                  in: 'formData',
                  schema: {
                    required: ['Property'],
                    properties: [
                      {
                        name: 'Property'
                      }
                    ]
                  }
                }
              ]
            }
          }
        }
      };

      const res = validate({ resolvedSpec: spec, jsSpec: spec });
      expect(res.errors.length).toEqual(1);
      expect(res.errors[0].path).toEqual('paths./CoolPath.put.parameters');
      expect(res.errors[0].message).toEqual('Operations cannot have both a "body" parameter and "formData" parameter.');
      expect(res.warnings.length).toEqual(0);
    });

    it('should not complain about a request with a formData parameter and other parameters', function() {
      const spec = {
        paths: {
          '/CoolPath': {
            put: {
              consumes: ['consumes'],
              summary: 'this is a summary',
              parameters: [
                {
                  name: 'FirstBodyParameter',
                  in: 'formData',
                  schema: {
                    required: ['Property'],
                    properties: [
                      {
                        name: 'Property'
                      }
                    ]
                  }
                },
                {
                  name: 'queryParameter',
                  in: 'query',
                  schema: {
                    required: ['Property'],
                    properties: [
                      {
                        name: 'Property'
                      }
                    ]
                  }
                },
                {
                  name: 'pathParameter',
                  in: 'path',
                  schema: {
                    required: ['Property'],
                    properties: [
                      {
                        name: 'Property'
                      }
                    ]
                  }
                },
                {
                  name: 'headerParameter',
                  in: 'query',
                  schema: {
                    required: ['Property'],
                    properties: [
                      {
                        name: 'Property'
                      }
                    ]
                  }
                }
              ]
            }
          }
        }
      };

      const res = validate({ resolvedSpec: spec, jsSpec: spec });
      expect(res.errors.length).toEqual(0);
      expect(res.warnings.length).toEqual(0);
    });
  });

  describe('Operations must have only one body parameter', () => {
    it('should complain about a request with 2 body parameters', function() {
      const spec = {
        paths: {
          '/CoolPath': {
            put: {
              consumes: ['consumes'],
              summary: 'this is a summary',
              parameters: [
                {
                  name: 'FirstBodyParameter',
                  in: 'body',
                  schema: {
                    required: ['Property'],
                    properties: [
                      {
                        name: 'Property'
                      }
                    ]
                  }
                },
                {
                  name: 'SecondBadBodyParameter',
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
              ]
            }
          }
        }
      };

      const res = validate({ resolvedSpec: spec, jsSpec: spec });
      expect(res.errors.length).toEqual(1);
      expect(res.errors[0].path).toEqual('paths./CoolPath.put.parameters');
      expect(res.errors[0].message).toEqual('Operations must have no more than one body parameter.');
      expect(res.warnings.length).toEqual(0);
    });

    it('should not complain about a request with one body parameter and other parameters', function() {
      const spec = {
        paths: {
          '/CoolPath': {
            put: {
              consumes: ['consumes'],
              summary: 'this is a summary',
              parameters: [
                {
                  name: 'FirstBodyParameter',
                  in: 'body',
                  schema: {
                    required: ['Property'],
                    properties: [
                      {
                        name: 'Property'
                      }
                    ]
                  }
                },
                {
                  name: 'queryParameter',
                  in: 'query',
                  schema: {
                    required: ['Property'],
                    properties: [
                      {
                        name: 'Property'
                      }
                    ]
                  }
                },
                {
                  name: 'pathParameter',
                  in: 'path',
                  schema: {
                    required: ['Property'],
                    properties: [
                      {
                        name: 'Property'
                      }
                    ]
                  }
                },
                {
                  name: 'headerParameter',
                  in: 'query',
                  schema: {
                    required: ['Property'],
                    properties: [
                      {
                        name: 'Property'
                      }
                    ]
                  }
                }
              ]
            }
          }
        }
      };

      const res = validate({ resolvedSpec: spec, jsSpec: spec });
      expect(res.errors.length).toEqual(0);
      expect(res.warnings.length).toEqual(0);
    });
    
  });

});
