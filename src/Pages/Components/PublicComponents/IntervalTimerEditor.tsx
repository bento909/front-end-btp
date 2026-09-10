import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { IntervalTimerData, Phase, getTotalDuration, formatTotalDuration } from "./IntervalTimerLogic";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";

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

// Accepts plain seconds ("45") or mm:ss ("1:30" -> 90 seconds)
function parseDurationInput(raw: string): number {
    const trimmed = raw.trim();
    if (!trimmed) return 0;

    if (trimmed.includes(":")) {
        const [minsPart, secsPart] = trimmed.split(":");
        const mins = parseInt(minsPart, 10) || 0;
        const secs = parseInt(secsPart, 10) || 0;
        return mins * 60 + secs;
    }

    const n = parseInt(trimmed, 10);
    return isNaN(n) ? 0 : n;
}

interface Props {
    onStartTimer: (timerData: IntervalTimerData) => void;
}

export const IntervalTimerEditor: React.FC<Props> = ({ onStartTimer }) => {
    const [timers, setTimers] = useState<IntervalTimerData[]>(loadTimers());
    const [myTimersOpen, setMyTimersOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [draftTimer, setDraftTimer] = useState<IntervalTimerData>({
        name: "",
        phases: [],
    });
    const [loopStartIndex, setLoopStartIndex] = useState<number | null>(null);

    const newTimer = () => {
        setEditingIndex(null);
        setDraftTimer({ name: "", phases: [] });
        setLoopStartIndex(null);
        setIsEditing(true);
    };

    const editTimer = (index: number) => {
        setEditingIndex(index);
        setDraftTimer(JSON.parse(JSON.stringify(timers[index])));
        setLoopStartIndex(null);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setDraftTimer({ name: "", phases: [] });
        setLoopStartIndex(null);
        setIsEditing(false);
    };

    const addPhase = () => {
        setDraftTimer(prev => ({ ...prev, phases: [...prev.phases, { name: "", duration: 30 }] }));
    };

    const removePhase = (index: number) => {
        setDraftTimer(prev => ({
            ...prev,
            phases: prev.phases.filter((_, i) => i !== index),
        }));
        setLoopStartIndex(prev => (prev === null ? null : (prev === index ? null : prev)));
    };

    const updatePhase = (index: number, patch: Partial<Phase>) => {
        setDraftTimer(prev => {
            const newPhases = [...prev.phases];
            newPhases[index] = { ...newPhases[index], ...patch };
            return { ...prev, phases: newPhases };
        });
    };

    const markLoopStart = (index: number) => {
        setLoopStartIndex(prev => (prev === index ? null : index));
    };

    const markLoopEnd = (endIndex: number) => {
        if (loopStartIndex === null || endIndex <= loopStartIndex) return;

        const input = window.prompt("Repeat this section how many times in total?", "2");
        if (input === null) return;

        const times = parseInt(input, 10);
        if (!times || times < 1) return;

        setDraftTimer(prev => {
            const loopSlice = prev.phases.slice(loopStartIndex, endIndex + 1);
            const extraCopies: Phase[] = [];
            for (let n = 1; n < times; n++) {
                extraCopies.push(...loopSlice.map(p => ({ ...p })));
            }
            const newPhases = [
                ...prev.phases.slice(0, endIndex + 1),
                ...extraCopies,
                ...prev.phases.slice(endIndex + 1),
            ];
            return { ...prev, phases: newPhases };
        });
        setLoopStartIndex(null);
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
        cancelEditing();
    };

    const deleteTimer = () => {
        if (editingIndex === null) return;
        if (!window.confirm(`Delete "${draftTimer.name || "this timer"}"? This can't be undone.`)) return;

        const updatedTimers = timers.filter((_, i) => i !== editingIndex);
        setTimers(updatedTimers);
        saveTimers(updatedTimers);
        cancelEditing();
    };

    const draftTotal = getTotalDuration(draftTimer.phases);

    return (
        <Container>
            <CollapsiblePanel title="My Timers" isOpen={myTimersOpen} toggle={() => setMyTimersOpen(o => !o)}>
                {timers.length === 0 && <EmptyState>No saved timers yet.</EmptyState>}
                {timers.map((t, i) => (
                    <TimerRow key={i}>
                        <TimerInfo>
                            <TimerName>{t.name || "(untitled)"}</TimerName>
                            <TimerMeta>{formatTotalDuration(getTotalDuration(t.phases))}</TimerMeta>
                        </TimerInfo>
                        <TimerActions>
                            <SecondaryButton onClick={() => editTimer(i)}>Edit</SecondaryButton>
                            <PrimaryButton onClick={() => onStartTimer(t)}>Start</PrimaryButton>
                        </TimerActions>
                    </TimerRow>
                ))}

                <NewTimerRow>
                    <PrimaryButton onClick={newTimer}>Create New Timer</PrimaryButton>
                </NewTimerRow>
            </CollapsiblePanel>

            {isEditing && (
                <EditorBox>
                    <NameInput
                        type="text"
                        placeholder="Timer Name"
                        value={draftTimer.name}
                        onChange={e => setDraftTimer(prev => ({ ...prev, name: e.target.value }))}
                    />

                    <PhasesHeader>
                        <h4 style={{ margin: 0 }}>Segments</h4>
                        <TimerMeta>Total: {formatTotalDuration(draftTotal)}</TimerMeta>
                    </PhasesHeader>

                    {loopStartIndex !== null && (
                        <LoopBanner>
                            Loop start set on segment {loopStartIndex + 1}. Click "Loop End" on a later segment to repeat everything in between.
                            <SecondaryButton onClick={() => setLoopStartIndex(null)}>Cancel Loop</SecondaryButton>
                        </LoopBanner>
                    )}

                    {draftTimer.phases.map((p, i) => (
                        <PhaseRow key={i}>
                            <PhaseInputs>
                                <PhaseNameInput
                                    type="text"
                                    placeholder="Segment Name"
                                    value={p.name}
                                    onChange={e => updatePhase(i, { name: e.target.value })}
                                />
                                <DurationInput
                                    value={p.duration}
                                    onChange={secs => updatePhase(i, { duration: secs })}
                                />
                            </PhaseInputs>
                            <PhaseActions>
                                <SmallButton
                                    active={loopStartIndex === i}
                                    onClick={() => markLoopStart(i)}
                                >
                                    Loop Start
                                </SmallButton>
                                {loopStartIndex !== null && i > loopStartIndex && (
                                    <SmallButton onClick={() => markLoopEnd(i)}>Loop End</SmallButton>
                                )}
                                <DangerSmallButton onClick={() => removePhase(i)}>Remove</DangerSmallButton>
                            </PhaseActions>
                        </PhaseRow>
                    ))}

                    <ButtonRow>
                        <SecondaryButton onClick={addPhase}>Add Segment</SecondaryButton>
                    </ButtonRow>

                    <ButtonRow>
                        <PrimaryButton onClick={saveTimer}>Save Timer</PrimaryButton>
                        <SecondaryButton onClick={cancelEditing}>Cancel</SecondaryButton>
                        {editingIndex !== null && (
                            <DangerButton onClick={deleteTimer}>Delete Timer</DangerButton>
                        )}
                    </ButtonRow>
                </EditorBox>
            )}
        </Container>
    );
};

const DurationInput: React.FC<{ value: number; onChange: (seconds: number) => void }> = ({ value, onChange }) => {
    const [text, setText] = useState(String(value));

    useEffect(() => {
        setText(String(value));
    }, [value]);

    const commit = () => {
        const seconds = parseDurationInput(text);
        setText(String(seconds));
        onChange(seconds);
    };

    return (
        <DurationInputField
            type="text"
            inputMode="numeric"
            placeholder="Duration (s or mm:ss)"
            value={text}
            onChange={e => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
        />
    );
};

/* ---- Layout ---- */

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    box-sizing: border-box;
`;

const EmptyState = styled.div`
    color: #666;
    font-size: 0.9rem;
    padding: 4px 0;
`;

const TimerRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
`;

const TimerInfo = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

const TimerName = styled.strong`
    overflow-wrap: anywhere;
`;

const TimerMeta = styled.span`
    font-size: 0.8rem;
    color: #666;
`;

const TimerActions = styled.div`
    display: flex;
    gap: 8px;
    flex-shrink: 0;
`;

const NewTimerRow = styled.div`
    padding-top: 8px;
`;

const EditorBox = styled.div`
    border: 1px solid #666;
    border-radius: 10px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-sizing: border-box;
`;

const PhasesHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
`;

const LoopBanner = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    background: #fff8e1;
    border: 1px solid #f0d878;
    border-radius: 8px;
    padding: 8px;
    font-size: 0.85rem;
`;

const PhaseRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    border: 1px solid #eee;
    border-radius: 8px;

    @media (min-width: 640px) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
`;

const PhaseInputs = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    flex: 1;
    min-width: 0;
`;

const PhaseActions = styled.div`
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
`;

/* ---- Inputs ---- */

const InputBase = `
    padding: 8px 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    box-sizing: border-box;
`;

const NameInput = styled.input`
    ${InputBase};
    width: 100%;
`;

const PhaseNameInput = styled.input`
    ${InputBase};
    flex: 2 1 140px;
    min-width: 100px;
`;

const DurationInputField = styled.input`
    ${InputBase};
    flex: 1 1 100px;
    min-width: 90px;
`;

/* ---- Buttons ---- */

const ButtonRow = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`;

const ButtonBase = `
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    min-height: 36px;
`;

const PrimaryButton = styled.button`
    ${ButtonBase};
    background: #000;
    color: #fff;
`;

const SecondaryButton = styled.button`
    ${ButtonBase};
    background: #fff;
    color: #000;
    border: 1px solid #000;
`;

const DangerButton = styled.button`
    ${ButtonBase};
    background: #ff4d4d;
    color: #fff;
`;

const SmallButton = styled.button<{ active?: boolean }>`
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 0.75rem;
    cursor: pointer;
    border: 1px solid #000;
    background: ${({ active }) => (active ? "#000" : "#fff")};
    color: ${({ active }) => (active ? "#fff" : "#000")};
`;

const DangerSmallButton = styled.button`
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 0.75rem;
    cursor: pointer;
    border: 1px solid #ff4d4d;
    background: #fff;
    color: #ff4d4d;
`;
