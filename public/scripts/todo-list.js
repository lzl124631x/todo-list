var React = require('react');
var ReactDOM = require('react-dom');
var classNames = require('classnames');
var $ = require('jquery');

var Todo = React.createClass({
  touchMoveWidth: 50,

  getInitialState: function() {
    return {
      todo: this.props.data,
      style: undefined,
      point: undefined,
      animating: false,
      lastDone: this.props.data.done,
      deltaX: 0,
      deltaY: 0,
      movedDelta: 0,
      operation: null,
      disableTouch: false
    };
  },

  render: function() {
    var classes = classNames('todo', { 'done': this.state.todo.done }, { 'animating': this.state.animating }, { 'long-press': this.state.longPressed });
    var style = {
      transform: 'translate(' + this.state.deltaX + 'px, ' + this.state.deltaY + 'px)',
      backgroundColor: this.props.backgroundColor
    };
    var placeholder;
    if (this.state.longPressed) {
      style.transform += ' scale(1.1)';
      style.boxShadow = '0 0.15em 0.5em rgba(0, 0, 0, 0.3)';
      style.zIndex = '1';
      style.position = 'absolute';
      style.top = this.offset.top;
      style.left = this.offset.left;
      placeholder = (<div className="todo">&nbsp;</div>);
    }
    return (
      <div className="slot" ref={(r) => this._slot = r }>
        <div className={classes} onTouchStart={this.onTouch} onTouchMove={this.onTouch} onTouchEnd={this.onTouch} style={style} onTransitionEnd={this.onTransitionEnd}>
          {this.state.todo.text}
        </div>
        {placeholder}
      </div>
    );
  },

  timestampToDateString: function(timestamp) {
    return new Date(+timestamp).toLocaleDateString();
  },

  onDelete: function() {
    var self = this;
    this.setState({ disableTouch: true });
    $(this._slot).css({ transform: 'translateX(-100%)', transition: 'transform .5s' })
    .one('transitionend',
      function() {
        $(this).slideUp(
          200, 
          function() {
            self.props.onTodoDelete(self.state.todo.id);
            self.setState({ disableTouch: false });
          });
      });
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
    // block touch event during operations (toggle/delete)
    if (this.state.disableTouch) return;
    switch(e.type) {
      case 'touchstart': this.onTouchStart(e); break;
      case 'touchmove': this.onTouchMove(e); break;
      case 'touchend': this.onTouchEnd(e); break;
    }
  },

  onTouchStart: function(e) {
    // Only responds to one finger touch.
    if (e.touches.length != 1) return;
    var touch = e.touches[0];
    this.setState({ point: { x: touch.clientX, y: touch.clientY } });
    var longPressTimer = setTimeout(function() {
      this.setState({ longPressed: true });
    }.bind(this), 800);
    this.setState({ longPressTimer: longPressTimer });
    this.offset = $(this._slot).offset();
  },

  clearLongPressTimer: function() {
    if (this.state.longPressTimer) {
      clearTimeout(this.state.longPressTimer);
      this.setState({ longPressTimer: undefined });
    }
  },

  onTouchMove: function(e) {
    this.clearLongPressTimer();
    // only respond to one finder touch.
    if (e.touches.length != 1) return;
    var t = e.touches[0], touch = {};
    touch.point = { x: t.clientX, y: t.clientY },
    touch.delta = { x: touch.point.x - this.state.point.x, y: touch.point.y - this.state.point.y };
    if (this.state.longPressed) {
      this.handleLondPress(e);
    } else if (Math.abs(touch.delta.x) > Math.abs(touch.delta.y)) {
      this.handleHorizontalMove(e);
    } else {
      this.setState({ operation: 'VerticalDrag' });
      this.props.handleVerticalMove(e, touch);
    }
  },

  onTouchEnd: function(e) {
    this.clearLongPressTimer();
    if (this.state.operation == 'VerticalDrag') {
      this.props.handleVerticalMove(e);
      return;
    }
    if (this.state.deltaX != 0 || this.state.deltaY != 0) { // Only animates with nonzero delta
      this.setState({ animating: true });
    }
    this.setState({ point: undefined, deltaX: 0, deltaY: 0 });
    this.setState({ longPressed: false, movedDelta: 0 });
  },

  handleLondPress: function(e) {
    var touch = e.touches[0];
    var to = { x: touch.clientX, y: touch.clientY };
    var deltaY = touch.clientY - this.state.point.y;
    // long press and drag vertically to reorder item.
    this.setState({ deltaY: deltaY });
    var height = $(this._slot).outerHeight();
    var threshold = this.state.movedDelta * height;
    if (deltaY > threshold + height / 2) {
      if (this.props.moveTodo(this.props.data.id, 1)) {
        this.setState({ movedDelta: this.state.movedDelta + 1 });
      }
    } else if (deltaY < threshold - height / 2) {
      if (this.props.moveTodo(this.props.data.id, -1)) {
        this.setState({ movedDelta: this.state.movedDelta - 1 });
      }
    }
  },

  handleHorizontalMove: function(e) {
    var touch = e.touches[0];
    var to = touch.clientX;
    var from = this.state.point.x,
    deltaX = Math.abs(to - from),
    sign = to > from ? 1 : -1;
    // drag horizontally to toggle / delete item.
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
  },

  onTransitionEnd: function() {
    this.setState({ animating: false, lastDone: this.state.todo.done });
  }
});

