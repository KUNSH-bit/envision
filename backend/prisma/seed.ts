
import {prisma} from '../src/prisma.js';

interface SourceSeed {
  title: string;
  url: string;
  publisher: string;
  sourceVersion?: string;
}

interface StepSeed {
  title: string;
  instructions: string;
  command?: string;
  expectedOutput?: string;
}

interface IssueSeed {
  id: string;
  title: string;
  description: string;
  errorPatterns: string[];
  os: 'WINDOWS';
  language: string;
  severity: 'LOW'|'MEDIUM'|'HIGH';
  solution: {
    title: string; description: string; verification: string; steps: StepSeed[];
    sources: SourceSeed[];
  };
}

const sourceCatalog = {
  msys2: {
    title: 'MSYS2 Getting Started',
    url: 'https://www.msys2.org/',
    publisher: 'MSYS2',
    sourceVersion: 'Official installation documentation'
  },

  msys2Environments: {
    title: 'MSYS2 Environments',
    url: 'https://www.msys2.org/docs/environments/',
    publisher: 'MSYS2',
    sourceVersion: 'Official environment documentation'
  },

  vscodeCpp: {
    title: 'C/C++ for Visual Studio Code',
    url: 'https://code.visualstudio.com/docs/languages/cpp',
    publisher: 'Microsoft',
    sourceVersion: 'Official VS Code documentation'
  },

  vscodeIntelliSense: {
    title: 'Configure C/C++ IntelliSense',
    url: 'https://code.visualstudio.com/docs/cpp/configure-intellisense',
    publisher: 'Microsoft',
    sourceVersion: 'Official VS Code documentation'
  },

  vscodeSettings: {
    title: 'C++ Extension Settings Reference',
    url: 'https://code.visualstudio.com/docs/cpp/customize-cpp-settings',
    publisher: 'Microsoft',
    sourceVersion: 'Official VS Code documentation'
  },

  gccInvocation: {
    title: 'Invoking GCC',
    url: 'https://gcc.gnu.org/onlinedocs/gcc/Invoking-GCC.html',
    publisher: 'GNU Project',
    sourceVersion: 'Official GCC manual'
  },

  gccOptions: {
    title: 'GCC Overall Options',
    url: 'https://gcc.gnu.org/onlinedocs/gcc/Overall-Options.html',
    publisher: 'GNU Project',
    sourceVersion: 'Official GCC manual'
  },

  gnuLinker: {
    title: 'GNU Linker Documentation',
    url: 'https://sourceware.org/binutils/docs/ld.html',
    publisher: 'GNU Binutils',
    sourceVersion: 'Official linker documentation'
  },

  cppOdr: {
    title: 'Definitions and One Definition Rule',
    url: 'https://en.cppreference.com/w/cpp/language/definition',
    publisher: 'cppreference.com',
    sourceVersion: 'C++ language reference'
  }
};

