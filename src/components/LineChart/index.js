import React, { useEffect, useRef, useState } from 'react'
import useWindowResize from '../../hooks/useWindowResize'
import * as d3 from 'd3'
import coins from './coins.json'
import moment from 'moment'
import { Form } from 'react-bootstrap'

let gGraphType = 'price_usd'
let gCoinType = 'bitcoin'
let gStatus = 'not_applied'

let getGraphTypeText = {
  '24h_vol': '24 Hour Vol',
  market_cap: 'Market Cap',
  price_usd: 'Price In USD',
}

const t = () => d3.transition().duration(500)

export default function LineChart({ ...props }) {
  const canvas = useRef()

  const [windowSize] = useWindowResize()

  const [graphType, setGraphType] = useState('price_usd')
  const [coinType, setCoinType] = useState('bitcoin')

  useEffect(() => {
    gGraphType = graphType
    gCoinType = coinType
    gStatus = 'not_applied'
  }, [graphType, coinType])

  useEffect(() => {
    gGraphType = graphType
    gCoinType = coinType
    const margin = { top: 20, right: 35, bottom: 120, left: 100 }
    const width = canvas?.current?.clientWidth - margin.left - margin.right
    const height = canvas?.current?.clientHeight - margin.top - margin.bottom
    const formatLargeNumber = d3.format('.2s')

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

    let xScale = d3.scaleTime().range([0, width])
    let yScale = d3.scaleLinear().range([height, 0])

    let d3Interval = d3.interval(() => {
      if (gStatus !== 'applied') {
        update(coins)
      }

      gStatus = 'applied'
    }, 1000)

    let line = d3.line()

    let path = g
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', 'gray')
      .attr('stroke-width', '2px')

    let infoG = g.append('g')
    let rect = infoG.append('rect').attr('fill', '#22222200')

    let vLine = infoG
      .append('line')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3')
    let hLine = infoG
      .append('line')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3')
    let pCircle = infoG.append('circle').attr('fill', '#fff')
    let infoText = infoG
      .append('text')
      .attr('fill', '#ccc')
      .attr('font-size', '12px')
    let yLabel = g
      .append('text')
      .attr('fill', '#ccc')
      .attr('font-size', '16px')
      .attr('x', -(height / 2 - 30))
      .attr('y', -40)
      .attr('text-anchor', 'end')
      .attr('transform', `rotate(-90)`)
    let xLabel = g
      .append('text')
      .attr('fill', '#ccc')
      .attr('font-size', '16px')
      .attr('x', width / 2 - 80)
      .attr('y', height + 40)

    let update = (coins) => {
      let data = coins[gCoinType]
      data = data.filter((d) => d[gGraphType] && d.date)
      xScale = xScale.domain([
        d3.min(data, (d) => moment(d.date, 'D/M/YYYY')),
        d3.max(data, (d) => moment(d.date, 'D/M/YYYY')),
      ])

      yScale = yScale.domain([0, d3.max(data, (d) => parseInt(d[gGraphType]))])

      let xAxisCall = d3
        .axisBottom(xScale)
        .tickValues([
          moment('1/1/2014', 'D/M/YYYY'),
          moment('1/1/2015', 'D/M/YYYY'),
          moment('1/1/2016', 'D/M/YYYY'),
          moment('1/1/2017', 'D/M/YYYY'),
        ])
        .tickFormat((value) => {
          return `${moment(value).format('YYYY')}`
        })
      let yAxisCall = d3.axisLeft(yScale).tickFormat((value) => {
        if (['24h_vol', 'market_cap'].includes(gGraphType))
          return formatLargeNumber(value).replace('G', 'B')
        return value
      })

      xAxisGroup
        .attr('transform', `translate(0, ${height})`)
        .transition(t())
        .call(xAxisCall)

      yAxisGroup.transition(t()).call(yAxisCall)

      line = line
        .x((d) => xScale(moment(d.date, 'D/M/YYYY')))
        .y((d) => yScale(parseInt(d[gGraphType])))

      path.transition(t()).attr('d', line(data))

      yLabel.text(getGraphTypeText[gGraphType])
      xLabel.text('Date')

      g.on('mouseenter', (e) => {
        infoG.style('display', 'inherit')
      })

      g.on('mouseleave', (e) => {
        infoG.style('display', 'none')
      })

      rect
        .attr('x', 1)
        .attr('y', 0)
        .attr('height', height)
        .attr('width', width)
        .on('mousemove', (e) => {
          let coordinates = d3.pointer(e)
          let [x, y] = coordinates
          data.forEach((d) => {
            if (d.date === moment(xScale.invert(x)).format('D/M/YYYY')) {
              vLine
                .attr('y1', height - 0)
                .attr('x1', x)
                .attr('y2', yScale(parseInt(d[gGraphType])))
                .attr('x2', x)
              hLine
                .attr('y1', yScale(parseInt(d[gGraphType])))
                .attr('x1', 0)
                .attr('y2', yScale(parseInt(d[gGraphType])))
                .attr('x2', x)
              pCircle
                .attr('cx', x)
                .attr('cy', yScale(parseInt(d[gGraphType])))
                .attr('r', 3)

              infoText
                .attr('x', x - 100)
                .attr('y', yScale(parseInt(d[gGraphType])) - 8)
                .text(
                  `(${
                    ['24h_vol', 'market_cap'].includes(gGraphType)
                      ? formatLargeNumber(d[gGraphType]).replace('G', 'B')
                      : d[gGraphType]
                  },${d.date})`,
                )
            }
          })
        })
    }

    update(coins, gCoinType)

    return () => {
      d3.selectAll('#bar-chart > svg').remove()
      d3.selectAll('#bar-chart > g > *').remove()
      d3Interval?.stop()
    }
  }, [windowSize])

  return (
    <div className="w-full ml-16 px-2" {...props}>
      <h1 className="font-extrabold text-lg space-x-6 uppercase text-gray-200 p-4 mb-4">
        Line Cart
      </h1>
      <div className="flex flex-col">
        <div
          ref={canvas}
          className="flex-1"
          style={{ minHeight: '80vh' }}
          id="bar-chart"
        ></div>
        <div className="flex-2 border border-gray-300 p-2 -mt-6 flex justify-center">
          <Form.Select
            className="mx-2 max-w-xs"
            value={graphType}
            onChange={(e) => setGraphType(e.target.value)}
          >
            <option value={'price_usd'}>Price in Dollars</option>
            <option value={'market_cap'}>Market Capitalization</option>
            <option value={'24h_vol'}>24 Hour Trading Volume</option>
          </Form.Select>
          <Form.Select
            className="mx-2 max-w-xs"
            value={coinType}
            onChange={(e) => setCoinType(e.target.value)}
          >
            <option value={'bitcoin'}>Bitcoin</option>
            <option value={'bitcoin_cash'}>Bitcoin Cash</option>
            <option value={'ethereum'}>Ethereum</option>
            <option value={'litecoin'}>Lite Coin</option>
            <option value={'ripple'}>Ripple</option>
          </Form.Select>
        </div>
      </div>
    </div>
  )
}
