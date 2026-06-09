import React, { useEffect, useState } from 'react';
import { MSA, Task, EvolutionSimulation } from '../backend/api';
import { Link } from 'react-router-dom';

const TaskTile = ({ task_id, isSimulation = false, updateInterval = 5, onDelete, contactsId, mappedId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [task, setTask] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const COLORS = {
        primaryBG: prefersDarkScheme ? '#1b1b1b' : '#fff9f0',
        border: prefersDarkScheme ? '#1b1b1b' : '#e87500',
        text: prefersDarkScheme ? '#fdf7f3' : '#1f1f1f',
        buttonBG: prefersDarkScheme ? 'rgba(255, 28, 28, 0.45)' : 'rgba(255, 28, 28)',
    };

    useEffect(() => {
        async function fetchTask() {
            setLoading(true);
            setError(null);
            try {
                if (isSimulation) {
                    const sim = await EvolutionSimulation.fetch(task_id);
                    let linkedTask = null;

                    if (sim.task_id) {
                        try {
                            linkedTask = await Task.fetch(sim.task_id);
                        } catch {
                            linkedTask = null;
                        }
                    }

                    const pseudoTask = {
                        id: linkedTask ? linkedTask.id : (sim.task_id || sim.id),
                        simulation_id: sim.id,
                        state: linkedTask ? linkedTask.state : (!sim.error_message ? (sim.completed ? 'SUCCESS' : 'PENDING') : 'ERROR'),
                        percent: linkedTask ? linkedTask.percent : sim.percent,
                        successful: linkedTask ? linkedTask.successful : sim.completed,
                        name: linkedTask ? linkedTask.name : 'evolution-simulation',
                        time_started: linkedTask ? linkedTask.time_started : sim.created,
                        time_ended: linkedTask ? linkedTask.time_ended : (sim.completed ? new Date() : null),
                        message: linkedTask ? linkedTask.message : (sim.completed ? 'Simulation finished' : (!sim.error_message ? 'Running...' : 'Failed')),
                        link: '',
                        getNiceName() { return 'Evolution Simulation'; }
                    };

                    setTask(pseudoTask);
                } else {
                    setTask(await Task.fetch(task_id));
                }
                setLastUpdated(Date.now());
            } catch (fetchError) {
                setError('Error: ' + fetchError.message);
            } finally {
                setLoading(false);
            }
        }

        fetchTask();
    }, [task_id, isSimulation]);

    useEffect(() => {
        if (task && task.successful && task.name === 'api.tasks.compute_dca_task') {
            const existingTasks = JSON.parse(localStorage.getItem('dcaTasks')) || [];
            const taskEntry = { id: task.id, time: new Date().getTime() };
            existingTasks.push(taskEntry);
            localStorage.setItem('dcaTasks', JSON.stringify(existingTasks));
        }
    }, [task]);

    useEffect(() => {
        if (task) {
            const interval = setInterval(async () => {
                try {
                    if (isSimulation) {
                        const sim = await EvolutionSimulation.fetch(task_id);
                        let linkedTask = null;

                        if (sim.task_id) {
                            try {
                                linkedTask = await Task.fetch(sim.task_id);
                            } catch {
                                linkedTask = null;
                            }
                        }

                        setTask(prev => ({
                            ...prev,
                            id: linkedTask ? linkedTask.id : (sim.task_id || sim.id),
                            simulation_id: sim.id,
                            state: linkedTask ? linkedTask.state : (!sim.error_message ? (sim.completed ? 'SUCCESS' : 'PENDING') : 'ERROR'),
                            percent: linkedTask ? linkedTask.percent : sim.percent,
                            successful: linkedTask ? linkedTask.successful : sim.completed,
                            name: linkedTask ? linkedTask.name : (prev?.name || 'evolution-simulation'),
                            time_started: linkedTask ? linkedTask.time_started : (prev?.time_started || sim.created),
                            time_ended: linkedTask ? linkedTask.time_ended : (sim.completed ? new Date() : null),
                            message: linkedTask ? linkedTask.message : (sim.completed ? 'Simulation finished' : 'Running...'),
                        }));
                        setLastUpdated(Date.now());
                    } else {
                        await task.update();
                        setLastUpdated(Date.now());
                    }
                } catch (updateError) {
                    setError('Error: ' + updateError.message);
                }
            }, updateInterval * 1000);

            return () => clearInterval(interval);
        }
        return undefined;
    }, [task, task_id, updateInterval, isSimulation]);

    const linkStyle = {
        fontSize: 12,
        color: COLORS.text,
        textDecoration: 'underline',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'inline',
        margin: 0,
        padding: 0,
    };

    const downloadMsa = async (id) => {
        const msa = await MSA.fetch(id);
        const url = msa.fasta;
        window.location.href = url;
    };

    const resultsLink = () => {
        if (task.name === 'api.tasks.generate_msa_task') {
            return (
                <button
                    onClick={() => downloadMsa(task.id)}
                    style={linkStyle}
                    rel="noreferrer">
                    Download MSA
                </button>
            );
        } else if (task.name === 'api.tasks.compute_dca_task') {
            return (
                <a
                    href={'/coevolving-pairs-results?structure_contacts=' + contactsId + '&mapped_di=' + mappedId}
                    style={linkStyle}
                    target='_blank'
                    rel="noreferrer"
                >
                    View DCA Results
                </a>
            );
        } else if (isSimulation || task.name === 'evolution-simulation') {
            return (
                <Link
                    to={'/seec-results/?resultID=' + (task.simulation_id || task_id)}
                    style={linkStyle}
                    rel="noreferrer"
                >
                    View Results
                </Link>
            );
        }
        return undefined;
    };

    return (
        <div style={{
            border: '2px solid ' + COLORS.border,
            background: COLORS.primaryBG,
            borderRadius: '10px',
            padding: '20px',
            margin: '20px'
        }}>
            {loading ? <>
                <p style={{ fontStyle: 'italic', color: COLORS.text }}>Loading...</p>
            </> : (error ? <>
                <p style={{ color: 'maroon' }}>{error}</p>
                {onDelete && (
                    <div style={{ marginTop: '10px' }}>
                        <button
                            onClick={() => onDelete(task_id)}
                            style={{
                                color: 'white',
                                background: '#cc0000',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                            }}
                        >
                            Delete Task
                        </button>
                    </div>
                )}

            </> : <>
                <div style={{ fontWeight: 'bold', color: COLORS.text }}>
                    <p>
                        {task.getNiceName()}
                    </p>
                    <p>
                     {' (' + task.state + ' ' + task.percent + '%)'}
                    </p>

                </div>
                <div style={{ fontSize: '10px', fontStyle: 'italic', color: COLORS.text }}>Task ID: {task.id}</div>
                {isSimulation && task.simulation_id ? (
                    <div style={{ fontSize: '10px', fontStyle: 'italic', color: COLORS.text }}>Simulation ID: {task.simulation_id}</div>
                ) : undefined}
                {task.time_started ? <div style={{ color: COLORS.text }}><b>Started:</b> {task.time_started.toISOString()}</div> : undefined}
                {task.time_ended ? <div style={{ color: COLORS.text }}><b>Ended:</b> {task.time_ended.toISOString()}</div> : undefined}
                {task.message ? <div><i>{task.message}</i></div> : undefined}
                {task.successful ? resultsLink() : undefined}
                {lastUpdated ? <div style={{ fontSize: '10px', fontStyle: 'italic', color: COLORS.text }}>
                    Last updated {new Date(lastUpdated).toISOString()}
                </div> : undefined}
                {onDelete && (
                    <div style={{ marginTop: '10px' }}>
                        <button
                            onClick={() => onDelete(task_id)}
                            style={{
                                color: 'white',
                                background: COLORS.buttonBG,
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                            }}
                        >
                            Delete Task
                        </button>
                    </div>
                )}
            </>)}
        </div>
    );
};

export default TaskTile;
