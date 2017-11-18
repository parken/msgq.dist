'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

exports.index = index;
exports.last = last;
exports.show = show;
exports.create = create;
exports.update = update;
exports.destroy = destroy;

var _constants = require('../../config/constants');

var _sqldb = require('../../conn/sqldb');

var _sqldb2 = _interopRequireDefault(_sqldb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ADMIN = _constants.ROLES.ADMIN;
function index(req, res, next) {
  if (req.user.roleId !== ADMIN) {
    return _sqldb2.default.MessageFly.findAll({
      attributes: ['id', 'text', 'groupIds', 'numbers', 'total', 'success', 'fail', 'unicode', 'flash', 'scheduledOn'],
      where: { userId: req.user.id },
      include: [{ attributes: ['id', 'name'], model: _sqldb2.default.MessageFly }, { attributes: ['id', 'name'], model: _sqldb2.default.SenderId }, { attributes: ['id', 'name'], model: _sqldb2.default.Campaign }]
    }).then(function (data) {
      return res.json(data);
    }).catch(next);
  }

  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === undefined ? 20 : _req$query$limit,
      _req$query$offset = _req$query.offset,
      offset = _req$query$offset === undefined ? 0 : _req$query$offset,
      fl = _req$query.fl,
      where = _req$query.where;


  var options = {
    attributes: fl ? fl.split(',') : ['id', 'text', 'groupIds', 'numbers', 'total', 'success', 'fail', 'unicode', 'flash', 'scheduledOn'],
    limit: Number(limit),
    offset: Number(offset)
  };

  if (where) {
    options.where = where.split(',').reduce(function (nxt, x) {
      var _x$split = x.split(':'),
          _x$split2 = (0, _slicedToArray3.default)(_x$split, 2),
          key = _x$split2[0],
          value = _x$split2[1];

      return (0, _assign2.default)(nxt, (0, _defineProperty3.default)({}, key, value));
    }, {});
  }

  return _promise2.default.all([_sqldb2.default.MessageFly.findAll(options), _sqldb2.default.MessageFly.count()]).then(function (_ref) {
    var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
        routes = _ref2[0],
        numFound = _ref2[1];

    return res.json({ items: routes, meta: { numFound: numFound } });
  }).catch(next);
}

function last(req, res, next) {
  return _sqldb2.default.MessageFly.findAll({
    attributes: ['id', 'text', 'groupIds', 'numbers', 'total', 'success', 'fail', 'unicode', 'flash', 'scheduledOn'],
    where: { userId: req.user.id },
    include: [{ attributes: ['id', 'name'], model: _sqldb2.default.MessageFly }, { attributes: ['id', 'name'], model: _sqldb2.default.SenderId }, { attributes: ['id', 'name'], model: _sqldb2.default.Campaign }]
  }).then(function (data) {
    return res.json(data);
  }).catch(next);
}

function show(req, res, next) {
  return _sqldb2.default.MessageFly.findById(req.params.id).then(function (route) {
    return res.json(route);
  }).catch(next);
}

function create(req, res, next) {
  return _sqldb2.default.MessageFly.create((0, _assign2.default)({}, req.body, {
    createdBy: req.user.id,
    updatedBy: req.user.id
  })).then(function (_ref3) {
    var id = _ref3.id;
    return res.status(201).json({ id: id });
  }).catch(next);
}

function update(req, res, next) {
  return _sqldb2.default.MessageFly.update((0, _assign2.default)({}, req.body, {
    active: false,
    updatedBy: req.user.id
  }), { where: { id: req.params.id } }).then(function () {
    return res.status(201).end();
  }).catch(next);
}

function destroy(req, res, next) {
  return _sqldb2.default.MessageFly.destroy({ where: { id: req.params.id } }).then(function () {
    return res.status(201).end();
  }).catch(next);
}
//# sourceMappingURL=messageFly.controller.js.map
