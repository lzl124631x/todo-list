import React from 'react'
import { connect } from 'react-redux'
import { addTodo } from '../actions'
import _AddTodo from '../components/add-todo'

const mapStateToProps = (state) => state

const mapDispatchToProps = (dispatch) => {
  return {
    onAdd: (text, order) => {
      dispatch(addTodo(text, order))
    }
  }
}

const AddTodo = connect(
  mapStateToProps,
  mapDispatchToProps
)(_AddTodo)

export default AddTodo