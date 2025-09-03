export type Link = { label: string; href: string };
export type PortfolioItem = {
  title: string;
  subtitle?: string; // e.g., org or stack
  period?: string;
  description: string;
  image?: string; // public path or remote URL
  links?: Link[];
  tags?: string[];
};

export type SectionData = {
  id: string; // header id used by ArtBox mapping
  title: string;
  accent: string; // hex or tailwind color
  items: PortfolioItem[];
};

export const sections: SectionData[] = [
  {
    id: 'header_research',
    title: 'research',
    accent: '#e2e224',
    items: [
      {
        title: 'Gameplaying AI with Proximal Policy Optimization',
        period: 'SPRING 2024 · 4 months',
        description:
          "Reimplementation of PPO to train an agent that clears Sonic the Hedgehog L1 in ~8 seconds off WR pace. Built environments, wired agent, analyzed training to tune hypers.",
        links: [
          { label: 'GitHub', href: 'https://github.com/Iemontine/SonicGameplayingAI' },
          { label: 'LinkedIn', href: 'https://www.linkedin.com/in/darrolls/details/projects/' },
        ],
      },
      {
        title:
          'Embedded Temporal/Audio Context for Enhanced Video Content Description by LLM',
        period: 'SUMMER 2024 · 2 months',
        description:
          'Augments video frames with temporal/audio context. Sound effects detected via ResNet50 on Log-mel spectrograms; yielded richer descriptions (with occasional hallucinations).',
        links: [
          { label: 'GitHub', href: 'https://github.com/Iemontine/AudioVideoDescriptiveAI' },
          { label: 'LinkedIn', href: 'https://www.linkedin.com/in/darrolls/details/projects/' },
        ],
      },
      {
        title: 'Gamification of Education in AI/ML',
        period: 'PRESENT',
        description:
          'Research under Prof. Rafatirad at UC Davis on gamified tools for AI/ML education. Wired Godot games with Python RL (PPO), tuned rewards, analyzed results in TensorFlow.',
        links: [
          { label: 'GitHub', href: 'https://github.com/Iemontine/SonicGameplayingAI' },
        ],
      },
    ],
  },
  {
    id: 'header_projects',
    title: 'projects',
    accent: '#e2e224',
    items: [
      {
        title: 'clembot',
        description:
          'Discord bot: multi-user fine-tuned AI chat, music, generative images, birthdays, activity tracking, and more. Ongoing playground for features and ideas.',
        links: [
          { label: 'GitHub', href: 'https://github.com/Iemontine/cIembot' },
        ],
      },
      {
        title: 'gmod_ultrakill_hud',
        description:
          "Popular ULTRAKILL-style HUD for Garry's Mod with tens of thousands of users and 130k+ views.",
        links: [
          { label: 'Steam', href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=2988658929' },
          { label: 'GitHub', href: 'https://github.com/Iemontine/ultrakill-hud' },
        ],
      },
      {
        title: 'GridGame',
        description:
          '2D block-pushing puzzle game (team project). Mechanics and site coded in JS using DOM. Playable in browser.',
        links: [
          { label: 'Play', href: 'https://iemontine.github.io/minigames' },
        ],
      },
      {
        title: 'FloodFinder',
        description:
          'HackDavis 2023 full-stack app for disaster response. Google Earth API + Python backend; AI function-calling and recommendations.',
        links: [
          { label: 'GitHub', href: 'https://github.com/Iemontine/FloodFinder' },
        ],
      },
      {
        title: 'softwareInstaller',
        description:
          'VB.Net automation to onboard new UC Davis Library machines: domain join, installs, device naming, and config.',
      },
      {
        title: 'misc.dev',
        description:
          'Assorted projects and experiments.',
        links: [
          { label: 'this.website', href: 'https://github.com/Iemontine/portfolio' },
          { label: 'omori-themed-web', href: 'https://github.com/Iemontine/WebDevPractice-OMORI' },
          { label: 'minigames', href: 'https://github.com/Iemontine/minigames' },
          { label: 'microblog', href: 'https://github.com/Iemontine/microblog' },
          { label: 'plaque-counter', href: 'https://github.com/Iemontine/plaque-counter' },
        ],
      },
    ],
  },
  {
    id: 'header_experience',
    title: 'experience',
    accent: '#a78bfa',
    items: [
      {
        title: 'Information Technology Infrastructure Services',
        subtitle: 'UC Davis Library',
        period: 'Dec 2023 – Present',
        description:
          'Built .NET tooling to accelerate workstation setup and replace manual installs. Troubleshot and supported software/hardware across departments.',
      },
      {
        title: 'System Developer and Administrator',
        subtitle: 'Comfort Living for Seniors',
        period: '2021 – Present',
        description:
          'Web interface and tools to digitize elderly patient data; routine maintenance and new features as needed.',
      },
      {
        title: 'AI Developer (Project Volare)',
        subtitle: 'CODELAB at UC Davis',
        period: 'Fall 2024 – Present',
        description:
          'Interview practice web app with real-time AI; explored vocal tone analysis and body language classifiers. General TS/API/Tailwind work.',
      },
      {
        title: "Monsters' Shift",
        subtitle: 'UC Davis',
        period: 'Sep 2024 – Dec 2024',
        description:
          '2D RPG built in Godot (team of six). Directed project and managed git/Agile. Implemented core infrastructure and tools.',
      },
      {
        title: 'President, STEM Club',
        subtitle: 'Solano Community College',
        period: 'Fall 2021 – Spring 2023',
        description:
          'Led a ~200 member club: organized events, networking, tutoring, and outreach.',
      },
    ],
  },
];
