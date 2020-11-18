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

module.exports.validate = function({ jsSpec }, config) {
  const messages = new MessageCarrier();

  const info = jsSpec.info;
  const hasInfo = info && typeof info === 'object';
  if (!hasInfo) {
    messages.addMessage(
      ['info'],
      'API definition must have an `info` object',
      'error',
      'structural'
    );
  } else {
    const title = jsSpec.info.title;
    const hasTitle =
      typeof title === 'string' && title.toString().trim().length > 0;
    const version = jsSpec.info.version;
    const hasVersion =
      typeof version === 'string' && version.toString().trim().length > 0;

    if (!hasTitle) {
      messages.addMessage(
        ['info', 'title'],
        '`info` object must have a string-type `title` field',
        'error'
      );
    }
    
    if (!hasVersion) {
      messages.addTypedMessage(
        ['info', 'version'],
        '`info` object must have a string-type `version` field',
        'error',
        'structural',
        'CTMO.Regle-11'
      );
    } else {
        const checkVersion = config.info.version_regex;
        if (checkVersion && checkVersion != 'off') {
            if (! versionMajorMinorPatchRegex.test(version.toLowerCase())) {
                if (versionMajorMinorRcRegex.test(version.toLowerCase()) || versionMajorMinorRegex.test(version.toLowerCase())) {
                    messages.addTypedMessage(
                        ['info', 'version'],
                        '`info` object should have a version number like X.Y.z',
                        'warning',
                        'convention',
                        'CTMO.Regle-11'
                    );
                } else {
                    messages.addTypedMessage(
                        ['info', 'version'],
                        '`info` object must have a version number like X.Y.z or X.Y or X.Y-rc1',
                        checkVersion,
                        'convention',
                        'CTMO.Regle-11'
                    );
                }
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
                    'documentation',
                    'D19.15'
                );
            } else {
                if (description.length < 100) {
                    messages.addTypedMessage(
                        ['info', 'description'],
                        'API description should be longer than 100 characters.',
                        'warning',
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
              'structural',
              'CTMO.STANDARD-CODAGE-22'
            );
      }
      if (!hasContactEmail) {
            messages.addTypedMessage(
              ['info', 'contact', 'email'],
              '`contact` object must have a string-type `email` field',
              'error',
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
