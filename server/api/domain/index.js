'use strict';

var _auth = require('../../components/oauth/auth');

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var controller = require('./domain.controller');

var router = express.Router();

router.get('/', _auth2.default, controller.index);
router.post('/', _auth2.default, controller.create);
router.delete('/:domain', _auth2.default, controller.destroy);

module.exports = router;
//# sourceMappingURL=index.js.map