const issueSeeds: IssueSeed[] = [
  {
    id: 'windows-gcc-not-recognized',

    title: 'gcc is not installed or is not recognized by Windows',

    description:
        'Windows cannot find the gcc compiler command. The compiler may not be installed, or its executable directory may not be included in the PATH environment variable.',

    errorPatterns: [
      'gcc not installed', 'gcc is not installed', 'gcc is not recognized',
      'gcc is not recognized as an internal or external command',
      'gcc command not found', 'gcc is not available', 'windows cannot find gcc'
    ],

    os: 'WINDOWS',
    language: 'C++',
    severity: 'MEDIUM',

    solution: {
      title: 'Install and configure GCC using MSYS2',

      description:
          'Install the GCC toolchain through the MSYS2 UCRT64 environment, verify that GCC is available, and configure Windows PATH if you want to use it from PowerShell or VS Code.',

      verification:
          'Open a new PowerShell terminal and run gcc --version. The compiler should display its installed version.',

      steps: [
        {
          title: 'Check whether GCC is already installed',

          instructions:
              'Open PowerShell and check whether Windows can locate the GCC executable.',

          command: 'where.exe gcc',

          expectedOutput:
              'If GCC is available through PATH, Windows displays the path to gcc.exe. If it is not found, continue with the installation steps.'
        },
        {
          title: 'Install MSYS2 if necessary',

          instructions:
              'Visit the official MSYS2 website, download the installer, and complete the installation. The default installation directory is C:\\msys64.'
        },
        {
          title: 'Open the UCRT64 terminal',

          instructions:
              'Open the Start menu and launch MSYS2 UCRT64. This environment provides the GCC-based Windows toolchain.'
        },
        {
          title: 'Install the GCC package',

          instructions:
              'Run the following command in the MSYS2 UCRT64 terminal and confirm installation when prompted.',

          command: 'pacman -S --needed mingw-w64-ucrt-x86_64-gcc',

          expectedOutput:
              'MSYS2 installs the GCC package and its required dependencies.'
        },
        {
          title: 'Verify GCC inside MSYS2',

          instructions:
              'Check that the compiler is available in the UCRT64 terminal.',

          command: 'gcc --version',

          expectedOutput: 'The terminal displays the GCC version.'
        },
        {
          title: 'Configure Windows PATH if needed',

          instructions:
              'To use GCC from PowerShell, add the UCRT64 bin directory to your user PATH. With the default MSYS2 installation, the directory is C:\\msys64\\ucrt64\\bin. Open the Windows environment variable settings, edit the user Path variable, and add this directory. Do not remove existing PATH entries.'
        },
        {
          title: 'Restart the terminal and verify',

          instructions:
              'Close existing PowerShell and VS Code terminal windows. Open a new PowerShell window and check the compiler again.',

          command: 'gcc --version',

          expectedOutput: 'PowerShell displays the GCC version.'
        }
      ],

      sources: [sourceCatalog.msys2, sourceCatalog.msys2Environments]
    }
  },

  {
    id: 'windows-cpp-undefined-reference',

    title: 'C++ undefined reference linker error',

    description:
        'The compiler has compiled source code, but the linker cannot find the definition of a function, variable, or other symbol referenced by the program. This commonly happens when a required source file or library is missing from the build command, or when declarations and definitions do not match.',

    errorPatterns: [
      'undefined reference', 'undefined reference to main',
      'undefined reference to function', 'undefined reference to symbol',
      'undefined reference to vtable', 'undefined reference to constructor',
      'undefined reference to destructor', 'linker undefined reference',
      'function declared but not defined', 'unresolved external symbol'
    ],

    os: 'WINDOWS',
    language: 'C++',
    severity: 'MEDIUM',

    solution: {
      title: 'Check source files, definitions, and linker inputs',

      description:
          'Identify the exact missing symbol, confirm that its definition exists, and ensure that every required source file and library is included in the final build.',

      verification:
          'Compile the complete program again. A successful build should finish without undefined reference errors and create the requested executable.',

      steps: [
        {
          title: 'Find the first undefined reference message',

          instructions:
              'Read the complete compiler output and identify the exact function or variable named after \'undefined reference to\'. That name helps identify which definition the linker cannot find.'
        },
        {
          title: 'Check whether the function has a definition',

          instructions:
              'A declaration tells the compiler that a function exists, but the program also needs its actual definition. Check that the function body exists and that its name, parameter types, and return type match the declaration.'
        },
        {
          title: 'Include every required source file',

          instructions:
              'If a function is implemented in another .cpp file, include that file in the compilation command. For example, if main.cpp calls a function implemented in helper.cpp, compile both files together.',

          command: 'g++ main.cpp helper.cpp -o app.exe',

          expectedOutput:
              'The command completes without an undefined reference error and produces app.exe.'
        },
        {
          title: 'Check required libraries',

          instructions:
              'If the missing symbol belongs to an external library, confirm that the library is installed and that the correct library is linked. With GCC, library options and input-file ordering can matter.'
        },
        {
          title: 'Build again',

          instructions:
              'Run the corrected command from the project directory. If another undefined reference appears, inspect that exact symbol rather than assuming it has the same cause.'
        }
      ],

      sources: [sourceCatalog.gccInvocation, sourceCatalog.gnuLinker]
    }
  },

  {
    id: 'windows-cpp-iostream-not-found',

    title: 'C++ compiler cannot find the iostream header',

    description:
        'The compiler reports that iostream cannot be found. This can indicate an incomplete or incorrectly selected C++ toolchain, missing C++ standard library headers, or compiler options that disable the normal C++ include directories.',

    errorPatterns: [
      'iostream no such file or directory',
      'fatal error iostream no such file or directory',
      'iostream file not found', 'cannot find iostream',
      'cannot open include file iostream', 'standard c++ headers missing',
      'c++ standard library headers not found', 'iostream header missing'
    ],

    os: 'WINDOWS',
    language: 'C++',
    severity: 'HIGH',

    solution: {
      title: 'Repair the C++ toolchain and standard library configuration',

      description:
          'Check that a working C++ compiler and its standard library headers are installed. Avoid manually downloading individual standard library headers.',

      verification:
          'Compile a small program that includes iostream and prints a message. The compiler should find the header and create an executable.',

      steps: [
        {
          title: 'Confirm that you are using a C++ compiler',

          instructions:
              'Open PowerShell and check which compiler is available.',

          command: 'g++ --version',

          expectedOutput: 'PowerShell displays the installed G++ version.'
        },
        {
          title: 'Check the compiler installation',

          instructions:
              'If you use MSYS2, open the UCRT64 terminal and check that the GCC C++ package is installed.'
        },
        {
          title: 'Install or repair the MSYS2 GCC toolchain',

          instructions:
              'In the MSYS2 UCRT64 terminal, install the GCC toolchain package if it is missing.',

          command: 'pacman -S --needed mingw-w64-ucrt-x86_64-gcc',

          expectedOutput:
              'MSYS2 confirms that the package and its required dependencies are installed.'
        },
        {
          title: 'Check for unusual compiler options',

          instructions:
              'Inspect your build command and configuration for options such as -nostdinc or -nostdinc++. These options can disable normal system header searches. Remove them unless your project specifically requires them.'
        },
        {
          title: 'Compile using G++',

          instructions:
              'Use G++ to compile your C++ source file. The standard library headers should be supplied by the selected toolchain.',

          command: 'g++ main.cpp -o main.exe',

          expectedOutput:
              'The program compiles without an iostream header error.'
        }
      ],

      sources: [
        sourceCatalog.msys2, sourceCatalog.msys2Environments,
        sourceCatalog.gccInvocation
      ]
    }
  },

  {
    id: 'windows-cpp-multiple-definition',

    title: 'C++ multiple definition linker error',

    description:
        'The linker finds more than one definition of the same function or global symbol. This commonly happens when a non-inline function is defined in a header included by multiple source files, or when the same source file is included in the build more than once.',

    errorPatterns: [
      'multiple definition of', 'multiple definition',
      'multiple definition of main', 'multiple definition of function',
      'multiple definition of symbol', 'already defined', 'duplicate symbol',
      'symbol already defined', 'redefinition linker error'
    ],

    os: 'WINDOWS',
    language: 'C++',
    severity: 'MEDIUM',

    solution:
        {
          title: 'Remove duplicate definitions from the program',

          description:
              'Find the symbol reported by the linker and make sure that the program contains only the definitions permitted by the C++ One Definition Rule.',

          verification:
              'Rebuild the program. The linker should no longer report duplicate definitions.',

          steps: [
            {
              title: 'Identify the duplicated symbol',

              instructions:
                  'Read the linker output and identify the function or variable named after \'multiple definition of\'. Also note which source or object files contain the conflicting definitions.'
            },
            {
              title: 'Check whether a function body is in a header',

              instructions:
                  'If a normal non-inline function is defined in a header included by multiple .cpp files, move its function body into one .cpp file. Keep its declaration in the header.'
            },
            {
              title: 'Use inline only when appropriate',

              instructions:
                  'If a function is intentionally defined in a header and needs to be included by multiple translation units, consider declaring it inline. Do not use inline as a blanket fix for unrelated duplicate definitions.'
            },
            {
              title: 'Check whether the same source file is compiled twice',

              instructions:
                  'Review your VS Code build task or compiler command. Make sure a source file is not listed twice and that you have only one definition of main in the executable.'
            },
            {
              title: 'Build the project again',

              instructions:
                  'Compile all required source files once, then check whether the duplicate symbol error has disappeared.',

              command: 'g++ main.cpp helper.cpp -o app.exe',

              expectedOutput:
                  'The linker completes without reporting multiple definitions.'
            }
          ],

          sources: [
            sourceCatalog.cppOdr, sourceCatalog.gnuLinker,
            sourceCatalog.gccInvocation
          ]
        }
  },

  {
    id: 'windows-vscode-cpp-header-not-found',

    title: 'VS Code IntelliSense cannot find C++ headers',

    description:
        'VS Code displays messages such as \'cannot open source file\' or \'include errors detected\'. The C++ extension may be using the wrong compiler configuration or may not be able to determine the correct include directories. This can be an IntelliSense problem even when the compiler itself works.',

    errorPatterns: [
      'cannot open source file', 'cannot open source file iostream',
      'include errors detected', 'cannot open include file',
      'header file not found in vscode', 'vscode cannot find cpp headers',
      'intellisense cannot find iostream', 'squiggles cannot open source file',
      'vscode cpp include path error'
    ],

    os: 'WINDOWS',
    language: 'VS Code',
    severity: 'MEDIUM',

    solution: {
      title: 'Configure the VS Code C++ IntelliSense compiler',

      description:
          'Select the compiler that your project actually uses and allow the C/C++ extension to obtain its standard system include paths.',

      verification:
          'Open a C++ source file and check the IntelliSense status. Standard headers should resolve without the previous include errors. Also test an actual compiler build separately.',

      steps: [
        {
          title: 'Check whether the problem is only IntelliSense',

          instructions:
              'Try compiling your source file from the terminal. If compilation succeeds but VS Code still shows a red underline under a standard header, the problem may be IntelliSense configuration rather than the compiler installation.'
        },
        {
          title: 'Open the IntelliSense configuration',

          instructions:
              'In VS Code, press Ctrl+Shift+P and run the command C/C++: Edit Configurations (UI).'
        },
        {
          title: 'Select the correct compiler',

          instructions:
              'Set the Compiler path to the compiler used by your project. For the default MSYS2 UCRT64 installation, a typical G++ path is C:/msys64/ucrt64/bin/g++.exe. Use the actual location on your computer.'
        },
        {
          title: 'Check the IntelliSense mode',

          instructions:
              'Make sure the IntelliSense mode matches your compiler and target architecture. For a typical 64-bit GCC setup on Windows, select the Windows GCC x64 mode.'
        },
        {
          title: 'Avoid unnecessary system include paths',

          instructions:
              'When a supported compiler is configured correctly, the extension can query it for standard system include directories. Do not add random compiler installation folders to includePath. Add workspace-specific include directories only when your project needs them.'
        },
        {
          title: 'Reload VS Code',

          instructions:
              'Save the configuration and reload the VS Code window. Reopen the C++ file and check whether IntelliSense has resolved the standard headers.'
        }
      ],

      sources: [
        sourceCatalog.vscodeIntelliSense, sourceCatalog.vscodeSettings,
        sourceCatalog.vscodeCpp
      ]
    }
  },

  {
    id: 'windows-gpp-no-input-files',

    title: 'G++ reports fatal error: no input files',

    description:
        'G++ was launched without a valid source file or other input file. This usually happens when the source filename was omitted, misspelled, or supplied from the wrong working directory.',

    errorPatterns: [
      'g++ fatal error no input files', 'g++ fatal error: no input files',
      'fatal error: no input files', 'no input files', 'g++ no source files',
      'compiler has no input file'
    ],

    os: 'WINDOWS',
    language: 'C++',
    severity: 'LOW',

    solution: {
      title: 'Provide a valid source file to G++',

      description:
          'Check the current directory, confirm that the source file exists, and pass its filename to the compiler.',

      verification:
          'Run the corrected compiler command. It should compile the source file and generate the requested executable.',

      steps: [
        {
          title: 'Check the current directory',

          instructions:
              'In PowerShell, check which folder your terminal is currently using.',

          command: 'Get-Location',

          expectedOutput: 'PowerShell displays the current working directory.'
        },
        {
          title: 'List the C++ source files',

          instructions: 'Check which .cpp files exist in the current folder.',

          command: 'Get-ChildItem *.cpp',

          expectedOutput: 'PowerShell lists the available C++ source files.'
        },
        {
          title: 'Compile using the actual filename',

          instructions:
              'Replace main.cpp with the exact filename shown in the directory listing.',

          command: 'g++ main.cpp -o main.exe',

          expectedOutput:
              'G++ compiles the source file and creates main.exe if the source code is valid.'
        },
        {
          title: 'Check the source file path',

          instructions:
              'If the source file is in another directory, navigate to that directory with cd or provide the correct relative or absolute path.'
        }
      ],

      sources: [sourceCatalog.gccInvocation, sourceCatalog.gccOptions]
    }
  },

  {
    id: 'windows-collect2-linker-failed',

    title: 'GCC collect2 reports that the linker returned an error',

    description:
        'The message \'collect2.exe: error: ld returned 1 exit status\' indicates that the linking stage failed. It is commonly a summary printed after a more specific linker diagnostic, so the actual cause is usually earlier in the build output.',

    errorPatterns: [
      'collect2.exe error ld returned 1 exit status',
      'collect2: error: ld returned 1 exit status', 'ld returned 1 exit status',
      'collect2 error', 'linker returned 1 exit status', 'gcc linker failed',
      'g++ linker failed'
    ],

    os: 'WINDOWS',
    language: 'C++',
    severity: 'MEDIUM',

    solution: {
      title: 'Find and fix the original linker diagnostic',

      description:
          'Do not treat the collect2 message as the root cause. Inspect the preceding output for the first specific linker error, correct that issue, and rebuild.',

      verification:
          'Run the corrected build command again. A successful link should finish without the collect2 failure message and should produce the executable.',

      steps: [
        {
          title: 'Read the output above the collect2 message',

          instructions:
              'Scroll upward in the terminal. Look for the first specific error before the final collect2 message. Common examples include undefined reference, multiple definition, cannot find a library, or an incompatible object file.'
        },
        {
          title: 'Identify the underlying error',

          instructions:
              'If the output says undefined reference, check missing function definitions, source files, and libraries. If it says multiple definition, look for duplicate symbols. If it says cannot find a library, check the library installation and linker configuration.'
        },
        {
          title: 'Correct the underlying problem',

          instructions:
              'Fix the first meaningful linker diagnostic rather than adding random linker flags or suppressing the error.'
        },
        {
          title: 'Rebuild the complete program',

          instructions:
              'Run the full build command again, including all required source files and libraries.',

          command: 'g++ main.cpp helper.cpp -o app.exe',

          expectedOutput:
              'The build completes without the original linker error. This example assumes your project contains main.cpp and helper.cpp.'
        }
      ],

      sources: [sourceCatalog.gnuLinker, sourceCatalog.gccInvocation]
    }
  },

  {
    id: 'windows-vscode-cpp-compiler-not-found',

    title: 'VS Code cannot find a C++ compiler',

    description:
        'The VS Code C/C++ extension cannot detect or use a suitable compiler. Installing the extension alone does not install G++, GCC, or the Microsoft C++ compiler.',

    errorPatterns: [
      'vscode cannot find compiler', 'no compiler found',
      'no c++ compiler detected', 'compiler not found in vscode',
      'unable to find compiler', 'c++ compiler is not installed',
      'vscode g++ not detected', 'configure a compiler',
      'compiler path not found'
    ],

    os: 'WINDOWS',
    language: 'VS Code',
    severity: 'MEDIUM',

    solution:
        {
          title: 'Install a compiler and configure VS Code',

          description:
              'Install a C++ compiler separately from VS Code, verify that it works in the terminal, and select the correct executable in the C/C++ extension.',

          verification:
              'Run g++ --version in a new terminal and verify that VS Code\'s IntelliSense configuration uses the same compiler.',

          steps: [
            {
              title:
                  'Understand the distinction between VS Code and a compiler',

              instructions:
                  'The Microsoft C/C++ extension provides editing, IntelliSense, and debugging support. It does not itself provide the compiler or debugger.'
            },
            {
              title: 'Install a compiler',

              instructions:
                  'For a GCC-based Windows setup, install MSYS2 and its UCRT64 GCC toolchain using the official MSYS2 instructions.'
            },
            {
              title: 'Verify the compiler installation',

              instructions:
                  'Open the MSYS2 UCRT64 terminal and run the compiler version command.',

              command: 'g++ --version',

              expectedOutput: 'The terminal displays the installed G++ version.'
            },
            {
              title: 'Configure VS Code IntelliSense',

              instructions:
                  'Open the VS Code Command Palette using Ctrl+Shift+P. Run C/C++: Edit Configurations (UI) and select the installed G++ executable as the compiler path.'
            },
            {
              title: 'Verify the compiler from PowerShell',

              instructions: 'If you want to use G++ directly from PowerShell, make sure the compiler\'s bin directory is included in Windows PATH. Open a new terminal after changing PATH.',

              command: 'g++ --version',

              expectedOutput: 'PowerShell displays the compiler version.'
            }
          ],

          sources: [
            sourceCatalog.vscodeCpp, sourceCatalog.vscodeIntelliSense,
            sourceCatalog.msys2
          ]
        }
  },

  {
    id: 'windows-cpp-executable-not-generated',

    title: 'C++ executable is missing after compilation',

    description:
        'The expected .exe file cannot be found or run after attempting to compile a C++ program. The build may have failed, the output may have been written to another location, or the executable name or working directory may be incorrect.',

    errorPatterns: [
      'exe not generated', 'executable not generated', 'cpp executable missing',
      'main.exe not found', 'cannot run executable',
      'the system cannot find the file specified',
      'compiled program exe missing', 'g++ did not create exe',
      'program builds but cannot run'
    ],

    os: 'WINDOWS',
    language: 'C++',
    severity: 'MEDIUM',

    solution: {
      title: 'Check the build result, output filename, and working directory',

      description:
          'Confirm that compilation succeeded, identify the output path specified by the compiler command, and run the executable from the correct directory.',

      verification:
          'After a successful build, confirm that main.exe exists and run it from PowerShell.',

      steps: [
        {
          title: 'Check for compilation errors',

          instructions:
              'Look at the compiler output before trying to run the program. If compilation or linking failed, the executable may not have been generated. Fix the first reported error.'
        },
        {
          title: 'Compile with an explicit output name',

          instructions: 'Use the -o option to specify the executable filename.',

          command: 'g++ main.cpp -o main.exe',

          expectedOutput:
              'If compilation and linking succeed, G++ creates main.exe in the current working directory.'
        },
        {
          title: 'Check whether the executable exists',

          instructions:
              'List the expected executable in the current directory.',

          command: 'Get-ChildItem main.exe',

          expectedOutput: 'PowerShell displays the main.exe file if it exists.'
        },
        {
          title: 'Check the output directory',

          instructions:
              'If your build command or VS Code task specifies a different output path, navigate to that location or use the complete path to the executable.'
        },
        {
          title: 'Run the executable',

          instructions:
              'From the directory containing main.exe, run the program using PowerShell\'s current-directory execution syntax.',

          command: '.\\main.exe',

          expectedOutput:
              'The compiled program starts. Its displayed output depends on your C++ source code.'
        }
      ],

      sources: [sourceCatalog.gccOptions, sourceCatalog.gccInvocation]
    }
  }
];

