// Assertation 1:
// check if info exists

// Assertation 2:
// making sure that the required version and title are defined properly

// Assertation 3:
// making sure that the contact email is defined, and warn if contact name is not defined

const MessageCarrier = require('../../../utils/messageCarrier');

module.exports.validate = function({ jsSpec }) {
  const messages = new MessageCarrier();

  const info = jsSpec.info;
  const hasInfo = info && typeof info === 'object';
  if (!hasInfo) {
    messages.addMessage(
      ['info'],
      'API definition must have an `info` object',
      'error'
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
      messages.addMessage(
        ['info', 'version'],
        '`info` object must have a string-type `version` field',
        'error'
      );
      }
      
    // Assertation 3
    const contact = jsSpec.info.contact;
    const hasContact = contact && typeof contact === 'object';
      
    if (!hasContact) {
          messages.addMessage(
            ['info', 'contact'],
            '`info` object must have a `contact` object',
            'error'
          );
    } else {
      const contactName = contact.name;
        const hasContactName =
          typeof contactName === 'string' && contactName.toString().trim().length > 0;
          
      const contactEmail = contact.email;
        const hasContactEmail =
          typeof contactEmail === 'string' && contactEmail.toString().trim().length > 0;
          
      if (!hasContactName) {
            messages.addMessage(
              ['info', 'contact', 'name'],
              '`contact` object must have a string-type `name` field',
              'warning'
            );
      }
      if (!hasContactEmail) {
            messages.addMessage(
              ['info', 'contact', 'email'],
              '`contact` object must have a string-type `email` field',
              'error'
            );
      }
          
    }
  }
  return messages;
};
