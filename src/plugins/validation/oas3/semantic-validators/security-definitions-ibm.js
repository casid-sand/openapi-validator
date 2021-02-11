/**
 * Copyright 2019 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Assertation 1: `type` is a necessary property and has four possible values: `apiKey`, `HTTP`, `oauth2`, `openIdConnect`
// Assertation 2: name property is required for `apiKey` type
// Assertation 3: `in` property is required for `apiKey` type, valid values are: `query`, `header` or `cookie`
// Assertation 4: `scheme` property` is required for `http` type
// Assertation 5: `flows` object is required for `oauth2` type
// Assertation 6: `opedIdConnectUrl` property is required for `openIdConnect` and must be a valid url

// Assertation 7: 'bearerFormat' property is forbidden for `apiKey` type
// Assertation 8: 'name' and 'in' properties are forbidden for `http` type

const stringValidator = require('validator');
const MessageCarrier = require('../../../utils/messageCarrier');

module.exports.validate = function({ resolvedSpec }) {
  const messages = new MessageCarrier();

  const API_KEY = 'apiKey';
  const OAUTH2 = 'oauth2';
  const HTTP = 'http';
  const OPENID_CONNECT = 'openIdConnect';
  const authTypes = [API_KEY, HTTP, OAUTH2, OPENID_CONNECT];
  const securitySchemes =
    resolvedSpec.components && resolvedSpec.components.securitySchemes;

  for (const key in securitySchemes) {
    const path = `securitySchemes.${key}`;
    const security = securitySchemes[key];
    const type = security.type;

    if (!type) {
      messages.addTypedMessage(
        path,
        'security scheme is missing required field `type`',
        'error',
        'structural'
      );
    } else if (authTypes.indexOf(type) === -1) {
      messages.addTypedMessage(
        path + '.type',
        '`type` must have one of the following types: `apiKey`, `oauth2`, `http`, `openIdConnect`',
        'error',
        'structural'
      );
    } else if (type === API_KEY) {
      //apiKey validation
      const authIn = security.in;
      if (!authIn || !['query', 'header', 'cookie'].includes(authIn)) {
        messages.addTypedMessage(
          path + '.in',
          "apiKey authorization must have required 'in' property, valid values are 'query' or 'header' or 'cookie'.",
          'error',
          'structural'
        );
      }
      if (!security.name) {
        messages.addTypedMessage(
          path,
          "apiKey authorization must have required 'name' string property. The name of the header or query property to be used.",
          'error',
          'structural'
        );
      }
      //Assertation 7
      //bearerFormat is forbidden
      if (security.bearerFormat) {
        messages.addTypedMessage(
          path,
          'apiKey authorization must not define `bearerFormat` (only available for `http` securityScheme type).',
          'error',
          'structural'
        );
      }
    }
    // oauth2 validation
    else if (type === OAUTH2) {
      const flows = security.flows;

      if (!flows) {
        messages.addTypedMessage(
          path,
          "oauth2 authorization must have required 'flows' property",
          'error',
          'structural'
        );
      } else if (
        !flows.implicit &&
        !flows.authorizationCode &&
        !flows.password &&
        !flows.clientCredentials
      ) {
        messages.addTypedMessage(
          path + '.flows',
          "oauth2 authorization `flows` must have one of the following properties: 'implicit', 'password', 'clientCredentials' or 'authorizationCode'.",
          'error',
          'structural'
        );
      } else if (flows.implicit) {
        const authorizationUrl = flows.implicit.authorizationUrl;
        if (!authorizationUrl) {
          messages.addTypedMessage(
            path + '.flows.implicit',
            "oauth2 authorization implicit flow must have required 'authorizationUrl' property.",
            'error',
            'structural'
          );
        }
        if (!flows.implicit.scopes) {
          messages.addTypedMessage(
            path + '.flows.implicit',
            "oauth2 authorization implicit flow must have required 'scopes' property.",
            'error',
            'structural'
          );
        }
        if (flows.implicit.tokenUrl) {
          messages.addTypedMessage(
            path + '.flows.implicit.tokenUrl',
            "oauth2 authorization implicit flow must not have 'tokenUrl' property.",
            'error',
            'structural'
          );
        }
      } else if (flows.authorizationCode) {
        const authorizationUrl = flows.authorizationCode.authorizationUrl;
        if (!authorizationUrl) {
          messages.addTypedMessage(
            path + '.flows.authorizationCode',
            "oauth2 authorization authorizationCode flow must have required 'authorizationUrl' property.",
            'error',
            'structural'
          );
        }
        if (!flows.authorizationCode.tokenUrl) {
          messages.addTypedMessage(
            path + '.flows.authorizationCode',
            "oauth2 authorization authorizationCode flow must have required 'tokenUrl' property.",
            'error',
            'structural'
          );
        }
        if (!flows.authorizationCode.scopes) {
          messages.addTypedMessage(
            path + '.flows.authorizationCode',
            "oauth2 authorization authorizationCode flow must have required 'scopes' property.",
            'error',
            'structural'
          );
        }
      } else if (flows.password) {
        const tokenUrl = flows.password.tokenUrl;
        if (!tokenUrl) {
          messages.addTypedMessage(
            path + '.flows.password',
            "oauth2 authorization password flow must have required 'tokenUrl' property.",
            'error',
            'structural'
          );
        }
        if (!flows.password.scopes) {
          messages.addTypedMessage(
            path + '.flows.password',
            "oauth2 authorization password flow must have required 'scopes' property.",
            'error',
            'structural'
          );
        }
        const authorizationUrl = flows.password.authorizationUrl;
        if (authorizationUrl) {
          messages.addTypedMessage(
            path + '.flows.password.authorizationUrl',
            "oauth2 authorization password flow must not have 'authorizationUrl' property.",
            'error',
            'structural'
          );
        }
      } else if (flows.clientCredentials) {
        const tokenUrl = flows.clientCredentials.tokenUrl;
        if (!tokenUrl) {
          messages.addTypedMessage(
            path + '.flows.clientCredentials',
            "oauth2 authorization clientCredentials flow must have required 'tokenUrl' property.",
            'error',
            'structural'
          );
        }
        if (!flows.clientCredentials.scopes) {
          messages.addTypedMessage(
            path + '.flows.clientCredentials',
            "oauth2 authorization clientCredentials flow must have required 'scopes' property.",
            'error',
            'structural'
          );
        }
        const authorizationUrl = flows.clientCredentials.authorizationUrl;
        if (authorizationUrl) {
          messages.addTypedMessage(
            path + '.flows.clientCredentials.authorizationUrl',
            "oauth2 authorization clientCredentials flow must not have 'authorizationUrl' property.",
            'error',
            'structural'
          );
        }
      }
    } else if (type === HTTP) {
      //scheme is required
      if (!security.scheme) {
        messages.addTypedMessage(
          path,
          'scheme must be defined for type `http`',
          'error',
          'structural'
        );
      }

      //Assertation 8
      //name is forbidden
      if (security.name) {
        messages.addTypedMessage(
          path,
          '`name` property  must not be defined for type `http` (only available for `apiKey` securityScheme type).',
          'error',
          'structural'
        );
      }
      //in is forbidden
      if (security.in) {
        messages.addTypedMessage(
          path,
          '`in` property must not be defined for type `http` (only available for `apiKey` securityScheme type).',
          'error',
          'structural'
        );
      }
    } else if (type == OPENID_CONNECT) {
      const openIdConnectURL = security.openIdConnectUrl;
      if (
        !openIdConnectURL ||
        typeof openIdConnectURL !== 'string' ||
        !stringValidator.isURL(openIdConnectURL)
      ) {
        messages.addTypedMessage(
          path,
          'openIdConnectUrl must be defined for openIdConnect property and must be a valid URL',
          'error',
          'structural'
        );
      }
    }
  }

  return messages;
};
