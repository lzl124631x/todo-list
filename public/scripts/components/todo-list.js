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

const H_PAN_THRESHOLD = 50

function log(e) {
  console.log(e.type, e)
}

const INITIAL_STATE = {
  // The mouse move delta
  delta: [0, 0],
  uiState: DEFAULT
}

class TodoList extends React.Component {
  constructor(props) {
    super(props)
    this.cancelAdd = this.cancelAdd.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
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

  getBackdropOpacity () {
    switch (this.state.uiState) {
      case RELEASED_TO_ADD: return spring(.8)
      default: return spring(0)
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
    const { uiState, delta } = this.state
    this.setState({ delta: [0, 0] })
    switch (uiState) {
      case PULL_DOWN_LIST: {
        this.setState({
          uiState: delta[1] > ITEM_HEIGHT ? RELEASED_TO_ADD : RELEASED_TO_DEFAULT
        })
        break
      }
    }
  }

  getListY() {
    switch (this.state.uiState) {
      case RELEASED_TO_ADD: return spring(ITEM_HEIGHT)
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
      case ITEM_JUST_ADDED: {
        return () => {
          this.setState({
            uiState: DEFAULT
          })
        }
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
            { uiState === RELEASED_TO_ADD || uiState === PULL_DOWN_LIST || uiState === CANCEL_ADD ? <AddTodo y={y}
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