async function main() {
  // Remove the old temporary database-search test record, if it exists.
  await prisma.issue.deleteMany({where: {id: 'devsetup-search-test'}});

  let createdOrUpdated = 0;

  for (const issue of issueSeeds) {
    await prisma.issue.upsert({
      where: {id: issue.id},

      update: {
        title: issue.title,
        description: issue.description,
        errorPatterns: issue.errorPatterns,
        os: issue.os,
        language: issue.language,
        severity: issue.severity
      },

      create: {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        errorPatterns: issue.errorPatterns,
        os: issue.os,
        language: issue.language,
        severity: issue.severity,

        solutions: {
          create: [{
            title: issue.solution.title,
            description: issue.solution.description,
            verification: issue.solution.verification,

            steps: {
              create: issue.solution.steps.map(
                  (step, index) => ({
                    order: index + 1,
                    title: step.title,
                    instructions: step.instructions,
                    command: step.command ?? null,
                    expectedOutput: step.expectedOutput ?? null
                  }))
            },

            sources: {
              create: issue.solution.sources.map(
                  source => ({
                    title: source.title,
                    url: source.url,
                    publisher: source.publisher,
                    sourceVersion: source.sourceVersion ?? null
                  }))
            }
          }]
        }
      }
    });

    createdOrUpdated++;

    console.log(`Processed: ${issue.title}`);
  }

  console.log('');
  console.log(`Successfully processed ${
      createdOrUpdated} C++ troubleshooting entries.`);
  console.log(
      'Existing solutions were preserved when an issue already existed.');
}

main()
    .catch(error => {
      console.error('Database seeding failed:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
