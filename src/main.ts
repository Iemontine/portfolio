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

	// ASCII typing state using fixed-step animations
	private targetText: string = "";
	private animationFrameId: number | null = null;
	private typingMode: "idle" | "deleting" | "typing" = "idle";
	private stepIndex: number = 0;
	private totalSteps: number = 0;
	private startText: string = "";
	private readonly deleteSteps: number = 100; // fewer steps -> quicker
	private readonly typeSteps: number = 128; // complete in ~24 frames
	private pendingFontSize: number | null = null;

	// Window state management for maximize/restore
	private originalWindowStates: Map<
		string,
		{ width: string; height: string; left: string; top: string }
	> = new Map();

	// Persistent maximization state - shared state for all content windows (not About Me)
	private isContentWindowMaximized: boolean = false;

	// Separate About Me window storage - completely independent from content windows
	private aboutMeWindow: HTMLElement | null = null;

	// Cached character width per 1px of font size (1ch per px)
	private charWidthPerPx: number | null = null;

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
				// Skip if we're still hidden for first-show sizing
				if ((this.asciiWindow as HTMLElement).style.visibility === "hidden") return;
				const asciiElement = this.asciiWindow.querySelector(
					".ascii-art"
				) as HTMLElement;
				if (asciiElement) {
					// Skip sizing if there is no content yet
					if (!(asciiElement.textContent || "").trim()) return;
					const aboutVisible = !!(this.aboutMeWindow && this.aboutMeWindow.style.display !== "none");
					const activeId = this.currentContentWindow || (aboutVisible ? "about-me" : null);
					const size = this.calculateOptimalFontSize(
						this.targetText || asciiElement.textContent || "",
						activeId === "about-me" ? 64 : 14
					);
					if (size > 0) {
						if (this.typingMode === "idle") {
							asciiElement.style.fontSize = `${size}px`;
							this.pendingFontSize = null;
						} else {
							this.pendingFontSize = size;
						}
					}
				}
			}
		});

		// Keep ASCII responsive to container mutations and zoom using ResizeObserver
		const setupAsciiObserver = () => {
			if (!this.asciiWindow) return;
			const asciiElement = this.asciiWindow.querySelector(".ascii-art") as HTMLElement | null;
			if (!asciiElement) return;
			const ro = new ResizeObserver(() => {
				// Skip if we're still hidden for first-show sizing
				if ((this.asciiWindow as HTMLElement).style.visibility === "hidden") return;
				// Skip if no text yet to avoid initial oversized sizing
				if (!(asciiElement.textContent || "").trim()) return;
				const aboutVisible = !!(this.aboutMeWindow && this.aboutMeWindow.style.display !== "none");
				const activeId = this.currentContentWindow || (aboutVisible ? "about-me" : null);
				const size = this.calculateOptimalFontSize(
					this.targetText || asciiElement.textContent || "",
					activeId === "about-me" ? 64 : 14
				);
				if (size > 0) {
					if (this.typingMode === "idle") {
						asciiElement.style.fontSize = `${size}px`;
						this.pendingFontSize = null;
					} else {
						this.pendingFontSize = size;
					}
				}
			});
			ro.observe(this.asciiWindow);
		};

		// Defer to ensure asciiWindow exists in DOM
		setTimeout(setupAsciiObserver, 0);
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

		// If About Me exists on desktop, recompute its layout based on state
		if (!isMobile && this.aboutMeWindow) {
			if (this.aboutMeWindow.dataset.maximized === "true") {
				this.layoutAboutMeMaximized();
			} else {
				this.layoutAboutMeDefault();
			}
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
				this.animateAboutShow(this.aboutMeWindow);
				this.bringAboutMeToFront();
				// Update ASCII immediately when showing
				this.updateAsciiWindow();
			} else {
				// Hide with exit animation; ASCII updates after animation end
				this.animateAboutHide(this.aboutMeWindow);
			}
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
		// Size will be computed responsively below
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

		windowContainer.appendChild(aboutElement);
		this.aboutMeWindow = aboutElement; // Store separately from main windows

		// Apply a larger, responsive default layout on creation
		this.layoutAboutMeDefault();

		// Play enter animation and update ASCII
		this.animateAboutShow(aboutElement);
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
						this.animateAboutHide(this.aboutMeWindow!);
						break;
					case "minimize":
						// For About Me, minimize hides with animation
						this.animateAboutHide(this.aboutMeWindow!);
						break;
					case "maximize":
						this.maximizeAboutMe();
						break;
				}
			});
		});
	}

	private animateAboutShow(el: HTMLElement): void {
		el.style.display = "block";
		el.classList.remove("about-exit");
		el.classList.add("about-enter");
		const onEnd = () => {
			el.classList.remove("about-enter");
			el.removeEventListener("animationend", onEnd);
		};
		el.addEventListener("animationend", onEnd);
	}

	private animateAboutHide(el: HTMLElement, after?: () => void): void {
		if (el.style.display === "none") {
			if (after) after();
			this.updateAsciiWindow();
			return;
		}
		el.classList.remove("about-enter");
		el.classList.add("about-exit");
		const onEnd = () => {
			el.classList.remove("about-exit");
			el.style.display = "none";
			el.removeEventListener("animationend", onEnd);
			if (after) after();
			this.updateAsciiWindow();
		};
		el.addEventListener("animationend", onEnd);
	}

	private maximizeAboutMe(): void {
		if (!this.aboutMeWindow) return;

		const isCurrentlyMaximized =
			this.aboutMeWindow.dataset.maximized === "true";

		const el = this.aboutMeWindow;
		const first = el.getBoundingClientRect();
		const prevTransition = el.style.transition;
		const prevTransform = el.style.transform;
		const prevOrigin = el.style.transformOrigin;

		// Disable transitions while we set the target geometry
		el.style.transition = "none";
		el.style.transform = "none";
		el.style.transformOrigin = "bottom right";

		if (isCurrentlyMaximized) {
			// Apply restored responsive layout instantly
			this.layoutAboutMeDefault();
			el.dataset.maximized = "false";
		} else {
			// Apply maximized layout instantly (within right pane)
			this.layoutAboutMeMaximized();
			el.dataset.maximized = "true";
			this.bringAboutMeToFront();
		}

		// Measure the final geometry
		const last = el.getBoundingClientRect();

		// Compute FLIP deltas relative to bottom-right origin
		const scaleX = first.width ? first.width / last.width : 1;
		const scaleY = first.height ? first.height / last.height : 1;
		const translateX = (first.right - last.right) / 1; // px
		const translateY = (first.bottom - last.bottom) / 1; // px

		// Invert: start from old layout visually
		el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

		// Force reflow to apply the initial transform before animating
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		el.offsetWidth;

		// Animate to identity
		el.style.transition = "transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)";
		el.style.transform = prevTransform || "none";

		const onTransitionEnd = () => {
			el.style.transition = prevTransition;
			el.style.transformOrigin = prevOrigin;
			el.removeEventListener("transitionend", onTransitionEnd);
		};
		el.addEventListener("transitionend", onTransitionEnd);
	}

	// Compute a maximized layout constrained to the right half of the inner container
	private layoutAboutMeMaximized(): void {
		if (!this.aboutMeWindow) return;
		const container = document.getElementById("window-container");
		const rect = container
			? container.getBoundingClientRect()
			: ({ width: window.innerWidth, height: window.innerHeight } as DOMRect);

		// Two-pane layout: width is half of inner area minus the 20px center gap and 20px side paddings (total 60px)
		const paneWidth = Math.floor(Math.max(0, rect.width - 60) / 2);
		// Height target: up to 60% of inner height, clamped to remain within margins and a sensible minimum
		const maxInnerHeight = Math.max(0, rect.height - 60);
		let targetHeight = Math.floor(rect.height * 0.6);
		targetHeight = Math.min(targetHeight, maxInnerHeight);
		targetHeight = Math.max(targetHeight, 260); // at least a bit larger than default 200px

		this.aboutMeWindow.style.width = `${paneWidth}px`;
		this.aboutMeWindow.style.minWidth = "";
		this.aboutMeWindow.style.maxWidth = "";
		this.aboutMeWindow.style.height = `${targetHeight}px`;
		this.aboutMeWindow.style.bottom = "20px";
		this.aboutMeWindow.style.right = "20px";
	}

	// Compute a larger default layout for About Me within the right pane
	private layoutAboutMeDefault(): void {
		if (!this.aboutMeWindow) return;
		const container = document.getElementById("window-container");
		const rect = container
			? container.getBoundingClientRect()
			: ({ width: window.innerWidth, height: window.innerHeight } as DOMRect);

		// Match right pane width; height ~45% of inner height, with sensible clamps
		const paneWidth = Math.floor(Math.max(0, rect.width - 60) / 2);
		const maxInnerHeight = Math.max(0, rect.height - 60);
		let targetHeight = Math.floor(rect.height * 0.45);
		targetHeight = Math.min(targetHeight, maxInnerHeight);
		targetHeight = Math.max(targetHeight, 320); // Larger than old 200px default

		this.aboutMeWindow.style.width = `${paneWidth}px`;
		this.aboutMeWindow.style.minWidth = "280px";
		this.aboutMeWindow.style.maxWidth = ""; // remove cap
		this.aboutMeWindow.style.height = `${targetHeight}px`;
		this.aboutMeWindow.style.bottom = "20px";
		this.aboutMeWindow.style.right = "20px";
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
			// Stop typing when hidden
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId);
				this.animationFrameId = null;
			}
			this.typingMode = "idle";
			return;
		}

	// Ensure visible and shown
	this.asciiWindow.style.display = "block";
	(this.asciiWindow as HTMLElement).style.visibility = "visible";

		// Content windows take priority over About Me for ASCII art
		const activeWindowId = this.currentContentWindow || "about-me";
		const asciiArt = this.getAsciiArt(activeWindowId);

		// Apply tighter line-height ONLY for About-driven ASCII via CSS var first
		const asciiRoot = this.asciiWindow as HTMLElement;
		if (activeWindowId === "about-me") {
			asciiRoot.style.setProperty("--ascii-line-height", "1.05");
		} else {
			asciiRoot.style.removeProperty("--ascii-line-height");
		}

		// Size from full art, then run a fixed-steps transition
		const asciiElement = this.asciiWindow.querySelector(".ascii-art") as HTMLElement | null;
		if (asciiElement) {
			const cap = activeWindowId === "about-me" ? 64 : 14;
			const size = this.calculateOptimalFontSize(asciiArt, cap);
			if (size > 0) {
				const current = asciiElement.textContent || "";
				// On first show (no content yet), apply immediately to avoid giant initial text
				if (!current.length) {
					asciiElement.style.fontSize = `${size}px`;
					this.pendingFontSize = null;
				} else if (this.typingMode === "idle" && current === asciiArt) {
					// If already showing the same art, apply immediately
					asciiElement.style.fontSize = `${size}px`;
					this.pendingFontSize = null;
				} else {
					// Defer until transition completes
					this.pendingFontSize = size;
				}
			}

			this.startTransition(asciiArt, asciiElement);
		}
	}

	private startTransition(nextText: string, asciiElement: HTMLElement): void {
		const current = asciiElement.textContent || "";
		// If nothing changed, keep whatever is on screen
		if (current === nextText) {
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId);
				this.animationFrameId = null;
			}
			this.typingMode = "idle";
			this.targetText = nextText;
			// Apply any deferred font-size change immediately
			if (this.pendingFontSize !== null) {
				asciiElement.style.fontSize = `${this.pendingFontSize}px`;
				this.pendingFontSize = null;
			}
			return;
		}

		// Prepare phases with common-prefix optimization
		this.targetText = nextText;
		const prefixLen = this.findCommonPrefix(current, nextText);
		const deleteLen = Math.max(0, current.length - prefixLen);
		const typeLen = Math.max(0, nextText.length - prefixLen);

		const runTyping = () => {
			this.typingMode = "typing";
			this.stepIndex = 0;
			this.totalSteps = this.typeSteps;
			// Type speed relative to the full next art length
			const typeChunk = Math.max(1, Math.ceil(nextText.length / Math.max(1, this.totalSteps)));
			const typeStep = () => {
				// If target changed mid-flight, restart
				if (this.typingMode !== "typing") return;
				const typed = Math.min(typeLen, this.stepIndex * typeChunk);
				const nextShown = this.targetText.substring(0, prefixLen + typed);
				if ((asciiElement.textContent || "") !== nextShown) {
					asciiElement.textContent = nextShown;
				}
				this.stepIndex++;
				if (this.stepIndex > this.totalSteps || typed >= typeLen) {
					asciiElement.textContent = this.targetText;
					this.typingMode = "idle";
					this.animationFrameId = null;
					// Apply any pending font-size after transition completes
					if (this.pendingFontSize !== null) {
						asciiElement.style.fontSize = `${this.pendingFontSize}px`;
						this.pendingFontSize = null;
					}
					return;
				}
				this.animationFrameId = requestAnimationFrame(typeStep);
			};
			this.animationFrameId = requestAnimationFrame(typeStep);
		};

		if (deleteLen > 0) {
			// Delete only the differing suffix, then type the remaining suffix
			this.typingMode = "deleting";
			this.startText = current;
			this.stepIndex = 0;
			this.totalSteps = this.deleteSteps;
			// Delete speed relative to the full current art length
			const deleteChunk = Math.max(1, Math.ceil(current.length / Math.max(1, this.totalSteps)));
			const deleteStep = () => {
				if (this.typingMode !== "deleting") return;
				const toKeepCount = Math.max(prefixLen, current.length - this.stepIndex * deleteChunk);
				const toKeep = toKeepCount;
				const shown = this.startText.substring(0, toKeep);
				if ((asciiElement.textContent || "") !== shown) {
					asciiElement.textContent = shown;
				}
				this.stepIndex++;
				if (this.stepIndex > this.totalSteps || toKeepCount <= prefixLen) {
					// Deletion finished. Apply any pending font-size right before typing new art
					if (this.pendingFontSize !== null) {
						asciiElement.style.fontSize = `${this.pendingFontSize}px`;
						this.pendingFontSize = null;
					}
					asciiElement.textContent = this.startText.substring(0, prefixLen);
					// proceed to typing
					runTyping();
					return;
				}
				this.animationFrameId = requestAnimationFrame(deleteStep);
			};
			this.animationFrameId = requestAnimationFrame(deleteStep);
		} else {
			// No deletion needed: apply font-size immediately if pending, then type
			if (this.pendingFontSize !== null) {
				asciiElement.style.fontSize = `${this.pendingFontSize}px`;
				this.pendingFontSize = null;
			}
			// Continue typing the remainder
			runTyping();
		}
	}

	private findCommonPrefix(a: string, b: string): number {
		const n = Math.min(a.length, b.length);
		let i = 0;
		while (i < n && a[i] === b[i]) i++;
		return i;
	}

	private calculateOptimalFontSize(asciiContent: string, maxPx: number = 14): number {
	if (!this.asciiWindow) return 10;
	// Prefer the content container to account for padding
	const contentEl = this.asciiWindow.querySelector('.ascii-content') as HTMLElement | null;
	const measureEl = contentEl || this.asciiWindow;
	const cs = getComputedStyle(measureEl);
	const padL = parseFloat(cs.paddingLeft || '0');
	const padR = parseFloat(cs.paddingRight || '0');
	const padT = parseFloat(cs.paddingTop || '0');
	const padB = parseFloat(cs.paddingBottom || '0');
	const innerW = Math.max(0, measureEl.clientWidth - padL - padR);
	const innerH = Math.max(0, measureEl.clientHeight - padT - padB);

		// Parse ASCII content to get dimensions
		const lines = asciiContent.trimEnd().split("\n");
		const maxLineLength = lines.reduce((m, l) => Math.max(m, l.length), 0);
		const lineCount = lines.length;

		// Calculate font size based on container constraints
		// Character width ratio measured via probe for current font (fallback 0.6)
		const chPerPx = this.measureCharWidthPerPx(measureEl);
		// Line height ratio derives from CSS var; default ~1.1 but About uses 1.05
		const lhVar = getComputedStyle(this.asciiWindow).getPropertyValue("--ascii-line-height").trim();
		// Default matches CSS fallback in .ascii-art (0.7)
		const lineHeightRatio = lhVar ? parseFloat(lhVar) : 0.7;
		// Subtract a small epsilon to ensure we never overflow width
		const epsilonW = 0.5;
		const epsilonH = 0.5;
		const fontSizeByWidth = Math.floor((innerW - epsilonW) / Math.max(1, maxLineLength * chPerPx));
		const fontSizeByHeight = Math.floor((innerH - epsilonH) / Math.max(1, lineCount * lineHeightRatio));

		// Use the smaller constraint to ensure everything fits
		const calculatedSize = Math.min(fontSizeByWidth, fontSizeByHeight);

		// Clamp between reasonable bounds (4px minimum, configurable maximum)
		return Math.max(4, Math.min(maxPx, calculatedSize));
	}

	private measureCharWidthPerPx(container: HTMLElement): number {
		if (this.charWidthPerPx && this.charWidthPerPx > 0) return this.charWidthPerPx;
		const probe = document.createElement('div');
		probe.style.position = 'absolute';
		probe.style.visibility = 'hidden';
		probe.style.whiteSpace = 'nowrap';
		probe.style.left = '-9999px';
		probe.style.top = '0';
		probe.style.fontFamily = 'MS UI Gothic, monospace';
		probe.style.fontSize = '100px';
		probe.style.lineHeight = '100px';
		probe.style.width = '1ch';
		probe.textContent = '0';
		container.appendChild(probe);
		const widthPx = probe.getBoundingClientRect().width || 60;
		probe.remove();
		const ratio = widthPx / 100; // px per 1px of font-size
		this.charWidthPerPx = ratio > 0 ? ratio : 0.6;
		return this.charWidthPerPx;
	}

	// All typing/animation logic removed for simplicity. ASCII renders instantly.
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
