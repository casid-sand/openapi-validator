/*
  Snake Case: A custom RegEx in implemented here so that number characters are allowed to
  directly follow letter characters, without an underscore in between. The
  snakecase module in lodash (which was previously used) did not allow this
  behavior. This is especially important in API paths e.g. '/api/v1/path'

  K8S Camel Case: Similar to lower camel case except allowing consecutive upper
  case letters.  The K8S API convention is to have all letters in an acronym be
  the same case:
  https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#naming-conventions
*/

const lowerSnakeCase = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/; // example : learning_opt_out
const upperSnakeCase = /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/; // example : LEARNING_OPT_OUT
const upperCamelCase = /^[A-Z][a-z0-9]+([A-Z][a-z0-9]+)*$/; // example : LearningOptOut
const lowerCamelCase = /^[a-z][a-z0-9]*([A-Z][a-z0-9]+)*$/; // example : learningOptOut
const k8sCamelCase = /^[a-z][a-z0-9]*([A-Z]+[a-z0-9]*)*$/; // example : learningOptOutAPI
const k8sUpperCamelCase = /^[A-Z][a-z0-9]+([A-Z]+[a-z0-9]*)*$/; // example : LearningOptOutAPI
const lowerDashCase = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/; // example : learning-opt-out
const upperDashCase = /^[A-Z][A-Z0-9]*(-[A-Z0-9]+)*$/; // example : LEARNING-OPT-OUT
const spinalFirstUpperCase = /^[A-Z][a-z0-9]*(-[a-z0-9]+)*$/; // example : Learning-Opt-Out

module.exports = (string, convention) => {
  switch (convention) {
    case 'lower_snake_case':
      return lowerSnakeCase.test(string);

    case 'upper_snake_case':
      return upperSnakeCase.test(string);

    case 'all_snake_case':
      if (upperSnakeCase.test(string)) {
        return true;
      } else {
        return lowerSnakeCase.test(string);
      }

    case 'upper_camel_case':
      return upperCamelCase.test(string);

    case 'lower_camel_case':
      return lowerCamelCase.test(string);

    case 'all_camel_case':
      if (upperCamelCase.test(string)) {
        return true;
      } else {
        return lowerCamelCase.test(string);
      }

    case 'k8s_camel_case':
      return k8sCamelCase.test(string);

    case 'k8s_upper_camel_case':
        return k8sUpperCamelCase.test(string);

    case 'k8s_all_camel_case':
      if (k8sUpperCamelCase.test(string)) {
        return true;
      } else {
        return k8sCamelCase.test(string);
      }

    case 'spinal_first_upper_case':
    case 'dash_first_upper_case':
      return spinalFirstUpperCase.test(string);

    case 'lower_spinal_case':
    case 'lower_dash_case':
      return lowerDashCase.test(string);

    case 'upper_spinal_case':
    case 'upper_dash_case':
      return upperDashCase.test(string);

    case 'all_spinal_case':
    case 'all_dash_case':
      if (lowerDashCase.test(string)) {
        return true;
      } else {
        return upperDashCase.test(string);
      }

    default:
      // this should never happen, the convention is validated in the config processor
      console.log(`Unsupported case: ${convention}`);
  }
};

