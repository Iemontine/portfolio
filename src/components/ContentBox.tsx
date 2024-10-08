import React, { useState, useRef, useEffect } from "react";
import { CONTENT, INTERFACE_COLOR, BACKGROUND_COLOR, TYPING_SPEED, CHARS_PER_TICK } from "../constants";

const FONT_SIZE = 15;
const LINE_HEIGHT = 1.5;

const ContentBox: React.FC = () => {
	const contentBoxRef = useRef<HTMLDivElement>(null);
	const [visibleSections, setVisibleSections] = useState<number[]>([]);
	const [typedText, setTypedText] = useState<{ [key: number]: string }>({});

	useEffect(() => {
		const contentBox = contentBoxRef.current;
		if (!contentBox) return;

		const sections = Array.from(contentBox.children) as HTMLElement[];

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const index = Number(entry.target.getAttribute("data-index"));
					if (entry.isIntersecting) {
						if (!visibleSections.includes(index)) {
							setVisibleSections((prev) => [...prev, index]);
						}
					} else {
						setVisibleSections((prev) => prev.filter((sectionIndex) => sectionIndex !== index));
					}
				});
			},
			{
				root: contentBox,
				threshold: 0.3, // Trigger fade when 30% of the element is visible
			}
		);

		sections.forEach((section, index) => {
			section.setAttribute("data-index", index.toString());
			observer.observe(section);
		});

		return () => observer.disconnect();
	}, [visibleSections]);

	useEffect(() => {
		visibleSections.forEach((sectionIndex) => {
			if (!typedText[sectionIndex]) {
				typeSectionText(sectionIndex); // Start typing text when section becomes visible
			}
		});
	}, [visibleSections, typedText]);

	const typeSectionText = (sectionIndex: number) => {
		const sectionText = CONTENT.split("<br>")[sectionIndex];
		let currentText = "";
		let charIndex = 0;

		const typingInterval = setInterval(() => {
			// Capture the next slice of characters
			const nextSlice = sectionText.slice(charIndex, charIndex + CHARS_PER_TICK);

			// Check if the next slice contains any HTML tags that should be instantly typed
			const isHTMLTag = nextSlice.includes("<");
			if (isHTMLTag) {
				const tagEnd = sectionText.indexOf(">", charIndex) + 1; // Find the end of the HTML tag
				currentText += sectionText.slice(charIndex, tagEnd); // Instantly append the full tag
				charIndex = tagEnd; // Move the index past the tag
			} else {
				currentText += nextSlice; // Append the regular text normally
				charIndex += CHARS_PER_TICK; // Move the index by the number of characters per tick
			}

			setTypedText((prev) => ({
				...prev,
				[sectionIndex]: currentText,
			}));

			// Stop typing when the entire section is typed out
			if (charIndex >= sectionText.length) {
				clearInterval(typingInterval);
			}
		}, TYPING_SPEED);
	};

	return (
		<div
			ref={contentBoxRef}
			style={{
				borderColor: INTERFACE_COLOR,
				backgroundColor: BACKGROUND_COLOR,
				fontSize: `${FONT_SIZE}px`,
				lineHeight: `${LINE_HEIGHT}`,
				overflowY: "auto",
				height: "100%",
			}}
			className='contentBox row-span-2 border p-4 z-20 h-full'
		>
			{CONTENT.split("<br>").map((section, index) => (
				<div
					key={index}
					data-index={index}
					style={{
						opacity: visibleSections.includes(index) ? 1 : 0,
						transition: "opacity 0.5s ease",
						willChange: "opacity",
					}}
					className="text-white text-xs md:text-base">
					<span dangerouslySetInnerHTML={{ __html: typedText[index] ?? "" }} />
				</div>
			))}
		</div>
	);
};

export default ContentBox;