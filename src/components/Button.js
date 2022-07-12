import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const CustomButton = styled.button`
  font-size: 1rem;
  text-align: center;
  border: none;
  outline: none;
  border: ${(props) => (props.active ? '1px solid #fff' : '1px solid #aaa')};
  transition: all 0.1s;

  &:hover,
  &:focus {
    outline: none;
    color: #fff;
    border: 1px solid #fff;
    width: 90%;
  }
`

function Button({ children, ...props }) {
  return <CustomButton {...props}>{children}</CustomButton>
}

Button.propTypes = {
  active: PropTypes.bool,
}

Button.defaultProps = {
  active: false,
}

export default Button
