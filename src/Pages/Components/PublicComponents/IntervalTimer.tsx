import React from "react";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";

const IntervalTimer: React.FC = () => {
    const togglePanel = () => setIsOpen(prev => !prev);
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <CollapsiblePanel title="Interval Timer" isOpen={isOpen} toggle={togglePanel}>
            <div>
                Whay are you Gey?
            </div>
        </CollapsiblePanel>
    )
}

export default IntervalTimer;

