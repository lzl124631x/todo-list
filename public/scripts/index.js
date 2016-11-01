import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/app'
import todoApp from './reducers'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import createLogger from 'redux-logger';

const logger = createLogger();
const store = createStore(
  todoApp,
  applyMiddleware(thunk, promise, logger)
)

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