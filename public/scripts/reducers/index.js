import { combineReducers } from 'redux'
import todos from './todos'
import appState from './app-state'

const todoApp = combineReducers({
  todos,
  appState
})

export default todoApp