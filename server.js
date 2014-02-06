var express = require('express');
var server = express();

server.configure(function(){
  server.use('/media', express.static(__dirname + '/media'));
  server.use(express.static(__dirname + '/public'));
});

//server.listen(process.env.PORT, process.env.IP);
server.listen(8080);
