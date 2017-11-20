const fs = require('fs');
const util = require('util');

const pathToSrc = __dirname + '/../../';
const defaultsFile = '.defaultsForValidator';

const pathToRoot = __dirname + '/../../../../';
const filename = '.validaterc';

// import the default object
const defaultObject = require(pathToSrc + defaultsFile);

const getConfigObject = async function (defaultMode, chalk) {

  let configObject = {};
  const readFile = util.promisify(fs.readFile);

  // if the user specified to run in default mode, no need to read the file
  if (!defaultMode){
    try {
      // the config file must be in the root folder of the project
      const fileAsString = await readFile(pathToRoot + filename, 'utf8');
      configObject = JSON.parse(fileAsString);
    }
    catch (err) {

      // if the user does not have a config file, run in default mode and warn them
      if (err.code === 'ENOENT') {
        console.log(
          '\n' + chalk.yellow('Warning') +
          ` No ${chalk.underline(filename)} file found. The validator will run in ` +
          chalk.bold.cyan('default mode.')
        );
        console.log(
          `To configure the validator, the ${filename} file must be in the root directory of this project.`
        );
        defaultMode = true;
      }
      // this most likely means there is a problem in the json syntax itself
      else {
        console.log(
          '\n' + chalk.red('Error') +
          ` There is a problem with the ${chalk.underline(filename)} file. See below for details.\n`
        );
        console.log(chalk.magenta(err) + '\n');
        return Promise.reject(2);
      }
    }
  }

  if (defaultMode) {
    configObject = defaultObject;
  }
  else {
    // validate the user object
    configObject = validateConfigObject(configObject, chalk);
    if (configObject.invalid) {
      return Promise.reject(2);
    }
  }

  return configObject;
};

const validateConfigObject = function(configObject, chalk) {

  let configErrors = [];
  let validObject = true;

  // check that all categories are valid
  const allowedCategories = Object.keys(defaultObject);
  const userCategories = Object.keys(configObject);
  userCategories.forEach(function(category) {
    if (!allowedCategories.includes(category)) {
      validObject = false;
      configErrors.push({
        message: `'${category}' is not a valid category.`,
        correction: `Valid categories are: ${allowedCategories.join(', ')}`
      });
      return; // skip rules for invalid category
    }

    // check that all rules are valid
    const allowedRules = Object.keys(defaultObject[category]);
    const userRules = Object.keys(configObject[category]);
    userRules.forEach(function(rule) {
      if (!allowedRules.includes(rule)) {
        validObject = false;
        configErrors.push({
          message: `'${rule}' is not a valid rule for the ${category} category`,
          correction: `Valid rules are: ${allowedRules.join(', ')}`
        });
        return; // skip statuses for invalid rule
      }

      // check that all statuses are valid (either 'error', 'warning', or 'off')
      const allowedStatusValues = ['error', 'warning', 'off'];
      const userStatus = configObject[category][rule];
      if (!allowedStatusValues.includes(userStatus)) {
        validObject = false;
        configErrors.push({
          message: `'${userStatus}' is not a valid status for the ${rule} rule in the ${category} category.`,
          correction: `For any rule, the only valid statuses are: ${allowedStatusValues.join(', ')}`
        });
      }
    });
  });

  // if the object is valid, resolve any missing features
  //   and set all missing statuses to their default value
  if (validObject) {
    const requiredCategories = allowedCategories;
    requiredCategories.forEach(function(category) {
      if (!userCategories.includes(category)) {
        configObject[category] = {};
      }
      const requiredRules = Object.keys(defaultObject[category]);
      const userRules = Object.keys(configObject[category]);
      requiredRules.forEach(function(rule) {
        if (!userRules.includes(rule)) {
          configObject[category][rule] = defaultObject[category][rule];
        }
      });
    });
    configObject.invalid = false;
  }
  // if the object is not valid, exit and tell the user why
  else {
    console.log(
      chalk.red("\nError ") +
      `Invalid configuration in ${chalk.underline(filename)} file. See below for details.\n`
    );
    configErrors.forEach(function(problem) {
      console.log(` - ${chalk.red(problem.message)}\n   ${chalk.magenta(problem.correction)}\n`);
    });
    configObject.invalid = true;
  }

  return configObject;

};

module.exports = getConfigObject;
module.exports.validate = validateConfigObject;
