// ============================
// STRUCTURED CONTENT DATA
// ============================

export interface ExperienceEntry {
	org: string;
	role: string;
	date: string;
	location: string;
	bullets: string[];
	url?: string;
}

export interface ProjectEntry {
	kicker: string;
	title: string;
	date: string;
	description: string;
	url?: string;
}

export interface ContactEntry {
	label: string;
	value: string;
	url?: string;
	copyable?: boolean;
}

export const experience: ExperienceEntry[] = [
	{
		org: "Apple",
		role: "Photos UI Engineer",
		date: "Nov 2025 — Present",
		location: "Cupertino, CA",
		bullets: [
			"Shaping next-gen Photos experiences across Apple's ecosystem using CV/ML and evolving AI capabilities.",
		],
	},
	{
		org: "Apple",
		role: "Photos UI Intern",
		date: "Jun 2025 — Sep 2025",
		location: "Cupertino, CA",
		bullets: [
			"Contributed shipping and prototype UI features in Photos with AI/ML-based approaches.",
			"Drove ideas from exploration to polished, user-facing experiences.",
		],
	},
	{
		org: "UC Davis Library",
		role: "IT Infrastructure Services Worker",
		date: "Dec 2023 — Sep 2025",
		location: "Davis, CA",
		bullets: [
			"Automated large-scale database migrations in Python.",
			"Built .NET tools that accelerated workstation deployments.",
			"Troubleshot equipment/software across multiple departments.",
		],
	},
	{
		org: "CodeLab",
		role: "AI Developer — Project Volare",
		date: "Oct 2024 — Jun 2025",
		location: "Davis, CA",
		bullets: [
			"Back-end AI for interview practice: tone analysis, LLM integration, realtime speech recognition.",
			"Collaborated with design team; adhered to specs and formal processes.",
		],
	},
	{
		org: "Comfort Living for Seniors",
		role: "Systems Developer & Administrator",
		date: "Aug 2021 — Sep 2025",
		location: "Remote",
		bullets: [
			"Built web interface for patient data; moved operations paperless.",
			"Implemented complex spreadsheet workflows; ongoing maintenance and features.",
		],
	},
	{
		org: "Travis Unified School District",
		role: "Technology Services Student Worker",
		date: "May 2019 — Aug 2021",
		location: "Fairfield, CA",
		bullets: [
			"Imaged, repaired, and deployed hundreds of devices across a nine-school district.",
		],
	},
];

export const projects: ProjectEntry[] = [
	{
		kicker: "Personal AI Assistant",
		title: "Project Clembot",
		date: "Dec 2021 – Dec 2023",
		description: "Discord bot with AI chat, image generation/analysis, link downloading, music, reminders, birthdays, and many social tools. Built iteratively over ~3 years.",
		url: "https://github.com/Iemontine/clembot",
	},
	{
		kicker: "Applied ML",
		title: "Context Embedding Video Describer",
		date: "Summer 2024",
		description: "Embeds temporal/audio cues into frames and prompts a vision-LLM for narrated recaps. Uses PANNs for audio tags and highlights multimodal tradeoffs.",
		url: "https://github.com/Iemontine/AudioVideoDescriptiveAI",
	},
	{
		kicker: "Reinforcement Learning",
		title: "Sonic PPO",
		date: "Spring 2024",
		description: "PPO implementation + environment for Sonic on Genesis; achieved consistent clears after ~2 hours of training through careful tuning.",
		url: "https://github.com/Iemontine/SonicGameplayingAI",
	},
	{
		kicker: "Client Work",
		title: "Comfort Living for Seniors",
		date: "2021 – 2025",
		description: "Designed a web interface for patient data entry to go paperless; complex spreadsheet-driven workflows; ongoing maintenance and features.",
	},
];

