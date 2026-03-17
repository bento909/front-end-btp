// src/components/MusicLinks.tsx
import React, { useState } from "react";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";

// Import the JSON data
import soundcloudTracksData from "../../../data/soundcloud.json";
import bandcampAlbumsData from "../../../data/bandcamp.json";

interface SoundcloudTrack {
    title: string;
    trackId: string;
    height?: string;
}

interface BandcampAlbum {
    title: string;
    albumId: string;
    height?: string;
}

const buildSoundcloudEmbedUrl = (trackId: string) =>
    `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}` +
    `&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false`;

const buildBandcampEmbedUrl = (albumId: string, size: "small" | "large" = "small") =>
    `https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=${size}/bgcol=ffffff/linkcol=0687f5/transparent=true/`;

const MyMusic: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const togglePanel = () => setIsOpen((prev) => !prev);

    // Render embeds
    const renderSoundcloudEmbeds = (tracks: SoundcloudTrack[]) =>
        tracks.map((track, index) => (
            <iframe
                key={index}
                title={track.title}
                src={buildSoundcloudEmbedUrl(track.trackId)}
                style={{ border: 0, width: "100%", height: track.height || "120px", marginBottom: "0.5rem" }}
                loading="lazy"
                allow="autoplay"
            />
        ));

    const renderBandcampEmbeds = (albums: BandcampAlbum[]) =>
        albums.map((album, index) => (
            <iframe
                key={index}
                title={album.title}
                src={buildBandcampEmbedUrl(album.albumId)} // always uses "small"
                style={{
                    border: 0,
                    width: "100%",
                    height: album.height || "120px",
                    marginBottom: "0.5rem",
                }}
                loading="lazy"
            />
        ));

    return (
        <CollapsiblePanel title="My Music" isOpen={isOpen} toggle={togglePanel}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>

                {/* SoundCloud Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{ fontWeight: "bold" }}>SoundCloud:</label>
                    {renderSoundcloudEmbeds(soundcloudTracksData)}
                    <a href="https://soundcloud.com/benjamin-thomas-162154641" target="_blank" rel="noopener noreferrer" style={{ color: "#1DA1F2" }}>
                        Visit SoundCloud
                    </a>
                </div>

                {/* Bandcamp Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{ fontWeight: "bold" }}>Bandcamp:</label>
                    {renderBandcampEmbeds(bandcampAlbumsData)}
                    <a href="https://lessismoreton.bandcamp.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#009CFF" }}>
                        Visit Bandcamp
                    </a>
                </div>
            </div>
        </CollapsiblePanel>
    );
};

export default MyMusic;