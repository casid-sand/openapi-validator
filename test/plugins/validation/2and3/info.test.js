const config = require('../../../../src/.defaultsForValidator').defaults.shared;
const expect = require('expect');
const {
  validate
} = require('../../../../src/plugins/validation/2and3/semantic-validators/info');

describe('validation plugin - semantic - info', () => {
  //this is for openapi object
  it('should return an error when a parameter does not have info', () => {
    const spec = {
      Openapi: '3.0.0'
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual(['info']);
    expect(res.errors[0].message).toEqual(
      'API definition must have an `info` object'
    );
  });
  it('should return an error when a info is not defined as a proper object', () => {
    const spec = {
      Openapi: '3.0.0',
      info: 'abc'
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual(['info']);
    expect(res.errors[0].message).toEqual(
      'API definition must have an `info` object'
    );
  });
  it('should return an error when a title (and version) is not a string', () => {
    const spec = {
      Openapi: '3.0.0',
      info: {
        title: 32,
        version: '32',
        contact: {
          name: 'test',
          email: 'test@def.gouv.fr'
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual(['info', 'title']);
    expect(res.errors[0].message).toEqual(
      '`info` object must have a string-type `title` field'
    );
  });
  it('should return an error when a (title and) version is not a string', () => {
    const spec = {
      Openapi: '3.0.0',
      info: {
        title: '32',
        version: 32,
        contact: {
          name: 'test',
          email: 'test@def.gouv.fr'
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual(['info', 'version']);
    expect(res.errors[0].message).toEqual(
      '`info` object must have a string-type `version` field'
    );
  });
  it('should return an error when a title is missing', () => {
    const spec = {
      Openapi: '3.0.0',
      info: {
        version: '32',
        contact: {
          name: 'test',
          email: 'test@def.gouv.fr'
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual(['info', 'title']);
    expect(res.errors[0].message).toEqual(
      '`info` object must have a string-type `title` field'
    );
  });

  it('should return an error when a version is missing', () => {
    const spec = {
      Openapi: '3.0.0',
      info: {
        title: '32',
        contact: {
          name: 'test',
          email: 'test@def.gouv.fr'
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual(['info', 'version']);
    expect(res.errors[0].message).toEqual(
      '`info` object must have a string-type `version` field'
    );
  });

  //Nouveaux tests implémentés
  it('should return 2 errors when version and title is missing', () => {
    const spec = {
      swagger: '2.0',
      info: {
        contact: {
          email: 'test@def.gouv.fr'
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].path).toEqual(['info', 'title']);
    expect(res.errors[1].path).toEqual(['info', 'version']);
  });

  it('should return an error when contact object is missing', () => {
    const spec = {
      swagger: '2.0',
      info: {
        title: '32',
        version: 'v2.0'
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual(['info', 'contact']);
    expect(res.errors[0].message).toEqual(
      '`info` object must have a `contact` object'
    );
  });

  it('should return an error when contact is not an object', () => {
    const spec = {
      Openapi: '3.0.0',
      info: {
        title: '32',
        version: 'v2.0',
        contact: 'toto'
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual(['info', 'contact']);
    expect(res.errors[0].message).toEqual(
      '`info` object must have a `contact` object'
    );
  });
  
  it('should return an error when contact email is missing', () => {
    const spec = {
      Openapi: '3.0.0',
      info: {
        title: '32',
        version: 'v2.0',
        contact: {
        	name: "toto"
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual(['info', 'contact', 'email']);
    expect(res.errors[0].message).toEqual(
    	'`contact` object must have a string-type `email` field'
    );
  });
  
  it('should be ok with 1 warning if contact email is a string and name is missing', () => {
    const spec = {
      Openapi: '3.0.0',
      info: {
        title: '32',
        version: 'v2.0',
        contact: {
        	email: "toto@test.com"
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual(['info', 'contact', 'name']);
    expect(res.warnings[0].message).toEqual(
    	'`contact` object must have a string-type `name` field'
    );
  });
});
