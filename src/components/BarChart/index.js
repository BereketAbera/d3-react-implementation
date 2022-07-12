import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import useWindowResize from '../../hooks/useWindowResize'
import revenuesData from './revenues.json'

export default function BarChart({ ...props }) {
  const canvas = useRef()

  const [windowSize] = useWindowResize()

  const t = () => d3.transition().duration(500)

  useEffect(() => {
    const margin = { top: 20, right: 35, bottom: 120, left: 100 }
    const width = canvas?.current?.clientWidth - margin.left - margin.right
    const height = canvas?.current?.clientHeight - margin.top - margin.bottom

    let color = d3
      .scaleOrdinal()

      .range(d3.schemePaired)

    let xScale = d3
      .scaleBand()
      .range([0, width])
      .paddingInner(0.2)
      .paddingOuter(0.3)

    let yScale = d3.scaleLinear().range([height, 0])

    let svg = d3
      .select(canvas.current)
      .append('svg')
      .attr('width', width + margin['left'] + margin['right'])
      .attr('height', height + margin['top'] + margin['bottom'])

    let g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    let xAxisGroup = g.append('g')
    let yAxisGroup = g.append('g')

    let yLabel = g
      .append('text')
      .attr('y', -60)
      .attr('x', -height / 2)
      .attr('fill', '#ccc')
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90)`)

    let count = 0

    const update = (data, activeField) => {
      color = color.domain(data.map((building) => building.month))
      xScale = xScale.domain(data.map((b) => b.month))
      yScale = yScale.domain([
        0,
        d3.max(data, (b) => parseFloat(b[activeField])),
      ])

      let xAxisCall = d3.axisBottom(xScale)
      let yAxisCall = d3.axisLeft(yScale)

      xAxisGroup
        .call(xAxisCall)
        .attr('transform', `translate(0, ${height})`)
        .selectAll('text')
        .attr('y', '10')
        .attr('x', '-5')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-40)')
        .attr('font-size', '12px')

      yAxisGroup.transition(t()).call(yAxisCall)

      let bars = g.selectAll('rect').data(data, (d) => d.month)

      bars
        .exit()
        .attr('fill', '#E34A44')
        .transition(t())
        .attr('y', yScale(0))
        .attr('height', 0)
        .remove()

      bars
        .transition(t())
        .attr('width', xScale.bandwidth)
        .attr('height', (d) => {
          return height - yScale(parseFloat(d[activeField]))
        })
        .attr('x', (d, index) => {
          return xScale(d.month)
        })
        .attr('y', (d) => yScale(parseFloat(d[activeField])))

      bars
        .enter()
        .append('rect')
        .attr('width', xScale.bandwidth)
        .attr('x', (d, index) => {
          return xScale(d.month)
        })
        .attr('fill', '#aaa')
        .attr('y', yScale(0))
        .attr('height', 0)
        .merge(bars)
        // merged new and existing bar attributes
        .transition(t())
        .attr('width', xScale.bandwidth)
        .attr('height', (d) => {
          return height - yScale(parseFloat(d[activeField]))
        })
        .attr('x', (d, index) => {
          return xScale(d.month)
        })
        .attr('y', (d) => yScale(parseFloat(d[activeField])))

      yLabel.text(activeField)
    }

    update(revenuesData, 'revenue')

    let barUpdateInterval = d3.interval(() => {
      count++
      update(
        count % 2 === 0 ? revenuesData : revenuesData.slice(1),
        count % 2 === 0 ? 'revenue' : 'profit',
      )
    }, 1000)

    return () => {
      d3.selectAll('#bar-chart > svg').remove()
      d3.selectAll('#bar-chart > g > *').remove()
      barUpdateInterval.stop()
    }
  }, [windowSize])

  return (
    <div className="w-full" {...props}>
      <h1 className="font-extrabold text-lg space-x-6 uppercase text-gray-200 p-4 mb-4">
        Bar Cart
      </h1>
      <div className="flex">
        <div
          ref={canvas}
          className="flex-1"
          style={{ minHeight: '80vh' }}
          id="bar-chart"
        ></div>
        <div className="flex-2"></div>
      </div>
    </div>
  )
}
