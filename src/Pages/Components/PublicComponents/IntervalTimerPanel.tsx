import React from "react";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";
import { IntervalTimerEditor } from "./IntervalTimerEditor";
import { useTimer } from "../../../Context/WorkoutTimerContext";
import { runIntervalTimer } from "./IntervalTimerLogic";

const IntervalTimerPanel: React.FC = () => {
    const togglePanel = () => setIsOpen(prev => !prev);
    const [isOpen, setIsOpen] = React.useState(false);
    const timer = useTimer();

    return (
        <CollapsiblePanel title="Interval Timer" isOpen={isOpen} toggle={togglePanel}>
            <div>
                <IntervalTimerEditor onStartTimer={t => runIntervalTimer(timer, t)} />
            </div>
        </CollapsiblePanel>
    )
}

export default IntervalTimerPanel;

