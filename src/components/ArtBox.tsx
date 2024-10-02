import React, { useState, useRef, useEffect } from 'react';
import { PAGE_ASCII_ART, TYPING_SPEED, DELETE_SPEED, SCROLL_COOLDOWN, INTERFACE_COLOR, BACKGROUND_COLOR } from '../constants';

interface ArtBoxProps {
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

let DISPLAYED_ART = PAGE_ASCII_ART[0].content;

const ArtBox: React.FC<ArtBoxProps> = ({ currentPage, setCurrentPage }) => {
    const [displayedArt, setDisplayedArt] = useState(DISPLAYED_ART); // Tracks current displayed ASCII art
    const [isCooldown, setIsCooldown] = useState(false); // Cooldown to prevent rapid scrolls
    const typingInterval = useRef<number | null>(null); // Track the typing interval
    const deleteInterval = useRef<number | null>(null); // Track the deletion interval

    const startTypingAnimation = (newPage: number) => {
        // Clear any ongoing typing/deleting intervals
        stopTyping();
        stopDeleting();

        // Reset displayed art to the current page content
        const newText = PAGE_ASCII_ART[newPage].content;

        // Find the length of the common prefix
        let commonPrefixLength = findCommonPrefixLength(DISPLAYED_ART, newText);

        const ITERS = 50;
        let deleteSize = Math.ceil((DISPLAYED_ART.length - commonPrefixLength) / ITERS);
        let writeSize = Math.ceil((newText.length - commonPrefixLength) / ITERS);
        deleteInterval.current = window.setInterval(() => {
            if (DISPLAYED_ART.length > commonPrefixLength) {
                DISPLAYED_ART = DISPLAYED_ART.slice(0, -deleteSize);
                setDisplayedArt(DISPLAYED_ART);
            } else {
                stopDeleting();
                let typedText = DISPLAYED_ART;
                typingInterval.current = window.setInterval(() => {
                    if (typedText.length === newText.length) {
                        if (typingInterval.current !== null) {
                            clearInterval(typingInterval.current);
                            typingInterval.current = null;
                        }
                    } else {
                        const nextChunk = newText.slice(typedText.length, typedText.length + writeSize);
                        typedText += nextChunk;
                        DISPLAYED_ART = typedText;
                        setDisplayedArt(DISPLAYED_ART);
                    }
                }, TYPING_SPEED);
            }
        }, DELETE_SPEED);
    };

    const stopTyping = () => {
        if (typingInterval.current !== null) {
            clearInterval(typingInterval.current);
            typingInterval.current = null;
        }
    };

    const stopDeleting = () => {
        if (deleteInterval.current !== null) {
            clearInterval(deleteInterval.current);
            deleteInterval.current = null;
        }
    };

    const handleScroll = (deltaY: number) => {
        if (isCooldown) return;
        setIsCooldown(true);
        setTimeout(() => setIsCooldown(false), SCROLL_COOLDOWN);

        const direction = deltaY > 0 ? 'down' : 'up';
        let newPage = currentPage;

        if (direction === 'down' && currentPage < PAGE_ASCII_ART.length
            - 1) {
            newPage = currentPage + 1;
        } else if (direction === 'up' && currentPage > 0) {
            newPage = currentPage - 1;
        }

        if (newPage !== currentPage) {
            setCurrentPage(newPage);
            startTypingAnimation(newPage);
        }
    };

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            handleScroll(e.deltaY);
        };

        window.addEventListener('wheel', handleWheel);
        return () => window.removeEventListener('wheel', handleWheel);
    }, [currentPage, isCooldown]);

    useEffect(() => {
        startTypingAnimation(0);
    }, []);

    const calculateFontSize = (text: string) => {
        const lines = text.split('\n').length;
        if (lines < 10) return '1.5rem';
        if (lines < 20) return '1.25rem';
        if (lines < 30) return '1rem';
        return '0.75rem';
    };

    const fontSize = calculateFontSize(displayedArt);

    return (
        <div style={{ borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR, display: 'flex', justifyContent: 'center' }} className={`border p-4 text-xs`}>
            <pre style={{ textAlign: 'center', fontSize }}>{displayedArt}</pre>
        </div>
    );
};

function findCommonPrefixLength(str1: string, str2: string): number {
    let length = 0;
    const minLength = Math.min(str1.length, str2.length);

    for (let i = 0; i < minLength; i++) {
        if (str1[i] === str2[i]) {
            length++;
        } else {
            break;
        }
    }
    return length;
}

export default ArtBox;