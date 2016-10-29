import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import $ from 'jquery'
import Todo from './todo'
import AddTodo from '../containers/add-todo'
import { Motion, spring } from 'react-motion'
import { ITEM_HEIGHT } from '../containers/util'

// import Todo from './todo'
// import TodoInput from './todo-input'

// var TodoList = React.createClass({
//   itemHeight: 53,

//   getInitialState: function() {
//     return {
//       style: {},
//       newItemStyle: {
//         transform: 'perspective(300px) rotateX(90deg)',
//         transformOrigin: 'bottom',
//         backgroundColor: 'hsl(354.1,100%,48%)',
//         // opacity: 0
//       },
//       backdropStyle: { },
//       newItemTextOpacity: 1,
//       state: null
//     }
//   },

//   render: function() {
//     var self = this;
//     var done = [], notDone = [];
//     var todos = this.props.data;
//     for (var i = 0; i < todos.length; ++i) {
//       if (todos[i].done) {
//         done.push(todos[i]);
//       } else {
//         notDone.push(todos[i]);
//       }
//     }
//     todos = notDone.concat(done);
//     var hue = 354.1;
//     var todoNodes = todos.map(function(todo) {
//       var backgroundColor = 'hsl(' + hue + ',100%, 48%)';
//       hue += 3;
//       return (
//         <Todo key={todo.id} data={todo} backgroundColor={backgroundColor} onTodoDelete={self.props.onTodoDelete} onTodoChange={self.props.onTodoChange} moveTodo={self.props.moveTodo} handleVerticalMove={self.handleVerticalMove}/>
//       );
//     });
//             //     <span style={{ opacity: this.state.newItemTextOpacity }}>Pull to Create Item</span>
//             // <span style={{ opacity: 1 - this.state.newItemTextOpacity }}>Release to Create Item</span>
//     return (
//       <div className="todo-list" style={this.state.style} ref={ (r) => this._list = r } onTransitionEnd={ this.onTransitionEnd }>
//         <div className="slot">
//           <div className="backdrop" style={this.state.backdropStyle} onClick={this.cancelCreate}></div>
//           <div className="todo new-item-row" style={ this.state.newItemStyle }>
//             <div className="new-item-text">
//             <TodoInput onTodoSubmit={this.props.onTodoSubmit}/>
//             </div>
//           </div>
//         </div>
//         {todoNodes}
//       </div>
//     );
//   },

//   handleVerticalMove: function(e, t) {
//     var style = { };
//     if (e.type == 'touchend') {
//       if (this.state.state == 'pullToCreateItem') {
//         this.setState({ state: null });
//         style.transition = 'transform .3s'; // list goes back to original position
//         this.setState({
//           newItemStyle: {
//             transform: 'perspective(300px) rotateX(90deg)',
//             transformOrigin: 'bottom',
//             backgroundColor: 'hsl(354.1,100%,48%)',
//             opacity: 0,
//             transition: 'transform .3s, opacity .3s',
//           }
//         });
//       } else {// releaseToCreateItem
//         this.setState({ state: null });
//         style.transform = 'translateY(' + this.itemHeight + 'px)';
//         style.transition = 'transform .3s'; // list goes back to original position
//         this.setState({
//           newItemStyle: {
//             transform: 'perspective(300px) rotateX(0)',
//             transformOrigin: 'bottom',
//             backgroundColor: 'hsl(354.1,100%,48%)',
//             opacity: 1
//           },
//           backdropStyle: {
//             display: 'block'
//           }
//         })
//       }
//     } else {
//       if(t.delta.y < this.itemHeight) {
//         this.setState({ state: 'pullToCreateItem' });
//       } else {
//         this.setState({ state: 'releaseToCreateItem' });
//       }
//       style.transform = 'translateY(' + t.delta.y + 'px)';

