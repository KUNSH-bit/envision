
import type {QuestionOption} from '../types/setup';

export const questions: {
  id: string; title: string; description: string; type: 'single' | 'multiple';
  options: QuestionOption[];
}[] =
    [

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
