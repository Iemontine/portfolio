import React, { useEffect, useState } from "react";
import { INTERFACE_COLOR, BACKGROUND_COLOR } from "../constants";
import { artPage1 } from "../ascii/art";

const ASCII_MIN = 33;
const ASCII_MAX = 126;
const ASCII_LENGTH = 248;
const UPDATE_INTERVAL = 250;
const UPDATE_CHARS = 10;

interface OverlayBoxProps {
	style?: React.CSSProperties;
	className?: string;
	children: React.ReactNode;
}

// Cosmetic boxes with border and background color
const OverlayBox: React.FC<OverlayBoxProps> = ({ style, className, children }) => (
	<div style={{ borderColor: INTERFACE_COLOR, backgroundColor: 'BACKGROUND_COLOR', transform: "translate(-10px, -10px)", ...style }} className={`border p-2 overflow-hidden font-mono ${className}`}>
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
		<div style={{ borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR }} className='relative border p-4 z-10'>
			<div className='relative z-10'>
				<h1 className='text-2xl'>
                LEMONTINE
				</h1>
				<br />
				<br />
				<br />
				<h3 style={{ color: "#4fae9b" }} className="text-lg" id='header_favorites'>favorites</h3>
				<ul className="list-none pl-5 text-sm">
					<li className="before:content-['-'] before:pr-2" style={{ color: "#ae4f4f" }}>TV/Movies<span className='text-white'>: Scott Pilgrim vs the World, Shaun of the Dead, Chainsaw Man</span></li>
					<li className="before:content-['-'] before:pr-2" style={{ color: "#4fae67" }}>Video Games<span className="text-white">: Minecraft, Team Fortress 2, Warframe, Zenless Zone Zero </span></li>
					<li className="before:content-['-'] before:pr-2" style={{ color: "#4f6dae" }}>Artists<span className="text-white">: Carpenter Brut, Ricky Montgomery, Jerma</span></li>
				</ul>
				<h3 style={{ color: "#4fae9b" }} className="text-lg" id="header_currents">currents</h3>
				<ul className="list-none pl-5 text-sm">
					<li className="before:content-['-'] before:pr-2" style={{ color: "#ae4f4f" }}>Watching<span className='text-white'>: Dandadan</span></li>
					<li className="before:content-['-'] before:pr-2" style={{ color: "#4fae67" }}>Playing<span className='text-white'>: Zenless Zone Zero</span></li>
					<li className="before:content-['-'] before:pr-2" style={{ color: "#4f6dae" }}>Listening to <span className='text-white'>: ???</span></li>
				</ul>
			</div>
			<div className='absolute right-0 top-0 flex space-x-4 z-1'>
				<OverlayBox className='h-32 w-64'>
					<div className='text-xs whitespace-pre-wrap break-words' style={{ color: "#2e685c" }}>
						{asciiContent}
					</div>
				</OverlayBox>
				<OverlayBox className='h-32 w-16'>
					<div className='text-xs whitespace-pre-wrap break-words' style={{ color: "#2e685c" }}>
						{"(c) darrolls. all rights reserved."}
					</div>
				</OverlayBox>
				<OverlayBox className='h-32 w-32 flex items-center justify-center p-0' style={{ fontSize: "2px", lineHeight: "1" }}>
					<div className='whitespace-pre-wrap break-words text-center' style={{ color: "#2e685c" }}>
						{artPage1}
					</div>
				</OverlayBox>
			</div>
		</div>
	);
};

// For random text effect in first cosmetic box
const generateRandomAscii = (length: number) => Array.from({ length }, () => String.fromCharCode(Math.floor(Math.random() * (ASCII_MAX - ASCII_MIN + 1)) + ASCII_MIN)).join("");
const updateRandomCharacters = (content: string, count: number) => {
	const contentArray = content.split("");
	for (let i = 0; i < count; i++) {
		const randomIndex = Math.floor(Math.random() * contentArray.length);
		contentArray[randomIndex] = String.fromCharCode(Math.floor(Math.random() * (ASCII_MAX - ASCII_MIN + 1)) + ASCII_MIN);
	}
	return contentArray.join("");
};

export default AboutBox;
