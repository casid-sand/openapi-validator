const expect = require('expect');
const checkCase = require('../../../src/plugins/utils/caseConventionCheck');

describe('case convention regex tests', function() {
  describe('lower snake case tests', function() {
    const convention = 'lower_snake_case';

    it('sha1 is snake case', function() {
      const string = 'sha1';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('good_case_string is snake case', function() {
      const string = 'good_case_string';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('badCaseString is NOT snake case', function() {
      const string = 'badCaseString';
      expect(checkCase(string, convention)).toEqual(false);
    });
  });

  describe('upper snake case tests', function() {
    const convention = 'upper_snake_case';

    it('SHA1 is upper snake case', function() {
      const string = 'SHA1';
      expect(checkCase(string, convention)).toEqual(true);
    });
    it('sha1 is NOT upper snake case', function() {
      const string = 'sha1';
      expect(checkCase(string, convention)).toEqual(false);
    });

    it('good_case_string is NOT upper_snake_case', function() {
      const string = 'good_case_string';
      expect(checkCase(string, convention)).toEqual(false);
    });

    it('GOOD_CASE_STRING is upper_snake_case', function() {
      const string = 'GOOD_CASE_STRING';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('badCaseString is NOT upper_snake_case', function() {
      const string = 'badCaseString';
      expect(checkCase(string, convention)).toEqual(false);
    });
  });

  describe('all snake case tests', function() {
    const convention = 'all_snake_case';

    it('SHA1 is all snake case', function() {
      const string = 'SHA1';
      expect(checkCase(string, convention)).toEqual(true);
    });
    it('sha1 is all snake case', function() {
      const string = 'sha1';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('good_Case_string is all_snake_case', function() {
      const string = 'good_case_string';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('GOOD_CASE_STRING is all_snake_case', function() {
      const string = 'GOOD_CASE_STRING';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('badCaseString is NOT all_snake_case', function() {
      const string = 'badCaseString';
      expect(checkCase(string, convention)).toEqual(false);
    });

    it('bad-Case-String is NOT all_snake_case', function() {
      const string = 'bad-Case-String';
      expect(checkCase(string, convention)).toEqual(false);
    });
  });

  describe('upper camel case tests', function() {
    const convention = 'upper_camel_case';
    it('Sha1 is upper camel case', function() {
      const string = 'Sha1';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('GoodCaseString is upper camel case', function() {
      const string = 'GoodCaseString';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('badCaseString is NOT upper camel case', function() {
      const string = 'badCaseString';
      expect(checkCase(string, convention)).toEqual(false);
    });

    it('does not hang on long identifiers', function() {
      const string = 'downloadGeneratedApplicationUsingGET';
      expect(checkCase(string, convention)).toEqual(false);
    });
  });

  describe('lower camel case tests', function() {
    const convention = 'lower_camel_case';
    it('sha1 is lower camel case', function() {
      const string = 'sha1';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('goodCaseString is lower camel case', function() {
      const string = 'goodCaseString';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('BadCaseString is NOT lower camel case', function() {
      const string = 'BadCaseString';
      expect(checkCase(string, convention)).toEqual(false);
    });

    it('does not hang on long identifiers', function() {
      const string = 'downloadGeneratedApplicationUsingGET';
      expect(checkCase(string, convention)).toEqual(false);
    });
  });

  describe('all camel case tests', function() {
    const convention = 'all_camel_case';

    it('sha1 is all camel case', function() {
      const string = 'sha1';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('goodCaseString is all camel case', function() {
      const string = 'goodCaseString';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('GoodCaseString is all camel case', function() {
      const string = 'GoodCaseString';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('does not hang on long identifiers', function() {
      const string = 'downloadGeneratedApplicationUsingGET';
      expect(checkCase(string, convention)).toEqual(false);
    });

    it('bad-Case-String is NOT all_camel_case', function() {
      const string = 'bad-Case-String';
      expect(checkCase(string, convention)).toEqual(false);
    });

    it('bad_Case_String is NOT all_camel_case', function() {
      const string = 'bad_Case_String';
      expect(checkCase(string, convention)).toEqual(false);
    });
  });

  describe('k8s camel case tests', function() {
    const convention = 'k8s_camel_case';
    it('apiVersion is k8s camel case', function() {
      const string = 'apiVersion';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('hostPID is k8s camel case', function() {
      const string = 'hostPID';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('ApiVersion is NOT k8s camel case', function() {
      const string = 'ApiVersion';
      expect(checkCase(string, convention)).toEqual(false);
    });

    it('isGIFOrJPEG is k8s camel case', function() {
      const string = 'isGIFOrJPEG';
      expect(checkCase(string, convention)).toEqual(true);
    });
  });

  describe('k8s upper camel case tests', function() {
    const convention = 'k8s_upper_camel_case';
    it('ApiVersion is k8s Upper camel case', function() {
      const string = 'ApiVersion';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('HostPID is k8s Upper camel case', function() {
      const string = 'HostPID';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('apiVersion is NOT k8s upper camel case', function() {
      const string = 'apiVersion';
      expect(checkCase(string, convention)).toEqual(false);
    });

    it('IsGIFOrJPEG is k8s Upper camel case', function() {
      const string = 'IsGIFOrJPEG';
      expect(checkCase(string, convention)).toEqual(true);
    });
  });

  describe('k8s all camel case tests', function() {
    const convention = 'k8s_all_camel_case';
    it('ApiVersion is k8s all camel case', function() {
      const string = 'ApiVersion';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('HostPID is k8s all camel case', function() {
      const string = 'HostPID';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('apiVersion is k8s all camel case', function() {
      const string = 'apiVersion';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('IsGIFOrJPEG is k8s Upper camel case', function() {
      const string = 'IsGIFOrJPEG';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('bad-Case-String is NOT k8s all_camel_case', function() {
      const string = 'bad-Case-String';
      expect(checkCase(string, convention)).toEqual(false);
    });

    it('bad_Case_String is NOT k8s all_camel_case', function() {
      const string = 'bad_Case_String';
      expect(checkCase(string, convention)).toEqual(false);
    });
  });

  describe('lower dash case tests', function() {
    const convention = 'lower_dash_case';
    it('sha1 is lower dash case', function() {
      const string = 'sha1';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('good-case-string is lower dash case', function() {
      const string = 'good-case-string';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('Bad-Case-String is NOT lower dash case', function() {
      const string = 'Bad-Case-String';
      expect(checkCase(string, convention)).toEqual(false);
    });
  });

  describe('upper dash case tests', function() {
    const convention = 'upper_dash_case';
    it('sha1 is NOT upper_dash_case', function() {
      const string = 'sha1';
      expect(checkCase(string, convention)).toEqual(false);
    });

    it('SHA1 is upper_dash_case', function() {
      const string = 'SHA1';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('bad-case-string is NOT upper_dash_case', function() {
      const string = 'bad-case-string';
      expect(checkCase(string, convention)).toEqual(false);
    });
    it('GOOD-CASE-STRING is upper_dash_case', function() {
      const string = 'GOOD-CASE-STRING';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('Bad-Case-String is NOT upper_dash_case', function() {
      const string = 'Bad-Case-String';
      expect(checkCase(string, convention)).toEqual(false);
    });
    it('badCaseString is NOT upper_dash_case', function() {
      const string = 'badCaseString';
      expect(checkCase(string, convention)).toEqual(false);
    });
  });

  describe('all dash case tests', function() {
    const convention = 'all_dash_case';
    it('sha1 is all_dash_case', function() {
      const string = 'sha1';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('SHA1 is all_dash_case', function() {
      const string = 'SHA1';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('good-case-string is all_dash_case', function() {
      const string = 'good-case-string';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('GOOD-CASE-STRING is all_dash_case', function() {
      const string = 'GOOD-CASE-STRING';
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('Bad_Case_String is NOT all_dash_case', function() {
      const string = 'Bad_Case_String';
      expect(checkCase(string, convention)).toEqual(false);
    });

    it('badCaseString is NOT all_dash_case', function() {
      const string = 'badCaseString';
      expect(checkCase(string, convention)).toEqual(false);
    });
  });
});
