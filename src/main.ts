import "./style.css";
import { asciiArts, defaultAscii } from "./ascii-art";

// ============================
// INTERFACES & TYPES
// ============================

interface WindowConfig {
	id: string;
	title: string;
	content: string;
	width?: number;
	height?: number;
	x?: number;
	y?: number;
	theme?: "default";
	isFixed?: boolean;
}

interface DesktopIcon {
	id: string;
	label: string;
	windowId: string;
}

// ============================
// WINDOW MANAGER CLASS
// ============================

class WindowManager {
	private windows: Map<string, HTMLElement> = new Map();
	private zIndexCounter: number = 400; // Start higher than static elements
	private currentContentWindow: string | null = null;
	private asciiWindow: HTMLElement | null = null;

	// Advanced ASCII animation state management
	private currentDisplayedText: string = "";
	private targetText: string = "";
	private animationFrameId: number | null = null; // For RAF-based animations
	private lastAnimationTime: number = 0; // For frame rate limiting

	// Window state management for maximize/restore
	private originalWindowStates: Map<
		string,
		{ width: string; height: string; left: string; top: string }
	> = new Map();

	// Persistent maximization state - shared state for all content windows (not About Me)
	private isContentWindowMaximized: boolean = false;

	// Separate About Me window storage - completely independent from content windows
	private aboutMeWindow: HTMLElement | null = null;

	constructor() {
		this.initializeDesktop();
		this.createTopRightBoxes();
		this.showAboutMe(); // About Me appears automatically on load
		this.createAsciiWindow();

		// Handle window resize for responsive updates
		window.addEventListener("resize", () => {
			this.handleResize();
			// Recompute ASCII font-size on resize when visible
			if (this.asciiWindow && this.asciiWindow.style.display !== "none") {
				const asciiElement = this.asciiWindow.querySelector(
					".ascii-art"
				) as HTMLElement;
				if (asciiElement) {
					const size = this.calculateOptimalFontSize(
						asciiElement.textContent || ""
					);
					if (size > 0) asciiElement.style.fontSize = `${size}px`;
				}
			}
		});
	}

	private handleResize(): void {
		const isMobile = window.innerWidth <= 768;

		// Defer ASCII visibility to unified logic
		this.updateAsciiWindow();

		// Reset maximization state on mobile
		if (isMobile) {
			this.isContentWindowMaximized = false;
		}

		// Handle About Me icon positioning
		const aboutIcon = document.querySelector(".about-me-icon") as HTMLElement;
		if (aboutIcon) {
			if (isMobile) {
				aboutIcon.style.position = "static";
				aboutIcon.style.bottom = "auto";
				aboutIcon.style.right = "auto";
			} else {
				aboutIcon.style.position = "absolute";
				aboutIcon.style.bottom = "0px";
				aboutIcon.style.right = "0px";
			}
		}

		// Ensure About Me window is always visible on mobile
		if (isMobile && !this.aboutMeWindow) {
			this.showAboutMe();
		}
	}

	private initializeDesktop(): void {
		const desktop = document.getElementById("desktop")!;
		desktop.style.width = "calc(100% - 80px)";
		desktop.style.height = "calc(100% - 80px)";
		desktop.style.position = "absolute";
		desktop.style.top = "40px";
		desktop.style.left = "40px";
		desktop.style.zIndex = "2";
		desktop.style.padding = "20px";
		desktop.style.display = "grid";
		desktop.style.gridTemplateColumns = "repeat(auto-fit, 80px)";
		desktop.style.gridTemplateRows = "repeat(auto-fit, 100px)";
		desktop.style.gap = "20px";
		desktop.style.alignContent = "start";
		desktop.style.justifyContent = "start";

		const icons: DesktopIcon[] = [
			{ id: "research-icon", label: "Research", windowId: "research" },
			{ id: "projects-icon", label: "Projects", windowId: "projects" },
			{ id: "experience-icon", label: "Experience", windowId: "experience" },
			{ id: "contact-icon", label: "Contact", windowId: "contact" },
		];

		icons.forEach((icon) => {
			const iconElement = this.createDesktopIcon(icon);
			desktop.appendChild(iconElement);
		});

		// Create About Me icon positioned behind the About Me window
		this.createAboutMeIcon();
	}

	private createDesktopIcon(icon: DesktopIcon): HTMLElement {
		const iconElement = document.createElement("div");
		iconElement.className = "desktop-icon";
		iconElement.setAttribute("data-window", icon.windowId);

		iconElement.innerHTML = `
      <div class="icon"></div>
      <div class="label">${icon.label}</div>
    `;

		iconElement.addEventListener("click", () => {
			this.openWindow(icon.windowId);
		});

		return iconElement;
	}

