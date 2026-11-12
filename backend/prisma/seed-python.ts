
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

const sources = {
  pythonWindows: {
    title: 'Using Python on Windows',
    url: 'https://docs.python.org/3/using/windows.html',
    publisher: 'Python Software Foundation',
    sourceVersion: 'Python documentation'
  },

  pythonDownloads: {
    title: 'Python Downloads',
    url: 'https://www.python.org/downloads/',
    publisher: 'Python Software Foundation'
  },

  pythonVenv: {
    title: 'Creating Virtual Environments',
    url: 'https://docs.python.org/3/library/venv.html',
    publisher: 'Python Software Foundation'
  },

  pythonEnsurepip: {
    title: 'Bootstrapping pip with ensurepip',
    url: 'https://docs.python.org/3/library/ensurepip.html',
    publisher: 'Python Software Foundation'
  },

  pipInstall: {
    title: 'pip install documentation',
    url: 'https://pip.pypa.io/en/stable/cli/pip_install/',
    publisher: 'Python Packaging Authority'
  },

  pipGuide: {
    title: 'pip User Guide',
    url: 'https://pip.pypa.io/en/stable/user_guide/',
    publisher: 'Python Packaging Authority'
  },

  vscodePython: {
    title: 'Python in Visual Studio Code',
    url: 'https://code.visualstudio.com/docs/languages/python',
    publisher: 'Microsoft'
  },

  vscodeTutorial: {
    title: 'Getting Started with Python in VS Code',
    url: 'https://code.visualstudio.com/docs/python/python-tutorial',
    publisher: 'Microsoft'
  },

  vscodeEnvironments: {
    title: 'Python Environments in VS Code',
    url: 'https://code.visualstudio.com/docs/python/environments',
    publisher: 'Microsoft'
  }
};

