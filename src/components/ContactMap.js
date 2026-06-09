import React, { useEffect, useState, useMemo } from 'react';
import Plot from 'react-plotly.js';

const MIN_CIRCLE_PAIR_COUNT = 20;

const ContactMap = ({
    chain, mappedDi, structureContacts,
    selectedPairs = null, selectedContacts = null,
    onPairSelect = null, onContactSelect = null,
    onDisplayedPairsChange = null
}) => {
    const maxDiCount = mappedDi.mapped_di.length;
    const defaultDiCount = useMemo(() => mappedDi ? Math.floor(Math.sqrt(maxDiCount * 4.5)) : 0, [mappedDi, maxDiCount]);
    const [diCount, setDiCount] = useState(defaultDiCount);
    const [showPairs, setShowPairs] = useState(true);
    const [showContacts, setShowContacts] = useState(true);
    const [showHits, setShowHits] = useState(true);
    // TODO: Handle duplication of selected contacts better

    useEffect(() => {
        setDiCount(defaultDiCount);
    }, [defaultDiCount]);

    const circlePairIndexes = useMemo(() => {
        if (!mappedDi) return [];

        const pairCount = Math.min(
            maxDiCount,
            Math.max(MIN_CIRCLE_PAIR_COUNT, Number(diCount) || 0)
        );

        return mappedDi.mapped_di.slice(0, pairCount).map((_, index) => index);
    }, [diCount, mappedDi, maxDiCount]);

    useEffect(() => {
        if (onDisplayedPairsChange) onDisplayedPairsChange(circlePairIndexes);
    }, [circlePairIndexes, onDisplayedPairsChange]);

    const {plotData, hitCount} = useMemo(() => {
        let res = [];

        if (structureContacts && showContacts && structureContacts.contacts[chain]) {
            const x = structureContacts.contacts[chain].map(p => p[0]);
            const y = structureContacts.contacts[chain].map(p => p[1]);
            const pts = [[...x, ...y], [...y, ...x]]

            res.push({
                x: pts[0],
                y: pts[1],
                type: 'scatter',
                mode: 'markers',
                name: 'Structural Contacts',
                text: pts[0].map((_, i) => 'Contact ' + pts[0][i] + ',' + pts[1][i]),
                hoverinfo: 'text',
                marker: {
                    size: 3,
                    color: '#969696'
                },
                selectedpoints: selectedContacts
            });
        }

        if (mappedDi && showPairs) {
            const topPairs = mappedDi.topDiPairs(diCount);

            res.push({
                x: topPairs.map(p => p[0]),
                y: topPairs.map(p => p[1]),
                type: 'scatter',
                mode: 'markers',
                name: 'DI Pairs',
                text: topPairs.map(p => p[0] + ',' + p[1] + ': DI=' + p[2].toFixed(3)),
                hoverinfo: 'text',
                marker: {
                    size: 3,
                    color: '#3788d5'
                },
                selectedpoints: selectedPairs
            });
        }

        let hitCount = 0;
        if (mappedDi && structureContacts && showHits && structureContacts.contacts[chain]) {
            const contactLookup = new Set(structureContacts.contacts[chain].map(c => c.join(',')));
            const topPairs = mappedDi.topDiPairs(diCount);
            const hits = topPairs.filter(p => contactLookup.has(p[0] + ',' + p[1]));
            hitCount = hits.length;

            res.push({
                x: hits.map(p => p[0]),
                y: hits.map(p => p[1]),
                type: 'scatter',
                mode: 'markers',
                name: 'DI Hits',
                text: hits.map(p => p[0] + ',' + p[1] + ': DI=' + p[2].toFixed(3)),
                hoverinfo: 'text',
                marker: {
                    size: 3,
                    color: 'red'
                },
                selectedpoints: selectedPairs
            });
        }

        return {plotData: res, hitCount};
    }, [chain, mappedDi, structureContacts, diCount, selectedPairs, selectedContacts, showContacts, showHits, showPairs]);

    const plotLayout = useMemo(() => {
        return {
            uirevision: 'true',
            xaxis: {
                linewidth: 1,
                mirror: true,
                zeroline: false,
            },
            yaxis: {
                linewidth: 1,
                mirror: true,
                zeroline: false,
                autorange: 'reversed',
                scaleanchor: 'x',
                title: 'Residue Index'
            },
            showlegend: false,
            // legend: {
            //     orientation: "h"
            // },
            margin: {
                l: 45,
                r: 5,
                b: 25,
                t: 15,
                pad: 3
            },
        }
    }, []);

    const selectedPairsLink = useMemo(() => {
        if (!selectedPairs) return '#';

        let csvContent = 'Residue 1, Residue 2, DI Score\n';
        csvContent += selectedPairs.map(i => mappedDi.mapped_di[i]).map(row => row.join(', ')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        return window.URL.createObjectURL(blob);
    }, [mappedDi, selectedPairs]);

    const selectedContactsLink = useMemo(() => {
        if (!selectedContacts || !structureContacts || !structureContacts.contacts[chain]) return '#';

        const contacts = structureContacts.contacts[chain];
        const validIdxs = Array.from(new Set(selectedContacts.map(i => i % contacts.length))); // Remove duplicates

        let csvContent = 'Residue 1, Residue 2\n';
        csvContent += validIdxs.map(i => contacts[i]).map(row => row.join(', ')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        return window.URL.createObjectURL(blob);
    }, [chain, structureContacts, selectedContacts]);

    const styles = {
        diSlider: {
            width: "60%",
            height: "8px",
            borderRadius: "5px",
            background: "linear-gradient(90deg,rgb(219, 204, 189) 0%, #e87500 100%",
            color:'#e87500',
            appearance: "none",
            outline: "none",
            transition: "background 0.3s",
        },
        downloadLink: {
            color: 'blue',
            textDecoration: 'underline',
            cursor: 'pointer',
            margin: '5px',
            display: 'block',
        },
        plotWrapper: {
            position: 'relative',
            paddingTop: 'calc(110% - 6px)'
        },
        plot: {
            position: 'absolute',
            top: '0px',
            left: '0px',
            right: '0px',
            bottom: '0px'
        },
        helpText: {
            fontSize: '14px',
            fontStyle: 'italic',
            color: '#888',
        },

        
    };

    return (
        <div>
            <div style={{ fontWeight: 'bold' }}>
                Top <input
                    type='number'
                    value={diCount}
                    style={{width: '50px'}}
                    min={1}
                    max={maxDiCount}
                    onChange={e => setDiCount(e.target.value)} />
                DI Pairs:

                <input
                    type="range"
                    min="1"
                    max={maxDiCount}
                    value={diCount}
                    onChange={e => setDiCount(e.target.value)}
                    style={styles.diSlider}
                />
            </div>

            <div>
                {!selectedPairs || !selectedPairs.length ? undefined : (
                    <a style={styles.downloadLink} href={selectedPairsLink} download='selected_di_pairs.csv'>
                        Download Selected DI Pairs
                    </a>
                )}
                {!selectedContacts || !selectedContacts.length ? undefined : (
                    <a style={styles.downloadLink} href={selectedContactsLink} download='selected_contacts.csv'>
                        Download Selected Contacts
                    </a>
                )}
            </div>

            <div style={styles.plotWrapper}>
                <Plot
                    data={plotData}

                    layout={plotLayout}

                    useResizeHandler={true}
                    style={styles.plot}

                    onSelected={(data) => {
                        if (!data) return;
                        const contacts = data.points.filter(p => p.curveNumber === 0).map(p => p.pointNumber);
                        const pairs = data.points.filter(p => p.curveNumber === 1).map(p => p.pointNumber); //TODO: selecting hits
                        if (onContactSelect) onContactSelect(contacts);
                        if (onPairSelect) onPairSelect(pairs);
                    }}

                    onDeselect={() => {
                        if (onContactSelect) onContactSelect(null);
                        if (onPairSelect) onPairSelect(null);
                    }}
                />
            </div>

            <div>
                <input style={{accentColor: '#e87500'}} type="checkbox" id="pairs" checked={showPairs} onChange={e => setShowPairs(e.target.checked)} />
                <label htmlFor="pairs" style={{
                    margin: '5px 10px',
                    color: '#e87500'
                }}>DI Pairs</label>
                <input style={{accentColor: '#e87500'}} type="checkbox" id="contacts" checked={showContacts} onChange={e => setShowContacts(e.target.checked)} />
                <label htmlFor="contacts" style={{
                    margin: '5px 10px',
                    color: '#969696'
                }}>Contacts</label>
                <br />
                <input style={{accentColor: '#e87500'}} type="checkbox" id="hits" checked={showHits} onChange={e => setShowHits(e.target.checked)} />
                <label htmlFor="hits" style={{
                    margin: '5px 10px',
                    color: 'red'
                }}>DI Hits ({hitCount}, {(hitCount / diCount * 100).toFixed(2)}%)</label>
            </div>
            
            <div>

            </div>

            <div style={styles.helpText}>
                Click & drag to zoom/pan/select. Double click to reset. Use shift for multiple selections.
            </div>
        </div>
    );
};

export default ContactMap;
