import React, { useState, useRef, useEffect } from "react";
import { INTERFACE_COLOR, BACKGROUND_COLOR, TYPING_SPEED, CHARS_PER_TICK } from "../constants";
import { sections, type SectionData, type PortfolioItem } from "../data/portfolio";

const FONT_SIZE = 15;
const LINE_HEIGHT = 1.5;

const Card: React.FC<{ item: PortfolioItem; accent: string }> = ({ item, accent }) => {
	return (
		<div className="group border rounded-md p-3 md:p-4 mb-4 transition-colors"
			 style={{ borderColor: accent }}>
			<div className="flex gap-3">
				{item.image && (
					<img src={item.image} alt={item.title}
						 className="hidden md:block w-28 h-20 object-cover border"
						 style={{ borderColor: accent }} />
				)}
				<div className="min-w-0">
					<div className="flex flex-wrap items-baseline gap-2">
						<h3 className="text-sm md:text-base text-white">{item.title}</h3>
						{item.subtitle && <span className="text-xs text-gray-400">· {item.subtitle}</span>}
						{item.period && <span className="ml-auto text-[10px] text-gray-500">{item.period}</span>}
					</div>
					<p className="mt-1 text-xs md:text-sm text-gray-300">{item.description}</p>
					{!!item.links?.length && (
						<div className="mt-2 flex flex-wrap gap-2">
							{item.links!.map((l) => (
								<a key={l.href} href={l.href} target="_blank" rel="noreferrer"
									 className="text-[10px] md:text-xs no-underline hover:underline"
									 style={{ color: accent }}>{l.label}</a>
							))}
						</div>
					)}
					{!!item.tags?.length && (
						<div className="mt-2 flex flex-wrap gap-1">
							{item.tags!.map((t) => (
								<span key={t} className="text-[10px] px-1 border rounded"
									  style={{ borderColor: accent, color: accent }}>{t}</span>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const Section: React.FC<{ section: SectionData; index: number; isVisible: boolean; typed: string }>
	= ({ section, index, isVisible, typed }) => {
	return (
		<section data-index={index} id={section.id}
				 style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.5s ease", willChange: "opacity" }}
				 className="mb-6">
			<h2 className="text-base md:text-xl" style={{ color: section.accent }}>{section.title}</h2>
			<div className="text-white text-xs md:text-base">
				{typed.length ? null : null}
			</div>
			<div className="mt-3">
				{section.items.map((item) => (
					<Card key={item.title} item={item} accent={section.accent} />
				))}
			</div>
		</section>
	);
};

const ContentBox: React.FC = () => {
	const contentBoxRef = useRef<HTMLDivElement>(null);
	const [visibleSections, setVisibleSections] = useState<number[]>([]);
	const [typedText, setTypedText] = useState<{ [key: number]: string }>({});

	useEffect(() => {
		const contentBox = contentBoxRef.current;
		if (!contentBox) return;

		const sectionsEls = Array.from(contentBox.querySelectorAll('section')) as HTMLElement[];

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
			{ root: contentBox, threshold: 0.3 }
		);

		sectionsEls.forEach((section, index) => {
			section.setAttribute("data-index", index.toString());
			observer.observe(section);
		});

		return () => observer.disconnect();
	}, [visibleSections]);

	useEffect(() => {
		visibleSections.forEach((sectionIndex) => {
			if (!typedText[sectionIndex]) {
				// Placeholder typing demonstration for section headers
				// You can extend this to type each card intro as desired.
				const headerText = sections[sectionIndex].title;
				let currentText = "";
				let charIndex = 0;
				const interval = setInterval(() => {
					currentText += headerText[charIndex] ?? '';
					charIndex += CHARS_PER_TICK;
					setTypedText((prev) => ({ ...prev, [sectionIndex]: currentText }));
					if (charIndex >= headerText.length) clearInterval(interval);
				}, TYPING_SPEED);
			}
		});
	}, [visibleSections, typedText]);

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
			{sections.map((section, index) => (
				<Section
					key={section.id}
					section={section}
					index={index}
					isVisible={visibleSections.includes(index)}
					typed={typedText[index] ?? ''}
				/>
			))}
		</div>
	);
};

export default ContentBox;