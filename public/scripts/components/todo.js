import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import $ from 'jquery'
import {Motion, spring} from 'react-motion'
import LongPress from '../containers/long-press'

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

const H_PAN_THRESHOLD = 50
const ITEM_HEIGHT = 53

const initialState = {
  press: [0, 0], // the mouse-done point's offset
  mouse: [0, 0], // the mouse's offset
  delta: [0, 0], // the mouse's offset delta from mouse-move point to mouse-down point 
  pressPos: 0, // on item pressed, innerPos is the position of mouse relative to the top of item
  isPressed: false,
  isLongPressed: false,
  isLongPressReleasing: false,
  dir: null,
  op: null
}

class Todo extends React.Component {
  constructor(props) {
    super(props)
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleLongPress = this.handleLongPress.bind(this)
    this.state = initialState
  }

  getMotionConfig () {
    const initialY = this.props.order * ITEM_HEIGHT
    const { press, mouse, delta, pressPos, isPressed, isLongPressed, isLongPressReleasing } = this.state
    const springConfig = { stiffness: 1000, damping: 40 }
    let style = {
      x: spring(0, springConfig),
      y: spring(initialY),
      scale: spring(1)
    }, onRest, [x, y] = delta
    if (isLongPressed) {
      style.y = spring(mouse[1] - pressPos, springConfig)
      style.scale = spring(1.05)
    } else if (isLongPressReleasing) {
      onRest = () => {
        this.setState({ isLongPressReleasing: false })
      }
    } else if (isPressed) {
      if (Math.abs(x) > H_PAN_THRESHOLD) {
        x = (x > 0 ? 1 : -1) * ((Math.abs(x) - H_PAN_THRESHOLD) / 5 + H_PAN_THRESHOLD)
      }
      style.x = x
    } else {
      onRest = () => {
        this.setState({ op: null })
      }
    }
    return { style, onRest }
  }

  render() {
    let { isLongPressed, isLongPressReleasing } = this.state
    let classes = classNames('todo', { 'done': this.props.done })
    let { style, onRest } = this.getMotionConfig()
    return (
        <Motion defaultStyle={{ x: 0, y: 0, scale: 1 }} style={ style } onRest={ onRest }>
          {({ x, y, scale }) => 
            <LongPress onLongPress={this.handleLongPress} delay={ 500 }>
              <div
                className={classes}
                style={{
                  background: `hsl(${354.1 + 3 * this.props.order},100%,48%)`,
                  WebkitTransform: `translate(${x}px,${y}px) scale(${scale})`,
                  transform: `translate(${x}px,${y}px) scale(${scale})`,
                  boxShadow: isLongPressed ? '0 .2em .3em .2em rgba(0, 0, 0, 0.2)' : '',
                  zIndex: isLongPressed || isLongPressReleasing ? 1 : 0
                }}
                onTouchStart={this.handleTouchStart.bind(null, y)}
                onMouseDown={this.handleMouseDown.bind(null, y)}
                onTouchMove={this.handleTouchMove}
                onMouseMove={this.handleMouseMove}
                onTouchEnd={this.handleTouchEnd}
                onMouseUp={this.handleMouseUp}
              >
                {this.props.text + '-' + this.props.order}
              </div>
            </LongPress>
          }
        </Motion>
    )
  }

  handleTouchStart (itemY, { touches }) {
    //console.log('touchstart');
    this.handleMouseDown(itemY, touches[0])
  }

  handleMouseDown (itemY, { pageX, pageY }) {
    //console.log('mousedown');
    this.setState({
      isPressed: true,
      press: [pageX, pageY],
      mouse: [pageX, pageY],
      delta: [0, 0],
      pressPos: pageY - itemY
    })
  }

  handleTouchMove (e) {
    //console.log('touchmove')
    e.preventDefault()
    this.handleMouseMove(e.touches[0])
  }

  handleMouseMove ({ pageX, pageY }) {
    //console.log('mousemove');
    let [x, y] = this.state.press
    this.setState({
      mouse: [pageX, pageY],
      delta: [pageX - x, pageY - y]
    })
    if (this.state.isLongPressed) {
      const itemY = pageY - this.state.pressPos
      const row = clamp(Math.round(itemY / ITEM_HEIGHT), 0, this.props.itemCount - 1)
      this.props.onReorder(row)
    } else if (this.state.delta[0] > this.state.delta[1]) {
      this.hPan()
    }
  }

  handleTouchEnd (e) {
    //console.log('touchend')
    e.preventDefault()
    this.handleMouseUp()
  }

  handleMouseUp () {
    //console.log('mouseup')
    this.setState({ isPressed: false, mouse: [0, 0], press: [0, 0], delta: [0, 0] })
    if (this.state.isLongPressed) {
      this.setState({ isLongPressed: false, isLongPressReleasing: true })
    }
  }

  handleLongPress () {
    //console.log('longpress')
    this.setState({ isLongPressed: true })
  }

  hPan() {
    let x = this.state.delta[0]
    if (Math.abs(x) > H_PAN_THRESHOLD && !this.state.op) {
      if (x > 0) {
        this.setState({ op: 'toggle' })
        this.props.onToggle()
      } else {
        this.setState({ op: 'delete' })
        this.props.onDelete()
      }
    }
  }
}

Todo.propTypes = {
  onToggle: PropTypes.func.isRequired,
  done: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
}

export default Todo;