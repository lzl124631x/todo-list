import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/app'
import todoApp from './reducers'
import { createStore } from 'redux'

let store = createStore(todoApp)

render(
  <Provider store={store}>
    <App url="/api/todos"  pollInterval={2000}/>
  </Provider>,
  document.getElementById("todo-app")
)