import React, { useState, useEffect } from "react";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";

interface MIDITrackerProps {
    beatsPerBar?: number;
    alertBars?: number[];
}

const MIDITracker: React.FC<MIDITrackerProps> = ({
                                                     beatsPerBar = 4,
                                                     alertBars = [4, 8, 16, 32],
                                                 }) => {
    const CLOCKS_PER_BEAT = 24;

    const [isOpen, setIsOpen] = useState(false);
    const [currentBar, setCurrentBar] = useState(1);
    const [currentBeat, setCurrentBeat] = useState(1);
    const [clockCounter, setClockCounter] = useState(0);

    const togglePanel = () => setIsOpen(prev => !prev);

    useEffect(() => {
        if (!navigator.requestMIDIAccess) {
            alert("Web MIDI API not supported in this browser.");
            return;
        }

        let midiAccess: MIDIAccess;

        navigator.requestMIDIAccess()
            .then((midi) => {
                midiAccess = midi;
                for (let input of midi.inputs.values()) {
                    input.onmidimessage = handleMIDIMessage;
                }
            })
            .catch(console.error);

        function handleMIDIMessage(msg: MIDIMessageEvent) {
            if (!msg.data) return; // exit if data is null
            const [status] = msg.data;

            // MIDI Clock
            if (status === 0xf8) incrementClock();
            // Start / Continue
            else if (status === 0xfa || status === 0xfb) resetCounters();
        }

        const incrementClock = () => {
            setClockCounter(prev => {
                const nextClock = prev + 1;
                if (nextClock >= CLOCKS_PER_BEAT) {
                    incrementBeat();
                    return 0;
                }
                return nextClock;
            });
        };

        const incrementBeat = () => {
            setCurrentBeat(prev => {
                const nextBeat = prev + 1;
                if (nextBeat > beatsPerBar) {
                    const nextBar = currentBar + 1;
                    setCurrentBar(nextBar);

                    if (alertBars.includes(nextBar)) {
                        // Optional: replace with visual cue
                        alert(`Approaching bar ${nextBar}!`);
                    }

                    return 1;
                }
                return nextBeat;
            });
        };

        const resetCounters = () => {
            setCurrentBar(1);
            setCurrentBeat(1);
            setClockCounter(0);
        };

        return () => {
            if (midiAccess) {
                for (let input of midiAccess.inputs.values()) {
                    input.onmidimessage = null;
                }
            }
        };
    }, [beatsPerBar, alertBars, currentBar]);

    return (
        <CollapsiblePanel title="MIDI Clock Tracker" isOpen={isOpen} toggle={togglePanel}>
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
    <label style={{ width: "120px", fontWeight: "bold" }}>Current Bar:</label>
    <span>{currentBar}</span>
    </div>
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
    <label style={{ width: "120px", fontWeight: "bold" }}>Current Beat:</label>
    <span>{currentBeat} / {beatsPerBar}</span>
    </div>
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
    <label style={{ width: "120px", fontWeight: "bold" }}>Clock Tick:</label>
    <span>{clockCounter} / {CLOCKS_PER_BEAT}</span>
    </div>
    </div>
    </CollapsiblePanel>
);
};

export default MIDITracker;