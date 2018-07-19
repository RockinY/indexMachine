'use strict';

var _elastic = require('../utils/elastic');

var _elastic2 = _interopRequireDefault(_elastic);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Delete all existing indexes
console.log('Start deleting');

_elastic2.default.indices.delete({
  index: '*'
}).then(() => console.log('Done'));
