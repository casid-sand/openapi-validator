const expect = require('expect');
const {
  validate
} = require('../../../../src/plugins/validation/2and3/semantic-validators/paths');

const defaultConfig = {
    paths: {
    }
};

describe('validation plugin - semantic - paths', function() {
  describe('Path parameter definitions need matching paramater declarations', function() {
    it('should not return problems for a valid definiton/declaration pair', function() {
      const spec = {
        paths: {
          '/CoolPath/{id}': {
            parameters: [
              {
                name: 'id',
                in: 'path',
                description: 'An id'
              }
            ]
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, defaultConfig);
      expect(res.errors).toEqual([]);
      expect(res.warnings).toEqual([]);
    });
  });

  describe('Empty path templates are not allowed', () => {
    it('should return one problem for an empty path template', function() {
      const spec = {
        paths: {
          '/CoolPath/{}': {}
        }
      };

      const res = validate({ resolvedSpec: spec }, defaultConfig);
      expect(res.errors).toEqual([
        {
          message: 'Empty path parameter declarations are not valid',
          path: 'paths./CoolPath/{}'
        }
      ]);
      expect(res.warnings).toEqual([]);
    });
  });

  describe('Path strings must be equivalently different', () => {
    it('should return one problem for an equivalent templated path strings', function() {
      const spec = {
        paths: {
          '/CoolPath/{id}': {
            parameters: [
              {
                name: 'id',
                in: 'path'
              }
            ]
          },
          '/CoolPath/{count}': {
            parameters: [
              {
                name: 'count',
                in: 'path'
              }
            ]
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, defaultConfig);
      expect(res.errors).toEqual([
        {
          message: 'Equivalent paths are not allowed.',
          path: 'paths./CoolPath/{count}'
        }
      ]);
      expect(res.warnings).toEqual([]);
    });

    it('should return no problems for a templated and untemplated pair of path strings', function() {
      const spec = {
        paths: {
          '/CoolPath/': {},
          '/CoolPath/{count}': {
            parameters: [
              {
                name: 'count',
                in: 'path'
              }
            ]
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, defaultConfig);
      expect(res.errors).toEqual([]);
      expect(res.warnings).toEqual([]);
    });

    it('should return no problems for a templated and double-templated set of path strings', function() {
      const spec = {
        paths: {
          '/CoolPath/{group_id}/all': {
            parameters: [
              {
                name: 'group_id',
                in: 'path'
              }
            ]
          },
          '/CoolPath/{group_id}/{user_id}': {
            parameters: [
              {
                name: 'group_id',
                in: 'path'
              },
              {
                name: 'user_id',
                in: 'path'
              }
            ]
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, defaultConfig);
      expect(res.errors).toEqual([]);
      expect(res.warnings).toEqual([]);
    });
  });

  describe('Paths must have unique name + in parameters', () => {
    it('should return one problem for an name + in collision', function() {
      const spec = {
        paths: {
          '/CoolPath/{id}': {
            parameters: [
              {
                name: 'id',
                in: 'path'
              }
            ]
          },
          '/CoolPath/{count}': {
            parameters: [
              {
                name: 'count',
                in: 'path'
              }
            ]
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, defaultConfig);
      expect(res.errors).toEqual([
        {
          message: 'Equivalent paths are not allowed.',
          path: 'paths./CoolPath/{count}'
        }
      ]);
      expect(res.warnings).toEqual([]);
    });

    it('should return no problems for an name collision only', function() {
      const spec = {
        paths: {
          '/CoolPath/{id}': {
            parameters: [
              {
                name: 'id',
                in: 'path'
              },
              {
                name: 'id',
                in: 'query'
              }
            ]
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, defaultConfig);
      expect(res.errors).toEqual([]);
      expect(res.warnings).toEqual([]);
    });

    it("should return no problems when 'in' is not defined", function() {
      const spec = {
        paths: {
          '/CoolPath/{id}': {
            parameters: [
              {
                name: 'id',
                in: 'path'
              },
              {
                name: 'id'
                // in: "path"
              }
            ]
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, defaultConfig);
      expect(res.errors).toEqual([]);
      expect(res.warnings).toEqual([]);
    });
  });

  describe('Paths cannot have partial templates', () => {
    it('should return one problem for an illegal partial path template', function() {
      const spec = {
        paths: {
          '/CoolPath/user{id}': {
            parameters: [
              {
                name: 'id',
                in: 'path'
              }
            ]
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, defaultConfig);
      expect(res.errors).toEqual([
        {
          message: 'Partial path templating is not allowed.',
          path: 'paths./CoolPath/user{id}'
        }
      ]);
      expect(res.warnings).toEqual([]);
    });

    it('should return no problems for a correct path template', function() {
      const spec = {
        paths: {
          '/CoolPath/{id}': {
            parameters: [
              {
                name: 'id',
                in: 'path'
              }
            ]
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, defaultConfig);
      expect(res.errors).toEqual([]);
      expect(res.warnings).toEqual([]);
    });
  });

  describe('Paths cannot have query strings in them', () => {
    it("should return one problem for an stray '?' in a path string", function() {
      const spec = {
        paths: {
          '/report?': {}
        }
      };

      const res = validate({ resolvedSpec: spec }, defaultConfig);
      expect(res.errors).toEqual([
        {
          message: 'Query strings in paths are not allowed.',
          path: 'paths./report?'
        }
      ]);
      expect(res.warnings).toEqual([]);
    });

    it('should return no problems for a correct path template', function() {
      const spec = {
        paths: {
          '/CoolPath/{id}': {
            parameters: [
              {
                name: 'id',
                in: 'path'
              }
            ]
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, defaultConfig);
      expect(res.errors).toEqual([]);
      expect(res.warnings).toEqual([]);
    });

    it('should return no problems for a correct path template', function() {
      const spec = {
        paths: {
          '/CoolPath/': {
            parameters: [
              {
                name: 'unusedParameterName',
                in: 'path'
              }
            ]
          },
          '/TemplatePath/{userId}': {
            parameters: [
              {
                name: 'userId',
                in: 'path'
              },
              {
                name: 'unusedSecondParameterName',
                in: 'path'
              }
            ]
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, defaultConfig);
      expect(res.errors.length).toEqual(2);
      expect(res.errors[0].message).toEqual("Path parameter was defined but never used: unusedParameterName.");
      expect(res.errors[1].message).toEqual("Path parameter was defined but never used: unusedSecondParameterName.");
      expect(res.warnings).toEqual([]);
    });
  });

  describe('Paths must contains resources name in the plural', () => {
  
    const config = {
      paths: {
        path_segments_with_s: 'warning'
      }
    };

    it('should return one warning for a path without ending s', function() {

        const spec = {
            paths: {
                '/v1/resource/{id}': {
                parameters: [
                    {
                    in: 'path',
                    name: 'id',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    }
                ]
                },
                '/v1/signatures': {
                },
                '/pets': {
                }
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(1);
        expect(res.warnings[0].message).toContain(
            "Resources in paths should be plural (with an 's', 'x' or 'z') :"
        );
        expect(res.warnings[0].type).toEqual('convention');
        expect(res.warnings[0].rule).toEqual('CTMO.STANDARD-CODAGE-03');
    });

    it('should return two warnings for a path with 2 resources without s and another path without s', function() {

        const spec = {
            paths: {
                '/v1/resource/pet/{id}': {
                parameters: [
                    {
                    in: 'path',
                    name: 'id',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    }
                ]
                },
                '/v1/signature': {
                },
                '/pets': {
                },
                '/joujou-enfant': {
                },
                '/joujouEnfant': {
                },
                '/joujou_enfant': {
                },
                '/joujou_enfants_test': {
                },
                '/JOUJOU_ENFANT': {
                },
                '/JOUJOU-ENFANT': {
                },
                '/JOUJOU.ENFANT': {
                },
                '/joujou.enfant': {
                }
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(10);
        expect(res.warnings[0].message).toContain("Resources in paths should be plural (with an 's', 'x' or 'z') :");
        expect(res.warnings[1].message).toContain("Resources in paths should be plural (with an 's', 'x' or 'z') :");
        expect(res.warnings[2].message).toContain("Resources in paths should be plural (with an 's', 'x' or 'z') :");
        expect(res.warnings[3].message).toContain("Resources in paths should be plural (with an 's', 'x' or 'z') :");
        expect(res.warnings[4].message).toContain("Resources in paths should be plural (with an 's', 'x' or 'z') :");
        expect(res.warnings[5].message).toContain("Resources in paths should be plural (with an 's', 'x' or 'z') :");
        expect(res.warnings[6].message).toContain("Resources in paths should be plural (with an 's', 'x' or 'z') :");
        expect(res.warnings[7].message).toContain("Resources in paths should be plural (with an 's', 'x' or 'z') :");
        expect(res.warnings[8].message).toContain("Resources in paths should be plural (with an 's', 'x' or 'z') :");
        expect(res.warnings[9].message).toContain("Resources in paths should be plural (with an 's', 'x' or 'z') :");
    });

    it('should return ok with all resources in the plural', function() {

        const spec = {
            paths: {
                '/resources/stores/{id}': {
                parameters: [
                    {
                    in: 'path',
                    name: 'id',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    }
                ]
                },
                '/ressources/signatures': {
                },
                '/signatures': {
                },
                '/pet_shops': {
                },
                '/pets_shop': {
                },
                '/houx': {
                },
                '/gaz': {
                },
                '/Services': {
                },
                '/HOUX': {
                },
                '/EMPLOYES': {
                },
                '/GAZ': {
                },
                '/demandes_service': {
                },
                '/demandes.service': {
                },
                '/demandes-service': {
                },
                '/demandesService': {
                },
                '/gaz_oduc': {
                },
                '/trucs_utiles/joujoux_enfant': {
                },
                '/tests/trucs/joujoux-enfant': {
                },
                '/tests/trucs/joujoux.enfant': {
                },
                '/various/joujouxEnfant': {
                },
                '/various/joujouzEnfant': {
                },
                '/GENOUX_ENFANT': {
                },
                '/GENOUX.ENFANT': {
                },
                '/GENOUX-ENFANT': {
                },
                '/trucs_utiles/Joujoux_Enfant': {
                },
                '/tests/trucs/Joujoux-Enfant': {
                },
                '/tests/trucs/Joujoux.Enfant': {
                },
                '/tests/trucs/JoujouxEnfant': {
                },
                '/tests/trucs/bêtes': {
                },
                '/trucs_accéntué': {
                },
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(0);
    });

    it('should return ok with all resources in the plural and version string', function() {

        const spec = {
            paths: {
                '/v1/resources/stores/{id}': {
                parameters: [
                    {
                    in: 'path',
                    name: 'id',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    }
                ]
                },
                '/v2/signatures': {
                },
                '/v1/pets': {
                }
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(0);
    });
  });
  
  describe('Paths must alternate resources and identifier', () => {

    const config = {
      paths: {
        alternate_resources_and_identifiers: 'warning'
      }
    };

    it('should return one warning for a path without identifier between 2 resources', function() {

        const spec = {
            paths: {
                '/stores/pets/{id}': {
                parameters: [
                    {
                    in: 'path',
                    name: 'id',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    }
                ]
                }
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(1);
        expect(res.warnings[0].message).toContain(
            "Path must alternate resource type and identifier (eg 'resource/{id}/subresource/{id}')."
        );
        expect(res.warnings[0].type).toEqual('convention');
        expect(res.warnings[0].rule).toEqual('CTMO.STANDARD-CODAGE-04');
    });

    it('should return one warning for a path without resource', function() {

        const spec = {
            paths: {
                '/{id}': {
                parameters: [
                    {
                    in: 'path',
                    name: 'id',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    }
                ]
                }
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(1);
        expect(res.warnings[0].message).toContain(
            "Path must alternate resource type and identifier (eg 'resource/{id}/subresource/{id}')."
        );
    });

    it('should return one warning for a path starting with identifier', function() {

        const spec = {
            paths: {
                '/{id}/pets': {
                parameters: [
                    {
                    in: 'path',
                    name: 'id',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    }
                ]
                }
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(1);
    });

    it('should return ok with a path with only one depth : resource', function() {

        const spec = {
            paths: {
                '/pets': {
                }
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(0);
    });

    it('should return ok with a path with only one resource and one identifier', function() {

        const spec = {
            paths: {
                '/pets/{id}': {
                parameters: [
                    {
                    in: 'path',
                    name: 'id',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    }
                ]
                }
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(0);
    });

    it('should return ok with a path with only 3 resources and 3 identifiers', function() {

        const spec = {
            paths: {
                '/cities/{cityId}/stores/{storeId}/pets/{petId}': {
                parameters: [
                    {
                    in: 'path',
                    name: 'petId',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    },
                    {
                    in: 'path',
                    name: 'cityId',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    },
                    {
                    in: 'path',
                    name: 'storeId',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    }
                ]
                }
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(0);
    });

    it('should return ok with a path with version and resource', function() {

        const spec = {
            paths: {
                '/v2.1/pets/{id}': {
                parameters: [
                    {
                    in: 'path',
                    name: 'id',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    }
                ]
                },
                '/version-1/pets/{id}': {
                  parameters: [
                      {
                      in: 'path',
                      name: 'id',
                      description:
                          'bad parameter but should be caught by another validator, not here',
                      type: 'string'
                      }
                  ]
                  },
                  '/v1.3.2/pets/{id}': {
                    parameters: [
                        {
                        in: 'path',
                        name: 'id',
                        description:
                            'bad parameter but should be caught by another validator, not here',
                        type: 'string'
                        }
                    ]
                    }
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(0);
    });
  });

  describe('Paths must 6 or less depths', () => {

    const config = {
      paths: {
        max_path_levels: [
            "warning",
            6
        ]
      }
    };

    it('should return one warning for a path with 7 depths', function() {

        const spec = {
            paths: {
                '/countries/cities/buckets/stores/{storeId}/pets/{petId}': {
                parameters: [
                    {
                    in: 'path',
                    name: 'petId',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    },
                    {
                    in: 'path',
                    name: 'storeId',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    }
                ]
                }
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(1);
        expect(res.warnings[0].message).toContain(
            "Path must contain 6 depths maximum (3 levels alternating resource and identifier)."
        );
        expect(res.warnings[0].type).toEqual('convention');
        expect(res.warnings[0].rule).toEqual('CTMO.STANDARD-CODAGE-05');
    });

    it('should return one warning for a path with version and 7 depths', function() {

        const spec = {
            paths: {
                '/v1/countries/cities/buckets/stores/{storeId}/pets/{petId}': {
                parameters: [
                    {
                    in: 'path',
                    name: 'petId',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    },
                    {
                    in: 'path',
                    name: 'storeId',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    }
                ]
                }
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(1);
        expect(res.warnings[0].message).toContain(
            "Path must contain 6 depths maximum (3 levels alternating resource and identifier)."
        );
    });

    it('should return ok with a path with 6 depths', function() {

        const spec = {
            paths: {
                '/countries/cities/stores/{storeId}/pets/{petId}': {
                parameters: [
                    {
                    in: 'path',
                    name: 'petId',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    },
                    {
                    in: 'path',
                    name: 'storeId',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    }
                ]
                }
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(0);
    });

    it('should return ok with a path with 1 depth', function() {

        const spec = {
            paths: {
                '/pets': {
                }
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(0);
    });

    it('should return ok with a path with version and 6 depths', function() {

        const spec = {
            paths: {
                '/version74.1/countries/cities/stores/{storeId}/pets/{petId}': {
                parameters: [
                    {
                    in: 'path',
                    name: 'petId',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    },
                    {
                    in: 'path',
                    name: 'storeId',
                    description:
                        'bad parameter but should be caught by another validator, not here',
                    type: 'string'
                    }
                ]
                }
            }
        };

        const res = validate({ resolvedSpec: spec }, config);
        expect(res.errors.length).toEqual(0);
        expect(res.warnings.length).toEqual(0);
    });
  });

  describe('Final / is not allowed in path', () => {
    const config = {
      paths: {
        path_ending_with_slash: "warning"
      }
    };
    
    it('should return one problem for an empty path template', function() {
      const spec = {
        paths: {
          '/CoolPath': {},
          '/BadPath/': {},
          '/': {}
        }
      };

      const res = validate({ resolvedSpec: spec }, config);
      expect(res.errors.length).toEqual(0);
      expect(res.warnings.length).toEqual(1);
      expect(res.warnings[0].message).toContain(
        "Path should not end with a '/'."
      );
      expect(res.warnings[0].type).toEqual('convention');
      expect(res.warnings[0].rule).toEqual('CTMO.STANDARD-CODAGE-11');
    });
  });

  describe('Integrations', () => {
    it('should return two problems for an illegal query string in a path string', function() {
      const spec = {
        paths: {
          '/report?rdate={relative_date}': {
            parameters: [
              {
                name: 'relative_date',
                in: 'path'
              }
            ]
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, defaultConfig);
      expect(res.errors).toEqual([
        {
          message: 'Partial path templating is not allowed.',
          path: 'paths./report?rdate={relative_date}'
        },
        {
          message: 'Query strings in paths are not allowed.',
          path: 'paths./report?rdate={relative_date}'
        }
      ]);
      expect(res.warnings).toEqual([]);
    });

    it.skip('should return two problems for an equivalent path string missing a parameter definition', function() {
      const spec = {
        paths: {
          '/CoolPath/{id}': {
            parameters: [
              {
                name: 'id',
                in: 'path'
              }
            ]
          },
          '/CoolPath/{count}': {}
        }
      };

      const res = validate({ resolvedSpec: spec }, defaultConfig);
      expect(res.errors).toEqual([
        {
          message: 'Equivalent paths are not allowed.',
          path: 'paths./CoolPath/{count}'
        },
        {
          message:
            'Declared path parameter "count" needs to be defined as a path parameter at either the path or operation level',
          path: 'paths./CoolPath/{count}'
        }
      ]);
      expect(res.warnings).toEqual([]);
    });
  });

  it('should not crash when `parameters` is not an array', function() {
    const spec = {
      paths: {
        '/resource': {
          get: {
            operationId: 'listResources',
            description: 'operation with bad parameters...',
            summary: '...but it should not crash the code',
            parameters: {
              allOf: [
                {
                  name: 'one',
                  type: 'string'
                },
                {
                  name: 'two',
                  type: 'string'
                }
              ]
            },
            responses: {
              '200': {
                description: 'response'
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec }, defaultConfig);
    // errors/warnings would be caught it parameters-ibm.js
    expect(res.errors.length).toBe(0);
    expect(res.warnings.length).toBe(0);
  });
});
