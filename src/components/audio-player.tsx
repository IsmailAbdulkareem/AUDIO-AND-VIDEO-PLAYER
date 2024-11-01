"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  PlayIcon,
  PauseIcon,
  Volume2Icon,
  VolumeXIcon,
  RewindIcon,
  FastForwardIcon,
  UploadIcon,
  ChevronRightIcon,
} from "lucide-react";

interface VideoTrack {
  title: string;
  src: string;
}

const MediaPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [tracks, setTracks] = useState<VideoTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = (e.target as HTMLDivElement).getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newTracks: VideoTrack[] = Array.from(files).map((file) => ({
        title: file.name,
        src: URL.createObjectURL(file),
      }));
      setTracks((prevTracks) => [...prevTracks, ...newTracks]);
      setCurrentTrackIndex(0); // Start from the first uploaded file
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }
  };

  const playNextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  };

  useEffect(() => {
    if (videoRef.current && tracks[currentTrackIndex]) {
      videoRef.current.pause(); // Pause before loading a new video to avoid conflicts
      videoRef.current.src = tracks[currentTrackIndex].src;
      videoRef.current.load();

      // Ensure video doesn't autoplay immediately; wait for the user to press play
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);

      // Attach a "loadeddata" listener to play the video if it's supposed to be playing
      const onLoadedData = () => {
        if (isPlaying) {
          videoRef.current?.play();
        }
      };
      videoRef.current.addEventListener("loadeddata", onLoadedData);

      return () => {
        videoRef.current?.removeEventListener("loadeddata", onLoadedData);
      };
    }
  }, [currentTrackIndex, tracks]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="relative w-[720px] bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          controls={false}
        />

        {/* Custom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          {/* Progress Bar */}
          <div
            className="w-full h-2 bg-gray-600 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              {/* Play/Pause Button */}
              <Button variant="ghost" size="icon" onClick={togglePlayPause}>
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6 text-white" />
                ) : (
                  <PlayIcon className="w-6 h-6 text-white" />
                )}
              </Button>

              {/* Volume Toggle */}
              <Button variant="ghost" size="icon" onClick={toggleMute}>
                {isMuted ? (
                  <VolumeXIcon className="w-6 h-6 text-white" />
                ) : (
                  <Volume2Icon className="w-6 h-6 text-white" />
                )}
              </Button>

              {/* Time Display */}
              <span className="text-sm text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Playback Speed Controls */}
            <div className="flex gap-2">
              {[0.5, 1, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handlePlaybackRateChange(rate)}
                  className={`text-sm ${
                    playbackRate === rate ? "text-blue-500" : "text-white"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Skip Buttons */}
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime -= 10;
                  }
                }}
              >
                <RewindIcon className="w-6 h-6 text-white" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime += 10;
                  }
                }}
              >
                <FastForwardIcon className="w-6 h-6 text-white" />
              </Button>
            </div>

            {/* Next Track Button */}
            <Button variant="ghost" size="icon" onClick={playNextTrack}>
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </Button>
          </div>

          {/* Upload Button */}
          <div className="flex items-center justify-end mt-4">
            <label htmlFor="upload" className="cursor-pointer">
              <UploadIcon className="w-6 h-6 text-white" />
              <input
                type="file"
                id="upload"
                accept="audio/*,video/*"
                multiple
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </label>
            <span className="text-white text-sm ml-2">
              {tracks[currentTrackIndex]?.title || ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPlayer;
