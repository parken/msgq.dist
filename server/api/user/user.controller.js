'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.me = me;
exports.meUpdate = meUpdate;
exports.index = index;
exports.show = show;
exports.showUuid = showUuid;
exports.create = create;
exports.createEndUser = createEndUser;
exports.createCustomer = createCustomer;
exports.signup = signup;
exports.googleLogin = googleLogin;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.duplicate = duplicate;
exports.update = update;
exports.checkExists = checkExists;
exports.otpLogin = otpLogin;
exports.otpSend = otpSend;
exports.otpVerify = otpVerify;
exports.passwordChange = passwordChange;
exports.sendLogin = sendLogin;
exports.loginUid = loginUid;
exports.addSellingRootUser = addSellingRootUser;
exports.addSelling = addSelling;

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _environment = require('../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _constants = require('../../config/constants');

var _logger = require('../../components/logger');

var _logger2 = _interopRequireDefault(_logger);

var _notify = require('../../components/notify');

var _model = require('../../components/oauth/model');

var _model2 = _interopRequireDefault(_model);

var _helper = require('../../conn/sqldb/helper');

var _sqldb = require('../../conn/sqldb');

var _sqldb2 = _interopRequireDefault(_sqldb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ADMIN = _constants.ROLES.ADMIN;
function me(req, res, next) {
  if (req.query.fl && req.query.fl.includes('sign')) {
    return _sqldb2.default.User.findById(req.user.id, { attributes: ['signature'], raw: true }).then(function (user) {
      return res.json(user);
    }).catch(next);
  }

  return _promise2.default.all([_sqldb2.default.User.findById(req.user.id, {
    attributes: ['mobile', 'email', 'name', 'id', 'roleId', 'admin', 'companyName', 'companyAddress', 'supportName', 'supportMobile', 'supportEmail'],
    raw: 'true'
  }), _sqldb2.default.Route.findAll()]).then(function (_ref) {
    var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
        u = _ref2[0],
        upstreams = _ref2[1];

    return res.json((0, _assign2.default)(u, { upstreams: upstreams }));
  }).catch(next);
}

function meUpdate(req, res, next) {
  if (req.query.fl.includes('sign')) return next();

  return _sqldb2.default.User.update({ signature: req.body.signature }, { where: { id: req.user.id } }).then(function (user) {
    return res.json(user);
  }).catch(next);
}

function index(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === undefined ? 20 : _req$query$limit,
      _req$query$offset = _req$query.offset,
      offset = _req$query$offset === undefined ? 0 : _req$query$offset,
      fl = _req$query.fl,
      where = _req$query.where;


  var options = {
    where: {},
    attributes: fl ? fl.split(',') : ['id', 'name'],
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

  if (req.user.roleId !== ADMIN) {
    options.where.resellerId = req.user.id;
  }

  return _promise2.default.all([_sqldb2.default.User.findAll(options), _sqldb2.default.User.count()]).then(function (_ref3) {
    var _ref4 = (0, _slicedToArray3.default)(_ref3, 2),
        users = _ref4[0],
        numFound = _ref4[1];

    return res.json({ items: users, meta: { numFound: numFound } });
  }).catch(next);
}

function show(req, res, next) {
  switch (req.user.roleId) {
    case 1:
    case 2:
      {
        return _sqldb2.default.User.find({
          attributes: ['id', 'name', 'email', 'mobile'],
          where: { id: req.params.id }
        }).then(function (data) {
          return res.json(data);
        }).catch(next);
      }
    default:
      {
        return _sqldb2.default.User.find({
          where: { id: req.params.id },
          attributes: ['id', 'name', 'email', 'mobile']
        }).then(function (data) {
          return res.json(_.omit(data, ['password']));
        }).catch(next);
      }
  }
}

function showUuid(req, res, next) {
  return _sqldb2.default.LoginIdentifier.find({
    where: { uuid: req.params.uuid },
    attributes: ['id'],
    include: [{
      model: _sqldb2.default.User,
      attributes: ['id', 'mobile', 'otp'],
      required: true
    }]
  }).then(function (loginIdentifier) {
    if (!loginIdentifier) return res.status(400).json({ message: 'Invalid Request' });
    return res.json(loginIdentifier.User);
  }).catch(next);
}

function create(req, res, next) {
  var user = req.body;
  if (('' + user.mobile).length === 10) user.mobile = Number('91' + user.mobile);
  if (('' + user.supportMobile).length === 10) user.supportMobile = Number('91' + user.supportMobile);
  user.roleId = req.user.roleId + 1;
  user.createdBy = req.user.id;

  if (req.user.roleId !== ADMIN) {
    user.resellerId = req.user.resellerId || req.user.id;
  }

  return _sqldb2.default.User.create(user).then(function (data) {
    return res.json(data);
  }).catch(next);
}

function createEndUser(req, res, next) {
  var user = req.body;
  user.roleId = 4;
  user.createdBy = req.user.id;
  user.otp = Math.floor(Math.random() * 90000) + 10000;
  delete user.id;
  return _sqldb2.default.User.find({ where: { email: user.email, createdBy: user.createdBy, roleId: user.roleId } }).then(function (data) {
    return data ? _promise2.default.resolve(data) : _sqldb2.default.User.create(user);
  }).then(function (data) {
    return res.json(data);
  }).catch(next);
}

function createCustomer(req, res, next) {
  var user = req.body;
  user.roleId = 5;
  user.createdBy = req.user.id;
  user.otp = Math.floor(Math.random() * 90000) + 10000;
  delete user.id;
  return _sqldb2.default.User.find({ where: { email: user.email, createdBy: user.createdBy, roleId: user.roleId } }).then(function (data) {
    return data ? _promise2.default.resolve(data) : _sqldb2.default.User.create(user);
  }).then(function (data) {
    return res.json(data);
  }).catch(next);
}

function signup(req, res, next) {
  var authorization = req.get('authorization');
  if (!authorization) return res.status(403).json({ message: 'Unauthorized Access.' });

  var _Buffer$from$toString = Buffer.from(authorization.split(' ')[1], 'base64').toString('ascii').split(':'),
      _Buffer$from$toString2 = (0, _slicedToArray3.default)(_Buffer$from$toString, 2),
      clientId = _Buffer$from$toString2[0],
      clientSecret = _Buffer$from$toString2[1];

  return _sqldb2.default.App.find({ attributes: ['id'], where: { clientId: clientId, clientSecret: clientSecret } }).then(function (app) {
    if (!app) return res.status(403).json({ message: 'Invalid Authentication.' });
    var _req$body = req.body,
        name = _req$body.name,
        email = _req$body.email,
        mobile = _req$body.mobile;
    var roleId = req.body.roleId;

    if (!roleId) roleId = 4;
    var password = req.body.password;

    var otp = Math.floor(Math.random() * 90000) + 10000;
    if (!password) password = otp;
    var where = { $or: [], appId: app.id };
    if (email) where.$or.push({ email: email });
    if (mobile) where.$or.push({ mobile: mobile });
    return _sqldb2.default.User.find({ where: where }).then(function (user) {
      return user ? res.status(409).end() : _sqldb2.default.User.create({ name: name, email: email, mobile: mobile, otp: otp, password: password, appId: app.id, roleId: roleId }).then(function () {
        return res.end();
      });
    });
  }).catch(next);
}

function getApp(code) {
  return _sqldb2.default.AuthCode.find({ where: { auth_code: code }, include: [_sqldb2.default.App] }).then(function (authCode) {
    return authCode.App.toJSON();
  });
}

function googleLogin(req, res, next) {
  var authorization = req.get('authorization');
  if (!authorization) return res.status(403).json({ message: 'Unauthorized Access.' });

  var _Buffer$from$toString3 = Buffer.from(authorization.split(' ')[1], 'base64').toString('ascii').split(':'),
      _Buffer$from$toString4 = (0, _slicedToArray3.default)(_Buffer$from$toString3, 2),
      clientId = _Buffer$from$toString4[0],
      clientSecret = _Buffer$from$toString4[1];

  return _sqldb2.default.App.find({ attributes: ['id', 'clientId', 'clientSecret'], where: { clientId: clientId, clientSecret: clientSecret } }).then(function (app) {
    if (!app) return res.status(400).json({ message: 'Invalid Authentication.' });
    var email = req.body.email;

    return _sqldb2.default.User.find({ attributes: ['email', 'otp'], where: { email: email, appId: app.id } }).then(function (user) {
      if (!user) return res.status(400).json({ message: 'user not found' });
      var options = {
        method: 'POST',
        uri: '' + _environment2.default.OAUTH_SERVER + _environment2.default.OAUTH_ENDPOINT,
        auth: {
          user: app.clientId,
          pass: app.clientSecret
        },
        headers: {
          'user-agent': req.headers['user-agent'],
          'x-forwarded-for': req.headers['x-forwarded-for'] || req.connection.remoteAddress
        },
        form: {
          grant_type: 'password',
          username: user.email,
          password: user.otp
        },
        json: true
      };
      return (0, _requestPromise2.default)(options).then(function (data) {
        return res.json(data);
      });
    });
  }).catch(next);
}

function login(req, res, next) {
  var code = req.body.code;

  return (code ? getApp(code) : _sqldb2.default.App.findById(1, { raw: true })).then(function (app) {
    var options = {
      url: '' + _environment2.default.OAUTH_SERVER + _environment2.default.OAUTH_ENDPOINT,
      auth: {
        user: app.clientId,
        pass: app.clientSecret
      },
      headers: {
        'user-agent': req.headers['user-agent'],
        'x-forwarded-for': req.headers['x-forwarded-for'] || req.connection.remoteAddress
      }
    };

    options.form = code ? { grant_type: 'authorization_code', redirect_uri: '' + app.redirectUri, code: code } : { grant_type: 'password', username: req.body.username, password: req.body.password };

    _request2.default.post(options, function (err, apires, body) {
      if (err) return res.status(500).json({ err: err, body: body });
      return res.status(apires.statusCode).send(body);
    });
  });
}

function refresh(req, res, next) {
  return _sqldb2.default.App.find({
    include: [{
      model: _sqldb2.default.RefreshToken,
      where: { refreshToken: req.body.refresh_token },
      required: true
    }]
  }).then(function (app) {
    if (!app) return res.status(400).json({ message: 'Invalid Token' });
    var options = {
      url: '' + _environment2.default.OAUTH_SERVER + _environment2.default.OAUTH_ENDPOINT,
      auth: {
        user: app.clientId,
        pass: app.clientSecret
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: req.body.refreshToken
      },
      headers: {
        'user-agent': req.headers['user-agent'],
        'x-forwarded-for': req.headers['x-forwarded-for'] || req.connection.remoteAddress
      }
    };
    return _request2.default.post(options, function (err, apires, body) {
      if (err) return next(err);
      return res.status(apires.statusCode).send(body);
    });
  });
}

function logout(req, res, next) {
  return _model2.default.revokeToken(req.body.access_token).then(function (up) {
    return res.status(200).json(up);
  }).catch(next);
}

function duplicate(req, res, next) {
  var mobile = '91' + req.query.mobile;
  return _sqldb2.default.User.count({ where: { mobile: mobile } }).then(function (data) {
    return res.json({ mobile: !!data });
  }).catch(next);
}

function update(req, res, next) {
  var id = req.user.id || req.params.id;
  var user = req.body;
  delete user.id;
  return _sqldb2.default.User.update(user, { where: { id: id } }).then(function () {
    return res.json({ id: id });
  }).catch(next);
}

// Check email and phone exists
function checkExists(req, res, next) {
  return _sqldb2.default.User.checkExists(_sqldb2.default, req.query.email, req.query.mobile).then(function (status) {
    return res.json(status);
  }).catch(next);
}

function otpLogin(req, res, next) {
  return _sqldb2.default.User.findOrCreate({
    where: {
      mobile: req.body.username || req.body.mobile
    },
    attributes: ['id', 'otpStatus', 'otp', 'mobile']
  }).then(function (_ref5) {
    var _ref6 = (0, _slicedToArray3.default)(_ref5, 2),
        user = _ref6[0],
        newUser = _ref6[1];

    if (!user) {
      return res.status(400).json({
        message: 'User Details not matching with our records. Please contact support'
      });
    }

    var otp = user.otpStatus === 1 && user.otp ? user.otp : Math.floor(Math.random() * 90000) + 10000;

    var text = otp + ' is your OTP. Treat this as confidential. Sharing it with anyone gives' + 'them full access to your account. We never call you to verify OTP.';
    if (user.mobile) (0, _notify.sms)({ to: user.mobile, text: text });
    _sqldb2.default.User.update({ otp: otp, otpStatus: 1 }, { where: { id: user.id } }).catch(function (err) {
      return _logger2.default.error('user.ctrl/otp', err);
    });
    return res.json({ message: 'success', id: user.id, newUser: newUser });
  }).catch(next);
}

function otpSend(req, res, next) {
  _sqldb2.default.User.find({
    where: {
      $or: {
        email: req.body.username,
        mobile: req.body.username
      }
    },
    attributes: ['id', 'otpStatus', 'otp', 'mobile']
  }).then(function (user) {
    if (!user) {
      return res.status(400).json({
        message: 'User Details not matching with our records. Please contact support'
      });
    }

    var otp = user.otpStatus === 1 && user.otp ? user.otp : Math.floor(Math.random() * 90000) + 10000;

    var text = otp + ' is your OTP. Treat this as confidential. Sharing it with anyone gives' + 'them full access to your account. We never call you to verify OTP.';
    if (user.mobile) (0, _notify.sms)({ to: user.mobile, text: text });
    _sqldb2.default.User.update({ otp: otp, otpStatus: 1 }, { where: { id: user.id } }).catch(function (err) {
      return _logger2.default.error('user.ctrl/otp', err);
    });
    return res.json({ message: 'success', id: user.id });
  }).catch(next);
}

function otpVerify(req, res, next) {
  _sqldb2.default.User.find({
    attributes: ['id'],
    where: {
      $or: [{ id: req.body.id }, { mobile: req.body.mobile }],
      otp: req.body.otp
    }
  }).then(function (user) {
    if (!user) return res.status(400).json({ error_description: 'Invalid OTP' });
    user.update({ otpStatus: 0 }).catch(function (err) {
      return _logger2.default.error('user.ctrl/otpVerify', err);
    });
    return res.json({ message: 'success', id: user.id });
  }).catch(next);
}

// Creates a new User in the DB
function passwordChange(req, res, next) {
  return _sqldb2.default.User.find({
    where: {
      id: req.body.id,
      otp: req.body.otp
    },
    attributes: ['id', 'mobile', 'email', 'name']
  }).then(function (u) {
    if (!u) {
      return res.status(400).json({ error: 'Invalid password', error_description: 'Invalid current password' });
    }

    return u.update({ password: req.body.password }).then(function () {
      res.status(204).end();
      u.revokeTokens(_sqldb2.default); // revoke all
      var id = u.id,
          name = u.name,
          mobile = u.mobile,
          email = u.email;

      return (0, _notify.slack)('Password change: ' + id + ', ' + name + ', ' + mobile + ', ' + email);
    });
  }).catch(next);
}

function sendLogin(req, res, next) {
  return _sqldb2.default.User.find({ where: { id: req.params.id } }).then(function (user) {
    if (!user) return res.status(400).end();
    var otp = user.otpStatus === 1 && user.otp ? user.otp : Math.floor(Math.random() * 90000) + 10000;

    var text = 'Your account has been created click on the link to login ' + req.origin + '/home?otp=' + otp + '&id=' + user.mobile;

    if (user.mobile) (0, _notify.sms)({ to: user.mobile, text: text });
    _sqldb2.default.User.update({ otp: otp, otpStatus: 1 }, { where: { id: user.id } }).catch(function (err) {
      return _logger2.default.error('user.ctrl/otp', err);
    });
    return res.json({ message: 'success', id: user.id });
  }).catch(next);
}

function loginUid(req, res, next) {
  return res.status(500).json({});
}

function addSellingRootUser(req, res, next) {
  var _req$body2 = req.body,
      userId = _req$body2.userId,
      routeId = _req$body2.routeId,
      limit = _req$body2.limit;

  if (!userId || !routeId || !limit || req.user.roleId !== 1) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }
  return _sqldb2.default.Selling.create({ userId: userId,
    routeId: routeId,
    limit: Number(limit),
    createdBy: req.user.id,
    updatedBy: req.user.id }).then(function () {
    return res.status(202).end();
  }).catch(next);
}

function addSelling(req, res, next) {
  var _req$body3 = req.body,
      userId = _req$body3.userId,
      sendingUserId = _req$body3.sendingUserId,
      routeId = _req$body3.routeId,
      limit = _req$body3.limit,
      fromUserId = _req$body3.fromUserId;

  if (!userId || !sendingUserId || !routeId || !limit) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }
  if (req.user['sellingBalance' + (0, _helper.getRouteType)(routeId)] < limit) {
    return res.status(400).json({ message: 'Limit Exceeded.' });
  }
  return _sqldb2.default.Selling.create({ userId: userId,
    sendingUserId: sendingUserId,
    routeId: routeId,
    limit: Number(limit),
    fromUserId: fromUserId || req.user.id,
    createdBy: req.user.id,
    updatedBy: req.user.id }).then(function () {
    return res.status(202).end();
  }).catch(next);
}
//# sourceMappingURL=user.controller.js.map
