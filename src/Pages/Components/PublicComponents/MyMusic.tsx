// src/components/MusicLinks.tsx
import React, { useState } from "react";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";

interface MusicLinksProps {
    soundcloudUrl?: string;
    bandcampUrl?: string;
}

const MyMusic: React.FC<MusicLinksProps> = ({
                                                   soundcloudUrl = "https://soundcloud.com/benjamin-thomas-162154641",
                                                   bandcampUrl = "https://lessismoreton.bandcamp.com/",
                                               }) => {
    const [isOpen, setIsOpen] = useState(false);
    const togglePanel = () => setIsOpen(prev => !prev);

    return (
        <CollapsiblePanel title="My Music" isOpen={isOpen} toggle={togglePanel}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <label style={{ width: "120px", fontWeight: "bold" }}>SoundCloud:</label>
                    <a href={soundcloudUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#1DA1F2" }}>
                        Listen here
                    </a>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <label style={{ width: "120px", fontWeight: "bold" }}>Bandcamp:</label>
                    <a href={bandcampUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#009CFF" }}>
                        Listen here
                    </a>
                </div>
            </div>
        </CollapsiblePanel>
    );
};

export default MyMusic;