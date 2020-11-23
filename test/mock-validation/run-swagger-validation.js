const commandLineValidator = require('../../src/cli-validator/runValidator');
const inCodeValidator = require('../../src/lib');
const { getCapturedText } = require('../test-utils/get-captured-text');
const dateTime = require('node-datetime');


const program = {};
let exitcode;

let swagger_file_name = 'swagger2-ds-intradef-v1-20201123.yaml';


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
program.args = [`./test/mock-validation/input/${swagger_file_name}`];
program.config = './test/mock-validation/validation-configuration.yaml';
//program.errors_only = true;
program.report_statistics = true;
program.output = `./test/mock-validation/output/report-${formattedDate}-${swagger_name}.json`;
//program.default_mode = true;

console.log('Validation de swagger-to-validate.yaml');
exitCode = commandLineValidator(program);

