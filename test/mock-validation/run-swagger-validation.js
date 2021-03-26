const commandLineValidator = require('../../src/cli-validator/runValidator');
const dateTime = require('node-datetime');

const program = {};
let exitcode;

let dir_path = './test/mock-validation/input/';
let swagger_file_name;

swagger_file_name = 'openapi3-test.yaml';
swagger_file_name = 'swagger-test.yml';

swagger_file_name = 'CMan.yaml';
swagger_file_name = 'Swagger-ds.yml';
swagger_file_name = 'swagger-DNA-2-12-2020-IntradefToInternet.yml';

swagger_file_name = '20210324_swagger_ROC_api_v2.5.yaml';
//swagger_file_name = 'openapi-demo.yaml';


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

