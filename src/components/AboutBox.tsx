import React, { useEffect, useState } from "react";
import { INTERFACE_COLOR, BACKGROUND_COLOR } from "../constants";
import { artPage1 } from "../ascii/art";

const ASCII_MIN = 33;
const ASCII_MAX = 126;
const ASCII_LENGTH = 248;
const UPDATE_INTERVAL = 250;
const UPDATE_CHARS = 10;

const generateRandomAscii = (length: number) => Array.from({ length }, () => String.fromCharCode(Math.floor(Math.random() * (ASCII_MAX - ASCII_MIN + 1)) + ASCII_MIN)).join("");

const updateRandomCharacters = (content: string, count: number) => {
	const contentArray = content.split("");
	for (let i = 0; i < count; i++) {
		const randomIndex = Math.floor(Math.random() * contentArray.length);
		contentArray[randomIndex] = String.fromCharCode(Math.floor(Math.random() * (ASCII_MAX - ASCII_MIN + 1)) + ASCII_MIN);
	}
	return contentArray.join("");
};

interface OverlayBoxProps {
	style?: React.CSSProperties;
	className?: string;
	children: React.ReactNode;
}

const OverlayBox: React.FC<OverlayBoxProps> = ({ style, className, children }) => (
	<div style={{ borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR, transform: "translate(-10px, -10px)", ...style }} className={`border p-2 overflow-hidden font-mono ${className}`}>
		{children}
	</div>
);

const AboutBox: React.FC = () => {
	const [asciiContent, setAsciiContent] = useState<string>("");

	useEffect(() => {
		setAsciiContent(generateRandomAscii(ASCII_LENGTH));
		const interval = setInterval(() => {
			setAsciiContent((prev) => updateRandomCharacters(prev, UPDATE_CHARS));
		}, UPDATE_INTERVAL);
		return () => clearInterval(interval);
	}, []);

	return (
		<div style={{ borderColor: INTERFACE_COLOR }} className='relative border p-4'>
			<div className='relative z-20'>
				<h1 className='text-2xl' data-text='LEMONTINE'>
					LEMONTINE
				</h1>
				<br />
				<br />
				<p>welcome to my site!</p>
				<p>many features planned.</p>
				<p>still a major WIP!</p>
			</div>
			<div className='absolute right-0 top-0 flex space-x-4 z-10'>
				<OverlayBox className='h-32 w-64'>
					<div className='text-xs whitespace-pre-wrap break-words' style={{ color: "#2e685c" }}>
						{asciiContent}
					</div>
				</OverlayBox>
				<OverlayBox className='h-32 w-16'>
					<div className='text-xs whitespace-pre-wrap break-words' style={{ color: "#2e685c" }}>
						{"(c) darroll saddi. all rights reserved."}
					</div>
				</OverlayBox>
				<OverlayBox className='h-32 w-32 flex items-center justify-center' style={{ fontSize: "0.14rem", lineHeight: "0.9" }}>
					<div className='whitespace-pre-wrap break-words text-center' style={{ color: "#2e685c" }}>
						{artPage1}
					</div>
				</OverlayBox>
			</div>
		</div>
	);
};

export default AboutBox;