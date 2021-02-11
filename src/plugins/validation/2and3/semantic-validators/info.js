// Assertation 1:
// check if info exists

// Assertation 2:
// making sure that the required version and title are defined properly

// Assertation 3:
// making sure that the contact email is defined, and warn if contact name is not defined

const MessageCarrier = require('../../../utils/messageCarrier');

const versionMajorMinorPatchRegex = /^\d+\.\d+\.\d+$/;
const versionMajorMinorRcRegex = /^\d+\.\d(.*)+$/;
const versionMajorMinorRegex = /^\d+\.\d+$/;

const versionNameRegex = /^(?:v(?:ersion)?[\_\-\. ]*)?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?(.*)$/;

module.exports.validate = function({ jsSpec }, config) {
  const messages = new MessageCarrier();

  const info = jsSpec.info;
  const hasInfo = info && typeof info === 'object';
  if (!hasInfo) {
    messages.addTypedMessage(
      ['info'],
      'API definition must have an `info` object',
      'error',
      'missing_info',
      'structural'
    );
  } else {
    const title = jsSpec.info.title;
    const hasTitle =
      typeof title === 'string' && title.toString().trim().length > 0;
    const versionValue = jsSpec.info.version;
    const hasVersion =
      typeof versionValue === 'string' && versionValue.toString().trim().length > 0;

    if (!hasTitle) {
      messages.addTypedMessage(
        ['info', 'title'],
        '`info` object must have a string-type `title` field',
        'error',
        'missing_title',
        'structural'
      );
    }
    
    if (!hasVersion) {
      messages.addTypedMessage(
        ['info', 'version'],
        '`info` object must have a string-type `version` field',
        'error',
        'missing_version',
        'structural',
        'CTMO.Regle-11'
      );
    } else {
        const checkVersion = config.info.version_regex_rule;
        if (checkVersion && checkVersion != 'off') {
          const versionValueLower = versionValue.toLowerCase();
          if (versionNameRegex.test(versionValueLower)) {
            //at leat : major number is present if here
            const versionComponents = versionValueLower.match(versionNameRegex);
            if (versionComponents[2] == undefined 
              || versionComponents[3] == undefined 
              || versionComponents[4] != undefined 
              || (versionComponents[5] != undefined && versionComponents[5] != "")) {
                //if minor is not defined, or path is not defined 
                //or if a RC/Beta tag is present
                //or an additionnal minor number is present
              messages.addTypedMessage(
                  ['info', 'version'],
                  '`info` object should have a version number like X.Y.z',
                  'warning',
                  'wrong_version',
                  'convention',
                  'CTMO.Regle-11'
              );
            }
          } else {
            //version number is not correct
            messages.addTypedMessage(
                ['info', 'version'],
                '`info` object must have a version number like X.Y.z (or X.Y or X.Y-rc1)',
                checkVersion,
                'wrong_version',
                'convention',
                'CTMO.Regle-11'
            );
          }
        }
    }

    if (config && config.info) {
        const checkDesc = config.info.no_description;
        if (checkDesc != 'off') {
            const description = jsSpec.info.description;
            const hasDescription =
                typeof description === 'string' && description.toString().trim().length > 0;
            if (!hasDescription) {
                messages.addTypedMessage(
                    ['info', 'description'],
                    'API must have a non-empty description.',
                    checkDesc,
                    'no_api_description',
                    'documentation',
                    'D19.15'
                );
            } else {
                if (description.length < 50) {
                    messages.addTypedMessage(
                        ['info', 'description'],
                        'API description should be longer than 50 characters.',
                        'warning',
                        'no_api_description',
                        'documentation',
                        'D19.15'
                    );
                }
            }
        }
    }
      
    // Assertation 3
    const contact = jsSpec.info.contact;
    const hasContact = contact && typeof contact === 'object';
      
    if (!hasContact) {
          messages.addTypedMessage(
            ['info', 'contact'],
            '`info` object must have a `contact` object',
            'error',
            'missing_contact',
            'structural',
            'CTMO.STANDARD-CODAGE-22'
          );
    } else {
      const contactName = contact.name;
        const hasContactName =
          typeof contactName === 'string' && contactName.toString().trim().length > 0;
          
      const contactEmail = contact.email;
        const hasContactEmail =
          typeof contactEmail === 'string' && contactEmail.toString().trim().length > 0;
          
      if (!hasContactName) {
            messages.addTypedMessage(
              ['info', 'contact', 'name'],
              '`contact` object must have a string-type `name` field',
              'warning',
              'wrong_contact_definition',
              'structural',
              'CTMO.STANDARD-CODAGE-22'
            );
      }
      if (!hasContactEmail) {
            messages.addTypedMessage(
              ['info', 'contact', 'email'],
              '`contact` object must have a string-type `email` field',
              'error',
              'wrong_contact_definition',
              'structural',
              'CTMO.STANDARD-CODAGE-22'
            );
      } else {
            if (config.info.contact_email_domain) {
                const checkEmailAddress = config.info.contact_email_domain[0];
                if (checkEmailAddress != 'off') {
                    const emailAddressDomain = config.info.contact_email_domain[1];
                    const emailDomainRegex = /^(.*)\@(.*)$/;
                    let emailArray = null;
                    let isEmailOk = false;
                    if (emailDomainRegex.test(contactEmail)) {
                        emailArray = emailDomainRegex.exec(contactEmail);
                        if (emailArray != null && emailArray.length == 3) {
                            if (emailArray[2] == emailAddressDomain) {
                                isEmailOk = true;
                            }
                        }
                    }
                    if (! isEmailOk) {
                        messages.addTypedMessage(
                            ['info', 'contact', 'email'],
                            `'contact.email' object must have domain : ${emailAddressDomain} - ${emailArray}`,
                            checkEmailAddress,
                            'wrong_contact_definition',
                            'structural',
                            'CTMO.STANDARD-CODAGE-22'
                        );
                    }
                }
            }
      }
          
    }
  }
  return messages;
};
