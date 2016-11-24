import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import $ from 'jquery'
import { Motion, spring } from 'react-motion'
import { clamp, ITEM_HEIGHT, hslToRgb, hexToRgb, interpolate } from '../containers/util'
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
import Hammer from 'react-hammerjs'

const RELEASED_TO_TOGGLE = 'RELEASED_TO_TOGGLE'
const RELEASED_TO_DEFAULT = 'RELEASED_TO_DEFAULT'
const TOGGLING_VERTICAL_MOVE = 'TOGGLING_VERTICAL_MOVE'
const RELEASED_TO_DELETE = 'RELEASED_TO_DELETE'
const FOLD_TO_DELETE = 'FOLD_TO_DELETE'
const noop = () => {}

const H_PAN_THRESHOLD = 50

const toggledGreen = hexToRgb('#399131')
const doneGray = hexToRgb('#444')

let pageWidth
$(() => {
  pageWidth = $('body').width()
})

class Todo extends React.Component {
  constructor(props) {
    super(props)
    this.toggle = this.toggle.bind(this)
    this.delete = this.delete.bind(this)
    this.reorder = this.reorder.bind(this)
    this.handlePan = this.handlePan.bind(this)
    this.handlePanEnd = this.handlePanEnd.bind(this)
    this.handlePress = this.handlePress.bind(this)
    this.handlePressUp = this.handlePressUp.bind(this)
    this.state = {
      uiState: DEFAULT,
      delta: [0, 0],
      press: [0, 0],
      pressOrder: -1
    }
  }

  getMotionStyle () {
    const xConfig = { stiffness: 1000, damping: 40 }
    // slow motion, for debug , { stiffness: 20, damping: 30}
    const { uiState, delta } = this.state
    const { uiState: ListUiState } = this.props
    const y = this.props.order * ITEM_HEIGHT
    switch (uiState) {
      case DEFAULT: {
        return {
          x: 0,
          y: spring(y),
          z: spring(0)
        }
      }
      case PULL_RIGHT_ITEM: {
        return {
          x: this.slowDownX(Math.max(delta[0], 0)),
          y: spring(y),
          z: 0,
          percent: 0
        }
      }
      case RELEASED_TO_DEFAULT: {
        return {
          x: spring(0, xConfig),
          y: spring(y),
          z: spring(0)
        }
      }
      case RELEASED_TO_TOGGLE: {
        return {
          x: spring(0, xConfig),
          y,
          z: 0,
          percent: spring(1, xConfig)
        }
      }
      case TOGGLING_VERTICAL_MOVE: {
        return {
          x: 0,
          y: spring(y),
          z: 0,
          percent: spring(2)
        }
      }
      case PULL_LEFT_ITEM: {
        return {
          x: this.slowDownX(Math.min(delta[0], 0)),
          y: spring(y),
          z: 0
        }
      }
      case RELEASED_TO_DELETE: {
        return {
          x: spring(-pageWidth, xConfig),
          y,
          z: 0
        }
      }
      case LONG_PRESS_REORDER: {
        return {
          x: 0,
          y: this.state.pressOrder * ITEM_HEIGHT + delta[1],
          z: spring(1)
        }
      }
    }
  }

  slowDownX (x) {
    if (Math.abs(x) > H_PAN_THRESHOLD) {
      x = (x > 0 ? 1 : -1) * ((Math.abs(x) - H_PAN_THRESHOLD) / 5 + H_PAN_THRESHOLD)
    }
    return x
  }

  getMotionOnRest () {
    switch (this.state.uiState) {
      case RELEASED_TO_TOGGLE: {
        return () => {
          requestAnimationFrame(this.toggle)
        }
      }
      case RELEASED_TO_DEFAULT:
      case TOGGLING_VERTICAL_MOVE: {
        return () => {
          this.setState({
            uiState: DEFAULT
          })
        }
      }
      case RELEASED_TO_DELETE: {
        return this.delete
      }
      default: return noop
    }
  }

  getBackgroundColor (percent) {
    let baseRGB = hslToRgb([354.1 + 3 * this.props.order, 1, .48])
    let RGB = this.props.done ? doneGray : baseRGB
    switch (this.state.uiState) {
      case RELEASED_TO_TOGGLE: {
        if (!this.props.done) {
          RGB = interpolate(baseRGB, toggledGreen, percent)
        }
        break
      }
      case TOGGLING_VERTICAL_MOVE: {
        percent -= 1
        if (this.props.done) {
          RGB = interpolate(toggledGreen, doneGray, percent)
        } else {
          RGB = interpolate(doneGray, baseRGB, percent)
        }
        break
      }
    }
    return `rgb(${Math.floor(RGB[0])},${Math.floor(RGB[1])},${Math.floor(RGB[2])})`
  }

