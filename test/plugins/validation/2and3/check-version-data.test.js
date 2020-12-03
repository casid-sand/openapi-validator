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

  //this is for openapi object
  it('should be ok with version in all paths', () => {
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
    expect(res.warnings.length).toEqual(0);
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

    console.log(res.errors)
    console.log(res.errors[0])

    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(0);
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
    expect(res.warnings.length).toEqual(0);
  });

  it('should be ok with version in all paths', () => {
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
 
});
