import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import $ from 'jquery'

// var Todo = React.createClass({
//   touchMoveWidth: 50,

//   getInitialState: function() {
//     return {
//       todo: this.props.data,
//       style: undefined,
//       point: undefined,
//       animating: false,
//       lastDone: this.props.data.done,
//       deltaX: 0,
//       deltaY: 0,
//       movedDelta: 0,
//       operation: null,
//       disableTouch: false
//     };
//   },

//   render: function() {
//     var classes = classNames('todo', { 'done': this.state.todo.done }, { 'animating': this.state.animating }, { 'long-press': this.state.longPressed });
//     var style = {
//       transform: 'translate(' + this.state.deltaX + 'px, ' + this.state.deltaY + 'px)',
//       backgroundColor: this.props.backgroundColor
//     };
//     var placeholder;
//     if (this.state.longPressed) {
//       style.transform += ' scale(1.1)';
//       style.boxShadow = '0 0.15em 0.5em rgba(0, 0, 0, 0.3)';
//       style.zIndex = '1';
//       style.position = 'absolute';
//       style.top = this.offset.top;
//       style.left = this.offset.left;
//       placeholder = (<div className="todo">&nbsp;</div>);
//     }
//     return (
//       <div className="slot" ref={(r) => this._slot = r }>
//         <div className={classes} onTouchStart={this.onTouch} onTouchMove={this.onTouch} onTouchEnd={this.onTouch} style={style} onTransitionEnd={this.onTransitionEnd}>
//           {this.state.todo.text}
//         </div>
//         {placeholder}
//       </div>
//     );
//   },

//   timestampToDateString: function(timestamp) {
//     return new Date(+timestamp).toLocaleDateString();
//   },

//   onDelete: function() {
//     var self = this;
//     this.setState({ disableTouch: true });
//     $(this._slot).css({ transform: 'translateX(-100%)', transition: 'transform .5s' })
//     .one('transitionend',
//       function() {
//         $(this).slideUp(
//           200, 
//           function() {
//             self.props.onTodoDelete(self.state.todo.id);
//             self.setState({ disableTouch: false });
//           });
//       });
//   },

//   toggleDone: function() {
//     var todo = this.state.todo;
//     todo.done = !todo.done;
//     this.updateTodo(todo);
//   },

//   updateTodo: function(todo) {
//     this.setState({ todo: todo }, function() {
//       this.props.onTodoChange(this.state.todo);
//     });
//   },

//   onTouch: function(e) {
//     // block touch event during operations (toggle/delete)
//     if (this.state.disableTouch) return;
//     switch(e.type) {
//       case 'touchstart': this.onTouchStart(e); break;
//       case 'touchmove': this.onTouchMove(e); break;
//       case 'touchend': this.onTouchEnd(e); break;
//     }
//   },

//   onTouchStart: function(e) {
//     // Only responds to one finger touch.
//     if (e.touches.length != 1) return;
//     var touch = e.touches[0];
//     this.setState({ point: { x: touch.clientX, y: touch.clientY } });
//     var longPressTimer = setTimeout(function() {
//       this.setState({ longPressed: true });
//     }.bind(this), 800);
//     this.setState({ longPressTimer: longPressTimer });
//     this.offset = $(this._slot).offset();
//   },

//   clearLongPressTimer: function() {
//     if (this.state.longPressTimer) {
//       clearTimeout(this.state.longPressTimer);
//       this.setState({ longPressTimer: undefined });
//     }
//   },

//   onTouchMove: function(e) {
//     this.clearLongPressTimer();
//     // only respond to one finder touch.
//     if (e.touches.length != 1) return;
//     var t = e.touches[0], touch = {};
//     touch.point = { x: t.clientX, y: t.clientY },
//     touch.delta = { x: touch.point.x - this.state.point.x, y: touch.point.y - this.state.point.y };
//     if (this.state.longPressed) {
//       this.handleLondPress(e);
//     } else if (Math.abs(touch.delta.x) > Math.abs(touch.delta.y)) {
//       this.handleHorizontalMove(e);
//     } else {
//       this.setState({ operation: 'VerticalDrag' });
//       this.props.handleVerticalMove(e, touch);
//     }
//   },

