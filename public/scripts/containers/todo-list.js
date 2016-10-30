import { connect } from 'react-redux'
import { toggleTodo, deleteTodo, reorderTodo } from '../actions'
import _TodoList from '../components/todo-list'

const mapStateToProps = (state) => state

const mapDispatchToProps = (dispatch) => {
  return {
    onToggle: (id) => {
      dispatch(toggleTodo(id))
    },
    onDelete: (id) => {
      dispatch(deleteTodo(id))
    },
    onReorder: (id, insertPos) => {
      dispatch(reorderTodo(id, insertPos))
    }
  }
}

const TodoList = connect(
  mapStateToProps,
  mapDispatchToProps
)(_TodoList)

export default TodoList