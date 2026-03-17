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

// SoundCloud embed helper (unchanged)
const buildSoundcloudEmbedUrl = (trackId: string) =>
    `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}` +
    `&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false`;

// Bandcamp embed helper updated to new style
const buildBandcampEmbedUrl = (albumId: string) =>
    `https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/artwork=small/transparent=true/`;

const MyMusic: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const togglePanel = () => setIsOpen((prev) => !prev);

    // Render SoundCloud embeds
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

    // Render Bandcamp embeds
    const renderBandcampEmbeds = (albums: BandcampAlbum[]) =>
        albums.map((album, index) => (
            <iframe
                key={index}
                title={album.title}
                src={buildBandcampEmbedUrl(album.albumId)}
                style={{
                    border: 0,
                    width: "100%",
                    height: album.height || "120px", // match your example
                    marginBottom: "0.5rem",
                }}
                loading="lazy"
                seamless
            />
        ));

    return (
        <CollapsiblePanel title="My Music" isOpen={isOpen} toggle={togglePanel}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>

                {/* SoundCloud Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <a href="https://soundcloud.com/benjamin-thomas-162154641" target="_blank" rel="noopener noreferrer" style={{ color: "#1DA1F2" }}>
                        Visit SoundCloud
                    </a>
                    {renderSoundcloudEmbeds(soundcloudTracksData)}
                </div>

                {/* Bandcamp Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <a href="https://lessismoreton.bandcamp.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#009CFF" }}>
                        Visit Bandcamp
                    </a>
                    {renderBandcampEmbeds(bandcampAlbumsData)}
                </div>
            </div>
        </CollapsiblePanel>
    );
};

export default MyMusic;