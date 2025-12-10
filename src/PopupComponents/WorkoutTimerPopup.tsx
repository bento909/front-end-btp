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
                </Left>

                <Right>
                    <Time>{display}</Time>
                    <StopButton onClick={stop}>STOP</StopButton>
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

/* ---- Animated wrapper that pushes layout down ---- */
const Wrapper = styled.div<{ open: boolean }>`
    width: 100%;
    overflow: hidden;
    background: #222;
    color: white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);

    animation: ${({ open }) => (open ? slideDown : slideUp)} 0.35s ease forwards;

    /* If closed, collapse height fully after animation */
    height: ${({ open }) => (open ? "auto" : "0px")};
`;

/* ---- Inside layout ---- */
const Content = styled.div`
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Left = styled.div`
    flex: 1;
`;

const Title = styled.div`
    font-size: 1.2rem;
    font-weight: bold;
`;

const Right = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
`;

const Time = styled.div`
    font-size: 2.4rem;
    font-weight: 900;
    letter-spacing: 1px;
`;

const StopButton = styled.button`
    background: #ff4d4d;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: bold;
    color: white;
    cursor: pointer;

    &:active {
        transform: scale(0.97);
    }
`;