var TodoList = React.createClass({
  getInitialState: function() {
    return {
      style: {
        perspective: 300
      },
      newItemStyle: {
        // transform: 'rotateX(90deg)',
        transformOrigin: 'bottom',
        backgroundColor: 'hsl(354.1,100%,48%)',
        // opacity: 0
      },
      newItemTextOpacity: 1,
      state: null
    }
  },

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
    var hue = 354.1;
    var todoNodes = todos.map(function(todo) {
      var backgroundColor = 'hsl(' + hue + ',100%, 48%)';
      hue += 3;
      return (
        <Todo key={todo.id} data={todo} backgroundColor={backgroundColor} onTodoDelete={self.props.onTodoDelete} onTodoChange={self.props.onTodoChange} moveTodo={self.props.moveTodo} handleVerticalMove={self.handleVerticalMove}/>
      );
    });
            //     <span style={{ opacity: this.state.newItemTextOpacity }}>Pull to Create Item</span>
            // <span style={{ opacity: 1 - this.state.newItemTextOpacity }}>Release to Create Item</span>
    return (
      <div className="todo-list" style={this.state.style} ref={ (r) => this._list = r } onTransitionEnd={ this.onTransitionEnd }>
        <div className="todo" style={ this.state.newItemStyle }>
          <div className="new-item-text">
          <TodoInput onTodoSubmit={this.props.onTodoSubmit}/>
          </div>
        </div>
        {todoNodes}
      </div>
    );
  },

  handleVerticalMove: function(e, t) {
    var style = {
      perspective: 300
    };
    if (e.type == 'touchend') {
      if (this.state.state == 'pullToCreateItem') {
        this.setState({ state: null });
        style.transition = 'transform .3s'; // list goes back to original position
        this.setState({
          newItemStyle: {
            transform: 'rotateX(90deg)',
            transformOrigin: 'bottom',
            backgroundColor: 'hsl(354.1,100%,48%)',
            opacity: 0,
            transition: 'transform .3s, opacity .3s',
          }
        });
      } else {
        this.setState({ state: null });
        style.transition = 'transform .3s'; // list goes back to original position
        this.setState({
          newItemStyle: {
            transform: 'rotateX(0)',
            transformOrigin: 'bottom',
            backgroundColor: 'hsl(354.1,100%,48%)',
            opacity: 1
          }
        })
      }
    } else {
      if(t.delta.y < 100) {
        this.setState({ state: 'pullToCreateItem' });
      } else {
        this.setState({ state: 'releaseToCreateItem' });
      }
      style.transform = 'translateY(' + t.delta.y / 3 + 'px)';

      var deg = 0;
      if (t.delta.y <= 100) {
        deg = (100 - t.delta.y) / 100 * 90;
      }
      var newItemTextOpacity = t.delta.y > 100 ? 0 : 1;
      this.setState({
        newItemStyle: {
          transform: 'rotateX(' + deg + 'deg)',
          transformOrigin: 'bottom',
          backgroundColor: 'hsl(354.1,100%,48%)',
          opacity: (90 - deg) / 90
        },
        newItemTextOpacity: newItemTextOpacity
      })
    }
    this.setState({ style: style });
  },

  onTransitionEnd: function() {
    this.setState({ style: {
      perspective: 300
    } });
  }
});

var TodoInput = React.createClass({
  getInitialState: function() {
    return { text: '' };
  },

  render: function() {
    return (
      <input className="new-item-input" type="text" value={this.state.text} onChange={this.handleChange} onKeyDown={this.handleKeyDown}/>
      );
  },

  handleChange: function(e) {
    this.setState({ text: e.target.value });
  },

  handleKeyDown: function(e) {
    if (e.keyCode === 13) {
      var now = Date.now();
      var text = this.state.text.trim();
      if (!text) {
        return;
      }
      this.props.onTodoSubmit({id: now, text: text, created: now, modified: now, done: false });
      this.setState({text: ''});
    }
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
  handleTodoSubmit: function(todo, insertAt) {
    var todos = this.state.data,
    newTodos = todos.slice(0);
    newTodos.splice(insertAt, 0, todo);
    this.setState({data: newTodos});
    $.post({
      url: this.props.url + '/add',
      contentType: 'application/json',
      data: JSON.stringify({ insertAt: insertAt, todo: todo }),
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
    // setInterval(this.loadTodosFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="todoBox">
        <TodoList data={this.state.data} onTodoDelete={this.handleTodoDelete} onTodoChange={this.handleTodoChange} moveTodo={this.moveTodo} onTodoSubmit={this.handleTodoSubmit}/>
      </div>
    );
  },

  moveTodo: function(id, d) {
    var todos = this.state.data;
    for (var i = 0; i < todos.length; ++i) {
      if (todos[i].id == id) {
        var j = i + d;
        if (j < 0 || j >= todos.length) {
          return false;
        } else {
          var tmp = todos[i];
          todos[i] = todos[j];
          todos[j] = tmp;
          this.setState({ data: todos });
        }
        $.post({
          url: this.props.url + '/move',
          contentType: 'application/json',
          data: JSON.stringify({ id: id, d: d }),
          dataType: 'json',
          success: function(data) {
            this.setState({data: data});
          }.bind(this),
          error: function(xhr, status, err) {
            this.setState({data: todos});
            console.error(this.props.url, status, err.toString());
          }.bind(this)
        });
        return true;
      }
    }
    return false;
  }
});

ReactDOM.render(
  <TodoBox url="/api/todos"  pollInterval={2000}/>,
  document.getElementById('todo-list')
);