import React from 'react'
import { Motion, spring } from 'react-motion'
import { clamp, ITEM_HEIGHT } from '../containers/util'

const RELEASED_TO_ADD = 'RELEASED_TO_ADD'
const CANCEL_ADD = 'CANCEL_ADD'
let AddTodo = ({ onAdd, y, uiState, afterAdded }) => {
  let input
  let style = {}
  style.pullOpacity = spring(y < ITEM_HEIGHT ? 1 : 0)
  style.releaseOpacity = spring(y < ITEM_HEIGHT ? 0 : 1)
  if (uiState === RELEASED_TO_ADD) {
    style.textOpacity = spring(0)
  } else {
    style.textOpacity = spring(1)
  }

  return (
    <div className="new-item-row"
         style={{
          transform: `perspective(300px) rotateX(${clamp((1 - y / ITEM_HEIGHT) * 90, 0, 90)}deg)`,
          filter: `brightness(${clamp(y / ITEM_HEIGHT, .5, 1)})`
        }}>
      <input className="new-item-input"
        ref={ node => {
          if (node != null) {
            input = node
            if (uiState === RELEASED_TO_ADD) node.focus()
            if (uiState === CANCEL_ADD) {
              node.blur()
              node.value = ''
            }
          }
        }}
        onKeyDown={e => {
          if (e.keyCode === 13) {
            var text = input.value.trim();
            if (text) {
               onAdd(text, 0)
               afterAdded()
             }
            input.value = ''
          }
      }} />
      <Motion style={style}>
        {({ pullOpacity, releaseOpacity, textOpacity }) => 
          <div className="new-item-row-hint-text" style={{ opacity: textOpacity, display: textOpacity ? "block" : "none" }}>
            <span style={{ opacity: pullOpacity }}>Pull to Create Item</span>
            <span style={{ opacity: releaseOpacity }}>Release to Create Item</span>
          </div>
        }
      </Motion>
    </div>
  )
}

export default AddTodo