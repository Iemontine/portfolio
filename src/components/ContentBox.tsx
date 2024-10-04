import React, { useState, useRef, useEffect } from 'react';
import { CONTENT, INTERFACE_COLOR, BACKGROUND_COLOR, SCROLL_COOLDOWN } from '../constants';

const FONT_SIZE = 17;
const LINE_HEIGHT = 1.5;

const ContentBox: React.FC = () => {
	const contentBoxRef = useRef<HTMLDivElement>(null);
	var [topLine, setTopLine] = useState(0);
	const [visibleLines, setVisibleLines] = useState<{ text: string, visible: boolean }[]>([]);
	const [allLines, setAllLines] = useState<{ text: string, visible: boolean }[]>([]);
	const visibleLinesRef = useRef<{ text: string, visible: boolean }[]>([]);
	const allLinesRef = useRef<{ text: string, visible: boolean }[]>([]);
	const animationQueue = useRef<(() => void)[]>([]);
	const linesPerBox = useRef(0);
	const totalLines = useRef(0);
	const isCooldown = useRef(false);

	const createMarkup = (html: string) => ({ __html: html });

	// Calculates the number of characters per line and the number of visible lines that can fit in the box
	const calculateBounds = () => {
		if (contentBoxRef.current) {
			// Get the padding of the content box
			const styles = window.getComputedStyle(contentBoxRef.current);
			const paddingTop = parseFloat(styles.paddingTop);
			const paddingBottom = parseFloat(styles.paddingBottom);

			// Calculate number of visible lines at a time
			const contentHeight = contentBoxRef.current.clientHeight - paddingTop - paddingBottom;
			const visibleLines = Math.floor(contentHeight / (FONT_SIZE * LINE_HEIGHT)) - 2;

			// Calculate the number of that can fit in a line given the width of the box
			const contentWidth = contentBoxRef.current.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
			const avgCharWidth = FONT_SIZE * 0.505; // Approximate average character width
			const charsPerLine = Math.floor(contentWidth / avgCharWidth);

			return { charsPerLine, visibleLines };
		}
		return { charsPerLine: 0, visibleLines: 0 };
	};

	// Splits the page content into and tracks visibility of lines that can fit inside the ContentBox
	const splitContent = (text: string, charsPerLine: number, linesPerBox: number) => {
		const lines: { text: string, visible: boolean }[] = [];
		const paragraphs = text.split('<br>');
		let currentLine = '';
		let isInHtmlTag = false;
		let htmlTagBuffer = '';
		let visibleChars = 0;

		// Processes each word in the text, splitting it into lines, tracking visible or non-visible lines
		let outOfBounds = true;
		const processWord = (word: string) => {
			if (word.startsWith('<')) isInHtmlTag = true;
			if (isInHtmlTag) {
				htmlTagBuffer += word + ' ';
				if (word.endsWith('>')) {
					isInHtmlTag = false;
					currentLine += htmlTagBuffer;
					htmlTagBuffer = '';
				}
			} else {
				if (visibleChars + word.length <= charsPerLine) {
					currentLine += (currentLine && !currentLine.endsWith('>') ? ' ' : '') + word;
					visibleChars += word.length;
				} else {
					if (currentLine) {
						lines.push({ text: currentLine, visible: outOfBounds });
						currentLine = '';
						visibleChars = 0;
					}
					currentLine = word;
					visibleChars = word.length;
				}
			}
			// Limits the number of lines displayed to only the number of lines that can fit in the box
			if (lines.length >= linesPerBox) {
				outOfBounds = false;
			}
		};

		for (const paragraph of paragraphs) {
			const words = paragraph.split(/(\s+)/).filter(Boolean);
			for (const word of words) {
				processWord(word)
			}

			// Newline after each paragraph (or header, etc.)
			if (currentLine) {
				lines.push({ text: currentLine, visible: outOfBounds });
				currentLine = '';
				visibleChars = 0;
			}
		}
		return lines;
	};


	const updateContent = () => {
		const { charsPerLine, visibleLines } = calculateBounds();
		linesPerBox.current = visibleLines;

		const allContent = splitContent(CONTENT, charsPerLine, visibleLines);
		allLinesRef.current = allContent;
		setAllLines(allContent); // Updates the state

		totalLines.current = allContent.length;

		const visibleContent_filtered = allContent.filter(line => line.visible);
		setVisibleLines(visibleContent_filtered); // Updates the state
		visibleLinesRef.current = visibleContent_filtered; // Sync the ref
	};

	const handleScroll = (deltaY: number) => {
		if (isCooldown.current) return;
		isCooldown.current = true;

		setTimeout(() => {
			isCooldown.current = false;
		}, SCROLL_COOLDOWN);

		const direction = deltaY > 0 ? 'down' : 'up';

		setTopLine(topLine => {
			if (direction === 'down') {
				if (topLine + linesPerBox.current >= totalLines.current)
					return topLine;
				allLinesRef.current[topLine].visible = false;
				allLinesRef.current[topLine + linesPerBox.current].visible = true;

				console.log(topLine, linesPerBox.current, topLine + linesPerBox.current);

				const visibleContent_filtered = allLinesRef.current.filter(line => line.visible);
				setVisibleLines(visibleContent_filtered); // Updates the state
				topLine += 1;
			}
			else {
				if (topLine === 0)
					return topLine;
				allLinesRef.current[topLine + linesPerBox.current - 1].visible = false;
				allLinesRef.current[topLine - 1].visible = true;

				const visibleContent_filtered = allLinesRef.current.filter(line => line.visible);
				setVisibleLines(visibleContent_filtered); // Updates the state
				topLine -= 1;
			}
			// console.log(linesPerBox.current, totalLines.current, topLine);

			return topLine;
		});
	};

	useEffect(() => {
		updateContent();
		const resizeObserver = new ResizeObserver(updateContent);
		if (contentBoxRef.current) {
			resizeObserver.observe(contentBoxRef.current);
		}

		const handleWheel = (e: WheelEvent) => {
			handleScroll(e.deltaY);
		}
		window.addEventListener('wheel', handleWheel);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('wheel', handleWheel);
		};
	}, []);

	return (
		<div
			ref={contentBoxRef}
			style={{
				borderColor: INTERFACE_COLOR,
				backgroundColor: BACKGROUND_COLOR,
				fontSize: `${FONT_SIZE}px`,
				lineHeight: `${LINE_HEIGHT}`,
			}}
			className="row-span-2 border p-4 h-full overflow-hidden"
		>
			{visibleLines.map((line, index) => (
				<div key={index} dangerouslySetInnerHTML={createMarkup(line.text)}></div>
			))}
		</div>
	);
};

export default ContentBox;