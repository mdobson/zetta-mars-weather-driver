var zetta = require('zetta');
var Mars = require('../');

zetta()
  .use(Mars)
  .listen(1337);
