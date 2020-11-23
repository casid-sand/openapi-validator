const expect = require('expect');
const {
  validate
} = require('../../../../src/plugins/validation/2and3/semantic-validators/extensions-data');

const config = {
  extensions: {
    data_extensions: 'error'
  }
};

describe('validation plugin - semantic - extension data - incorrect values', () => {

  //this is for openapi object
  it('should be errors with incorrects extensions values', () => {
    const spec = {
      Openapi: '3.0.0',
      info: {
        title: "Test",
        version: "1.0",
        description: "toto",
        contact: {
            email: "test@test.com",
            name: "toto"
        },
        "x-data-access-network": "",
        "x-data-security-classification": "",
        "x-data-security-mention": "np",
        "x-data-use-constraint": "inconnu",
        "x-data-access-authorization": "rgrg",
        "x-maximum-request-bandwidth": "inconnu",
        "x-maximum-request-rate": "",
        "x-maximum-request-size": "inconnu",
        "x-maximum-response-size": "inconnu",
      },
      paths: {
        "/pathOne": {
          "x-maximum-request-rate": "inconnu",
          "x-data-security-classification": "inconnu",
          "x-data-use-constraint": "",
          "x-maximum-response-size": "",
          "get": {
            },
          "post": {
            }
          },
        "/pathTwo": {
          "get": {
            "x-maximum-request-size": "inconnu",
            "x-data-access-network": "np",
            "x-data-security-mention": "",
            "x-maximum-request-bandwidth": "",
            "x-data-is-file": ""
          },
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(18);
    expect(res.errors[0].path).toEqual(['info', 'x-data-access-authorization']);
    expect(res.errors[0].message).toContain("'x-data-access-authorization' value must be one of");
    expect(res.errors[0].type).toEqual('convention');
    expect(res.errors[0].rule).toEqual('CTMO.STANDARD-CODAGE-23');

    expect(res.errors[1].path).toEqual(['info', 'x-data-access-network']);
    expect(res.errors[1].message).toEqual("'x-data-access-network' value must be a non-empty string.");
    expect(res.errors[2].path).toEqual(['info', 'x-data-security-classification']);
    expect(res.errors[2].message).toEqual("'x-data-security-classification' value must be a non-empty string.");
    expect(res.errors[3].path).toEqual(['info', 'x-data-security-mention']);
    expect(res.errors[3].message).toContain("'x-data-security-mention' value must be one of");
    expect(res.errors[4].path).toEqual(['info', 'x-data-use-constraint']);
    expect(res.errors[4].message).toContain("'x-data-use-constraint' value must be one of");

    expect(res.errors[5].path).toEqual(['info', 'x-maximum-request-bandwidth']);
    expect(res.errors[5].message).toEqual("'x-maximum-request-bandwidth' value must be a number.");
    expect(res.errors[6].path).toEqual(['info', 'x-maximum-request-rate']);
    expect(res.errors[6].message).toEqual("'x-maximum-request-rate' value must be a number.");
    expect(res.errors[7].path).toEqual(['info', 'x-maximum-request-size']);
    expect(res.errors[7].message).toEqual("'x-maximum-request-size' value must be a number.");
    expect(res.errors[8].path).toEqual(['info', 'x-maximum-response-size']);
    expect(res.errors[8].message).toEqual("'x-maximum-response-size' value must be a number.");

    expect(res.errors[9].path).toEqual(['paths', '/pathOne', 'x-data-security-classification']);
    expect(res.errors[9].message).toContain("'x-data-security-classification' value must be one of");
    expect(res.errors[10].path).toEqual(['paths', '/pathOne', 'x-data-use-constraint']);
    expect(res.errors[10].message).toEqual("'x-data-use-constraint' value must be a non-empty string.");
    expect(res.errors[11].path).toEqual(['paths', '/pathOne',  'x-maximum-request-rate']);
    expect(res.errors[11].message).toEqual("'x-maximum-request-rate' value must be a number.");
    expect(res.errors[12].path).toEqual(['paths', '/pathOne',  'x-maximum-response-size']);
    expect(res.errors[12].message).toEqual("'x-maximum-response-size' value must be a number.");

    expect(res.errors[13].path).toEqual(['paths', '/pathTwo', 'get', 'x-data-access-network']);
    expect(res.errors[13].message).toContain("'x-data-access-network' value must be one of");
    expect(res.errors[14].path).toEqual(['paths', '/pathTwo', 'get', 'x-data-security-mention']);
    expect(res.errors[14].message).toEqual("'x-data-security-mention' value must be a non-empty string.");
    expect(res.errors[15].path).toEqual(['paths', '/pathTwo', 'get',  'x-maximum-request-bandwidth']);
    expect(res.errors[15].message).toEqual("'x-maximum-request-bandwidth' value must be a number.");
    expect(res.errors[16].path).toEqual(['paths', '/pathTwo', 'get',  'x-maximum-request-size']);
    expect(res.errors[16].message).toEqual("'x-maximum-request-size' value must be a number.");
    expect(res.errors[17].path).toEqual(['paths', '/pathTwo', 'get', 'x-data-is-file']);
    expect(res.errors[17].message).toEqual("'x-data-is-file' value must be a non-empty string.");

    expect(res.warnings.length).toEqual(0);
  });

 
});

describe('validation plugin - semantic - extension data - missing values', () => {

  //this is for openapi object
  it('should be 1 error without paths and one missing', () => {
    const spec = {
      Openapi: '3.0.0',
      info: {
        title: "Test",
        version: "1.0",
        description: "toto",
        contact: {
            email: "test@test.com",
            name: "toto"
        },
        "x-data-access-network": "intradef",
        "x-data-access-authorization": "nécessitant une autorisation du fournisseur API",
        "x-data-security-mention": "aucune",
        "x-data-security-classification": "np"
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual(['info', 'x-data-use-constraint'] );
    expect(res.errors[0].message).toEqual("Extension value must be defined in object 'info', 'path' or 'operation' : 'x-data-use-constraint' (recommended on 'info' object).");
  });

    //this is for openapi object
    it('should be ok with all required extensions in OpenAPI 3 corrects in info', () => {
      const spec = {
        Openapi: '3.0.0',
        info: {
          title: "Test",
          version: "1.0",
          description: "toto",
          contact: {
              email: "test@test.com",
              name: "toto"
          },
          "x-data-access-network": "intradef",
          "x-data-access-authorization": "nécessitant une autorisation du fournisseur API",
          "x-data-security-mention": "aucune",
          "x-data-security-classification": "np",
          "x-data-use-constraint": "rgpd",
        },
        paths: {
          "/pathOne": {
              "get": {
              },
              "post": {
              }
            },
          "/pathTwo": {
            "get": {
            },
          }
        }
      };
  
      const res = validate({ jsSpec: spec }, config);
      expect(res.errors.length).toEqual(0);
      expect(res.warnings.length).toEqual(0);
    });

    //this is for openapi object
    it('should be ok with all required extensions in Swagger 2 corrects and others extensions', () => {
      const spec = {
        Swagger: '2.0.0',
        info: {
          title: "Test",
          version: "1.0",
          description: "toto",
          contact: {
              email: "test@test.com",
              name: "toto"
          },
          "x-data-access-network": "intradef",
          "x-data-access-authorization": "nécessitant une autorisation du fournisseur API",
          "x-data-security-mention": "aucune",
          "x-data-security-classification": "np",
          "x-data-use-constraint": "rgpd",
          "x-maximum-request-bandwidth": "100",
          "x-maximum-request-rate": "10",
          "x-maximum-request-size": "15",
          "x-maximum-response-size": "28",
          "x-other-extension-string": "toto",
          "x-other-extension-number": "28",
        },
        paths: {
          "/pathOne": {
            "x-maximum-request-rate": "10",
            "x-maximum-request-size": "15",
            "x-maximum-response-size": "24",
            "get": {
              "x-maximum-response-size": "24"
              },
            "post": {
              "x-maximum-response-size": "14"
              }
            },
          "/pathTwo": {
            "x-data-use-constraint": "dpcs",
            "get": {
              "x-data-use-constraint": "aucune",
            },
          }
        }
      };
  
      const res = validate({ jsSpec: spec }, config);
      expect(res.errors.length).toEqual(0);
      expect(res.warnings.length).toEqual(0);
    });

    //this is for openapi object
    it('should be 1 error with one extension missing', () => {
      const spec = {
        Swagger: '2.0.0',
        info: {
          title: "Test",
          version: "1.0",
          description: "toto",
          contact: {
              email: "test@test.com",
              name: "toto"
          },
          "x-data-access-network": "intradef",
          "x-data-access-authorization": "nécessitant une autorisation du fournisseur API",
          "x-data-security-classification": "np",
          "x-data-use-constraint": "rgpd",
          "x-maximum-request-bandwidth": "100",
          "x-maximum-request-rate": "10",
          "x-maximum-request-size": "15",
          "x-maximum-response-size": "28",
        },
        paths: {
          "/pathOne": {
            "get": {
              },
            "post": {
              }
            },
          "/pathTwo": {
            "get": {
            },
          }
        }
      };
  
      const res = validate({ jsSpec: spec }, config);
      expect(res.errors.length).toEqual(1);
      expect(res.warnings.length).toEqual(0);
      expect(res.errors[0].path).toEqual(['info', 'x-data-security-mention']);
      expect(res.errors[0].message).toEqual("Extension value must be defined in object 'info', 'path' or 'operation' : 'x-data-security-mention' (recommended on 'info' object).");
    });

  //this is for openapi object
  it('should be 5 errors on info with all missing extensions', () => {
    const spec = {
      Openapi: '3.0.0',
      info: {
        title: "Test",
        version: "1.0",
        description: "toto",
        contact: {
            email: "test@test.com",
            name: "toto"
        },
      },
      paths: {
        "/pathOne": {
            "get": {
            },
            "post": {
            }
          },
        "/pathTwo": {
          "get": {
          },
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(5);
    expect(res.errors[0].path).toEqual(['info', 'x-data-access-authorization'] );
    expect(res.errors[0].message).toEqual("Extension value must be defined in object 'info', 'path' or 'operation' : 'x-data-access-authorization' (recommended on 'info' object).");
    expect(res.errors[0].type).toEqual('convention');
    expect(res.errors[0].rule).toEqual('CTMO.STANDARD-CODAGE-23');
    expect(res.errors[1].path).toEqual(['info', 'x-data-access-network'] );
    expect(res.errors[1].message).toEqual("Extension value must be defined in object 'info', 'path' or 'operation' : 'x-data-access-network' (recommended on 'info' object).");
    expect(res.errors[2].message).toEqual("Extension value must be defined in object 'info', 'path' or 'operation' : 'x-data-security-classification' (recommended on 'info' object).");
    expect(res.errors[3].message).toEqual("Extension value must be defined in object 'info', 'path' or 'operation' : 'x-data-security-mention' (recommended on 'info' object).");
    expect(res.errors[4].message).toEqual("Extension value must be defined in object 'info', 'path' or 'operation' : 'x-data-use-constraint' (recommended on 'info' object).");
  });

  //this is for openapi object
  it('should be 5 errors on path and operation with missing extension', () => {
    const spec = {
      Swagger: '2.0.0',
      info: {
        title: "Test",
        version: "1.0",
        description: "toto",
        contact: {
            email: "test@test.com",
            name: "toto"
        },
        "x-data-access-network": "intradef",
        "x-data-use-constraint": "rgpd"
      },
      paths: {
        "/pathWithAllExtensions": {
          "x-data-access-authorization": "publique",
          "x-data-security-mention": "aucune",
          "x-data-security-classification": "np",
          "get": {
            },
          "post": {
            }
          },
        "/pathwithExtensionsInOperation": {
            "get": {
              "x-data-access-authorization": "publique",
              "x-data-security-mention": "aucune",
              "x-data-security-classification": "np",
            },
        },
        "/pathwithNoExtensions": {
          "get": {
          },
        },
        "/pathwithSomeExtensions": {
          "x-data-security-classification": "np",
          "get": {
            "x-data-access-authorization": "publique",
            "x-data-security-mention": "aucune"
          },
          "operationWithoutExtensions": {
          },
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(5);
    expect(res.errors[0].path).toEqual(['paths', '/pathwithNoExtensions', 'x-data-access-authorization' ]);
    expect(res.errors[0].message).toEqual("Extension value must be defined in object 'info', 'path' or 'operation' : 'x-data-access-authorization' (recommended on 'info' object).");
    expect(res.errors[1].path).toEqual(['paths', '/pathwithNoExtensions', 'x-data-security-classification' ]);
    expect(res.errors[1].message).toEqual("Extension value must be defined in object 'info', 'path' or 'operation' : 'x-data-security-classification' (recommended on 'info' object).");
    expect(res.errors[2].path).toEqual(['paths', '/pathwithNoExtensions', 'x-data-security-mention' ]);
    expect(res.errors[2].message).toEqual("Extension value must be defined in object 'info', 'path' or 'operation' : 'x-data-security-mention' (recommended on 'info' object).");

    expect(res.errors[3].path).toEqual(['paths', '/pathwithSomeExtensions', 'operationWithoutExtensions', 'x-data-access-authorization' ]);
    expect(res.errors[3].message).toEqual("Extension value must be defined in object 'info', 'path' or 'operation' : 'x-data-access-authorization' (recommended on 'info' object).");
    expect(res.errors[4].path).toEqual(['paths', '/pathwithSomeExtensions', 'operationWithoutExtensions', 'x-data-security-mention' ]);
    expect(res.errors[4].message).toEqual("Extension value must be defined in object 'info', 'path' or 'operation' : 'x-data-security-mention' (recommended on 'info' object).");
  });
 
});
