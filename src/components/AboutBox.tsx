import React, { useEffect, useState } from "react";
import { INTERFACE_COLOR, BACKGROUND_COLOR } from "../constants";
import { artPage1 } from "../ascii/art";

const AboutBox: React.FC = () => {
	const [asciiContent, setAsciiContent] = useState<string>("");

	useEffect(() => {
		// Set initial random ASCII content
		setAsciiContent(generateRandomAscii());

		const interval = setInterval(() => {
			setAsciiContent((prevContent) => updateRandomCharacters(prevContent));
		}, 250); // Updates every 500 milliseconds

		// Clean up interval on component unmount
		return () => clearInterval(interval);
	}, []);

	// One of the cosmetic boxes
	// Generates random ASCII characters between 33 and 126
	const generateRandomAscii = () => {
		const asciiArray = Array.from({ length: 248 }, () => String.fromCharCode(Math.floor(Math.random() * (126 - 33 + 1)) + 33));
		return asciiArray.join("");
	};
	// Randomly updates 10 characters in the content
	const updateRandomCharacters = (content: string) => {
		let contentArray = content.split("");
		for (let i = 0; i < 10; i++) {
			const randomIndex = Math.floor(Math.random() * contentArray.length);
			contentArray[randomIndex] = String.fromCharCode(Math.floor(Math.random() * (126 - 33 + 1)) + 33);
		}
		return contentArray.join("");
	};

	return (
			<div style={{ borderColor: INTERFACE_COLOR }} className='relative border p-4'>
			<div className='relative z-20'>
				<h1 className='text-2xl' data-text='LEMONTINE'>
					LEMONTINE
				</h1>
				<br></br>
				<br></br>
				<p>welcome to my site!</p>
				<p>many features planned.</p>
				<p>still a major WIP!</p>
			</div>
			{/* Absolute-positioned boxes (overlapping the LEMONTINE box) */}
			<div className='absolute right-0 top-0 flex space-x-4 z-10 '>
				<div
					style={{
						color: '#2e685c', borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR, transform: "translate(-10px, -10px)",
					}}
					className='border p-2 h-32 w-64 overflow-hidden font-mono'>
					<div className='text-xs whitespace-pre-wrap break-words'>{asciiContent}</div>
				</div>
				<div
					style={{
						borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR, transform: "translate(-10px, -10px)",
					}}
					className='h-32 w-16 border'>
						
					</div>
				<div
					style={{
						color: '#2e685c', borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR, transform: "translate(-10px, -10px)", fontSize: "0.175rem", lineHeight: "1.0",
					}}
					className='border p-2 h-32 w-32 overflow-hidden font-mono flex items-center justify-center'>
					<div className='whitespace-pre-wrap break-words text-center'>{artPage1}</div>
				</div>
			</div>
		</div>
	);
};

export default AboutBox;