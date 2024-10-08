import React, { useCallback, useState, useRef, useEffect } from "react";
import { PAGE_ASCII_ART, INTERFACE_COLOR, BACKGROUND_COLOR, TYPING_SPEED, DELETE_SPEED } from "../constants";

interface ArtBoxProps {
	currentPage: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

let DISPLAYED_ART = PAGE_ASCII_ART[0].content;

const ArtBox: React.FC<ArtBoxProps> = ({ currentPage, setCurrentPage }) => {
	const [displayedArt, setDisplayedArt] = useState(DISPLAYED_ART); // Tracks current displayed ASCII art
	const isCooldownRef = useRef(false); // Cooldown to prevent rapid scrolls
	const typingInterval = useRef<number | null>(null); // Track the typing interval
	const deleteInterval = useRef<number | null>(null); // Track the deletion interval
	const artBoxRef = useRef<HTMLDivElement | null>(null);
	const [dimensions, setDimensions] = useState({ width: 1, height: 1 });

	// Determine the dimensions of the art box
	useEffect(() => {
		const updateDimensions = () => {
			if (artBoxRef.current) {
				setDimensions({
					width: artBoxRef.current.offsetWidth,
					height: artBoxRef.current.offsetHeight,
				});
			}
		};

		updateDimensions();
		window.addEventListener("resize", updateDimensions);

		return () => {
			window.removeEventListener("resize", updateDimensions);
		};
	}, []);


	const startTypingAnimation = useCallback((newPage: number) => {
		if (isCooldownRef.current) {
			return;
		}
		isCooldownRef.current = true;
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
		isCooldownRef.current = false;

        // Start the typing/deleting animation
		const ITERS = 25;
		let deleteSize = Math.ceil((DISPLAYED_ART.length - commonPrefixLength) / ITERS);
		let writeSize = Math.ceil((newText.length - commonPrefixLength) / ITERS);
		deleteInterval.current = window.setInterval(() => {
			if (DISPLAYED_ART.length > commonPrefixLength) {         // Allows writing or deleting to be interuppted and resumed
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
	}, []);

	useEffect(() => {
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
						setCurrentPage(page.id);
						startTypingAnimation(page.id);
						return;
					}
				}
			}

			const headers = document.querySelectorAll("h1[id], h2[id], h3[id]");
			headers.forEach((header) => {
				observer.observe(header);
			});

			return () => {
				observer.disconnect();
			};
		};

		const contentBox = document.querySelector(".contentBox");
		if (contentBox) {
			const handleScroll = () => {
				detectHeaders();
			};

			contentBox.addEventListener("scroll", handleScroll);

			return () => {
				contentBox.removeEventListener("scroll", handleScroll);
			};
		}
	});

	useEffect(() => {
		startTypingAnimation(0);
	}, [startTypingAnimation]);

	// Creates growing text effect, esp for long ASCII art
	const calculateFontSizeAndLineHeight = (text: string) => {
		const lines = text.split("\n").length;

		// const containerWidth = dimensions.width;
		const containerHeight = dimensions.height;

		let fontSize = ``;
		let lineHeight = `${400 / lines / 16 * (containerHeight/ 450)}rem`;

        console.log(containerHeight);

		if (lines > 70) {
			fontSize = `${0.40 * ((containerHeight / 500))}rem`;
		} else if (lines > 60) {
			fontSize = `${0.55 * ((containerHeight / 500))}rem`;
		} else if (lines > 50) {
			fontSize = `${0.65 * ((containerHeight / 500))}rem`;
		} else if (lines > 40) {
			fontSize = `${0.7* ((containerHeight / 500))}rem`;
		} else {
			fontSize = `${0.8 * ((containerHeight / 500))}rem`;
		}

		return { fontSize, lineHeight };
	};

	const { fontSize, lineHeight } = calculateFontSizeAndLineHeight(displayedArt);

	return (
		<div
			ref={artBoxRef}
			style={{
				backgroundColor: BACKGROUND_COLOR,
				display: "flex",
				justifyContent: "center",
				alignItems: "center", // Align items to the top
				overflow: "hidden",
				borderColor: INTERFACE_COLOR,
			}}
			className='md:border z-20'>
			<pre className='hidden md:block text-center' style={{ fontSize, lineHeight }}>
				{displayedArt}
			</pre>
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
