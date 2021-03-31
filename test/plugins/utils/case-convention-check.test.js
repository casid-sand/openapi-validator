const expect = require('expect');
const checkCase = require('../../../src/plugins/utils/caseConventionCheck');
const MessageCarrier = require('../../../src/plugins/utils/messageCarrier');
const { getCapturedText } = require('../../test-utils');

describe('case convention regex tests', function() {
    
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

    it('should return error if case is not supported', function() {
      const string = 'sha1';
      expect(checkCase(string, "testCase")).toEqual(undefined);
    });
  
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

  describe('lower dash with first upper case tests', function() {
    const convention = 'dash_first_upper_case';
    const convention_spinal = 'spinal_first_upper_case';
    let string;
    
    it(`Good-Case-String is dash case first upper`, function() {
      string = 'Good-Case-String';
      expect(checkCase(string, convention)).toEqual(true);
      expect(checkCase(string, convention_spinal)).toEqual(true);
    });
    
    it(`Learning-OptionOut-API is dash case first upper`, function() {
      string = 'Learning-OptionOut-API';
      expect(checkCase(string, convention)).toEqual(true);
      expect(checkCase(string, convention_spinal)).toEqual(true);
    });

    it(`bad-case-string is NOT dash case first upper`, function() {
      string = 'bad-case-string';
      expect(checkCase(string, convention)).toEqual(false);
      expect(checkCase(string, convention_spinal)).toEqual(false);
    });

    it(`GoodCase is dash case first upper`, function() {
      string = 'GoodCase';
      expect(checkCase(string, convention)).toEqual(true);
      expect(checkCase(string, convention_spinal)).toEqual(true);
    });

    it(`API is dash case first upper`, function() {
      string = 'API';
      expect(checkCase(string, convention)).toEqual(true);
      expect(checkCase(string, convention_spinal)).toEqual(true);
    });

    it(`bad_case_string is NOT dash case first upper`, function() {
      string = 'bad_case_string';
      expect(checkCase(string, convention)).toEqual(false);
      expect(checkCase(string, convention_spinal)).toEqual(false);
    });

    it(`Bad-case-string is NOT dash case first upper`, function() {
      string = 'Bad-case-string';
      expect(checkCase(string, convention)).toEqual(false);
      expect(checkCase(string, convention_spinal)).toEqual(false);
    });

    it(`Bad-Case--String is NOT dash case first upper`, function() {
      string = 'Bad-Case--String';
      expect(checkCase(string, convention)).toEqual(false);
      expect(checkCase(string, convention_spinal)).toEqual(false);
    });
  });

  describe('lower dash case tests', function() {
    const convention = 'lower_dash_case';
    const convention_spinal = 'lower_spinal_case';
    it('sha1 is lower dash case', function() {
      const string = 'sha1';
      expect(checkCase(string, convention)).toEqual(true);
      expect(checkCase(string, convention_spinal)).toEqual(true);
    });

    it('good-case-string is lower dash case', function() {
      const string = 'good-case-string';
      expect(checkCase(string, convention)).toEqual(true);
      expect(checkCase(string, convention_spinal)).toEqual(true);
    });

    it('Bad-Case-String is NOT lower dash case', function() {
      const string = 'Bad-Case-String';
      expect(checkCase(string, convention)).toEqual(false);
      expect(checkCase(string, convention_spinal)).toEqual(false);
    });
  });

  describe('upper dash case tests', function() {
    const convention = 'upper_dash_case';
    const convention_spinal = 'upper_spinal_case';
    it('sha1 is NOT upper_dash_case', function() {
      const string = 'sha1';
      expect(checkCase(string, convention)).toEqual(false);
      expect(checkCase(string, convention_spinal)).toEqual(false);
    });

    it('SHA1 is upper_dash_case', function() {
      const string = 'SHA1';
      expect(checkCase(string, convention)).toEqual(true);
      expect(checkCase(string, convention_spinal)).toEqual(true);
    });

    it('bad-case-string is NOT upper_dash_case', function() {
      const string = 'bad-case-string';
      expect(checkCase(string, convention)).toEqual(false);
      expect(checkCase(string, convention_spinal)).toEqual(false);
    });

    it('GOOD-CASE-STRING is upper_dash_case', function() {
      const string = 'GOOD-CASE-STRING';
      expect(checkCase(string, convention)).toEqual(true);
      expect(checkCase(string, convention_spinal)).toEqual(true);
    });

    it('Bad-Case-String is NOT upper_dash_case', function() {
      const string = 'Bad-Case-String';
      expect(checkCase(string, convention)).toEqual(false);
      expect(checkCase(string, convention_spinal)).toEqual(false);
    });

    it('badCaseString is NOT upper_dash_case', function() {
      const string = 'badCaseString';
      expect(checkCase(string, convention)).toEqual(false);
      expect(checkCase(string, convention_spinal)).toEqual(false);
    });
  });

  describe('all dash case tests', function() {
    const convention = 'all_dash_case';
    const convention_spinal = 'all_spinal_case';
    it('sha1 is all_dash_case', function() {
      const string = 'sha1';
      expect(checkCase(string, convention)).toEqual(true);
      expect(checkCase(string, convention_spinal)).toEqual(true);
    });

    it('SHA1 is all_dash_case', function() {
      const string = 'SHA1';
      expect(checkCase(string, convention)).toEqual(true);
      expect(checkCase(string, convention_spinal)).toEqual(true);
    });

    it('good-case-string is all_dash_case', function() {
      const string = 'good-case-string';
      expect(checkCase(string, convention)).toEqual(true);
      expect(checkCase(string, convention_spinal)).toEqual(true);
    });

    it('GOOD-CASE-STRING is all_dash_case', function() {
      const string = 'GOOD-CASE-STRING';
      expect(checkCase(string, convention)).toEqual(true);
      expect(checkCase(string, convention)).toEqual(true);
    });

    it('Bad_Case_String is NOT all_dash_case', function() {
      const string = 'Bad_Case_String';
      expect(checkCase(string, convention)).toEqual(false);
      expect(checkCase(string, convention_spinal)).toEqual(false);
    });

    it('badCaseString is NOT all_dash_case', function() {
      const string = 'badCaseString';
      expect(checkCase(string, convention)).toEqual(false);
      expect(checkCase(string, convention_spinal)).toEqual(false);
    });

  });
});

