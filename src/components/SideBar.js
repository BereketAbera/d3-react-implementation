import React from 'react'
import styled from 'styled-components'
import Button from './Button'
import {
  BsBarChart,
  BsBoxSeam,
  BsFillDiagram3Fill,
  BsFillGridFill,
  BsLightbulb,
  BsMegaphone,
  BsNodePlus,
  BsStack,
} from 'react-icons/bs'

import { FaList } from 'react-icons/fa'

function SideBar({ sideBarOpen, setSideBarOpen, children, ...props }) {
  return (
    <div
      className={`${sideBarOpen ? 'w-16' : 'w-8'}`}
      style={{
        // minWidth: sideBarOpen ? '12rem' : '4rem',
        transition: 'all .5s',
        borderRight: `1px solid #fff`,
        minHeight: `110vh`,
        boxSizing: 'border-box',
      }}
      {...props}
    >
      <button
        onClick={() => {
          setSideBarOpen(!sideBarOpen)
        }}
        className="text-2xl flex justify-center items-center w-full text-white p-2 mb-4 mt-2 hover:border-none hover:outline-none focus:border-none focus:outline-none"
      >
        <BsFillGridFill />
        {sideBarOpen && (
          <span
            style={{
              transition: 'all .5s',
            }}
            className="inline-block font-bold text-sm text-white ml-2"
          >
            d3-react-implementation
          </span>
        )}
      </button>
      {/* <button
        key="slack"
        className="flex justify-center items-center w-full my-2 p-4"
      >
        <span>
          <FaList />
        </span>
        {sideBarOpen && (
          <span className="inline-block font-bold text-md text-white">
            Slack
          </span>
        )}
      </button> */}
      <Button
        key="linked"
        className="flex justify-center items-center w-full my-2 p-4"
      >
        <BsNodePlus />
      </Button>
      <Button
        key="algo"
        className="flex justify-center items-center w-full my-2 p-4"
      >
        <BsBoxSeam />
      </Button>
      <Button
        key="chart"
        className="flex justify-center items-center w-full my-2 p-4"
      >
        <BsBarChart />
      </Button>
      <Button
        key="graph"
        className="flex justify-center items-center w-full my-2 p-4"
      >
        <BsFillDiagram3Fill />
      </Button>
      <Button
        key="info"
        className="flex justify-center items-center w-full my-2 p-4"
      >
        <BsLightbulb />
      </Button>
      <Button
        key="notification"
        className="flex justify-center items-center w-full my-2 p-4"
      >
        <BsMegaphone />
      </Button>
    </div>
  )
}

export default SideBar