//   onTouchEnd: function(e) {
//     this.clearLongPressTimer();
//     if (this.state.operation == 'VerticalDrag') {
//       this.props.handleVerticalMove(e);
//       return;
//     }
//     if (this.state.deltaX != 0 || this.state.deltaY != 0) { // Only animates with nonzero delta
//       this.setState({ animating: true });
//     }
//     this.setState({ point: undefined, deltaX: 0, deltaY: 0 });
//     this.setState({ longPressed: false, movedDelta: 0 });
//   },

//   handleLondPress: function(e) {
//     var touch = e.touches[0];
//     var to = { x: touch.clientX, y: touch.clientY };
//     var deltaY = touch.clientY - this.state.point.y;
//     // long press and drag vertically to reorder item.
//     this.setState({ deltaY: deltaY });
//     var height = $(this._slot).outerHeight();
//     var threshold = this.state.movedDelta * height;
//     if (deltaY > threshold + height / 2) {
//       if (this.props.moveTodo(this.props.data.id, 1)) {
//         this.setState({ movedDelta: this.state.movedDelta + 1 });
//       }
//     } else if (deltaY < threshold - height / 2) {
//       if (this.props.moveTodo(this.props.data.id, -1)) {
//         this.setState({ movedDelta: this.state.movedDelta - 1 });
//       }
//     }
//   },

//   handleHorizontalMove: function(e) {
//     var touch = e.touches[0];
//     var to = touch.clientX;
//     var from = this.state.point.x,
//     deltaX = Math.abs(to - from),
//     sign = to > from ? 1 : -1;
//     // drag horizontally to toggle / delete item.
//     if (deltaX > this.touchMoveWidth) {
//       if (sign == 1 && this.state.lastDone == this.state.todo.done) {
//         // Check / uncheck item
//         this.toggleDone();
//       } else if (sign == -1) {
//         // Delete item
//         this.onDelete();
//       }
//       deltaX = (deltaX - this.touchMoveWidth) / 5 + this.touchMoveWidth;
//     }
//     this.setState({ deltaX: sign * deltaX });
//   },

//   onTransitionEnd: function() {
//     this.setState({ animating: false, lastDone: this.state.todo.done });
//   }
// });

const hPanThreshold = 50

const initialState = { x: 0, dir: null, op: null }

class Todo extends React.Component {
  constructor(props) {
    super(props)
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)
    this.state = initialState
  }

  render() {
    let classes = classNames('todo', { 'done': this.props.done })
    return (
      <div
        className={classes}
        style={{
          background: `hsl(${354.1 + 3 * this.props.index},100%,48%)`,
          transform: `translate(${this.state.x}px,0)`
        }}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
      >
        {this.props.text}
      </div>
    )
  }

  handleTouchStart (e) {
    let t = e.touches[0]
    this.start = {
      x: t.clientX,
      y: t.clientY
    }
  }

  handleTouchMove (e) {
    let t = e.touches[0]
    let touch = {
      x: t.clientX,
      y: t.clientY
    }
    touch.deltaX = touch.x - this.start.x
    touch.deltaY = touch.y - this.start.y
    if (!this.state.dir) {
      this.setState({ dir: Math.abs(touch.deltaX) > Math.abs(touch.deltaY) ? 'h' : 'v' })
    }
    if (this.state.dir == 'h') {
      this.hPan(touch)
    }
  }

  hPan(touch) {
    let x = touch.deltaX
    if (Math.abs(x) > hPanThreshold && !this.state.op) {
      if (x > 0) {
        this.setState({ op: 'toggle' })
        this.props.onToggle()
      } else {
        this.setState({ op: 'delete' })
        this.props.onDelete()
      }
    }
    if (Math.abs(x) > hPanThreshold) {
      x = (x > 0 ? 1 : -1) * ((Math.abs(x) - hPanThreshold) / 5 + hPanThreshold)
    }
    this.setState({ x: x })
  }

  handleTouchEnd (e) {
    this.setState(initialState)
  }
}

Todo.propTypes = {
  onToggle: PropTypes.func.isRequired,
  done: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
}

export default Todo;