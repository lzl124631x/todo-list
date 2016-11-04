import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import $ from 'jquery'
import Todo from './todo'
import AddTodo from '../containers/add-todo'
import LongPress from '../containers/long-press'
import { Motion, spring } from 'react-motion'
import { clamp, ITEM_HEIGHT } from '../containers/util'

const H_PAN_THRESHOLD = 50

const DEFAULT = 'DEFAULT'
const PULL_DOWN_LIST = 'PULL_DOWN_LIST'
const RELEASED_AND_ADD = 'RELEASED_AND_ADD'
const CANCEL_ADD = 'CANCEL_ADD'
const PULL_RIGHT_ITEM = 'PULL_RIGHT_ITEM'
const PULL_LEFT_ITEM = 'PULL_LEFT_ITEM'
const ITEM_TOGGLED = 'ITEM_TOGGLED'
const LONG_PRESS_REORDER = 'LONG_PRESS_REORDER'
const RELEASED_TOGGLE_ITEM= 'RELEASED_TOGGLE_ITEM'

const INITIAL_STATE = {
  press: [0, 0],
  delta: [0, 0],
  isPressed: false,
  pressedItemId: null,
  pressedItemInitialState: null,
  pressPos: 0,
  uiState: DEFAULT,
  togglingItemId: null
}

class TodoList extends React.Component {
  constructor(props) {
    super(props)
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleLongPress = this.handleLongPress.bind(this)
    this.cancelAdd = this.cancelAdd.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.onListRest = this.onListRest.bind(this)
    this.getItem = this.getItem.bind(this)
    this.state = INITIAL_STATE
  }

  getItem (id) {
    return this.props.todos.find(t => t.id === id)
  }
  
  handleTouchStart ({ touches }) {
    this.handleMouseDown(touches[0])
  }

  handleMouseDown ({ pageX, pageY }) {
    const todo = this.props.todos.find(t => t.order == Math.floor(pageY / ITEM_HEIGHT))
    const itemY = todo.order * ITEM_HEIGHT
    this.setState({
      press: [ pageX, pageY ],
      isPressed: true,
      pressedItemId: todo.id,
      pressedItemInitialState: todo.done,
      pressPos: pageY - itemY
    })
  }
  
  handleTouchMove (e) {
    e.preventDefault()
    this.handleMouseMove(e.touches[0])
  }

  handleMouseMove ({ pageX, pageY }) {
    if (this.state.isPressed) {
      const [x, y] = this.state.press
      const delta = [ pageX - x, pageY - y ]
      this.setState({ delta: delta })
      const { uiState } = this.state
      if (uiState !== DEFAULT) {
        const todo = this.getItem(this.state.pressedItemId)
        if (uiState === PULL_RIGHT_ITEM
          && Math.abs(delta[0]) > H_PAN_THRESHOLD
          && todo.done === this.state.pressedItemInitialState) {
          // this.props.onToggle(this.state.pressedItemId)
        } else if (uiState === PULL_LEFT_ITEM
          && Math.abs(delta[0]) > H_PAN_THRESHOLD) {
          this.props.onDelete(this.state.pressedItemId)
          this.setState(INITIAL_STATE)
        } else if (uiState === LONG_PRESS_REORDER) {
          const itemY = pageY - this.state.pressPos
          const row = clamp(Math.round(itemY / ITEM_HEIGHT), 0, this.props.todos.length - 1)
          if (row !== todo.order) {
            this.props.onReorder(this.state.pressedItemId, row)
          }
        }
      } else if (Math.abs(delta[0]) > Math.abs(delta[1])) {
        this.setState({ uiState: delta[0] > 0 ? PULL_RIGHT_ITEM : PULL_LEFT_ITEM })
      } else if (delta[1] > 0) {
        // pull down
        this.setState({ uiState: PULL_DOWN_LIST })
      }
    }
  }
  
  handleTouchEnd (e) {
    e.preventDefault()
    this.handleMouseUp()
  }

  handleMouseUp () {
    const { uiState, delta } = this.state
    if (uiState === CANCEL_ADD) {
      return
    }
    let state = Object.assign({}, INITIAL_STATE)
    if (uiState === PULL_DOWN_LIST) {
      if (delta[1] > ITEM_HEIGHT) {
        state.uiState = RELEASED_AND_ADD
      } else if (delta[1] > 0){
        state.uiState = CANCEL_ADD
      }
    }
    const todo = this.getItem(this.state.pressedItemId)
    if (uiState === PULL_RIGHT_ITEM
      && Math.abs(delta[0]) > H_PAN_THRESHOLD
      && todo.done === this.state.pressedItemInitialState) {
      state.uiState = RELEASED_TOGGLE_ITEM
      state.togglingItemId = this.state.pressedItemId
    }
    console.log('reseting ', this.state, state)
    this.setState(state)
  }

//   componentWillUpdate(nextProps, nextState) {
// console.log('list',nextState)
//   }

