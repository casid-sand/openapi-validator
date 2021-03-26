const express = require('express');

const buildSwaggerObject = require('../cli-validator/utils/buildSwaggerObject');
const config = require('../cli-validator/utils/processConfiguration');
const validator = require('../cli-validator/utils/validator');
const chalk = require('chalk');
const readYaml = require('js-yaml');

const app = express();

app.use(express.json());

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

app.post("/api/validations", async (req, res, next) => {

    const debug = true;
  
    if (debug === true) {
      console.log('body:');
      console.log(req.body);
      console.log('query:');
      console.log(req.query);
    }

    let isJson = true;
    let input;

    if (req.query.formatType) {
        console.log('Type (json by default):', req.query.formatType);
        if (req.query.formatType) {
          isJson = false;
        }
    }

    if (isJson) {
      if (debug === true) {
        console.log('json read');
      }
      // find and fix trailing commas
      const match = originalFile.match(/,\s*[}\]]/m);
      if (match) {
        const chars = originalFile.substring(0, match.index);
        const lineNum = (chars.match(/\n/g) || []).length + 1;
        const msg = `Trailing comma on line ${lineNum} of file ${validFile}.`;
        printError(chalk, chalk.red(msg));
        exitCode = 1;
        originalFile = originalFile.replace(/,(\s*[}\]])/gm, '$1');
      }
      input = JSON.parse(req.body);
    } else {
      if (debug === true) {
        console.log('yaml read');
      }
      input = readYaml.safeLoad(req.body);
    }

    if (debug === true) {
      console.log('input result:', input);
    }

    let exitCode = 0;

    // process the config file for the validations
    let configObject;
    try {
      configObject = await config.get(true, chalk);
    } catch (err) {
      console.error('ERROR configuration :', getError(err));
      if (debug) {
        console.log(err.stack);
      }
      exitCode = 1;
    }

    if (exitCode === 0) {

      let swagger;
      try {
        swagger = await buildSwaggerObject(input);
      } catch (err) {
        console.error('ERROR buildSwaggerObject :', getError(err));
        if (debug) {
          console.log(err.stack);
        }
        exitCode = 1;
      }

      if (debug === true) {
        console.log('swagger:', swagger);
        console.log('swagger.jsSpec:', swagger.jsSpec);
        if (swagger.jsSpec.info) {
          console.log('swagger.jsSpec.info:', swagger.jsSpec.info);
        }
        if (swagger.settings) {
          console.log('swagger.settings:', swagger.settings);
          console.log('swagger.settings.testSchema:', swagger.settings.testSchema);
        }
      }

      if (exitCode === 0) {
        // run validator, print the results, and determine if validator passed
        try {
          results = validator(swagger, configObject, undefined, debug);
        } catch (err) {
          console.error('There was a problem with a validator.', getError(err));
          if (debug) {
            console.log(err.stack);
          }
          exitCode = 1;
        }

        if (exitCode === 0) {
          //const jsonResult = JSON.stringify(results, null, 2);
          
          res.status(200).json(results);
        } else {
          res.status(200).json({
            status: "KO",
            error: "validator"
          });
        }
      } else {
        res.status(200).json({
          status: "KO",
          error: "buildSwaggerObject"
        });
      }
    } else {
      res.status(200).json({
        status: "KO",
        error: "Configuration"
      });
    }
});

app.post("/api/fakes-validations", (req, res, next) => {
    
  ///const body = JSON.parse(req.body);
  console.log(req.body);
  console.log(req.query);

  if (req.query.formatType) {
      console.log('Type (yaml by default):', req.query.formatType);
  }

  const stuff = {
      apiTitle: 'Mon API',
      status: "API created",
      apiVersion: "2.5.0",
      openApiVersion: "Swagger 2",
      "scanDate": "2021-03-24 17:24:21",
      details: {
          errors: [{
              "message": "Schema properties must have a description with content in it.",
              "path": "definitions.EvaluationReservisteReferent.properties.evaluation_reserviste_referent_date.description",
              "line": 5873,
              "type": "documentation",
              "rule": "no_property_description",
              "customizedRule": "D19.15"
            }],
          "warnings": [
            {
              "message": "OpenAPI host `schemes` must be present and non-empty array.",
              "path": "",
              "line": 0,
              "type": "",
              "rule": "oas2-api-schemes",
              "customizedRule": "standard"
            },
            {
              "message": "Enum value does not respect the specified type : Enum value `type_autoeval_securite` does not respect the specified type `integer`.",
              "path": "paths./api/v2/documents.get.parameters.0.enum.0",
              "line": 2663,
              "type": "",
              "rule": "typed-enum",
              "customizedRule": "standard"
            }
          ]
      },
  };
  res.status(200).json(stuff);
});

app.use("/health", (req, res, next) => {
       
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