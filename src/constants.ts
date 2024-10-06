import { artPage0, artPage1, artPage2, artPage3, artPage4 } from "./ascii/art";

const PAGE_CONTENT = [
	{ id: 0, content: "" },
	{ id: 1, content: "" },
	{ id: 2, content: "" },
	{ id: 3, content: "" },
	{ id: 4, content: "" },
];

// TODO: variable speed for deleting/writing to account for string length including html

const CONTENT = `
<h1 style='color: #4fae9b;' id='header_portfolio'>
	Iemontine [Version 1.20.21210.34]
</h1>

	This single-page design was inspired by Portal 2. It was created on October 4, 2024.
<br></br>
<span style='color: rgb(255,255,255)'>
	I'm</span> <span style='color: rgb(229, 128, 0)'>I</span><span style='color: rgb(232, 136, 0)'>e</span><span style='color: rgb(235, 144, 0)'>m</span><span style='color: rgb(238, 153, 0)'>o</span><span style='color: rgb(241, 161, 0)'>n</span><span style='color: rgb(244, 170, 0)'>t</span><span style='color: rgb(247, 178, 0)'>i</span><span style='color: rgb(249, 187, 0)'>n</span><span style='color: rgb(252, 195, 0)'>e</span><span style='color: rgb(255,255,255)'>, you might also know me as darroll!</span>
<br></br>
<h4 style='color: gray'># <span style='font-size: 1.2em'>some things about me</span></h4>
<h4 style='color: gray'>-- Fourth-Year CS at UCD</h4>
<h4 style='color: gray'>-- hobbies: programming, video games, video editing, computer building, hackathons, and watching movies</h4>
<h4 style='color: gray'>-- technical skills: full-stack webdev, hardware/software concepts, and machine learning & AI</h4>
<h4 style='color: gray'>-- specs: RTX 4070, AMD Ryzen 9 5900X</h4>
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
<span style='color: rgb(65, 105, 225)'>PyTorch</span>, 
<span style='color: rgb(65, 105, 225)'>OpenAI</span>, 
<span style='color: rgb(65, 105, 225)'>Gymnasium</span>, 
<span style='color: rgb(65, 105, 225)'>Pycord</span>, 
<span style='color: rgb(65, 105, 225)'>Pillow</span>, 
<span style='color: rgb(65, 105, 225)'>BeautifulSoup</span>, 
<span style='color: rgb(65, 105, 225)'>Microsoft Azure</span>
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
A Discord bot capable of AI chat, music playing, image processing, birthday wishing, activity tracking, and more! Features added as I continue gain experience as a developer, out of interest and curiosity, and to solve the problems my family, friends, or I encounter in daily online life. <a href='https://github.com/Iemontine/cIembot' style='color: #e2e224;' class="no-underline hover:underline"''>GitHub</a>
<br></br>
<h2 style='color: #e2e224;'>- <a href='https://steamcommunity.com/sharedfiles/filedetails/?id=2988658929' style='color: #e2e224;' class="no-underline hover:underline"'>gmod_ultrakill_hud</a></h2>
A HUD Mod in popular online video game Garry's Mod, designed to mimic the HUD of the game "ULTRAKILL". With tens of thousands of active users and over 130,000 views across Steam and YouTube, it is my first successful mod of a video game in Lua. <a href='https://github.com/Iemontine/ultrakill-hud' style='color: #e2e224;' class="no-underline hover:underline"''>GitHub</a>
<br></br>
<h2 style='color: #e2e224;'>- <a href='https://iemontine.github.io/minigames/' style='color: #e2e224;' class="no-underline hover:underline"'>GridGame</a></h2>
A short 2D grid-based block-pushing puzzle game representing my first large-scale group project. With the help of my friends consisting of talented artists and designers (woopco, VVVaire, casperkun, and Cyril) we created our first full game together. Game mechanics and site coded entirely in Javascript manipulating DOM elements. You can play it <a href='https://iemontine.github.io/minigames' style='color: #e2e224;' class="no-underline hover:underline"''>here!</a>
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

`;
const PAGE_ASCII_ART = [
	{ id: 0, headerId: "header_portfolio", content: artPage0 },
	{ id: 1, headerId: "header_research", content: artPage2 },
	{ id: 2, headerId: "header_projects", content: artPage1 },
];

const CHARS_PER_TICK = 2;   // content: Number of characters to type per tick
const TYPING_SPEED = 15;    // art: Delay between typing each character in ms
const DELETE_SPEED = 15;    // art: Speed of deleting in ms
const SCROLL_COOLDOWN = 100; // Small cooldown between scroll events
const BACKGROUND_COLOR = "#000000";
const INTERFACE_COLOR = "#4fae9b";

export { PAGE_CONTENT, CONTENT, PAGE_ASCII_ART, TYPING_SPEED, DELETE_SPEED, CHARS_PER_TICK, SCROLL_COOLDOWN, BACKGROUND_COLOR, INTERFACE_COLOR };
