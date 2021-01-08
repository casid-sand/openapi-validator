const expect = require('expect');
const {
  validate
} = require('../../../../src/plugins/validation/2and3/semantic-validators/parameters-ibm');

const config = require('../../../../src/.defaultsForValidator').defaults.shared;

const configWithAlternative = {
  parameters: {
        "param_name_case_convention": [
            "error",
            "k8s_camel_case"
        ],
        "param_name_alternative_case_convention": [
            "warning",
            "lower_snake_case"
        ]
    }
};

describe('validation plugin - semantic - parameters-ibm', () => {
  describe('Swagger 2', () => {
    it('should return an error when a parameter does not have a description', () => {
      const spec = {
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  name: 'name',
                  in: 'query',
                  type: 'string'
                }
              ]
            }
          }
        }
      };

      const res = validate({ jsSpec: spec }, config);
      expect(res.warnings.length).toEqual(0);
      expect(res.errors.length).toEqual(1);
      expect(res.errors[0].path).toEqual([
        'paths',
        '/pets',
        'get',
        'parameters',
        '0'
      ]);
      expect(res.errors[0].message).toEqual(
        'Parameter objects must have a `description` field.'
      );
    });

    it('should return an error when snake case is not used', () => {
      const spec = {
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  name: 'camelCase',
                  in: 'query',
                  description: 'description',
                  type: 'string'
                }
              ]
            }
          }
        }
      };

      const res = validate({ jsSpec: spec }, config);
      expect(res.errors.length).toEqual(1);
      expect(res.warnings.length).toEqual(0);
      expect(res.errors[0].path).toEqual([
        'paths',
        '/pets',
        'get',
        'parameters',
        '0'
      ]);
      expect(res.errors[0].message).toEqual(
        "Parameter names must follow case convention: 'lower_snake_case'."
      );
    });

    it('should not return a snake case error when "in" is set to "header" ', () => {
      const spec = {
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  name: 'camelCase',
                  in: 'header',
                  description: 'description',
                  type: 'string'
                }
              ]
            }
          }
        }
      };

      const res = validate({ jsSpec: spec }, config);
      expect(res.errors.length).toEqual(0);
      expect(res.warnings.length).toEqual(0);
    });

    it('should not return a case_convention error when parameter is deprecated', () => {
      const spec = {
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  name: 'camelCase',
                  in: 'query',
                  description: 'description',
                  type: 'string',
                  deprecated: true
                }
              ]
            }
          }
        }
      };

      const res = validate({ jsSpec: spec }, config);
      expect(res.errors.length).toEqual(0);
      expect(res.warnings.length).toEqual(0);
    });

    it('should not validate within extensions', () => {
      const spec = {
        paths: {
          '/pets': {
            get: {
              'x-sdk-extension': {
                parameters: {
                  example: [
                    {
                      name: 'notAGoodName',
                      description: '     ',
                      in: 'query',
                      type: 'number',
                      format: 'int32'
                    }
                  ]
                }
              }
            }
          }
        }
      };

      const res = validate({ jsSpec: spec }, config);
      expect(res.errors.length).toEqual(0);
      expect(res.warnings.length).toEqual(0);
    });

    it('should return an error when a parameter defines a content or accept type ', () => {
      const spec = {
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  name: 'name',
                  in: 'query',
                  type: 'string',
                  description: 'good description'
                },
                {
                  name: 'Accept',
                  in: 'header',
                  description:
                    'bad parameter because it specifies an accept type',
                  required: false,
                  type: 'string',
                  enum: ['application/json', 'application/octet-stream']
                },
                {
                  name: 'content-Type',
                  in: 'header',
                  required: false,
                  type: 'string',
                  description: 'another bad parameter'
                }
              ]
            }
          }
        }
      };

      const res = validate({ jsSpec: spec }, config);
      expect(res.warnings.length).toEqual(0);
      expect(res.errors.length).toEqual(2);
      expect(res.errors[0].path).toEqual([
        'paths',
        '/pets',
        'get',
        'parameters',
        '1'
      ]);
      expect(res.errors[0].message).toEqual(
        'Parameters must not explicitly define `Accept`. Rely on the `produces` field to specify accept-type.'
      );
      expect(res.errors[1].path).toEqual([
        'paths',
        '/pets',
        'get',
        'parameters',
        '2'
      ]);
      expect(res.errors[1].message).toEqual(
        'Parameters must not explicitly define `Content-Type`. Rely on the `consumes` field to specify content-type.'
      );
    });

    it('should flag a required parameter that specifies a default value', () => {
      const spec = {
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  name: 'tags',
                  in: 'query',
                  required: true,
                  description: 'tags to filter by',
                  type: 'string',
                  default: 'reptile'
                }
              ]
            }
          }
        }
      };

      const res = validate({ jsSpec: spec }, config);
      expect(res.warnings.length).toEqual(1);
      expect(res.warnings[0].path).toEqual([
        'paths',
        '/pets',
        'get',
        'parameters',
        '0'
      ]);
      expect(res.warnings[0].message).toEqual(
        'Required parameters should not specify default values.'
      );
      expect(res.errors.length).toEqual(0);
    });

    it('should not flag an optional parameter that specifies a default value', () => {
      const spec = {
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  name: 'tags',
                  in: 'query',
                  required: false,
                  description: 'tags to filter by',
                  type: 'string',
                  default: 'reptile'
                }
              ]
            }
          }
        }
      };

      const res = validate({ jsSpec: spec }, config);
      expect(res.warnings.length).toEqual(0);
      expect(res.errors.length).toEqual(0);
    });

    it('should not return an error for formData parameters of type file', () => {
      const spec = {
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  name: 'file',
                  in: 'formData',
                  type: 'file',
                  required: true,
                  description: 'A file passed in formData'
                }
              ]
            }
          }
        }
      };

      const res = validate({ jsSpec: spec, isOAS3: false }, config);
      expect(res.errors.length).toEqual(0);
      expect(res.warnings.length).toEqual(0);
    });

    it('should return an error for bad parameters that live in the top level', () => {
      const spec = {
        parameters: [
          {
            name: 'someparam',
            in: 'header',
            type: 'string',
            required: true
          }
        ]
      };

      const res = validate({ jsSpec: spec, isOAS3: false }, config);
      expect(res.errors.length).toEqual(1);
      expect(res.errors[0].message).toEqual(
        'Parameter objects must have a `description` field.'
      );
      expect(res.warnings.length).toEqual(0);
    });

    it('should return errors and warnings for bad case parameters with alternative case', () => {     
      
      const spec = {
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  name: 'someparam',
                  in: 'query',
                  type: 'string',
                  description: 'test',
                  required: true
                },
                {
                  name: 'camelParam',
                  in: 'query',
                  type: 'string',
                  description: 'test',
                  required: true
                },
                {
                  name: 'filter[camelParam]',
                  in: 'query',
                  type: 'string',
                  description: 'test',
                  required: true
                },
                {
                  name: 'snake_param',
                  in: 'query',
                  type: 'string',
                  description: 'test',
                  required: true
                },
                {
                  name: 'filter[snake_param]',
                  in: 'query',
                  type: 'string',
                  description: 'test',
                  required: true
                },
                {
                  name: 'spinal-param',
                  in: 'query',
                  type: 'string',
                  description: 'test',
                  required: true
                },
                {
                  name: 'filter[spinal-param]',
                  in: 'query',
                  type: 'string',
                  description: 'test',
                  required: true
                },
                {
                  "$ref": "#/parameters/someparamdef"
                },
                {
                  "$ref": "#/parameters/camelparamdef"
                },
                {
                  "$ref": "#/parameters/filtercamelparamdef"
                },
                {
                  "$ref": "#/parameters/snakeparamdef"
                },
                {
                  "$ref": "#/parameters/filtersnakeparamdef"
                },
                {
                  "$ref": "#/parameters/spinalparamdef"
                },
                {
                  "$ref": "#/parameters/filterspinalparamdef"
                }
              ]
            }
          }
        },
        parameters: {
            someparamdef: {
              name: 'someparamdef',
              in: 'query',
              type: 'string',
              description: 'test',
              required: true
            },
            camelparamdef: {
              name: 'camelParamDef',
              in: 'query',
              type: 'string',
              description: 'test',
              required: true
            },
            filtercamelparamdef: {
              name: 'filter[camelParamDef]',
              in: 'query',
              type: 'string',
              description: 'test',
              required: true
            },
            snakeparamdef: {
              name: 'snake_param_def',
              in: 'query',
              type: 'string',
              description: 'test',
              required: true
            },
            filtersnakeparamdef: {
              name: 'filter[snake_param_def]',
              in: 'query',
              type: 'string',
              description: 'test',
              required: true
            },
            spinalparamdef: {
              name: 'spinal-param-def',
              in: 'query',
              type: 'string',
              description: 'test',
              required: true
            },
            filterspinalparamdef: {
              name: 'filter[spinal-param-def]',
              in: 'query',
              type: 'string',
              description: 'test',
              required: true
            }
        }
      };

      const res = validate({ jsSpec: spec, isOAS3: false }, configWithAlternative);
      expect(res.errors.length).toEqual(4);      
      expect(res.errors[0].path).toEqual(["paths", "/pets", "get", "parameters", "5"]);
      expect(res.errors[0].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' recommended, or eventually 'lower_snake_case'.");
      expect(res.errors[1].path).toEqual(["paths", "/pets", "get", "parameters", "6"]);
      expect(res.errors[1].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' recommended, or eventually 'lower_snake_case'.");
      expect(res.errors[2].path).toEqual(["parameters", "spinalparamdef"]);
      expect(res.errors[2].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' recommended, or eventually 'lower_snake_case'.");
      expect(res.errors[3].path).toEqual(["parameters", "filterspinalparamdef"]);
      expect(res.errors[3].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' recommended, or eventually 'lower_snake_case'.");
      expect(res.warnings.length).toEqual(4);
      expect(res.warnings[0].path).toEqual(["paths", "/pets", "get", "parameters", "3"]);
      expect(res.warnings[0].message).toEqual("Parameter names should follow case convention: 'kubernetesAPICase' recommended.");
      expect(res.warnings[1].path).toEqual(["paths", "/pets", "get", "parameters", "4"]);
      expect(res.warnings[1].message).toEqual("Parameter names should follow case convention: 'kubernetesAPICase' recommended.");
      expect(res.warnings[2].path).toEqual(["parameters", "snakeparamdef"]);
      expect(res.warnings[2].message).toEqual("Parameter names should follow case convention: 'kubernetesAPICase' recommended.");
      expect(res.warnings[3].path).toEqual(["parameters", "filtersnakeparamdef"]);
      expect(res.warnings[3].message).toEqual("Parameter names should follow case convention: 'kubernetesAPICase' recommended.");
    });

    it('should return errors for bad case parameters with alternative case', () => {
     
      configWithAlternative.parameters.param_name_alternative_case_convention[0] = 'error';

      const spec = {
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  name: 'someparam',
                  in: 'query',
                  type: 'string',
                  description: 'test',
                  required: true
                },
                {
                  name: 'camelParam',
                  in: 'query',
                  type: 'string',
                  description: 'test',
                  required: true
                },
                {
                  name: 'filter[camelParam]',
                  in: 'query',
                  type: 'string',
                  description: 'test',
                  required: true
                },
                {
                  name: 'snake_param',
                  in: 'query',
                  type: 'string',
                  description: 'test',
                  required: true
                },
                {
                  name: 'filter[snake_param]',
                  in: 'query',
                  type: 'string',
                  description: 'test',
                  required: true
                },
                {
                  name: 'spinal-param',
                  in: 'query',
                  type: 'string',
                  description: 'test',
                  required: true
                },
                {
                  name: 'filter[spinal-param]',
                  in: 'query',
                  type: 'string',
                  description: 'test',
                  required: true
                },
                {
                  "$ref": "#/parameters/someparamdef"
                },
                {
                  "$ref": "#/parameters/camelparamdef"
                },
                {
                  "$ref": "#/parameters/filtercamelparamdef"
                },
                {
                  "$ref": "#/parameters/snakeparamdef"
                },
                {
                  "$ref": "#/parameters/filtersnakeparamdef"
                },
                {
                  "$ref": "#/parameters/spinalparamdef"
                },
                {
                  "$ref": "#/parameters/filterspinalparamdef"
                }
              ]
            }
          }
        },
        parameters: {
            someparamdef: {
              name: 'someparamdef',
              in: 'query',
              type: 'string',
              description: 'test',
              required: true
            },
            camelparamdef: {
              name: 'camelParamDef',
              in: 'query',
              type: 'string',
              description: 'test',
              required: true
            },
            filtercamelparamdef: {
              name: 'filter[camelParamDef]',
              in: 'query',
              type: 'string',
              description: 'test',
              required: true
            },
            snakeparamdef: {
              name: 'snake_param_def',
              in: 'query',
              type: 'string',
              description: 'test',
              required: true
            },
            filtersnakeparamdef: {
              name: 'filter[snake_param_def]',
              in: 'query',
              type: 'string',
              description: 'test',
              required: true
            },
            spinalparamdef: {
              name: 'spinal-param-def',
              in: 'query',
              type: 'string',
              description: 'test',
              required: true
            },
            filterspinalparamdef: {
              name: 'filter[spinal-param-def]',
              in: 'query',
              type: 'string',
              description: 'test',
              required: true
            }
        }
      };

      const res = validate({ jsSpec: spec, isOAS3: false }, configWithAlternative);
      expect(res.errors.length).toEqual(4);
      expect(res.errors[0].path).toEqual(["paths", "/pets", "get", "parameters", "5"]);
      expect(res.errors[0].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' or 'lower_snake_case'.");
      expect(res.errors[1].path).toEqual(["paths", "/pets", "get", "parameters", "6"]);
      expect(res.errors[1].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' or 'lower_snake_case'.");
      expect(res.errors[2].path).toEqual(["parameters", "spinalparamdef"]);
      expect(res.errors[2].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' or 'lower_snake_case'.");
      expect(res.errors[3].path).toEqual(["parameters", "filterspinalparamdef"]);
      expect(res.errors[3].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' or 'lower_snake_case'.");
      expect(res.warnings.length).toEqual(0);
    });
  });

  describe('OpenAPI 3', () => {
    it('should not complain about a property named parameters that is not a parameter object', () => {
      const spec = {
        components: {
          responses: {
            parameters: {
              description: 'successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      parameters: {
                        type: 'string',
                        description: 'this is a description',
                        additionalProperties: {}
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

    it('should return an error when a parameter defines content-type, accept, or authorization', () => {
      const spec = {
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  name: 'name',
                  in: 'query',
                  schema: {
                    type: 'string'
                  },
                  description: 'good description'
                },
                {
                  name: 'ACCEPT',
                  in: 'header',
                  description:
                    'bad parameter because it specifies an accept type',
                  required: false,
                  schema: {
                    type: 'string'
                  }
                },
                {
                  name: 'content-type',
                  in: 'header',
                  required: false,
                  schema: {
                    type: 'string'
                  },
                  description: 'another bad parameter'
                },
                {
                  name: 'Authorization',
                  in: 'header',
                  description: 'Identity Access Management (IAM) bearer token.',
                  required: false,
                  schema: {
                    type: 'string'
                  }
                }
              ]
            }
          }
        }
      };

      const res = validate({ jsSpec: spec, isOAS3: true }, config);
      expect(res.warnings.length).toEqual(1);
      expect(res.errors.length).toEqual(2);
      expect(res.errors[0].path).toEqual([
        'paths',
        '/pets',
        'get',
        'parameters',
        '1'
      ]);
      expect(res.errors[0].message).toEqual(
        'Parameters must not explicitly define `Accept`. Rely on the `content` field of a response object to specify accept-type.'
      );
      expect(res.errors[1].path).toEqual([
        'paths',
        '/pets',
        'get',
        'parameters',
        '2'
      ]);
      expect(res.errors[1].message).toEqual(
        'Parameters must not explicitly define `Content-Type`. Rely on the `content` field of a request body or response object to specify content-type.'
      );
      expect(res.warnings[0].path).toEqual([
        'paths',
        '/pets',
        'get',
        'parameters',
        '3'
      ]);
      expect(res.warnings[0].message).toEqual(
        'Parameters must not explicitly define `Authorization`. Rely on the `securitySchemes` and `security` fields to specify authorization methods. This check will be converted to an `error` in an upcoming release.'
      );
    });

    it('should return an error when a parameter does not have a description', () => {
      const spec = {
        components: {
          parameters: {
            BadParam: {
              in: 'query',
              name: 'bad_query_param',
              schema: {
                type: 'string'
              }
            }
          }
        }
      };

      const res = validate({ jsSpec: spec, isOAS3: true }, config);
      expect(res.warnings.length).toEqual(0);
      expect(res.errors.length).toEqual(1);
      expect(res.errors[0].path).toEqual([
        'components',
        'parameters',
        'BadParam'
      ]);
      expect(res.errors[0].message).toEqual(
        'Parameter objects must have a `description` field.'
      );
    });

    it('should flag a required parameter that specifies a default value', () => {
      const spec = {
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  name: 'tags',
                  in: 'query',
                  required: true,
                  description: 'tags to filter by',
                  schema: {
                    type: 'string',
                    default: 'reptile'
                  }
                }
              ]
            }
          }
        }
      };

      const res = validate({ jsSpec: spec, isOAS3: true }, config);
      expect(res.warnings.length).toEqual(1);
      expect(res.warnings[0].path).toEqual([
        'paths',
        '/pets',
        'get',
        'parameters',
        '0'
      ]);
      expect(res.warnings[0].message).toEqual(
        'Required parameters should not specify default values.'
      );
      expect(res.errors.length).toEqual(0);
    });

    it('should not flag an optional parameter that does not specify a default value', () => {
      const spec = {
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  name: 'tags',
                  in: 'query',
                  description: 'tags to filter by',
                  schema: {
                    type: 'string'
                  }
                }
              ]
            }
          }
        }
      };

      const res = validate({ jsSpec: spec, isOAS3: true }, config);
      expect(res.warnings.length).toEqual(0);
      expect(res.errors.length).toEqual(0);
    });

    it('should complain about parameters not defined properly in a path item ', () => {
      const spec = {
        paths: {
          '/pets': {
            parameters: [
              {
                name: 'tags',
                in: 'query',
                schema: {
                  type: 'string',
                  format: 'byte'
                }
              }
            ]
          }
        }
      };

      const res = validate({ jsSpec: spec, isOAS3: true }, config);
      expect(res.warnings.length).toEqual(0);
      expect(res.errors.length).toEqual(1);
      expect(res.errors[0].message).toEqual(
        'Parameter objects must have a `description` field.'
      );
    });

    it('should return errors and warnings for bad case parameters with alternative case', () => {     
      
      configWithAlternative.parameters.param_name_alternative_case_convention[0] = 'warning';

      const spec = {
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  name: 'goodparam',
                  in: 'query',
                  required: true,
                  description: 'tags to filter by',
                  schema: {
                    type: 'string',
                  }
                },
                {
                  name: 'camelParam',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  description: 'test',
                  required: true
                },
                {
                  name: 'filter[camelParam]',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  description: 'test',
                  required: true
                },
                {
                  name: 'snake_param',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  description: 'test',
                  required: true
                },
                {
                  name: 'filter[snake_param]',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  description: 'test',
                  required: true
                },
                {
                  name: 'spinal-param',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  description: 'test',
                  required: true
                },
                {
                  name: 'filter[spinal-param]',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  description: 'test',
                  required: true
                },
                {
                  $ref: "#/components/parameters/goodparamdef"
                },
                {
                  $ref: "#/components/parameters/camelparamdef"
                },
                {
                  $ref: "#/components/parameters/filtercamelparamdef"
                },
                {
                  $ref: "#/components/parameters/snakeparamdef"
                },
                {
                  $ref: "#/components/parameters/filtersnakeparamdef"
                },
                {
                  $ref: "#/components/parameters/spinalparamdef"
                },
                {
                  $ref: "#/components/parameters/filterspinalparamdef"
                }
              ]
            }
          }
        },
        components: {
          parameters: {
            goodparamdef: {
              in: 'query',
              name: 'goodparamdef',
              schema: {
                type: 'string'
              }
            },
            camelparamdef: {
              name: 'camelParamDef',
              in: 'query',
              schema: {
                type: 'string',
              },
              description: 'test',
              required: true
            },
            filtercamelparamdef: {
              name: 'filter[camelParamDef]',
              in: 'query',
              schema: {
                type: 'string',
              },
              description: 'test',
              required: true
            },
            snakeparamdef: {
              name: 'snake_param_def',
              in: 'query',
              schema: {
                type: 'string',
              },
              description: 'test',
              required: true
            },
            filtersnakeparamdef: {
              name: 'filter[snake_param_def]',
              in: 'query',
              schema: {
                type: 'string',
              },
              description: 'test',
              required: true
            },
            spinalparamdef: {
              name: 'spinal-param-def',
              in: 'query',
              schema: {
                type: 'string',
              },
              description: 'test',
              required: true
            },
            filterspinalparamdef: {
              name: 'filter[spinal-param-def]',
              in: 'query',
              schema: {
                type: 'string',
              },
              description: 'test',
              required: true
            }
          }
        }
      };

      const res = validate({ jsSpec: spec, isOAS3: true }, configWithAlternative);
      expect(res.errors.length).toEqual(4);
      expect(res.errors[0].path).toEqual(["paths", "/pets", "get", "parameters", "5"]);
      expect(res.errors[0].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' recommended, or eventually 'lower_snake_case'.");
      expect(res.errors[1].path).toEqual(["paths", "/pets", "get", "parameters", "6"]);
      expect(res.errors[1].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' recommended, or eventually 'lower_snake_case'.");
      expect(res.errors[2].path).toEqual(["components", "parameters", "spinalparamdef"]);
      expect(res.errors[2].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' recommended, or eventually 'lower_snake_case'.");
      expect(res.errors[3].path).toEqual(["components", "parameters", "filterspinalparamdef"]);
      expect(res.errors[3].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' recommended, or eventually 'lower_snake_case'.");
      expect(res.warnings.length).toEqual(4);
      expect(res.warnings[0].path).toEqual(["paths", "/pets", "get", "parameters", "3"]);
      expect(res.warnings[0].message).toEqual("Parameter names should follow case convention: 'kubernetesAPICase' recommended.");
      expect(res.warnings[1].path).toEqual(["paths", "/pets", "get", "parameters", "4"]);
      expect(res.warnings[1].message).toEqual("Parameter names should follow case convention: 'kubernetesAPICase' recommended.");
      expect(res.warnings[2].path).toEqual(["components", "parameters", "snakeparamdef"]);
      expect(res.warnings[2].message).toEqual("Parameter names should follow case convention: 'kubernetesAPICase' recommended.");
      expect(res.warnings[3].path).toEqual(["components", "parameters", "filtersnakeparamdef"]);
      expect(res.warnings[3].message).toEqual("Parameter names should follow case convention: 'kubernetesAPICase' recommended.");
    });

    it('should return errors for bad case parameters with alternative case', () => {
     
      configWithAlternative.parameters.param_name_alternative_case_convention[0] = 'error';

      const spec = {
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  name: 'goodparam',
                  in: 'query',
                  required: true,
                  description: 'tags to filter by',
                  schema: {
                    type: 'string',
                  }
                },
                {
                  name: 'camelParam',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  description: 'test',
                  required: true
                },
                {
                  name: 'filter[camelParam]',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  description: 'test',
                  required: true
                },
                {
                  name: 'snake_param',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  description: 'test',
                  required: true
                },
                {
                  name: 'filter[snake_param]',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  description: 'test',
                  required: true
                },
                {
                  name: 'spinal-param',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  description: 'test',
                  required: true
                },
                {
                  name: 'filter[spinal-param]',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  description: 'test',
                  required: true
                },
                {
                  $ref: "#/components/parameters/goodparamdef"
                },
                {
                  $ref: "#/components/parameters/camelparamdef"
                },
                {
                  $ref: "#/components/parameters/filtercamelparamdef"
                },
                {
                  $ref: "#/components/parameters/snakeparamdef"
                },
                {
                  $ref: "#/components/parameters/filtersnakeparamdef"
                },
                {
                  $ref: "#/components/parameters/spinalparamdef"
                },
                {
                  $ref: "#/components/parameters/filterspinalparamdef"
                }
              ]
            }
          }
        },
        components: {
          parameters: {
            goodparamdef: {
              in: 'query',
              name: 'goodparamdef',
              schema: {
                type: 'string'
              }
            },
            camelparamdef: {
              name: 'camelParamDef',
              in: 'query',
              schema: {
                type: 'string',
              },
              description: 'test',
              required: true
            },
            filtercamelparamdef: {
              name: 'filter[camelParamDef]',
              in: 'query',
              schema: {
                type: 'string',
              },
              description: 'test',
              required: true
            },
            snakeparamdef: {
              name: 'snake_param_def',
              in: 'query',
              schema: {
                type: 'string',
              },
              description: 'test',
              required: true
            },
            filtersnakeparamdef: {
              name: 'filter[snake_param_def]',
              in: 'query',
              schema: {
                type: 'string',
              },
              description: 'test',
              required: true
            },
            spinalparamdef: {
              name: 'spinal-param-def',
              in: 'query',
              schema: {
                type: 'string',
              },
              description: 'test',
              required: true
            },
            filterspinalparamdef: {
              name: 'filter[spinal-param-def]',
              in: 'query',
              schema: {
                type: 'string',
              },
              description: 'test',
              required: true
            }
          }
        }
      };

      const res = validate({ jsSpec: spec, isOAS3: true }, configWithAlternative);
      expect(res.errors.length).toEqual(4);
      expect(res.errors[0].path).toEqual(["paths", "/pets", "get", "parameters", "5"]);
      expect(res.errors[0].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' or 'lower_snake_case'.");
      expect(res.errors[1].path).toEqual(["paths", "/pets", "get", "parameters", "6"]);
      expect(res.errors[1].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' or 'lower_snake_case'.");
      expect(res.errors[2].path).toEqual(["components", "parameters", "spinalparamdef"]);
      expect(res.errors[2].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' or 'lower_snake_case'.");
      expect(res.errors[3].path).toEqual(["components", "parameters", "filterspinalparamdef"]);
      expect(res.errors[3].message).toEqual("Parameter names must follow case convention: 'kubernetesAPICase' or 'lower_snake_case'.");
      expect(res.warnings.length).toEqual(0);
    });
  });
});
