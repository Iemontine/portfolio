import { artPage0, artPage1, artPage2, artPage3, artPage4 } from './ascii/art';

const PAGE_CONTENT = [
	{ id: 0, content: '' },
	{ id: 1, content: '' },
	{ id: 2, content: '' },
	{ id: 3, content: '' },
	{ id: 4, content: '' },
];

// TODO: variable speed for deleting/writing to account for string length including html

// Dangerously set HTML for now
const CONTENT = `
<h1 style='color: #4fae9b;' class='text-base md:text-xl'>
	Iemontine [Version 1.10.41.1125]
</h1>
<span style='color: rgb(255,255,255)'>
	I'm</span> <span style='color: rgb(229, 128, 0)'>I</span><span style='color: rgb(232, 136, 0)'>e</span><span style='color: rgb(235, 144, 0)'>m</span><span style='color: rgb(238, 153, 0)'>o</span><span style='color: rgb(241, 161, 0)'>n</span><span style='color: rgb(244, 170, 0)'>t</span><span style='color: rgb(247, 178, 0)'>i</span><span style='color: rgb(249, 187, 0)'>n</span><span style='color: rgb(252, 195, 0)'>e</span><span style='color: rgb(255,255,255)'>, you might also know me as darroll!</span>
<br></br>
<h1 style='color: #4fae9b;' class='text-base md:text-xl' id='header_portfolio'>about me</h1>
<ul class='list-none pl-1 md:pl-5 text-xs md:text-sm' style='color: #409584'><li class='before:content-['--'] before:pr-1'>LEMONTINES: A fourth-year computer science student at UCD, with a focus on machine learning and AI.</li></ul><br>
<ul class='list-none pl-1 md:pl-5 text-xs md:text-sm' style='color: #409584'><li class='before:content-['--'] before:pr-1'>HOBBIES: Programming, video games, video editing, computer building, & hackathons.</li></ul><br>
<ul class='list-none pl-1 md:pl-5 text-xs md:text-sm' style='color: #409584'><li class='before:content-['--'] before:pr-1'>ENJOYS: Learning about and applying machine learning and AI, full-stack web development, hardware/software concepts.</li></ul><br>
<ul class='list-none pl-1 md:pl-5 text-xs md:text-sm' style='color: #409584'><li class='before:content-['--'] before:pr-1'>SPECS: RTX 4070 and an AMD Ryzen 9 5900X.</li></ul><br>
<ul class='list-none pl-1 md:pl-5 text-xs md:text-sm' style='color: #409584'>
	<li class='before:content-['--'] before:pr-1'>FAVORITES:</li>
	<ul class='list-none pl-1 md:pl-5 text-xs md:text-sm'>
		<li class='before:content-['-']' style='color: #ae4f4f'>Anime/TV/Movies<span class='text-white'>: Scott Pilgrim vs the World, Shaun of the Dead, Chainsaw Man, Dandadan </span></li>
		<li class='before:content-['-']' style='color: #4fae67'>Video Games<span class='text-white'>: Minecraft, Portal 2, Team Fortress 2, Warframe, Zenless Zone Zero, Fortnite </span></li>
		<li class='before:content-['-']' style='color: #4f6dae'>Artists<span class='text-white'>: Jerma, Carpenter Brut, Ricky Montgomery, Good Kid, The Vanished People</span></li>
	</ul>
</ul><br></br>
	
<h4 style='color: rgb(255, 255, 255)'>proficient in 
<span style='color: rgb(255, 203, 58)'>Python</span>, 
<span style='color: rgb(248, 152, 34)'>Java</span>, 
<span style='color: rgb(240, 219, 79)'>Typescript</span>, 
<span style='color: rgb(101, 154, 210)'>C</span>, 
<span style='color: rgb(204, 204, 255)'>C++</span>, 
<span style='color: rgb(162, 135, 221)'>CSharp</span>, 
<span style='color: rgb(203, 65, 84)'>HTML/TailwindCSS</span>, 
<span style='color: rgb(255, 111, 97)'>VB.Net</span>, 
<span style='color: rgb(255, 83, 73)'>Bash scripting</span>.
</h4>
<h4 style='color: rgb(255, 255, 255)'>favorite libraries/APIs: 
<span style='color: rgb(65, 105, 225)'>pytorch</span>, 
<span style='color: rgb(65, 105, 225)'>Microsoft Azure</span>,
<span style='color: rgb(65, 105, 225)'>openai</span>, 
<span style='color: rgb(65, 105, 225)'>gymnasium</span>, 
<span style='color: rgb(65, 105, 225)'>pycord</span>, 
<span style='color: rgb(65, 105, 225)'>Pillow</span>, 
<span style='color: rgb(65, 105, 225)'>BeautifulSoup</span>
</h4>
<br></br>
<h1 style='color: #4fae9b;' class='text-base md:text-xl' id='header_research'>research</h1>
<h2 style='color: #e2e224;'>-
	<a href='https://github.com/Iemontine/SonicGameplayingAI' style='color: #e2e224;' class='no-underline hover:underline''>
		Gameplaying AI with Proximal Policy Optimization
	</a>
</h2>
<h4 class='text-gray-500 text:sm md:text-base'>SPRING 2024 [4 months]</h4>
<ul class='list-disc pl-5'>
	<li class='pr-5'>A reimplementation of OpenAI's Proximal Policy Optimization, which was used to train a supervised learning model capable of beating the first level of Sonic the Hedgehog in 8 seconds from world record pace!</li>
	<li class='pr-5'>Major emphasis on building intuition for environment development, interfacing a game agent with an RL algorithm, and analyzing training results to tune hyperparameters.</li>
	<li class='pr-5'>Acted as head developer and project manager. <a href='https://www.linkedin.com/in/darrolls/details/projects/' style='color: #e2e224;' class='no-underline hover:underline'>LinkedIn</a></li>
</ul>
<br></br>
<h2 style='color: #e2e224;'>- 
	<a href='https://github.com/Iemontine/AudioVideoDescriptiveAI' style='color: #e2e224;' class='no-underline hover:underline''>
		Embedded Temporal/Audio Context for Enhanced Video Content Description by LLM
	</a>
</h2>
<h4 class='text-gray-500 text:sm md:text-base'>SUMMER 2024 [2 months]</h4>
<ul class='list-disc pl-5'>
	<li class='pr-5'>A hacky yet novel solution for providing additional temporal and audio context to LLM models capable of understanding visual data by embeddeding data directly into video frames.</li>
	<li class='pr-5'>Identifies sound effects present within video content via Resnet50 architecture trained on Log-mel spectrograms to classify diverse frequency patterns within underlying audio data.</li>
	<li class='pr-5'>Resulted in noticably more detailed descriptions of videos, albeit susceptible to LLM (GPT-4o) hallucination. <a href='https://www.linkedin.com/in/darrolls/details/projects/' style='color: #e2e224;' class='no-underline hover:underline''>LinkedIn</a></li>
</ul>

<br></br>
<h2 style='color: #e2e224;'>- 
	<a href='https://github.com/Iemontine/SonicGameplayingAI' style='color: #e2e224;' class='no-underline hover:underline''>
		Gamification of Education in AI/ML
	</a>
</h2>
<h4 class='text-gray-500 text:sm md:text-base'>PRESENT [1 month]</h4>
<ul class='list-disc pl-5'>
	<li class='pr-5'>Research performed under Professor Rafatirad at UC Davis on the topic of creating gamification tools for education in AI/ML</li>
	<li class='pr-5'>Interfaced custom Godot games and Python RL libraries, applying PPO and adjusting reward weights to train ML agents within games; analyzing results using Tensorflow.</li>
	<li class='pr-5'>Familiarized with existing research and the types of design features and paradigms required when developing an educational games.</li>
</ul>
<br></br>
<h1 style='color: #4fae9b;' class='text-base md:text-xl' id='header_projects'>projects</h1>
<h2 style='color: #e2e224;'>- 
	<a href='https://github.com/Iemontine/cIembot' style='color: #e2e224;' class='no-underline hover:underline'>
		clembot
	</a>
</h2>
Solo-developed Discord bot capable of multi-user fine-tuned AI chat, music playing, generative image processing, birthday wishing, per-user activity tracking, and more! Features added as I continue to gain experience as a developer, out of interest and curiosity, and to solve problems encountered in daily online life. <a href='https://github.com/Iemontine/cIembot' style='color: #e2e224;' class='no-underline hover:underline'''>GitHub</a>
<br></br>
<h2 style='color: #e2e224;'>- 
	<a href='https://steamcommunity.com/sharedfiles/filedetails/?id=2988658929' style='color: #e2e224;' class='no-underline hover:underline''>
		gmod_ultrakill_hud
	</a>
</h2>
A HUD Mod in popular online video game Garry's Mod, designed to mimic the HUD of the game 'ULTRAKILL'. With tens of thousands of active users and over 130,000 views across Steam and YouTube, it is my first successful mod of a video game in Lua. <a href='https://github.com/Iemontine/ultrakill-hud' style='color: #e2e224;' class='no-underline hover:underline'''>GitHub</a>
<br></br>

<h2 style='color: #e2e224;'>- 
	<a href='https://iemontine.github.io/minigames/' style='color: #e2e224;' class='no-underline hover:underline''>
		GridGame
	</a>
</h2>
A short 2D grid-based block-pushing puzzle game representing my first large-scale group project. With the help of my friends consisting of talented artists and designers (woopco, vaire, casperkun, and Cyril) we created our first full game together. Game mechanics and site coded entirely in Javascript manipulating DOM elements. You can play it <a href='https://iemontine.github.io/minigames' style='color: #e2e224;' class='no-underline hover:underline'''>here!</a>
<br></br>
<h2 style='color: #e2e224;'>- 
	<a href='https://github.com/Iemontine/FloodFinder' style='color: #e2e224;' class='no-underline hover:underline''>
		FloodFinder
	</a>
</h2>
A full-stack web application developed at Hackdavis 2023, designed to help users respond to nearby natural disasters. Although it lacked the early-warning system we hoped to implement due to a lack of foresight, we implemented AI function calling and emergency response recommendations. Utilized the Google Earth API and a simple Python backend. <a href='https://github.com/Iemontine/FloodFinder' style='color: #e2e224;' class='no-underline hover:underline'''>GitHub</a>
<br></br>
<h2 style='color: #e2e224;'>
	- softwareInstaller
</h2>
I built a user-friendly & maintainable VB.Net application for the UC Davis Library IT department to automate the installation of software on new computers. The program significantly increased efficiency and reduced the time required to set up or image new computers, including adding them to the network's Active Directory, installing software, maintaining a device naming convention, and configuring settings.
<br></br>
<h2 style='color: #e2e224;'>- misc.dev</h2>
	<ul class='list-none pl-1 md:pl-5'>
	<li class='before:content-['-'] pr-5'><a href='https://iemontine.github.io/portfolio' style='color: #e2e224;' class='no-underline hover:underline''>this.website</a> - (Typescript, TailwindCSS)</li>
	<li class='before:content-['-'] pr-5'><a href='https://github.com/Iemontine/WebDevPractice-OMORI' style='color: #e2e224;' class='no-underline hover:underline''>omori-themed-web-design-practice</a></li>
	<li class='before:content-['-'] pr-5'><a href='https://github.com/Iemontine/minigames' style='color: #e2e224;' class='no-underline hover:underline''>web-based-javascript-minigames</a></li>
	<li class='before:content-['-'] pr-5'><a href='https://github.com/Iemontine/microblog' style='color: #e2e224;' class='no-underline hover:underline''>online.blog.design</a> - (Node.js, SQLite, Google OAuth)</li>
	<li class='before:content-['-'] pr-5'><a href='https://github.com/Iemontine/plaque-counter' style='color: #e2e224;' class='no-underline hover:underline''>plaque-counter</a> - (Python, OpenCV, NumPy)</li>
	</ul>
<br></br>

<h1 style='color: #4fae9b;' class='text-base md:text-xl' id='header_experience'>experience</h1><br>

<h2 class='text-sm md:text-lg text-purple-600'>- Information Technology Infrastructure Services, <span class='text-xs md:text-sm'> UC DAVIS LIBRARY </span></h2><br>
<h4 class='text-gray-500 text:sm md:text-base'>DEC 2023 - PRESENT [11 months]</h4>
<ul class='list-disc pl-1 md:pl-5'>
	<li class='before:content-['-'] pr-5'>Developed software with .NET framework to accelerate setup of workstations for student, staff, and public use, a self-led and maintained effort. This software replaces old methodology of manually installing necessary software and adding the devices to the domain.</li>
	<li class='before:content-['-'] pr-5'>Troubleshooting and setup of computer equipment and software for several departments each with dozens of staff.</li>
	<li class='before:content-['-'] pr-5'>Responsible for maintaining efficient communication coming from the ITIS department, when technical support is needed.</li>
</ul><br></br>

<h2 class='text-sm md:text-lg text-purple-600'>- System Developer and Administrator, <span class='text-xs md:text-sm'> COMFORT LIVING FOR SENIORS </span></h2><br>
<h4 class='text-gray-500 text-sm md:text-base'>2021 - PRESENT [3 years]</h4><br>
<ul class='list-disc pl-1 md:pl-5'>
	<li class='before:content-['-'] pr-5'>Created a web interface and several user-friendly tools allowing employees to electronically input a variety of elderly patient data, allowing the business to go paperless.</li>
	<li class='before:content-['-'] pr-5'>Formatted data, made accessible online by staff and inspection, using semi-complex spreadsheet functionality.</li>
	<li class='before:content-['-'] pr-5'>Performed routine system maintenance to ensure operations are smooth and to remove errors, and adding new features or functionality as requested.</li>
</ul>
<br></br>

<h2 class='text-sm md:text-lg text-purple-600'>- AI Developer on Project Volare <span class='text-xs md:text-sm'> CODELAB at UC DAVIS </span></h2><br>
<h4 class='text-gray-500 text:sm md:text-base'>FALL 2024 - PRESENT [4 months]</h4>
<ul class='list-disc pl-1 md:pl-5'>
	<li class='before:content-['-'] pr-5'>Became familiarized with formal software engineering development processes within a large software development agency.</li>
	<li class='before:content-['-'] pr-5'>A web application allowing users to practice for job interviews with a real time AI assistant, allowing input of their specific job position and performance tracking for a customized and iterative practice experience.</li>
	<li class='before:content-['-'] pr-5'>Performed early stages development on a program investigating and leveraging vocal tone analysis AI, LLMs, and real time speech recognition</li>
	<li class='before:content-['-'] pr-5'>Investigative work into body language classification models for adding additional context to LLM via webcam footage.</li>
	<li class='before:content-['-'] pr-5'>General web development skills (Typescript, API Design, TailwindCSS).</li>
</ul><br></br>

<h2 class='text-sm md:text-lg text-purple-600'>- Monsters' Shift <span class='text-xs md:text-sm'> UC DAVIS </span></h2><br>
<h4 class='text-gray-500 text:sm md:text-base'>SEP 2024 - DEC 2024 [4 months]</h4>
<ul class='list-disc pl-1 md:pl-5'>
	<li class='before:content-['-'] pr-5'>A 2D RPG where you work part-time jobs for townsfolk who turn into monsters during the night; developed in Godot with a team of six for a quarter-long course project.</li>
	<li class='before:content-['-'] pr-5'>Learned and applied a variety of game development and general software engineering techniques (e.g. factory pattern, singleton, encapsulation, inheritance).</li>
	<li class='before:content-['-'] pr-5'>As project director, managed version control via git, managed Agile workloads, ideation/discussions, branch merging for nearly 500 commits, fixing bugs when they appear.</li>
	<li class='before:content-['-'] pr-5'>Implemented many of the game's vital infrastructure. (e.g. interactable objects, scene switchers, cutscene authoring tools, character customizer, some shaders).</li>
	<li class='before:content-['-'] pr-5'>Gained experience working with asset pack and building worlds with them, taking creative liberties, drawing inspiration from a variety of existing games (e.g. Stardew Valley, OMORI, Signalis), pre-planning game design.</li>
	<li class='before:content-['-'] pr-5'>For more information about the game and my contributions, check out it out <a href='https://github.com/Iemontine/MonstersShift/blob/main/ProjectDocument.md#treehouse-exterior.' style='color: #e2e224;' class='no-underline hover:underline''>here</a>.</li>
</ul><br></br>

<h2 class='text-sm md:text-lg text-purple-600'>- President of the STEM Club, <span class='text-xs md:text-sm'> SOLANO COMMUNITY COLLEGE </span></h2><br>
<h4 class='text-gray-500 text-sm md:text-base'>FALL 2021 - SPRING 2023 [2 years]</h4>
<ul class='list-disc pl-1 md:pl-5'>
    <li class='before:content-['-'] pr-5'>Maintained position-specific responsibilities while facilitating the meetings and discussions held for a club of nearly 200 members.</li>
    <li class='before:content-['-'] pr-5'>Planned many fun & educational events, including coastal clean-ups, a science fair, peer networking and tutoring opportunities, and museum field trips.</li>
</ul><br></br>
`;

// Map header name to art, used to determine which page to display based on which header is in view
const PAGE_ASCII_ART = [
	{ id: 0, headerId: 'header_portfolio', content: artPage0 },
	{ id: 1, headerId: 'header_research', content: artPage2 },
	{ id: 2, headerId: 'header_projects', content: artPage1 },
	{ id: 3, headerId: 'header_experience', content: artPage4 },
	{ id: 4, headerId: 'header_favorites', content: artPage3 },
];

const CHARS_PER_TICK = 3;		// content: Number of characters to type per tick
const TYPING_SPEED = 15;		// art: Delay between typing each character in ms
const DELETE_SPEED = 15;		// art: Speed of deleting in ms
const SCROLL_COOLDOWN = 100;	// Small cooldown between scroll events
const BACKGROUND_COLOR = '#000000';
const INTERFACE_COLOR = '#4fae9b';

export { PAGE_CONTENT, CONTENT, PAGE_ASCII_ART, TYPING_SPEED, DELETE_SPEED, CHARS_PER_TICK, SCROLL_COOLDOWN, BACKGROUND_COLOR, INTERFACE_COLOR };
