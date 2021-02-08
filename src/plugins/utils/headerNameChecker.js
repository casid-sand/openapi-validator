const checkCase = require('./caseConventionCheck');

const headerStartingWithXRegex = /^([xX])(([-_\.A-Z]))/;

module.exports.checkHeaderName = function (headerName, checkHeaderCaseConvention, headerCaseConventionValue, checkHeaderWithX, pathToObject, messages) {
    if (checkHeaderCaseConvention != 'off') {
        const isCorrectCase = checkCase(headerName, headerCaseConventionValue);
        if (!isCorrectCase) {
            messages.addTypedMessage(
                pathToObject,
                `HTTP Header name must follow case convention: '${headerName}' doesn't respect ${checkCase.getCaseConventionExample(headerCaseConventionValue)}.`,
                checkHeaderCaseConvention,
                'convention',
                'IETF.RFC.6648'
            );
        }
    }
    if (checkHeaderWithX !== 'off') {
        if (headerStartingWithXRegex.test(headerName)) {
            messages.addTypedMessage(
                pathToObject,
                `HTTP Header name must not start with 'X-*' : '${headerName}'.`,
                checkHeaderWithX,
                'convention',
                'IETF.RFC.6648'
            );
        }
    }
}
