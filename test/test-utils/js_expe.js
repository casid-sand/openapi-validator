const MessageCarrier = require('../../src/plugins/utils/messageCarrier');
const each = require('lodash/each');
const pad = require('pad');

const animals = ['pigs', 'goats', 'sheep'];

const messages = new MessageCarrier();

const count = animals.push('cows');
console.log(count);
// expected output: 4
console.log(animals);
// expected output: Array ["pigs", "goats", "sheep", "cows"]

animals.push('chickens', 'cats', 'dogs');
console.log(animals);
// expected output: Array ["pigs", "goats", "sheep", "cows", "chickens", "cats", "dogs"]

messages.addMessage(
            ['info', 'contact'],
            '`info` object must have a `contact` object',
            'error'
          );

messages.addTypedMessage(
            ['info', 'contact'],
            '`info` object must have a `contact` object',
            'error',
            'semantic',
            'DIR19'
          );          

console.log(messages);

const types = ['errors', 'warnings'];

each(messages['errors'], (problems, validator) => {

    console.log(`Validator: ${validator}`);

    problems.forEach(problem => {
        console.log(chalk[color](`  Message :   ${problem.message}`));

    });


});

