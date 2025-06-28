import styled from "styled-components";

interface CollapsiblePanelProps {
    title: string;
    isOpen: boolean;
    toggle: () => void;
    children?: React.ReactNode;
}

const Panel = styled.div<{ isOpen: boolean }>`
    background-color: ${({ isOpen }) => (isOpen ? "#fff" : "#fff")};
    color: ${({ isOpen }) => (isOpen ? "#000" : "#000")};
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 8px;
    position: relative;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
`;

export const Button = styled.button<{ isOpen: boolean }>`
    min-width: 110px;
    padding: 8px 12px;
    background-color: ${({ isOpen }) => (isOpen ? "#fff" : "#000")};
    color: ${({ isOpen }) => (isOpen ? "#000" : "#fff")};
    border: 1px solid #000;
    cursor: pointer;
    font-size: 14px;
    border-radius: 5px;
`;

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({ title, isOpen, toggle, children }) => {
    return (
        <Panel isOpen={isOpen}>
            <Header>
                <h2 style={{ margin: 0 }}>{title}</h2>
                <Button isOpen={isOpen} onClick={toggle}>
                    {isOpen ? "Close Form" : "View Form"}
                </Button>
            </Header>
            {isOpen && children}
        </Panel>
    );
};

export default CollapsiblePanel;
