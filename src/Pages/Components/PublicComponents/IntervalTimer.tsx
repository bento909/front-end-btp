import React from "react";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";
import {useWorkoutTimer} from "../../../Hooks/useWorkoutTimer.ts";

const IntervalTimer: React.FC = () => {
    const togglePanel = () => setIsOpen(prev => !prev);
    const [isOpen, setIsOpen] = React.useState(false);

    const timer = useWorkoutTimer();

    const phases = [
        {name: "Phase 1", duration: 10},
        {name: "Phase 2", duration: 9},
        {name: "Phase 3", duration: 8},
        {name: "Phase 4", duration: 7},
        {name: "Phase 5", duration: 6},
    ];

    let index = 0;

    function runNextPhase() {
        if (index >= phases.length) return;

        const phase = phases[index++];
        timer.setOnComplete(runNextPhase);
        timer.start(phase.name, phase.duration);
    }

    return (
        <CollapsiblePanel title="Interval Timer" isOpen={isOpen} toggle={togglePanel}>
            <div>
                <button onClick={runNextPhase}>CLICK ME I AM A SEX BUTTON</button>
            </div>
        </CollapsiblePanel>
    )
}

export default IntervalTimer;

