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
const EDITING_LIST = 'EDITING_LIST'
const noop = () => {}

const H_PAN_THRESHOLD = 50

const toggledGreen = hexToRgb('#008b00')
const doneGray = hexToRgb('#444')

let pageWidth
$(() => {
  pageWidth = $('body').width()
})

const xConfig = { stiffness: 600, damping: 40 }
// for debug
const slowMotionConfig = { stiffness: 20, damping: 30 }

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
      pressOrder: -1,
      releasedAtX: 0
    }
  }

  getY () {
    const { uiState, delta } = this.state
    const y = this.props.order * ITEM_HEIGHT
    switch (uiState) {
      case EDITING_LIST: {
        return y
      }
      case LONG_PRESS_REORDER: {
        return this.state.pressOrder * ITEM_HEIGHT + delta[1]
      }
      default: {
        return spring(y)
      }
    }
  }

  getZ () {
    switch (this.state.uiState) {
      case LONG_PRESS_REORDER: return spring(1)
      default: return spring(0);
    }
  }

  getBoxShadow (z) {
    let shadowY = .2 * z
    let shadowBlur = .3 * z
    let shadowSpread = .2 * z
    return `0 ${shadowY}em ${shadowBlur}em ${shadowSpread}em rgba(0,0,0,0.2)`
  }

  getWrapperStyle (y, z) {
    let scale = 1 + z * .05
    return {
      zIndex: this.getZIndex(),
      boxShadow: this.getBoxShadow(z),
      transform: `translateY(${y}px) scale(${scale})`,
      WebkitTransform: `translateY(${y}px) scale(${scale})`
    }
  }

  getMotionStyle () {
    return {
      x: this.getX(),
      y: this.getY(),
      z: this.getZ(),
      percent: this.getPercent()
    }
  }

  getX () {
    switch (this.state.uiState) {
      case PULL_RIGHT_ITEM:
      case PULL_LEFT_ITEM: {
        return this.getOffsetX()
      }
      case RELEASED_TO_DEFAULT:
      case RELEASED_TO_TOGGLE: {
        return spring(0, xConfig)
      }
      case RELEASED_TO_DELETE: {
        return spring(-pageWidth - H_PAN_THRESHOLD, xConfig)
      }
      default: return 0
    }
  }

  getOffsetX () {
    const { uiState } = this.state
    let x = this.state.delta[0]
    if (uiState === PULL_RIGHT_ITEM) {
      x = Math.max(x, 0)
    } else if (uiState === PULL_LEFT_ITEM) {
      x = Math.min(x, 0)
    } else return 0
    if (Math.abs(x) > H_PAN_THRESHOLD) {
      x = (x > 0 ? 1 : -1) * ((Math.abs(x) - H_PAN_THRESHOLD) / 5 + H_PAN_THRESHOLD)
    }
    return x
  }

  getPercent () {
    switch (this.state.uiState) {
      case PULL_RIGHT_ITEM: {
        return 0
      }
      case RELEASED_TO_TOGGLE: {
        return spring(1, xConfig)
      }
      case TOGGLING_VERTICAL_MOVE: {
        return spring(2)
      }
      default: return 0
    }
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

  getZIndex () {
    const { uiState: listUiState, order } = this.props
    let zIndex = 0
    if ((listUiState === ITEM_JUST_ADDED && order === 0)
      || this.state.uiState === TOGGLING_VERTICAL_MOVE
      || this.state.uiState === LONG_PRESS_REORDER
      || this.state.uiState === RELEASED_TO_DEFAULT) {
      zIndex = 10000
    }
    return zIndex
  }

  getItemStyle (x, percent) {
    let style = {}
    // backgroundColor
    style.backgroundColor = this.getBackgroundColor(percent)
    // transform
    style.WebkitTransform = `translate(${x}px)`
    style.transform = `translate(${x}px)`
    return style
  }

  getCheckIconStyle (x) {
    if (this.state.uiState === PULL_RIGHT_ITEM) {
      let opacity = 1
      if (x > H_PAN_THRESHOLD) {
        x = x - H_PAN_THRESHOLD
      } else {
        opacity = x / H_PAN_THRESHOLD
        x = 0
      }
      return {
        opacity: opacity,
        transform: `translateX(${x}px)`,
        WebkitTransform: `translateX(${x}px)`
      }
    } else if (this.state.uiState === RELEASED_TO_TOGGLE) {
      return {
        opacity: 1,
        transform: `transform(${this.state.releasedAtX}px)`,
        WebkitTransform: `transform(${this.state.releasedAtX}px)`,
      }
    } else {
      return {
        opacity: 0
      }
    }
  }

  getCrossIconStyle (x) {
    if (this.state.uiState === PULL_LEFT_ITEM
      || this.state.uiState === RELEASED_TO_DELETE) {
      let opacity
      if (x < -H_PAN_THRESHOLD) {
        x = x + H_PAN_THRESHOLD
      } else {
        opacity = -x / H_PAN_THRESHOLD
        x = 0
      }
      return {
        opacity: opacity,
        transform: `translateX(${x}px)`,
        WebkitTransform: `translateX(${x}px)`
      }
    } else {
      return {
        opacity: 0
      }
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const { uiState } = this.state
    if (nextState.uiState != uiState) {
      console.log(`%cITEM state change from ${uiState} to ${nextState.uiState}`, "color:red")
      this.props.onItemStateChange(this.props.id, nextState.uiState)
    }
    if (nextProps.uiState === PULL_DOWN_LIST && this.state.uiState != EDITING_LIST) {
      this.setState({
        uiState: EDITING_LIST
      })
    }
    if (nextProps.uiState === DEFAULT && this.state.uiState != DEFAULT) {
      this.setState({
        uiState: DEFAULT
      })
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
        let releasedAtX = 0
        if (delta[0] > H_PAN_THRESHOLD) {
          nextUiState = RELEASED_TO_TOGGLE
          releasedAtX = delta[0]
        } else if (delta[0] > 0) {
          nextUiState = RELEASED_TO_DEFAULT
        } else {
          nextUiState = DEFAULT
        }
        this.setState({
          uiState: nextUiState,
          delta: [0, 0],
          releasedAtX
        })
        break
      }
      case PULL_LEFT_ITEM: {
        let nextUiState
        let releasedAtX = 0
        if (delta[0] < -H_PAN_THRESHOLD) {
          nextUiState = RELEASED_TO_DELETE
          releasedAtX = delta[0]
        } else if (delta[0] < 0) {
          nextUiState = RELEASED_TO_DEFAULT
        } else {
          nextUiState = DEFAULT
        }
        this.setState({
          uiState: nextUiState,
          delta: [0, 0],
          releasedAtX
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
        onRest={ motionOnRest }>
        {({ x, y, z, percent }) => {
          return <div className="todo-wrapper"
          style={ this.getWrapperStyle(y, z) }>
            <span className="icon icon-check"
            style={ this.getCheckIconStyle(x) }></span>
            <span className="icon icon-cross"
            style={ this.getCrossIconStyle(x) }></span>
            <div
              className={classes}
              style={ this.getItemStyle(x, percent) }>
              {this.props.text + '-' + this.props.order}
            </div>
          </div>
          }
        }
        </Motion>
      </Hammer>
    )
  }
}

export default Todo