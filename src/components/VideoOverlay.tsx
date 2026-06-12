"use client";

import React, { useEffect } from "react";
import { X, ExternalLink, Play, Video } from "lucide-react";

interface VideoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  recipeTitle: string;
}

export function VideoOverlay({ isOpen, onClose, videoUrl, recipeTitle }: VideoOverlayProps) {
  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Check if it is a embeddable YouTube URL
  const getYoutubeEmbedUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtu.be")) {
        let videoId = "";
        if (parsed.hostname.includes("youtu.be")) {
          videoId = parsed.pathname.slice(1);
        } else {
          videoId = parsed.searchParams.get("v") || "";
        }
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
    } catch (e) {
      // invalid url
    }
    return null;
  };

  const embedUrl = getYoutubeEmbedUrl(videoUrl);
  const isYoutube = !!embedUrl;
  const isTikTok = videoUrl.includes("tiktok.com");
  const isInstagram = videoUrl.includes("instagram.com") || videoUrl.includes("instagram.com/reels");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with strong blur and dimming */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 sticky top-0">
          <div>
            <h3 className="font-bold text-slate-100 text-sm line-clamp-1">{recipeTitle}</h3>
            <p className="text-[10px] text-slate-400 line-clamp-1">{videoUrl}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Body */}
        <div className="flex-1 bg-black flex flex-col items-center justify-center min-h-[240px]">
          {isYoutube && embedUrl ? (
            <div className="w-full aspect-video">
              <iframe
                src={embedUrl}
                title={recipeTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-6">
              {/* Custom Branded Cards for Instagram Reels and TikTok */}
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center animate-bounce">
                {isYoutube ? (
                  <Video className="w-8 h-8 text-red-500" />
                ) : (
                  <Play className="w-8 h-8 text-orange-500 fill-orange-500" />
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-100">
                  {isTikTok
                    ? "Watch on TikTok"
                    : isInstagram
                    ? "Watch on Instagram Reels"
                    : "Watch Cooking Video"}
                </h4>
                <p className="text-xs text-slate-400 max-w-[280px]">
                  This content is external and cannot be embedded directly due to platform security guidelines.
                </p>
              </div>

              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
              >
                Open Video App
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 text-center">
          <p className="text-[10px] text-slate-400">
            OpenClaw AI Ingested • Mobile-Responsive Player
          </p>
        </div>
      </div>
    </div>
  );
}
