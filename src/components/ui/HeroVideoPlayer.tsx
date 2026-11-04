"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";

export default function HeroVideoPlayer() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Respect user's motion preference (Vercel Web Interface Guidelines)
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setIsPlaying(false);
      return;
    }

    // Attempt auto-play safely in both real browsers and jsdom test environments
    if (videoRef.current) {
      try {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined && typeof playPromise.then === "function") {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
      } catch {
        // Silently handle environments where media playback is mocked or disabled
      }
    }
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      try {
        videoRef.current.pause();
      } catch {}
      setIsPlaying(false);
    } else {
      try {
        const p = videoRef.current.play();
        if (p !== undefined && typeof p.then === "function") {
          p.catch(() => {});
        }
      } catch {}
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    try {
      videoRef.current.currentTime = 0;
      const p = videoRef.current.play();
      if (p !== undefined && typeof p.then === "function") {
        p.catch(() => {});
      }
    } catch {}
    setIsPlaying(true);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl group bg-brand-navy-deep">
      {/* 1. Automotive Video Clip with Fallback Poster */}
      <div className="relative w-full h-[280px] sm:h-[380px] lg:h-[450px] overflow-hidden bg-brand-navy">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onLoadedData={() => setIsLoaded(true)}
          poster="/images/chauffeur-indian.jpg"
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        >
          <source src="/videos/heroclip.mp4" type="video/mp4" />
        </video>

        {/* Fallback poster while initializing */}
        <img
          src="/images/chauffeur-indian.jpg"
          alt="Professional Indian Acting Driver for Personal Cars"
          width={800}
          height={450}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 pointer-events-none ${
            isLoaded ? "opacity-0" : "opacity-100"
          }`}
          loading="eager"
        />

        {/* Gradient dark overlays for cinematic depth and contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-transparent opacity-80 pointer-events-none" aria-hidden="true" />
      </div>

      {/* 2. Top-right Video Player Controls (Play/Pause, Mute/Unmute, Restart) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="p-2.5 rounded-full bg-brand-navy/80 hover:bg-brand-navy text-white border border-white/20 backdrop-blur-md shadow-md transition-[background-color,transform] duration-150 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
          title={isPlaying ? "Pause Video" : "Play Video"}
          aria-label={isPlaying ? "Pause Video" : "Play Video"}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" aria-hidden="true" />
          )}
        </button>

        <button
          onClick={toggleMute}
          className="p-2.5 rounded-full bg-brand-navy/80 hover:bg-brand-navy text-white border border-white/20 backdrop-blur-md shadow-md transition-[background-color,transform] duration-150 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
          aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-brand-orange" aria-hidden="true" />
          )}
        </button>

        <button
          onClick={handleRestart}
          className="p-2.5 rounded-full bg-brand-navy/80 hover:bg-brand-navy text-white border border-white/20 backdrop-blur-md shadow-md transition-[background-color,transform] duration-150 hover:scale-105 active:scale-95 hidden sm:flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
          title="Restart Video"
          aria-label="Restart Video"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* 3. Bottom Floating Glass Pill Bar (Indian Acting Driver & Car Specialists) */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#11243D]/90 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-xl z-20">
        <div className="min-w-0">
          <span className="text-white font-heading font-bold text-xs sm:text-sm block leading-tight truncate">
            Swift, Innova, Creta & Luxury Cars
          </span>
          <span className="text-brand-orange text-[10px] sm:text-[11px] font-sans font-medium block">
            Manual & Automatic Specialists
          </span>
        </div>
        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 font-sans text-[10px] sm:text-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>24/7 Doorstep Ready</span>
        </span>
      </div>
    </div>
  );
}
