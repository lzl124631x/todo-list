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
const ITEM_JUST_ADDED = 'ITEM_JUST_ADDED'
const PULL_RIGHT_ITEM = 'PULL_RIGHT_ITEM'
const PULL_LEFT_ITEM = 'PULL_LEFT_ITEM'
const ITEM_TOGGLED = 'ITEM_TOGGLED'
const LONG_PRESS_REORDER = 'LONG_PRESS_REORDER'
const RELEASED_TOGGLE_ITEM = 'RELEASED_TOGGLE_ITEM'
const RELEASED_DELETE_ITEM = 'RELEASED_DELETE_ITEM'

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
    const targetOrder = Math.floor(pageY / ITEM_HEIGHT)
    if (targetOrder >= this.props.todos.length) {
      // Pressed on empty space
    } else {
      // Pressed on an item
      const todo = this.props.todos.find(t => t.order == targetOrder)
      this.setState({
        press: [ pageX, pageY ],
        isPressed: true,
        todoId: todo.id,
        pressedItemInitialState: todo.done,
        pressPos: pageY - todo.order * ITEM_HEIGHT
      })
    }
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
      const todo = this.getItem(this.state.todoId)
      switch (uiState) {
        case DEFAULT: {
          if (Math.abs(delta[0]) > Math.abs(delta[1])) {
            // Pulling horizontally
            this.setState({ uiState: delta[0] > 0 ? PULL_RIGHT_ITEM : PULL_LEFT_ITEM })
          } else if (delta[1] > 0) {
            // Pulling down
            this.setState({ uiState: PULL_DOWN_LIST })
          }
          break;
        }
        case LONG_PRESS_REORDER: {
          const itemY = pageY - this.state.pressPos
          const row = clamp(Math.round(itemY / ITEM_HEIGHT), 0, this.props.todos.length - 1)
          if (row !== todo.order) {
            this.props.onReorder(this.state.todoId, row)
          }
          break;
        }
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
    const todo = this.getItem(this.state.todoId)
    switch (uiState) {
      case PULL_DOWN_LIST: {
        if (delta[1] > ITEM_HEIGHT) {
          state.uiState = RELEASED_AND_ADD
        } else if (delta[1] > 0){
          state.uiState = CANCEL_ADD
        }
        break;
      }
      case PULL_RIGHT_ITEM: {
        if (Math.abs(delta[0]) > H_PAN_THRESHOLD
          && todo.done === this.state.pressedItemInitialState) {
          state.uiState = RELEASED_TOGGLE_ITEM
          state.todoId = this.state.todoId
        }
        break;
      }
      case PULL_LEFT_ITEM: {
        if (Math.abs(delta[0]) > H_PAN_THRESHOLD) {
          state.uiState = RELEASED_DELETE_ITEM
          state.todoId = this.state.todoId
        }
        break;
      }
    }
    this.setState(state)
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

  getBackdropOpacity () {
    switch (this.state.uiState) {
      case RELEASED_AND_ADD: return spring(.8)
      default: return spring(0)
    }
  }

  getItemProps (todo, y) {
    const { delta, todoId, uiState, press, pressPos } = this.state
    const isPressed = (todoId === todo.id)
    const isLongPressed = (isPressed && uiState === LONG_PRESS_REORDER)
    let itemX = 0
    let itemY = y + todo.order * ITEM_HEIGHT
    if (isPressed) {
      switch (uiState) {
        case LONG_PRESS_REORDER: {
          itemY = press[1] + delta[1] - pressPos
          break;
        }
        case PULL_RIGHT_ITEM: {
          itemX = Math.max(delta[0], 0)
          break;
        }
        case PULL_LEFT_ITEM: {
          itemX = Math.min(delta[0], 0)
          break;
        }
      }
    }
    let onRest, classes, toggled = (uiState === RELEASED_TOGGLE_ITEM && todo.id === todoId), deleting = (uiState === RELEASED_DELETE_ITEM && todo.id === todoId)
    if (toggled) {
      classes = 'just-toggled'
      onRest = () => {
        this.props.onToggle(todoId)
      }
    }
    if (uiState === RELEASED_DELETE_ITEM)
    console.log('!!!!', '>>> ', todoId)
    if (deleting) {
      console.log('deleting')
      itemX = -300
      onRest = () => {
        this.props.onDelete(todoId)
      }
    }
    let zIndex = this.getItemZIndex(todo)
    let boxShadow = isLongPressed ? '0 .2em .3em .2em rgba(0, 0, 0, 0.2)' : ''
    return {
      itemX,
      itemY,
      isPressed,
      isLongPressed,
      zIndex,
      uiState,
      onRest,
      classes,
      toggled,
      boxShadow
    }
  }

  getItemZIndex (todo) {
    const { uiState, todoId } = this.state
    let zIndex = 0
    if ((uiState === LONG_PRESS_REORDER && todo.id === todoId)
      || (uiState === ITEM_JUST_ADDED && todo.order === 0)) {
      zIndex = 10000
    }
    return zIndex
  }

  render() {
    let { uiState } = this.state
    const style = {
      y: this.getListY(),
      backdropOpacity: this.getBackdropOpacity()
    }
    return (
      <Motion style={style} onRest={this.onListRest}>
        { ({ y, backdropOpacity }) =>
          <div style={{height: '100%' }}>
            { uiState === RELEASED_AND_ADD || uiState === PULL_DOWN_LIST || uiState === CANCEL_ADD ? <AddTodo y={y}
            releaseAndAdd={uiState === RELEASED_AND_ADD}
            cancelAdd={uiState == CANCEL_ADD}
            afterAdded={this.handleAdd} /> : undefined }
            <LongPress onLongPress={this.handleLongPress}>
              <div className="todo-list"
                onTouchStart={this.handleTouchStart}
                onMouseDown={this.handleMouseDown}
                onTouchMove={this.handleTouchMove}
                onMouseMove={this.handleMouseMove}
                onTouchEnd={this.handleTouchEnd}
                onMouseUp={this.handleMouseUp}>
                {
                  this.props.todos.map((todo, i) => {
                    const {
                      itemX,
                      itemY,
                      isPressed,
                      isLongPressed,
                      zIndex,
                      uiState,
                      onRest,
                      classes,
                      toggled,
                      boxShadow
                    } = this.getItemProps(todo, y)
                    return <Todo
                      key={ todo.id }
                      {...todo}
                      x={ itemX }
                      y={ itemY }
                      isPressed={ isPressed }
                      isLongPressed={ isLongPressed }
                      zIndex={ zIndex }
                      uiState={ uiState }
                      onRest={ onRest }
                      classes={ classes }
                      toggled={ toggled }
                      boxShadow={ boxShadow }
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