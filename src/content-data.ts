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

// 		The Photos team develops best-in-class features that showcase the incredible images it can produce. The seamless integration of software and hardware has created magical experiences in features like Memories, Clean Up, and the modern Lock Screen Wallpapers.

// The Photos team is committed to creating innovative experiences by leveraging advanced computer vision, machine learning, and rapidly evolving AI technologies. We build products that reach millions of users, and we’re looking for passionate individuals eager to push the boundaries of what’s possible in this dynamic space!

// Key role in shaping the future of the Photos platform across Apple’s ecosystem, creating impactful experiences that delight millions of users.
export const experience: ExperienceEntry[] = [
	{

		org: "Apple",
		role: "Photos UI Engineer",
		date: "Nov 2025 — Present",
		location: "Cupertino, CA",
		bullets: [
			"Developing best-in-class features that reach millions of users across Apple's ecosystems, creating impactful experiences that delight.",
			"Shaping integration of software and hardware leveraging computer vision, machine learning, and rapidly evolving AI technologies."
		],
	},
	{
		org: "Apple",
		role: "Photos UI Intern",
		date: "Jun 2025 — Sep 2025",
		location: "Cupertino, CA",
		bullets: [
			"Contributed shipping and prototype UI features in Photos with AI/ML-based approaches.",
			"Worked closely with the Photos team to gain experience driving ideas from exploration to polished, user-facing experiences.",
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
		role: "AI Developer",
		date: "Oct 2024 — Jun 2025",
		location: "Davis, CA",
		bullets: [
			"Developed backend AI features for Project Volare, an app used for interview practice: tone analysis, LLM integration, realtime speech recognition.",
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
		description: "Discord bot with agentic chat, agentic image generation/editing, a YouTube/Spotify music player, reminders, birthday tracking, and social tools. Built iteratively over ~3 years.",
		url: "https://github.com/Iemontine/clembot",
	},
	{
		kicker: "Godot RPG",
		title: "Monsters' Shift",
		date: "Winter 2024",
		description: "Producer and gameplay engineer on a 6-person team. Built core infrastructure: interactable objects, scene transitions, cutscene authoring tools, character designer, and story manager. Designed maps, implemented the QTE mechanics and directional audio system, and managed 400+ commits across the team using Agile sprints.",
		url: "https://github.com/Iemontine/MonstersShift",
	},
	{
		kicker: "Wallpaper Engine",
		title: "Kobeni Wallpaper",
		date: "Nov 2025",
		description: "Animated desktop wallpaper with puppet warp animations, GLSL shader effects (smoke, ash, god rays, CRT/VHS), an audio visualizer, and interactive hover parallax.",
		url: "https://github.com/Iemontine/Kobeni-Wallpaper",
	},
	{
		kicker: "Garry's Mod Addon",
		title: "ULTRAKILL HUD",
		date: "Jun 2023",
		description: "Recreates the ULTRAKILL heads-up display in Garry's Mod with animated health/armor bars, ammo displays with weapon icons, and integration with other ULTRAKILL mods.",
		url: "https://github.com/Iemontine/ultrakill-hud",
	},
];

export const research: ProjectEntry[] = [
	{
		kicker: "Senior Design Project — UC Davis",
		title: "SPEEN: Simulated Profiling Environment for Embodied iNtelligence",
		date: "Spring 2025",
		description: "Project lead. Open-source benchmarking platform for embodied LLM agents in a Minecraft-like Godot environment. Built the agent-environment pipeline, procedural world generation, A* navigation, and structured test scenarios. Implemented chain-of-thought prompting and automated scoring. Observed emergent cooperative behavior and division-of-labor in multi-agent scenarios.",
		url: "https://github.com/UCD-193AB-ws24/Minecapstone",
	},
	{
		kicker: "Applied ML",
		title: "Context Embedding for Enhanced Video Description by LLM",
		date: "Summer 2024",
		description: "Project lead. Embedded temporal and audio context directly into video frames to enable GPT-4o to describe video content with sound awareness. Trained ResNet50 on AudioSet, then applied PANNs for framewise audio classification. Pipeline produces auto-narrated recap videos via TTS. Revealed limitations in multi-label audio classification and LLM hallucination under multimodal prompting.",
		url: "https://github.com/Iemontine/AudioVideoDescriptiveAI",
	},
	{
		kicker: "Reinforcement Learning",
		title: "Gameplaying AI with Proximal Policy Optimization",
		date: "Spring 2024",
		description: "Project lead. Reimplementation of PPO applied to Sonic the Hedgehog on Genesis via Stable-Retro. Built the full training environment with custom wrappers (reward shaping, frame stacking, action discretization, multiprocess vectorization). Iterated on reward functions from velocity to progress-based, tuned hyperparameters by observing agent behavior, and achieved 83% winrate with ~31s completion times. Key takeaway: hard-coding human learning heuristics was unnecessary — a well-designed reward function with proper exploration incentives outperformed multi-pass training.",
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
		{ label: "Listening to", value: "Laufey", color: "#4f6dae" },
	],
	bio: "Photos UI SWE @ , UC Davis Alumni (Computer Science focusing on AI/ML)",
	details: [
		{ label: "hobbies", value: "video games, video editing, computer building, and game development." },
		{ label: "real hobbies", value: "hiking, running, gym......" },
		{ label: "enjoys", value: "learning about new & upcoming tech, AI ethics, travel, cosplay, and manga/anime." },
	],
	specs: "RTX 5090, Ryzen 9 5900X",
	favorites: [
		{ category: "Manga/Anime", items: "Chainsaw Man, Dandadan, Trigun", color: "#61BB46" },
		{ category: "Series", items: "Scott Pilgrim vs the World, Invincible", color: "#FDB827" },
		{ category: "Movies", items: "Shaun of the Dead, Everything Everywhere All at Once", color: "#F5821F" },
		{ category: "Video Games", items: "OMORI, Minecraft, Undertale,Signalis, Portal 2, Warframe", color: "#E03A3E" },
		{ category: "Artists", items: "Jerma, Carpenter Brut, Ricky Montgomery, Good Kid, The Vanished People, Kenshi Yonezu", color: "#963D97" },
		{ category: "i've been to", items: "Tōkyō, Ōsaka, Český Krumlov, München, Salzburg, Werfen, Verona, Padova, Venice", color: "#009DDC" },
	],
	skills: [
		{ name: "Swift", color: "rgb(255,203,58)" },
		{ name: "Python", color: "rgb(65,105,225)" },
		{ name: "ObjC", color: "rgba(151, 34, 241, 1)" },
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
