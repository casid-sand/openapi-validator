const commandLineValidator = require('../../src/cli-validator/runValidator');
const dateTime = require('node-datetime');
const fileExtension = /^(.*)(\.([^.]+))$/;

const program = {};
let exitcode;

let dir_path = './test/mock-validation/input/';
dir_path = './test/spectral/mockFiles/oas3/'
let swagger_file_name;

swagger_file_name = 'enabled-rules.yml';


//dir_path = "./test/cli-validator/mockFiles/";


let swagger_name = '';
if (fileExtension.test(swagger_file_name)) {
    const fileNameParts = fileExtension.exec(swagger_file_name);
    swagger_name = fileNameParts[1];
} else {
    swagger_name = swagger_file_name;
}

var dt = dateTime.create();
var formattedDate = dt.format('Y-m-d');

//Init - si besoin et commenter le reste
//program.args = [`init`];

//Validation Swagger
program.args = [`${dir_path}${swagger_file_name}`];
//program.config = './test/mock-validation/validation-configuration.yaml';
program.report_statistics = true;
program.output = `./test/mock-validation/output/rapport-analyse-${formattedDate}-${swagger_name}.json`;

console.log(`Validation de ${swagger_file_name}`);
exitCode = commandLineValidator(program);