module.exports.checkCaseConventionOrAlternativeCase = function (stringToTest, 
    defaultCaseConvention, defaultCheckLevel, 
    alternativeCaseConvention, alternativeCheckLevel, 
    messageCarrier, pathToElement, elementTypeName, ruleIdentifier) {

//switch default and alternative if alternative is more restrictive
if (defaultCheckLevel === 'off' && alternativeCheckLevel !== 'off'
    || defaultCheckLevel === 'warning' && alternativeCheckLevel ==='error') {
    let tempValue;

    tempValue = defaultCheckLevel;
    defaultCheckLevel = alternativeCheckLevel;
    alternativeCheckLevel = tempValue;

    tempValue = defaultCaseConvention;
    defaultCaseConvention = alternativeCaseConvention;
    alternativeCaseConvention = tempValue;
}
  
  let stringIsCorrectCase = true;

  // test if string respect default case
  const isCorrectDefaultCase = this(stringToTest, defaultCaseConvention);
  // test if string respect alternative case, if defined
  let isCorrectAlternativeCase = undefined;
  if (alternativeCaseConvention !== null && alternativeCaseConvention !== undefined) {
    isCorrectAlternativeCase = this(stringToTest, alternativeCaseConvention);
  }

  let messageStatus = defaultCheckLevel;
  if (defaultCheckLevel !== 'off') {
    if (!isCorrectDefaultCase) {
        if (alternativeCheckLevel === 'off') {
            stringIsCorrectCase = false;
            messageCarrier.addTypedMessage(
                pathToElement,
                `${elementTypeName} must follow case convention: ${this.getCaseConventionExample(defaultCaseConvention)}.`,
                messageStatus,
                'convention',
                ruleIdentifier
            );
        } else {
            if (isCorrectAlternativeCase) {
                // if the 2 cases convention are at same error level, and the 2nd is ok => no error, else 'warning'
                if (defaultCheckLevel != alternativeCheckLevel) {
                    messageStatus = 'warning';
                    let messageString = `${elementTypeName} should follow case convention: ${this.getCaseConventionExample(defaultCaseConvention)} recommended.`;
                    if (alternativeCheckLevel === 'error') {
                        messageString = `${elementTypeName} should follow case convention: ${this.getCaseConventionExample(alternativeCaseConvention)} recommended.`;
                    }
                    stringIsCorrectCase = false;
                    messageCarrier.addTypedMessage(
                        pathToElement,
                        messageString,
                        messageStatus,
                        'convention',
                        ruleIdentifier
                    );
                }
            } else {
                let messageString = `${elementTypeName} must follow case convention: ${this.getCaseConventionExample(defaultCaseConvention)} or ${this.getCaseConventionExample(alternativeCaseConvention)}.`;
                if (defaultCheckLevel !== alternativeCheckLevel) {
                    if (defaultCheckLevel === 'error') {
                        messageString = `${elementTypeName} must follow case convention: ${this.getCaseConventionExample(defaultCaseConvention)} recommended, or eventually ${this.getCaseConventionExample(alternativeCaseConvention)}.`;
                    } else {
                        messageString = `${elementTypeName} must follow case convention: ${this.getCaseConventionExample(alternativeCaseConvention)} recommended, or eventually ${this.getCaseConventionExample(defaultCaseConvention)}.`;
                    }
                }
                if (defaultCheckLevel == 'error' || alternativeCheckLevel == 'error') {
                    messageStatus = 'error';
                } 
                stringIsCorrectCase = false;
                messageCarrier.addTypedMessage(
                pathToElement,
                messageString,
                messageStatus,
                'convention',
                ruleIdentifier
                );
            }
        }
    }
  }

  return stringIsCorrectCase;
}

module.exports.getCaseConventionExample = function (convention) {
  switch (convention) {
    case 'lower_snake_case':
      return "'lower_snake_case'";

    case 'upper_snake_case':
      return "'UPPER_SNAKE_CASE'";

    case 'all_snake_case':
      return "'lower_snake_case' or 'UPPER_SNAKE_CASE'";

    case 'upper_camel_case':
      return "'UpperCamelCase'";

    case 'lower_camel_case':
      return "'camelCase'";

    case 'all_camel_case':
      return "'camelCase' or 'UpperCamelCase'";

    case 'k8s_camel_case':
      return "'kubernetesAPICase'";

    case 'k8s_upper_camel_case':
        return "'UpperKubernetesAPICase'";

    case 'k8s_all_camel_case':
      return "'kubernetesAPICase' or 'UpperKubernetesAPICase'";

    case 'spinal_first_upper_case':  
    case 'dash_first_upper_case':
      return "'Spinal-First_Letter-Upper-Case'";

    case 'lower_spinal_case':  
    case 'lower_dash_case':
      return "'spinal-case'";

    case 'upper_dash_case':
    case 'upper_spinal_case':
      return "'UPPER-SPINAL-CASE'";

    case 'all_dash_case':
    case 'all_spinal_case':
      return "'spinal-case' or 'UPPER-SPINAL-CASE'";

    default:
      // this should never happen, the convention is validated in the config processor
      console.log(`Unsupported case: ${convention}`);
  }
};
