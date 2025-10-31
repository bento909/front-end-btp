import React from "react";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";
import { useNavigate } from "react-router-dom";

const PersonalTraining: React.FC = () => {
    const togglePanel = () => setIsOpen(prev => !prev);
    const [isOpen, setIsOpen] = React.useState(false);
    const navigate = useNavigate();
    
    return (
        <CollapsiblePanel title="Personal Training" isOpen={isOpen} toggle={togglePanel}>
            <div>
                Your Personal Training Programme
            </div>
            <button onClick={() => navigate("/app/home")}>
                Enter
            </button>
        </CollapsiblePanel>
    )
}

export default PersonalTraining;

