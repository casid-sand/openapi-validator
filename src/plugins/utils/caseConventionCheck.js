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

    case 'lower_dash_case':
      return lowerDashCase.test(string);

    case 'upper_dash_case':
      return upperDashCase.test(string);

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

module.exports.getCaseConventionExample = function (convention) {
  switch (convention) {
    case 'lower_snake_case':
      return '"lower_snake_case"';

    case 'upper_snake_case':
      return '"UPPER_SNAKE_CASE"';

    case 'all_snake_case':
      return '"lower_snake_case" or "UPPER_SNAKE_CASE"';

    case 'upper_camel_case':
      return '"UpperCamelCase"';

    case 'lower_camel_case':
      return '"camelCase"';

    case 'all_camel_case':
      return '"camelCase" or "UpperCamelCase"';

    case 'k8s_camel_case':
      return '"kubernetesAPICase"';

    case 'k8s_upper_camel_case':
        return '"UpperKubernetesAPICase"';

    case 'k8s_all_camel_case':
      return '"kubernetesAPICase" or "UpperKubernetesAPICase"'

    case 'lower_dash_case':
      return '"spinal-case"';

    case 'upper_dash_case':
      return '"UPPER-SPINAL-CASE"';

    case 'all_dash_case':
      return '"spinal-case" or "UPPER-SPINAL-CASE"';

    default:
      // this should never happen, the convention is validated in the config processor
      console.log(`Unsupported case: ${convention}`);
  }
};
