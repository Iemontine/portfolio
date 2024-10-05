import React, { useCallback, useState, useRef, useEffect } from 'react';
import { PAGE_ASCII_ART, SCROLL_COOLDOWN, INTERFACE_COLOR, BACKGROUND_COLOR } from '../constants';

interface ArtBoxProps {
	currentPage: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

let DISPLAYED_ART = PAGE_ASCII_ART[0].content;

// TODO: reimplement artbox trigger to be based on what the topmost header is in ContentBox
const ArtBox: React.FC<ArtBoxProps> = ({ currentPage, setCurrentPage }) => {
	const [displayedArt, setDisplayedArt] = useState(DISPLAYED_ART);	// Tracks current displayed ASCII art
	const isCooldownRef = useRef(false); 								// Cooldown to prevent rapid scrolls
	const typingInterval = useRef<number | null>(null); 				// Track the typing interval
	const deleteInterval = useRef<number | null>(null); 				// Track the deletion interval

	const startTypingAnimation = useCallback((newPage: number) => {
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

		// Clear any ongoing typing/deleting intervals
		stopTyping();
		stopDeleting();

		// Reset displayed art to the current page content
		const newText = PAGE_ASCII_ART[newPage].content;

		// Find the length of the common prefix
		let commonPrefixLength = findCommonPrefixLength(DISPLAYED_ART, newText);

		const ITERS = 100;
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
				}, 1);
			}
		}, 1);
	}, []);

	const handleScroll = useCallback((deltaY: number) => {
		if (isCooldownRef.current) return;
		isCooldownRef.current = true;

		setTimeout(() => {
			isCooldownRef.current = false;
		}, SCROLL_COOLDOWN);

		const direction = deltaY > 0 ? 'down' : 'up';
		let newPage = currentPage;

		if (direction === 'down' && currentPage < PAGE_ASCII_ART.length - 1) {
			newPage = currentPage + 1;
		} else if (direction === 'up' && currentPage > 0) {
			newPage = currentPage - 1;
		}

		if (newPage !== currentPage) {
			setCurrentPage(newPage);
			startTypingAnimation(newPage);
		}
	}, [currentPage, setCurrentPage, startTypingAnimation]);

	useEffect(() => {
		const handleWheel = (e: WheelEvent) => {
			handleScroll(e.deltaY);
		};

		const handleTouchStart = (e: TouchEvent) => {
			const touchStartY = e.touches[0].clientY;
			const handleTouchMove = (e: TouchEvent) => {
				const touchEndY = e.touches[0].clientY;
				const deltaY = touchEndY - touchStartY;
				handleScroll(deltaY);
			};
			const handleTouchEnd = () => {
				window.removeEventListener('touchmove', handleTouchMove);
				window.removeEventListener('touchend', handleTouchEnd);
			};

			window.addEventListener('touchmove', handleTouchMove);
			window.addEventListener('touchend', handleTouchEnd);
		};

		window.addEventListener('wheel', handleWheel);
		window.addEventListener('touchstart', handleTouchStart);

		return () => {
			window.removeEventListener('wheel', handleWheel);
			window.removeEventListener('touchstart', handleTouchStart);
		};
	}, [handleScroll]);

	useEffect(() => {
		startTypingAnimation(0);
	}, [startTypingAnimation]);

	// Creates growing text effect, esp for long ASCII art
	const calculateFontSizeAndLineHeight = (text: string) => {
		const lines = text.split('\n').length;
		let fontSize = `${1}rem`;
		let lineHeight = `${420 / lines / 17}rem`;

		if (lines > 80) {
			fontSize = '0.35rem';
		}
		else if (lines > 70) {
			fontSize = '0.45rem';
		}
		else if (lines > 60) {
			fontSize = '0.6rem';
		}
		else if (lines > 50) {
			fontSize = '0.7rem';
		}
		else if (lines > 40) {
			fontSize = '0.8rem';
		}
		else if (lines > 30) {
			fontSize = '0.9rem';
		}

		return { fontSize, lineHeight };
	};

	const { fontSize, lineHeight } = calculateFontSizeAndLineHeight(displayedArt);

	return (
		<div style={{
			borderColor: INTERFACE_COLOR,
			backgroundColor: BACKGROUND_COLOR,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			height: '500px',
			width: '100%',
			overflow: 'hidden'
		}} className={`border p-4 text-xs artBox`}>
			<pre style={{ textAlign: 'center', fontSize, lineHeight }}>{displayedArt}</pre>
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