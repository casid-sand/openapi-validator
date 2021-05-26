const expect = require('expect');
const {
  validate
} = require('../../../../src/plugins/validation/swagger2/semantic-validators/parameters');

describe('validation plugin - semantic - parameters', () => {
  
  const config = {
    parameters: {
      parameter_definition: 'warning'
    }
  };
  
  it('should return an error when an array type parameter omits an `items` property', () => {
    const spec = {
      paths: {
        '/pets': {
          get: {
            parameters: [
              {
                name: 'tags',
                in: 'query',
                description: 'tags to filter by',
                type: 'array'
              }
            ]
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec });
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual([
      'paths',
      '/pets',
      'get',
      'parameters',
      '0'
    ]);
    expect(res.errors[0].message).toEqual(
      "Parameters with 'array' type require an 'items' property."
    );
    expect(res.warnings.length).toEqual(0);
  });

  it('should return be ok for valid parameters', () => {
    const spec = {
      paths: {
        '/pets': {
          get: {
            parameters: [
              {
                name: 'tags',
                in: 'query',
                description: 'tags to filter by',
                type: 'array',
                items: {type : 'integer'}
              },
              {
                name: 'userFilter',
                in: 'query',
                description: 'user filter',
                type: 'string'
              },
              {
                name: 'myQuery',
                in: 'body',
                description: 'tags to filter by',
                schema: 'mySchema'
              }
            ]
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec }, config);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(0);
  });

  it('should return a warning for body parameter without schema', () => {
    const spec = {
      paths: {
        '/pets': {
          get: {
            parameters: [
              {
                name: 'tags',
                in: 'body',
                description: 'tags to filter by',
              }
            ]
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec }, config);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual([
      'paths',
      '/pets',
      'get',
      'parameters',
      '0'
    ]);
    expect(res.warnings[0].message).toEqual(
      "Parameters in 'body' have required property 'schema'."
    );
    expect(res.errors.length).toEqual(0);
  });

  it('should return a warning for body parameter with type', () => {
    const spec = {
      paths: {
        '/pets': {
          get: {
            parameters: [
              {
                name: 'tags',
                in: 'body',
                description: 'tags to filter by',
                type: 'integer',
                schema: 'string'
              }
            ]
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec }, config);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual([
      'paths',
      '/pets',
      'get',
      'parameters',
      '0'
    ]);
    expect(res.warnings[0].message).toEqual(
      "Parameters in 'body' should NOT have additional properties : type."
    );
    expect(res.errors.length).toEqual(0);
  });

  it('should return a warning for non-body parameter with schema', () => {
    const spec = {
      paths: {
        '/pets': {
          get: {
            parameters: [
              {
                name: 'tags',
                in: 'query',
                description: 'tags to filter by',
                schema: 'integer',
                type: 'integer'
              }
            ]
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec }, config);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual([
      'paths',
      '/pets',
      'get',
      'parameters',
      '0'
    ]);
    expect(res.warnings[0].message).toEqual(
      "Parameters not in 'body' should NOT have additional properties : schema."
    );
    expect(res.errors.length).toEqual(0);
  });

  it('should return a warning for non-body parameter without type', () => {
    const spec = {
      paths: {
        '/pets': {
          get: {
            parameters: [
              {
                name: 'tags',
                in: 'query',
                description: 'tags to filter by',
              }
            ]
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec }, config);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual([
      'paths',
      '/pets',
      'get',
      'parameters',
      '0'
    ]);
    expect(res.warnings[0].message).toEqual(
      "Parameters not in 'body' have required property 'type'."
    );
    expect(res.errors.length).toEqual(0);
  });

});
