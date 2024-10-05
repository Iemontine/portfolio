import React, { useCallback, useState, useRef, useEffect } from 'react';
import { PAGE_ASCII_ART, SCROLL_COOLDOWN, INTERFACE_COLOR, BACKGROUND_COLOR } from '../constants';

interface ArtBoxProps {
	currentPage: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

let DISPLAYED_ART = PAGE_ASCII_ART[0].content;
const PAGE_WRITE_COOLDOWN = 100; // Cooldown between writing new page content

const ArtBox: React.FC<ArtBoxProps> = ({ currentPage, setCurrentPage }) => {
	const [displayedArt, setDisplayedArt] = useState(DISPLAYED_ART);	// Tracks current displayed ASCII art
	const isCooldownRef = useRef(false); 								// Cooldown to prevent rapid scrolls
	const lastPage = useRef(-1); 								        // Maintains page in event that no header is detected
	const typingInterval = useRef<number | null>(null); 				// Track the typing interval
	const deleteInterval = useRef<number | null>(null); 				// Track the deletion interval
	const cooldownTimeout = useRef<number | null>(null); 				// Track the cooldown timeout

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

		// Set a timeout to respect the PAGE_WRITE_COOLDOWN
		if (cooldownTimeout.current !== null) {
			clearTimeout(cooldownTimeout.current);
		}

		cooldownTimeout.current = window.setTimeout(() => {
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
		}, PAGE_WRITE_COOLDOWN);
	}, []);

	const detectHeaders = () => {
		const visibleHeaders: Set<string> = new Set();
		const observer = new IntersectionObserver(

			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const headerId = entry.target.id;
						const headerElement = document.getElementById(headerId);
						if (headerElement) {
							const rect = headerElement.getBoundingClientRect();
							const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
							if (!isVisible) {
								return;
							}
						}
						const pageIndex = PAGE_ASCII_ART.findIndex((page) => page.headerId === headerId);
						if (pageIndex !== -1) {
							visibleHeaders.add(headerId);
						}
					}
				});
				handleDetectedHeaders(visibleHeaders);
			},
			{ threshold: 0.1 }
		);
		function handleDetectedHeaders(headers: Set<string>) {
			if (headers.size === 0) {
				return;
			}
			// Check for matching headers, and set the current page to the first match
			for (let page of PAGE_ASCII_ART) {
				if (headers.has(page.headerId)) {
					lastPage.current = page.id;
					setCurrentPage(page.id);
					startTypingAnimation(page.id);
					return;
				}
				if (lastPage.current !== -1 && lastPage.current !== 0 && lastPage.current !== currentPage) {
					setCurrentPage(lastPage.current);
					startTypingAnimation(lastPage.current);
				}
			}
		}

		const headers = document.querySelectorAll('h1[id], h2[id], h3[id]');
		headers.forEach((header) => {
			observer.observe(header);
		});

		return () => {
			observer.disconnect();
		};
	};

	useEffect(() => {
		const contentBox = document.querySelector('.contentBox');
		if (contentBox) {
			const handleScroll = () => {
				if (!isCooldownRef.current) {
					isCooldownRef.current = true;
					detectHeaders();
					setTimeout(() => {
						detectHeaders();
						isCooldownRef.current = false;
					}, SCROLL_COOLDOWN);
				}
			};

			contentBox.addEventListener('scroll', handleScroll);

			return () => {
				contentBox.removeEventListener('scroll', handleScroll);
			};
		}
	}, [detectHeaders]);

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
		} else if (lines > 70) {
			fontSize = '0.45rem';
		} else if (lines > 60) {
			fontSize = '0.6rem';
		} else if (lines > 50) {
			fontSize = '0.7rem';
		} else if (lines > 40) {
			fontSize = '0.8rem';
		} else if (lines > 30) {
			fontSize = '0.9rem';
		} else {
			fontSize = `${1}rem`;
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