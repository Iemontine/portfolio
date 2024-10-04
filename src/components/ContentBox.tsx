import React, { useState, useRef, useEffect } from "react";
import { CONTENT, INTERFACE_COLOR, BACKGROUND_COLOR, SCROLL_COOLDOWN } from "../constants";

const FONT_SIZE = 17;
const LINE_HEIGHT = 1.5;
const DELAY = 10;

const ContentBox: React.FC = () => {
	const contentBoxRef = useRef<HTMLDivElement>(null);
	var [topLine, setTopLine] = useState(0);
	const [visibleLines, setVisibleLines] = useState<{ text: string; visible: boolean; writtenText: string }[]>([]);
	const [allLines, setAllLines] = useState<{ text: string; visible: boolean }[]>([]);
	const visibleLinesRef = useRef<{ text: string; visible: boolean; writtenText: string }[]>([]);
	const allLinesRef = useRef<{ text: string; visible: boolean; writtenText: string }[]>([]);
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
		const lines: { text: string; visible: boolean; writtenText: string }[] = [];
		const paragraphs = text.split("<br>");
		let currentLine = "";
		let isInHtmlTag = false;
		let htmlTagBuffer = "";
		let visibleChars = 0;

		// Processes each word in the text, splitting it into lines, tracking visible or non-visible lines
		let outOfBounds = true;
		const processWord = (word: string) => {
			if (word.startsWith("<")) isInHtmlTag = true;
			if (isInHtmlTag) {
				htmlTagBuffer += word + " ";
				if (word.endsWith(">")) {
					isInHtmlTag = false;
					currentLine += htmlTagBuffer;
					htmlTagBuffer = "";
				}
			} else {
				if (visibleChars + word.length <= charsPerLine) {
					currentLine += (currentLine && !currentLine.endsWith(">") ? " " : "") + word;
					visibleChars += word.length;
				} else {
					if (currentLine) {
						lines.push({ text: currentLine, visible: outOfBounds, writtenText: currentLine });
						currentLine = "";
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
				processWord(word);
			}

			// Newline after each paragraph (or header, etc.)
			if (currentLine) {
				lines.push({ text: currentLine, visible: outOfBounds, writtenText: currentLine });
				currentLine = "";
				visibleChars = 0;
			}
		}
		return lines;
	};

	// Queues the deletion and writing of text for each line
	const deleteText = (lineIndex: number, allLines: Array<any>) => {
		return new Promise<void>((resolve) => {
			let curText = allLines[lineIndex].writtenText;
			const deleteInterval = setInterval(() => {
				const CHUNK_SIZE = Math.max(1, Math.floor(curText.length / 5));
				if (curText.length > 0) {
					curText = curText.slice(0, -CHUNK_SIZE);
					allLines[lineIndex].writtenText = curText;
					const visibleContent_filtered = allLines.filter((line) => line.visible);
					setVisibleLines([...visibleContent_filtered]);
				} else {
					allLines[lineIndex].visible = false;
					clearInterval(deleteInterval);
					resolve();
				}
			}, DELAY);
		});
	};
	const writeText = (lineIndex: number, allLines: Array<any>) => {
		const nextLine = allLines[lineIndex];
		let curText = "";
		const writeInterval = setInterval(() => {
			const CHUNK_SIZE = Math.max(1, Math.floor(curText.length / 5));
			const commonPrefixLength = findCommonPrefixLength(curText, nextLine.text);
			curText = nextLine.text.slice(0, commonPrefixLength + CHUNK_SIZE);
			nextLine.writtenText = curText;
			const visibleContent_filtered = allLines.filter((line) => line.visible);
			setVisibleLines([...visibleContent_filtered]);
			if (curText === nextLine.text) {
				clearInterval(writeInterval);
			}
		}, DELAY);
	};

	const handleScroll = (deltaY: number) => {
		if (isCooldown.current) return;
		isCooldown.current = true;

		setTimeout(() => {
			isCooldown.current = false;
		}, SCROLL_COOLDOWN);

		const direction = deltaY > 0 ? "down" : "up";

		setTopLine((topLine) => {
			if (direction === "down") {
				// Ensure content is within bounds
				if (topLine + linesPerBox.current >= totalLines.current) return topLine;

				// Delete the top line and write the next line
				deleteText(topLine, allLinesRef.current).then(() => {
					allLinesRef.current[topLine + linesPerBox.current].visible = true;
					writeText(topLine + linesPerBox.current, allLinesRef.current);
				});
				return topLine + 1;
			} else {
				// Ensure content is within bounds
				if (topLine === 0) return topLine;

				// Delete the bottom line and write the previous line
				deleteText(topLine + linesPerBox.current - 1, allLinesRef.current).then(() => {
					allLinesRef.current[topLine - 1].visible = true;
					writeText(topLine - 1, allLinesRef.current);
				});
				return topLine - 1;
			}
			return topLine;
		});
	};

	// Default update function, updates the content based on the current size of box
	const updateContent = () => {
		const { charsPerLine, visibleLines } = calculateBounds();
		linesPerBox.current = visibleLines;

		const allContent = splitContent(CONTENT, charsPerLine, visibleLines);
		allLinesRef.current = allContent;
		setAllLines(allContent);

		totalLines.current = allContent.length;

		const visibleContent_filtered = allContent.filter((line) => line.visible);
		setVisibleLines(visibleContent_filtered); 
		visibleLinesRef.current = visibleContent_filtered;
	};

	useEffect(() => {
		updateContent();
		const resizeObserver = new ResizeObserver(updateContent);
		if (contentBoxRef.current) {
			resizeObserver.observe(contentBoxRef.current);
		}

		const handleWheel = (e: WheelEvent) => {
			handleScroll(e.deltaY);
		};
		window.addEventListener("wheel", handleWheel);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("wheel", handleWheel);
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
			className='row-span-2 border p-4 z-20 h-full overflow-hidden'>
			{visibleLines.map((line, index) => (
				<div key={index} dangerouslySetInnerHTML={createMarkup(line.writtenText)}></div>
			))}
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

export default ContentBox;
