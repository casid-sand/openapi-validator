const commandLineValidator = require('../../src/cli-validator/runValidator');
const dateTime = require('node-datetime');

const program = {};
let exitcode;

let swagger_file_name;

swagger_file_name = 'openapi3-test.yaml';
swagger_file_name = 'swagger-test.yml';
swagger_file_name = 'CMAn-NOE-v1.0-08.01-VA-API_Serveur_Rebond_Axone -anonym-temp.yaml';
swagger_file_name = 'openapi-api-impl-demo-v0.0.3.yml';
let dir_path = './test/mock-validation/input/';

//swagger_file_name = "missing-object.yml"
//dir_path = "./test/cli-validator/mockFiles/";


let swagger_name = '';
let swagger_ext = '';
swagger_file_name.split('.').map(filename_part => {
    if (swagger_name == '') {
        swagger_name = filename_part;
    } else {
        swagger_ext = filename_part;
    }
});

var dt = dateTime.create();
var formattedDate = dt.format('Y-m-d');

//Validation Swagger
program.args = [`${dir_path}${swagger_file_name}`];
program.config = './test/mock-validation/validation-configuration.yaml';
program.report_statistics = true;
program.output = `./test/mock-validation/output/rapport-analyse-${formattedDate}-${swagger_name}.json`;

console.log(`Validation de ${swagger_file_name}`);
exitCode = commandLineValidator(program);

