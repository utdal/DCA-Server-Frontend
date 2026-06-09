import React, { useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';

const MIN_CIRCLE_PAIR_COUNT = 20;
const RESIDUE_TRACE_NAME = 'Residue Points';
const CENTER_RESET_TRACE_NAME = 'Center Reset';

export const CirclePlot = ({ mappedDi, selectedDI, displayedDI }) => {
    const radius1 = 1.5;
    const radius2 = 1.7;

    const edgeIndexes = useMemo(() => {
        if (!mappedDi || !mappedDi.mapped_di) return [];

        if (displayedDI && displayedDI.length) return displayedDI;
        if (selectedDI && selectedDI.length) return selectedDI;

        const pairCount = Math.min(mappedDi.mapped_di.length, MIN_CIRCLE_PAIR_COUNT);
        return Array.from({ length: pairCount }, (_, index) => index);
    }, [displayedDI, mappedDi, selectedDI]);

    const edges = useMemo(() => {
        if (!mappedDi || !mappedDi.mapped_di) return [];
        return edgeIndexes.map(index => mappedDi.mapped_di[index]).filter(Boolean);
    }, [edgeIndexes, mappedDi]);
    

    return (
        <div>
            
            <ChordDiagram edges={edges} radius1={radius1} radius2={radius2} />
        </div>
    );
};

export const ChordDiagram = ({ edges, radius1, radius2 }) => {
    const [hoveredResidue, setHoveredResidue] = useState(null);
    const [pinnedResidue, setPinnedResidue] = useState(null);

    const residueIds = useMemo(() => {
        return Array.from(new Set(edges.flatMap(([i, j]) => [i, j]))).sort((a, b) => a - b);
    }, [edges]);

    const residueSet = useMemo(() => new Set(residueIds), [residueIds]);

    useEffect(() => {
        if (hoveredResidue !== null && !residueSet.has(hoveredResidue)) setHoveredResidue(null);
        if (pinnedResidue !== null && !residueSet.has(pinnedResidue)) setPinnedResidue(null);
    }, [hoveredResidue, pinnedResidue, residueSet]);

    const activeResidue = pinnedResidue !== null ? pinnedResidue : hoveredResidue;

    const plotData = useMemo(() => {
        const nodes = residueIds.length;
        if (!nodes) return [];

        const offset = Math.PI * (0.5 - 1 / nodes);
        const theta = Array.from({ length: nodes }, (_, i) => -2 * Math.PI * i / nodes + offset);

        const x1 = theta.map(t => Math.cos(t) * radius1);
        const y1 = theta.map(t => Math.sin(t) * radius1);

        const x2 = theta.map(t => Math.cos(t) * radius2);
        const y2 = theta.map(t => Math.sin(t) * radius2);
        const residueToNode = new Map(residueIds.map((residue, index) => [residue, index]));

        const labelInterval = Math.ceil(nodes/5); 
        const labeledNodes = Array.from({ length: nodes }, (_, i) => (i % labelInterval === 0) ? i : null).filter(i => i !== null);

        const nodePlot1 = {
            type: 'scatter',
            mode: 'markers',
            x: x1,
            y: y1,
            marker: { size: 6, color: 'black' },
            showlegend: false,
            hoverinfo: 'text',
            text: residueIds.map(residue => `Residue ${residue + 1}`),
            customdata: residueIds,
            name: RESIDUE_TRACE_NAME,
        };

        const nodePlot2 = {
            type: 'scatter',
            mode: 'text',
            x: x2,
            y: y2,
            text: residueIds.map((residue, index) => labeledNodes.includes(index) ? `${residue + 1}` : ''),
            textposition: 'middle center',
            showlegend: false,
            hoverinfo: 'none', 
            name: 'Residue Labels',
            textfont: {
                size: 12,
                color: 'black',
            },
        };

        const curves = edges.map(([i, j, w]) => {
            const iNode = residueToNode.get(i);
            const jNode = residueToNode.get(j);
            const arcPoints = generateArcPoints(x1[iNode], y1[iNode], x1[jNode], y1[jNode], 8);
            const isConnected = activeResidue === null || i === activeResidue || j === activeResidue;

            return {
                type: 'scatter',
                mode: 'lines',
                x: arcPoints.x,
                y: arcPoints.y,
                line: { color: '#3B75AF', width: w * w * 30, shape: 'spline' },
                opacity: isConnected ? 1 : 0.12,
                showlegend: false,
                hoverinfo: 'none',
            };
        });

        const centerResetPlot = {
            type: 'scatter',
            mode: 'markers',
            x: [0],
            y: [0],
            marker: { size: 40, color: 'rgba(0,0,0,0)', line: { width: 0 } },
            showlegend: false,
            hoverinfo: 'none',
            name: CENTER_RESET_TRACE_NAME,
        };

        // Combine both circles and edges in a single plot data
        return [...curves, centerResetPlot, nodePlot1, nodePlot2];
    }, [activeResidue, edges, radius1, radius2, residueIds]);

    // Function to generate points on an arc
    function generateArcPoints(x1, y1, x2, y2, n) {
        const mX = (x1 + x2) / 2;
        const mY = (y1 + y2) / 2;

        // Distance^2 from a point to mid point
        const a = ((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 4;
        const b = mX * mX + mY * mY; // Distance^2 from midpoint to center

        // Handle opposite points or same point - a straight line
        if (a < 0.0001 || b < 0.0001) return { x: [x1, x2], y: [y1, y2] }

        // Circle center, don't ask me how
        const cX = (a * a / (b * b) + 1) * mX;
        const cY = (a * a / (b * b) + 1) * mY;

        // Angles of points
        let t1 = Math.atan2(y1 - cY, x1 - cX);
        let t2 = Math.atan2(y2 - cY, x2 - cX);

        // Normalize and make inner arc
        if (t2 < t1) [t2, t1] = [t1, t2];
        if (t2 - t1 > Math.PI) t1 += 2 * Math.PI;

        // Generate points
        const r = Math.sqrt((cX - x1) * (cX - x1) + (cY - y1) * (cY - y1));
        const theta = Array.from({ length: n + 1 }, (_, i) => (t2 - t1) * i / n + t1);
        const x = theta.map(t => r * Math.cos(t) + cX);
        const y = theta.map(t => r * Math.sin(t) + cY);

        return { x, y };
    }

    function getResidueFromEvent(data) {
        const point = data?.points?.[0];
        if (!point || point.data?.name !== RESIDUE_TRACE_NAME) return null;
        return point.customdata === undefined ? null : point.customdata;
    }

    function clickedCenter(data) {
        return data?.points?.some(point => point.data?.name === CENTER_RESET_TRACE_NAME);
    }

    return (
        <Plot
            data={plotData}
            layout={{
                showlegend: false,
                uirevision: 'true',
                xaxis: {
                    range: [-2, 2], 
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    linewidth: 1,
                    mirror: true,
                },
                yaxis: {
                    range: [-2, 2], 
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    linewidth: 1,
                    mirror: true,
                    scaleanchor: 'x',
                    scaleratio: 1,
                },
            }}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
            onHover={(data) => {
                if (pinnedResidue !== null) return;

                const residue = getResidueFromEvent(data);
                if (residue !== null) setHoveredResidue(residue);
            }}
            onUnhover={() => {
                if (pinnedResidue === null) setHoveredResidue(null);
            }}
            onClick={(data) => {
                if (clickedCenter(data)) {
                    setPinnedResidue(null);
                    setHoveredResidue(null);
                    return;
                }

                const residue = getResidueFromEvent(data);
                if (residue === null) return;

                setPinnedResidue(currentResidue => currentResidue === residue ? null : residue);
                setHoveredResidue(null);
            }}
        />
    );
};
