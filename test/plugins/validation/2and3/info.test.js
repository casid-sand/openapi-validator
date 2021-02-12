const config = require('../../../../src/.defaultsForValidator').defaults.shared;
const expect = require('expect');
const {
  validate
} = require('../../../../src/plugins/validation/2and3/semantic-validators/info');

describe('validation plugin - semantic - info', () => {
  //this is for openapi object
  it('should return an error when a parameter does not have info', () => {
    const spec = {
      openapi: '3.0.0'
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
      openapi: '3.0.0',
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
      openapi: '3.0.0',
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
      openapi: '3.0.0',
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
      openapi: '3.0.0',
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
      openapi: '3.0.0',
      info: {
        title: '32',
        contact: {
          name: 'test',
          email: 'test@def.gouv.fr'
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual(['info', 'version']);
    expect(res.errors[0].message).toEqual(
      '`info` object must have a string-type `version` field'
    );
  });

  it('should return an error when a version is not good', () => {
    const versionRegexConfig = {
      info: {
        version_regex_rule: 'error'
      }
    };
    
    const spec = {
      openapi: '3.0.0',
      info: {
        title: '32',
        version: 'beta-test 1.0.1.4.5',
        contact: {
          name: 'test',
          email: 'test@def.gouv.fr'
        }
      }
    };

    const res = validate({ jsSpec: spec }, versionRegexConfig);
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual(['info', 'version']);
    expect(res.errors[0].message).toEqual('`info` object must have a version number like X.Y.z (or X.Y or X.Y-rc1)');
  });

  it('should return an error when version is not good', () => {
    const versionRegexConfig = {
      info: {
        version_regex_rule: 'error'
      }
    };
    
    const spec = {
      openapi: '3.0.0',
      info: {
        title: '32',
        version: 'toto',
        contact: {
          name: 'test',
          email: 'test@def.gouv.fr'
        }
      }
    };

    const res = validate({ jsSpec: spec }, versionRegexConfig);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual(['info', 'version']);
    expect(res.errors[0].message).toEqual('`info` object must have a version number like X.Y.z (or X.Y or X.Y-rc1)');
    expect(res.errors[0].type).toEqual('convention');
    expect(res.errors[0].customizedRule).toEqual('CTMO.Regle-11');
  });

  it('should return 1 warning if version is not x.y.z', () => {
    const versionRegexConfig = {
      info: {
        version_regex_rule: 'error'
      }
    };
    
    const spec = {
      openapi: '3.0.0',
      info: {
        title: '32',
        version: '1.2-rc3',
        contact: {
          name: 'test',
          email: 'test@def.gouv.fr'
        }
      }
    };

    const res = validate({ jsSpec: spec }, versionRegexConfig);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual(['info', 'version']);
    expect(res.warnings[0].message).toEqual('`info` object should have a version number like X.Y.z');
    expect(res.warnings[0].type).toEqual('convention');
    expect(res.warnings[0].customizedRule).toEqual('CTMO.Regle-11');
  });

  it('should return 1 warning if version is not x.y.z', () => {
    const versionRegexConfig = {
      info: {
        version_regex_rule: 'error'
      }
    };
    
    const spec = {
      openapi: '3.0.0',
      info: {
        title: '32',
        version: 'version 1.2.4.5',
        contact: {
          name: 'test',
          email: 'test@def.gouv.fr'
        }
      }
    };

    const res = validate({ jsSpec: spec }, versionRegexConfig);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual(['info', 'version']);
    expect(res.warnings[0].message).toEqual('`info` object should have a version number like X.Y.z');
    expect(res.warnings[0].type).toEqual('convention');
    expect(res.warnings[0].customizedRule).toEqual('CTMO.Regle-11');
  });

  it('should be ok if version is good - numbers only', () => {
    const versionRegexConfig = {
      info: {
        version_regex_rule: 'error'
      }
    };
    
    const spec = {
      openapi: '3.0.0',
      info: {
        title: '32',
        version: '10.2.37',
        contact: {
          name: 'test',
          email: 'test@def.gouv.fr'
        }
      }
    };

    const res = validate({ jsSpec: spec }, versionRegexConfig);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(0);
  });

  it('should be ok if version is good - v x.y.z', () => {
    const versionRegexConfig = {
      info: {
        version_regex_rule: 'error'
      }
    };
    
    const spec = {
      openapi: '3.0.0',
      info: {
        title: '32',
        version: 'v1.0.1',
        contact: {
          name: 'test',
          email: 'test@def.gouv.fr'
        }
      }
    };

    const res = validate({ jsSpec: spec }, versionRegexConfig);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(0);
  });

  //Nouveaux tests implémentés
  it('should return 2 errors when version and title is missing', () => {
    const spec = {
      swagger: '2.0',
      info: {
        contact: {
          email: 'test@def.gouv.fr',
          name: 'toto'
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(0);
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
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual(['info', 'contact']);
    expect(res.warnings[0].message).toEqual(
      '`info` object must have a `contact` object'
    );
  });

  it('should return an error when contact is not an object', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: '32',
        version: 'v2.0',
        contact: 'toto'
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual(['info', 'contact']);
    expect(res.warnings[0].message).toEqual(
      '`info` object must have a `contact` object'
    );
  });
  
  it('should return an error when contact email is missing', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: '32',
        version: 'v2.0',
        contact: {
        	name: "toto"
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual(['info', 'contact', 'email']);
    expect(res.warnings[0].message).toEqual(
    	'`contact` object must have a string-type `email` field'
    );
  });

  it('should be ok with 1 warning if contact email is a string and name is missing', () => {
    const spec = {
      openapi: '3.0.0',
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

  it('should be ok if domain is ok', () => {
    const emailConfig = {
      info: {
        contact_email_domain: [
            'error',
            "test.com"
        ]
      }
    };
    
    const spec = {
      openapi: '3.0.0',
      info: {
        title: '32',
        version: 'v2.0',
        contact: {
            email: "toto@test.com",
            name: 'toto'
        }
      }
    };

    const res = validate({ jsSpec: spec }, emailConfig);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(0);
  });

  it('should return 1 error if domain is bad', () => {
    const emailConfig = {
      info: {
        contact_email_domain: [
            'error',
            "@test.com"
        ]
      }
    };
    
    const spec = {
      openapi: '3.0.0',
      info: {
        title: '32',
        version: 'v2.0',
        contact: {
            email: "toto@baddomain.com",
            name: 'toto'
        }
      }
    };

    const res = validate({ jsSpec: spec }, emailConfig);
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual(['info', 'contact', 'email']);
    expect(res.errors[0].message).toContain(
    	"'contact.email' object must have domain "
    );
    expect(res.errors[0].type).toEqual('structural');
    expect(res.errors[0].customizedRule).toEqual('CTMO.STANDARD-CODAGE-22');
  });

it('should return 1 error if email is not email adress', () => {
    const emailConfig = {
      info: {
        contact_email_domain: [
            'error',
            "@test.com"
        ]
      }
    };
    
    const spec = {
      openapi: '3.0.0',
      info: {
        title: '32',
        version: 'v2.0',
        contact: {
            email: "toto",
            name: 'toto'
        }
      }
    };

    const res = validate({ jsSpec: spec }, emailConfig);
    expect(res.errors.length).toEqual(1);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors[0].path).toEqual(['info', 'contact', 'email']);
    expect(res.errors[0].message).toContain(
    	"'contact.email' object must have domain"
    );
  });

  it('should return 1 error if description is missing', () => {
    config.info.no_description = 'error';
    
    const spec = {
      openapi: '3.0.0',
      info: {
        title: '32',
        version: 'v2.0',
        contact: {
            email: "toto@test.com",
            name: "toto"
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual(['info', 'description']);
    expect(res.errors[0].message).toEqual(
    	'API must have a non-empty description.'
    );
    expect(res.errors[0].type).toEqual(
    	'documentation'
    );
    expect(res.errors[0].customizedRule).toEqual(
    	'D19.15'
    );
  });

  it('should return 1 warning if description is shorter than 50 chars', () => {
    config.info.no_description = 'error';
    
    const spec = {
      openapi: '3.0.0',
      info: {
        title: '32',
        version: 'v2.0',
        description: 'shorter than 50 characters',
        contact: {
            email: "toto@test.com",
            name: "toto"
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual(['info', 'description']);
    expect(res.warnings[0].message).toEqual(
    	'API description should be longer than 50 characters.'
    );
    expect(res.warnings[0].type).toEqual(
    	'documentation'
    );
    expect(res.warnings[0].customizedRule).toEqual(
    	'D19.15'
    );
  });

  it('should be ok if description is longer than 50 chars', () => {
    config.info.no_description = 'error';
    
    const spec = {
      openapi: '3.0.0',
      info: {
        title: '32',
        version: 'v2.0',
        description: 'a description that is longer than 50 characters and enough for reading by a consumer of API to understand description',
        contact: {
            email: "toto@test.com",
            name: "toto"
        }
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(0);
  });
 
});
