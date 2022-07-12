import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
// import PropTypes from 'prop-types'

const data = [43, 23, 5, 3, 2, 34, 64, 8]

function Slack({ sideBarOpen, ...props }) {
  const canvas = useRef()

  console.log(sideBarOpen)

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  useEffect(() => {
    window.addEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    initializeGraph()
    return () => {
      d3.selectAll('#slack-chart > svg').remove()
      d3.selectAll('#slack-chart > g > *').remove()
    }
  }, [windowSize, sideBarOpen])

  const handleResize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }

  const initializeGraph = () => {
    const margin = { top: 20, right: 35, bottom: 25, left: 20 }
    const width = canvas?.current?.clientWidth - margin.left - margin.right
    const height = canvas?.current?.clientHeight - margin.top - margin.bottom

    let svg = d3
      .select('#slack-chart')
      .append('svg')
      .attr('width', width + margin['left'] + margin['right'])
      .attr('height', height + margin['top'] + margin['bottom'])
      //   .call(responsively)
      .append('g')
      .attr('transform', `translate(${margin['left']},  ${margin['top']})`)

    // find data range
    const xMin = 0
    const xMax = data.length + 5

    const yMin = Math.min(
      d3.min(data, (d) => {
        return 0
      }),
    )
    const yMax = Math.max(
      d3.max(data, (d) => {
        return d
      }),
    )

    // scales for the charts
    const xScale = d3.scaleTime().domain([xMin, xMax]).range([0, width])
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height, 0])

    svg
      .append('g')
      .attr('id', 'xAxis')
      .attr('transform', `translate(-18, ${height})`)
      .call(d3.axisBottom(xScale))
    svg
      .append('g')
      .call(d3.axisRight(yScale))
      .attr('id', 'yAxis')
      .attr('transform', `translate(${width - 18}, 0)`)

    d3.axisBottom(xScale)

    d3.axisRight(yScale)

    let stackBar = svg
      .selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => {
        return xScale(i + 1)
      })
      .attr('y', (d) => {
        return yScale(d)
      })
      .attr('fill', (d, i) => {
        return '#30AD9D'
      })
      .attr('width', 10)
      .attr('height', (d) => {
        return height - yScale(d)
      })
  }

  //   const responsively = (svg) => {
  //     var container = d3.select(svg.node()?.parentNode),
  //       width = parseInt(svg.style('width')),
  //       height = parseInt(svg.style('height')),
  //       aspect = width / height

  //     svg
  //       .attr('viewBox', '0 0 ' + width + ' ' + height)
  //       .attr('perserveAspectRatio', 'xMinYMid')
  //       .call(resize)

  //     d3.select(window).on('resize.' + container.attr('id'), resize)

  //     function resize() {
  //       var targetWidth = parseInt(container.style('width'))
  //       svg.attr('width', targetWidth)
  //       svg.attr('height', Math.round(targetWidth / aspect))
  //     }
  //   }

  return (
    <div {...props}>
      <h1 className="font-extrabold text-lg space-x-6 uppercase text-gray-200 p-4 mb-4">
        Slack
      </h1>
      <div
        ref={canvas}
        className="w-full"
        style={{ minHeight: '80vh' }}
        id="slack-chart"
      ></div>
    </div>
  )
}

// Slack.propTypes = {}

export default Slack
