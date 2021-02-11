const expect = require('expect');
const {
  validate
} = require('../../../../src/plugins/validation/oas3/semantic-validators/security-definitions-ibm');

describe('it should have a type of `apiKey`,`http`,`oauth2`, `openIdConnect`', function() {
  it('should have a type', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            scheme: 'basic'
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel');
    expect(res.errors[0].message).toEqual(
      'security scheme is missing required field `type`'
    );
  });
  it('type can only be `apiKey`, `http`, `oauth2`, `openIdConnect`', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'wrong type',
            scheme: 'basic',
            description: 'example text'
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual(
      'securitySchemes.SecuritySchemeModel.type'
    );
    expect(res.errors[0].message).toEqual(
      '`type` must have one of the following types: `apiKey`, `oauth2`, `http`, `openIdConnect`'
    );
  });
});

describe('if the type is `apiKey` then it should have `query`, `header` or `cookie` as well as `name`', function() {
  it('if type is `apiKey`, then the `in` property should be defined and can only be `query`, `header` or `cookie`.', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'apiKey',
            name: 'apiKey',
            scheme: 'basic',
            descriptions: 'example text'
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual(
      'securitySchemes.SecuritySchemeModel.in'
    );
    expect(res.errors[0].message).toEqual(
      "apiKey authorization must have required 'in' property, valid values are 'query' or 'header' or 'cookie'."
    );
  });
  it('if type is `apiKey`, then the `name` property should be defined and should be the name of the header or query property', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'apiKey',
            in: 'cookie',
            scheme: 'basic',
            descriptions: 'example text'
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel');
    expect(res.errors[0].message).toEqual(
      "apiKey authorization must have required 'name' string property. The name of the header or query property to be used."
    );
  });
});

it('if type is `apiKey`, then the `bearerFormat` property should not be defined', function() {
  const spec = {
    components: {
      securitySchemes: {
        SecuritySchemeModel: {
          type: 'apiKey',
          in: 'cookie',
          scheme: 'basic',
          name: 'apiKey',
          descriptions: 'example text',
          bearerFormat: 'JWT',
        }
      }
    }
  };

  const res = validate({ resolvedSpec: spec });
  expect(res.errors.length).toEqual(1);
  expect(res.warnings.length).toEqual(0);
  expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel');
  expect(res.errors[0].message).toEqual(
    "apiKey authorization must not define `bearerFormat` (only available for `http` securityScheme type)."
  );
});

