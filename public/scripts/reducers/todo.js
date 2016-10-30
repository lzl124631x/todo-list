import { combineReducers } from 'redux'
import { ADD_TODO, TOGGLE_TODO } from '../actions/action-types'
import { guid } from '../containers/util'

const todo = (state = {}, action, todos) => {
  switch(action.type) {
    case ADD_TODO:
      return {
        id: guid(),
        text: action.text,
        done: false,
        order: action.order
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

export default todo