const expect = require('expect');
const {
  validate
} = require('../../../../src/plugins/validation/2and3/semantic-validators/check-version-in-path');

const config = {
  extensions: {
    version_in_path: 'error'
  }
};

describe('validation plugin - semantic - check-version in path for openapi3', () => {

  it('should be ok with version in all paths, without servers', () => {
    const spec = {
      openapi: '3.0.0',
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
        "/v1/pathOne": {
          "get": {
            },
          },
        "/1.0/pathTwo": {
          "get": {
          },
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual(['servers']);
    expect(res.warnings[0].message).toEqual("Version should be declared in basePath or servers URL, not in paths.");
  });

  it('should be ok with version in all paths, with servers without version', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: "Test",
        version: "1.0",
        description: "toto",
        contact: {
            email: "test@test.com",
            name: "toto"
        },
      },
      servers:[
        {
          url: "http://test.com/api"
        },
        {
          url: "http://prod.com/api/objects"
        },
      ],
      paths: {
        "/v1/pathOne": {
          "get": {
            },
          },
        "/1.0/pathTwo": {
          "get": {
          },
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual(['servers']);
    expect(res.warnings[0].message).toEqual("Version should be declared in basePath or servers URL, not in paths.");
  });

    it('should be ok with version in all paths with empty servers', () => {
      const spec = {
        openapi: '3.0.0',
        info: {
          title: "Test",
          version: "1.0",
          description: "toto",
          contact: {
              email: "test@test.com",
              name: "toto"
          },
        },
        servers:[
        ],
        paths: {
          "/v1/pathOne": {
            "get": {
              },
            },
          "/1.0/pathTwo": {
            "get": {
            },
          }
        }
      };
  
      const res = validate({ jsSpec: spec }, config);
      expect(res.errors.length).toEqual(0);
      expect(res.warnings.length).toEqual(1);
      expect(res.warnings[0].path).toEqual(['servers']);
      expect(res.warnings[0].message).toEqual("Version should be declared in basePath or servers URL, not in paths.");
    });

  it('should be ok with version in all paths with servers without url and api version missing', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: "Test",
        description: "toto",
        contact: {
            email: "test@test.com",
            name: "toto"
        },
      },
      servers:[
        {  },
      ],
      paths: {
        "/v1/pathOne": {
          "get": {
            },
          },
        "/2.0/pathTwo": {
          "get": {
          },
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual(['servers']);
    expect(res.warnings[0].message).toEqual("Version should be declared in basePath or servers URL, not in paths.");
  });

  it('should be ok with version in all servers', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: "Test",
        version: "2.0",
        description: "toto",
        contact: {
            email: "test@test.com",
            name: "toto"
        },
      },
      servers:[
        {
          url: "http://test.com/api/v2.0"
        },
        {
          url: "http://prod.com/api/objects/2.0"
        },
      ],
      paths: {
        "/pathOne": {
          "get": {
            },
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

  it('should be ok with version in all servers and api version missing', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: "Test",
        description: "toto",
        contact: {
            email: "test@test.com",
            name: "toto"
        },
      },
      servers:[
        {
          url: "http://test.com/api/v2.0"
        },
        {
          url: "http://prod.com/api/objects/3.0"
        },
      ],
      paths: {
        "/pathOne": {
          "get": {
            },
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

  it('should be error with version incorrect in paths', () => {
    const spec = {
      openapi: '3.0.0',
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
        "/v1/pathOne": {
          "get": {
            },
          },
        "/1.1/pathTwo": {
          "get": {
          },
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual(['paths', '/1.1/pathTwo']);
    expect(res.errors[0].message).toContain("Version in path doesn't match API version ");
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual(['servers']);
    expect(res.warnings[0].message).toEqual("Version should be declared in basePath or servers URL, not in paths.");
  });

  it('should be error and warnings with version incorrect in server and version duplication', () => {
      const spec = {
        openapi: '3.0.0',
        info: {
          title: "Test",
          version: "1.0.2.1",
          description: "toto",
          contact: {
              email: "test@test.com",
              name: "toto"
          },
        },
        servers:[
          {
            url: "http://test.com/api/v3.0.1"
          },
          {
            url: "http://prod.com/api/objects/1.0"
          },
          {
            url: "http://prod.com/api/objects/1.0/v1"
          },
          {
            url: "http://prod.com/api/objects/1.0/v2"
          },
          {
            url: "http://prod.com/api/objects/1.0.3"
          },
        ],
        paths: {
          "/pathOne": {
            "get": {
              },
            },
          "/pathTwo": {
            "get": {
            },
          },
          "/v1/pathThree": {
            "get": {
            },
          }
        }
      };
  
      const res = validate({ jsSpec: spec }, config);

      expect(res.errors.length).toEqual(3);
      expect(res.errors[0].path).toEqual(['servers', '0', 'url']);
      expect(res.errors[0].message).toContain("Version in server doesn't match API version");
      expect(res.errors[1].path).toEqual(['servers', '3', 'url']);
      expect(res.errors[1].message).toContain("Version in server doesn't match API version");
      expect(res.errors[2].path).toEqual(['servers', '4', 'url']);
      expect(res.errors[2].message).toContain("Version in server doesn't match API version");

      expect(res.warnings.length).toEqual(3);
      expect(res.warnings[0].path).toEqual(['servers', '2', 'url']);
      expect(res.warnings[0].message).toEqual("Version identifier is duplicate in url.");
      expect(res.warnings[1].path).toEqual(['servers', '3', 'url']);
      expect(res.warnings[1].message).toEqual("Version identifier is duplicate in url.");
      expect(res.warnings[2].path).toEqual(['paths', '/v1/pathThree']);
      expect(res.warnings[2].message).toEqual("Version identifier of basePath/server is duplicate in path.");
    });

    it('should be error with version missing in one path', () => {
      const spec = {
        openapi: '3.0.0',
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
          "/v1/pathOne": {
            "get": {
              },
            },
          "/pathTwo": {
            "get": {
            },
          },          
          "/v1/1.0/pathThree": {
            "get": {
              },
            },
        }
      };
  
      const res = validate({ jsSpec: spec }, config);
      expect(res.errors.length).toEqual(1);
      expect(res.errors[0].path).toEqual(['servers']);
      expect(res.errors[0].message).toEqual("Version should be declared in basePath or servers URL, not in paths, or it should be in all paths.");

      expect(res.warnings.length).toEqual(1);
      expect(res.warnings[0].path).toEqual(['paths', "/v1/1.0/pathThree"]);
      expect(res.warnings[0].message).toEqual("Version identifier is duplicate in path.");
    });

    it('should be error with version missing in all paths and servers', () => {
      const spec = {
        openapi: '3.0.0',
        info: {
          title: "Test",
          version: "1.0",
          description: "toto",
          contact: {
              email: "test@test.com",
              name: "toto"
          },
        },
        servers:[
          {
            url: "http://test.com/api"
          },
          {
            url: "http://prod.com/api/objects"
          },
        ],
        paths: {
          "/pathOne": {
            "get": {
              },
            },
          "/pathTwo": {
            "get": {
            },
          },
        }
      };
  
      const res = validate({ jsSpec: spec }, config);
      expect(res.errors.length).toEqual(1);
      expect(res.errors[0].path).toEqual(['servers']);
      expect(res.errors[0].message).toEqual("Version must be defined in basePath/server (recommended), or in each path, but is missing.");
    });
    
    it('should be error with version missing in one server and duplicate version', () => {
      const spec = {
        openapi: '3.0.0',
        info: {
          title: "Test",
          version: "1.0",
          description: "toto",
          contact: {
              email: "test@test.com",
              name: "toto"
          },
        },
        servers:[
          {
            url: "http://test.com/api/v1"
          },
          {
            url: "http://prod.com/api/objects"
          },
          {
            url: "http://back.com/api/objects"
          },
        ],
        paths: {
          "/pathOne": {
            "get": {
              },
            },
          "/1.0/pathTwo": {
            "get": {
            },
          }
        }
      };
  
      const res = validate({ jsSpec: spec }, config);
      expect(res.errors.length).toEqual(1);
      expect(res.errors[0].path).toEqual(['servers']);
      expect(res.errors[0].message).toContain("Version must be declared in all servers, or in none, but is missing in elements");

      expect(res.warnings.length).toEqual(1);
      expect(res.warnings[0].path).toEqual(['paths','/1.0/pathTwo']);
      expect(res.warnings[0].message).toEqual("Version identifier of basePath/server is duplicate in path.");
    });

});

describe('validation plugin - semantic - check-version in path for swagger2', () => {

  //this is for swagger object
  it('should be ok with version in all paths', () => {
    const spec = {
      Swagger: '2.0',
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
        "/v1/pathOne": {
          "get": {
            },
          },
        "/1.0/pathTwo": {
          "get": {
          },
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual(['basePath']);
    expect(res.warnings[0].message).toEqual("Version should be declared in basePath or servers URL, not in paths.");
  });

  //this is for swagger object
  it('should be ok with version in all paths and api version missing', () => {
    const spec = {
      Swagger: '2.0',
      info: {
        title: "Test",
        description: "toto",
        contact: {
            email: "test@test.com",
            name: "toto"
        },
      },
      paths: {
        "/v1/pathOne": {
          "get": {
            },
          },
        "/2.0/pathTwo": {
          "get": {
          },
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual(['basePath']);
    expect(res.warnings[0].message).toEqual("Version should be declared in basePath or servers URL, not in paths.");
  });

  it('should be ok with version in basePath', () => {
    const spec = {
      Swagger: '2.0',
      info: {
        title: "Test",
        version: "2.0.0",
        description: "toto",
        contact: {
            email: "test@test.com",
            name: "toto"
        },
      },
      basePath: "/api/v2.0/",
      paths: {
        "/pathOne": {
          "get": {
            },
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

  it('should be ok with version in basePath api version missing', () => {
    const spec = {
      Swagger: '2.0',
      info: {
        title: "Test",
        description: "toto",
        contact: {
            email: "test@test.com",
            name: "toto"
        },
      },
      basePath: "/api/v2.0/",
      paths: {
        "/pathOne": {
          "get": {
            },
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

  it('should be warning with duplicate version in basePath', () => {
    const spec = {
      Swagger: '2.0',
      info: {
        title: "Test",
        version: "2.0.0",
        description: "toto",
        contact: {
            email: "test@test.com",
            name: "toto"
        },
      },
      basePath: "/api/v2/2.0.0",
      paths: {
        "/pathOne": {
          "get": {
            },
          },
        "/pathTwo": {
          "get": {
          },
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual(['basePath']);
    expect(res.warnings[0].message).toEqual("Version identifier is duplicate in basePath.");
  });

  it('should be errors with incorrect version in basePath', () => {
    const spec = {
      Swagger: '2.0',
      info: {
        title: "Test",
        version: "2.0.0",
        description: "toto",
        contact: {
            email: "test@test.com",
            name: "toto"
        },
      },
      basePath: "/api/v3.0/",
      paths: {
        "/pathOne": {
          "get": {
            },
          },
        "/pathTwo": {
          "get": {
          },
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual(['basePath']);
    expect(res.errors[0].message).toContain("Version in basePath doesn't match API version");
    expect(res.warnings.length).toEqual(0);
  });

  it('should be errors with no version in basePath and only in one path', () => {
    const spec = {
      Swagger: '2.0',
      info: {
        title: "Test",
        version: "3.0.0",
        description: "toto",
        contact: {
            email: "test@test.com",
            name: "toto"
        },
      },
      basePath: "/api",
      paths: {
        "/v3/3.0.0/pathOne": {
          "get": {
            },
          },
        "/pathTwo": {
          "get": {
          },
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual(['basePath']);
    expect(res.errors[0].message).toContain("Version should be declared in basePath or servers URL, not in paths, or it should be in all paths.");
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual(['paths','/v3/3.0.0/pathOne']);
    expect(res.warnings[0].message).toContain("Version identifier is duplicate in path.");
  });
 
});
