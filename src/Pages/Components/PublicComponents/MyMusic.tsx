// src/components/MusicLinks.tsx
import React, { useState } from "react";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";

interface EmbedItem {
    url: string;
    title: string;
    height?: string;
}

interface MusicLinksProps {
    soundcloudUrl?: string; // fallback link
    soundcloudEmbeds?: EmbedItem[];
    bandcampEmbeds?: EmbedItem[];
}

const MyMusic: React.FC<MusicLinksProps> = ({
                                                soundcloudUrl = "https://soundcloud.com/benjamin-thomas-162154641",

                                                soundcloudEmbeds = [
                                                    {
                                                        url: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/benjamin-thomas-162154641&color=%231DA1F2",
                                                        title: "SoundCloud Player",
                                                        height: "120px",
                                                    },
                                                ],

                                                bandcampEmbeds = [
                                                    {
                                                        url: "https://bandcamp.com/EmbeddedPlayer/album=4100750596/size=small/bgcol=ffffff/linkcol=0687f5/transparent=true/",
                                                        title: "Diesel Hyperspace",
                                                        height: "42px",
                                                    },
                                                ],
                                            }) => {
    const [isOpen, setIsOpen] = useState(false);
    const togglePanel = () => setIsOpen((prev) => !prev);

    const renderEmbeds = (embeds: EmbedItem[]) =>
        embeds.map((embed, index) => (
            <iframe
                key={index}
                title={embed.title}
                src={embed.url}
                style={{
                    border: 0,
                    width: "100%",
                    height: embed.height || "100px",
                }}
                loading="lazy"
                allow="autoplay"
            />
        ));

    return (
        <CollapsiblePanel title="My Music" isOpen={isOpen} toggle={togglePanel}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>

                {/* SoundCloud Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{ fontWeight: "bold" }}>SoundCloud:</label>

                    {renderEmbeds(soundcloudEmbeds)}

                    {/* fallback link */}
                    <a href={soundcloudUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#1DA1F2" }}>
                        Visit SoundCloud
                    </a>
                </div>

                {/* Bandcamp Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{ fontWeight: "bold" }}>Bandcamp:</label>

                    {renderEmbeds(bandcampEmbeds)}
                </div>
            </div>
        </CollapsiblePanel>
    );
};

export default MyMusic;