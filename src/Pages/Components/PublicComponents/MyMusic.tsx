// src/components/MusicLinks.tsx
import React, { useState } from "react";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";

interface SoundcloudTrack {
    title: string;
    trackId: string;
    height?: string; // optional override
}

interface BandcampAlbum {
    title: string;
    albumId: string;
    size?: "small" | "large"; // defaults to small
    height?: string; // optional override
}

interface MusicLinksProps {
    soundcloudUrl?: string; // fallback link
    soundcloudTracks?: SoundcloudTrack[];
    bandcampUrl?: string; // fallback link
    bandcampAlbums?: BandcampAlbum[];
}

// Helper to build SoundCloud embed URL
const buildSoundcloudEmbedUrl = (trackId: string) =>
    `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}` +
    `&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false`;

// Helper to build Bandcamp embed URL
const buildBandcampEmbedUrl = (albumId: string, size: "small" | "large" = "small") =>
    `https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=${size}/bgcol=ffffff/linkcol=0687f5/transparent=true/`;

const MyMusic: React.FC<MusicLinksProps> = ({
                                                soundcloudUrl = "https://soundcloud.com/benjamin-thomas-162154641",
                                                soundcloudTracks = [
                                                    { title: "A Lullaby For Remy", trackId: "1997731411" },
                                                    { title: "Electro Mix - 30 October 2023", trackId: "1652587413" },
                                                ],

                                                bandcampUrl = "https://lessismoreton.bandcamp.com/",
                                                bandcampAlbums = [
                                                    { title: "Diesel Hyperspace", albumId: "4100750596", size: "small" },
                                                    { title: "EP1 by Benjamin Thomas", albumId: "3601145018", size: "large" },
                                                ],
                                            }) => {
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
                src={buildBandcampEmbedUrl(album.albumId, album.size || "small")}
                style={{ border: 0, width: "100%", height: album.height || (album.size === "large" ? "120px" : "42px"), marginBottom: "0.5rem" }}
                loading="lazy"
            />
        ));

    return (
        <CollapsiblePanel title="My Music" isOpen={isOpen} toggle={togglePanel}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>

                {/* SoundCloud Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{ fontWeight: "bold" }}>SoundCloud:</label>
                    {renderSoundcloudEmbeds(soundcloudTracks)}
                    <a href={soundcloudUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#1DA1F2" }}>
                        Visit SoundCloud
                    </a>
                </div>

                {/* Bandcamp Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{ fontWeight: "bold" }}>Bandcamp:</label>
                    {renderBandcampEmbeds(bandcampAlbums)}
                    <a href={bandcampUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#009CFF" }}>
                        Visit Bandcamp
                    </a>
                </div>
            </div>
        </CollapsiblePanel>
    );
};

export default MyMusic;