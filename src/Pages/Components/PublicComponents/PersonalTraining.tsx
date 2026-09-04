import React from "react";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";
import { useNavigate } from "react-router-dom";

const PersonalTraining: React.FC = () => {
    const togglePanel = () => setIsOpen(prev => !prev);
    const [isOpen, setIsOpen] = React.useState(false);
    const navigate = useNavigate();
    
    return (
        <CollapsiblePanel title="Personal Training" isOpen={isOpen} toggle={togglePanel}>
            <div style={{fontStyle: "bold"}}>
                Your Personal Training Programme
            </div>
            <div>
                If you would like a personal training programme created for you,
                or if you are a trainer and would like an app to help you deliver your programmes to your clients,
                please get in touch with Ben using the Contact Form.
            </div>
            <button onClick={() => navigate("/app/home")}>
                Enter
            </button>
        </CollapsiblePanel>
    )
}

export default PersonalTraining;

