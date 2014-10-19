var Device = require('zetta-device');
var util = require('util');
var http = require('http');

var endpoint = 'http://marsweather.ingenology.com/v1/latest/';

var MarsWeather = module.exports = function() {
  Device.call(this);
};
util.inherits(MarsWeather, Device);

MarsWeather.prototype.init = function(config) {
  var self = this;
  config
    .type('mars-sensor')
    .name('Mars Weather')
    .state('online')
    .when('online', { allow: ['refresh']})
    .when('refreshing', { allow: []})
    .map('refresh', this.refresh);
    
  this.sensors = ['terrestrial_date', 'sol', 'ls', 'min_temp', 'max_temp', 'pressure', 'atmo_opacity', 'season'];

  this.sensors.forEach(function(sensor){
    config
      .monitor(sensor);

    self[sensor] = null;
  });

  setTimeout(function(){
    self.refresh();
  }, 1000);
};

MarsWeather.prototype.refresh = function(cb) {
  var buf = [];
  var self = this;
  this.state = 'refreshing';
  http
    .request(endpoint, function(res){
      res.on('data', function(chunk){
        buf += chunk;
      });

      res.on('end', function(){
        var obj = JSON.parse(buf.toString());
        self.sensors.forEach(function(sensor) {
          self[sensor] = obj.report[sensor];
        });
        self.state = 'online';
        if(cb) {
          cb();
        }
      });
    })
    .end();
};
