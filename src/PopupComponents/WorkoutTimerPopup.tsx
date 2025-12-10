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
                top: 0,
                left: 0,
                width: "100%",
                background: "#222",
                color: "white",
                padding: "12px 20px",
                zIndex: 9999,
                boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "1.2rem",
            }}
        >
            <div>
                <strong>{title}</strong>
                <div style={{ fontSize: "1.4rem", marginTop: 4 }}>{display}</div>
            </div>

            <button
                onClick={stop}
                style={{
                    background: "#ff5c5c",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 6,
                    color: "white",
                    fontSize: "1rem",
                    cursor: "pointer",
                }}
            >
                Stop
            </button>
        </div>
    );
};