  getStyle (x, y, z, percent) {
    const { uiState, todoId, id, order } = this.props
    const isTarget = (todoId === id)
    const isToggled = (isTarget && uiState === RELEASED_TOGGLE_ITEM)
    let style = {}
    // backgroundColor
    style.backgroundColor = this.getBackgroundColor(percent)
    // transform
    let scale = 1 + z * .05
    style.WebkitTransform = `translate(${x}px,${y}px) scale(${scale})`
    style.transform = `translate(${x}px,${y}px) scale(${scale})`
    // boxShadow
    let shadowY = .2 * z
    let shadowBlur = .3 * z
    let shadowSpread = .2 * z
    style.boxShadow = `0 ${shadowY}em ${shadowBlur}em ${shadowSpread}em rgba(0,0,0,0.2)`
    // zIndex
    style.zIndex = 0
    if (isTarget
      || (uiState === ITEM_JUST_ADDED && order === 0)
      || this.state.uiState === TOGGLING_VERTICAL_MOVE
      || this.state.uiState === LONG_PRESS_REORDER
      || this.state.uiState === RELEASED_TO_DEFAULT) {
      style.zIndex = 10000
    }
    return style
  }

  componentWillUpdate(nextProps, nextState) {
    const { uiState } = this.state
    if (nextState.uiState != uiState) {
      console.log('state change from', uiState, 'to', nextState.uiState)
    }
  }

  toggle () {
    this.setState({
      uiState: TOGGLING_VERTICAL_MOVE
    })
    this.props.onToggle(this.props.id)
  }

  delete () {
    this.props.onDelete(this.props.id)
  }

  reorder () {
    const deltaY = this.state.delta[1]
    const sign = deltaY > 0 ? 1 : -1
    const offset = sign * Math.floor((Math.abs(deltaY) + ITEM_HEIGHT / 2) / ITEM_HEIGHT)
    if (this.state.pressOrder + offset != this.props.order) {
      this.props.onReorder(this.props.id, this.state.pressOrder + offset)
    }
  }

  handlePan ({ deltaX, deltaY }) {
    const delta = [deltaX, deltaY]
    this.setState({ delta: delta })
    switch (this.state.uiState) {
      case DEFAULT: {
        if (Math.abs(delta[0]) > Math.abs(delta[1])) {
          // Pulling horizontally
          this.setState({ uiState: delta[0] > 0 ? PULL_RIGHT_ITEM : PULL_LEFT_ITEM })
        }
        break
      }
      case LONG_PRESS_REORDER: {
        this.reorder()
        break
      }
    }
  }

  handlePanEnd () {
    const { delta, uiState } = this.state
    switch (uiState) {
      case PULL_RIGHT_ITEM: {
        let nextUiState
        if (delta[0] > H_PAN_THRESHOLD) {
          nextUiState = RELEASED_TO_TOGGLE
        } else if (delta[0] > 0) {
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
      case PULL_LEFT_ITEM: {
        let nextUiState
        if (delta[0] < -H_PAN_THRESHOLD) {
          nextUiState = RELEASED_TO_DELETE
        } else if (delta[0] < 0) {
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
      case LONG_PRESS_REORDER: {
        this.releaseLongPress()
        break
      }
    }
  }

  releaseLongPress () {
    this.setState({
      uiState: RELEASED_TO_DEFAULT,
      delta: [0, 0],
      press: [0, 0],
      pressOrder: -1
    })
  }

  handlePress (e) {
    if (this.props.done) return
    const { pageX, pageY } = e.pointers[0]
    this.setState({
      uiState: LONG_PRESS_REORDER,
      press: [pageX, pageY],
      pressOrder: this.props.order
    })
  }

  handlePressUp () {
    this.setState({
      uiState: RELEASED_TO_DEFAULT
    })
  }

  render() {
    let classes = classNames('todo', { 'done': this.props.done })
    const motionStyle = this.getMotionStyle()
    const motionOnRest = this.getMotionOnRest()
    return (
      <Hammer
        onPan={ this.handlePan }
        onPanEnd={ this.handlePanEnd }
        onPress={ this.handlePress }
        onPressUp={ this.handlePressUp }
        options={{
          recognizers: {
            pan: {
              threshold: 0
            }
          }
        }}>
        <Motion
          defaultStyle={{ x: 0, y: 0, z: 0 }}
          style={ motionStyle }
          onRest={ motionOnRest }
          fakeKey={this.props.id}>
          {({ x, y, z, percent }) => {
            const style = this.getStyle(x, y, z, percent)
            return <div
              className={classes}
              style={style}
            >
              {this.props.text + '-' + this.props.order}
            </div>
            }
          }
        </Motion>
      </Hammer>
    )
  }
}

export default Todo