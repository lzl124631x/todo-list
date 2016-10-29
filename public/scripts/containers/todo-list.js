import { connect } from 'react-redux'
import { toggleTodo, deleteTodo, reorderTodo, dragToAdd, pullDownList } from '../actions'
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
    },
    onDragToAdd: () => {
      dispatch(dragToAdd())
    },
    onPullDownList: () => {
      dispatch(pullDownList())
    }
  }
}

const TodoList = connect(
  mapStateToProps,
  mapDispatchToProps
)(_TodoList)

export default TodoList