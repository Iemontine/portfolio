import { artPage0, artPage1, artPage2, artPage3, artPage4 } from "./ascii/art";

const PAGE_CONTENT = [
	{ id: 0, content: "" },
	{ id: 1, content: "" },
	{ id: 2, content: "" },
	{ id: 3, content: "" },
	{ id: 4, content: "" },
];


// <span>I'm </span><span style='color: rgb(229, 128, 0)'>I</span><span style='color: rgb(232, 136, 0)'>e</span><span style='color: rgb(235, 144, 0)'>m</span><span style='color: rgb(238, 153, 0)'>o</span><span style='color: rgb(241, 161, 0)'>n</span><span style='color: rgb(244, 170, 0)'>t</span><span style='color: rgb(247, 178, 0)'>i</span><span style='color: rgb(249, 187, 0)'>n</span><span style='color: rgb(252, 195, 0)'>e</span>!<br></br>
// <br></br>
// <span style='color: rgb(255, 255, 255)'>a </span>
// <span style='color: rgb(128, 0, 0)'>computer scientist</span>
// <span style='color: rgb(255, 255, 255)'> with a passion for all things </span>
// <span style='color: rgb(34, 139, 34)'>machine learning</span>
// <span style='color: rgb(255, 255, 255)'> and </span>
// <span style='color: rgb(0, 0, 128)'>artificial intelligence</span>
// <span style='color: rgb(255, 255, 255)'>.</span>
// <br><br>
// <h4 style='color: rgb(128, 128, 128)'>-- fourth year academia, seeking research and internship opportunities.</h4>
// <br>
// <h4 style='color: rgb(255, 255, 255)'>proficient in 
// <span style='color: rgb(255, 203, 58)'>Python</span>, 
// <span style='color: rgb(248, 152, 34)'>Java</span>, 
// <span style='color: rgb(240, 219, 79)'>JavaScript</span>, 
// <span style='color: rgb(101, 154, 210)'>C</span>, 
// <span style='color: rgb(204, 204, 255)'>C++</span>, 
// <span style='color: rgb(162, 135, 221)'>CSharp</span>, 
// <span style='color: rgb(203, 65, 84)'>HTML/CSS</span>, 
// <span style='color: rgb(255, 111, 97)'>VB.NET</span>, 
// <span style='color: rgb(255, 83, 73)'>Bash scripting</span>.
// </h4>
// <br>
// <h4 style='color: rgb(128, 128, 128)'>-- specs: RTX 4070, AMD Ryzen 9 5900X</h4>
// <br>
// <h4 style='color: rgb(255, 255, 255)'>favorite libraries/APIs: 
// <span style='color: rgb(65, 105, 225)'>PyTorch</span>, 
// <span style='color: rgb(65, 105, 225)'>OpenAI</span>, 
// <span style='color: rgb(65, 105, 225)'>Gymnasium</span>, 
// <span style='color: rgb(65, 105, 225)'>Pycord</span>, 
// <span style='color: rgb(65, 105, 225)'>Pillow</span>, 
// <span style='color: rgb(65, 105, 225)'>BeautifulSoup</span>, 
// <span style='color: rgb(65, 105, 225)'>Microsoft Azure</span>
// </h4>

