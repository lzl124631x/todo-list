import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import $ from 'jquery'
import Todo from './todo'
import AddTodo from '../containers/add-todo'
import { Motion, spring } from 'react-motion'
import { clamp, ITEM_HEIGHT } from '../containers/util'
import Hammer from 'react-hammerjs'

import {
  DEFAULT,
  PULL_DOWN_LIST,
  RELEASED_TO_ADD,
  CANCEL_ADD,
  ITEM_JUST_ADDED,
  PULL_RIGHT_ITEM,
  PULL_LEFT_ITEM,
  ITEM_TOGGLED,
  LONG_PRESS_REORDER,
  RELEASED_TOGGLE_ITEM,
  RELEASED_DELETE_ITEM
} from './ui-states'

const RELEASED_TO_DEFAULT = 'RELEASED_TO_DEFAULT'
const EDITING_ITEM = 'EDITING_ITEM'
const EDITING_LIST = 'EDITING_LIST'

const H_PAN_THRESHOLD = 50

function log(e) {
  console.log(e.type, e)
}

const INITIAL_STATE = {
  // The mouse move delta
  delta: [0, 0],
  uiState: DEFAULT,
  editingItems: {}
}

class TodoList extends React.Component {
  constructor(props) {
    super(props)
    this.cancelAdd = this.cancelAdd.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.handlePan = this.handlePan.bind(this)
    this.handlePanEnd = this.handlePanEnd.bind(this)
    this.handleItemStateChange = this.handleItemStateChange.bind(this)
    this.state = INITIAL_STATE
  }

  componentWillUpdate (nextProps, nextState) {
     const { uiState } = this.state
    if (nextState.uiState != uiState) {
      console.log(`%cLIST state change from ${uiState} to ${nextState.uiState}`, "color:blue")
    }
  }

  cancelAdd (e) {
    this.setState(Object.assign({}, INITIAL_STATE, { uiState: CANCEL_ADD }))
  }

  handleAdd (e) {
    this.setState({ uiState: ITEM_JUST_ADDED })
  }

  getBackdropOpacity () {
    switch (this.state.uiState) {
      case RELEASED_TO_ADD: return spring(.8)
      default: return spring(0)
    }
  }

  handlePan ({ deltaX, deltaY }) {
    switch (this.state.uiState) {
      case DEFAULT:
      case CANCEL_ADD: {
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          this.setState({
            uiState: PULL_DOWN_LIST,
            delta: [deltaX, deltaY]
          })
        }
        break
      }
      case PULL_DOWN_LIST: {
        this.setState({
          delta: [deltaX, deltaY]
        })
        break
      }
      case EDITING_ITEM: {
        // TODO: stop the current recognizer
        break
      }
    }
  }
  
  handlePanEnd () {
    const { uiState, delta } = this.state
    switch (uiState) {
      case PULL_DOWN_LIST: {
        let nextUiState
        if (delta[1] > ITEM_HEIGHT) {
          nextUiState = RELEASED_TO_ADD
        } else if (delta[1] > 0) {
          nextUiState = RELEASED_TO_DEFAULT
        } else {
          nextUiState = DEFAULT
        }
        this.setState({
          uiState: nextUiState,
          delta: [0, 0]
        })
        break
      }
    }
  }

  getListY() {
    switch (this.state.uiState) {
      case RELEASED_TO_ADD: return spring(ITEM_HEIGHT)
      case RELEASED_TO_DEFAULT:
      case CANCEL_ADD: return spring(0)
      case PULL_DOWN_LIST: {
        // Can only pull down, cannot pull up
        let y = Math.max(this.state.delta[1], 0)
        // Once pull-down distance exceeds 5 x ITEM_HEIGHT, slow down
        if (y > 5 * ITEM_HEIGHT) {
          y = (y - 5 * ITEM_HEIGHT) / 5 + 5 * ITEM_HEIGHT
        }
        return y
      }
      default: return 0
    }
  }

  getMotionStyle () {
    return {
      y: this.getListY(),
      backdropOpacity: this.getBackdropOpacity()
    }
  }

  getMotionOnRest () {
    switch (this.state.uiState) {
      case CANCEL_ADD: 
      case ITEM_JUST_ADDED:
      case RELEASED_TO_DEFAULT: {
        return () => {
          this.setState({
            uiState: DEFAULT
          })
        }
      }
    }
  }

  handleItemStateChange (id, itemUiState) {
    switch (itemUiState) {
      case EDITING_LIST: {
        break
      }
      case DEFAULT: {
        let { editingItems } = this.state
        delete editingItems[id]
        let nextUiState = Object.getOwnPropertyNames(editingItems).length > 0 ? EDITING_ITEM : DEFAULT
        this.setState({
          uiState: nextUiState,
          editingItems
        })
        break
      }
      default: {
        let { editingItems } = this.state
        editingItems[id] = true
        this.setState({
          uiState: EDITING_ITEM,
          editingItems
        })
        break
      }
    }
  }

  render() {
    let { uiState, todoId } = this.state
    const motionStyle = this.getMotionStyle()
    const motionOnRest = this.getMotionOnRest()
    return (
      <Motion style={ motionStyle } onRest={ motionOnRest }>
        { ({ y, backdropOpacity }) =>
          <div style={{
            height: '100%',
            transform: `translateY(${y}px)`
          }}>
            { uiState === RELEASED_TO_ADD || uiState === PULL_DOWN_LIST || uiState === CANCEL_ADD || uiState === RELEASED_TO_DEFAULT ? <AddTodo y={y}
            uiState={uiState}
            afterAdded={this.handleAdd} /> : undefined }
              <Hammer
              onPan={ this.handlePan }
              onPanEnd={ this.handlePanEnd }
              options={{
                recognizers: {
                  pan: {
                    threshold: 0
                  }
                }
              }}>
                <div className="todo-list">
                  {
                    this.props.todos.map((todo, i) => {
                      return <Todo
                        key={ todo.id }
                        {...todo}
                        y={ y }
                        uiState={ uiState }
                        todoId={ todoId }
                        onToggle={ this.props.onToggle }
                        onDelete={ this.props.onDelete }
                        onReorder={ this.props.onReorder }
                        onItemStateChange={ this.handleItemStateChange }
                      />})
                  }
                  <div className="backdrop" style={{
                    display: backdropOpacity === 0 ? "none" : "block",
                    background: `rgba(0,0,0,${backdropOpacity})`
                  }}
                  onTouchStart={this.cancelAdd}></div>
                </div>
              </Hammer>
          </div>
        }
      </Motion>
    )
  }
}

TodoList.propTypes = {
  todos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    done: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired,
    order: PropTypes.number.isRequired
  }).isRequired).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

TodoList.contextTypes = {
  store: PropTypes.object.isRequired
}

export default TodoList