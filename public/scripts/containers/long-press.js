import React, { PropTypes } from 'react'

const noop = () => {}
class LongPress extends React.Component {
  constructor(props) {
    super(props)
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.state = {
      timer: null
    }
  }

  handleTouchStart() {
    this.handleMouseDown()
  }

  handleMouseDown() {
    let timer = setTimeout(() => {
      this.props.onLongPress()
      this.setState({
        timer: null
      })
    }, this.props.delay)
    this.setState({
      timer
    })
  }

  handleTouchMove(e) {
    e.preventDefault()
    this.handleMouseMove()
  }

  handleMouseMove() {
    console.log(2)
    this.cancelLongPress()
  }

  handleTouchEnd(e) {
    e.preventDefault()
    this.handleMouseUp()
  }

  handleMouseUp() {
    console.log(3)
    this.cancelLongPress()
  }

  cancelLongPress() {
    if (this.state.timer) {
      console.log('longpress canceled')
      clearTimeout(this.state.timer)
      this.setState({
        timer: null
      })
    }
  }

  render() {
    let {
      onTouchStart,
      onMouseDown,
      onTouchMove,
      onMouseMove,
      onTouchEnd,
      onMouseUp
    } = this.props.children.props
    onTouchStart = onTouchStart || noop
    onMouseDown = onMouseDown || noop
    onTouchMove = onTouchMove || noop
    onMouseMove = onMouseMove || noop
    onTouchEnd = onTouchEnd || noop
    onMouseUp = onMouseUp || noop
    return React.cloneElement(this.props.children, {
      onTouchStart: (...args) => {
        onTouchStart.apply(null, args)
        this.handleTouchStart.apply(this, args)
      },
      onMouseDown: (...args) => {
        onMouseDown.apply(null, args)
        this.handleMouseDown.apply(null, args)
      },
      onTouchMove: (...args) => {
        onTouchMove.apply(null, args)
        this.handleTouchMove.apply(null, args)
      },
      onMouseMove: (...args) => {
        onMouseMove.apply(null, args)
        this.handleMouseMove.apply(null, args)
      },
      onTouchEnd: (...args) => {
        onTouchEnd.apply(null, args)
        this.handleTouchEnd.apply(null, args)
      },
      onMouseUp: (...args) => {
        onMouseUp.apply(null, args)
        this.handleMouseUp.apply(null, args)
      }
    })
  }
}

LongPress.propTypes = {
  children: React.PropTypes.element.isRequired
};

export default LongPress