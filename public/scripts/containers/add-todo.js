import React from 'react'
import { connect } from 'react-redux'
import { addTodo } from '../actions'

let AddTodo = ({ dispatch }) => {
  let input

  return (
    <input className="new-item-input"
      ref={node => {
        input = node
      }}
      onKeyDown={e => {
        if (e.keyCode === 13) {
          var text = input.value.trim();
          if (text) {
             dispatch(addTodo(text))
           }
          input.value = ''
        }
    }} />
  )
}

AddTodo = connect()(AddTodo)

export default AddTodo