export const research: ProjectEntry[] = [
	{
		kicker: "Senior Design — UC Davis",
		title: "SPEEN",
		date: "Spring 2025",
		description: "Prototype environment for evaluating LLM-based agentic AI inside a physically simulated world. Led agent control, environment generation, navigation, test scenarios, and prompt/control interfaces.",
		url: "https://github.com/UCD-193AB-ws24/Minecapstone",
	},
	{
		kicker: "Applied ML",
		title: "Context Embedding for Enhanced Video Description by LLM",
		date: "Summer 2024",
		description: "Project lead on restoring temporal/audio context to a vision-only LLM by embedding per-frame cues from audio classification (PANNs). Produced narrated recap videos; surfaced limits in multimodal prompting.",
		url: "https://github.com/Iemontine/AudioVideoDescriptiveAI",
	},
	{
		kicker: "Reinforcement Learning",
		title: "Gameplaying AI with Proximal Policy Optimization",
		date: "Spring 2024",
		description: "Self-led reimplementation of PPO applied to Sonic the Hedgehog (Genesis). Built the training environment, tuned hyperparameters, and analyzed learning dynamics.",
		url: "https://github.com/Iemontine/SonicGameplayingAI",
	},
];

export const contact: ContactEntry[] = [
	{ label: "GitHub", value: "github.com/Iemontine", url: "https://github.com/Iemontine" },
	{ label: "LinkedIn", value: "linkedin.com/in/darrolls", url: "https://linkedin.com/in/darrolls/" },
	{ label: "Steam", value: "steamcommunity.com/id/computereality", url: "https://steamcommunity.com/id/computereality" },
	{ label: "Discord", value: "clemtine [click to copy]", copyable: true },
];

// ============================
// ABOUT ME DATA
// ============================

export const aboutMe = {
	version: "lemontine [Version 2.026.0402]",
	name: "lemontine",
	nickname: "darroll",
	currents: [
		{ label: "Rewatching", value: "Scott Pilgrim Takes Off", color: "#ae4f4f" },
		{ label: "Playing", value: "Spider-Man 2", color: "#4fae67" },
		{ label: "Listening to", value: "Ricky Montgomery", color: "#4f6dae" },
	],
	bio: "Photos UI Engineer @ Apple. UC Davis CS Alumni, with a focus on machine learning and AI.",
	details: [
		{ label: "hobbies", value: "Programming, video games, video editing, computer building, and game development." },
		{ label: "enjoys", value: "Learning about new technologies, AI ethics, travel, cosplay, and manga/anime." },
	],
	specs: "RTX 5090, Ryzen 9 5900X",
	favorites: [
		{ category: "Media", items: "Chainsaw Man, Scott Pilgrim vs the World, Shaun of the Dead, Dandadan", color: "#ae4f4f" },
		{ category: "Video Games", items: "Minecraft, Portal 2, Team Fortress 2, Warframe, Zenless Zone Zero, Fortnite", color: "#4fae67" },
		{ category: "Artists", items: "Jerma, Carpenter Brut, Ricky Montgomery, Good Kid, The Vanished People", color: "#4f6dae" },
	],
	skills: [
		{ name: "Swift", color: "rgb(255,203,58)" },
		{ name: "ObjC", color: "rgba(151, 34, 241, 1)" },
		{ name: "Python", color: "rgb(255,203,58)" },
		{ name: "Java", color: "rgb(248,152,34)" },
		{ name: "Javascript", color: "rgb(240,219,79)" },
		{ name: "C++", color: "rgb(204,204,255)" },
		{ name: "CSharp", color: "rgb(162,135,221)" },
		{ name: "HTML/CSS", color: "rgb(203,65,84)" },
		{ name: "VB.Net", color: "rgb(255,111,97)" },
		{ name: "Bash", color: "rgb(255,83,73)" },
		{ name: "C", color: "rgb(101,154,210)" },
	],
	apis: ["pytorch", "Microsoft Azure", "openai", "gymnasium", "pycord", "Pillow", "BeautifulSoup"],
	apiColor: "rgb(65,105,225)",
};