describe('case convention example tests', function() {

    it('should return good examples', function() {
        expect(checkCase.getCaseConventionExample("lower_snake_case")).toEqual("'lower_snake_case'");
        expect(checkCase.getCaseConventionExample("upper_snake_case")).toEqual("'UPPER_SNAKE_CASE'");
        expect(checkCase.getCaseConventionExample("all_snake_case")).toEqual("'lower_snake_case' or 'UPPER_SNAKE_CASE'");
        expect(checkCase.getCaseConventionExample("upper_camel_case")).toEqual("'UpperCamelCase'");
        expect(checkCase.getCaseConventionExample("lower_camel_case")).toEqual("'camelCase'");
        expect(checkCase.getCaseConventionExample("all_camel_case")).toEqual("'camelCase' or 'UpperCamelCase'");
        expect(checkCase.getCaseConventionExample("k8s_camel_case")).toEqual("'kubernetesAPICase'");
        expect(checkCase.getCaseConventionExample("k8s_upper_camel_case")).toEqual("'UpperKubernetesAPICase'");
        expect(checkCase.getCaseConventionExample("k8s_all_camel_case")).toEqual("'kubernetesAPICase' or 'UpperKubernetesAPICase'");
        expect(checkCase.getCaseConventionExample("lower_dash_case")).toEqual("'spinal-case'");
        expect(checkCase.getCaseConventionExample("upper_dash_case")).toEqual("'UPPER-SPINAL-CASE'");
        expect(checkCase.getCaseConventionExample("all_dash_case")).toEqual("'spinal-case' or 'UPPER-SPINAL-CASE'");
        expect(checkCase.getCaseConventionExample("lower_spinal_case")).toEqual("'spinal-case'");
        expect(checkCase.getCaseConventionExample("upper_spinal_case")).toEqual("'UPPER-SPINAL-CASE'");
        expect(checkCase.getCaseConventionExample("all_spinal_case")).toEqual("'spinal-case' or 'UPPER-SPINAL-CASE'");
        expect(checkCase.getCaseConventionExample("spinal_first_upper_case")).toEqual("'Spinal-FirstLetterUpper-Case'");
        expect(checkCase.getCaseConventionExample("dash_first_upper_case")).toEqual("'Spinal-FirstLetterUpper-Case'");
        expect(checkCase.getCaseConventionExample("unrecognized_case")).toEqual("Unsupported case: unrecognized_case");
    });

});

