import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import $ from 'jquery'
import { Motion, spring } from 'react-motion'
import { clamp, ITEM_HEIGHT } from '../containers/util'

const H_PAN_THRESHOLD = 50
const PULL_DOWN_LIST = 'PULL_DOWN_LIST'
const RELEASED_AND_ADD = 'RELEASED_AND_ADD'
const CANCEL_ADD = 'CANCEL_ADD'

class Todo extends React.Component {
  constructor(props) {
    super(props)
  }

  getMotionConfig () {
    const { isPressed, x, y, uiState } = this.props
    const initialY = this.props.y
    const springConfig = { stiffness: 1000, damping: 40 }
    let style = {
      x: spring(this.props.x, springConfig),
      y: spring(initialY),
      scale: spring(1)
    }
    if (isPressed) {
      let offsetX = x
      if (Math.abs(x) > H_PAN_THRESHOLD) {
        offsetX = (offsetX > 0 ? 1 : -1) * ((Math.abs(offsetX) - H_PAN_THRESHOLD) / 5 + H_PAN_THRESHOLD)
      }
      style.x = offsetX
      style.y = initialY
    }
    if (uiState === PULL_DOWN_LIST
      || uiState === RELEASED_AND_ADD
      || uiState === CANCEL_ADD) {
      style.y = initialY
    }
    return { style }
  }

  render() {
    const { isLongPressed, onRest, zIndex, boxShadow } = this.props
    let classes = classNames('todo', { 'done': this.props.done }, this.props.classes)
    let { style } = this.getMotionConfig()
    return (
        <Motion defaultStyle={{ x: 0, y: 0, scale: 1 }} style={ style } onRest={ onRest } key={this.props.id}>
          {({ x, y, scale }) => {
            if (this.props.toggled) {
              console.error('render', this.props.text, this.props.order, y, style.y)
            }
            return <div
              id={ this.props.id }
              className={classes}
              style={{
                backgroundColor: `hsl(${354.1 + 3 * this.props.order},100%,48%)`,
                WebkitTransform: `translate(${x}px,${y}px) scale(${scale})`,
                transform: `translate(${x}px,${y}px) scale(${scale})`,
                boxShadow: boxShadow,
                zIndex: zIndex
              }}
            >
              {this.props.text + '-' + this.props.order}
            </div>
            }
          }
        </Motion>
    )
  }
}

export default Todo;