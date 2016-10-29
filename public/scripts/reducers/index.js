import { combineReducers } from 'redux'
import todos from './todos'
import appState from './app-state'

console.log(todos, appState)
const todoApp = combineReducers({
  todos,
  appState
})

export default todoApp