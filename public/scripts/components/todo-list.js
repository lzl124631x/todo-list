import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import $ from 'jquery'
import Todo from './todo'
import AddTodo from '../containers/add-todo'
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

const TodoList = ({ todos, onToggle, onDelete }) => (
  <div className="todo-list">
    <div className="todo new-item-row">
      <AddTodo />
    </div>
    {todos.map((todo, i) =>
      <Todo
        key={todo.id}
        {...todo}
        index={i}
        onToggle={() => onToggle(todo.id)}
        onDelete={() => onDelete(todo.id)}
      />
    )}
  </div>
)

TodoList.propTypes = {
  todos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    done: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired
  }).isRequired).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

export default TodoList