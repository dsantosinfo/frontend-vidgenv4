// File: src/components/VideoEditor/VideoPreview.tsx
// Substitua o conteúdo completo deste arquivo.

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Clock, Maximize2, Download, AlertTriangle, Loader2 } from 'lucide-react'; // CORREÇÃO APLICADA AQUI

interface VideoPreviewProps {
  videoPath: string;
  title?: string;
  className?: string;
  showDownload?: boolean;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoPath,
  title = 'Vídeo',
  className = '',
  showDownload = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getVideoUrl = () => {
    if (videoPath.startsWith('blob:') || videoPath.startsWith('http')) {
      return videoPath;
    }
    return `${import.meta.env.VITE_API_BASE_URL}/uploads/${videoPath}`;
  };

  const videoUrl = getVideoUrl();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.currentSrc !== videoUrl) {
        video.src = videoUrl;
        video.load();
    }
    
    setIsLoading(true);
    setError(null);

    const handleLoadedMetadata = () => { setDuration(video.duration); setIsLoading(false); };
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: Event) => { setError('Erro ao carregar o vídeo.'); setIsLoading(false); console.error("Video Error:", e);};
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoUrl]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || error) return;
    isPlaying ? video.pause() : video.play().catch(setError);
  };
  
  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-black rounded-lg overflow-hidden relative group ${className}`}>
      <video ref={videoRef} className="w-full h-full object-contain" playsInline />

      {(isLoading || error) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-4 text-center">
            {isLoading && <Loader2 className="w-8 h-8 animate-spin" />}
            {error && !isLoading && <>
                <AlertTriangle className="w-8 h-8 mb-2 text-red-400" />
                <p className="text-sm font-semibold">{error}</p>
            </>}
        </div>
      )}

      {/* Controles customizados */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <input type="range" min="0" max={duration || 1} value={currentTime} onChange={e => videoRef.current && (videoRef.current.currentTime = parseFloat(e.target.value))} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer range-slider"/>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-blue-300">{isPlaying ? <Pause size={20}/> : <Play size={20}/>}</button>
            <div className="flex items-center gap-2">
               <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-blue-300">{isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}</button>
               <input type="range" min="0" max="1" step="0.1" value={isMuted ? 0 : volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
            </div>
            <span className="text-white text-xs font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <div className="flex items-center gap-3">
            {showDownload && <a href={videoUrl} download={title} className="text-white hover:text-blue-300" title="Baixar"><Download size={18}/></a>}
            <button onClick={() => videoRef.current?.requestFullscreen()} className="text-white hover:text-blue-300" title="Tela Cheia"><Maximize2 size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;