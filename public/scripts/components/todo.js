import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import $ from 'jquery'
import { Motion, spring } from 'react-motion'
import LongPress from '../containers/long-press'
import { clamp, ITEM_HEIGHT } from '../containers/util'

const H_PAN_THRESHOLD = 50

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
  }

  getMotionConfig () {
    const { isPressed, x, y } = this.props
    const initialY = this.props.order * ITEM_HEIGHT + this.props.y
    const springConfig = { stiffness: 1000, damping: 40 }
    let style = {
      x: spring(this.props.x, springConfig),
      y: this.props.enableMotion ? spring(initialY) : initialY,
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
    let classes = classNames('todo', { 'done': this.props.done })
    let { style, onRest } = this.getMotionConfig()
    let isLongPressed = false, isLongPressReleasing = false
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
                  zIndex: isLongPressed || isLongPressReleasing ? 1 : this.props.zIndex
                }}
              >
                {this.props.text + '-' + this.props.order}
              </div>
            </LongPress>
          }
        </Motion>
    )
  }

  handleTouchStart (itemY, { touches }) {
    console.log('touchstart', this.props.disableItemOperation, this.props.uiState);
    if (this.props.disableItemOperation) return;
    //console.log('touchstart');
    this.handleMouseDown(itemY, touches[0])
  }

  handleMouseDown (itemY, { pageX, pageY }) {
    if (this.props.disableItemOperation) return;
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
    if (this.props.disableItemOperation) return;
    //console.log('touchmove')
    e.preventDefault()
    this.handleMouseMove(e.touches[0])
  }

  handleMouseMove ({ pageX, pageY }) {
    if (this.props.disableItemOperation) return;
    console.log('mousemove');
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
      this.props.onListOperationDisabled()
    }
  }

  handleTouchEnd (e) {
    
    if (this.props.disableItemOperation) return;//console.log('touchend')
    e.preventDefault()
    this.handleMouseUp()
  }

  handleMouseUp () {
    
    if (this.props.disableItemOperation) return;//console.log('mouseup')
    this.setState({ isPressed: false, mouse: [0, 0], press: [0, 0], delta: [0, 0] })
    if (this.state.isLongPressed) {
      this.setState({ isLongPressed: false, isLongPressReleasing: true })
    }
  }

  handleLongPress () {
    
    if (this.props.disableItemOperation) return;this.setState({ isLongPressed: true })
    this.props.onListOperationDisabled()
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