describe('if the type is `oauth2` then it should have flows and flows should follow the spec requirements', function() {
  it('should have flows property if type is oauth2', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'oauth2'
          },
          authorizationCode: {
            authorizationUrl: 'https://example.com/api/oauth/dialog',
            tokenUrl: 'https://example.com/api/oauth/token'
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(2);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel');
    expect(res.errors[0].message).toEqual(
      "oauth2 authorization must have required 'flows' property" //////recieved
    );
  });

  it('should have `authorizationUrl` if flows is `implicit`', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'oauth2',
            flows: {
              implicit: {
                authurl: 'not real url',
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(2);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel.flows.implicit');
    expect(res.errors[0].message).toEqual("oauth2 authorization implicit flow must have required 'authorizationUrl' property.");
    expect(res.errors[1].path).toEqual('securitySchemes.SecuritySchemeModel.flows.implicit');
    expect(res.errors[1].message).toEqual("oauth2 authorization implicit flow must have required 'scopes' property.");
  });

  it('should have `authorizationUrl`, `scopes` and `tokenUrl` if type is `oauth2` and flow is `authorizationCode`', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'oauth2',
            flows: {
              authorizationCode: {
                refreshUrl: 'https://example.com/api/oauth/dialog',
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(3);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel.flows.authorizationCode');
    expect(res.errors[0].message).toEqual("oauth2 authorization authorizationCode flow must have required 'authorizationUrl' property.");
    expect(res.errors[1].path).toEqual('securitySchemes.SecuritySchemeModel.flows.authorizationCode');
    expect(res.errors[1].message).toEqual("oauth2 authorization authorizationCode flow must have required 'tokenUrl' property.");
    expect(res.errors[2].path).toEqual('securitySchemes.SecuritySchemeModel.flows.authorizationCode');
    expect(res.errors[2].message).toEqual("oauth2 authorization authorizationCode flow must have required 'scopes' property.");
  });

  it('should have `scopes` and `tokenUrl` if type is `oauth2` and flow is `password`', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'oauth2',
            flows: {
              password: {
                refreshUrl: 'https://example.com/api/oauth/dialog',
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(2);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel.flows.password');
    expect(res.errors[0].message).toEqual("oauth2 authorization password flow must have required 'tokenUrl' property.");
    expect(res.errors[1].path).toEqual('securitySchemes.SecuritySchemeModel.flows.password');
    expect(res.errors[1].message).toEqual("oauth2 authorization password flow must have required 'scopes' property.");
  });

  it('should have `scopes` and `tokenUrl` if type is `oauth2` and flow is `clientCredentials`', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'oauth2',
            flows: {
              clientCredentials: {
                refreshUrl: 'https://example.com/api/oauth/dialog',
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(2);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel.flows.clientCredentials');
    expect(res.errors[0].message).toEqual("oauth2 authorization clientCredentials flow must have required 'tokenUrl' property.");
    expect(res.errors[1].path).toEqual('securitySchemes.SecuritySchemeModel.flows.clientCredentials');
    expect(res.errors[1].message).toEqual("oauth2 authorization clientCredentials flow must have required 'scopes' property.");
  });

  it('should not complain for good implicit authorization', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'oauth2',
            flows: {
              implicit: {
                authorizationUrl: 'https://example.com/api/oauth/dialog',
                scopes: {}
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(0);
  });

  it('should not complain for good authorizationCode flow', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'oauth2',
            flows: {
              authorizationCode: {
                authorizationUrl: 'https://example.com/api/oauth/dialog',
                tokenUrl: 'https://example.com/api/oauth/dialog',
                scopes: {}
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(0);
  });

  it('should not complain for good password flow', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'oauth2',
            flows: {
              password: {
                tokenUrl: 'https://example.com/api/oauth/dialog',
                scopes: {}
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(0);
  });

  it('should not complain for good clientCredentials flow', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'oauth2',
            flows: {
              clientCredentials: {
                tokenUrl: 'https://example.com/api/oauth/dialog',
                scopes: {}
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(0);
  });

  it('should complain for implicit flow with tokenUrl', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'oauth2',
            flows: {
              implicit: {
                authorizationUrl: 'https://example.com/api/oauth/dialog',
                scopes: {},
                tokenUrl: 'https://example.com/api/oauth/dialog'
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel.flows.implicit.tokenUrl');
    expect(res.errors[0].message).toEqual("oauth2 authorization implicit flow must not have 'tokenUrl' property.");
  });

  it('should complain for password flow with authorizationUrl', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'oauth2',
            flows: {
              password: {
                authorizationUrl: 'https://example.com/api/oauth/dialog',
                tokenUrl: 'https://example.com/api/oauth/dialog',
                scopes: {}
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel.flows.password.authorizationUrl');
    expect(res.errors[0].message).toEqual("oauth2 authorization password flow must not have 'authorizationUrl' property.");
  });

  it('should complain for clientCredentials flow with authorizationUrl', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'oauth2',
            flows: {
              clientCredentials: {
                authorizationUrl: 'https://example.com/api/oauth/dialog',
                tokenUrl: 'https://example.com/api/oauth/dialog',
                scopes: {}
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel.flows.clientCredentials.authorizationUrl');
    expect(res.errors[0].message).toEqual("oauth2 authorization clientCredentials flow must not have 'authorizationUrl' property.");
  });

  it('should have `scopes` defined as an object if type is `oauth2`', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'oauth2',
            in: 'cookie',
            name: 'cookie',
            scheme: 'Basic',
            flows: {
              implicit: {
                authorizationUrl: 'https://example.com/api/oauth/dialog'
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual(
      'securitySchemes.SecuritySchemeModel.flows.implicit'
    );
    expect(res.errors[0].message).toEqual(
      "oauth2 authorization implicit flow must have required 'scopes' property."
    );
  });

  it('should have one flow type`', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'oauth2',
            in: 'cookie',
            name: 'cookie',
            scheme: 'Basic',
            flows: {
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel.flows');
    expect(res.errors[0].message).toEqual("oauth2 authorization `flows` must have one of the following properties: 'implicit', 'password', 'clientCredentials' or 'authorizationCode'.");
  });

});

describe('if `type` is `http`, then scheme property must be defined and `name` and `in` must not', function() {
  it('should have a defined scheme if type is `http`', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'http',
            descriptions: 'example text'
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel');
    expect(res.errors[0].message).toEqual(
      'scheme must be defined for type `http`'
    );
  });

  it('should not have a name if type is `http`', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            descriptions: 'example text',
            name: 'Customized-Header'
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel');
    expect(res.errors[0].message).toEqual('`name` property  must not be defined for type `http` (only available for `apiKey` securityScheme type).');
  });

  it('should not have a in if type is `http`', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            descriptions: 'example text',
            in: 'header'
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel');
    expect(res.errors[0].message).toEqual('`in` property must not be defined for type `http` (only available for `apiKey` securityScheme type).');
  });
});

describe('if `type` is `openIdConnect` then `openIdConnectUrl` must be defined and valid', function() {
  it('should have `openIdConnectUrl` propery if the type is defined as `openIdConnect`', function() {
    const spec = {
      components: {
        securitySchemes: {
          SecuritySchemeModel: {
            type: 'openIdConnect',
            openIdConnectUrl: 2,
            scheme: 'basic',
            descriptions: 'example text'
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual('securitySchemes.SecuritySchemeModel');
    expect(res.errors[0].message).toEqual(
      'openIdConnectUrl must be defined for openIdConnect property and must be a valid URL'
    );
  });
});
