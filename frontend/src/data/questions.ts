
import type {QuestionDefinition, QuestionOption} from '../types/setup';

export const questions: QuestionDefinition[] = [

  {
    id: 'operatingSystem',
    title: 'Which operating system do you use?',
    description: 'Let\'s identify your machine first.',
    type: 'single',
    options: [
      {
        id: 'windows',
        label: 'Windows',
        description: 'Windows 10 or 11',
        icon: 'monitor'
      },
      {
        id: 'linux',
        label: 'Linux',
        description: 'Ubuntu, Fedora, Arch, etc.',
        icon: 'terminal'
      },
      {
        id: 'macos',
        label: 'macOS',
        description: 'Apple Mac computers',
        icon: 'laptop'
      }
    ]
  },

  {
    id: 'osVersion',
    title: 'Which version are you running?',
    description: 'Choose your operating system version.',
    type: 'single',
    when: config => config.operatingSystem === 'windows',
    options: [
      {
        id: 'windows10',
        label: 'Windows 10',
        description: 'Microsoft Windows 10',
        icon: 'monitor'
      },
      {
        id: 'windows11',
        label: 'Windows 11',
        description: 'Microsoft Windows 11',
        icon: 'monitor'
      }
    ]
  },

  {
    id: 'osVersion',
    title: 'Which macOS version are you running?',
    description: 'Select your macOS version.',
    type: 'single',
    when: config => config.operatingSystem === 'macos',
    options: [
      {
        id: 'macosTahoe',
        label: 'macOS Tahoe',
        description: 'macOS 26',
        icon: 'laptop'
      },
      {
        id: 'macosSequoia',
        label: 'macOS Sequoia',
        description: 'macOS 15',
        icon: 'laptop'
      },
      {
        id: 'macosOther',
        label: 'Other version',
        description: 'Another macOS release',
        icon: 'laptop'
      }
    ]
  },

  {
    id: 'linuxDistribution',
    title: 'Which Linux distribution do you use?',
    description: 'We need this to select the correct package manager.',
    type: 'single',
    when: config =>
        config.operatingSystem === 'linux' || config.environmentType === 'wsl',
    options: [
      {
        id: 'ubuntu',
        label: 'Ubuntu',
        description: 'Debian-based Linux distribution',
        icon: 'terminal'
      },
      {
        id: 'debian',
        label: 'Debian',
        description: 'Stable Debian distribution',
        icon: 'terminal'
      },
      {
        id: 'fedora',
        label: 'Fedora',
        description: 'RPM-based Linux distribution',
        icon: 'terminal'
      },
      {
        id: 'arch',
        label: 'Arch Linux',
        description: 'Rolling-release distribution',
        icon: 'terminal'
      },
      {
        id: 'otherLinux',
        label: 'Other',
        description: 'Another Linux distribution',
        icon: 'terminal'
      }
    ]
  },

  {
    id: 'environmentType',
    title: 'What kind of environment do you use?',
    description: 'Where will your development tools run?',
    type: 'single',
    options: [
      {
        id: 'desktop',
        label: 'Desktop / Laptop',
        description: 'My personal computer',
        icon: 'monitor'
      },
      {
        id: 'virtualMachine',
        label: 'Virtual Machine',
        description: 'VMware, VirtualBox, etc.',
        icon: 'server'
      },
      {
        id: 'wsl',
        label: 'WSL',
        description: 'Windows Subsystem for Linux',
        icon: 'terminal'
      },
      {
        id: 'remote',
        label: 'Remote Server',
        description: 'A remote development machine',
        icon: 'cloud'
      }
    ]
  },

  {
    id: 'editors',
    title: 'Which IDE or code editor do you prefer?',
    description: 'You can select more than one.',
    type: 'multiple',
    options: [
      {
        id: 'vscode',
        label: 'VS Code',
        description: 'Lightweight and extensible',
        icon: 'code'
      },
      {
        id: 'visualStudio',
        label: 'Visual Studio',
        description: 'Full-featured IDE',
        icon: 'monitor'
      },
      {
        id: 'intellij',
        label: 'IntelliJ IDEA',
        description: 'Java and JVM development',
        icon: 'code'
      },
      {
        id: 'pycharm',
        label: 'PyCharm',
        description: 'Python development',
        icon: 'code'
      },
      {
        id: 'other',
        label: 'Other',
        description: 'Another editor',
        icon: 'laptop'
      }
    ]
  },

  {
    id: 'languages',
    title: 'Which programming languages do you want?',
    description: 'Select all the languages you plan to use.',
    type: 'multiple',
    options: [
      {
        id: 'cpp',
        label: 'C++',
        description: 'Systems and competitive programming',
        icon: 'code'
      },
      {
        id: 'python',
        label: 'Python',
        description: 'AI, automation and backend',
        icon: 'code'
      },
      {
        id: 'javascript',
        label: 'JavaScript',
        description: 'Web development',
        icon: 'code'
      },
      {
        id: 'typescript',
        label: 'TypeScript',
        description: 'Typed JavaScript development',
        icon: 'code'
      },
      {
        id: 'java',
        label: 'Java',
        description: 'Application development',
        icon: 'code'
      },
      {
        id: 'rust',
        label: 'Rust',
        description: 'Systems programming',
        icon: 'code'
      }
    ]
  },

  {
    id: 'purposes',
    title: 'What do you want to build?',
    description: 'We\'ll customize your tools accordingly.',
    type: 'multiple',
    options: [
      {
        id: 'web',
        label: 'Web Development',
        description: 'Frontend and backend',
        icon: 'globe'
      },
      {
        id: 'aiml',
        label: 'AI / Machine Learning',
        description: 'Models and data science',
        icon: 'brain'
      },
      {
        id: 'competitive',
        label: 'Competitive Programming',
        description: 'Algorithms and DSA',
        icon: 'trophy'
      },
      {
        id: 'embedded',
        label: 'Embedded Systems',
        description: 'Microcontrollers and hardware',
        icon: 'cpu'
      },
      {
        id: 'general',
        label: 'General Programming',
        description: 'Learning and experimentation',
        icon: 'code'
      }
    ]
  }
];
