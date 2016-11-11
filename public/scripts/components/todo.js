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

  render() {
    const { text, order } = this.props
    let classes = classNames('todo', { 'done': this.props.done }, this.props.classes)
    let y = order * ITEM_HEIGHT
    let scale = 1
    let x = this.props.x
    if (Math.abs(x) > H_PAN_THRESHOLD) {
      x = (x > 0 ? 1 : -1) * ((Math.abs(x) - H_PAN_THRESHOLD) / 5 + H_PAN_THRESHOLD)
    }
    console.log('render x', x)
    return (
      <div
        id={ this.props.id }
        className={classes}
        style={{
          backgroundColor: `hsl(${354.1 + 3 * order},100%,48%)`,
          WebkitTransform: `translate3d(${x}px,${y}px,0)`,
          transform: `translate3d(${x}px,${y}px,0)`,
        }}
      >
        {text + '-' + order}
      </div>
    )
  }
}

export default Todo;