import React, { useState, useRef, useEffect } from 'react';
import { PAGE_CONTENT, TYPING_SPEED, DELETE_SPEED, SCROLL_COOLDOWN, INTERFACE_COLOR, BACKGROUND_COLOR } from '../constants';

interface ContentBoxProps {
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

let DISPLAYED_TEXT = PAGE_CONTENT[0].content;

const ContentBox: React.FC<ContentBoxProps> = ({ currentPage, setCurrentPage }) => {
  const [displayedText, setDisplayedText] = useState(DISPLAYED_TEXT); // Tracks current displayed text
  const [isCooldown, setIsCooldown] = useState(false); // Cooldown to prevent rapid scrolls
  const typingInterval = useRef<number | null>(null); // Track the typing interval
  const deleteInterval = useRef<number | null>(null); // Track the deletion interval

  const startTypingAnimation = (newPage: number) => {
    // Clear any ongoing typing/deleting intervals
    stopTyping();
    stopDeleting();

    // Reset displayed text to the current page content
    const newText = PAGE_CONTENT[newPage].content;

    // Find the length of the common prefix
      let commonPrefixLength = findCommonPrefixLength(DISPLAYED_TEXT, newText);
      console.log(DISPLAYED_TEXT === newText, DISPLAYED_TEXT, newText, commonPrefixLength);

    deleteInterval.current = window.setInterval(() => {
        // Deleting text up to the common prefix, 5 characters at a time
        if (DISPLAYED_TEXT.length > commonPrefixLength) {
          DISPLAYED_TEXT = DISPLAYED_TEXT.slice(0, -3);
        setDisplayedText(DISPLAYED_TEXT);
      }
      else {
        // Start typing new content from the common prefix
        stopDeleting();

        let typedText = DISPLAYED_TEXT;
        const CHUNK_SIZE = 2; // Number of characters to type at a time
        typingInterval.current = window.setInterval(() => {
          if (typedText.length === newText.length) {
            if (typingInterval.current !== null) {
              clearInterval(typingInterval.current);
              typingInterval.current = null;
            }
          } else {
            const nextChunk = newText.slice(typedText.length, typedText.length + CHUNK_SIZE);
            typedText += nextChunk;
              DISPLAYED_TEXT = typedText;
              
            setDisplayedText(DISPLAYED_TEXT);
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

  // Handle scroll with cooldown and cancel typing
  const handleScroll = (deltaY: number) => {
    if (isCooldown) return;     // Prevent scrolling during cooldown
    setIsCooldown(true);
    setTimeout(() => setIsCooldown(false), SCROLL_COOLDOWN); // Release cooldown after a short time

    const direction = deltaY > 0 ? 'down' : 'up';
    let newPage = currentPage;

    if (direction === 'down' && currentPage < PAGE_CONTENT.length - 1) {
      newPage = currentPage + 1;
    } else if (direction === 'up' && currentPage > 0) {
      newPage = currentPage - 1;
    }

    // On successful scroll
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      startTypingAnimation(newPage);
    }
  };

  // Handle scroll events
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      handleScroll(e.deltaY); // Directly trigger scroll without blocking typing
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentPage, isCooldown]);

  // Trigger the loading of the first page on component mount
  useEffect(() => {
    startTypingAnimation(0);
  }, []);

  return (
    <div style={{ borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR }} className={`row-span-2 border p-4`}>
      {/* Displaying the animated text */}
      <p>{displayedText}</p>
    </div>
  );
};

function findCommonPrefixLength(str1: string, str2: string): number {
    let length = 0;

    // Find the minimum length to avoid index out of bounds
    const minLength = Math.min(str1.length, str2.length);

    // Compare characters one by one
    for (let i = 0; i < minLength; i++) {
        console.log(str1[i], str2[i]);
        if (str1[i] === str2[i]) {
            length++;
        } else {
            break; // Stop when characters differ
        }
    }

    return length;
}

export default ContentBox;