// TODO: variable speed for deleting/writing to account for string length including html
const CONTENT = `
	<h1 style='color: #ae4f4f;'>About me</h1><br>
	I'm Iemontine!
	<br></br>
	a computer scientist with a passion for all things machine learning and artificial intelligence.
	<br></br>
	-- fourth year academia, seeking research and internship opportunities.
	<br></br>
	proficient in Python, Java, JavaScript, C, C++, CSharp, HTML/CSS, VB.NET, Bash scripting.
	<br></br>
	-- specs: RTX 4070, AMD Ryzen 9 5900X
	<br></br>
	favorite libraries/APIs: PyTorch, OpenAI, Gymnasium, Pycord, Pillow, BeautifulSoup, Microsoft Azure
	<br></br>

	<h2 style='color: #ae4f4f;'>Gameplay</h2><br></br>
	Portal 2 is a first-person perspective puzzle game. The player takes the role of Chell in the single-player campaign, as one of two robots—Atlas and P-Body—in the cooperative campaign, or as a simplistic humanoid icon in community-developed puzzles. Characters can withstand limited damage but will die after sustained injury.[2][3] The goal of both campaigns is to explore the Aperture Science Laboratory—a complicated, malleable mechanized maze. While some parts of the game takes place in modular test chambers with clearly defined entrances and exits, other parts occur in behind-the-scenes areas where the objective is less clear.<br>
	<br></br>
	<h2 style='color: #ae4f4f;'>New Features</h2><br>
	Like the original Portal (2007), players solve puzzles by placing portals and teleporting between them. In the single-player campaign, players control Chell, who navigates the dilapidated Aperture Science Enrichment Center during its reconstruction by the supercomputer GLaDOS (Ellen McLain); new characters include robot Wheatley (Stephen Merchant) and Aperture founder Cave Johnson (J. K. Simmons). In the new cooperative mode, players solve puzzles together as robots Atlas and P-Body (both voiced by Dee Bradley Baker). Jonathan Coulton and the National produced songs for the game.<br>
	<br></br>
	Portal 2 adds features including:,
	<br><br>
	<span style='color: #ffff00;'>- Tractor beams</span><br>
	<span style='color: #ffff00;'>- Lasers</span><br>
	<span style='color: #ffff00;'>- Light bridges</span><br>
	<span style='color: #ffff00;'>- Paint-like gels that alter player movement</span><br>
	<br></br>
	<h2 style='color: #ae4f4f;'>Coop</h2>
	In the cooperative campaign, two players can use the same console with a split screen, or can use a separate computer or console; Windows, Mac OS X, and PlayStation 3 users can play with each other regardless of platform.[15][16] Both player-characters are robots equipped with independent portal guns, a portal pair placed by either player is usable by both.[2][8][17] Most chambers lack strict structure, and require players to use both sets of portals for laser or funnel redirection, launches, and other maneuvers.[18] The game provides voice communication between players, and online players can temporarily enter a split-screen view to help coordinate actions.[17] Players can "ping" to draw the other player's attention to walls or objects, start countdown timers for synchronized actions, and perform joint gestures such as waving or hugging.[2][7][18] The game tracks which chambers each player has completed and allows players to replay chambers they have completed with new partners.<br>
	<br></br>
	<h2 style='color: #ae4f4f;'>Educational Impacts</h2>
	Several critics wrote that Portal 2 excels in teaching the player to solve puzzles; in a review for the New York Times, Seth Schiesel wrote, "Somewhere out there an innovative, dynamic high school physics teacher will use Portal 2 as the linchpin of an entire series of lessons and will immediately become the most important science teacher those lucky students have ever had."[168] Mathematics and science teachers wrote e-mails to Valve to tell them how they had included Portal in their classroom lessons as part of a project to promote the "gamification of learning".<br></br><br></br><br></br>
`;
const PAGE_ASCII_ART = [
	{ id: 0, content: artPage0 },
	{ id: 1, content: artPage1 },
	{ id: 2, content: artPage2 },
	{ id: 3, content: artPage3 },
	{ id: 4, content: artPage4 },
];

const TYPING_SPEED = 10; // Delay between typing each character in ms
const DELETE_SPEED = 10; // Speed of deleting in ms
const SCROLL_COOLDOWN = 10; // Small cooldown between scroll events
const BACKGROUND_COLOR = "#000000";
const INTERFACE_COLOR = "#4fae9b";

export { PAGE_CONTENT, CONTENT, PAGE_ASCII_ART, TYPING_SPEED, DELETE_SPEED, SCROLL_COOLDOWN, BACKGROUND_COLOR, INTERFACE_COLOR };
