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
	<div style={{ borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR, transform: "translate(-10px, -10px)", ...style }} className={`border p-2 overflow-hidden font-mono ${className}`}>
		{children}
	</div>
);

const AboutBox: React.FC = () => {
	const [asciiContent, setAsciiContent] = useState<string>("");
	const [headline, setHeadline] = useState<string>("");

	useEffect(() => {
		setAsciiContent(generateRandomAscii(ASCII_LENGTH));
		const interval = setInterval(() => {
			setAsciiContent((prev) => updateRandomCharacters(prev, UPDATE_CHARS));
		}, UPDATE_INTERVAL);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const message = "Iemontine — CLI portfolio";
		let i = 0;
		const timer = setInterval(() => {
			setHeadline((prev) => (i < message.length ? prev + message[i++] : prev));
			if (i >= message.length) clearInterval(timer);
		}, 40);
		return () => clearInterval(timer);
	}, []);

	return (
		<div style={{ borderColor: INTERFACE_COLOR, backgroundColor: BACKGROUND_COLOR }} className='relative border p-4 z-10'>
			<div className='relative z-10'>
				<h1 className='text-2xl'>{headline}</h1><br/>
				<span className="block md:hidden"><br/><br/></span>
				<h3 style={{ color: "#4fae9b" }} className="text-sm md:text-lg" id="header_currents">currents</h3>
				<ul className="list-none pl-1 md:pl-5 text-xs md:text-sm">
					<li className="before:content-['-']" style={{ color: "#ae4f4f" }}>Watching<span className='text-white'>: Speedracer (2008)</span></li>
					<li className="before:content-['-']" style={{ color: "#4fae67" }}>Playing<span className='text-white'>: Zenless Zone Zero</span></li>
					<li className="before:content-['-']" style={{ color: "#4f6dae" }}>Listening to <span className='text-white'>: Good Kid, The Vanished People</span></li>
				</ul>
				<br/>

				<div className="hidden md:block">
					<h3 className="text-sm md:text-lg">
						<span className="text-white">I'm</span>{" "}
						<span style={{ color: "rgb(229, 128, 0)" }}>I</span>
						<span style={{ color: "rgb(232, 136, 0)" }}>e</span>
						<span style={{ color: "rgb(235, 144, 0)" }}>m</span>
						<span style={{ color: "rgb(238, 153, 0)" }}>o</span>
						<span style={{ color: "rgb(241, 161, 0)" }}>n</span>
						<span style={{ color: "rgb(244, 170, 0)" }}>t</span>
						<span style={{ color: "rgb(247, 178, 0)" }}>i</span>
						<span style={{ color: "rgb(249, 187, 0)" }}>n</span>
						<span style={{ color: "rgb(252, 195, 0)" }}>e</span>
						<span className="text-white">, you might also know me as darroll!</span>
					</h3>

					<h1 style={{ color: "#4fae9b" }} className="text-base md:text-xl mt-4">about me</h1>
					<ul className="list-none pl-1 md:pl-5 text-xs md:text-sm" style={{ color: "#409584" }}>
						<li className="before:pr-1">LEMONTINES: A fourth-year computer science student at UCD, with a focus on machine learning and AI.</li>
						<li className="before:pr-1">HOBBIES: Programming, video games, video editing, computer building, & hackathons.</li>
						<li className="before:pr-1">ENJOYS: Learning about and applying machine learning and AI, full-stack web development, hardware/software concepts.</li>
						<li className="before:pr-1">SPECS: RTX 4070 and an AMD Ryzen 9 5900X.</li>
						<li className="before:pr-1">FAVORITES:</li>
						<ul className="list-none pl-1 md:pl-5 text-xs md:text-sm">
							<li className="before:content-['-']" style={{ color: "#ae4f4f" }}>Anime/TV/Movies<span className="text-white">: Scott Pilgrim vs the World, Shaun of the Dead, Chainsaw Man, Dandadan</span></li>
							<li className="before:content-['-']" style={{ color: "#4fae67" }}>Video Games<span className="text-white">: Minecraft, Portal 2, Team Fortress 2, Warframe, Zenless Zone Zero, Fortnite</span></li>
							<li className="before:content-['-']" style={{ color: "#4f6dae" }}>Artists<span className="text-white">: Jerma, Carpenter Brut, Ricky Montgomery, Good Kid, The Vanished People</span></li>
						</ul>
					</ul>

					<h4 className="text-xs md:text-sm text-white mt-4">
						proficient in{" "}
						<span style={{ color: "rgb(255, 203, 58)" }}>Python</span>,{" "}
						<span style={{ color: "rgb(248, 152, 34)" }}>Java</span>,{" "}
						<span style={{ color: "rgb(240, 219, 79)" }}>Typescript</span>,{" "}
						<span style={{ color: "rgb(101, 154, 210)" }}>C</span>,{" "}
						<span style={{ color: "rgb(204, 204, 255)" }}>C++</span>,{" "}
						<span style={{ color: "rgb(162, 135, 221)" }}>CSharp</span>,{" "}
						<span style={{ color: "rgb(203, 65, 84)" }}>HTML/TailwindCSS</span>,{" "}
						<span style={{ color: "rgb(255, 111, 97)" }}>VB.Net</span>,{" "}
						<span style={{ color: "rgb(255, 83, 73)" }}>Bash scripting</span>.
					</h4>
					<h4 className="text-xs md:text-sm text-white mt-2">
						favorite libraries/APIs:{" "}
						<span style={{ color: "rgb(65, 105, 225)" }}>pytorch</span>,{" "}
						<span style={{ color: "rgb(65, 105, 225)" }}>Microsoft Azure</span>,{" "}
						<span style={{ color: "rgb(65, 105, 225)" }}>openai</span>,{" "}
						<span style={{ color: "rgb(65, 105, 225)" }}>gymnasium</span>,{" "}
						<span style={{ color: "rgb(65, 105, 225)" }}>pycord</span>,{" "}
						<span style={{ color: "rgb(65, 105, 225)" }}>Pillow</span>,{" "}
						<span style={{ color: "rgb(65, 105, 225)" }}>BeautifulSoup</span>
					</h4>
				</div>
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
