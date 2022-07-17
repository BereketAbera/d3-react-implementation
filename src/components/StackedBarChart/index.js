import React, { useEffect, useRef } from 'react';
import useWindowResize from '../../hooks/useWindowResize';
import * as d3 from 'd3';

import states from './states.json';

export default function StackedBarChart({ ...props }) {
  const canvas = useRef();

  const [windowSize] = useWindowResize();
  let stateAbbr = states.map((s) => s.name);
  //   let firstState = states[0];
  let newStates = [];
  //   Object.keys(firstState).forEach((key) => {
  //     let obj = {};
  //     if (key !== 'name') {
  //       states.forEach((s) => {
  //         obj['name'] = key;
  //         obj[s.name] = s[key];
  //       });
  //       newStates.push(obj);
  //     }
  //   });

  let columns = [
    '<10',
    '10-19',
    '20-29',
    '30-39',
    '40-49',
    '50-59',
    '60-69',
    '70-79',
    '≥80',
  ];

  const flattenStack = (stack, states) => {
    let fStack = [];
    stack.forEach((st, index) => {
      st.forEach((s) => {
        let obj = {
          ...s,
          col: columns[index],
          st: s['data']['name'],
        };
        fStack.push(obj);
      });
    });

    return fStack;
  };

  useEffect(() => {
    const margin = { top: 20, right: 35, bottom: 120, left: 100 };
    const width = canvas?.current?.clientWidth - margin.left - margin.right;
    const height = canvas?.current?.clientHeight - margin.top - margin.bottom;

    let svg = d3
      .select(canvas.current)
      .append('svg')
      .attr('width', width + margin['left'] + margin['right'])
      .attr('height', height + margin['top'] + margin['bottom']);

    let g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    let stackGen = d3.stack().keys(columns);
    let stack = stackGen(states);
    let flatStack = flattenStack(stack, states);

    let color = d3.scaleOrdinal().range(d3.schemeSpectral[9]).domain(columns);

    let sums = {};
    states.map((st, index) => {
      let sum = 0;
      columns.forEach((c) => {
        sum += st[c];
      });
      sums[st.name] = {
        sum,
        index,
      };
    });

    let xScale = d3
      .scaleBand()
      .range([0, width])
      .domain(stateAbbr.sort((a, b) => sums[b].sum - sums[a].sum))
      .paddingInner(0.2)
      .paddingOuter(0.3);
    let xAxisGroup = g.append('g');

    let yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([
        0,
        d3.max(states, (s) => {
          let sum = 0;
          columns.forEach((c) => {
            sum += s[c];
          });
          return sum;
        }),
      ]);
    let yAxisGroup = g.append('g');

    let xAxisCall = d3.axisBottom(xScale).tickValues(stateAbbr);
    let yAxisCall = d3.axisLeft(yScale);

    let area = d3
      .area()
      .y0((d) => {
        return yScale(d[0]);
      })
      .y1((d) => {
        return yScale(d[1]);
      })
      .x((d) => {
        return xScale(d['data']['name']);
      });

    xAxisGroup.call(xAxisCall).attr('transform', `translate(0, ${height})`);

    yAxisGroup.call(yAxisCall);

    let barRects = g.selectAll('rect').data(flatStack);

    barRects
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => yScale(d[0]) - yScale(d[1]))
      .attr('x', (d) => xScale(d['data']['name']))
      .attr('y', (d) => yScale(d[1]))
      .attr('fill', (d) => color(d['col']));

    barRects
      .enter()
      .append('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => yScale(d[0]) - yScale(d[1]))
      .attr('x', (d) => xScale(d['data']['name']))
      .attr('y', (d) => yScale(d[1]))
      .attr('fill', (d) => color(d['col']));
    // let path = g
    //   .append('path')
    //   .attr('fill', 'none')
    //   .attr('stroke', 'gray')
    //   .attr('stroke-width', '2px')
    //   .attr('d', area(stack[0]));

    return () => {
      d3.selectAll('#bar-chart > svg').remove();
      d3.selectAll('#bar-chart > g > *').remove();
    };
  }, [windowSize]);

  return (
    <div className="w-full ml-16 px-2" {...props}>
      <h1 className="font-extrabold text-lg space-x-6 uppercase text-gray-200 p-4 mb-4">
        Stacked Bar Chart
      </h1>
      <div className="flex flex-col">
        <div
          ref={canvas}
          className="flex-1"
          style={{ minHeight: '80vh' }}
          id="bar-chart"
        ></div>
      </div>
    </div>
  );
}
