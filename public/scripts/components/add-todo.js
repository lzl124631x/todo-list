import React from 'react'
import { clamp, ITEM_HEIGHT } from '../containers/util'

let AddTodo = ({ onAdd, y }) => {
  let input
  let deg = clamp((1 - y / ITEM_HEIGHT) * 90, 0, 90)

  return (
    <input className="new-item-input"
      style={{
        transform: `perspective(300px) translateY(${y}px) rotateX(${deg}deg)`
      }}
      ref={ node => {
        input = node
      }}
      onKeyDown={e => {
        if (e.keyCode === 13) {
          var text = input.value.trim();
          if (text) {
             onAdd(text, 0)
           }
          input.value = ''
        }
    }} />
  )
}

export default AddTodo