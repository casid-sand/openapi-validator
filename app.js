const express = require('express');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log('Request received - Time:', Date.now(), '- Request URL:', req.originalUrl, ' - Request Type:', req.method, ' - Caller IP:', req.ip);
  next();
});

/*app.use((req, res, next) => {
  res.status(201);
  next();
});

app.use((req, res, next) => {
  res.json({ message: 'Votre requête a bien été reçue !' });
  next();
});

app.use((req, res, next) => {
  console.log('Réponse envoyée avec succès !');
});*/

//CORS configuration
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.post("/api/validations", (req, res, next) => {
    
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

app.use("/api/validations", (req, res, next) => {
       
    const stuff = {
        apiTitle: 'Mon API',
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


module.exports = app;