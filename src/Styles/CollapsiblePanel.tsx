import styled from "styled-components";

interface CollapsiblePanelProps {
    title: string;
    isOpen: boolean;
    toggle: () => void;
    children?: React.ReactNode;
}

const Panel = styled.div<{ isOpen: boolean }>`
    background-color: #fff;
    color: #000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 12px;
    width: 100%;
    //max-width: 600px; TRY without max-width
    margin: 12px auto;
    box-sizing: border-box;
    
    @media (max-width: 480px) {
        border-radius: 10px;
        padding: 10px;
        width: 100%;
    }
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
`;

export const Button = styled.button<{ isOpen: boolean }>`
    min-width: 110px;
    padding: 8px 12px;
    background-color: ${({isOpen}) => (isOpen ? "#fff" : "#000")};
    color: ${({isOpen}) => (isOpen ? "#000" : "#fff")};
    border: 1px solid #000;
    cursor: pointer;
    font-size: 14px;
    border-radius: 5px;
`;

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({title, isOpen, toggle, children}) => {
    return (
        <Panel isOpen={isOpen}>
            <Header>
                <h2 style={{margin: 0}}>{title}</h2>
                <Button isOpen={isOpen} onClick={toggle}>
                    {isOpen ? "Close" : "View"}
                </Button>
            </Header>
            {isOpen && children}
        </Panel>
    );
};

export default CollapsiblePanel;
