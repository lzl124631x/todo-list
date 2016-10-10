var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

var TODO_FILE = path.join(__dirname, 'todos.json');

// Create if not exists.
fs.stat(TODO_FILE, function(err, stat){
  if (err && err.code == 'ENOENT') {
    fs.writeFileSync(TODO_FILE, '[]');
  }
});

function updateTodos(todos, res) {
  fs.writeFile(TODO_FILE, JSON.stringify(todos, null, 4), function(err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(todos);
  });
}

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
    todos.splice(req.body.insertAt, 0, req.body.todo);
    updateTodos(todos, res);
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
    updateTodos(todos, res);
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
    updateTodos(todos, res);
  });
});

app.post('/api/todos/move', function(req, res) {
  fs.readFile(TODO_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var todos = JSON.parse(data);
    var id = req.body.id,
    d = req.body.d;
    for (var i = 0; i < todos.length; ++i) {
      if (todos[i].id == id) {
        var j = i + d;
        if (j < 0 || j >= todos.length) {
          console.log('invalid move');
        } else {
          var tmp = todos[i];
          todos[i] = todos[j];
          todos[j] = tmp;
          updateTodos(todos, res);
        }
        break;
      }
    }
  });
});

app.set('port', (process.env.PORT || 4000));
app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});