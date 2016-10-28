import { ADD_TODO, TOGGLE_TODO, DELETE_TODO, REORDER_TODO } from './action-types'

export const addTodo = (text) => {
  return {
    type: ADD_TODO,
    text
  }
}

export const toggleTodo = (id) => {
  return {
    type: TOGGLE_TODO,
    id
  }
}

export const deleteTodo = (id) => {
  return {
    type: DELETE_TODO,
    id
  }
}

export const reorderTodo = (id, to) => {
  return {
    type: REORDER_TODO,
    id,
    to
  }
}