	private createTopRightBoxes(): void {
		const container = document.getElementById("top-right-container")!;
		container.className = "top-right-container";

		// Box 1: Data Matrix
		const dataBox = document.createElement("div");
		dataBox.className = "info-box data-matrix";
		dataBox.innerHTML = this.generateMatrixData();
		container.appendChild(dataBox);

		// Box 2: Stats
		const statsBox = document.createElement("div");
		statsBox.className = "info-box stats";
		statsBox.innerHTML = `
      <div>2.67</div>
      <div>1002</div>
      <div>45.6</div>
    `;
		container.appendChild(statsBox);

		// Box 3: Rotating Logo
		const logoBox = document.createElement("div");
		logoBox.className = "info-box logo";
		logoBox.innerHTML = '<div class="rotating-logo"></div>';
		container.appendChild(logoBox);

		// Animate matrix data
		setInterval(() => {
			dataBox.innerHTML = this.generateMatrixData();
		}, 2000);
	}

	private generateMatrixData(): string {
		const chars = "01";
		const rows = 8;
		const cols = 12;
		let result = "";

		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				result += chars[Math.floor(Math.random() * chars.length)];
			}
			if (i < rows - 1) result += "<br>";
		}

		return result;
	}

	private createAboutMeIcon(): void {
		const aboutIcon = document.createElement("div");
		aboutIcon.className = "desktop-icon about-me-icon";
		aboutIcon.setAttribute("data-window", "about-me");

		aboutIcon.innerHTML = `
      <div class="icon"></div>
      <div class="label">About Me</div>
    `;

		aboutIcon.addEventListener("click", () => {
			// About Me should just toggle visibility, not interfere with content windows
			this.toggleAboutMe();
		});

		// Position it behind the About Me window on desktop, in grid on mobile
		const isMobile = window.innerWidth <= 768;
		if (!isMobile) {
			aboutIcon.style.position = "absolute";
			aboutIcon.style.bottom = "0px";
			aboutIcon.style.right = "0px";
			aboutIcon.style.zIndex = "1"; // Low z-index within desktop context
		}

		const desktop = document.getElementById("desktop")!;
		desktop.appendChild(aboutIcon);
	}

	private getAboutMeContent(): string {
		return `
      <div class="terminal-text">
        <div class="system-header">lemontine [Version 1.12.41.1125]</div>
        
        <div class="section">
          <div class="section-title">LEMONTINE</div>
          
          <div class="currents-section">
            <div class="currents-title">currents</div>
            <div class="current-item"><span class="status-watching">~Watching:</span> Speed Racer (2008)</div>
            <div class="current-item"><span class="status-playing">~Playing:</span> Zenless Zone Zero</div>
            <div class="current-item"><span class="status-listening">~Listening to:</span> Good Kid, The Vanished People</div>
          </div>
          
          <div class="intro-text">I'm <span class="highlight-name">lemontine</span>, you might also know me as darroll!</div>
          
          <div class="about-section">
            <div class="about-title">about me</div>
            <div class="about-line"><span class="about-label">LEMONTINE:</span> A fourth-year computer science student at UCD, with a focus on machine learning and AI.</div>
            <div class="about-line"><span class="about-label">HOBBIES:</span> Programming, video games, video editing, computer building, & hackathons.</div>
            <div class="about-line"><span class="about-label">ENJOYS:</span> Learning about and applying machine learning and AI, full-stack web development,</div>
            <div class="about-line indent">hardware/software concepts.</div>
            <div class="about-line"><span class="about-label">SPECS:</span> RTX 4070 and an AMD Ryzen 9 5900X.</div>
            
            <div class="favorites-section">
              <div class="about-label">FAVORITES:</div>
              <div class="about-line indent"><span class="fav-category">~Anime/TV/Movies:</span> Scott Pilgrim vs the World, Shaun of the Dead, Chainsaw Man, Dandadan</div>
              <div class="about-line indent"><span class="fav-category">~Video Games:</span> Minecraft, Portal 2, Team Fortress 2, Letframe, Zenless Zone Zero, Fortnite</div>
              <div class="about-line indent"><span class="fav-category">~Artists:</span> Jerma, Carpenter Brut, Ricky Montgomery, Good Kid, The Vanished People</div>
            </div>
            
            <div class="skills-line">
              proficient in <span class="skill-highlight">Python</span>, <span class="skill-highlight">Java</span>, <span class="skill-highlight">Typescript</span>, <span class="skill-highlight">C</span>, <span class="skill-highlight">C++</span>, <span class="skill-highlight">CSharp</span>, <span class="skill-highlight">HTML/Tailwind/CSS</span>, <span class="skill-highlight">VB.Net</span>, <span class="skill-highlight">Bash scripting</span>.
            </div>
            <div class="apis-line">
              favorite libraries/APIs: <span class="api-highlight">pytorch</span>, <span class="api-highlight">Microsoft Azure</span>, <span class="api-highlight">openai</span>, <span class="api-highlight">gymnasium</span>, <span class="api-highlight">pycord</span>, <span class="api-highlight">Pillow</span>, <span class="api-highlight">BeautifulSoup</span>
            </div>
          </div>
        </div>
      </div>
    `;
	}

	public openWindow(windowId: string): void {
		const isMobile = window.innerWidth <= 768;

		// Close other content windows first (About Me is separate)
		if (!isMobile) {
			this.closeNonFixedWindows();
		} else {
			// On mobile, close other content windows
			this.windows.forEach((_, wId) => {
				if (wId !== windowId) {
					this.closeWindow(wId);
				}
			});
		}

		// If the same window is already open, just bring it to front
		if (this.windows.has(windowId)) {
			this.bringToFront(windowId);
			return;
		}

		const config = this.getWindowConfig(windowId);
		if (config) {
			this.createWindow(config);

			// Update current content window for ASCII display
			this.currentContentWindow = windowId;
			this.updateAsciiWindow();
		}
	}

	private closeNonFixedWindows(): void {
		// Close all content windows (About Me is separate and not affected)
		this.windows.forEach((_, windowId) => {
			this.closeWindow(windowId);
		});

		// Update ASCII window when content windows are closed
		this.currentContentWindow = null;
		this.updateAsciiWindow();
	}

	public toggleAboutMe(): void {
		if (this.aboutMeWindow) {
			// About Me exists, toggle its visibility
			if (this.aboutMeWindow.style.display === "none") {
				this.aboutMeWindow.style.display = "block";
				this.bringAboutMeToFront();
			} else {
				this.aboutMeWindow.style.display = "none";
			}
			// Update ASCII art when About Me visibility changes
			this.updateAsciiWindow();
		} else {
			// About Me doesn't exist, create it
			this.showAboutMe();
		}
	}

	private showAboutMe(): void {
		// Create About Me window completely independently of the normal window system
		const windowContainer = document.getElementById("window-container")!;

		const aboutElement = document.createElement("div");
		// Absolute so it anchors to the inner bordered container
		aboutElement.className =
			"terminal-window about-window transition-all duration-300 ease-in-out";
		aboutElement.id = "about-me-window";

		// Apply consistent positioning and sizing to match ASCII art (relative to container)
		aboutElement.style.position = "absolute";
		aboutElement.style.bottom = "20px";
		aboutElement.style.right = "20px";
		aboutElement.style.width = "calc((100% - 60px) / 2)";
		aboutElement.style.minWidth = "280px";
		aboutElement.style.maxWidth = "600px";
		aboutElement.style.height = "200px";
		aboutElement.style.zIndex = "100"; // High z-index but separate from content windows

		aboutElement.innerHTML = `
      <div class="window-titlebar">
        <div class="window-controls">
          <div class="window-control close" data-action="close"></div>
          <div class="window-control minimize" data-action="minimize"></div>
          <div class="window-control maximize" data-action="maximize"></div>
        </div>
        <div class="window-title">Darroll Saddi - About Me</div>
      </div>
      <div class="window-content content-fade-in">
        ${this.getAboutMeContent()}
      </div>
    `;

		// Add window controls event listeners for About Me
		this.setupAboutMeControls(aboutElement);

		// Add enter animation
		aboutElement.classList.add("window-enter");
		setTimeout(() => aboutElement.classList.remove("window-enter"), 400);

		windowContainer.appendChild(aboutElement);
		this.aboutMeWindow = aboutElement; // Store separately from main windows

		// Update ASCII art now that About Me is visible
		this.updateAsciiWindow();
	}

	private setupAboutMeControls(aboutElement: HTMLElement): void {
		const controls = aboutElement.querySelectorAll(".window-control");

		controls.forEach((control) => {
			control.addEventListener("click", (e) => {
				e.stopPropagation();
				const action = (control as HTMLElement).dataset.action;

				switch (action) {
					case "close":
						this.aboutMeWindow!.style.display = "none";
						this.updateAsciiWindow();
						break;
					case "minimize":
						// For About Me, minimize just hides it
						this.aboutMeWindow!.style.display = "none";
						this.updateAsciiWindow();
						break;
					case "maximize":
						this.maximizeAboutMe();
						break;
				}
			});
		});
	}

	private maximizeAboutMe(): void {
		if (!this.aboutMeWindow) return;

		const isCurrentlyMaximized =
			this.aboutMeWindow.dataset.maximized === "true";

		if (isCurrentlyMaximized) {
			// RESTORE: Return to normal size
			this.aboutMeWindow.style.width = "calc((100% - 60px) / 2)";
			this.aboutMeWindow.style.minWidth = "280px";
			this.aboutMeWindow.style.maxWidth = "600px";
			this.aboutMeWindow.style.height = "200px";
			this.aboutMeWindow.style.bottom = "20px";
			this.aboutMeWindow.style.right = "20px";
			this.aboutMeWindow.dataset.maximized = "false";
		} else {
			// MAXIMIZE: Make larger while keeping same positioning approach as content windows
			const container = document.getElementById("window-container");
			const rect = container
				? container.getBoundingClientRect()
				: ({ width: window.innerWidth, height: window.innerHeight } as DOMRect);
			const baseWidth = 600; // previous max width
			const baseHeight = 200;
			const newWidth = Math.floor(baseWidth * 1.3);
			const newHeight = Math.floor(baseHeight * 1.3);

			// Keep 60px total inner margin (20px on each side plus 20px between boxes)
			const maxWidth = Math.max(0, rect.width - 60);
			const maxHeight = Math.max(0, rect.height - 60);

			const finalWidth = Math.min(newWidth, maxWidth);
			const finalHeight = Math.min(newHeight, maxHeight);

			this.aboutMeWindow.style.width = `${finalWidth}px`;
			this.aboutMeWindow.style.minWidth = "";
			this.aboutMeWindow.style.maxWidth = "";
			this.aboutMeWindow.style.height = `${finalHeight}px`;
			this.aboutMeWindow.style.bottom = "20px";
			this.aboutMeWindow.style.right = "20px";
			this.aboutMeWindow.dataset.maximized = "true";
		}
	}

	private bringAboutMeToFront(): void {
		if (this.aboutMeWindow) {
			this.aboutMeWindow.style.zIndex = "100";
		}
	}

	private getWindowConfig(windowId: string): WindowConfig | null {
		// Check if we're on mobile
		const isMobile = window.innerWidth <= 768;

		// Responsive dimensions
		const standardWidth = isMobile
			? Math.min(window.innerWidth - 20, 500)
			: 650;
		const standardHeight = isMobile
			? Math.min(window.innerHeight - 20, 600)
			: 500;

		const configs: Record<string, WindowConfig> = {
			research: {
				id: "research",
				title: "Research Projects",
				content: this.getResearchContent(),
				width: standardWidth,
				height: standardHeight,
				theme: "default",
			},
			projects: {
				id: "projects",
				title: "Development Projects",
				content: this.getProjectsContent(),
				width: standardWidth,
				height: standardHeight,
				theme: "default",
			},
			experience: {
				id: "experience",
				title: "Work Experience",
				content: this.getExperienceContent(),
				width: standardWidth,
				height: standardHeight,
				theme: "default",
			},
			contact: {
				id: "contact",
				title: "Contact Information",
				content: this.getContactContent(),
				width: standardWidth,
				height: standardHeight,
				theme: "default",
			},
		};

		return configs[windowId] || null;
	}

	private createWindow(config: WindowConfig): void {
		const windowContainer = document.getElementById("window-container")!;
		const isMobile = window.innerWidth <= 768;

		const windowElement = document.createElement("div");

		// Base classes with Tailwind positioning - responsive design for content windows only
		let baseClasses = `terminal-window transition-all duration-300 ease-in-out ${
			config.theme || "default"
		}`;

		if (isMobile) {
			// Mobile content windows - top positioning
			baseClasses +=
				" fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100%-20px)] max-w-[500px] h-[50vh] max-h-[400px]";
		} else {
			// Desktop content windows - center positioning
			baseClasses +=
				" fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
		}

		windowElement.className = baseClasses;
		windowElement.id = `window-${config.id}`;

		// Set responsive dimensions
		if (isMobile) {
			// Mobile dimensions are handled by Tailwind classes above
		} else {
			// Desktop dimensions
			if (config.width) windowElement.style.width = `${config.width}px`;
			if (config.height) windowElement.style.height = `${config.height}px`;

			// Check shared maximization state for all content windows
			if (this.isContentWindowMaximized && !isMobile) {
				// Start maximized
				this.applyMaximizedState(windowElement, config);
				windowElement.dataset.maximized = "true";
			} else {
				// Start normal
				windowElement.dataset.maximized = "false";
			}
		}

		windowElement.style.zIndex = String(this.zIndexCounter++);

		windowElement.innerHTML = `
      <div class="window-titlebar">
        <div class="window-controls">
          <div class="window-control close" data-action="close"></div>
          <div class="window-control minimize" data-action="minimize"></div>
          <div class="window-control maximize" data-action="maximize"></div>
        </div>
        <div class="window-title">${config.title}</div>
      </div>
      <div class="window-content content-fade-in">
        ${config.content}
      </div>
    `;

		// Add window controls event listeners
		this.setupWindowControls(windowElement, config.id);

		// Add enter animation
		windowElement.classList.add("window-enter");
		setTimeout(() => windowElement.classList.remove("window-enter"), 400);

		windowContainer.appendChild(windowElement);
		this.windows.set(config.id, windowElement);

		// Focus the window
		windowElement.addEventListener("mousedown", () => {
			this.bringToFront(config.id);
		});
	}

	private setupWindowControls(
		windowElement: HTMLElement,
		windowId: string
	): void {
		const controls = windowElement.querySelectorAll(".window-control");

		controls.forEach((control) => {
			control.addEventListener("click", (e) => {
				e.stopPropagation();
				const action = (control as HTMLElement).dataset.action;

				switch (action) {
					case "close":
						this.closeWindow(windowId);
						break;
					case "minimize":
						this.minimizeWindow(windowId);
						break;
					case "maximize":
						this.maximizeWindow(windowId);
						break;
				}
			});
		});
	}

	private bringToFront(windowId: string): void {
		const windowElement = this.windows.get(windowId);
		if (windowElement) {
			windowElement.style.zIndex = String(this.zIndexCounter++);
		}
	}

	private closeWindow(windowId: string): void {
		const windowElement = this.windows.get(windowId);
		if (windowElement) {
			windowElement.classList.add("window-exit");
			setTimeout(() => {
				windowElement.remove();
				this.windows.delete(windowId);

				// Update ASCII window when a content window is closed
				if (windowId === this.currentContentWindow) {
					this.currentContentWindow = null;
					this.updateAsciiWindow();
				}
			}, 300);
		}
	}

	private minimizeWindow(windowId: string): void {
		// For this demo, minimize will just close the window
		this.closeWindow(windowId);
	}

	private maximizeWindow(windowId: string): void {
		const windowElement = this.windows.get(windowId);
		const isMobile = window.innerWidth <= 768;

		// Don't maximize on mobile (About Me is separate and not in this system)
		if (windowElement && !isMobile) {
			const isCurrentlyMaximized = windowElement.dataset.maximized === "true";

			if (isCurrentlyMaximized) {
				// RESTORE: Window is currently maximized, restore to normal size
				const originalState = this.originalWindowStates.get(windowId);
				if (originalState) {
					windowElement.style.width = originalState.width;
					windowElement.style.height = originalState.height;
					// Remove maximized z-index boost
					windowElement.classList.remove("z-20");
				}

				// Update window state to non-maximized
				windowElement.dataset.maximized = "false";

				// Update shared state: ALL content windows should now open in normal size
				this.isContentWindowMaximized = false;
			} else {
				// MAXIMIZE: Window is currently normal, maximize it

				// Store current state before maximizing for restoration
				this.originalWindowStates.set(windowId, {
					width: windowElement.style.width,
					height: windowElement.style.height,
					left: windowElement.style.left,
					top: windowElement.style.top,
				});

				// Apply maximized dimensions (Tailwind handles centering)
				this.applyMaximizedState(windowElement);

				// Update window state to maximized
				windowElement.dataset.maximized = "true";

				// Update shared state: ALL content windows should now open maximized
				this.isContentWindowMaximized = true;
			}
		}
	}

	private applyMaximizedState(
		windowElement: HTMLElement,
		config?: WindowConfig
	): void {
		const isMobile = window.innerWidth <= 768;

		if (isMobile) {
			// On mobile, maximization is handled by CSS
			return;
		}

		// Desktop maximization: Just make window larger, Tailwind handles centering
		const standardWidth = config?.width || 650;
		const standardHeight = config?.height || 500;

		const newWidth = Math.floor(standardWidth * 1.3);
		const newHeight = Math.floor(standardHeight * 1.3);

		// Ensure the enlarged window fits within the viewport with some padding
		const maxWidth = window.innerWidth - 80;
		const maxHeight = window.innerHeight - 80;

		const finalWidth = Math.min(newWidth, maxWidth);
		const finalHeight = Math.min(newHeight, maxHeight);

		// Just set dimensions - Tailwind classes handle positioning
		windowElement.style.width = `${finalWidth}px`;
		windowElement.style.height = `${finalHeight}px`;

		// Add z-index boost for maximized windows
		windowElement.classList.add("z-20");
	}

	// ============================
	// CONTENT METHODS
	// ============================

	private getResearchContent(): string {
		return `
      <div class="terminal-text">
        <h1>$ ls research/</h1>
        
        <h2>PPO Gameplaying AI</h2>
        <p>Implemented Proximal Policy Optimization for autonomous game agents. Developed reinforcement learning models that achieve superhuman performance in classic Atari games through policy gradient methods and reward engineering.</p>
        <p><strong>Technologies:</strong> Python, PyTorch, OpenAI Gym, Stable Baselines3</p>
        
        <h2>Video Content Description with LLM</h2>
        <p>Created a multi-modal AI system that generates detailed descriptions of video content using large language models. Combines computer vision and natural language processing for automated video analysis and captioning.</p>
        <p><strong>Technologies:</strong> Python, Transformers, OpenCV, CLIP, GPT-4 API</p>
        
        <h2>Gamification of Education</h2>
        <p>Research into applying game design principles to educational platforms. Studied engagement metrics and learning outcomes when traditional coursework is transformed into interactive, game-like experiences.</p>
        <p><strong>Focus Areas:</strong> UX Design, Educational Psychology, Data Analysis</p>
        
        <h3>Publications & Presentations</h3>
        <ul>
          <li>UC Davis Undergraduate Research Conference 2024</li>
          <li>AI/ML Research Symposium - "Reward Shaping in RL Agents"</li>
          <li>Educational Technology Workshop - "Games as Learning Tools"</li>
        </ul>
      </div>
    `;
	}

	private getProjectsContent(): string {
		return `
      <div class="terminal-text">
        <h1>$ ls projects/</h1>
        
        <h2>clembot</h2>
        <p>Discord bot for UC Davis computer science students with course management, study group coordination, and academic resource sharing. Serves 500+ active users with automated scheduling and notification systems.</p>
        <p><strong>Tech Stack:</strong> Node.js, Discord.js, PostgreSQL, Docker</p>
        
        <h2>gmod_ultrakill_hud</h2>
        <p>Custom HUD modification for Garry's Mod inspired by ULTRAKILL's visual design. Features dynamic health/armor displays, style meter, and weapon switching animations with smooth UI transitions.</p>
        <p><strong>Tech Stack:</strong> Lua, GLua, Source Engine</p>
        
        <h2>GridGame</h2>
        <p>Multiplayer puzzle game built with real-time synchronization. Players collaborate to solve grid-based challenges with physics simulation and networking architecture supporting up to 8 concurrent players.</p>
        <p><strong>Tech Stack:</strong> Java, LibGDX, WebSocket, Maven</p>
        
        <h2>FloodFinder</h2>
        <p>Machine learning application for flood risk prediction using satellite imagery and weather data. Provides early warning system for coastal communities with 85% accuracy in flood detection.</p>
        <p><strong>Tech Stack:</strong> Python, TensorFlow, Satellite APIs, Flask</p>
        
        <h2>softwareInstaller</h2>
        <p>Cross-platform software deployment tool with dependency resolution and rollback capabilities. Automates installation processes across Windows, macOS, and Linux environments.</p>
        <p><strong>Tech Stack:</strong> Rust, Cross-compilation, Package Management</p>
        
        <h2>misc.dev</h2>
        <p>Collection of developer utilities and tools including code formatters, API testing helpers, and development environment setup scripts. Open source toolkit used by 100+ developers.</p>
        <p><strong>Tech Stack:</strong> TypeScript, CLI Tools, GitHub Actions</p>
        
        <p><a href="https://github.com/darrollsaddi" target="_blank">View all projects on GitHub →</a></p>
      </div>
    `;
	}

	private getExperienceContent(): string {
		return `
      <div class="terminal-text">
        <h1>$ cat experience.log</h1>
        
        <h2>CODELAB AI Developer</h2>
        <p><em>Software Engineering Intern | Summer 2024</em></p>
        <ul>
          <li>Developed machine learning pipelines for natural language processing</li>
          <li>Optimized model inference speed by 40% through quantization techniques</li>
          <li>Built RESTful APIs for ML model deployment using FastAPI and Docker</li>
          <li>Collaborated with cross-functional teams on AI product features</li>
        </ul>
        
        <h2>UC Davis Library IT</h2>
        <p><em>Technical Support Specialist | 2023 - Present</em></p>
        <ul>
          <li>Provide technical support for 40,000+ students and faculty</li>
          <li>Maintain and troubleshoot campus network infrastructure</li>
          <li>Develop automation scripts for system maintenance tasks</li>
          <li>Train new staff on help desk procedures and ticketing systems</li>
        </ul>
        
        <h2>Comfort Living</h2>
        <p><em>IT Assistant | 2022 - 2023</em></p>
        <ul>
          <li>Managed database systems for property management operations</li>
          <li>Implemented digital workflows reducing processing time by 30%</li>
          <li>Provided technical support for office software and hardware</li>
          <li>Created documentation for IT procedures and best practices</li>
        </ul>
        
        <h2>Monsters' Shift</h2>
        <p><em>Game Development Intern | Summer 2022</em></p>
        <ul>
          <li>Contributed to indie game development using Unity and C#</li>
          <li>Implemented game mechanics and user interface components</li>
          <li>Participated in agile development cycles and code reviews</li>
          <li>Gained experience in game design and player experience testing</li>
        </ul>
        
        <h2>STEM Club President</h2>
        <p><em>Leadership Role | 2021 - 2022</em></p>
        <ul>
          <li>Led organization of 200+ members focused on STEM education</li>
          <li>Organized hackathons, coding workshops, and tech talks</li>
          <li>Secured sponsorships and partnerships with local tech companies</li>
          <li>Mentored underclassmen in programming and career development</li>
        </ul>
      </div>
    `;
	}

	private getContactContent(): string {
		return `
      <div class="terminal-text">
        <h1>$ contact --info</h1>
        
        <h2>Get in Touch</h2>
        <p>I'm always interested in discussing new opportunities, collaborations, or just chatting about technology and games!</p>
        
        <h3>Professional Channels</h3>
        <p><strong>Email:</strong> <a href="mailto:dsaddi@ucdavis.edu">dsaddi@ucdavis.edu</a></p>
        <p><strong>LinkedIn:</strong> <a href="https://linkedin.com/in/darroll-saddi" target="_blank">linkedin.com/in/darroll-saddi</a></p>
        <p><strong>GitHub:</strong> <a href="https://github.com/darrollsaddi" target="_blank">github.com/darrollsaddi</a></p>
        
        <h3>Gaming & Social</h3>
        <p><strong>Steam:</strong> Iemontine</p>
        <p><strong>Discord:</strong> iemontine</p>
        
        <h3>Portfolio & Resume</h3>
        <p><strong>Website:</strong> <a href="https://darrollsaddi.github.io/portfolio" target="_blank">darrollsaddi.github.io/portfolio</a></p>
        <p><strong>Resume:</strong> <a href="/resume.pdf" target="_blank">Download PDF</a></p>
        
  <div style="margin-top: 20px; padding: 10px; border: 1px solid var(--terminal-teal); border-radius: 4px; background: rgba(79, 174, 155, 0.1);">
          <h3>Looking for opportunities in:</h3>
          <ul>
            <li>Machine Learning Engineering</li>
            <li>Software Development</li>
            <li>AI Research Internships</li>
            <li>Game Development</li>
          </ul>
        </div>
      </div>
    `;
	}

	// ============================
	// ASCII WINDOW SYSTEM
	// ============================

	private createAsciiWindow(): void {
		const asciiWindow = document.createElement("div");
		asciiWindow.className = "ascii-window";
		asciiWindow.id = "ascii-window";

		asciiWindow.innerHTML = `
      <div class="ascii-content ascii-content-enter">
        <pre class="ascii-art"></pre>
      </div>
    `;

		// Anchor inside window-container so padding is relative to inner border
		const container = document.getElementById("window-container");
		if (container) {
			container.appendChild(asciiWindow);
		} else {
			document.body.appendChild(asciiWindow);
		}
		this.asciiWindow = asciiWindow;
		this.updateAsciiWindow();
	}

	private getAsciiArt(windowId: string | null): string {
		return asciiArts[windowId || "research"] || defaultAscii;
	}

	private updateAsciiWindow(): void {
		if (!this.asciiWindow) return;

		// ASCII art should show when:
		// 1. Content windows are open (priority), OR
		// 2. About Me is visible and no content windows are open
		const hasContentWindow = this.currentContentWindow !== null;
		const aboutMeVisible = !!(
			this.aboutMeWindow && this.aboutMeWindow.style.display !== "none"
		);
		const shouldShow =
			(hasContentWindow || aboutMeVisible) && window.innerWidth > 768;

		if (!shouldShow) {
			this.asciiWindow.style.display = "none";
			return;
		}

		this.asciiWindow.style.display = "block";

		// Content windows take priority over About Me for ASCII art
		const activeWindowId = this.currentContentWindow || "about-me";
		const asciiArt = this.getAsciiArt(activeWindowId);

		// Adjust line-height specifically when About Me drives the ASCII preview
		const asciiElement = this.asciiWindow.querySelector(
			".ascii-art"
		) as HTMLElement | null;
		if (asciiElement) {
			asciiElement.style.lineHeight =
				activeWindowId === "about-me" ? "1.0" : "";
		}

		// On resize, currentDisplayedText may already equal target; typeAsciiArt handles no-op
		this.typeAsciiArt(asciiArt);
	}

	private calculateOptimalFontSize(asciiContent: string): number {
		if (!this.asciiWindow) return 10;
		const rect = this.asciiWindow.getBoundingClientRect();
		const containerWidth = Math.max(0, rect.width - 32);
		const containerHeight = Math.max(0, rect.height - 32);

		// Parse ASCII content to get dimensions
		const lines = asciiContent.trim().split("\n");
		const maxLineLength = Math.max(...lines.map((line) => line.length));
		const lineCount = lines.length;

		// Calculate font size based on container constraints
		// Character width ratio is approximately 0.6 for monospace fonts
		// Line height ratio is approximately 1.2 for readable spacing
		const fontSizeByWidth = Math.floor(containerWidth / (maxLineLength * 0.6));
		const fontSizeByHeight = Math.floor(containerHeight / (lineCount * 1.2));

		// Use the smaller constraint to ensure everything fits
		const calculatedSize = Math.min(fontSizeByWidth, fontSizeByHeight);

		// Clamp between reasonable bounds (4px minimum, 14px maximum)
		return Math.max(4, Math.min(14, calculatedSize));
	}

	private typeAsciiArt(text: string): void {
		if (!this.asciiWindow) return;

		const asciiElement = this.asciiWindow.querySelector(
			".ascii-art"
		) as HTMLElement;
		if (!asciiElement) return;

		// IMMEDIATE INTERRUPTION: Stop any running animations
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}

		this.targetText = text;
		this.currentDisplayedText = asciiElement.textContent || "";

		// If target is same as current, do nothing
		if (this.currentDisplayedText.trim() === this.targetText.trim()) {
			return;
		}

		// OPTIMIZED: Find common prefix to avoid unnecessary deletion/retyping
		const commonPrefixLength = this.findCommonPrefix(
			this.currentDisplayedText,
			this.targetText
		);

		if (commonPrefixLength > 0) {
			// Keep the common part, only delete/retype the different part
			const currentSuffix =
				this.currentDisplayedText.substring(commonPrefixLength);

			if (currentSuffix.length > 0) {
				// Need to delete the different suffix first
				this.startOptimizedDeletionFrom(commonPrefixLength);
			} else {
				// No deletion needed, just add the new suffix
				this.currentDisplayedText = this.currentDisplayedText.substring(
					0,
					commonPrefixLength
				);
				this.startOptimizedTypingFrom(commonPrefixLength);
			}
		} else {
			// No common prefix, use original logic
			if (this.currentDisplayedText.length > 0) {
				this.startOptimizedDeletion();
			} else {
				this.startOptimizedTyping();
			}
		}
	}

	private findCommonPrefix(str1: string, str2: string): number {
		let i = 0;
		const minLength = Math.min(str1.length, str2.length);

		while (i < minLength && str1[i] === str2[i]) {
			i++;
		}

		return i;
	}

	private startOptimizedDeletionFrom(keepLength: number): void {
		if (!this.asciiWindow) return;

		const asciiElement = this.asciiWindow.querySelector(
			".ascii-art"
		) as HTMLElement;
		if (!asciiElement) return;

		this.lastAnimationTime = performance.now();

		const totalLength = this.currentDisplayedText.length;
		const deleteLength = totalLength - keepLength;

		if (deleteLength <= 0) {
			// Nothing to delete, start typing
			this.startOptimizedTypingFrom(keepLength);
			return;
		}

		const totalDuration = Math.min(300, deleteLength * 5); // Faster for smaller deletions
		let currentLength = totalLength;

		const deleteFrame = (currentTime: number) => {
			const elapsed = currentTime - this.lastAnimationTime;
			const progress = Math.min(elapsed / totalDuration, 1);

			if (progress >= 1) {
				// Deletion complete
				this.currentDisplayedText = this.currentDisplayedText.substring(
					0,
					keepLength
				);
				asciiElement.textContent = this.currentDisplayedText;
				this.startOptimizedTypingFrom(keepLength);
				return;
			}

			// Delete characters progressively
			const targetLength = totalLength - Math.floor(progress * deleteLength);
			if (targetLength !== currentLength) {
				currentLength = targetLength;
				this.currentDisplayedText = this.currentDisplayedText.substring(
					0,
					currentLength
				);
				asciiElement.textContent = this.currentDisplayedText;
			}

			this.animationFrameId = requestAnimationFrame(deleteFrame);
		};

		this.animationFrameId = requestAnimationFrame(deleteFrame);
	}

	private startOptimizedTypingFrom(startIndex: number): void {
		if (!this.asciiWindow) return;

		const asciiElement = this.asciiWindow.querySelector(
			".ascii-art"
		) as HTMLElement;
		if (!asciiElement) return;

		// Apply optimal font size right as typing begins to avoid flash
		const optimalFontSize = this.calculateOptimalFontSize(this.targetText);
		asciiElement.style.fontSize = `${optimalFontSize}px`;

		this.lastAnimationTime = performance.now();

		const remainingText = this.targetText.substring(startIndex);
		const totalDuration = Math.min(1000, remainingText.length * 15); // Adaptive speed
		let currentIndex = startIndex;

		const typeFrame = (currentTime: number) => {
			const elapsed = currentTime - this.lastAnimationTime;
			const progress = Math.min(elapsed / totalDuration, 1);

			if (progress >= 1) {
				// Typing complete
				this.currentDisplayedText = this.targetText;
				asciiElement.textContent = this.targetText;
				return;
			}

			// Add characters progressively
			const targetIndex =
				startIndex + Math.floor(progress * remainingText.length);
			if (targetIndex !== currentIndex) {
				currentIndex = targetIndex;
				this.currentDisplayedText = this.targetText.substring(0, currentIndex);
				asciiElement.textContent = this.currentDisplayedText;
			}

			this.animationFrameId = requestAnimationFrame(typeFrame);
		};

		this.animationFrameId = requestAnimationFrame(typeFrame);
	}

	private startOptimizedDeletion(): void {
		if (!this.asciiWindow) return;

		const asciiElement = this.asciiWindow.querySelector(
			".ascii-art"
		) as HTMLElement;
		if (!asciiElement) return;

		this.lastAnimationTime = performance.now();

		// Optimized deletion: fewer, larger chunks for better performance
		const totalDuration = 300; // Slightly faster
		const textLength = this.currentDisplayedText.length;
		let currentLength = textLength;

		const deleteFrame = (currentTime: number) => {
			const elapsed = currentTime - this.lastAnimationTime;
			const progress = Math.min(elapsed / totalDuration, 1);

			if (progress >= 1) {
				// Deletion complete
				this.currentDisplayedText = "";
				asciiElement.textContent = "";
				this.startOptimizedTyping();
				return;
			}

			// Calculate how much text to show based on progress (reverse progress for deletion)
			const targetLength = Math.floor(textLength * (1 - progress));
			if (targetLength !== currentLength) {
				currentLength = targetLength;
				this.currentDisplayedText = this.currentDisplayedText.substring(
					0,
					currentLength
				);
				asciiElement.textContent = this.currentDisplayedText;
			}

			this.animationFrameId = requestAnimationFrame(deleteFrame);
		};

		this.animationFrameId = requestAnimationFrame(deleteFrame);
	}

	private startOptimizedTyping(): void {
		// Delegate to the new optimized method starting from beginning
		this.startOptimizedTypingFrom(0);
	}
}

// ============================
// APPLICATION INITIALIZATION
// ============================

document.addEventListener("DOMContentLoaded", () => {
	const manager = new WindowManager();
	(window as any).windowManager = manager;

	// Add some terminal-style loading text
	if (import.meta && (import.meta as any).env && (import.meta as any).env.DEV) {
		console.log(
			"%c[TERMINAL] Portfolio Initialized",
			"color: #FFA500; font-family: monospace;"
		);
	}
});

// Add keyboard shortcuts
document.addEventListener("keydown", (e) => {
	// Alt + number keys to open windows quickly
	if (e.altKey && !e.ctrlKey && !e.shiftKey) {
		switch (e.key) {
			case "1":
				e.preventDefault();
				const windowManager = (window as any).windowManager;
				if (windowManager) windowManager.openWindow("research");
				break;
			// Reserved keys can be added later
		}
	}
});

// Expose instance via window.windowManager (set on DOMContentLoaded)
