import { ADD_TODO, TOGGLE_TODO, DELETE_TODO, REORDER_TODO } from '../actions/action-types'

const todo = (state = {}, action, todos) => {
  switch(action.type) {
    case ADD_TODO:
      return {
        id: Date.now(),
        text: action.text,
        done: false,
        order: todos.length
      }
    case TOGGLE_TODO:
      if (state.id !== action.id) {
        return state
      }
      return Object.assign({}, state, {
        done: !state.done
      })
    default:
    return state
  }
}

function reinsert(arr, from, to) {
  const _arr = arr.slice(0);
  const val = _arr[from];
  _arr.splice(from, 1);
  _arr.splice(to, 0, val);
  return _arr;
}

const todos = (state = [], action) => {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        todo(undefined, action, state)
      ]
    case TOGGLE_TODO: {
      return state.map(t =>
        todo(t, action)
      )
    }
    case DELETE_TODO: {
      let target = state.find(t => t.id == action.id)
      let newState = state.filter(t => t.id != action.id)
      // TODO: modified todo state. should move to todo reducer.
      newState.each(t => {
        if (t.order > target.order) {
          t.order--
        }
      })
      return newState
    }
    case REORDER_TODO: {
      console.log('re', action)
      const { id, to } = action
      let target = state.find(t => t.id == action.id)
      let from = target.order 
      console.log('rr', from, to)
      if (from < to) {
        let newState = state.map(t => Object.assign({}, t))
        newState.forEach(t => {
          if (t.order > from && t.order <= to) {
            t.order--
          }
        })
        let newTarget = newState.find(t => t.id == action.id)
        newTarget.order = to
        console.log('newstate', newState)
        return newState
      }
      return state
    }
    default:
      return state
  }
}

export default todos
