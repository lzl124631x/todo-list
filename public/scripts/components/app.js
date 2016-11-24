import React from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import $ from 'jquery'
import TodoList from '../containers/todo-list'
import AddTodo from '../containers/add-todo'

// var App = React.createClass({
//   getInitialState: function() {
//     return {data: []};
//   },
//   loadTodosFromServer: function() {
//     $.get({
//       url: this.props.url,
//       dataType: 'json',
//       cache: false,
//       success: function(data) {
//         this.setState({data: data});
//       }.bind(this),
//       error: function(xhr, status, err) {
//         console.error(this.props.url, status, err.toString());
//       }.bind(this)
//     });
//   },
//   handleTodoSubmit: function(todo, insertAt) {
//     var todos = this.state.data,
//     newTodos = todos.slice(0);
//     newTodos.splice(insertAt, 0, todo);
//     this.setState({data: newTodos});
//     $.post({
//       url: this.props.url + '/add',
//       contentType: 'application/json',
//       data: JSON.stringify({ insertAt: insertAt, todo: todo }),
//       dataType: 'json',
//       success: function(data) {
//         this.setState({data: data});
//       }.bind(this),
//       error: function(xhr, status, err) {
//         this.setState({data: todos});
//         console.error(this.props.url, status, err.toString());
//       }.bind(this)
//     });
//   },
//   handleTodoDelete: function(id) {
//     $.post({
//       url: '/api/todos/delete',
//       contentType: 'application/json',
//       data: JSON.stringify({ id: id }),
//       dataType: 'json',
//       success: function(data) {
//         this.setState({data: data});
//       }.bind(this),
//       error: function(xhr, status, err) {
//         console.error('/api/todos/delete', status, err.toString());
//       }.bind(this)
//     });
//   },
//   handleTodoChange: function(todo) {
//     var todos = this.state.data;
//     for (var i = 0; i < todos.length; ++i) {
//       if (todos[i].id == todo.id) {
//         todos[i] = todo;
//         break;
//       }
//     }
//     this.setState({ data: todos });
//     $.post({
//       url: this.props.url + '/update',
//       contentType: 'application/json',
//       data: JSON.stringify(todo),
//       dataType: 'json',
//       success: function(data) {
//         this.setState({data: data});
//       }.bind(this),
//       error: function(xhr, status, err) {
//         this.setState({data: todos});
//         console.error(this.props.url, status, err.toString());
//       }.bind(this)
//     });
//   },
//   componentDidMount: function() {
//     this.loadTodosFromServer();
//     // setInterval(this.loadTodosFromServer, this.props.pollInterval);
//   },
//   render: function() {
//     return (
//       <div className="todoBox">
//         <TodoList data={this.state.data} onTodoDelete={this.handleTodoDelete} onTodoChange={this.handleTodoChange} moveTodo={this.moveTodo} onTodoSubmit={this.handleTodoSubmit}/>
//       </div>
//     );
//   },

//   moveTodo: function(id, d) {
//     var todos = this.state.data;
//     for (var i = 0; i < todos.length; ++i) {
//       if (todos[i].id == id) {
//         var j = i + d;
//         if (j < 0 || j >= todos.length) {
//           return false;
//         } else {
//           var tmp = todos[i];
//           todos[i] = todos[j];
//           todos[j] = tmp;
//           this.setState({ data: todos });
//         }
//         $.post({
//           url: this.props.url + '/move',
//           contentType: 'application/json',
//           data: JSON.stringify({ id: id, d: d }),
//           dataType: 'json',
//           success: function(data) {
//             this.setState({data: data});
//           }.bind(this),
//           error: function(xhr, status, err) {
//             this.setState({data: todos});
//             console.error(this.props.url, status, err.toString());
//           }.bind(this)
//         });
//         return true;
//       }
//     }
//     return false;
//   }
// });

const App = () => (
  <TodoList />
)

export default App