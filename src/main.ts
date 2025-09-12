import './style.css';
import { asciiArts, defaultAscii } from './ascii-art';

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
  theme?: 'default' | 'portal-blue' | 'portal-orange';
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
  private zIndexCounter: number = 100;
  private currentContentWindow: string | null = null;
  private asciiWindow: HTMLElement | null = null;
  private typingAnimation: number | null = null;
  
  // Advanced ASCII animation state management
  private currentDisplayedText: string = '';
  private targetText: string = '';
  private targetWindowId: string | null = null;
  private animationState: 'idle' | 'typing' | 'deleting' = 'idle';
  private currentProgress: number = 0; // 0-1, percentage of current animation complete
  private pendingTarget: string | null = null; // For handling rapid clicks
  private animationFrameId: number | null = null; // For RAF-based animations
  private lastAnimationTime: number = 0; // For frame rate limiting
  
  // Window state management for maximize/restore
  private originalWindowStates: Map<string, {width: string, height: string, left: string, top: string}> = new Map();
  
  // Persistent maximization state - shared state for all content windows (not About Me)
  private isContentWindowMaximized: boolean = false;

  constructor() {
    this.initializeDesktop();
    this.createTopRightBoxes();
    this.createAboutMeWindow();
    this.createAsciiWindow();
  }

  private initializeDesktop(): void {
    const desktop = document.getElementById('desktop')!;
    desktop.style.width = 'calc(100% - 80px)';
    desktop.style.height = 'calc(100% - 80px)';
    desktop.style.position = 'absolute';
    desktop.style.top = '40px';
    desktop.style.left = '40px';
    desktop.style.zIndex = '2';
    desktop.style.padding = '20px';
    desktop.style.display = 'grid';
    desktop.style.gridTemplateColumns = 'repeat(auto-fit, 80px)';
    desktop.style.gridTemplateRows = 'repeat(auto-fit, 100px)';
    desktop.style.gap = '20px';
    desktop.style.alignContent = 'start';
    desktop.style.justifyContent = 'start';
    
    const icons: DesktopIcon[] = [
      { id: 'research-icon', label: 'Research', windowId: 'research' },
      { id: 'projects-icon', label: 'Projects', windowId: 'projects' },
      { id: 'experience-icon', label: 'Experience', windowId: 'experience' },
      { id: 'contact-icon', label: 'Contact', windowId: 'contact' }
    ];

    icons.forEach(icon => {
      const iconElement = this.createDesktopIcon(icon);
      desktop.appendChild(iconElement);
    });

    // Create About Me icon positioned behind the About Me window
    this.createAboutMeIcon();
  }

  private createDesktopIcon(icon: DesktopIcon): HTMLElement {
    const iconElement = document.createElement('div');
    iconElement.className = 'desktop-icon';
    iconElement.setAttribute('data-window', icon.windowId);
    
    iconElement.innerHTML = `
      <div class="icon"></div>
      <div class="label">${icon.label}</div>
    `;

    iconElement.addEventListener('click', () => {
      this.openWindow(icon.windowId);
    });

    return iconElement;
  }

  private createTopRightBoxes(): void {
    const container = document.getElementById('top-right-container')!;
    container.className = 'top-right-container';
    
    // Box 1: Data Matrix
    const dataBox = document.createElement('div');
    dataBox.className = 'info-box data-matrix';
    dataBox.innerHTML = this.generateMatrixData();
    container.appendChild(dataBox);
    
    // Box 2: Stats
    const statsBox = document.createElement('div');
    statsBox.className = 'info-box stats';
    statsBox.innerHTML = `
      <div>2.67</div>
      <div>1002</div>
      <div>45.6</div>
    `;
    container.appendChild(statsBox);
    
    // Box 3: Rotating Logo
    const logoBox = document.createElement('div');
    logoBox.className = 'info-box logo';
    logoBox.innerHTML = '<div class="rotating-logo"></div>';
    container.appendChild(logoBox);
    
    // Animate matrix data
    setInterval(() => {
      dataBox.innerHTML = this.generateMatrixData();
    }, 2000);
  }

  private generateMatrixData(): string {
    const chars = '01';
    const rows = 8;
    const cols = 12;
    let result = '';
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      if (i < rows - 1) result += '<br>';
    }
    
    return result;
  }

  private createAboutMeIcon(): void {
    const aboutIcon = document.createElement('div');
    aboutIcon.className = 'desktop-icon about-me-icon';
    aboutIcon.setAttribute('data-window', 'about-me');
    
    aboutIcon.innerHTML = `
      <div class="icon"></div>
      <div class="label">About Me</div>
    `;

    aboutIcon.addEventListener('click', () => {
      this.openWindow('about-me');
    });

    // Position it behind the About Me window
    aboutIcon.style.position = 'absolute';
    aboutIcon.style.bottom = '0px';
    aboutIcon.style.right = '0px';
    aboutIcon.style.zIndex = '1'; // Low z-index within desktop context

    const desktop = document.getElementById('desktop')!;
    desktop.appendChild(aboutIcon);
  }

  private createAboutMeWindow(): void {
    const aboutConfig: WindowConfig = {
      id: 'about-me',
      title: 'Darroll Saddi - About Me',
      content: this.getAboutMeContent(),
      width: 380,
      height: 280,
      theme: 'portal-blue',
      isFixed: true
    };

    this.createWindow(aboutConfig);
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
    // Close all non-fixed windows first
    this.closeNonFixedWindows();

    // If the same window is already open, just bring it to front
    if (this.windows.has(windowId)) {
      this.bringToFront(windowId);
      return;
    }

    const config = this.getWindowConfig(windowId);
    if (config) {
      this.createWindow(config);
      
      // Update current content window for ASCII display
      if (!config.isFixed) {
        this.currentContentWindow = windowId;
        this.updateAsciiWindow();
      }
    }
  }

  private closeNonFixedWindows(): void {
    // Close all windows except fixed ones (like About Me)
    this.windows.forEach((windowElement, windowId) => {
      if (!windowElement.classList.contains('about-window')) {
        this.closeWindow(windowId);
      }
    });
    
    // Update ASCII window when content windows are closed
    this.currentContentWindow = null;
    this.updateAsciiWindow();
  }

  private getWindowConfig(windowId: string): WindowConfig | null {
    // Standardized dimensions for all content windows
    const standardWidth = 650;
    const standardHeight = 500;
    
    const configs: Record<string, WindowConfig> = {
      research: {
        id: 'research',
        title: 'Research Projects',
        content: this.getResearchContent(),
        width: standardWidth,
        height: standardHeight,
        theme: 'portal-orange'
      },
      projects: {
        id: 'projects',
        title: 'Development Projects',
        content: this.getProjectsContent(),
        width: standardWidth,
        height: standardHeight,
        theme: 'default'
      },
      experience: {
        id: 'experience',
        title: 'Work Experience',
        content: this.getExperienceContent(),
        width: standardWidth,
        height: standardHeight,
        theme: 'portal-blue'
      },
      contact: {
        id: 'contact',
        title: 'Contact Information',
        content: this.getContactContent(),
        width: standardWidth,
        height: standardHeight,
        theme: 'portal-orange'
      },
      'about-me': {
        id: 'about-me',
        title: 'Darroll Saddi - About Me',
        content: this.getAboutMeContent(),
        width: 380,
        height: 280,
        theme: 'portal-blue',
        isFixed: true
      }
    };

    return configs[windowId] || null;
  }

  private createWindow(config: WindowConfig): void {
    const windowContainer = document.getElementById('window-container')!;
    
    const windowElement = document.createElement('div');
    windowElement.className = `terminal-window ${config.theme || 'default'}`;
    windowElement.id = `window-${config.id}`;
    
    if (config.isFixed) {
      windowElement.classList.add('about-window');
    }

    // Set dimensions and position
    if (config.width) windowElement.style.width = `${config.width}px`;
    if (config.height) windowElement.style.height = `${config.height}px`;
    
    if (!config.isFixed) {
      // Check shared maximization state for all content windows
      if (this.isContentWindowMaximized) {
        // Content windows should start maximized
        console.log(`[WINDOW] ${config.id} opening in maximized state (shared state = true)`);
        this.applyMaximizedState(windowElement, config);
        windowElement.dataset.maximized = 'true';
      } else {
        // Content windows should start in normal size
        console.log(`[WINDOW] ${config.id} opening in normal state (shared state = false)`);
        const windowWidth = config.width || 400;
        const windowHeight = config.height || 300;
        const x = (window.innerWidth - windowWidth) / 2;
        const y = (window.innerHeight - windowHeight) / 2;
        
        windowElement.style.left = `${Math.max(20, x)}px`;
        windowElement.style.top = `${Math.max(20, y)}px`;
        windowElement.dataset.maximized = 'false';
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
      <div class="window-content">
        ${config.content}
      </div>
    `;

    // Add window controls event listeners
    this.setupWindowControls(windowElement, config.id);

    // Add enter animation
    windowElement.classList.add('window-enter');
    setTimeout(() => windowElement.classList.remove('window-enter'), 400);

    windowContainer.appendChild(windowElement);
    this.windows.set(config.id, windowElement);

    // Focus the window
    windowElement.addEventListener('mousedown', () => {
      this.bringToFront(config.id);
    });
  }

  private setupWindowControls(windowElement: HTMLElement, windowId: string): void {
    const controls = windowElement.querySelectorAll('.window-control');
    
    controls.forEach(control => {
      control.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = (control as HTMLElement).dataset.action;
        
        switch (action) {
          case 'close':
            this.closeWindow(windowId);
            break;
          case 'minimize':
            this.minimizeWindow(windowId);
            break;
          case 'maximize':
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
      windowElement.classList.add('window-exit');
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
    if (windowElement && !windowElement.classList.contains('about-window')) {
      const isCurrentlyMaximized = windowElement.dataset.maximized === 'true';
      
      if (isCurrentlyMaximized) {
        // RESTORE: Window is currently maximized, restore to normal size
        const originalState = this.originalWindowStates.get(windowId);
        if (originalState) {
          windowElement.style.width = originalState.width;
          windowElement.style.height = originalState.height;
          windowElement.style.left = originalState.left;
          windowElement.style.top = originalState.top;
        }
        
        // Update window state to non-maximized
        windowElement.dataset.maximized = 'false';
        
        // Update shared state: ALL content windows should now open in normal size
        this.isContentWindowMaximized = false;
        
        console.log(`[WINDOW] ${windowId} restored to normal size. Shared state: maximized = false`);
      } else {
        // MAXIMIZE: Window is currently normal, maximize it
        
        // Store current state before maximizing for restoration
        this.originalWindowStates.set(windowId, {
          width: windowElement.style.width,
          height: windowElement.style.height,
          left: windowElement.style.left,
          top: windowElement.style.top
        });
        
        // Apply maximized dimensions and positioning
        this.applyMaximizedState(windowElement);
        
        // Update window state to maximized
        windowElement.dataset.maximized = 'true';
        
        // Update shared state: ALL content windows should now open maximized
        this.isContentWindowMaximized = true;
        
        console.log(`[WINDOW] ${windowId} maximized. Shared state: maximized = true`);
      }
    }
  }

  private applyMaximizedState(windowElement: HTMLElement, config?: WindowConfig): void {
    // Make window slightly larger (30% increase) and center within border area
    const standardWidth = config?.width || 650;
    const standardHeight = config?.height || 500;
    
    const newWidth = Math.floor(standardWidth * 1.3);
    const newHeight = Math.floor(standardHeight * 1.3);
    
    // Calculate position to center within the border area (40px padding on all sides)
    const borderPadding = 40;
    const availableWidth = window.innerWidth - (borderPadding * 2);
    const availableHeight = window.innerHeight - (borderPadding * 2);
    
    // Ensure the enlarged window fits within the border area
    const finalWidth = Math.min(newWidth, availableWidth - 40); // Extra 20px margin
    const finalHeight = Math.min(newHeight, availableHeight - 40);
    
    const centerX = borderPadding + (availableWidth - finalWidth) / 2;
    const centerY = borderPadding + (availableHeight - finalHeight) / 2;
    
    windowElement.style.width = `${finalWidth}px`;
    windowElement.style.height = `${finalHeight}px`;
    windowElement.style.left = `${centerX}px`;
    windowElement.style.top = `${centerY}px`;
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
        
        <div style="margin-top: 20px; padding: 10px; border: 1px solid var(--portal-blue); border-radius: 4px; background: rgba(0, 153, 255, 0.1);">
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
    const asciiWindow = document.createElement('div');
    asciiWindow.className = 'ascii-window';
    asciiWindow.id = 'ascii-window';
    
    asciiWindow.innerHTML = `
      <div class="ascii-content">
        <pre class="ascii-art"></pre>
      </div>
    `;

    document.body.appendChild(asciiWindow);
    this.asciiWindow = asciiWindow;
    this.updateAsciiWindow();
  }

  private getAsciiArt(windowId: string | null): string {
    return asciiArts[windowId || 'about-me'] || defaultAscii;
  }

  private updateAsciiWindow(): void {
    if (!this.asciiWindow) return;

    const shouldShow = this.currentContentWindow !== null || this.windows.has('about-me');
    
    if (!shouldShow) {
      this.asciiWindow.style.display = 'none';
      return;
    }

    this.asciiWindow.style.display = 'block';
    const activeWindow = this.currentContentWindow || 'about-me';
    const asciiArt = this.getAsciiArt(activeWindow);
    
    this.typeAsciiArt(asciiArt);
  }

  private typeAsciiArt(text: string): void {
    if (!this.asciiWindow) return;
    
    const asciiElement = this.asciiWindow.querySelector('.ascii-art') as HTMLElement;
    if (!asciiElement) return;

    // IMMEDIATE INTERRUPTION: Stop any running animations
    if (this.typingAnimation) {
      clearTimeout(this.typingAnimation);
      this.typingAnimation = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.targetText = text;
    this.currentDisplayedText = asciiElement.textContent || '';
    
    // If target is same as current, do nothing
    if (this.currentDisplayedText.trim() === this.targetText.trim()) {
      this.animationState = 'idle';
      return;
    }

    // If there's existing content and it's different, always delete first
    if (this.currentDisplayedText.length > 0) {
      this.startOptimizedDeletion();
    } else {
      // No existing content, start typing immediately
      this.startOptimizedTyping();
    }
  }

  private startOptimizedDeletion(): void {
    if (!this.asciiWindow) return;
    
    const asciiElement = this.asciiWindow.querySelector('.ascii-art') as HTMLElement;
    if (!asciiElement) return;

    this.animationState = 'deleting';
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
        this.currentDisplayedText = '';
        asciiElement.textContent = '';
        this.animationState = 'idle';
        this.startOptimizedTyping();
        return;
      }

      // Calculate how much text to show based on progress (reverse progress for deletion)
      const targetLength = Math.floor(textLength * (1 - progress));
      if (targetLength !== currentLength) {
        currentLength = targetLength;
        this.currentDisplayedText = this.currentDisplayedText.substring(0, currentLength);
        asciiElement.textContent = this.currentDisplayedText;
      }
      
      this.animationFrameId = requestAnimationFrame(deleteFrame);
    };

    this.animationFrameId = requestAnimationFrame(deleteFrame);
  }

  private startOptimizedTyping(): void {
    if (!this.asciiWindow) return;
    
    const asciiElement = this.asciiWindow.querySelector('.ascii-art') as HTMLElement;
    if (!asciiElement) return;

    this.animationState = 'typing';
    this.lastAnimationTime = performance.now();
    
    // Optimized typing with requestAnimationFrame and larger chunks
    const totalDuration = 800; // Slightly faster for better UX
    const textLength = this.targetText.length;
    let lastIndex = 0;

    const typeFrame = (currentTime: number) => {
      const elapsed = currentTime - this.lastAnimationTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      if (progress >= 1) {
        // Typing complete
        this.currentDisplayedText = this.targetText;
        asciiElement.textContent = this.currentDisplayedText;
        this.animationState = 'idle';
        return;
      }

      // Calculate how much text to show based on progress
      const currentIndex = Math.floor(textLength * progress);
      if (currentIndex !== lastIndex) {
        lastIndex = currentIndex;
        this.currentDisplayedText = this.targetText.substring(0, currentIndex);
        asciiElement.textContent = this.currentDisplayedText;
      }
      
      this.animationFrameId = requestAnimationFrame(typeFrame);
    };

    this.animationFrameId = requestAnimationFrame(typeFrame);
  }
}

// ============================
// APPLICATION INITIALIZATION
// ============================

document.addEventListener('DOMContentLoaded', () => {
  new WindowManager();
  
  // Add some terminal-style loading text
  console.log('%c[TERMINAL] Portal 2 Portfolio System Initialized', 'color: #FFA500; font-family: monospace;');
  console.log('%c[SYSTEM] Welcome to the Aperture Science Portfolio Interface', 'color: #00FF41; font-family: monospace;');
  console.log('%c[GLaDOS] The cake is a lie, but this portfolio is real.', 'color: #FF6600; font-family: monospace;');
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Alt + number keys to open windows quickly
  if (e.altKey && !e.ctrlKey && !e.shiftKey) {
    switch (e.key) {
      case '1':
        e.preventDefault();
        const windowManager = (window as any).windowManager;
        if (windowManager) windowManager.openWindow('research');
        break;
      case '2':
        e.preventDefault();
        break;
      case '3':
        e.preventDefault();
        break;
      case '4':
        e.preventDefault();
        break;
    }
  }
});

// Export for potential external use
(window as any).WindowManager = WindowManager;