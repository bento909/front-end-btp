import React, { useState } from "react";
import Resources from "../../Styles/Resources.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../../redux/store.tsx";

interface TemplatePanelProps {
    title?: string;
    children: React.ReactNode;
}

const TemplatePanel: React.FC<TemplatePanelProps> = ({ title = "Template", children }) => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [isOpen, setIsOpen] = useState(false);

    const togglePanel = () => {
        setIsOpen((prev) => !prev);
    };

    return user && user.permissions ? (
        <Resources title={title} isOpen={isOpen} toggle={togglePanel}>
            {children}
        </Resources>
    ) : null;
};

export default TemplatePanel;
