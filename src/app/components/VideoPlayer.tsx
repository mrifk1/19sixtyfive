"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./VideoPlayer.module.scss";

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // detect mobile breakpoint (adjust to match your project's breakpoints)
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    // try autoplay on mount
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.then === "function") {
      p.catch(() => setPlaying(false));
    }
  }, [isMobile]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const src = isMobile ? "/videos/playback-mobile.mp4" : "/videos/playback.mp4";

  return (
    <div className={styles.videoSection}>
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          className={styles.video}
          src={src}
          loop
          playsInline
          autoPlay
        />

        {/* overlay that darkens the video on hover */}
        <div className={styles.videoOverlay} aria-hidden="true" />

        <button
          type="button"
          onClick={togglePlay}
          className={styles.playPauseButton}
          aria-pressed={!playing}
          aria-label={playing ? "Pause video" : "Play video"}
        >
          <Image
            src={playing ? "/images/icon/pause.png" : "/images/icon/play.png"}
            alt={playing ? "Pause" : "Play"}
            width={isMobile ? 40 : 64}
            height={isMobile ? 40 : 64}
          />
        </button>
      </div>
    </div>
  );
}
