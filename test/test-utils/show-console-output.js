const commandLineValidator = require('../../src/cli-validator/runValidator');
const inCodeValidator = require('../../src/lib');
const { getCapturedText } = require('.');


    const program = {};
    let exitcode;
    program.args = ['./test/cli-validator/mockFiles/clean.yml'];
    program.default_mode = true;

    /*console.log('Validation de clean.yml');
    exitCode = commandLineValidator(program);*/

    //const program = {};
    program.args = ['./test/cli-validator/mockFiles/err-and-warn.yaml'];
    program.default_mode = true;

    console.log('Validation de err-and-warn.yml');
    exitCode = commandLineValidator(program);

    //const program = {};
    program.args = ['./test/cli-validator/mockFiles/test-info-error.yaml'];
    program.default_mode = true;

    /*console.log('Validation de test-info-error.yaml');
    exitCode = commandLineValidator(program);*/
    //const capturedText = getCapturedText(consoleSpy.mock.calls);

