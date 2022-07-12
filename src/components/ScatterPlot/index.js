import React, { useEffect, useRef, useState } from 'react'
import * as d3Module from 'd3'
import d3tip from 'd3-tip'
import useWindowResize from '../../hooks/useWindowResize'
import countriesData from './data.json'
import * as ReactDOMServer from 'react-dom/server'
import { Button, Form } from 'react-bootstrap'

const d3 = { ...d3Module, tip: d3tip }
let gVisStatus = 'applied'
let gShowCountry = 'all'
let gSelectedYear = ''

//capitalize all words of a string.
function capitalizeWords(string) {
  return string.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase()
  })
}

export default function ScatterPlot({ ...props }) {
  const canvas = useRef()

  const continents = ['europe', 'asia', 'americas', 'africa']
  const [windowSize] = useWindowResize()
  const [visStatus, setVisStatus] = useState('play')
  const [showCountry, setShowCountry] = useState('all')
  const [selectedYear, setSelectedYear] = useState('')

  useEffect(() => {
    gVisStatus = visStatus
  }, [visStatus])

  useEffect(() => {
    gSelectedYear = selectedYear
  }, [selectedYear])

  useEffect(() => {
    gShowCountry = showCountry
  }, [showCountry])

  const t = () => d3.transition().duration(500)

  useEffect(() => {
    const margin = { top: 20, right: 35, bottom: 120, left: 100 }
    const width = canvas?.current?.clientWidth - margin.left - margin.right
    const height = canvas?.current?.clientHeight - margin.top - margin.bottom
    const formatCurrency = d3.format('$')
    const formatLargeNumber = d3.format('.2s')

    let color = d3.scaleOrdinal().range(d3.schemePaired).domain(continents)

    let radiusScale = d3.scaleLinear()

    let xScale = d3.scaleLog().range([0, width])

    let yScale = d3.scaleLinear().range([height, 0])

    let svg = d3
      .select(canvas.current)
      .append('svg')
      .attr('width', width + margin['left'] + margin['right'])
      .attr('height', height + margin['top'] + margin['bottom'])

    let g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    let tip = d3
      .tip()
      .attr('class', 'd3-tip')
      .html((e, d) => {
        return ReactDOMServer.renderToString(
          <div className="py-2 pr-4 bg-gray-300 text-gray-800 rounded-lg">
            {Object.keys(d).map((key) => {
              return (
                <div key={key} className="my-1 bg-gray-300">
                  <span className="font-bold text-gray-900 inline-block mx-2 bg-gray-300">
                    {capitalizeWords(key.replace('_', ' '))}:
                  </span>
                  <span className="italic text-gray-700 inline-block bg-gray-300">
                    {key === 'income'
                      ? formatCurrency(d[key])
                      : key === 'population'
                      ? formatLargeNumber(d[key])
                      : key === 'continent'
                      ? capitalizeWords(d[key])
                      : d[key]}
                  </span>
                </div>
              )
            })}
          </div>,
        )
      })
    g.call(tip)

    let xAxisGroup = g.append('g')
    let yAxisGroup = g.append('g')

    let legendGroup = g
      .append('g')
      .attr('transform', `translate(${width - 70}, ${height - 130})`)

    continents.forEach((continent, index) => {
      let legend = legendGroup
        .append('g')
        .attr('transform', `translate(0, ${index * 20})`)
      legend
        .append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', color(continent))
      legend
        .append('text')
        .text(continent)
        .attr('fill', '#aaa')
        .attr('x', 15)
        .attr('y', 10)
        .style('text-transform', 'capitalize')
    })

    g.append('text')
      .attr('y', -60)
      .attr('x', -height / 2)
      .attr('fill', '#ccc')
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90)`)
      .text('Life Expectancy (Years)')

    g.append('text')
      .attr('y', height + 50)
      .attr('x', width / 2 - 100)
      .attr('fill', '#ccc')
      .attr('font-size', '24px')
      .text('GDP Per Capital ($)')

    let yearLabel = g
      .append('text')
      .attr('y', height - 10)
      .attr('x', width - 95)
      .attr('fill', '#ccc')
      .attr('font-size', '45px')

    let count = 0

    const update = (allData, index = 0) => {
      console.log(index)
      let data = allData[index]?.countries || []
      data =
        gShowCountry === 'all'
          ? data
          : data.filter((d) => d.continent === gShowCountry)
      let year = allData[index]?.year
      yearLabel.text(year)
      data = data.filter((c) => c.income && c.life_exp)

      xScale = xScale.domain([40, 200000])
      yScale = yScale.domain([0, 90])
      radiusScale = radiusScale
        .domain([0, d3.max(data, (d) => d.population)])
        .range([7, d3.max([30, d3.max(data, (d) => d.population / 25000000)])])

      let xAxisCall = d3
        .axisBottom(xScale)
        .tickValues([400, 4000, 40000])
        .tickFormat((domainValue) => `$${domainValue}`)
      let yAxisCall = d3.axisLeft(yScale)

      xAxisGroup.call(xAxisCall).attr('transform', `translate(0, ${height})`)
      // .selectAll('text')
      // .attr('y', '10')
      // .attr('x', '-5')
      // .attr('text-anchor', 'end')
      // .attr('transform', 'rotate(-40)')
      // .attr('font-size', '12px')

      yAxisGroup.call(yAxisCall)

      let circles = g.selectAll('circle').data(data, (d) => d.country)

      circles.exit().remove()

      circles
        .attr('cy', (d) => yScale(parseInt(d.life_exp)))
        .attr('cx', (d, index) => {
          return xScale(d.income)
        })
        .attr('r', (d) => radiusScale(d.population, 2))

      circles
        .enter()
        .append('circle')
        .attr('cx', (d, index) => {
          return xScale(d.income)
        })
        .attr('fill', (d) => color(d.continent))
        .attr('cy', (d) => yScale(parseInt(d.life_exp)))
        .attr('r', (d) => radiusScale(d.population, 2))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .merge(circles)
    }

    update(countriesData)

    let barUpdateInterval

    let d3Interval = d3.interval(() => {
      if (gSelectedYear && gSelectedYear >= 1800 && gSelectedYear <= 2014) {
        count = gSelectedYear - 1800
        clearInterval(barUpdateInterval)
        update(countriesData, count)
      } else {
        if (gVisStatus === 'pause') {
          clearInterval(barUpdateInterval)
        } else if (gVisStatus === 'play') {
          barUpdateInterval = setInterval(() => {
            if (count < countriesData.length) count++
            else count = 0
            update(countriesData, count)
          }, 100)
        }
        if (gVisStatus === 'reset') {
          if (barUpdateInterval) clearInterval(barUpdateInterval)
          count = 0
          barUpdateInterval = setInterval(() => {
            if (count < countriesData.length) count++
            else count = 0
            update(countriesData, count)
          }, 100)
        }
        gVisStatus = 'applied'
      }
    }, 100)

    return () => {
      d3.selectAll('#bar-chart > svg').remove()
      d3.selectAll('#bar-chart > g > *').remove()
      d3Interval.stop()
    }
  }, [windowSize])

  return (
    <div className="w-full ml-16 px-2" {...props}>
      <h1 className="font-extrabold text-lg space-x-6 uppercase text-gray-200 p-4 mb-4">
        Scatter Plot
      </h1>
      <div className="flex flex-col">
        <div
          ref={canvas}
          className="flex-1"
          style={{ minHeight: '80vh' }}
          id="bar-chart"
        ></div>
        <div className="flex-2 border border-gray-300 p-2 -mt-6 flex justify-center">
          <Button
            className="mx-2"
            onClick={() => {
              setVisStatus(
                visStatus === 'play' || visStatus === 'reset'
                  ? 'pause'
                  : 'play',
              )
            }}
          >
            {visStatus === 'play' || visStatus === 'reset' ? 'Stop' : 'Play'}
          </Button>
          <Button
            className="mx-2"
            onClick={() => {
              setSelectedYear('')
              setVisStatus('reset')
            }}
          >
            Reset
          </Button>
          <Form.Select
            className="mx-2 max-w-xs"
            value={showCountry}
            onChange={(e) => setShowCountry(e.target.value)}
          >
            <option value={'all'}>All</option>
            {continents.map((continent) => {
              return (
                <option key={continent} value={continent}>
                  {capitalizeWords(continent)}
                </option>
              )
            })}
          </Form.Select>
          <Form.Control
            value={selectedYear}
            onChange={(e) => {
              let v = e.target.value
              if (v) setSelectedYear(parseInt(v))
              else setSelectedYear(v)
            }}
            type="number"
            placeholder="Enter Year"
          ></Form.Control>
        </div>
      </div>
    </div>
  )
}
