const commandLineValidator = require('../../src/cli-validator/runValidator');
const inCodeValidator = require('../../src/lib');
const { getCapturedText } = require('.');


    const program = {};
    let exitcode;
    program.args = ['./test/cli-validator/mockFiles/err-and-warn.yaml'];
    program.default_mode = true;

    console.log('Validation de clean.yml');
    exitCode = commandLineValidator(program);

    /*program.args = ['./test/cli-validator/mockFiles/err-and-warn.yaml'];
    program.default_mode = true;

    console.log('Validation de err-and-warn.yml');
    exitCode = commandLineValidator(program);*/

    /*program.args = ['./test/test-utils/mockFiles/test-info-error.yaml'];

    console.log('Validation de test-info-error.yaml');
    exitCode = commandLineValidator(program);*/
    
    //Validation Swagger
    /*program.args = ['./test/test-utils/mockFiles/swagger-to-validate.yaml'];
    program.config = './test/test-utils/mockFiles/validateConfig.yaml';
    //program.errors_only = true;
    program.report_statistics = true;

    program.output = './test/test-utils/output_validation_report.json';
    //program.default_mode = true;

    console.log('Validation de swagger-to-validate.yaml');
    exitCode = commandLineValidator(program);*/

