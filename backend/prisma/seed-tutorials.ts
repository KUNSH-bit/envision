
import 'dotenv/config';

import {PrismaPg} from '@prisma/adapter-pg';

import {PrismaClient} from '../src/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in the .env file');
}

const adapter = new PrismaPg({connectionString});
const prisma = new PrismaClient({adapter});

const tutorials = [
  {
    slug: 'windows-cpp-msys2-ucrt64',
    title: 'Install C++ using MSYS2 and GCC on Windows',
    description:
        'Install the GCC C++ compiler using MSYS2 UCRT64 and verify that it works.',
    language: 'C++',
    os: 'WINDOWS',
    osVersion: 'Windows 10 (1809+) / Windows 11',
    status: 'DRAFT',
    version: 1,
    steps: [
      {
        title: 'Download MSYS2',
        instructions:
            'Open the official MSYS2 website and download the installer for your Windows architecture. The default installation directory C:\\msys64 is recommended.',
        expectedOutput: 'The MSYS2 installer should be downloaded.'
      },
      {
        title: 'Install MSYS2',
        instructions:
            'Run the installer, accept the license, select the installation directory and complete the installation. Keep the default directory if possible.',
        expectedOutput:
            'MSYS2 should be installed and its UCRT64 terminal should be available.'
      },
      {
        title: 'Open the UCRT64 terminal',
        instructions:
            'Open the Start menu, search for MSYS2 UCRT64 and launch it. Make sure the terminal title or environment indicates UCRT64.',
        expectedOutput: 'An MSYS2 UCRT64 terminal should open.'
      },
      {
        title: 'Install the GCC compiler',
        instructions:
            'Run the following command inside the MSYS2 UCRT64 terminal. Review the packages and confirm the installation when prompted.',
        command: 'pacman -S --needed mingw-w64-ucrt-x86_64-gcc',
        expectedOutput:
            'The GCC compiler and its required packages should be installed.'
      },
      {
        title: 'Verify the C++ compiler',
        instructions:
            'Run the following command in the UCRT64 terminal to check that the C++ compiler is available.',
        command: 'g++ --version',
        expectedOutput:
            'The terminal should display the installed G++ compiler version.'
      },
      {
        title: 'Verify the C compiler',
        instructions: 'Check that the GCC C compiler is also available.',
        command: 'gcc --version',
        expectedOutput:
            'The terminal should display the installed GCC compiler version.'
      }
    ],
    sources: [
      {
        title: 'MSYS2 Getting Started',
        url: 'https://www.msys2.org/',
        publisher: 'MSYS2'
      },
      {
        title: 'MSYS2 Installer Documentation',
        url: 'https://www.msys2.org/docs/installer/',
        publisher: 'MSYS2'
      },
      {
        title: 'MSYS2 Environments',
        url: 'https://www.msys2.org/docs/environments/',
        publisher: 'MSYS2'
      }
    ]
  },
  {
    slug: 'windows-python-install-manager',
    title: 'Install Python on Windows',
    description:
        'Install Python using the official Python install manager and create an isolated project environment.',
    language: 'Python',
    os: 'WINDOWS',
    osVersion: 'Windows 10 / Windows 11',
    status: 'DRAFT',
    version: 1,
    steps: [
      {
        title: 'Download the Python install manager',
        instructions:
            'Visit the official Python downloads page for Windows. Download and install the Python install manager using the recommended installation option.',
        expectedOutput: 'The Python install manager should be installed.'
      },
      {
        title: 'Open a new terminal',
        instructions:
            'Close existing PowerShell or Command Prompt windows and open a new terminal so that the updated commands are available.',
        expectedOutput: 'A fresh terminal should be ready.'
      },
      {
        title: 'Verify Python',
        instructions: 'Check whether the Python command is available.',
        command: 'python --version',
        expectedOutput:
            'The terminal should display the installed Python version.'
      },
      {
        title: 'Check the Python launcher',
        instructions: 'Check whether the Python launcher command is available.',
        command: 'py --version',
        expectedOutput:
            'The terminal should display the Python version selected by the launcher.'
      },
      {
        title: 'Create a project directory',
        instructions:
            'Create a separate directory for testing your Python development environment.',
        command: 'mkdir python-devsetup-test; cd python-devsetup-test',
        expectedOutput:
            'The terminal should move into the newly created project directory.'
      },
      {
        title: 'Create a virtual environment',
        instructions:
            'Create a virtual environment named .venv. This keeps project packages separate from other Python projects.',
        command: 'python -m venv .venv',
        expectedOutput:
            'A .venv directory containing the virtual environment should be created.'
      },
      {
        title: 'Verify the virtual environment',
        instructions:
            'Use the Python executable inside the virtual environment to check that it works.',
        command: '.\\.venv\\Scripts\\python.exe --version',
        expectedOutput: 'The Python version should be displayed successfully.'
      },
      {
        title: 'Check pip',
        instructions:
            'Check that pip is available inside the virtual environment.',
        command: '.\\.venv\\Scripts\\python.exe -m pip --version',
        expectedOutput:
            'The terminal should display the pip version and its location.'
      }
    ],
    sources: [
      {
        title: 'Using Python on Windows',
        url: 'https://docs.python.org/3/using/windows.html',
        publisher: 'Python Software Foundation'
      },
      {
        title: 'Python Downloads for Windows',
        url: 'https://www.python.org/downloads/windows/',
        publisher: 'Python Software Foundation'
      }
    ]
  },
  {
    slug: 'windows-nodejs-npm',
    title: 'Install Node.js and npm on Windows',
    description:
        'Install the Node.js LTS release and verify Node.js and npm from PowerShell.',
    language: 'Node.js',
    os: 'WINDOWS',
    osVersion: 'Windows 10 / Windows 11',
    status: 'DRAFT',
    version: 1,
    steps: [
      {
        title: 'Download Node.js',
        instructions:
            'Visit the official Node.js download page. Select the Windows installer for the current LTS release and the appropriate system architecture.',
        expectedOutput: 'The Node.js Windows installer should be downloaded.'
      },
      {
        title: 'Install Node.js',
        instructions:
            'Run the downloaded installer. Follow the installation wizard and keep the standard options unless you have a specific reason to change them.',
        expectedOutput: 'Node.js should be installed on Windows.'
      },
      {
        title: 'Open a new terminal',
        instructions:
            'Close existing terminals and open a fresh PowerShell window so the updated PATH is loaded.',
        expectedOutput: 'A new PowerShell terminal should open.'
      },
      {
        title: 'Verify Node.js',
        instructions: 'Check the installed Node.js version.',
        command: 'node --version',
        expectedOutput:
            'The terminal should display the installed Node.js version.'
      },
      {
        title: 'Verify npm',
        instructions: 'Check that the Node Package Manager is available.',
        command: 'npm --version',
        expectedOutput: 'The terminal should display the installed npm version.'
      },
      {
        title: 'Create a test project',
        instructions:
            'Create a directory and initialize a basic Node.js project.',
        command: 'mkdir node-devsetup-test; cd node-devsetup-test; npm init -y',
        expectedOutput:
            'A package.json file should be created in the project directory.'
      },
      {
        title: 'Run a Node.js test',
        instructions: 'Execute a simple JavaScript statement using Node.js.',
        command: 'node -e "console.log(\'Node.js is working\')"',
        expectedOutput: 'Node.js is working'
      }
    ],
    sources: [
      {
        title: 'Node.js Downloads',
        url: 'https://nodejs.org/en/download',
        publisher: 'OpenJS Foundation'
      },
      {
        title: 'Node.js Getting Started',
        url:
            'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs',
        publisher: 'OpenJS Foundation'
      }
    ]
  },
  {
    slug: 'windows-java-openjdk-21',
    title: 'Install Java JDK 21 on Windows',
    description:
        'Install Microsoft Build of OpenJDK 21 and verify the Java runtime and compiler.',
    language: 'Java',
    os: 'WINDOWS',
    osVersion: 'Windows 10 / Windows 11',
    status: 'DRAFT',
    version: 1,
    steps: [
      {
        title: 'Open PowerShell',
        instructions:
            'Open a new PowerShell terminal. Check that Windows Package Manager is available before continuing.',
        command: 'winget --version',
        expectedOutput:
            'The installed Windows Package Manager version should be displayed.'
      },
      {
        title: 'Install OpenJDK 21',
        instructions:
            'Install Microsoft Build of OpenJDK 21 using Windows Package Manager. Review and accept any installation prompts.',
        command: 'winget install Microsoft.OpenJDK.21',
        expectedOutput: 'The OpenJDK installation should complete successfully.'
      },
      {
        title: 'Open a new terminal',
        instructions:
            'Close the existing terminal and open a new PowerShell window so that the Java environment changes are loaded.',
        expectedOutput: 'A fresh PowerShell terminal should open.'
      },
      {
        title: 'Verify the Java runtime',
        instructions: 'Check the Java runtime installation.',
        command: 'java -version',
        expectedOutput: 'The terminal should display an OpenJDK 21 version.'
      },
      {
        title: 'Verify the Java compiler',
        instructions: 'Check that the JDK compiler is available.',
        command: 'javac -version',
        expectedOutput:
            'The terminal should display javac 21 or another matching 21.x version.'
      },
      {
        title: 'Create a test directory',
        instructions: 'Create a directory for testing Java.',
        command: 'mkdir java-devsetup-test; cd java-devsetup-test',
        expectedOutput: 'The terminal should move into the new directory.'
      },
      {
        title: 'Create and run a Java program',
        instructions:
            'Create a small Java program and run it using Java source-file mode.',
        command:
            'Set-Content Hello.java \'class Hello { public static void main(String[] args) { System.out.println("Hello from Java"); } }\'; java Hello.java',
        expectedOutput: 'Hello from Java'
      }
    ],
    sources: [
      {
        title: 'Get Started with Java on Windows',
        url: 'https://learn.microsoft.com/windows/dev-environment/java/',
        publisher: 'Microsoft'
      },
      {
        title: 'Install Eclipse Temurin',
        url: 'https://adoptium.net/installation/',
        publisher: 'Eclipse Adoptium'
      }
    ]
  },
  {
    slug: 'windows-rust-rustup',
    title: 'Install Rust using rustup on Windows',
    description:
        'Install the Rust compiler and Cargo package manager using the official rustup installer.',
    language: 'Rust',
    os: 'WINDOWS',
    osVersion: 'Windows 10 / Windows 11',
    status: 'DRAFT',
    version: 1,
    steps: [
      {
        title: 'Download rustup',
        instructions:
            'Visit the official Rust installation page and download the Windows rustup installer matching your system architecture.',
        expectedOutput: 'The rustup installer should be downloaded.'
      },
      {
        title: 'Run the installer',
        instructions:
            'Run rustup-init.exe. Follow the prompts and use the recommended default MSVC toolchain for native Windows development. If the installer requests Microsoft C++ build tools, follow its instructions to install the required components.',
        expectedOutput: 'Rustup should install the Rust toolchain.'
      },
      {
        title: 'Open a new terminal',
        instructions:
            'Close existing terminals and open a fresh PowerShell window so the Rust commands are available.',
        expectedOutput: 'A new PowerShell terminal should open.'
      },
      {
        title: 'Verify the Rust compiler',
        instructions: 'Check that the Rust compiler is installed.',
        command: 'rustc --version',
        expectedOutput:
            'The terminal should display the installed rustc version.'
      },
      {
        title: 'Verify Cargo',
        instructions:
            'Check that Cargo, Rust package manager and build tool, is installed.',
        command: 'cargo --version',
        expectedOutput:
            'The terminal should display the installed Cargo version.'
      },
      {
        title: 'Create a test project',
        instructions: 'Use Cargo to create a basic Rust project.',
        command: 'cargo new rust-devsetup-test',
        expectedOutput:
            'Cargo should create a project directory containing a basic Rust application.'
      },
      {
        title: 'Run the test project',
        instructions:
            'Move into the project directory and run the generated application.',
        command: 'cd rust-devsetup-test; cargo run',
        expectedOutput: 'The program should compile and print Hello, world!'
      }
    ],
    sources: [
      {
        title: 'Install Rust',
        url: 'https://rust-lang.org/install',
        publisher: 'Rust Project'
      },
      {
        title: 'Set up Rust on Windows',
        url:
            'https://learn.microsoft.com/en-us/windows/dev-environment/rust/setup',
        publisher: 'Microsoft'
      }
    ]
  }
];

async function main() {
  console.log('Starting DevSetup tutorial seeding...');

  for (const tutorial of tutorials) {
    const {steps, sources, ...tutorialData} = tutorial;

    await prisma.tutorial.upsert({
      where: {slug: tutorial.slug},

      create: {
        ...tutorialData,
        steps:
            {create: steps.map((step, index) => ({...step, order: index + 1}))},
        sources: {create: sources}
      },

      update: {
        ...tutorialData,
        steps: {
          deleteMany: {},
          create: steps.map((step, index) => ({...step, order: index + 1}))
        }
      }
    });

    console.log(`Seeded: ${tutorial.title}`);
  }

  console.log('--------------------------------');
  console.log(`Tutorials processed: ${tutorials.length}`);
  console.log('Tutorial seeding completed.');
}

main()
    .catch(error => {
      console.error('Tutorial seeding failed:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
