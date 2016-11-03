import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import $ from 'jquery'
import { Motion, spring } from 'react-motion'
import { clamp, ITEM_HEIGHT } from '../containers/util'

const H_PAN_THRESHOLD = 50

class Todo extends React.Component {
  constructor(props) {
    super(props)
  }

  getMotionConfig () {
    const { isPressed, x, y } = this.props
    const initialY = this.props.y
    const springConfig = { stiffness: 1000, damping: 40 }
    let style = {
      x: spring(this.props.x, springConfig),
      y: initialY,
      scale: spring(1)
    }, onRest
    // if (isLongPressed) {
    //   style.y = spring(mouse[1] - pressPos, springConfig)
    //   style.scale = spring(1.05)
    // } else if (isLongPressReleasing) {
    //   onRest = () => {
    //     this.setState({ isLongPressReleasing: false })
    //   }
    if (isPressed) {
      let offsetX = x
      if (Math.abs(x) > H_PAN_THRESHOLD) {
        offsetX = (offsetX > 0 ? 1 : -1) * ((Math.abs(offsetX) - H_PAN_THRESHOLD) / 5 + H_PAN_THRESHOLD)
      }
      style.x = offsetX
    }// else {
    //   onRest = () => {
    //     this.setState({ op: null })
    //   }
    // }
    return { style, onRest }
  }

  render() {
    const { isLongPressed } = this.props
    let classes = classNames('todo', { 'done': this.props.done })
    let { style, onRest } = this.getMotionConfig()
    let isLongPressReleasing = false
    return (
        <Motion defaultStyle={{ x: 0, y: 0, scale: 1 }} style={ style } onRest={ onRest }>
          {({ x, y, scale }) => 
            <div
              className={classes}
              style={{
                background: `hsl(${354.1 + 3 * this.props.order},100%,48%)`,
                WebkitTransform: `translate(${x}px,${y}px) scale(${scale})`,
                transform: `translate(${x}px,${y}px) scale(${scale})`,
                boxShadow: isLongPressed ? '0 .2em .3em .2em rgba(0, 0, 0, 0.2)' : '',
                zIndex: isLongPressed || isLongPressReleasing ? 1 : this.props.zIndex
              }}
            >
              {this.props.text + '-' + this.props.order}
            </div>
          }
        </Motion>
    )
  }
}

export default Todo;