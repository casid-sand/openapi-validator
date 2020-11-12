const fs = require('fs');
const util = require('util');
const findUp = require('find-up');
const each = require('lodash/each');
const pad = require('pad');
const printError = require('./printError');
const dateTime = require('node-datetime');

// get line-number-producing, 'magic' code from Swagger Editor
const getLineNumberForPath = require(__dirname + '/../../plugins/ast/ast')
  .getLineNumberForPath;

// this function prints all of the output
module.exports = function exportReportFile(
  results,
  chalk,
  outputFileReport,
  printValidators,
  reportingStats,
  originalFile,
  originalFileName,
  errorsOnly
) {
  const types = errorsOnly ? ['errors'] : ['errors', 'warnings'];

  var dt = dateTime.create();
  var formattedDate = dt.format('Y-m-d H:M:S');

  const jsonReport = {
    filename: originalFileName,
    scanDate: formattedDate,
    errors: []
  }

  if (!errorsOnly) {
      jsonReport.warnings = [];
  }
  if (reportingStats) {
      jsonReport.stats = [];
      jsonReport.statsByType = [];
      jsonReport.statsByRule = [];
  }

  // define an object template in the case that statistics reporting is turned on
  const stats = {
    errors: {
      total: 0
    },
    warnings: {
      total: 0
    }
  };

  const typedStats = {
    structural: {
      total: 0
    },
    semantic: {
      total: 0
    },
    convention: {
      total: 0
    },
    documentation: {
      total: 0
    },
    untyped: {
      total: 0
    }
  };

  const rulesStats = {};

  console.log();

  types.forEach(type => {

    each(results[type], (problems, validator) => {
      if (printValidators) {
        console.log(`Validator: ${validator}`);
      }

      problems.forEach(problem => {
        // To allow messages with fillins to be grouped properly in the statistics,
        // truncate the message at the first ':'
        const message = problem.message.split(':')[0];
        let path = problem.path;

        // collect info for stats reporting, if applicable

        stats[type].total += 1;

        if (!stats[type][message]) {
          stats[type][message] = 0;
        }

        stats[type][message] += 1;

        //collect stats for types

        if (problem.type) {
            typedStats[problem.type].total += 1;

            if (!typedStats[problem.type][message]) {
                typedStats[problem.type][message] = 0;
            }

            typedStats[problem.type][message] += 1;

        } else {
            typedStats["untyped"].total += 1;

            if (!typedStats["untyped"][message]) {
                typedStats["untyped"][message] = 0;
            }

            typedStats["untyped"][message] += 1;
        }

        //collect stats for rules
        
        if (!problem.rule) {
            problem.rule = "standard";           
        }

        if (!rulesStats[problem.rule]) {
            rulesStats[problem.rule] = {
                total: 0
            };
        }
        rulesStats[problem.rule].total += 1;

        if (!rulesStats[problem.rule][message]) {
            rulesStats[problem.rule][message] = 0;
        }
        rulesStats[problem.rule][message] += 1;

        // path needs to be an array to get the line number
        if (!Array.isArray(path)) {
          path = path.split('.');
        }

        // get line number from the path of strings to the problem
        // as they say in src/plugins/validation/semantic-validators/hook.js,
        //
        //                  "it's magic!"
        //
        const lineNumber = getLineNumberForPath(originalFile, path);

        //new object for report
        let problemToAdd = {};
        problemToAdd.message = problem.message;
        problemToAdd.path = path.join('.');
        problemToAdd.line = lineNumber;
        if (problem.type) {
            problemToAdd.type = problem.type;
        } else {
            problemToAdd.type = "";
        }
        if (problem.rule) {
            problemToAdd.rule = problem.rule;
        } else {
            problemToAdd.rule = "";
        }

        if (type == 'errors') {
            jsonReport.errors.push(problemToAdd)
        } else {
            jsonReport.warnings.push(problemToAdd)
        }
      });
    });
  });

  // print the stats here, if applicable
  if (reportingStats && (stats.errors.total || stats.warnings.total)) {
    jsonReport.stats = stats;
    jsonReport.stats.statsByType = typedStats;
    jsonReport.stats.statsByRule = rulesStats;
  }

  const writeFile = util.promisify(fs.writeFile);
  try {
    const indentationSpaces = 2;
    writeFile(
      outputFileReport,
      JSON.stringify(jsonReport, null, indentationSpaces)
    );
    console.log('\n' + chalk.green('[Success]') + ` Report created ${outputFileReport}\n`);
    return Promise.resolve(0);
  } catch (err) {
    const description =
      'Problem writing the .validaterc file. See below for details.';
    printError(chalk, description, err);
    return Promise.reject(2);
  }
};
