import React from "react";
import styled, { keyframes, css } from "styled-components";

interface Props {
    open: boolean;
    title: string;
    display: string;
    isPaused: boolean;
    pause: () => void;
    resume: () => void;
    stop: () => void;
}

export const WorkoutTimerPopup: React.FC<Props> = ({
                                                       open,
                                                       title,
                                                       display,
                                                       isPaused,
                                                       pause,
                                                       resume,
                                                       stop
                                                   }) => {
    return (
        <Wrapper open={open}>
            <Content>

                {/* --- TOP ROW --- */}
                <TopRow>
                    <ExerciseName>{title}</ExerciseName>

                    <ButtonRow>
                        <StopButton onClick={stop}>STOP</StopButton>
                        {isPaused ? (
                            <PauseButton onClick={resume}>RESUME</PauseButton>
                        ) : (
                            <PauseButton onClick={pause}>PAUSE</PauseButton>
                        )}
                    </ButtonRow>
                </TopRow>

                {/* --- MASSIVE TIME ROW --- */}
                <TimeRow>
                    <Time>{display}</Time>
                </TimeRow>

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

/* ---- Wrapper ---- */
const Wrapper = styled.div<{ open: boolean }>`
    width: 100%;
    margin-top: 20px; /* ← ADDS THE PURPLE GAP ABOVE */
    background: #222;
    color: white;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);

    animation: ${({ open }) => (open ? slideDown : slideUp)} 0.35s ease forwards;
    height: ${({ open }) => (open ? "auto" : "0px")};
`;

const Content = styled.div`
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const TopRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ExerciseName = styled.div`
    font-size: 1.6rem;
    font-weight: 800;
`;

const ButtonRow = styled.div`
    display: flex;
    gap: 10px;
`;

const TimeRow = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
`;

const Time = styled.div`
    font-size: 6rem;      /* MAHOOSIVE */
    font-weight: 900;
    letter-spacing: 2px;
`;


const ButtonBase = css`
    border: none;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    &:active { transform: scale(0.97); }
`;

const StopButton = styled.button`
    ${ButtonBase};
    background: #ff4d4d;
    color: white;
`;

const PauseButton = styled.button`
    ${ButtonBase};
    background: #555;
    color: white;
`;
