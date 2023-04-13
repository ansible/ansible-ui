/* eslint-disable i18next/no-literal-string */
import {
  CheckCircleIcon,
  CircleIcon,
  ExclamationCircleIcon,
  PlayCircleIcon,
  PlayIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import * as d3 from 'd3';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

export interface WorkflowNode {
  id: string | number;
  title: string;
  subtitle: string;
  targetSuccess: number[];
  targetFailure: number[];
}

interface INode extends WorkflowNode {
  sourceSuccess: (string | number)[];
  sourceFailure: (string | number)[];
  x: number;
  y: number;
  width: number;
}

const nodeID = (node: unknown) => (node as INode).id;

type WorkflowNodeMap = Record<string | number, WorkflowNode | undefined>;
type NodeMap = Record<string | number, INode | undefined>;

const CircleDiameter = 20;
const CircleRadius = CircleDiameter / 2;
// const PaddingLeft = 10;
const NodePaddingLeft = 14;
const NodePaddingRight = 20;
const NodeHeight = 56;
const NodeHalfHeight = NodeHeight / 2;
const NodeWidth = 110;
const NodeColSpacing = 60;
const NodeRowSpacing = 20;
const ConnectorDiameter = 14;
const ConnectorRadius = ConnectorDiameter / 2;
const ConnectedRadius = ConnectorRadius - 3;

interface ILine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function Workflow(props: { workflowNodes: WorkflowNode[] }) {
  const { workflowNodes } = props;

  const [nodes, setNodes] = useState<INode[]>([]);

  // update nodes
  useLayoutEffect(() => {
    setNodes((nodes) => {
      // Create workflowNode lookup by id
      const workflowNodeMap: WorkflowNodeMap = {};
      for (const workflowNode of workflowNodes) workflowNodeMap[workflowNode.id] = workflowNode;

      // Remove deleted nodes
      nodes = nodes.filter((node) => workflowNodeMap[node.id] !== undefined);

      // Create node lookup by id
      const nodeMap: NodeMap = {};
      for (const node of nodes) nodeMap[node.id] = node;

      // Create link lookups by targetId
      const targetSourceSuccessMap: Record<number | string, (number | string)[] | undefined> = {};
      const targetSourceFailureMap: Record<number | string, (number | string)[] | undefined> = {};
      for (const workflowNode of workflowNodes) {
        for (const targetId of workflowNode.targetSuccess) {
          let sources = targetSourceSuccessMap[targetId];
          if (!sources) {
            sources = [];
            targetSourceSuccessMap[targetId] = sources;
          }
          sources.push(workflowNode.id);
        }
        for (const targetId of workflowNode.targetFailure) {
          let sources = targetSourceFailureMap[targetId];
          if (!sources) {
            sources = [];
            targetSourceFailureMap[targetId] = sources;
          }
          sources.push(workflowNode.id);
        }
      }

      // update nodes from workflowNodes
      for (const workflowNode of workflowNodes) {
        let node = nodeMap[workflowNode.id];
        if (!node) {
          // add new node
          node = {
            ...workflowNode,
            sourceSuccess: targetSourceSuccessMap[workflowNode.id] ?? [],
            sourceFailure: targetSourceFailureMap[workflowNode.id] ?? [],
            x: 0,
            y: 0,
            width: NodeWidth,
          };
          nodeMap[workflowNode.id] = node;
          nodes.push(node);
        } else {
          // update existing node
          Object.assign(node, workflowNode);
          node.sourceSuccess = targetSourceSuccessMap[workflowNode.id] ?? [];
          node.sourceFailure = targetSourceFailureMap[workflowNode.id] ?? [];
        }
      }

      return nodes;
    });
  }, [workflowNodes]);

  // layout nodes
  useLayoutEffect(() => {
    let row = 0;
    let col = 0;
    const nodeColumn: Record<number | string, number> = {};
    const columnWidths: Record<number | string, number> = {};
    const nodeRow: Record<number | string, number> = {};
    let nodeQueue = [...nodes];
    const addedNodes: Record<number | string, true> = {};
    while (nodeQueue.length) {
      const newQueue = [];
      const handledNodes = [];
      let node;
      while ((node = nodeQueue.shift())) {
        let allParentsAdded = true;
        for (const sourceId of node.sourceSuccess) {
          if (!addedNodes[sourceId]) {
            allParentsAdded = false;
            break;
          }
        }
        if (allParentsAdded) {
          for (const sourceId of node.sourceFailure) {
            if (!addedNodes[sourceId]) {
              allParentsAdded = false;
              break;
            }
          }
        }
        if (!allParentsAdded) {
          newQueue.push(node);
          continue;
        }
        nodeColumn[node.id] = col;
        handledNodes.push(node);
      }
      for (const node of handledNodes) {
        addedNodes[node.id] = true;
      }
      col++;
      nodeQueue = newQueue;
    }

    for (const node of nodes) {
      nodeRow[node.id] = row++;
      const column = nodeColumn[node.id];
      columnWidths[column] = Math.max(node.width, columnWidths[column] ?? NodeWidth);
    }

    // Determine column offsets
    let offset = 0;
    const columnOffsets: number[] = Object.values(columnWidths).map((width) => {
      const columnOffset = offset;
      offset += width;
      offset += NodeColSpacing;
      return columnOffset;
    });

    let changed = false;
    // Apply column offsets to nodes
    for (const node of nodes) {
      const x = columnOffsets[nodeColumn[node.id]] + CircleRadius + 0.5;
      if (node.x !== x) {
        changed = true;
        node.x = x;
      }
    }

    // Apply row offsets to nodes
    const columnCount = Object.keys(columnWidths).length;
    const columns: (INode | null)[][] = [];
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      columns.push(nodes.filter((node) => nodeColumn[node.id] === columnIndex));
    }
    for (let columnIndex = columnCount - 1; columnIndex >= 0; columnIndex--) {
      const columnNodes = columns[columnIndex];
      let row = 0;
      for (const node of columnNodes) {
        if (node) {
          let span = 1;
          for (const targetId of node.targetSuccess) {
            const targetColumn = nodeColumn[targetId];
            span = Math.max(span, targetColumn - columnIndex);
          }
          for (const targetId of node.targetFailure) {
            const targetColumn = nodeColumn[targetId];
            span = Math.max(span, targetColumn - columnIndex);
          }
          if (span !== 1) {
            for (let column = columnIndex + 1; column <= columnIndex + span - 1; column++) {
              columns[column].splice(row, 0, null);
            }
          }
        }
        row++;
      }
    }
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      const columnNodes = columns[columnIndex];
      let row = 0;
      for (const node of columnNodes) {
        if (node !== null) {
          const y = row * (NodeHeight + NodeRowSpacing) + NodeHalfHeight + 0.5;
          if (node.y !== y) {
            changed = true;
            node.y = y;
          }
        }
        row++;
      }
    }

    if (changed) {
      setNodes([...nodes]);
    }
  }, [nodes]);

  const [successLines, setSuccessLines] = useState<ILine[]>([]);
  const [failureLines, setFailureLines] = useState<ILine[]>([]);

  // update  lines
  useLayoutEffect(() => {
    // Create node lookup by id
    const nodeMap: NodeMap = {};
    for (const node of nodes) nodeMap[node.id] = node;

    const successLines = [];
    const failureLines = [];
    for (const node of nodes) {
      for (const targetId of node.targetSuccess) {
        const targetNode = nodeMap[targetId];
        if (targetNode) {
          let offset = 0;
          if (targetNode.sourceFailure.length > 0) {
            offset = 1;
          }
          successLines.push({
            x1: node.x + node.width,
            x2: targetNode.x,
            y1: node.y - (CircleRadius + 2),
            y2: targetNode.y - offset,
          });
        }
      }
      for (const targetId of node.targetFailure) {
        const targetNode = nodeMap[targetId];
        if (targetNode) {
          let offset = 0;
          if (targetNode.sourceSuccess.length > 0) {
            offset = 1;
          }
          failureLines.push({
            x1: node.x + node.width,
            x2: targetNode.x,
            y1: node.y + (CircleRadius + 2),
            y2: targetNode.y + offset,
          });
        }
      }
    }
    setSuccessLines(successLines);
    setFailureLines(failureLines);
  }, [nodes]);

  const svgRef = useRef(null);

  const width = useMemo(
    () => Math.ceil((d3.max(nodes.map((node) => node.x + node.width)) ?? 0) + CircleDiameter),
    [nodes]
  );

  const height = useMemo(
    () => Math.ceil((d3.max(nodes.map((node) => node.y)) ?? 0) + NodeHalfHeight),
    [nodes]
  );

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.attr('opacity', 0).transition().delay(10).duration(500).attr('opacity', 1);
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const rects = svg.select('#rects').selectAll('rect').data(nodes, nodeID);
    rects.join(
      (enter) =>
        enter
          .append('rect')
          .attr('x', (node) => node.x)
          .attr('y', (node) => node.y - NodeHalfHeight)
          .attr('rx', 8)
          .attr('width', (node) => node.width)
          .attr('height', NodeHeight),
      (update) => update.attr('x', (node) => node.x).attr('width', (node) => node.width)
    );

    // rects.on('mouseover', function (d) {
    //   const t = d3.select(this);

    //   t.transition()
    //     .duration(1000)
    //     .ease(d3.easeCubic)
    //     .attr('fill', 'var(--pf-global--BackgroundColor--300)');
    // });

    // rects.on('mouseleave', function (d) {
    //   d3.select(this).transition().duration(1000).ease(d3.easeCubic).attr('fill', 'unset');
    // });

    rects.on('mouseover', function () {
      d3.select(this).attr('fill', 'var(--pf-global--BackgroundColor--300)');
    });

    rects.on('mouseleave', function () {
      d3.select(this).attr('fill', 'unset');
    });

    // rects
    //   .transition()
    //   .attr('x', nodeX)
    //   .attr('y', (d) => `calc(${yScale(d.y) ?? 0}px - 1.5rem)`);

    const connectCircles = svg.select('#connector-circle').selectAll('circle').data(nodes, nodeID);
    connectCircles.join(
      (enter) => enter.append('circle').attr('r', ConnectorRadius),
      (update) => update.attr('cy', (node) => node.y).attr('cx', (node) => node.x)
    );

    const connectCircles2 = svg
      .select('#connector-circle2')
      .selectAll('circle')
      .data(nodes, nodeID);
    connectCircles2.join(
      (enter) => enter.append('circle').attr('r', ConnectorRadius),
      (update) => update.attr('cy', (node) => node.y).attr('cx', (node) => node.x)
    );

    const failureCircles = svg.select('#failure-circle').selectAll('circle').data(nodes, nodeID);
    failureCircles.join(
      (enter) => enter.append('circle').attr('r', 10),
      (update) => update.attr('cy', (node) => node.y + 12).attr('cx', (node) => node.x + node.width)
    );

    const successCircles = svg.select('#success-circle').selectAll('circle').data(nodes, nodeID);
    successCircles.join(
      (enter) => enter.append('circle').attr('r', 10),
      (update) => update.attr('cy', (node) => node.y - 12).attr('cx', (node) => node.x + node.width)
    );

    const connectIcons = svg.select('#connector-dot').selectAll('circle').data(nodes, nodeID);
    connectIcons.join(
      (enter) => enter.append('circle').attr('r', ConnectedRadius),
      (update) =>
        update
          .attr('fill', (node) =>
            node.sourceSuccess.length === 0
              ? node.sourceFailure.length === 0
                ? 'var(--pf-global--BorderColor--100)'
                : 'var(--pf-global--danger-color--100)'
              : node.sourceFailure.length === 0
              ? 'var(--pf-global--success-color--100)'
              : 'url(#always)'
          )
          .attr('cy', (node) => node.y)
          .attr('cx', (node) => node.x)
    );

    const failureIcons = svg.select('#failure-icon').selectAll('use').data(nodes, nodeID);
    failureIcons.join(
      (enter) => enter.append('use').attr('href', '#failure'),
      (update) =>
        update
          .attr('opacity', (node) => (node.targetFailure.length === 0 ? 0.5 : null))
          .attr('x', (node) => node.x + node.width - 8)
          .attr('y', (node) => node.y + 12 - 8)
    );

    const successIcons = svg.select('#success-icon').selectAll('use').data(nodes, nodeID);
    successIcons.join(
      (enter) => enter.append('use').attr('href', '#success'),
      (update) =>
        update
          .attr('opacity', (node) => (node.targetSuccess.length === 0 ? 0.5 : null))
          .attr('x', (node) => node.x + node.width - 8)
          .attr('y', (node) => node.y - 12 - 8)
    );

    const labels = svg.select('#labels').selectAll('text').data(nodes, nodeID);
    labels.join(
      (enter) =>
        enter
          .append('text')
          .attr('alignment-baseline', 'central')
          .text((node) => node.title)
          .each(function d(node) {
            const width = Math.max(
              NodeWidth,
              Math.ceil(
                d3.select<SVGTextElement, INode>(this).node()?.getComputedTextLength() ?? 0
              ) +
                NodePaddingLeft +
                NodePaddingRight
            );
            if (width !== node.width) {
              setNodes((nodes) => {
                const nodeIndex = nodes.findIndex((n) => n.id === node.id);
                nodes[nodeIndex] = { ...node, width: width };
                return [...nodes];
              });
            }
          })
          .attr('y', (node) => node.y - 9),
      (update) => update.attr('x', (node) => node.x + NodePaddingLeft)
    );

    const subtitles = svg.select('#subtitles').selectAll('text').data(nodes, nodeID);
    subtitles.join(
      (enter) =>
        enter
          .append('text')
          .attr('alignment-baseline', 'central')
          .text((node) => node.subtitle)
          .attr('y', (node) => node.y + 11),
      (update) => update.attr('x', (node) => node.x + NodePaddingLeft)
    );
  }, [nodes]);

  // failure lines
  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const paths = svg.select('#failure-lines').selectAll('path').data(failureLines);
    paths.join(
      (enter) => enter.append('path'),
      (update) =>
        update.attr('d', (line) => {
          const points: [number, number][] = [
            [line.x1 + CircleRadius, line.y1],
            [line.x2 - NodeColSpacing + CircleRadius + 1, line.y1],
            [line.x2 - ConnectorRadius - 1, line.y2],
            [line.x2 - ConnectorRadius, line.y2],
          ];
          return curve(points);
        })
    );
  }, [failureLines]);

  // success lines
  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const paths = svg.select('#success-lines').selectAll('path').data(successLines);
    paths.join(
      (enter) => enter.append('path'),
      (update) =>
        update.attr('d', (line) => {
          const points: [number, number][] = [
            [line.x1 + CircleRadius, line.y1],
            [line.x2 - NodeColSpacing + CircleRadius + 1, line.y1],
            [line.x2 - ConnectorRadius - 1, line.y2],
            [line.x2 - ConnectorRadius, line.y2],
          ];
          return curve(points);
        })
    );
  }, [successLines]);

  return (
    <svg ref={svgRef} width={width} height={height}>
      <defs>
        <ExclamationCircleIcon id="failure" />
        <CheckCircleIcon id="success" />
        <CircleIcon id="circle" />
        <PlayIcon id="add" />
        <PlusCircleIcon id="add" />
        <PlayCircleIcon id="play" />
        <TrashIcon id="trash" />
        <linearGradient id="always" gradientTransform="rotate(90)">
          <stop offset="50%" stopColor="var(--pf-global--success-color--100)" />
          <stop offset="50%" stopColor="var(--pf-global--danger-color--100)" />
        </linearGradient>
      </defs>

      <g
        id="connector-circle"
        // color="var(--pf-global--Color--100)"
        fill="var(--pf-global--BackgroundColor--100)"
        stroke="var(--pf-global--BorderColor--100)"
        strokeWidth="2px"
      />
      <g
        id="rects"
        fill="var(--pf-global--BackgroundColor--100)"
        stroke="var(--pf-global--BorderColor--100)"
        strokeWidth="1px"
      />
      <g
        id="subtitles"
        fill="var(--pf-global--Color--100)"
        pointerEvents="none"
        opacity={0.7}
        fontSize={12}
      />
      <g
        id="labels"
        fill="var(--pf-global--Color--100)"
        pointerEvents="none"
        fontSize={16}
        fontFamily="sans-serif"
      />
      <g
        id="success-circle"
        fill="var(--pf-global--BackgroundColor--100)"
        stroke="var(--pf-global--BorderColor--100)"
        strokeWidth="1px"
      />
      <g
        id="failure-circle"
        fill="var(--pf-global--BackgroundColor--100)"
        stroke="var(--pf-global--BorderColor--100)"
        strokeWidth="1px"
      />
      <g
        id="connector-circle2"
        // color="var(--pf-global--Color--100)"
        fill="var(--pf-global--BackgroundColor--100)"
        // stroke="var(--pf-global--BorderColor--100)"
        // strokeWidth="1px"
      />
      <g
        id="connector-dot"
        // color="var(--pf-global--success-color--100)"
        // fill="var(--pf-global--BorderColor--100)"
        // fill="url('#always')"
      />

      <g id="failure-icon" color="var(--pf-global--danger-color--100)" />
      <g id="success-icon" color="var(--pf-global--success-color--100)" />
      <g
        id="failure-lines"
        fill="none"
        stroke="var(--pf-global--danger-color--100)"
        strokeWidth={2}
      />
      <g
        id="success-lines"
        fill="none"
        stroke="var(--pf-global--success-color--100)"
        strokeWidth={2}
      />
    </svg>
  );
}

const curve = d3.line().curve(d3.curveMonotoneX);
