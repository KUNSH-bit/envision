
import {prisma} from '../src/prisma.js';

async function main() {
  // Remove our previous temporary test record.
  await prisma.issue.deleteMany({where: {id: 'devsetup-search-test'}});

  // Insert the first real troubleshooting entry.
  await prisma.issue.upsert({
    where: {id: 'windows-gpp-not-recognized'},

    update: {
      title: 'g++ is not installed or is not recognized by Windows',

      description:
          'Windows cannot find the g++ compiler command. This can happen because the compiler is not installed or because its bin directory is missing from the PATH environment variable.',

      errorPatterns: [
        'g++ not installed', 'g++ is not installed', 'g++ is not recognized',
        'g++ is not recognized as an internal or external command',
        'g++ command not found', 'g++: command not found'
      ]
    },

    create: {
      id: 'windows-gpp-not-recognized',

      title: 'g++ is not installed or is not recognized by Windows',

      description:
          'Windows cannot find the g++ compiler command. This can happen because the compiler is not installed or because its bin directory is missing from the PATH environment variable.',

      errorPatterns: [
        'g++ not installed', 'g++ is not installed', 'g++ is not recognized',
        'g++ is not recognized as an internal or external command',
        'g++ command not found', 'g++: command not found'
      ],

      os: 'WINDOWS',
      language: 'C++',
      severity: 'MEDIUM',

      solutions: {
        create: [{
          title: 'Install and configure GCC using MSYS2',

          description:
              'Install the GCC compiler through the MSYS2 UCRT64 environment, configure its bin directory in Windows PATH, and verify that Windows can find g++.',

          verification:
              'Open a new PowerShell or Command Prompt window and run g++ --version. A successful installation displays the compiler version.',

          steps: {
            create: [
              {
                order: 1,

                title: 'Install MSYS2',

                instructions:
                    'Visit the official MSYS2 website at https://www.msys2.org. Download and install MSYS2. The default installation directory is C:\\msys64. If you choose a different directory, remember it because you will need its ucrt64\\bin folder later.'
              },
              {
                order: 2,

                title: 'Open the UCRT64 terminal',

                instructions:
                    'Open the Start menu and launch MSYS2 UCRT64. Do not use the plain MSYS terminal for this particular compiler setup.'
              },
              {
                order: 3,

                title: 'Install the GCC toolchain',

                instructions:
                    'In the MSYS2 UCRT64 terminal, install the GCC toolchain. Confirm the installation when prompted.',

                command:
                    'pacman -S --needed base-devel mingw-w64-ucrt-x86_64-toolchain',

                expectedOutput:
                    'MSYS2 completes package installation without reporting a fatal error.'
              },
              {
                order: 4,

                title: 'Check the compiler inside MSYS2',

                instructions:
                    'Still inside the UCRT64 terminal, check whether the compiler is available.',

                command: 'g++ --version',

                expectedOutput:
                    'The terminal displays the installed GCC/G++ compiler version.'
              },
              {
                order: 5,

                title: 'Add the compiler directory to Windows PATH',

                instructions:
                    'Open Windows Search and search for Edit environment variables for your account. Open the Path variable under User variables, select New, and add the ucrt64\\bin directory inside your MSYS2 installation. With the default installation directory, this is C:\\msys64\\ucrt64\\bin. Save the changes.'
              },
              {
                order: 6,

                title: 'Restart your terminal',

                instructions:
                    'Close existing PowerShell, Command Prompt, and VS Code terminal windows. Open a new PowerShell window so it loads the updated PATH environment variable.'
              },
              {
                order: 7,

                title: 'Verify g++ from Windows',

                instructions:
                    'Run the compiler version command in the new PowerShell window.',

                command: 'g++ --version',

                expectedOutput:
                    'PowerShell displays the installed GCC/G++ version.'
              }
            ]
          },

          sources: {
            create: [
              {
                title: 'MSYS2 Getting Started',

                url: 'https://www.msys2.org/',

                publisher: 'MSYS2',

                sourceVersion: 'Official installation guide',

                lastVerifiedAt: new Date()
              },
              {
                title: 'Using GCC with MinGW',

                url: 'https://code.visualstudio.com/docs/cpp/config-mingw',

                publisher: 'Microsoft Visual Studio Code',

                sourceVersion: 'Official C++ setup documentation',

                lastVerifiedAt: new Date()
              },
              {
                title: 'MSYS2 Environments',

                url: 'https://www.msys2.org/docs/environments/',

                publisher: 'MSYS2',

                sourceVersion: 'Official environment documentation',

                lastVerifiedAt: new Date()
              }
            ]
          }
        }]
      }
    }
  });

  console.log('First C++ troubleshooting entry inserted successfully.');
}

main()
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
