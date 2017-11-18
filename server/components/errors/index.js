'use strict';

module.exports[404] = function pageNotFound(req, res) {
  var viewFilePath = '404';
  var statusCode = 404;
  var result = {
    status: statusCode
  };

  res.status(result.status);
  res.render(viewFilePath, {}, function (err, html) {
    if (err) {
      return res.status(result.status).json(result);
    }

    return res.send(html);
  });
};
//# sourceMappingURL=index.js.map
