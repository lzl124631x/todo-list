import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import $ from 'jquery'
import {Motion, spring} from 'react-motion'
import LongPress from '../containers/long-press'

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

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

const H_PAN_THRESHOLD = 50
const ITEM_HEIGHT = 53

const initialState = {
  press: [0, 0], // the mouse-done point's offset
  mouse: [0, 0], // the mouse's offset
  delta: [0, 0], // the mouse's offset delta from mouse-move point to mouse-down point 
  pressPos: 0, // on item pressed, innerPos is the position of mouse relative to the top of item
  isPressed: false,
  isLongPressed: false,
  isLongPressReleasing: false,
  dir: null,
  op: null
}

class Todo extends React.Component {
  constructor(props) {
    super(props)
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleLongPress = this.handleLongPress.bind(this)
    this.state = initialState
  }

  getMotionConfig () {
    const initialY = this.props.order * ITEM_HEIGHT
    const { press, mouse, delta, pressPos, isPressed, isLongPressed, isLongPressReleasing } = this.state
    const springConfig = { stiffness: 1000, damping: 40 }
    let style = {
      x: spring(0, springConfig),
      y: spring(initialY),
      scale: spring(1)
    }, onRest, [x, y] = delta
    if (isLongPressed) {
      style.y = spring(mouse[1] - pressPos, springConfig)
      style.scale = spring(1.05)
    } else if (isLongPressReleasing) {
      onRest = () => {
        this.setState({ isLongPressReleasing: false })
      }
    } else if (isPressed) {
      if (Math.abs(x) > H_PAN_THRESHOLD) {
        x = (x > 0 ? 1 : -1) * ((Math.abs(x) - H_PAN_THRESHOLD) / 5 + H_PAN_THRESHOLD)
      }
      style.x = x
    } else {
      onRest = () => {
        this.setState({ op: null })
      }
    }
    return { style, onRest }
  }

  render() {
    let { isLongPressed, isLongPressReleasing } = this.state
    let classes = classNames('todo', { 'done': this.props.done })
    let { style, onRest } = this.getMotionConfig()
    return (
        <Motion defaultStyle={{ x: 0, y: 0, scale: 1 }} style={ style } onRest={ onRest }>
          {({ x, y, scale }) => 
            <LongPress onLongPress={this.handleLongPress} delay={ 500 }>
              <div
                className={classes}
                style={{
                  background: `hsl(${354.1 + 3 * this.props.order},100%,48%)`,
                  WebkitTransform: `translate(${x}px,${y}px) scale(${scale})`,
                  transform: `translate(${x}px,${y}px) scale(${scale})`,
                  boxShadow: isLongPressed ? '0 .2em .3em .2em rgba(0, 0, 0, 0.2)' : '',
                  zIndex: isLongPressed || isLongPressReleasing ? 1 : 0
                }}
                onTouchStart={this.handleTouchStart.bind(null, y)}
                onMouseDown={this.handleMouseDown.bind(null, y)}
                onTouchMove={this.handleTouchMove}
                onMouseMove={this.handleMouseMove}
                onTouchEnd={this.handleTouchEnd}
                onMouseUp={this.handleMouseUp}
              >
                {this.props.text + '-' + this.props.order}
              </div>
            </LongPress>
          }
        </Motion>
    )
  }

  handleTouchStart (itemY, { touches }) {
    //console.log('touchstart');
    this.handleMouseDown(itemY, touches[0])
  }

  handleMouseDown (itemY, { pageX, pageY }) {
    //console.log('mousedown');
    this.setState({
      isPressed: true,
      press: [pageX, pageY],
      mouse: [pageX, pageY],
      delta: [0, 0],
      pressPos: pageY - itemY
    })
  }

  handleTouchMove (e) {
    //console.log('touchmove')
    e.preventDefault()
    this.handleMouseMove(e.touches[0])
  }

  handleMouseMove ({ pageX, pageY }) {
    //console.log('mousemove');
    let [x, y] = this.state.press
    this.setState({
      mouse: [pageX, pageY],
      delta: [pageX - x, pageY - y]
    })
    if (this.state.isLongPressed) {
      const itemY = pageY - this.state.pressPos
      const row = clamp(Math.round(itemY / ITEM_HEIGHT), 0, this.props.itemCount - 1)
      this.props.onReorder(row)
    } else if (this.state.delta[0] > this.state.delta[1]) {
      this.hPan()
    }
  }

  handleTouchEnd (e) {
    //console.log('touchend')
    e.preventDefault()
    this.handleMouseUp()
  }

  handleMouseUp () {
    //console.log('mouseup')
    this.setState({ isPressed: false, mouse: [0, 0], press: [0, 0], delta: [0, 0] })
    if (this.state.isLongPressed) {
      this.setState({ isLongPressed: false, isLongPressReleasing: true })
    }
  }

  handleLongPress () {
    //console.log('longpress')
    this.setState({ isLongPressed: true })
  }

  hPan() {
    let x = this.state.delta[0]
    if (Math.abs(x) > H_PAN_THRESHOLD && !this.state.op) {
      if (x > 0) {
        this.setState({ op: 'toggle' })
        this.props.onToggle()
      } else {
        this.setState({ op: 'delete' })
        this.props.onDelete()
      }
    }
  }
}

Todo.propTypes = {
  onToggle: PropTypes.func.isRequired,
  done: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
}

export default Todo;