import React from "react";
import styled, { keyframes } from "styled-components";

interface Props {
    open: boolean;
    title: string;
    display: string;
    stop: () => void;
}

export const WorkoutTimerPopup: React.FC<Props> = ({ open, title, display, stop }) => {
    return (
        <Wrapper open={open}>
            <Content>
                <Left>
                    <Title>{title}</Title>
                    <StopButton onClick={stop}>STOP</StopButton>
                </Left>
                
                <Right>
                    <Time>{display}</Time>
                </Right>
            </Content>
        </Wrapper>
    );
};

/* ---- Animations ---- */

const slideDown = keyframes`
    from { transform: translateY(-100%); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
`;

const slideUp = keyframes`
    from { transform: translateY(0); opacity: 1; }
    to   { transform: translateY(-100%); opacity: 0; }
`;

/* ---- Dropdown wrapper ---- */
const Wrapper = styled.div<{ open: boolean }>`
    width: 100%;
    overflow: hidden;
    background: #222;
    color: white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);

    animation: ${({ open }) => (open ? slideDown : slideUp)} 0.35s ease forwards;

    height: ${({ open }) => (open ? "auto" : "0px")};
`;

/* ---- Main internal layout ---- */
const Content = styled.div`
    padding: 20px; /* equal on all sides including top */
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

const Left = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
`;

const Title = styled.div`
    font-size: 1.6rem;
    font-weight: bold;
    line-height: 1.2;
`;

const Right = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

const Time = styled.div`
    font-size: 3.4rem; /* MUCH bigger timer */
    font-weight: 900;
    letter-spacing: 2px;
    line-height: 1;
`;

const StopButton = styled.button`
    background: #ff4d4d;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: bold;
    color: white;
    cursor: pointer;
    width: 110px;

    &:active {
        transform: scale(0.96);
    }
`;