  cancelAdd (e) {
    this.setState(Object.assign({}, INITIAL_STATE, { uiState: CANCEL_ADD }))
  }

  handleAdd (e) {
    this.setState(INITIAL_STATE)
  }

  onListRest () {
    if (this.state.uiState === CANCEL_ADD) {
      this.setState(INITIAL_STATE)
    }
  }

  handleLongPress() {
    this.setState({ uiState: LONG_PRESS_REORDER })
  }

  render() {
    const { todos, onToggle, onDelete, onReorder } = this.props
    let { uiState, press, delta, pressPos } = this.state
    let y = Math.max(this.state.delta[1], 0)
    if (y > 5 * ITEM_HEIGHT) {
      y = (y - 5 * ITEM_HEIGHT) / 5 + 5 * ITEM_HEIGHT
    }
    let style = { x: 0, y: this.state.isPressed ? y : 0, backdropOpacity: spring(0) }
    let releaseAndAdd = (uiState === RELEASED_AND_ADD)
    let cancelAdd = (uiState == CANCEL_ADD)
    if (uiState === RELEASED_AND_ADD) {
      style.y = spring(ITEM_HEIGHT)
      style.backdropOpacity = spring(.8)
    } else if (uiState === PULL_DOWN_LIST) {

    } else if (uiState === CANCEL_ADD) {
      style.y = spring(0)
    } else if (uiState === PULL_RIGHT_ITEM || uiState === PULL_LEFT_ITEM
      || uiState === LONG_PRESS_REORDER) {
      // disable vertical movement
      style.y = 0
    }
    return (
      <Motion style={style} onRest={this.onListRest}>
        { ({ y, backdropOpacity }) =>
          <div style={{height: '100%' }}>
            { uiState === RELEASED_AND_ADD || uiState === PULL_DOWN_LIST || uiState === CANCEL_ADD ? <AddTodo y={y} releaseAndAdd={releaseAndAdd} cancelAdd={cancelAdd} afterAdded={this.handleAdd} /> : undefined }
            <LongPress onLongPress={this.handleLongPress}>
              <div className="todo-list"
                onTouchStart={this.handleTouchStart}
                onMouseDown={this.handleMouseDown}
                onTouchMove={this.handleTouchMove}
                onMouseMove={this.handleMouseMove}
                onTouchEnd={this.handleTouchEnd}
                onMouseUp={this.handleMouseUp}>
                {
                  todos.map((todo, i) => {
                    let { delta, pressedItemId } = this.state
                    const isPressed = pressedItemId === todo.id
                    let itemIsLongPressed = isPressed && uiState === LONG_PRESS_REORDER
                    let x, itemY = y + todo.order * ITEM_HEIGHT
                    console.log(todo, itemY)
                    if (!isPressed) {
                      x = 0
                    } else {
                      if (itemIsLongPressed) {
                        x = 0
                        itemY = press[1] + delta[1] - pressPos
                      } else {
                        x = delta[0]
                        if ((uiState === PULL_RIGHT_ITEM && x < 0)
                          || (uiState === PULL_LEFT_ITEM && x > 0)) {
                          x = 0
                        }
                      }
                    }
                    let onRest
                    if (uiState === RELEASED_TOGGLE_ITEM && todo.id === this.state.togglingItemId) {
                      onRest = () => {
                        this.props.onToggle(todo.id)
                        console.log('toggling')
                      }
                    }
                    return <Todo
                      key={todo.id}
                      {...todo}
                      x={x}
                      y={itemY}
                      isPressed={isPressed}
                      isLongPressed={itemIsLongPressed}
                      zIndex={ uiState == RELEASED_AND_ADD ? 0 : uiState == CANCEL_ADD ? 0 : pressedItemId === todo.id ? 10000 : (todo.order === 0 ? 10000: 0)}
                      uiState={ uiState }
                      onRest={ onRest }
                    />})
                }
                <div className="backdrop" style={{
                  display: backdropOpacity === 0 ? "none" : "block",
                  background: `rgba(0,0,0,${backdropOpacity})`
                }}
                onTouchStart={this.cancelAdd}></div>
              </div>
            </LongPress>
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
};

export default TodoList