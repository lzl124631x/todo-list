var React = require('react');
var ReactDOM = require('react-dom');
var classNames = require('classnames');
var $ = require('jquery');

var Todo = React.createClass({
  touchMoveWidth: 50,

  getInitialState: function() {
    return { todo: this.props.data, style: undefined, point: undefined, animating: false, lastDone: this.props.data.done };
  },

  render: function() {
    var classes = classNames('todo', { 'done': this.state.todo.done }, { 'animating': this.state.animating });
    var style = {
      transform: 'translateX(' + this.state.deltaX + 'px)'
    };
    return (
      <div className={classes} onTouchStart={this.onTouch} onTouchMove={this.onTouch} onTouchEnd={this.onTouch} style={style} onTransitionEnd={this.onTransitionEnd}>
        <input type="checkbox" onChange={this.toggleDone} checked={this.state.todo.done}/>
        <p>{this.state.todo.text}</p>
        <p className="todo-created">{this.timestampToDateString(this.state.todo.created)}</p>
        <button onClick={this.onDelete}>Delete</button>
      </div>
    );
  },

  timestampToDateString: function(timestamp) {
    return new Date(+timestamp).toLocaleDateString();
  },

  onDelete: function() {
    this.props.onTodoDelete(this.state.todo.id);
  },

  toggleDone: function() {
    var todo = this.state.todo;
    todo.done = !todo.done;
    this.updateTodo(todo);
  },

  updateTodo: function(todo) {
    this.setState({ todo: todo }, function() {
      this.props.onTodoChange(this.state.todo);
    });
  },

  onTouch: function(e) {
    if (e.type == 'touchend') {
      if (this.state.deltaX != 0) { // Only animates with nonzero deltaX
        this.setState({ animating: true });
      }
      this.setState({ point: undefined, deltaX: 0 });
    }
    // Only responds to one finger touch.
    if (e.touches.length != 1) return;
    var touch = e.touches[0];
    var to = { x: touch.clientX, y: touch.clientY };
    if (e.type == 'touchstart') {
      this.setState({ point: to });
    } else {
      var from = this.state.point,
      deltaX = Math.abs(to.x - from.x),
      sign = to.x > from.x ? 1 : -1;
      if (deltaX > this.touchMoveWidth) {
        if (sign == 1 && this.state.lastDone == this.state.todo.done) {
          // Check / uncheck item
          this.toggleDone();
        } else if (sign == -1) {
          // Delete item
          this.onDelete();
        }
        deltaX = (deltaX - this.touchMoveWidth) / 5 + this.touchMoveWidth;
      }
      this.setState({ deltaX: sign * deltaX });
    }
  },

  onTransitionEnd: function() {
    this.setState({ animating: false, lastDone: this.state.todo.done });
  }
});

var TodoList = React.createClass({
  render: function() {
    var self = this;
    var done = [], notDone = [];
    var todos = this.props.data;
    for (var i = 0; i < todos.length; ++i) {
      if (todos[i].done) {
        done.push(todos[i]);
      } else {
        notDone.push(todos[i]);
      }
    }
    todos = notDone.concat(done);
    var todoNodes = todos.map(function(todo) {
      return (
        <Todo key={todo.id} data={todo} onTodoDelete={self.props.onTodoDelete} onTodoChange={self.props.onTodoChange}/>
      );
    });
    return (
      <div className="todo-list">
        {todoNodes}
      </div>
    );
  }
});

var TodoForm = React.createClass({
  getInitialState: function() {
    return {text: ''};
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var now = Date.now();
    var text = this.state.text.trim();
    if (!text) {
      return;
    }
    this.props.onTodoSubmit({id: now, text: text, created: now, modified: now, done: false });
    this.setState({text: ''});
  },
  render: function() {
    return (
      <form className="todoForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Enter a new to-do..."
          value={this.state.text}
          onChange={this.handleTextChange}
        />
        <input type="submit" value="Add" />
      </form>
    );
  }
});

var TodoBox = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  loadTodosFromServer: function() {
    $.get({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleTodoSubmit: function(todo) {
    var todos = this.state.data;
    var newTodos = todos.concat([todo]);
    this.setState({data: newTodos});
    $.post({
      url: this.props.url + '/add',
      contentType: 'application/json',
      data: JSON.stringify(todo),
      dataType: 'json',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: todos});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleTodoDelete: function(id) {
    $.post({
      url: '/api/todos/delete',
      contentType: 'application/json',
      data: JSON.stringify({ id: id }),
      dataType: 'json',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: todos});
        console.error('/api/todos/delete', status, err.toString());
      }.bind(this)
    });
  },
  handleTodoChange: function(todo) {
    var todos = this.state.data;
    for (var i = 0; i < todos.length; ++i) {
      if (todos[i].id == todo.id) {
        todos[i] = todo;
        break;
      }
    }
    this.setState({ data: todos });
    $.post({
      url: this.props.url + '/update',
      contentType: 'application/json',
      data: JSON.stringify(todo),
      dataType: 'json',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: todos});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadTodosFromServer();
    setInterval(this.loadTodosFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="todoBox">
        <h1 className="header">Todo</h1>
        <TodoList data={this.state.data} onTodoDelete={this.handleTodoDelete} onTodoChange={this.handleTodoChange}/>
        <TodoForm onTodoSubmit={this.handleTodoSubmit} />
      </div>
    );
  }
});

ReactDOM.render(
  <TodoBox url="/api/todos"  pollInterval={2000}/>,
  document.getElementById('todo-list')
);