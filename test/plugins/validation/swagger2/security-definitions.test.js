const expect = require('expect');
const resolver = require('json-schema-ref-parser');
const {
  validate
} = require('../../../../src/plugins/validation/swagger2/semantic-validators/security-definitions');

const config = {
  security_definitions: {
    unused_security_schemes: 'warning',
    unused_security_scopes: 'warning'
  }
};

describe('validation plugin - semantic - security-definitions', function() {
  
  it('should complain about an a security without type', function() {
    const spec = {
      securityDefinitions: {
        api_key: {
          name: 'apiKey',
        }
      },
      security: [
        {
          api_key: []
        }
      ],
      paths: {
        'CoolPath/secured': {
          get: {
            operationId: 'secureGet',
            summary: 'secure get operation',
            security: [
              {
                coolApiAuth: ['read:coolData']
              }
            ]
          }
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].message).toEqual(`string 'type' param required for path: securityDefinitions.api_key.`);
    expect(res.errors[0].path).toEqual('securityDefinitions.api_key');
  });

  it('should complain about an apikey without in and name attributes', function() {
    const spec = {
      securityDefinitions: {
        api_key: {
          type: 'apiKey',
        }
      },
      security: [
        {
          api_key: []
        }
      ],
      paths: {
        'CoolPath/secured': {
          get: {
            operationId: 'secureGet',
            summary: 'secure get operation',
            security: [
              {
                coolApiAuth: ['read:coolData']
              }
            ]
          }
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].message).toEqual(`apiKey authorization must have required 'in' param, valid values are 'query' or 'header'.`);
    expect(res.errors[0].path).toEqual('securityDefinitions.api_key');
    expect(res.errors[1].message).toEqual(`apiKey authorization must have required 'name' string param. The name of the header or query parameter to be used.`);
    expect(res.errors[1].path).toEqual('securityDefinitions.api_key');
  });

  it('should not complain about a correct apikey', function() {
    const spec = {
      securityDefinitions: {
        api_key: {
          "type": 'apiKey',
          "name": 'apikeyDef',
          "in": 'query',
          "scopes": {
            scopeGet: 'blah blah'
          }
        }
      },
      security: [
        {
          api_key: []
        }
      ],
      paths: {
        'CoolPath/secured': {
          get: {
            operationId: 'secureGet',
            summary: 'secure get operation',
          }
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(0);
  });

  it('should not complain about a correct basic', function() {
    const spec = {
      securityDefinitions: {
        basic_auth: {
          "type": 'basic'
        }
      },
      security: [
        {
          basic_auth: []
        }
      ],
      paths: {
        'CoolPath/secured': {
          get: {
            operationId: 'secureGet',
            summary: 'secure get operation',
            security: [
              {
                coolApiAuth: ['read:coolData']
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

  it('should not complain about a correct oauth2 - implicit', function() {
    const spec = {
      securityDefinitions: {
        oauth: {
          "type": "oauth2",
          "authorizationUrl": "http://swagger.io/api/oauth/dialog",
          "flow": "implicit",
          "scopes": {
            "write:pets": "modify pets in your account",
            "read:pets": "read your pets"
          }
        }
      },
      security: [
        {
          oauth: []
        }
      ],
      paths: {
        'CoolPath/secured': {
          get: {
            operationId: 'secureGet',
            summary: 'secure get operation',
            security: [
              {
                coolApiAuth: ['read:coolData']
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

  it('should not complain about a correct oauth2 - password', function() {
    const spec = {
      securityDefinitions: {
        oauth: {
          "type": "oauth2",
          "tokenUrl": "http://swagger.io/api/oauth/dialog",
          "flow": "password",
          "scopes": {
            "write:pets": "modify pets in your account",
            "read:pets": "read your pets"
          }
        }
      },
      security: [
        {
          oauth: []
        }
      ],
      paths: {
        'CoolPath/secured': {
          get: {
            operationId: 'secureGet',
            summary: 'secure get operation',
            security: [
              {
                coolApiAuth: ['read:coolData']
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

  it('should not complain about a correct oauth2 - application', function() {
    const spec = {
      securityDefinitions: {
        oauth: {
          "type": "oauth2",
          "tokenUrl": "http://swagger.io/api/oauth/dialog",
          "flow": "application",
          "scopes": {
            "write:pets": "modify pets in your account",
            "read:pets": "read your pets"
          }
        }
      },
      security: [
        {
          oauth: []
        }
      ],
      paths: {
        'CoolPath/secured': {
          get: {
            operationId: 'secureGet',
            summary: 'secure get operation',
            security: [
              {
                coolApiAuth: ['read:coolData']
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

  it('should not complain about a correct oauth2 - accessCode', function() {
    const spec = {
      securityDefinitions: {
        oauth: {
          "type": "oauth2",
          "authorizationUrl": "http://swagger.io/api/oauth/dialog",
          "tokenUrl": "http://swagger.io/api/oauth/dialog",
          "flow": "accessCode",
          "scopes": {
            "write:pets": "modify pets in your account",
            "read:pets": "read your pets"
          }
        }
      },
      security: [
        {
          oauth: []
        }
      ],
      paths: {
        'CoolPath/secured': {
          get: {
            operationId: 'secureGet',
            summary: 'secure get operation',
            security: [
              {
                coolApiAuth: ['read:coolData']
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


  it('should complain about an oauth 2 without flow and scopes', function() {
    const spec = {
      securityDefinitions: {
        oauth: {
          "type": "oauth2",
          "authorizationUrl": "http://swagger.io/api/oauth/dialog"
        }
      },
      security: [
        {
          oauth: []
        }
      ],
      paths: {
        'CoolPath/secured': {
          get: {
            operationId: 'secureGet',
            summary: 'secure get operation',
            security: [
              {
                coolApiAuth: ['read:coolData']
              }
            ]
          }
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].message).toEqual(`oauth2 authorization must have required 'flow' string param. Valid values are 'implicit', 'password', 'application' or 'accessCode'.`);
    expect(res.errors[0].path).toEqual('securityDefinitions.oauth');
    expect(res.errors[1].message).toEqual(`'scopes' is required property type object. The available scopes for the OAuth2 security scheme.`);
    expect(res.errors[1].path).toEqual('securityDefinitions.oauth');
  });

  it('should complain about an oauth 2 with incorrect scopes', function() {
    const spec = {
      securityDefinitions: {
        oauth: {
          "type": "oauth2",
          "authorizationUrl": "http://swagger.io/api/oauth/dialog",
          "flow": "implicit",
          "scopes": "test"
        }
      },
      security: [
        {
          oauth: []
        }
      ],
      paths: {
        'CoolPath/secured': {
          get: {
            operationId: 'secureGet',
            summary: 'secure get operation',
            security: [
              {
                coolApiAuth: ['read:coolData']
              }
            ]
          }
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].message).toEqual(`'scopes' is required property type object. The available scopes for the OAuth2 security scheme.`);
    expect(res.errors[0].path).toEqual('securityDefinitions.oauth');
  });

  it('should complain about an oauth 2 - application without tokenUrl and with authorizationUrl', function() {
    const spec = {
      securityDefinitions: {
        oauth: {
          "type": "oauth2",
          "flow": "application",
          "authorizationUrl": "http://swagger.io/api/oauth/dialog",
          "scopes": {
            "write:pets": "modify pets in your account",
            "read:pets": "read your pets"
          }
        }
      },
      security: [
        {
          oauth: []
        }
      ],
      paths: {
        'CoolPath/secured': {
          get: {
            operationId: 'secureGet',
            summary: 'secure get operation',
            security: [
              {
                coolApiAuth: ['read:coolData']
              }
            ]
          }
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].message).toEqual(`oauth2 authorization application flow must have required 'tokenUrl' string parameter.`);
    expect(res.errors[0].path).toEqual('securityDefinitions.oauth');
    expect(res.errors[1].message).toEqual(`oauth2 authorization application flow should not have 'authorizationUrl' parameter.`);
    expect(res.errors[1].path).toEqual('securityDefinitions.oauth.authorizationUrl');
  });

  it('should complain about an oauth 2 - application without tokenUrl and with authorizationUrl', function() {
    const spec = {
      securityDefinitions: {
        oauth: {
          "type": "oauth2",
          "flow": "password",
          "authorizationUrl": "http://swagger.io/api/oauth/dialog",
          "scopes": {
            "write:pets": "modify pets in your account",
            "read:pets": "read your pets"
          }
        }
      },
      security: [
        {
          oauth: []
        }
      ],
      paths: {
        'CoolPath/secured': {
          get: {
            operationId: 'secureGet',
            summary: 'secure get operation',
            security: [
              {
                coolApiAuth: ['read:coolData']
              }
            ]
          }
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].message).toEqual(`oauth2 authorization password flow must have required 'tokenUrl' string parameter.`);
    expect(res.errors[0].path).toEqual('securityDefinitions.oauth');
    expect(res.errors[1].message).toEqual(`oauth2 authorization password flow should not have 'authorizationUrl' parameter.`);
    expect(res.errors[1].path).toEqual('securityDefinitions.oauth.authorizationUrl');
  });

  it('should complain about an oauth 2 - accessCode without authorizationUrl', function() {
    const spec = {
      securityDefinitions: {
        oauth: {
          "type": "oauth2",
          "flow": "accessCode",
          "tokenUrl": "http://swagger.io/api/oauth/dialog",
          "scopes": {
            "write:pets": "modify pets in your account",
            "read:pets": "read your pets"
          }
        }
      },
      security: [
        {
          oauth: []
        }
      ],
      paths: {
        'CoolPath/secured': {
          get: {
            operationId: 'secureGet',
            summary: 'secure get operation',
            security: [
              {
                coolApiAuth: ['read:coolData']
              }
            ]
          }
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].message).toEqual(`oauth2 authorization accessCode flow must have required 'authorizationUrl' and 'tokenUrl' string parameters.`);
    expect(res.errors[0].path).toEqual('securityDefinitions.oauth');
  });

  it('should complain about an oauth 2 - accessCode without tokenUrl', function() {
    const spec = {
      securityDefinitions: {
        oauth: {
          "type": "oauth2",
          "flow": "accessCode",
          "authorizationUrl": "http://swagger.io/api/oauth/dialog",
          "scopes": {
            "write:pets": "modify pets in your account",
            "read:pets": "read your pets"
          }
        }
      },
      security: [
        {
          oauth: []
        }
      ],
      paths: {
        'CoolPath/secured': {
          get: {
            operationId: 'secureGet',
            summary: 'secure get operation',
            security: [
              {
                coolApiAuth: ['read:coolData']
              }
            ]
          }
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].message).toEqual(`oauth2 authorization accessCode flow must have required 'authorizationUrl' and 'tokenUrl' string parameters.`);
    expect(res.errors[0].path).toEqual('securityDefinitions.oauth');
  });

  it('should complain about an oauth 2 - implicit without authorizationUrl and with tokenUrl', function() {
    const spec = {
      securityDefinitions: {
        oauth: {
          "type": "oauth2",
          "flow": "implicit",
          "tokenUrl": "http://swagger.io/api/oauth/dialog",
          "scopes": {
            "write:pets": "modify pets in your account",
            "read:pets": "read your pets"
          }
        }
      },
      security: [
        {
          oauth: []
        }
      ],
      paths: {
        'CoolPath/secured': {
          get: {
            operationId: 'secureGet',
            summary: 'secure get operation',
            security: [
              {
                coolApiAuth: ['read:coolData']
              }
            ]
          }
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].message).toEqual(`oauth2 authorization implicit flow must have required 'authorizationUrl' parameter.`);
    expect(res.errors[0].path).toEqual('securityDefinitions.oauth');
    expect(res.errors[1].message).toEqual(`oauth2 authorization implicit flow should not have 'tokenUrl' parameter.`);
    expect(res.errors[1].path).toEqual('securityDefinitions.oauth.tokenUrl');
  });

});
