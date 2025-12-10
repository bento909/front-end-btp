import React from "react";

interface Props {
    open: boolean;
    title: string;
    display: string;
    stop: () => void;
}

export const WorkoutTimerPopup: React.FC<Props> = ({
                                                       open,
                                                       title,
                                                       display,
                                                       stop,
                                                   }) => {
    if (!open) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                padding: 20,
                border: "2px solid #444",
                background: "white",
                width: 240,
                textAlign: "center",
                borderRadius: 12,
                boxShadow: "0 0 20px rgba(0,0,0,0.3)",
                zIndex: 9999,
            }}
        >
            <h3>{title}</h3>
            <div style={{ fontSize: 32, margin: "10px 0" }}>{display}</div>
            <button onClick={stop}>Stop</button>
        </div>
    );
};
