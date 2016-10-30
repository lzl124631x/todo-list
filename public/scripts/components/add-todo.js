import React from 'react'
import { Motion, spring } from 'react-motion'
import { clamp, ITEM_HEIGHT } from '../containers/util'

let input

let AddTodo = ({ onAdd, y, releaseAndAdd, cancelAdd, afterAdded }) => {
  let deg = clamp((1 - y / ITEM_HEIGHT) * 90, 0, 90)
  let style = {}
  style.pullOpacity = spring(y < ITEM_HEIGHT ? 1 : 0)
  style.releaseOpacity = spring(y < ITEM_HEIGHT ? 0 : 1)
  if (releaseAndAdd) {
    console.log('releaseAndAdd')
    style.textOpacity = spring(0)
    input.focus()
    setTimeout(() => {input.blur()}, 3000)
  } else {
    style.textOpacity = spring(1)
  }
  if (cancelAdd) {
    console.log('cancelAdd')
    input.value = ''
    input.blur()
    console.log('trying to blur', input.blur)
  }
  let lightness = clamp(y / ITEM_HEIGHT, 0, 1) * (48 - 20) + 20

  return (
    <div className="new-item-row"
         style={{
          transform: `perspective(300px) translateY(${y}px) rotateX(${deg}deg)`
        }}>
      <input className="new-item-input"
        style={{
          background: `hsl(354.1,100%,${lightness}%)`
        }}
        ref={ node => {
          input = node
        }}
        onFocus={ ()=> { console.log('focus')}}
        onBlur={ () => { console.log('blur')}}
        onKeyDown={e => {
          console.log('key')
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