import { ADD_TODO, TOGGLE_TODO, DELETE_TODO, REORDER_TODO, DRAG_TO_ADD } from '../actions/action-types'
import todo from './todo'

function reinsert(arr, from, to) {
  const _arr = arr.slice(0)
  const val = _arr[from]
  _arr.splice(from, 1)
  _arr.splice(to, 0, val)
  return _arr
}

const todos = (state = [], action) => {
  switch (action.type) {
    case ADD_TODO: {
      let newState = state.slice(0)
      newState.forEach(t => {
        if (t.order >= action.order) {
          t.order++
        }
      })
      newState.push(todo(null, action))
      return newState
    }
    case TOGGLE_TODO: {
      return state.map(t =>
        todo(t, action)
      )
    }
    case DELETE_TODO: {
      let target = state.find(t => t.id == action.id)
      let newState = state.filter(t => t.id != action.id)
      // TODO: modified todo state. should move to todo reducer.
      newState.forEach(t => {
        if (t.order > target.order) {
          t.order--
        }
      })
      return newState
    }
    case REORDER_TODO: {
      const { id, to } = action
      let target = state.find(t => t.id == action.id)
      let from = target.order 
      // console.log('reorder', from, to)
      if (from == to) return state
      let newState = state.map(t => Object.assign({}, t))
      newState.forEach(
        from < to ? 
        t => {
          if (t.order > from && t.order <= to) {
            t.order--
          }
        }
        :
        t => {
          if (t.order >= to && t.order < from) {
            t.order++
          }
        }
      )
      let newTarget = newState.find(t => t.id == action.id)
      newTarget.order = to
      return newState
    }
    default:
      return state
  }
}

export default todos