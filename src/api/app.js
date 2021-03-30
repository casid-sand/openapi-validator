const express = require('express');

const buildSwaggerObject = require('../cli-validator/utils/buildSwaggerObject');
const config = require('../cli-validator/utils/processConfiguration');
const validator = require('../cli-validator/utils/validator');
const generateReportFile = require('../cli-validator/utils/generateReportFile');
const spectralValidator = require('../spectral/utils/spectral-validator');
const { Spectral } = require('@stoplight/spectral');
const chalk = require('chalk');
const readYaml = require('js-yaml');

const configurationFileName = './test/mock-validation/validation-configuration.yaml';

const app = express();

//app.use(express.json());
app.use(express.text({type : '*/*'}));
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use((req, res, next) => {
  console.log('Request received - Time:', Date.now(), '- Request URL:', req.originalUrl, ' - Request Type:', req.method, ' - Caller IP:', req.ip);
  next();
});


//CORS configuration
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.post("/api-validations/v1/api/validations", async (req, res, next) => {

    const debug = true;
  
    if (debug === true) {
      if (req.body) {
        console.log('body not empty :', req.body.substring(0,50));
      } else {
        console.log('body is empty');
      }
      //console.log(req.body);
    }
    console.log('query:', req.query);
    console.log('Content-Type:', req.get('Content-Type'));

    let exitCode = 0;
    let isJson = true;
    let defaultConfigurationMode = false;
    let statsReport = false;
    let printValidators = false;
    let errorsOnly = false;
    let inputStr;
    let inputParsed;

    if (req.query.formatType) {
        console.log('Type (json by default):', req.query.formatType);
        if (req.query.formatType && req.query.formatType.toLowerCase() != 'json') {
          isJson = false;
        }
    }

    if (req.query.statsReport) {
      console.log('Stats reporting:', req.query.statsReport);
      if (req.query.statsReport && req.query.statsReport.toLowerCase() === 'yes') {
        statsReport = true;
      }
    }

    if (req.query.printValidators) {
      console.log('Print Validator Names:', req.query.printValidators);
      if (req.query.printValidators && req.query.printValidators.toLowerCase() === 'yes') {
        printValidators = true;
      }
    }

    if (req.query.errorsOnly) {
      console.log('Display Errors only:', req.query.errorsOnly);
      if (req.query.errorsOnly && req.query.errorsOnly.toLowerCase() === 'yes') {
        errorsOnly = true;
      }
    }

    if (debug) {
      console.log(`Read config file ${configurationFileName}. DefaultMode: ${defaultConfigurationMode}`);
    }
    // process the config file for the validations
    let configObject;
    const spectral = new Spectral();
    try {
      configObject = await config.get(defaultConfigurationMode, chalk, configurationFileName);

      // create an instance of spectral & load the spectral ruleset, either a user's
      // or the default ruleset
      try {
        await spectralValidator.setup(spectral, rulesetFileOverride, configObject);
      } catch (err) {
        console.error('ERROR spectral configuration :', getError(err));
      }
    } catch (err) {
      console.error('ERROR configuration :', getError(err));
      if (debug) {
        console.log(err.stack);
      }
      exitCode = 1;
    }

    if (exitCode === 0) {

      if (debug) {
        console.log(`Read swagger - isJson:${isJson}`);
      }
      inputStr = req.body;
      if (inputStr) {
        if (isJson) {
          if (debug === true) {
            console.log('json read');
          }
          try {
            // find and fix trailing commas
            const match = inputStr.match(/,\s*[}\]]/m);
            if (match) {
              const chars = inputStr.substring(0, match.index);
              const lineNum = (chars.match(/\n/g) || []).length + 1;
              if (debug === true) {
                console.log(`Trailing comma on line ${lineNum}.`);
              }
              inputStr = inputStr.replace(/,(\s*[}\]])/gm, '$1');
            }
            inputParsed = JSON.parse(inputStr);
          } catch (error) {
            console.log("Error while parsing JSON:", error);
            exitCode = 1;
          }
        } else {
          if (debug === true) {
            console.log('yaml read');
          }
          try {
            inputParsed = readYaml.safeLoad(inputStr);
          } catch (error) {
            console.log("Error while parsing YAML:", error);
            exitCode = 1;
          }
        }
      } else {
        console.log("Empty input data");
        exitCode = 1;
      }

      if (exitCode === 0) {

        let swagger;
        if (debug) {
          console.log(`start buildSwaggerObject`);
        }
        try {
          swagger = await buildSwaggerObject(inputParsed);
        } catch (err) {
          console.error('ERROR buildSwaggerObject :', getError(err));
          if (debug) {
            console.log(err.stack);
          }
          exitCode = 1;
        }

        if (debug === true) {
          if (swagger) {
            if (swagger.jsSpec) {
              console.log('swagger.jsSpec defined');
              if (swagger.jsSpec.info) {
                if (swagger.jsSpec.info.title) {
                  console.log('swagger.jsSpec.info.title:', swagger.jsSpec.info.title);
                }
                if (swagger.jsSpec.info.version) {
                  console.log('swagger.jsSpec.info.version:', swagger.jsSpec.info.version);
                }
              }
            } else {
              console.log('no swagger.jsSpec');
            }

            if (swagger.openApiVersion) {
              console.log('swagger.openApiVersion:', swagger.openApiVersion);
            }
          }
        }

        if (exitCode === 0) {

          if (debug) {
            console.log(`start spectral validators`);
          }
          // run spectral and save the results
          let spectralResults;
          try {
            //process.chdir(path.dirname(validFile));
            // let spectral handle the parsing of the original swagger/oa3 document
            spectralResults = await spectral.run(inputStr);
          } catch (err) {
            console.error( 'There was a problem with spectral.', getError(err));
            if (debug) {
              console.log(err.stack);
            }
            exitCode = 1;
          } finally {
            // return the working directory to its original location
            //process.chdir(originalWorkingDirectory);
          }

          if (debug) {
            console.log(`start validators`);
          }
          // run validator, print the results, and determine if validator passed
          try {
            results = validator(swagger, configObject, spectralResults, debug);
          } catch (err) {
            console.error('There was a problem with a validator.', getError(err));
            if (debug) {
              console.log(err.stack);
            }
            exitCode = 1;
          }

          if (exitCode === 0) {
            
            if (debug) {
              console.log(`generate report`);
            }
            const jsonReport = generateReportFile.generateReportFile(
              results,
              printValidators,
              statsReport,
              inputStr,
              swagger,
              errorsOnly);
            
            res.status(200).json(jsonReport);
            console.log(`end with status OK`);
          } else {
            res.status(400).json({
              status: "KO",
              error: "Error while analysing Swagger/OpenAPI - Validators"
            });
            console.log(`end with error Swagger/OpenAPI - Validators`);
          }
        } else {
          res.status(412).json({
            status: "KO",
            error: "Error while analysing Swagger/OpenAPI - buildSwaggerObject"
          });
          console.log(`end with error analysing Swagger/OpenAPI - buildSwaggerObject`);
        }
      } else {
        res.status(412).json({
          status: "KO",
          error: "Error while parsing Swagger/OpenAPI - No data or bad format"
        });
        console.log(`end with error parsing Swagger/OpenAPI - No data or bad format`);
      }
    } else {
      res.status(500).json({
        status: "KO",
        error: "Server configuration"
      });
      console.log(`end with error Server configuration`);
    }
});

app.use("/api-validations/v1/health", (req, res, next) => {
       
  const stuff = {
    status: "up",
    version: "0.1.0"
  };
  res.status(200).json(stuff);
});

function getError(err) {
  return err.message || err;
}



module.exports = app;