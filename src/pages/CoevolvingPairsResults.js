import React, { useState, useEffect } from 'react';
import HomeButton from '../components/HomeButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useLocation, Link} from 'react-router-dom';
import ContactMap from '../components/ContactMap';
import DiTable from '../components/DiTable';
import { Task, DCA, MappedDi, StructureContacts } from '../backend/api';
import MolViewer from '../components/MolViewer';
import { CirclePlot } from '../components/CirclePlot';
import ChainSelector from '../components/ChainSelector';

const CoevolvingPairsResults = () => {
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState(null);
    const [dca, setDca] = useState(DCA.testObj);
    const [mappedDi, setMappedDi] = useState(MappedDi.testObj);
    const [structureContacts, setStructueContacts] = useState(StructureContacts.testObj);
    const [chain, setChain] = useState('A'); //How to set default value?
    const [selectedDI, setSelectedDI] = useState(null);
    const [selectedContacts, setSelectedContacts] = useState(null);
    const [displayedDI, setDisplayedDI] = useState(null);
    const [collapsedSections, setCollapsedSections] = useState({
        contactMap: false,
        diPairs: false,
        pdbViewer: false,
        circlePlot: true,
    });
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme:dark)");

    const query = new URLSearchParams(useLocation().search);
    const dcaId = query.get('dca');
    const mappedDiId = query.get('mapped_di');
    const structueContactsId = query.get('structure_contacts');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setLoadingMessage('Loading...');

            try {
                if (dcaId) {
                    const task = await Task.fetch(dcaId);
                    setLoadingMessage('Running DCA...');
                    await task.waitForCompletion();
                    setDca(await DCA.fetch(dcaId));   
                }
                if (mappedDiId) {
                    const task = await Task.fetch(mappedDiId);
                    setLoadingMessage('Running DCA & Mapping DI...');
                    await task.waitForCompletion();
                    setMappedDi(await MappedDi.fetch(mappedDiId));
                }
                if (structueContactsId) {
                    const task = await Task.fetch(structueContactsId);
                    setLoadingMessage('Generating contacts...');
                    await task.waitForCompletion();
                    const structureContacts = await StructureContacts.fetch(structueContactsId);
                    setStructueContacts(structureContacts);

                    //Better place for this?
                    const availableChains = Object.keys(structureContacts.contacts).map((c) => {
                        const [c1, c2] = c.split(',').map(s => s.trim());
                        if (c1 === c2) return [c, c1];
                        return [c, c1 + ', ' + c2];
                    }).sort((a, b) => a[1].split(',').length - b[1].split(',').length); //Sort singles first

                    setChain(availableChains[0][0])
                }
            } catch (error) {

                setError('Error: ' + error.message);
            } finally {
                setLoading(false);
                setLoadingMessage('');
            }
        }
        fetchData();
    }, [dcaId, mappedDiId, structueContactsId]);
    useEffect(() => {
        console.log(dca)
    }, [dca])
    useEffect(() => {
        console.log(mappedDi)
    }, [mappedDi])
    useEffect(() => {
        console.log(structueContactsId)
    }, [structueContactsId])

    const toggleSection = (section) => {
        setCollapsedSections(prevState => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    const styles = {

        container: {
            backgroundColor: prefersDarkScheme.matches?'rgba(60,60,60,255)':'#f4f4f4',
            // minHeight: '100vh',
            padding: '20px',
            paddingTop: '100px',
            fontFamily: '"Roboto", sans-serif',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            backgroundColor: prefersDarkScheme.matches?'#1f1f1f':'#e87500',
            padding: '15px 25px',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#ffffff',
            width: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 100,
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        },
        chainSelect: {
            // width: '100%',
            // position: 'fixed',
            // top: 0,
            // left: 0,
            color: '#e87500'
        },
        resultsSection: {
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px',
        },
        section: {
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
            flex: '1 1 calc(50% - 40px)',
            minWidth: '300px',
            maxWidth: '520px',
            display: 'flex',
            flexDirection: 'column',
        },
        heading: {
            fontSize: '24px',
            marginBottom: '15px',
            color: '#e87500',
            borderBottom: '2px solid #e87500',
            paddingBottom: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        content: {
            fontSize: '16px',
            color: '#333',
            transition: 'max-height 0.3s ease-out',
            overflow: 'hidden',
            flex: '1',
        },
        contentExpanded: {
            maxHeight: '1000px',
        },
        contentCollapsed: {
            maxHeight: '0',
            padding: '0',
        },
        arrowIcon: {
            transition: 'transform 0.3s ease',
        },
        arrowUp: {
            transform: 'rotate(180deg)',
        },
        arrowDown: {
            transform: 'rotate(0deg)',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <HomeButton />
                <span style={{ flex: 1, textAlign: 'center' }}>Direct Coupling Analysis Results</span>
            </div>

            <ChainSelector
                style={styles.chainSelect}
                structureContacts={structureContacts}
                chain={chain}
                setChain={setChain}
            />

            <div style={styles.resultsSection}>
                {loading ? (
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                        <p style={{ fontStyle: 'italic', color: prefersDarkScheme.matches?'#fdf7f3':'#333' }}>{loadingMessage}</p>
                        <Link to='/tasks' style={{color: '#e87500', textDecoration: 'underline', fontSize: '16px', marginTop: '10px'}}>Monitor tasks</Link>
                    </div>
                    
                ) : error ? (
                    <p style={{ color: '#B71C1C', fontWeight: 'bold' }}>{error}</p>
                ) : (
                    <>
                        <div style={styles.section}>
                            <h2
                                style={styles.heading}
                                onClick={() => toggleSection('contactMap')}
                            >
                                Contact Map
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    style={{
                                        ...styles.arrowIcon,
                                        ...(collapsedSections.contactMap ? styles.arrowUp : styles.arrowDown),
                                    }}
                                />
                            </h2>
                            <div
                                style={{
                                    ...styles.content,
                                    ...(collapsedSections.contactMap ? styles.contentCollapsed : styles.contentExpanded),
                                }}
                            >
                                <ContactMap
                                    mappedDi={mappedDi}
                                    structureContacts={structureContacts}
                                    chain={chain}
                                    selectedPairs={selectedDI}
                                    selectedContacts={selectedContacts}
                                    onPairSelect={setSelectedDI}
                                    onContactSelect={setSelectedContacts}
                                    onDisplayedPairsChange={setDisplayedDI}
                                />
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h2
                                style={styles.heading}
                                onClick={() => toggleSection('pdbViewer')}
                            >
                                3D View ({structureContacts.pdb_id})
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    style={{
                                        ...styles.arrowIcon,
                                        ...(collapsedSections.pdbViewer ? styles.arrowUp : styles.arrowDown),
                                    }}
                                />
                            </h2>
                            <div
                                style={{
                                    ...styles.content,
                                    ...(collapsedSections.pdbViewer ? styles.contentCollapsed : styles.contentExpanded),
                                    aspectRatio: 1,
                                }}
                            >
                                <MolViewer
                                    structureContacts={structureContacts}
                                    mappedDi={mappedDi}
                                    chain={chain}
                                    selectedDi={selectedDI}
                                />
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h2
                                style={styles.heading}
                                onClick={() => toggleSection('circlePlot')}
                            >
                                Circle Plot (Work in Progress)
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    style={{
                                        ...styles.arrowIcon,
                                        ...(collapsedSections.circlePlot ? styles.arrowUp : styles.arrowDown),
                                    }}
                                />
                            </h2>
                            <div
                                style={{
                                    ...styles.content,
                                    ...(collapsedSections.circlePlot ? styles.contentCollapsed : styles.contentExpanded),
                                }}
                            >
                                <CirclePlot mappedDi={mappedDi} chain={chain} selectedDI={selectedDI} displayedDI={displayedDI}/>
                            </div>
                        </div>
                        <div style={styles.section}>
                            <h2
                                style={styles.heading}
                                onClick={() => toggleSection('diPairs')}
                            >
                                DI Table
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    style={{
                                        ...styles.arrowIcon,
                                        ...(collapsedSections.diPairs ? styles.arrowUp : styles.arrowDown),
                                    }}
                                />
                            </h2>
                            <div
                                style={{
                                    ...styles.content,
                                    ...(collapsedSections.diPairs ? styles.contentCollapsed : styles.contentExpanded),
                                }}
                            >
                                <DiTable mappedDi={mappedDi} selectedDi={selectedDI}/>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CoevolvingPairsResults;
