import { ADD_TODO, DRAG_TO_ADD, PULL_DOWN_LIST } from '../actions/action-types'

const APP_STATE_DEFAULT = 0
const APP_STATE_DRAG_TO_ADD = 1
const APP_STATE_PULL_DOWN_LIST = 2

const appState = (state = APP_STATE_DEFAULT, action) => {
  switch (action.type) {
    case DRAG_TO_ADD: {
      return APP_STATE_DRAG_TO_ADD
    }
    case PULL_DOWN_LIST: {
      return APP_STATE_PULL_DOWN_LIST
    }
    default:
      return APP_STATE_DEFAULT
  }
}

export default appState