describe('case convention and alternative check tests', function() {

  
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

    it('should valid only default case', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('stringDefaultCase', 'lower_camel_case', 'error', 
            'lower_spinal_case', 'off', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
            
        expect(result).toEqual(true);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(0);
    });

    it('should valid only default case - passed in second param', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('stringDefaultCase', 
            'lower_spinal_case', 'off', 
            'lower_camel_case', 'warning', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
            
        expect(result).toEqual(true);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(0);
    });

    it('should valid only default case', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('stringDefaultCase', 'lower_camel_case', 'error', 
            null, null, 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
            
        expect(result).toEqual(true);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(0);
    });

    it('should valid only default case - passed in second param', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('stringDefaultCase', 
            'lower_spinal_case', undefined, 
            'lower_camel_case', 'error', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
            
        expect(result).toEqual(true);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(0);
    });

    it('should valid string if levels are off', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('stringDefault-Case_test', 
            'lower_snake_case', 'off', 
            'lower_spinal_case', 'off', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
            
        expect(result).toEqual(true);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(0);
    });

    it('should valid string if levels are undefined or null', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('stringDefault-Case_test', 'lower_snake_case', null, 
            'lower_spinal_case', null, 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
        expect(result).toEqual(true);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(0);

        result = checkCase.checkCaseConventionOrAlternativeCase('stringDefault-Case_test', 'lower_snake_case', undefined, 
            'lower_spinal_case', undefined, 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
        expect(result).toEqual(true);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(0);
    });

    it('should return errors if case is not supported', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('stringDefault-Case_test', 'unsupportedCase', 'error', 
            'lower_spinal_case', null, 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
        expect(result).toEqual(false);
        expect(messages.errors.length).toEqual(1);
        expect(messages.warnings.length).toEqual(0);
    });

    it('should return errors if case is not supported', function() {
        const messages = new MessageCarrier();
        let result;
        result = checkCase.checkCaseConventionOrAlternativeCase('stringDefault-Case_test', 'lower_snake_case', 'warning', 
            'unsupportedCase', 'error', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
        expect(result).toEqual(false);
        expect(messages.errors.length).toEqual(1);
        expect(messages.warnings.length).toEqual(0);
    });

    it('should only return true or false if messageCarrier is not passed', function() {
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('goodstring', 'lower_snake_case', 'warning', 
            'lower_spinal_case', 'warning', 
            undefined, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
        expect(result).toEqual(true);
        result = checkCase.checkCaseConventionOrAlternativeCase('stringDefault-Case_test', 'lower_snake_case', 'warning', 
            'lower_spinal_case', 'warning', 
            undefined, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
        expect(result).toEqual(false);
        result = checkCase.checkCaseConventionOrAlternativeCase('stringDefault-Case_test', 'lower_snake_case', 'error', 
            'lower_spinal_case', 'error', 
            undefined, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
        expect(result).toEqual(false);
        result = checkCase.checkCaseConventionOrAlternativeCase('string-default-case-test', 'lower_snake_case', 'error', 
            'lower_spinal_case', 'warning', 
            undefined, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
        expect(result).toEqual(false);
        result = checkCase.checkCaseConventionOrAlternativeCase('stringDefault-Case_test', 'lower_snake_case', undefined, 
            'lower_spinal_case', 'error', 
            undefined, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
        expect(result).toEqual(false);
    });
    
    it('should valid default string case - same level and error', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('string_default_case', 'lower_snake_case', 'error', 
            'lower_camel_case', 'error', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
            
        expect(result).toEqual(true);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(0);
    });

    it('should valid default string case - same level and warning', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('string_default_case', 'lower_snake_case', 'warning', 
            'lower_camel_case', 'warning', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
            
        expect(result).toEqual(true);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(0);
    });

    it('should valid default string case - same level and hint', function() {
      const messages = new MessageCarrier();
      let result;

      result = checkCase.checkCaseConventionOrAlternativeCase('string_default_case', 'lower_snake_case', 'hint', 
          'lower_camel_case', 'hint', 
          messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
          
      expect(result).toEqual(true);
      expect(messages.errors.length).toEqual(0);
      expect(messages.warnings.length).toEqual(0);
  });

    it('should valid default string case - different level and default is first', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('string_default_case', 
            'lower_snake_case', 'error', 
            'lower_camel_case', 'warning', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
            
        expect(result).toEqual(true);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(0);
    });

    it('should valid default string case - different level and default is second', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('string_default_case', 
            'lower_camel_case', 'warning', 
            'lower_snake_case', 'error', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
            
        expect(result).toEqual(true);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(0);
    });

    it('should valid alternative string - same level and error', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('stringAlternativeString', 'lower_snake_case', 'error', 
            'lower_camel_case', 'error', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
            
        expect(result).toEqual(true);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(0);
    });

    it('should valid alternative string - same level and warning', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('stringAlternativeString', 
            'lower_snake_case', 'warning', 
            'lower_camel_case', 'warning', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'CTMO.STANDARD-CODAGE-19');
            
        expect(result).toEqual(true);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(0);
    });

    it('should return a warning if string respect alternative case - and different level errors and alternative is second param', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('stringAlternativeString', 
            'lower_spinal_case', 'error', 
            'lower_camel_case', 'warning', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'EXAMPLE_RULE_ID');
            
        expect(result).toEqual(false);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(1);
        expect(messages.warnings[0].message).toEqual("Examples string should follow case convention: 'stringAlternativeString' doesn't respect 'spinal-case' ('camelCase' is accepted but not recommended).");
        expect(messages.warnings[0].path).toEqual("path_to");
        expect(messages.warnings[0].type).toEqual("convention");
        expect(messages.warnings[0].rule).toEqual('checkCaseConventionOrAlternativeCase');
        expect(messages.warnings[0].customizedRule).toEqual('EXAMPLE_RULE_ID');
    });

    it('should return a warning if string respect alternative case - and different level errors and alternative is first param', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('stringAlternativeString', 
            'lower_camel_case', 'warning', 
            'lower_spinal_case', 'error', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'EXAMPLE_RULE_ID');
            
        expect(result).toEqual(false);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(1);
        expect(messages.warnings[0].message).toEqual("Examples string should follow case convention: 'stringAlternativeString' doesn't respect 'spinal-case' ('camelCase' is accepted but not recommended).");
        expect(messages.warnings[0].path).toEqual("path_to");
        expect(messages.warnings[0].type).toEqual("convention");
        expect(messages.warnings[0].rule).toEqual('checkCaseConventionOrAlternativeCase');
        expect(messages.warnings[0].customizedRule).toEqual('EXAMPLE_RULE_ID');
    });

    it('should return a warning if string respect alternative case - and different levels info and notice and alternative is second param', function() {
      const messages = new MessageCarrier();
      let result;

      result = checkCase.checkCaseConventionOrAlternativeCase('stringAlternativeString', 
          'lower_camel_case', 'info', 
          'lower_spinal_case', 'notice', 
          messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'EXAMPLE_RULE_ID');
          
      expect(result).toEqual(false);
      expect(messages.errors.length).toEqual(0);
      expect(messages.warnings.length).toEqual(0);
      expect(messages.notices.length).toEqual(0);
      expect(messages.hints.length).toEqual(0);
      expect(messages.infos.length).toEqual(1);
      expect(messages.infos[0].message).toEqual("Examples string should follow case convention: 'stringAlternativeString' doesn't respect 'spinal-case' ('camelCase' is accepted but not recommended).");
      expect(messages.infos[0].path).toEqual("path_to");
      expect(messages.infos[0].type).toEqual("convention");
      expect(messages.infos[0].rule).toEqual('checkCaseConventionOrAlternativeCase');
      expect(messages.infos[0].customizedRule).toEqual('EXAMPLE_RULE_ID');
  });

    it('should return error if it does not respect default case - without alternative in second', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('stringAlternativeString', 
            'lower_camel_case', 'off', 
            'lower_spinal_case', 'warning', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'EXAMPLE_RULE_ID');
            
        expect(result).toEqual(false);
        expect(messages.errors.length).toEqual(0);
        expect(messages.warnings.length).toEqual(1);
        expect(messages.warnings[0].message).toEqual("Examples string must follow case convention: 'stringAlternativeString' doesn't respect 'spinal-case'.");
        expect(messages.warnings[0].path).toEqual("path_to");
        expect(messages.warnings[0].type).toEqual("convention");
        expect(messages.warnings[0].rule).toEqual('checkCaseConventionOrAlternativeCase');
        expect(messages.warnings[0].customizedRule).toEqual('EXAMPLE_RULE_ID');
    });

    it('should return error if it does not respect default case - without alternative in second', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('stringAlternativeString', 
            'lower_spinal_case', 'error', 
            'lower_camel_case', 'off', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'EXAMPLE_RULE_ID');
            
        expect(result).toEqual(false);
        expect(messages.warnings.length).toEqual(0);
        expect(messages.errors.length).toEqual(1);
        expect(messages.errors[0].message).toEqual("Examples string must follow case convention: 'stringAlternativeString' doesn't respect 'spinal-case'.");
        expect(messages.errors[0].path).toEqual("path_to");
        expect(messages.errors[0].type).toEqual("convention");
        expect(messages.errors[0].rule).toEqual('checkCaseConventionOrAlternativeCase');
        expect(messages.errors[0].customizedRule).toEqual('EXAMPLE_RULE_ID');
    });
    
    it('should return error if it does not respect default case and alternative case - two at same level', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('stringAlternative-string_Wrong', 
            'lower_spinal_case', 'error', 
            'all_camel_case', 'error', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'EXAMPLE_RULE_ID');
            
        expect(result).toEqual(false);
        expect(messages.warnings.length).toEqual(0);
        expect(messages.errors.length).toEqual(1);
        expect(messages.errors[0].message).toEqual("Examples string must follow case convention: 'stringAlternative-string_Wrong' doesn't respect 'spinal-case' or 'camelCase' or 'UpperCamelCase'.");
        expect(messages.errors[0].path).toEqual("path_to");
        expect(messages.errors[0].type).toEqual("convention");
        expect(messages.errors[0].rule).toEqual('checkCaseConventionOrAlternativeCase');
        expect(messages.errors[0].customizedRule).toEqual('EXAMPLE_RULE_ID');
    });

    it('should return error if it does not respect default case and alternative case - two at hint level', function() {
      const messages = new MessageCarrier();
      let result;

      result = checkCase.checkCaseConventionOrAlternativeCase('stringAlternative-string_Wrong', 
          'lower_spinal_case', 'hint', 
          'all_camel_case', 'hint', 
          messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'EXAMPLE_RULE_ID');
          
      expect(result).toEqual(false);
      expect(messages.errors.length).toEqual(0);
      expect(messages.warnings.length).toEqual(0);
      expect(messages.infos.length).toEqual(0);
      expect(messages.notices.length).toEqual(0);
      expect(messages.hints.length).toEqual(1);
      expect(messages.hints[0].message).toEqual("Examples string must follow case convention: 'stringAlternative-string_Wrong' doesn't respect 'spinal-case' or 'camelCase' or 'UpperCamelCase'.");
      expect(messages.hints[0].path).toEqual("path_to");
      expect(messages.hints[0].type).toEqual("convention");
      expect(messages.hints[0].rule).toEqual('checkCaseConventionOrAlternativeCase');
      expect(messages.hints[0].customizedRule).toEqual('EXAMPLE_RULE_ID');
  });

    it('should return error if it does not respect default case and alternative case - two at different level', function() {
        const messages = new MessageCarrier();
        let result;

        result = checkCase.checkCaseConventionOrAlternativeCase('stringAlternative-string_Wrong', 
            'lower_spinal_case', 'warning', 
            'lower_camel_case', 'error', 
            messages, 'path_to', 'Examples string', 'checkCaseConventionOrAlternativeCase', 'EXAMPLE_RULE_ID');
            
        expect(result).toEqual(false);
        expect(messages.warnings.length).toEqual(0);
        expect(messages.errors.length).toEqual(1);
        expect(messages.errors[0].message).toEqual("Examples string must follow case convention: 'stringAlternative-string_Wrong' doesn't respect 'camelCase' recommended, or eventually 'spinal-case'.");
        expect(messages.errors[0].path).toEqual("path_to");
        expect(messages.errors[0].type).toEqual("convention");
        expect(messages.errors[0].rule).toEqual('checkCaseConventionOrAlternativeCase');
        expect(messages.errors[0].customizedRule).toEqual('EXAMPLE_RULE_ID');
    });
    
});