//       var deg = 0;
//       if (t.delta.y <= this.itemHeight) {
//         deg = (this.itemHeight - t.delta.y) / this.itemHeight * 90;
//       }
//       var newItemTextOpacity = t.delta.y > this.itemHeight ? 0 : 1;
//       this.setState({
//         newItemStyle: {
//           transform: 'perspective(300px) rotateX(' + deg + 'deg)',
//           transformOrigin: 'bottom',
//           backgroundColor: 'hsl(354.1,100%,48%)',
//           opacity: (90 - deg) / 90
//         },
//         newItemTextOpacity: newItemTextOpacity
//       })
//     }
//     this.setState({ style: style });
//   },

//   onTransitionEnd: function() {
//   },

//   cancelCreate: function() {
//     this.setState(this.getInitialState());
//   }
// });

const INITIAL_STATE = {
  press: [0, 0],
  delta: [0, 0],
  isPressed: false
}
const APP_STATE_DRAG_TO_ADD = 1
const APP_STATE_PULL_DOWN_LIST = 2

class TodoList extends React.Component {
  constructor(props) {
    super(props)
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.state = INITIAL_STATE
  }
  
  handleTouchStart ({ touches }) {
    this.handleMouseDown(touches[0])
  }

  handleMouseDown ({ pageX, pageY }) {
    this.setState({ press: [ pageX, pageY ], isPressed: true })
  }
  
  handleTouchMove (e) {
    e.preventDefault()
    this.handleMouseMove(e.touches[0])
  }

  handleMouseMove ({ pageX, pageY }) {
    console.log('list move')
    if (this.state.isPressed) {
      const [x, y] = this.state.press
      const delta = [ pageX - x, pageY - y ]
      this.setState({ delta: delta})
      if (delta[1] > 0) {
        this.props.onPullDownList()
      }
    }
  }
  
  handleTouchEnd (e) {
    e.preventDefault()
    this.handleMouseUp()
  }

  handleMouseUp () {
    const state = Object.assign({}, INITIAL_STATE)
    if (this.state.delta[1] > ITEM_HEIGHT) {
        this.props.onDragToAdd()
    }
    this.setState(state)
  }

  render() {
    const { todos, onToggle, onDelete, onReorder } = this.props
    const appState = this.context.store.getState().appState
    let y = this.state.delta[1]
    let style = { y: this.state.isPressed ? y : spring(0), backdropOpacity: spring(0) }
    if (appState === APP_STATE_DRAG_TO_ADD) {
      style.y = spring(ITEM_HEIGHT)
      style.backdropOpacity = spring(.8)
    } else if (appState === APP_STATE_PULL_DOWN_LIST) {

    }
    return (
      <Motion style={style}>
        { ({ y, backdropOpacity }) =>
          <div style={{height: '100%' }}>
            { appState === APP_STATE_PULL_DOWN_LIST || appState === APP_STATE_DRAG_TO_ADD ? <AddTodo y={y} /> : undefined }
            <div className="todo-list"
              onTouchStart={this.handleTouchStart}
              onMouseDown={this.handleMouseDown}
              onTouchMove={this.handleTouchMove}
              onMouseMove={this.handleMouseMove}
              onTouchEnd={this.handleTouchEnd}
              onMouseUp={this.handleMouseUp}
              style={{
                transform: `translateY(${y}px)`,

              }}>
              {
                todos.map((todo, i) =>
                  <Todo
                    key={todo.id}
                    {...todo}
                    onToggle={() => onToggle(todo.id)}
                    onDelete={() => onDelete(todo.id)}
                    onReorder={(to) => onReorder(todo.id, to)}
                    itemCount={todos.length}
                  />)
              }
              <div className="backdrop" style={{
                display: backdropOpacity === 0 ? "none" : "block",
                background: `rgba(0,0,0,${backdropOpacity})`
              }}></div>
            </div>
          </div>
        }
      </Motion>
    )
  }
}

TodoList.propTypes = {
  todos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    done: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired
  }).isRequired).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

TodoList.contextTypes = {
  store: PropTypes.object.isRequired
};

export default TodoList