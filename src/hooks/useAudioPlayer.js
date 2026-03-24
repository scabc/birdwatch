import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioPlayer = (src) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => setIsPlaying(false);
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, []);

    const play = useCallback(() => {
        audioRef.current?.play();
        setIsPlaying(true);
    }, []);

    const pause = useCallback(() => {
        audioRef.current?.pause();
        setIsPlaying(false);
    }, []);

    const toggle = useCallback(() => {
        if (isPlaying) pause();
        else play();
    }, [isPlaying, play, pause]);

    return {
        audioRef,
        isPlaying,
        play,
        pause,
        toggle
    };
};
