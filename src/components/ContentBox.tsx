import { CONTENT, INTERFACE_COLOR, BACKGROUND_COLOR } from '../constants';
import React, { useState, useRef, useEffect } from 'react';

const FONT_SIZE = '17px';
const HEADER_FONT_SIZE = '20px';

const ContentBox: React.FC = () => {
	const contentBoxRef = useRef<HTMLDivElement>(null);
	const [charsPerLine, setCharsPerLine] = useState<number>(0);
	const [formattedText, setFormattedText] = useState<string[]>([]);

	// Create a markup object for dangerously setting inner HTML
	const createMarkup = (html: string) => {
		return { __html: html };
	};

	// Split the text into lines of length charsPerLine
	const splitTextForDisplay = (text: string, charsPerLine: number, numberOfLines: number) => {
		const paragraphs = text.split('<br>');
		const formatted: string[] = [];

		let bounded = true;
		paragraphs.forEach(paragraph => {
			let line = '';
			let lastSpace = 0;
			console.log(paragraph);
			paragraph.split('').forEach(char => {
				if (formatted.length >= numberOfLines) {
					bounded = false;					
				}
				if (line.length >= charsPerLine) {
					const cutOffLine = line.substring(0, lastSpace);
					// console.log(cutOffLine);
					formatted.push(cutOffLine);
					line = line.substring(lastSpace + 1);
				}
				if (char === ' ') {
					lastSpace = line.length;
				}
				if (!bounded) {
					return;
				}
				line += char;
			});
			if (line) {
				console.log(line);
				formatted.push(line);
			}
			if (!bounded) {
				return;
			}
		});
		return formatted;
	};

	// Update the number of characters per line and number of lines on window resize
	const calculateCharsPerLineAndLines = () => {
		if (contentBoxRef.current) {
			// TODO: Fix this hack
			const contentBoxWidth = contentBoxRef.current.clientWidth + 75; 
			const contentBoxHeight = contentBoxRef.current.clientHeight;

			// console.log(`Content box width: ${contentBoxWidth}`);
			// console.log(`Content box height: ${contentBoxHeight}`);
			
			const charsPerLine = Math.floor(contentBoxWidth * (70 / 680));
			const numberOfLines = Math.floor(contentBoxHeight * (28 / 850))

			// console.log(`Chars per line: ${charsPerLine}`);
			// console.log(`Number of lines: ${numberOfLines}`);

			return { charsPerLine, numberOfLines };
		}
		return { charsPerLine: 0, numberOfLines: 0 };
	};

	useEffect(() => {
		const updateCharsPerLineAndLines = () => {
			const { charsPerLine, numberOfLines } = calculateCharsPerLineAndLines();
			setCharsPerLine(charsPerLine);
			setFormattedText(splitTextForDisplay(CONTENT, charsPerLine, numberOfLines));
		};

		updateCharsPerLineAndLines();
		window.addEventListener('resize', updateCharsPerLineAndLines);

		return () => {
			window.removeEventListener('resize', updateCharsPerLineAndLines);
		};
	}, []);

	return (
		<div
			ref={contentBoxRef}
			style={{ borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR }}
			className="row-span-2 border p-4"
		>
			{formattedText.map((line, index) => (
				<div key={index} style={{ fontSize: FONT_SIZE }} dangerouslySetInnerHTML={createMarkup(line)}></div>
			))}
		</div>
	);
};

export default ContentBox;