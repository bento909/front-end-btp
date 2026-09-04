import React from "react";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";

const Bio: React.FC = () => {
    const togglePanel = () => setIsOpen(prev => !prev);
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <CollapsiblePanel title="Biography" isOpen={isOpen} toggle={togglePanel}>
            <div>
                Ben Thomas is a Software Engineer, Personal Trainer and Electronic Music enthusiast from Wirral. 
                Please use the contact form on this page to send an enquiry.
            </div>
        </CollapsiblePanel>
    )
}

export default Bio;

