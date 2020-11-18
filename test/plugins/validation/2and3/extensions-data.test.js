const expect = require('expect');
const {
  validate
} = require('../../../../src/plugins/validation/2and3/semantic-validators/extensions-data');

describe('validation plugin - semantic - extension data', () => {

    const config = {
        extensions: {
        data_extensions: 'error'
        }
    };
  //this is for openapi object
  it('should be ok with all extensions on info', () => {
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
      }
    };

    const res = validate({ jsSpec: spec }, config);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(0);
  });
 
});
