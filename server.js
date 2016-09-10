var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();

app.use('/', express.static(path.join(__dirname, 'public')));

var TODO_FILE = path.join(__dirname, 'todos.json');

app.get('/api/todos', function(req, res) {
  fs.readFile(TODO_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

app.set('port', (process.env.PORT || 4000));
app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
