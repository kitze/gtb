module.exports = {
  gtbConfig: {
    'id': '/GtbConfigSchema',
    'type': 'object',
    'properties': {
      'projects': {
        'type': 'array',
        'items': {'$ref': '/SingleProjectSchema'}
      }
    }
  },
  singleProject: {
    'id': '/SingleProjectSchema',
    'type': 'object',
    'properties': {
      'name': {
        'type': 'string'
      },
      'location': {
        'type': 'string'
      }
    },
    'required': ['name', 'location']
  }
};