const issueSeeds: IssueSeed[] =
    [
      {
        id: 'windows-python-not-recognized',
        title: 'Python is not recognized by Windows',

        description:
            'Windows cannot find the Python command. Python may not be installed, its command aliases may be disabled, or the required directory may not be available through PATH.',

        errorPatterns: [
          'python is not recognized as an internal or external command',
          'python was not found', 'python command not found',
          'python is not recognized', 'python not recognized',
          'python is not installed'
        ],

        os: 'WINDOWS',
        language: 'Python',
        severity: 'HIGH',

        solution: {
          title: 'Install Python or repair its command configuration',

          description:
              'First check whether the Python launcher works. If it does, the problem may be limited to the python command alias. Otherwise, check the Python installation and Windows command configuration.',

          steps: [
            {
              title: 'Check whether the Python launcher works',

              instructions:
                  'Open a new terminal in PowerShell and check whether the Python launcher can find an installed runtime.',

              command: 'py --version',

              expectedOutput:
                  'A Python version should appear, for example Python 3.x. If py is also not recognized, continue to the installation step.'
            },
            {
              title: 'Install Python if it is missing',

              instructions:
                  'Visit the official Python downloads page. Install the Python install manager or an appropriate Python distribution. Follow the installation prompts and allow the required command configuration to be installed.',

              expectedOutput:
                  'Python should be installed and available through the Python commands.'
            },
            {
              title: 'Check Windows app execution aliases',

              instructions:
                  'Open Windows Settings and search for Manage app execution aliases. Check that the Python default aliases are enabled. The Python documentation also recommends checking that the WindowsApps directory is present in your user PATH when the commands do not work.'
            },
            {
              title: 'Restart the terminal and verify',

              instructions:
                  'Close existing terminal windows, open a new PowerShell terminal, and test both commands.',

              command: 'python --version\npy --version',

              expectedOutput:
                  'Both commands should display a Python version when their corresponding commands are configured.'
            }
          ],

          verification:
              'Run python --version and py --version in a newly opened terminal. Confirm that the commands launch the intended Python installation.',

          sources: [sources.pythonWindows, sources.pythonDownloads]
        }
      },

      {
        id: 'windows-pip-not-recognized',
        title: 'pip is not recognized by Windows',

        description:
            'The pip command cannot be found. Python may be installed correctly, but the pip executable directory might not be available through PATH.',

        errorPatterns: [
          'pip is not recognized as an internal or external command',
          'pip command not found', 'pip is not recognized',
          'pip not recognized', 'pip is not available'
        ],

        os: 'WINDOWS',
        language: 'Python',
        severity: 'MEDIUM',

        solution: {
          title: 'Run pip through the Python interpreter',

          description:
              'You do not need to call pip directly. Running pip as a Python module ensures that it is associated with the interpreter you selected.',

          steps: [
            {
              title: 'Check Python availability',

              instructions:
                  'Open PowerShell and confirm that Python is available.',

              command: 'py --version',

              expectedOutput:
                  'The installed Python version should be displayed.'
            },
            {
              title: 'Check pip through Python',

              instructions:
                  'Instead of running pip directly, use the Python launcher to execute pip.',

              command: 'py -m pip --version',

              expectedOutput:
                  'The output should display the installed pip version and its location.'
            },
            {
              title: 'Install a package using Python',

              instructions:
                  'Use the same approach whenever you install packages. Replace requests with the package you actually need.',

              command: 'py -m pip install requests',

              expectedOutput:
                  'pip should download and install the requested package if it is compatible with your Python version.'
            },
            {
              title: 'Verify the installation',

              instructions:
                  'Check whether pip can locate the installed package.',

              command: 'py -m pip show requests',

              expectedOutput:
                  'Package information, including its version and installation location, should appear.'
            }
          ],

          verification:
              'Run py -m pip --version. If it works, you can continue using py -m pip instead of relying on the standalone pip command.',

          sources: [sources.pipInstall, sources.pipGuide]
        }
      },

      {
        id: 'windows-python-no-module-pip',
        title: 'No module named pip',

        description:
            'Python is installed, but the pip module is missing from the selected Python installation or virtual environment.',

        errorPatterns: [
          'no module named pip', 'no module named pip.__main__',
          'modulenotfounderror no module named pip', 'pip module not found'
        ],

        os: 'WINDOWS',
        language: 'Python',
        severity: 'MEDIUM',

        solution: {
          title: 'Restore pip using ensurepip',

          description:
              'Python includes ensurepip, which can bootstrap pip into an existing installation or virtual environment.',

          steps: [
            {
              title: 'Check the Python installation',

              instructions: 'Open PowerShell and check the Python version.',

              command: 'py --version',

              expectedOutput: 'The installed Python version should appear.'
            },
            {
              title: 'Install pip using ensurepip',

              instructions:
                  'Run Python\'s built-in ensurepip module to install pip if it is missing.',

              command: 'py -m ensurepip --upgrade',

              expectedOutput:
                  'The command should install or upgrade pip using the bundled components.'
            },
            {
              title: 'Check pip',

              instructions:
                  'Run pip through Python to verify that it is available.',

              command: 'py -m pip --version',

              expectedOutput:
                  'The installed pip version and its location should appear.'
            },
            {
              title: 'Upgrade pip if necessary',

              instructions:
                  'Once pip is available, upgrade it using the official pip installation command.',

              command: 'py -m pip install --upgrade pip',

              expectedOutput:
                  'pip should complete its upgrade if the package index is accessible.'
            }
          ],

          verification:
              'Run py -m pip --version. If pip still cannot be imported, check whether you are invoking the intended Python installation.',

          sources: [sources.pythonEnsurepip, sources.pipInstall]
        }
      },

      {
        id: 'windows-python-module-not-found',
        title: 'ModuleNotFoundError: No module named ...',

        description:
            'Python cannot import a package because it is not installed in the interpreter currently running the program, or the wrong environment is selected.',

        errorPatterns: [
          'modulenotfounderror no module named', 'no module named',
          'module not found', 'importerror no module named'
        ],

        os: 'WINDOWS',
        language: 'Python',
        severity: 'MEDIUM',

        solution: {
          title: 'Install the package in the correct Python environment',

          description:
              'Python packages are installed into particular environments. Installing a package into one interpreter does not automatically make it available to another interpreter.',

          steps: [
            {
              title: 'Identify the missing module',

              instructions:
                  'Read the error message and identify the missing module name. For example, if the error says No module named requests, the package name is requests.'
            },
            {
              title: 'Check which Python is running',

              instructions:
                  'Run this command in the same terminal where you normally run your program.',

              command: 'python -c "import sys; print(sys.executable)"',

              expectedOutput:
                  'The full path of the Python interpreter currently being used should appear.'
            },
            {
              title: 'Install the missing package',

              instructions:
                  'Replace requests with the actual package name from your error message. Run the command using the same environment as your program.',

              command: 'python -m pip install requests',

              expectedOutput:
                  'pip should report that the package was successfully installed, or that it is already installed.'
            },
            {
              title: 'Test the import',

              instructions:
                  'Try importing the package using the same interpreter.',

              command:
                  'python -c "import requests; print(\'Import successful\')"',

              expectedOutput: 'Import successful'
            },
            {
              title: 'Check the VS Code interpreter if the error remains',

              instructions:
                  'If you are running the file in VS Code, use Python: Select Interpreter from the Command Palette. Select the environment into which you installed the package.'
            }
          ],

          verification:
              'Run the import test using the same Python executable that runs your application. The import should complete without ModuleNotFoundError.',

          sources: [
            sources.pipInstall, sources.vscodeEnvironments, sources.vscodePython
          ]
        }
      },

      {
        id: 'windows-python-venv-not-found',
        title: 'No module named venv',

        description:
            'Python cannot import the venv module. The selected Python installation may be incomplete or may not include the standard virtual environment components.',

        errorPatterns: [
          'no module named venv', 'modulenotfounderror no module named venv',
          'no module named venv.__main__', 'python venv module not found'
        ],

        os: 'WINDOWS',
        language: 'Python',
        severity: 'MEDIUM',

        solution: {
          title: 'Check and repair the Python installation',

          description:
              'The venv module is part of Python\'s standard library. If it cannot be imported, first confirm which interpreter is being used.',

          steps: [
            {
              title: 'Identify the active interpreter',

              instructions: 'Check which Python executable is running.',

              command: 'py -c "import sys; print(sys.executable)"',

              expectedOutput:
                  'The full path to the Python executable should appear.'
            },
            {
              title: 'Test whether venv is available',

              instructions:
                  'Ask Python to import the virtual environment module.',

              command: 'py -m venv --help',

              expectedOutput:
                  'Python should display the venv command usage information.'
            },
            {
              title: 'Check the Python installation',

              instructions:
                  'If the module is still missing, inspect the Python installation. If you installed a minimal or incomplete distribution, use the appropriate full Python installation and ensure you are using that interpreter.'
            },
            {
              title: 'Create a virtual environment',

              instructions:
                  'After confirming that venv is available, create a virtual environment in your project folder.',

              command: 'py -m venv .venv',

              expectedOutput:
                  'A .venv folder should be created in your current project directory.'
            }
          ],

          verification:
              'Run py -m venv --help and then create a test environment. Confirm that the .venv directory is created.',

          sources: [sources.pythonVenv, sources.pythonWindows]
        }
      },

      {
        id: 'windows-venv-powershell-activation-blocked',
        title: 'PowerShell cannot run Activate.ps1',

        description:
            'PowerShell blocks the virtual environment activation script because of its script execution policy.',

        errorPatterns: [
          'running scripts is disabled on this system',
          'activate.ps1 cannot be loaded',
          'cannot be loaded because running scripts is disabled',
          'ps1 script execution disabled',
          'activate ps1 is not digitally signed'
        ],

        os: 'WINDOWS',
        language: 'Python',
        severity: 'MEDIUM',

        solution: {
          title: 'Use an alternative activation method',

          description:
              'Virtual environments do not strictly require activation. You can use their Python executable directly or activate them through Command Prompt.',

          steps: [
            {
              title: 'Confirm that the virtual environment exists',

              instructions:
                  'Open your project folder and check that the .venv directory exists. It should contain a Scripts folder.',

              command: 'Get-ChildItem .venv\\Scripts',

              expectedOutput:
                  'The Scripts folder should contain Python and activation files.'
            },
            {
              title: 'Use the virtual environment without activation',

              instructions:
                  'You can run Python directly from the environment. This avoids PowerShell script activation entirely.',

              command: '.\\.venv\\Scripts\\python.exe --version',

              expectedOutput:
                  'The Python version belonging to the virtual environment should appear.'
            },
            {
              title: 'Install a package into this environment',

              instructions:
                  'Use the environment\'s own Python executable to install packages.',

              command: '.\\.venv\\Scripts\\python.exe -m pip install requests',

              expectedOutput:
                  'The package should be installed into the .venv environment.'
            },
            {
              title: 'Alternatively use Command Prompt',

              instructions: 'Open Command Prompt in the project directory instead of PowerShell. Activate the environment using the Windows batch activation script.',

              command: '.venv\\Scripts\\activate.bat',

              expectedOutput:
                  'The command prompt should show the virtual environment name in its prompt.'
            }
          ],

          verification:
              'Run .\\.venv\\Scripts\\python.exe -c "import sys; print(sys.prefix != sys.base_prefix)" in PowerShell. The result should be True.',

          sources: [sources.pythonVenv]
        }
      },

      {
        id: 'windows-vscode-python-interpreter-not-selected',
        title: 'VS Code cannot find or select a Python interpreter',

        description:
            'VS Code does not detect the expected Python installation or virtual environment, or no Python interpreter has been selected for the workspace.',

        errorPatterns: [
          'no python interpreter selected', 'interpreter not found',
          'python interpreter not found', 'could not find python interpreter',
          'python environment not detected', 'select python interpreter'
        ],

        os: 'WINDOWS',
        language: 'VS Code',
        severity: 'MEDIUM',

        solution: {
          title: 'Select or refresh the Python interpreter in VS Code',

          description:
              'VS Code uses the selected interpreter for running, debugging, IntelliSense, and other Python language features.',

          steps: [
            {
              title: 'Check that Python is installed',

              instructions:
                  'Open a VS Code terminal and check whether Python is available.',

              command: 'py --version',

              expectedOutput: 'The installed Python version should appear.'
            },
            {
              title: 'Install the Python extension',

              instructions:
                  'Open the Extensions panel in VS Code and search for Python. Install the Python extension published by Microsoft if it is missing.'
            },
            {
              title: 'Select a Python interpreter',

              instructions:
                  'Press Ctrl + Shift + P to open the Command Palette. Search for Python: Select Interpreter. Choose the Python installation or virtual environment that belongs to your project.'
            },
            {
              title: 'Refresh environment discovery',

              instructions:
                  'If your environment is still missing, open the Command Palette and run Python Environments: Refresh All Environment Managers, if that command is available in your installed environment extension.'
            },
            {
              title: 'Verify the selected interpreter',

              instructions:
                  'Open a new VS Code terminal and inspect the executable being used.',

              command: 'python -c "import sys; print(sys.executable)"',

              expectedOutput:
                  'The path should point to the interpreter you selected.'
            }
          ],

          verification:
              'Confirm that the correct Python environment appears in the VS Code status bar and that the Python executable path matches your intended environment.',

          sources: [
            sources.vscodePython, sources.vscodeEnvironments,
            sources.vscodeTutorial
          ]
        }
      },

      {
        id: 'windows-python-requirements-file-not-found',
        title: 'Could not open requirements.txt',

        description:
            'pip cannot locate requirements.txt because the terminal is in a different directory or the file does not exist at the specified path.',

        errorPatterns: [
          'could not open requirements file',
          'no such file or directory requirements.txt',
          'requirements.txt not found', 'file not found requirements.txt',
          'cannot open requirements.txt'
        ],

        os: 'WINDOWS',
        language: 'Python',
        severity: 'LOW',

        solution: {
          title: 'Run pip from the correct project directory',

          description:
              'The requirements file must exist at the path supplied to pip. Check your current working directory before installing dependencies.',

          steps: [
            {
              title: 'Check the current directory',

              instructions:
                  'Run this command to see the folder in which your terminal is currently operating.',

              command: 'Get-Location',

              expectedOutput:
                  'PowerShell should display the current directory path.'
            },
            {
              title: 'List the files in the current folder',

              instructions: 'Check whether requirements.txt is present.',

              command: 'Get-ChildItem',

              expectedOutput:
                  'The output should list the files and folders in your current directory.'
            },
            {
              title: 'Navigate to the project folder',

              instructions:
                  'If requirements.txt is inside another folder, navigate to that folder. Replace the example path with your actual project location.',

              command: 'cd C:\\path\\to\\your\\project',

              expectedOutput:
                  'The terminal should now be inside your project directory.'
            },
            {
              title: 'Install the requirements',

              instructions:
                  'Run pip using Python after confirming that requirements.txt exists.',

              command: 'py -m pip install -r requirements.txt',

              expectedOutput:
                  'pip should read the requirements file and begin installing its listed packages.'
            }
          ],

          verification:
              'Confirm that requirements.txt exists in the directory and that pip can read it without reporting a file-not-found error.',

          sources: [sources.pipInstall, sources.pipGuide]
        }
      },

      {
        id: 'windows-python-pip-permission-denied',
        title: 'Permission denied while installing Python packages',

        description:
            'pip cannot write to the selected installation directory because the current user does not have the required permissions.',

        errorPatterns: [
          'permission denied', 'access is denied', 'access denied',
          'could not install packages due to an os error',
          'winerror 5 access is denied'
        ],

        os: 'WINDOWS',
        language: 'Python',
        severity: 'MEDIUM',

        solution: {
          title: 'Install packages inside a project virtual environment',

          description:
              'A project-specific virtual environment keeps packages separate from the global Python installation and normally avoids the need for administrator permissions.',

          steps: [
            {
              title: 'Open the project directory',

              instructions:
                  'Open PowerShell in the folder containing your Python project.'
            },
            {
              title: 'Create a virtual environment',

              instructions:
                  'Create a local virtual environment for this project.',

              command: 'py -m venv .venv',

              expectedOutput:
                  'A .venv folder should be created in the project directory.'
            },
            {
              title: 'Install packages using the environment\'s Python',

              instructions:
                  'You do not need to activate the environment. Run pip through the Python executable inside .venv.',

              command: '.\\.venv\\Scripts\\python.exe -m pip install requests',

              expectedOutput:
                  'The package should install inside the project\'s virtual environment.'
            },
            {
              title: 'Check the package installation',

              instructions:
                  'Ask pip to show the package information using the same environment.',

              command: '.\\.venv\\Scripts\\python.exe -m pip show requests',

              expectedOutput:
                  'The package information and its location inside .venv should appear.'
            }
          ],

          verification:
              'Confirm that the package location belongs to your project\'s .venv directory. If access is still denied, inspect the exact directory and filesystem permissions rather than repeatedly retrying the same installation.',

          sources: [sources.pythonVenv, sources.pipInstall]
        }
      }
    ];

async function main() {
  let processed = 0;

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

    processed++;

    console.log(`Processed: ${issue.title}`);
  }

  console.log('');
  console.log(
      `Successfully processed ${processed} Python troubleshooting entries.`);
  console.log('Existing solutions were preserved for existing issue IDs.');
}

main()
    .catch(error => {
      console.error('Python database seeding failed:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
