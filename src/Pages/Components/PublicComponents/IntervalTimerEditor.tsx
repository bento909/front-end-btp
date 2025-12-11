import React, { useState } from "react";
import { IntervalTimerData } from "./IntervalTimerLogic";

const STORAGE_KEY = "user_interval_timers";

function loadTimers(): IntervalTimerData[] {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    try {
        return JSON.parse(json);
    } catch {
        return [];
    }
}

function saveTimers(timers: IntervalTimerData[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
}

interface Props {
    onStartTimer: (timerData: IntervalTimerData) => void;
}

export const IntervalTimerEditor: React.FC<Props> = ({ onStartTimer }) => {
    const [timers, setTimers] = useState<IntervalTimerData[]>(loadTimers());
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [draftTimer, setDraftTimer] = useState<IntervalTimerData>({
        name: "",
        phases: [],
    });

    const newTimer = () => {
        setEditingIndex(null);
        setDraftTimer({ name: "", phases: [] });
    };

    const editTimer = (index: number) => {
        setEditingIndex(index);
        setDraftTimer(JSON.parse(JSON.stringify(timers[index])));
    };

    const addPhase = () => {
        setDraftTimer(prev => ({ ...prev, phases: [...prev.phases, { name: "", duration: 30 }] }));
    };

    const removePhase = (index: number) => {
        setDraftTimer(prev => ({
            ...prev,
            phases: prev.phases.filter((_, i) => i !== index),
        }));
    };

    const saveTimer = () => {
        let updatedTimers: IntervalTimerData[];
        if (editingIndex !== null) {
            updatedTimers = [...timers];
            updatedTimers[editingIndex] = draftTimer;
        } else {
            updatedTimers = [...timers, draftTimer];
        }
        setTimers(updatedTimers);
        saveTimers(updatedTimers);
        setEditingIndex(null);
        setDraftTimer({ name: "", phases: [] });
    };

    return (
        <div>
            <h3>Saved Timers</h3>
            {timers.map((t, i) => (
                <div key={i}>
                    <strong>{t.name}</strong>
                    <button onClick={() => editTimer(i)}>Edit</button>
                    <button onClick={() => onStartTimer(t)}>Start</button>
                </div>
            ))}

            <hr />
            <button onClick={newTimer}>Create New Timer</button>

            {/* Timer Editor */}
            {draftTimer && (
                <div style={{ border: "1px solid #666", padding: 8, marginTop: 8 }}>
                    <input
                        type="text"
                        placeholder="Timer Name"
                        value={draftTimer.name}
                        onChange={e => setDraftTimer(prev => ({ ...prev, name: e.target.value }))}
                    />

                    <h4>Phases</h4>
                    {draftTimer.phases.map((p, i) => (
                        <div key={i} style={{ display: "flex", gap: 8 }}>
                            <input
                                type="text"
                                placeholder="Phase Name"
                                value={p.name}
                                onChange={e => {
                                    const newPhases = [...draftTimer.phases];
                                    newPhases[i].name = e.target.value;
                                    setDraftTimer(prev => ({ ...prev, phases: newPhases }));
                                }}
                            />
                            <input
                                type="number"
                                placeholder="Duration (s)"
                                value={p.duration}
                                onChange={e => {
                                    const newPhases = [...draftTimer.phases];
                                    newPhases[i].duration = parseInt(e.target.value) || 0;
                                    setDraftTimer(prev => ({ ...prev, phases: newPhases }));
                                }}
                            />
                            <button onClick={() => removePhase(i)}>Remove</button>
                        </div>
                    ))}

                    <button onClick={addPhase}>Add Phase</button>
                    <button onClick={saveTimer}>Save Timer</button>
                </div>
            )}
        </div>
    );
};
