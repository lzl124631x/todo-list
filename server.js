var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

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

app.post('/api/todos/add', function(req, res) {
  fs.readFile(TODO_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var todos = JSON.parse(data);
    todos.push(req.body);
    fs.writeFile(TODO_FILE, JSON.stringify(todos, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(todos);
    });
  });
});

app.post('/api/todos/delete', function(req, res) {
  fs.readFile(TODO_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var todos = JSON.parse(data);
    _.remove(todos, t => t.id == req.body.id);
    fs.writeFile(TODO_FILE, JSON.stringify(todos, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(todos);
    });
  });
});


app.post('/api/todos/update', function(req, res) {
  fs.readFile(TODO_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var todos = JSON.parse(data);
    var todo = req.body;
    for (var i = 0; i < todos.length; ++i) {
      if (todos[i].id == todo.id) {
        todos[i] = todo;
        break;
      }
    }
    fs.writeFile(TODO_FILE, JSON.stringify(todos, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(todos);
    });
  });
});


app.set('port', (process.env.PORT || 4000));
app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});