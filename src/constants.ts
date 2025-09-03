import { artPage0, artPage1, artPage2, artPage3, artPage4 } from './ascii/art';

// Map header name to art, used to determine which page to display based on which header is in view
const PAGE_ASCII_ART = [
	{ id: 0, headerId: 'header_portfolio', content: artPage0 },
	{ id: 1, headerId: 'header_research', content: artPage2 },
	{ id: 2, headerId: 'header_projects', content: artPage1 },
	{ id: 3, headerId: 'header_experience', content: artPage4 },
	{ id: 4, headerId: 'header_favorites', content: artPage3 },
];

const CHARS_PER_TICK = 3;        // content: Number of characters to type per tick
const TYPING_SPEED = 15;         // art: Delay between typing each character in ms
const DELETE_SPEED = 15;         // art: Speed of deleting in ms
const SCROLL_COOLDOWN = 100;     // Small cooldown between scroll events
const BACKGROUND_COLOR = '#000000';
const INTERFACE_COLOR = '#4fae9b';

export { PAGE_ASCII_ART, TYPING_SPEED, DELETE_SPEED, CHARS_PER_TICK, SCROLL_COOLDOWN, BACKGROUND_COLOR, INTERFACE_COLOR };
