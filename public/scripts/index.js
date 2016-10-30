import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/app'
import todoApp from './reducers'
import { createStore } from 'redux'

let store = createStore(todoApp)

// Create fake data
import { addTodo } from './actions'
import range from 'lodash.range'
range(10).forEach(i => {
  store.dispatch(addTodo('' + i, i))
})

render(
  <Provider store={store}>
    <App url="/api/todos"  pollInterval={2000}/>
  </Provider>,
  document.getElementById("todo-app")
)