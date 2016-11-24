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
  RELEASED_AND_ADD,
  CANCEL_ADD,
  ITEM_JUST_ADDED,
  PULL_RIGHT_ITEM,
  PULL_LEFT_ITEM,
  ITEM_TOGGLED,
  LONG_PRESS_REORDER,
  RELEASED_TOGGLE_ITEM,
  RELEASED_DELETE_ITEM
} from './ui-states'

const H_PAN_THRESHOLD = 50

function log(e) {
  console.log(e.type, e)
}

const INITIAL_STATE = {
  // The mouse down position relative to screen
  press: [0, 0],
  // The mouse move delta
  delta: [0, 0],
  // True if the list is pressed
  isPressed: false,
  // The mouse down position relative to the top of the item being pressed
  pressPos: 0,
  // The id of the item being edited
  todoId: null,
  // The initial Done/undone of the item being pressed
  pressedItemInitialState: null,
  uiState: DEFAULT
}

class TodoList extends React.Component {
  constructor(props) {
    super(props)
    this.cancelAdd = this.cancelAdd.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.onListRest = this.onListRest.bind(this)
    this.handlePan = this.handlePan.bind(this)
    this.handlePanEnd = this.handlePanEnd.bind(this)
    this.state = INITIAL_STATE
  }

  componentWillUpdate (nextProps, nextState) {
     const { uiState } = this.state
    if (nextState.uiState != uiState) {
      console.log('LIST state change from', uiState, 'to', nextState.uiState)
    }
  }

  cancelAdd (e) {
    this.setState(Object.assign({}, INITIAL_STATE, { uiState: CANCEL_ADD }))
  }

  handleAdd (e) {
    this.setState({ uiState: ITEM_JUST_ADDED })
  }

  onListRest () {
    if (this.state.uiState === CANCEL_ADD
      || this.state.uiState === ITEM_JUST_ADDED) {
      this.setState(INITIAL_STATE)
    }
  }

  handleLongPress() {
    this.setState({ uiState: LONG_PRESS_REORDER })
  }

  getBackdropOpacity () {
    switch (this.state.uiState) {
      case RELEASED_AND_ADD: return spring(.8)
      default: return spring(0)
    }
  }

  getItemProps (todo, y) {
    const { delta, todoId, uiState, press, pressPos } = this.state
    const isTarget = (todoId === todo.id)
    let itemX = 0
    let itemY = y + todo.order * ITEM_HEIGHT
    if (isTarget) {
      switch (uiState) {
        case LONG_PRESS_REORDER: {
          itemY = press[1] + delta[1] - pressPos
          break
        }
        case PULL_RIGHT_ITEM: {
          itemX = Math.max(delta[0], 0)
          break
        }
        case PULL_LEFT_ITEM: {
          itemX = Math.min(delta[0], 0)
          break
        }
      }
    }
    return {
      itemX,
      itemY
    }
  }

  handlePan ({ deltaX, deltaY }) {
    this.setState({
        delta: [deltaX, deltaY]
    })
    if (this.state.uiState === DEFAULT && Math.abs(deltaY) > Math.abs(deltaX)) {
      this.setState({
        uiState: PULL_DOWN_LIST
      })
    }
  }
  
  handlePanEnd () {
    const { uiState } = this.state
    switch (uiState) {
      case 
    }
  }

  getListY() {
    switch (this.state.uiState) {
      case RELEASED_AND_ADD: return spring(ITEM_HEIGHT)
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

  render() {
    let { uiState, todoId } = this.state
    const motionStyle = this.getMotionStyle()
    return (
      <Motion style={ motionStyle } onRest={this.onListRest}>
        { ({ y, backdropOpacity }) =>
          <div style={{
            height: '100%',
            transform: `translateY(${y}px)`
          }}>
            { uiState === RELEASED_AND_ADD || uiState === PULL_DOWN_LIST || uiState === CANCEL_ADD ? <AddTodo y={y}
            releaseAndAdd={uiState === RELEASED_AND_ADD}
            cancelAdd={uiState == CANCEL_ADD}
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
                      const {
                        itemX
                      } = this.getItemProps(todo, y)
                      return <Todo
                        key={ todo.id }
                        {...todo}
                        // x={ itemX }
                        y={ y }
                        uiState={ uiState }
                        todoId={ todoId }
                        onToggle={ this.props.onToggle }
                        onDelete={ this.props.onDelete }
                        onReorder={ this.props.onReorder }
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