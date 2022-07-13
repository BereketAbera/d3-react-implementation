import React, { useEffect, useRef } from 'react';
import useWindowResize from '../../hooks/useWindowResize';
import * as d3 from 'd3';
import './hierarchicalEdge.css';

import flare from './flare.json';

export default function HierarchicalEdge({ ...props }) {
  const canvas = useRef();
  const [windowSize] = useWindowResize();

  useEffect(() => {
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = canvas?.current?.clientWidth - margin.left - margin.right;
    const height = canvas?.current?.clientHeight - margin.top - margin.bottom;
    let diameter = width,
      radius = diameter / 2,
      innerRadius = radius - 120;

    let cluster = d3.cluster().size([360, innerRadius]);

    let line = d3
      .lineRadial()
      .curve(d3.curveBundle.beta(0.85))
      .radius(function (d) {
        return d.y;
      })
      .angle(function (d) {
        return (d.x / 180) * Math.PI;
      });

    let svg = d3
      .select(canvas.current)
      .append('svg')
      .attr('width', width + margin['left'] + margin['right'])
      .attr('height', height + margin['top'] + margin['bottom']);

    let g = svg
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left + radius}, ${margin.top + radius})`,
      );

    let link = g.append('g').selectAll('.link');
    let node = g.append('g').selectAll('.node');

    function main() {
      var root = packageHierarchy(flare).sum(function (d) {
        return d.size;
      });

      cluster(root);

      //   console.log(root);

      link = link
        .data(packageImports(root.leaves()))
        .enter()
        .append('path')
        .each(function (d) {
          d.source = d[0];
          d.target = d[d.length - 1];
        })
        .attr('class', 'link')
        .attr('d', line);

      node = node
        .data(root.leaves())
        .enter()
        .append('text')
        .attr('class', 'node')
        .attr('dy', '0.31em')
        .attr('transform', function (d) {
          return (
            'rotate(' +
            (d.x - 90) +
            ')translate(' +
            (d.y + 8) +
            ',0)' +
            (d.x < 180 ? '' : 'rotate(180)')
          );
        })
        .attr('text-anchor', function (d) {
          return d.x < 180 ? 'start' : 'end';
        })
        .text(function (d) {
          return d.data.key;
        })
        .on('mouseover', mouseovered)
        .on('mouseout', mouseouted);
    }

    function mouseovered(e) {
      let d = e['srcElement']['__data__'];
      node.each(function (n) {
        n.target = n.source = false;
      });

      link
        .classed('link--target', (l) => {
          //   console.log(l);
          if (l.target === d) return (l.source.source = true);
        })
        .classed('link--source', (l) => {
          if (l.source === d) return (l.target.target = true);
        })
        .filter((l) => {
          return l.target === d || l.source === d;
        })
        .raise();

      node
        .classed('node--target', (n) => {
          return n.target;
        })
        .classed('node--source', (n) => {
          return n.source;
        });
    }

    function mouseouted(d) {
      link.classed('link--target', false).classed('link--source', false);

      node.classed('node--target', false).classed('node--source', false);
    }

    // Lazily construct the package hierarchy from class names.
    function packageHierarchy(classes) {
      let map = {};

      const find = (name, data) => {
        let node = map[name];
        let i;
        if (!node) {
          node = map[name] = data || { name: name, children: [] };
          if (name.length) {
            node.parent = find(name.substring(0, (i = name.lastIndexOf('.'))));
            node.parent.children.push(node);
            node.key = name.substring(i + 1);
          }
        }
        return node;
      };

      classes.forEach((d) => {
        find(d.name, d);
      });

      console.log(map[''], map);
      return d3.hierarchy(map['']);
    }

    // Return a list of imports for the given array of nodes.
    function packageImports(nodes) {
      let map = {},
        imports = [];

      // Compute a map from name to node.
      nodes.forEach(function (d) {
        map[d.data.name] = d;
      });

      // For each import, construct a link from the source to target node.
      nodes.forEach(function (d) {
        if (d.data.imports)
          d.data.imports.forEach(function (i) {
            imports.push(map[d.data.name].path(map[i]));
          });
      });

      return imports;
    }

    main();

    return () => {
      d3.selectAll('#hierarchicalEdge > svg').remove();
      d3.selectAll('#hierarchicalEdge > g > *').remove();
    };
  }, [windowSize]);

  return (
    <div className="w-full ml-16 px-2" {...props}>
      <h1 className="font-extrabold text-lg space-x-6 uppercase text-gray-200 p-4 mb-4">
        Hierarchical Edge
      </h1>
      <div className="flex flex-col">
        <div
          ref={canvas}
          className="flex-1"
          style={{ minHeight: '80vh', aspectRatio: '1/1', minWidth: '1000px' }}
          id="hierarchicalEdge"
        ></div>
      </div>
    </div>
  );
}
