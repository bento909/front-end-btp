import React from "react";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";
import {useTimer} from "../../../Context/WorkoutTimerContext.tsx";

const IntervalTimer: React.FC = () => {
    const togglePanel = () => setIsOpen(prev => !prev);
    const [isOpen, setIsOpen] = React.useState(false);

    const timer = useTimer();

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

        const phase = phases[index];
        const isLast = index === phases.length - 1;

        // Attach callback that handles next phase + final beep
        timer.setOnComplete(() => {
            if (!isLast) {
                index++;
                runNextPhase();
            } else {
                playBeep(8); // only play at the end
            }
        });

        timer.start(phase.name, phase.duration, { skipPrep: index !== 0 });
    }

    function playBeep(numberOfBeeps: number) {
        for (let i = 0; i < numberOfBeeps; i++) {
            setTimeout(() => timer.beep(200, 700), i * 300);
        }
    }

    return (
        <CollapsiblePanel title="Interval Timer" isOpen={isOpen} toggle={togglePanel}>
            <div>
                <button onClick={runNextPhase}>hardcoded test timer</button>
            </div>
        </CollapsiblePanel>
    )
}

export default IntervalTimer;

