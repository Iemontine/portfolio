import { artPage0, artPage1, artPage2, artPage3, artPage4 } from "./ascii/art";

const PAGE_CONTENT = [
	{ id: 0, content: "" },
	{ id: 1, content: "" },
	{ id: 2, content: "" },
	{ id: 3, content: "" },
	{ id: 4, content: "" },
];

// TODO: variable speed for deleting/writing to account for string length including html

// Dangerously set HTML for now
const CONTENT = `
<h1 style='color: #4fae9b;' id='header_portfolio'>
	Iemontine [Version 1.20.21210.34]
</h1>
	This single-page design was inspired by Portal 2. It was created on October 4, 2024.
<br></br>
<span style='color: rgb(255,255,255)'>
	I'm</span> <span style='color: rgb(229, 128, 0)'>I</span><span style='color: rgb(232, 136, 0)'>e</span><span style='color: rgb(235, 144, 0)'>m</span><span style='color: rgb(238, 153, 0)'>o</span><span style='color: rgb(241, 161, 0)'>n</span><span style='color: rgb(244, 170, 0)'>t</span><span style='color: rgb(247, 178, 0)'>i</span><span style='color: rgb(249, 187, 0)'>n</span><span style='color: rgb(252, 195, 0)'>e</span><span style='color: rgb(255,255,255)'>, you might also know me as darroll!</span>
<br></br>
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
<h1 style='color: #4fae9b;' id='header_research'>research</h1>
<h2 style='color: #e2e224;'>- <a href='https://github.com/Iemontine/SonicGameplayingAI' style='color: #e2e224;' class="no-underline hover:underline"'>Gameplaying AI with Proximal Policy Optimization</a></h2>
A successful reimplementation of OpenAI's Proximal Policy Optimization, which was used to train a supervised learning model capable of beating the first level of Sonic the Hedgehog in just 30 seconds! <a href='https://www.linkedin.com/in/darrolls/details/projects/' style='color: #e2e224;' class="no-underline hover:underline"'>LinkedIn</a>
<br></br>
<h2 style='color: #e2e224;'>- <a href='https://github.com/Iemontine/AudioVideoDescriptiveAI' style='color: #e2e224;' class="no-underline hover:underline"'>Embedded Temporal/Audio Context for Enhanced Video Content Description by LLM</a></h2>
An experimental program that increases the quality of descriptions of an AI. Completed in just 2 months, I successfully trained and utilized audio classification models to reintroduce lost temporal and audio context when feeding the video frames into an LLM (GPT-4o). <a href='https://www.linkedin.com/in/darrolls/details/projects/' style='color: #e2e224;' class="no-underline hover:underline"'>LinkedIn</a>
<br></br>
<h1 style='color: #4fae9b;' id='header_projects'>projects</h1>
<h2 style='color: #e2e224;'>
  - <a href="https://github.com/Iemontine/cIembot" style='color: #e2e224;' class="no-underline hover:underline">clembot</a>
</h2>
A Discord bot capable of AI chat, music playing, image processing, birthday wishing, activity tracking, and more! Features added as I continue to gain experience as a developer, out of interest and curiosity, and to solve the problems my family, friends, or I encounter in daily online life. <a href='https://github.com/Iemontine/cIembot' style='color: #e2e224;' class="no-underline hover:underline"''>GitHub</a>
<br></br>
<h2 style='color: #e2e224;'>- <a href='https://steamcommunity.com/sharedfiles/filedetails/?id=2988658929' style='color: #e2e224;' class="no-underline hover:underline"'>gmod_ultrakill_hud</a></h2>
A HUD Mod in popular online video game Garry's Mod, designed to mimic the HUD of the game "ULTRAKILL". With tens of thousands of active users and over 130,000 views across Steam and YouTube, it is my first successful mod of a video game in Lua. <a href='https://github.com/Iemontine/ultrakill-hud' style='color: #e2e224;' class="no-underline hover:underline"''>GitHub</a>
<br></br>
<h2 style='color: #e2e224;'>- <a href='https://iemontine.github.io/minigames/' style='color: #e2e224;' class="no-underline hover:underline"'>GridGame</a></h2>
A short 2D grid-based block-pushing puzzle game representing my first large-scale group project. With the help of my friends consisting of talented artists and designers (woopco, vaire, casperkun, and Cyril) we created our first full game together. Game mechanics and site coded entirely in Javascript manipulating DOM elements. You can play it <a href='https://iemontine.github.io/minigames' style='color: #e2e224;' class="no-underline hover:underline"''>here!</a>
<br></br>
<h2 style='color: #e2e224;'>- <a href='https://github.com/Iemontine/FloodFinder' style='color: #e2e224;' class="no-underline hover:underline"'>FloodFinder</a></h2>
A full-stack web application developed at Hackdavis 2023, designed to help users respond to nearby natural disasters. Although it lacked the early-warning system we hoped to implement due to a lack of foresight, we implemented AI function calling and emergency response recommendations. Utilized the Google Earth API and a simple Python backend. <a href='https://github.com/Iemontine/FloodFinder' style='color: #e2e224;' class="no-underline hover:underline"''>GitHub</a>
<br></br>
<h2 style='color: #e2e224;'>- softwareInstaller</h2>
I built a user-friendly & maintainable VB.Net application for the UC Davis Library IT department to automate the installation of software on new computers. The program significantly increased efficiency and reduced the time required to set up or image new computers, including adding them to the network's Active Directory, installing software, maintaining a device naming convention, and configuring settings.
<br></br>
<h2 style='color: #e2e224;'>- other.webdev</h2>
This website, GridGame, in addition to a study functionality/CSS reimplementation of the Official OMORI Website, and a microblog site utilizing a SQLite database backend were developed as practice projects to improve webdev.
<br></br>

<h1 style='color: #4fae9b;' id='header_experience'>experience</h1><br>
<h2 class="text-xl text-purple-600">- Information Technology Infrastructure Services, <span class="text-sm"> UC DAVIS LIBRARY </span></h2><br>
<h4 class="text-gray-500 text-base">Dec 2023 - PRESENT [11 months]</h4>
<ul class="list-none pl-5">
    <li class="before:content-['-'] before:pr-2">Developed software with .NET framework to accelerate setup of workstations for student, staff, and public use, a self-led and maintained effort.</li>
    <li class="before:content-['-'] before:pr-2">Troubleshooting and setup of computer equipment and software for several departments each with dozens of staff.</li>
    <li class="before:content-['-'] before:pr-2">Responsible for maintaining efficient communication coming from the ITIS department, when technical support is needed.</li>
</ul><br></br>

<h2 class="text-xl text-purple-600">- System Developer and Administrator, <span class="text-sm"> COMFORT LIVING FOR SENIORS </span></h2><br>
<h4 class="text-gray-500 text-base">2021 - PRESENT [3 years]</h4><br>
<ul class="list-none pl-5">
    <li class="before:content-['-'] before:pr-2">Created a web interface and several user-friendly tools allowing employees to electronically input a variety of elderly patient data, allowing the business to go paperless.</li>
    <li class="before:content-['-'] before:pr-2">Formatted data, made accessible online by staff and inspection, using semi-complex spreadsheet functionality.</li>
    <li class="before:content-['-'] before:pr-2">Performed routine system maintenance to ensure operations are smooth and to remove errors, and adding new features or functionality as requested.</li>
</ul><br></br>

<h2 class="text-xl text-purple-600">- President of the STEM Club, <span class="text-sm"> SOLANO COMMUNITY COLLEGE </span></h2><br>
<h4 class="text-gray-500 text-base">Fall 2021 - Spring 2023 [2 years]</h4>
<ul class="list-none pl-5">
    <li class="before:content-['-'] before:pr-2">Maintained position-specific responsibilities while facilitating the meetings and discussions held for a club of nearly 200 members.</li>
    <li class="before:content-['-'] before:pr-2">Planned many fun & educational events, including coastal clean-ups, a science fair, peer networking and tutoring opportunities, and museum field trips.</li>
</ul><br></br>
`;

// Map header name to art, used to determine which page to display based on which header is in view
const PAGE_ASCII_ART = [
	{ id: 0, headerId: "header_portfolio", content: artPage0 },
	{ id: 1, headerId: "header_research", content: artPage2 },
	{ id: 2, headerId: "header_projects", content: artPage1 },
	{ id: 3, headerId: "header_experience", content: artPage4 },
	{ id: 4, headerId: "header_favorites", content: artPage3 },
];

const CHARS_PER_TICK = 2;   // content: Number of characters to type per tick
const TYPING_SPEED = 15;    // art: Delay between typing each character in ms
const DELETE_SPEED = 15;    // art: Speed of deleting in ms
const SCROLL_COOLDOWN = 100; // Small cooldown between scroll events
const BACKGROUND_COLOR = "#000000";
const INTERFACE_COLOR = "#4fae9b";

export { PAGE_CONTENT, CONTENT, PAGE_ASCII_ART, TYPING_SPEED, DELETE_SPEED, CHARS_PER_TICK, SCROLL_COOLDOWN, BACKGROUND_COLOR, INTERFACE_COLOR };
