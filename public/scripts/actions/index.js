import {
  ADD_TODO,
  TOGGLE_TODO,
  DELETE_TODO,
  REORDER_TODO,
  DRAG_TO_ADD,
  PULL_DOWN_LIST
} from './action-types'

export const addTodo = (text, order) => {
  return {
    type: ADD_TODO,
    text,
    order
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