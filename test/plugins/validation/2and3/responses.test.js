const expect = require('expect');
const {
  validate
} = require('../../../../src/plugins/validation/2and3/semantic-validators/responses');

const config = require('../../../../src/.defaultsForValidator').defaults.shared;

describe('validation plugin - semantic - responses', function() {
  
  config.common.header_name_case_convention[0] = 'error';
  config.common.header_starting_with_x = 'error';

  describe('inline response schemas', function() {

    describe('Swagger 2', function() {
      it('should not complain for a valid response', function() {
        const spec = {
          paths: {
            '/stuff': {
              get: {
                summary: 'list stuff',
                operationId: 'listStuff',
                produces: ['application/json'],
                responses: {
                  200: {
                    description: 'successful operation',
                    schema: {
                      $ref: '#/definitions/ListStuffResponseModel'
                    }
                  }
                }
              }
            }
          }
        };

        const res = validate({ jsSpec: spec }, config);
        expect(res.warnings.length).toEqual(0);
        expect(res.errors.length).toEqual(0);
      });

      it('should complain about an inline schema', function() {
        const spec = {
          paths: {
            '/stuff': {
              get: {
                summary: 'list stuff',
                operationId: 'listStuff',
                produces: ['application/json'],
                responses: {
                  200: {
                    description: 'successful operation',
                    schema: {
                      type: 'object',
                      properties: {
                        stuff: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };

        const res = validate({ jsSpec: spec }, config);
        expect(res.warnings.length).toEqual(1);
        expect(res.warnings[0].path).toEqual([
          'paths',
          '/stuff',
          'get',
          'responses',
          '200',
          'schema'
        ]);
        expect(res.warnings[0].message).toEqual(
          'Response schemas should be defined with a named ref.'
        );
        expect(res.errors.length).toEqual(0);
      });

      it('should not complain for a response with no schema', function() {
        const spec = {
          paths: {
            '/stuff': {
              get: {
                summary: 'list stuff',
                operationId: 'listStuff',
                produces: ['application/json'],
                responses: {
                  200: {
                    description: 'successful operation'
                  }
                }
              }
            }
          }
        };

        const res = validate({ jsSpec: spec }, config);
        expect(res.warnings.length).toEqual(0);
        expect(res.errors.length).toEqual(0);
      });

      it('should not complain about a bad pattern within an extension', function() {
        const spec = {
          paths: {
            '/stuff': {
              get: {
                summary: 'list stuff',
                operationId: 'listStuff',
                produces: ['application/json'],
                responses: {
                  'x-response-extension': {
                    description: 'successful operation',
                    schema: {
                      type: 'object',
                      properties: {
                        stuff: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };

        const res = validate({ jsSpec: spec }, config);
        expect(res.warnings.length).toEqual(0);
        expect(res.errors.length).toEqual(0);
      });
    });

    describe('OpenAPI 3', function() {
      it('should not complain for a valid response', function() {
        const spec = {
          paths: {
            '/stuff': {
              get: {
                summary: 'list stuff',
                operationId: 'listStuff',
                responses: {
                  200: {
                    description: 'successful operation',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/ListStuffResponseModel'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };

        const res = validate({ jsSpec: spec, isOAS3: true }, config);
        expect(res.warnings.length).toEqual(0);
        expect(res.errors.length).toEqual(0);
      });

      it('should not complain for a valid response in oneOf', function() {
        const spec = {
          paths: {
            '/stuff': {
              get: {
                summary: 'list stuff',
                operationId: 'listStuff',
                responses: {
                  200: {
                    description: 'successful operation',
                    content: {
                      'application/json': {
                        schema: {
                          oneOf: [
                            {
                              $ref:
                                '#/components/schemas/ListStuffResponseModel'
                            },
                            {
                              $ref: '#/components/schemas/ListStuffSecondModel'
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };

        const res = validate({ jsSpec: spec, isOAS3: true }, config);
        expect(res.warnings.length).toEqual(0);
        expect(res.errors.length).toEqual(0);
      });

      it('should not complain for a valid response in allOf', function() {
        const spec = {
          paths: {
            '/stuff': {
              get: {
                summary: 'list stuff',
                operationId: 'listStuff',
                responses: {
                  200: {
                    description: 'successful operation',
                    content: {
                      'application/json': {
                        schema: {
                          allOf: [
                            {
                              $ref:
                                '#/components/schemas/ListStuffResponseModel'
                            },
                            {
                              $ref: '#/components/schemas/ListStuffSecondModel'
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };

        const res = validate({ jsSpec: spec, isOAS3: true }, config);
        expect(res.warnings.length).toEqual(0);
        expect(res.errors.length).toEqual(0);
      });

      it('should not complain for a valid response in anyOf', function() {
        const spec = {
          paths: {
            '/stuff': {
              get: {
                summary: 'list stuff',
                operationId: 'listStuff',
                responses: {
                  200: {
                    description: 'successful operation',
                    content: {
                      'application/json': {
                        schema: {
                          anyOf: [
                            {
                              $ref:
                                '#/components/schemas/ListStuffResponseModel'
                            },
                            {
                              $ref: '#/components/schemas/ListStuffSecondModel'
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };

        const res = validate({ jsSpec: spec, isOAS3: true }, config);
        expect(res.warnings.length).toEqual(0);
        expect(res.errors.length).toEqual(0);
      });

      it('should complain about an inline schema', function() {
        const spec = {
          paths: {
            '/stuff': {
              get: {
                summary: 'list stuff',
                operationId: 'listStuff',
                responses: {
                  200: {
                    description: 'successful operation',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            stuff: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };

        const res = validate({ jsSpec: spec, isOAS3: true }, config);
        expect(res.warnings.length).toEqual(1);
        expect(res.warnings[0].path).toEqual([
          'paths',
          '/stuff',
          'get',
          'responses',
          '200',
          'content',
          'application/json',
          'schema'
        ]);
        expect(res.warnings[0].message).toEqual(
          'Response schemas should be defined with a named ref.'
        );
        expect(res.errors.length).toEqual(0);
      });

      it('should complain about an inline schema when using oneOf', function() {
        const spec = {
          paths: {
            '/stuff': {
              get: {
                summary: 'list stuff',
                operationId: 'listStuff',
                responses: {
                  200: {
                    description: 'successful operation',
                    content: {
                      'application/json': {
                        schema: {
                          oneOf: [
                            {
                              type: 'object'
                            },
                            {
                              $ref: 'ref1'
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };

        const res = validate({ jsSpec: spec, isOAS3: true }, config);
        expect(res.warnings.length).toEqual(1);
        expect(res.warnings[0].path).toEqual([
          'paths',
          '/stuff',
          'get',
          'responses',
          '200',
          'content',
          'application/json',
          'schema',
          'oneOf',
          0
        ]);
        expect(res.warnings[0].message).toEqual(
          'Response schemas should be defined with a named ref.'
        );
        expect(res.errors.length).toEqual(0);
      });

      it('should complain about an inline schema when using allOf', function() {
        const spec = {
          paths: {
            '/stuff': {
              get: {
                summary: 'list stuff',
                operationId: 'listStuff',
                responses: {
                  200: {
                    description: 'successful operation',
                    content: {
                      'application/json': {
                        schema: {
                          allOf: [
                            {
                              type: 'object'
                            },
                            {
                              $ref: 'ref1'
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };

        const res = validate({ jsSpec: spec, isOAS3: true }, config);
        expect(res.warnings.length).toEqual(1);
        expect(res.warnings[0].path).toEqual([
          'paths',
          '/stuff',
          'get',
          'responses',
          '200',
          'content',
          'application/json',
          'schema',
          'allOf',
          0
        ]);
        expect(res.warnings[0].message).toEqual(
          'Response schemas should be defined with a named ref.'
        );
        expect(res.errors.length).toEqual(0);
      });

      it('should complain about an inline schema when using anyOf', function() {
        const spec = {
          paths: {
            '/stuff': {
              get: {
                summary: 'list stuff',
                operationId: 'listStuff',
                responses: {
                  200: {
                    description: 'successful operation',
                    content: {
                      'application/json': {
                        schema: {
                          anyOf: [
                            {
                              type: 'object'
                            },
                            {
                              $ref: 'ref1'
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };

        const res = validate({ jsSpec: spec, isOAS3: true }, config);
        expect(res.warnings.length).toEqual(1);
        expect(res.warnings[0].path).toEqual([
          'paths',
          '/stuff',
          'get',
          'responses',
          '200',
          'content',
          'application/json',
          'schema',
          'anyOf',
          0
        ]);
        expect(res.warnings[0].message).toEqual(
          'Response schemas should be defined with a named ref.'
        );
        expect(res.errors.length).toEqual(0);
      });

      it('should not complain for a response with no schema', function() {
        const spec = {
          paths: {
            '/stuff': {
              get: {
                summary: 'list stuff',
                operationId: 'listStuff',
                responses: {
                  200: {
                    description: 'successful operation'
                  }
                }
              }
            }
          }
        };

        const res = validate({ jsSpec: spec, isOAS3: true }, config);
        expect(res.warnings.length).toEqual(0);
        expect(res.errors.length).toEqual(0);
      });

      it('should complain when a response component has an inline schema', function() {
        const spec = {
          components: {
            responses: {
              ListStuffResponse: {
                description: 'successful operation',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        stuff: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };

        const res = validate({ jsSpec: spec, isOAS3: true }, config);
        expect(res.warnings.length).toEqual(1);
        expect(res.warnings[0].path).toEqual([
          'components',
          'responses',
          'ListStuffResponse',
          'content',
          'application/json',
          'schema'
        ]);
        expect(res.warnings[0].message).toEqual(
          'Response schemas should be defined with a named ref.'
        );
        expect(res.errors.length).toEqual(0);
      });

      it('should not complain about non-json response that defines an inline schema', function() {
        const config = {
          responses: {
            no_response_codes: 'error',
            no_success_response_codes: 'warning'
          }
        };

        const spec = {
          paths: {
            '/pets': {
              get: {
                summary: 'this is a summary',
                operationId: 'operationId',
                responses: {
                  '400': {
                    description: 'bad request',
                    content: {
                      'plain/text': {
                        schema: {
                          type: 'string',
                          format: 'binary'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };

        const res = validate({ jsSpec: spec }, config);
        expect(res.warnings.length).toEqual(0);
        expect(res.errors.length).toEqual(0);
      });
    });
  });

    describe('headers', function() {
      
        describe('Swagger 2', function() {

            it('should complain for a response with incorrect headers', function() {
                const spec = {
                    paths: {
                        '/stuff': {
                        get: {
                            summary: 'list stuff',
                            operationId: 'listStuff',
                            produces: ['application/json'],
                            responses: {
                            200: {
                                description: 'successful operation',
                                schema: {
                                    $ref: '#/definitions/ListStuffResponseModel'
                                },
                                headers:{
                                    Location: {
                                        type: "string"
                                    },
                                    'X-Test':{
                                        type: "string"
                                    },
                                    toto_test:{
                                        type: "integer"
                                    }
                                }
                            }
                            }
                        }
                        }
                    }
                };

                const res = validate({ jsSpec: spec }, config);
                expect(res.warnings.length).toEqual(0);
                expect(res.errors.length).toEqual(2);
                expect(res.errors[0].message).toEqual("HTTP Header name must not start with 'X-*' : 'X-Test'.");
                expect(res.errors[0].path).toEqual(['paths', '/stuff','get','responses','200','headers','X-Test']);
                expect(res.errors[1].message).toEqual("HTTP Header name must follow case convention: 'toto_test' doesn't respect 'Spinal-FirstLetterUpper-Case'.");
                expect(res.errors[1].path).toEqual(['paths', '/stuff','get','responses','200','headers','toto_test']);
            });

            it('should not complain for a response with correct headers', function() {
                const spec = {
                    paths: {
                        '/stuff': {
                        get: {
                            summary: 'list stuff',
                            operationId: 'listStuff',
                            produces: ['application/json'],
                            responses: {
                            200: {
                                description: 'successful operation',
                                schema: {
                                $ref: '#/definitions/ListStuffResponseModel'
                                },
                                headers:{
                                    Location: {
                                        type: "string"
                                    },
                                    'MyOrga-Authent-Login':{
                                        type: "string"
                                    }
                                }
                            }
                            }
                        }
                        }
                    }
                };

                const res = validate({ jsSpec: spec }, config);
                expect(res.warnings.length).toEqual(0);
                expect(res.errors.length).toEqual(0);
            });

        });

        describe('OpenAPI 3', function() {
            it('should complain for a response with incorrect headers', function() {
                const spec = {
                    paths: {
                        '/stuff': {
                            get: {
                                summary: 'list stuff',
                                operationId: 'listStuff',
                                responses: {
                                    '200': {
                                        description: 'successful operation',
                                        content: {
                                            'multipart/mixed': {
                                                schema: {
                                                $ref: '#/definitions/ListStuffResponseModel'
                                                },
                                            }
                                        },
                                        headers:{
                                            Location: {
                                                schema:{
                                                    type: "string"}
                                            },
                                            'X-Test':{
                                                schema: {
                                                    type: "string"}
                                            },
                                            toto_test:{
                                                schema:{
                                                    type: "integer"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
                

                const res = validate({ jsSpec: spec, isOAS3: true  }, config);
                expect(res.warnings.length).toEqual(0);
                expect(res.errors.length).toEqual(2);
                expect(res.errors[0].message).toEqual("HTTP Header name must not start with 'X-*' : 'X-Test'.");
                expect(res.errors[0].path).toEqual(['paths', '/stuff','get','responses','200','headers','X-Test']);
                expect(res.errors[1].message).toEqual("HTTP Header name must follow case convention: 'toto_test' doesn't respect 'Spinal-FirstLetterUpper-Case'.");
                expect(res.errors[1].path).toEqual(['paths', '/stuff','get','responses','200','headers','toto_test']);
            });

            it('should not complain for a response with correct headers', function() {
                const spec = {
                    paths: {
                        '/stuff': {
                            get: {
                                summary: 'list stuff',
                                operationId: 'listStuff',
                                responses: {
                                    '200': {
                                        description: 'successful operation',
                                        content: {
                                            'multipart/mixed': {
                                                schema: {
                                                $ref: '#/definitions/ListStuffResponseModel'
                                                },
                                            }
                                        },
                                        headers:{
                                            Location: {
                                                schema:{
                                                    type: "integer"}
                                            },
                                            'MyOrga-Authent-Login':{
                                                schema: {
                                                    type: "string"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };

                const res = validate({ jsSpec: spec, isOAS3: true  }, config);
                expect(res.warnings.length).toEqual(0);
                expect(res.errors.length).toEqual(0);
            });
        });
  });
});
