import { ADD_TODO, TOGGLE_TODO, DELETE_TODO, REORDER_TODO, DRAG_TO_ADD } from '../actions/action-types'
import todo from './todo'
import partition from 'lodash/partition'
import flatten from 'lodash/flatten'
import { clamp } from '../containers/util'

function reorder(todos, todo, to) {
  const _todos = todos.slice(0)
  const from = todo.order
  if (from === to) return _todos
  _todos.forEach(
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
  let newTodo = _todos.find(t => t.id == todo.id)
  newTodo.order = to
  return _todos
}

function findFirstDone (todos) {
  let firstDone, order = Number.MAX_VALUE
  todos.forEach(t => {
    if (t.done && t.order < order) {
      firstDone = t
      order = t.order
    }
  })
  return firstDone
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
      const { id } = action
      let target = state.find(t => t.id === action.id)
      let from = target.order
      let firstDone = findFirstDone(state)
      let to
      if (target.done) {// toggling from done to undone
        to = firstDone.order
      } else {// toggling from undone to done
        to = (firstDone ? firstDone.order : state.length) - 1
      }
      console.log('toggle', from, to)
      return reorder(state.map(t => todo(t, action)), target, to)
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
      let { id, to } = action
      to = clamp(to, 0, state.length - 1)
      let target = state.find(t => t.id === action.id)
      if (target.done) return state
      let firstDone = findFirstDone(state)
      if (firstDone) {
        to = clamp(to, 0, firstDone.order - 1)
      }
      return reorder(state, target, to)
    }
    default:
      return state
  }
}

export default todos