import { prisma } from "../src/prisma.js";

type Severity = "LOW" | "MEDIUM" | "HIGH";

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

interface RawIssue {
  id: string;
  title: string;
  description: string;
  patterns: string[];
  language: string;
  severity: Severity;
  diagnose: string;
  diagnoseCommand?: string;
  diagnoseExpected?: string;
  fix: string;
  fixCommand?: string;
  fixExpected?: string;
  verify: string;
  verifyCommand?: string;
  verifyExpected?: string;
  category: keyof typeof sourceCatalog;
}

interface IssueSeed extends RawIssue {
  solution: {
    title: string;
    description: string;
    verification: string;
    steps: StepSeed[];
    sources: SourceSeed[];
  };
}

const sourceCatalog = {
  cpp: [
    { title: "MSYS2 Getting Started", url: "https://www.msys2.org/", publisher: "MSYS2" },
    { title: "VS Code C++ documentation", url: "https://code.visualstudio.com/docs/languages/cpp", publisher: "Microsoft" },
    { title: "GCC invocation documentation", url: "https://gcc.gnu.org/onlinedocs/gcc/Invoking-GCC.html", publisher: "GNU Project" },
    { title: "GNU linker documentation", url: "https://sourceware.org/binutils/docs/ld.html", publisher: "GNU Binutils" }
  ],
  python: [
    { title: "Using Python on Windows", url: "https://docs.python.org/3/using/windows.html", publisher: "Python Software Foundation" },
    { title: "Python virtual environments", url: "https://docs.python.org/3/library/venv.html", publisher: "Python Software Foundation" },
    { title: "pip user guide", url: "https://pip.pypa.io/en/stable/user_guide/", publisher: "Python Packaging Authority" },
    { title: "pip install reference", url: "https://pip.pypa.io/en/stable/cli/pip_install/", publisher: "Python Packaging Authority" }
  ],
  node: [
    { title: "Node.js download and installation", url: "https://nodejs.org/en/download", publisher: "OpenJS Foundation" },
    { title: "npm CLI documentation", url: "https://docs.npmjs.com/cli/v11/commands/npm-install", publisher: "npm" },
    { title: "npm package.json documentation", url: "https://docs.npmjs.com/cli/v11/configuring-npm/package-json", publisher: "npm" },
    { title: "Vite troubleshooting", url: "https://vite.dev/guide/troubleshooting", publisher: "Vite" },
    { title: "React installation", url: "https://react.dev/learn/installation", publisher: "React" }
  ],
  java: [
    { title: "Getting started with Java", url: "https://dev.java/learn/getting-started/", publisher: "Oracle" },
    { title: "The javac command", url: "https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html", publisher: "Oracle" },
    { title: "The java command", url: "https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html", publisher: "Oracle" },
    { title: "Maven installation", url: "https://maven.apache.org/install", publisher: "Apache Maven" },
    { title: "Maven getting started", url: "https://maven.apache.org/guides/getting-started/", publisher: "Apache Maven" }
  ],
  rust: [
    { title: "Install Rust", url: "https://rust-lang.org/tools/install/", publisher: "Rust Project" },
    { title: "Rustup installation on Windows", url: "https://rust-lang.github.io/rustup/installation/windows.html", publisher: "Rust Project" },
    { title: "Cargo build", url: "https://doc.rust-lang.org/cargo/commands/cargo-build.html", publisher: "Rust Project" },
    { title: "Cargo dependencies", url: "https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html", publisher: "Rust Project" }
  ],
  vscode: [
    { title: "VS Code integrated terminal", url: "https://code.visualstudio.com/docs/terminal/basics", publisher: "Microsoft" },
    { title: "VS Code terminal troubleshooting", url: "https://code.visualstudio.com/docs/supporting/troubleshoot-terminal-launch", publisher: "Microsoft" },
    { title: "VS Code extensions", url: "https://code.visualstudio.com/docs/editor/extension-marketplace", publisher: "Microsoft" },
    { title: "C++ IntelliSense configuration", url: "https://code.visualstudio.com/docs/cpp/configure-intellisense", publisher: "Microsoft" },
    { title: "Python environments in VS Code", url: "https://code.visualstudio.com/docs/python/environments", publisher: "Microsoft" }
  ]
};

const rawIssues: RawIssue[] = [
  // C++ / GCC / MinGW / MSYS2 — 15
  {
    id: "windows-gpp-not-recognized", title: "g++ is not recognized by Windows",
    description: "Windows cannot find the g++ compiler command. The compiler may be missing or its bin directory may not be on PATH.",
    patterns: ["g++ is not recognized as an internal or external command", "g++ not recognized", "g++ command not found"],
    language: "C++", severity: "HIGH", category: "cpp",
    diagnose: "Check whether the compiler can be located in this terminal. If the command is missing, inspect the compiler installation and PATH.",
    diagnoseCommand: "where.exe g++", diagnoseExpected: "A path to g++.exe. If Windows reports that it cannot find the file, continue with the installation/PATH checks.",
    fix: "For a fresh Windows setup, install the MSYS2 UCRT64 toolchain from the official MSYS2 instructions. Add the actual UCRT64 bin directory to the user PATH; the default location is C:\\msys64\\ucrt64\\bin. Reopen terminals afterwards.",
    fixCommand: "pacman -S --needed base-devel mingw-w64-ucrt-x86_64-toolchain",
    fixExpected: "MSYS2 installs the compiler toolchain. Run this inside the UCRT64 MSYS2 terminal, not ordinary PowerShell.",
    verify: "Open a new PowerShell terminal and confirm that the compiler responds.",
    verifyCommand: "g++ --version", verifyExpected: "The installed GCC version is displayed."
  },
  {
    id: "windows-gcc-not-recognized", title: "gcc is not recognized by Windows",
    description: "The GCC C compiler executable is unavailable in the current terminal PATH.",
    patterns: ["gcc is not recognized as an internal or external command", "gcc not recognized", "gcc command not found"],
    language: "C++", severity: "HIGH", category: "cpp",
    diagnose: "Check whether Windows can locate gcc.exe.",
    diagnoseCommand: "where.exe gcc", diagnoseExpected: "A full path to gcc.exe, or a message that no matching file was found.",
    fix: "Install the GCC toolchain in the MSYS2 UCRT64 environment, then add its bin directory to the Windows user PATH. Do not add a directory from a different MSYS2 environment by mistake.",
    fixCommand: "pacman -S --needed mingw-w64-ucrt-x86_64-gcc",
    fixExpected: "The GCC package is installed in the UCRT64 environment.",
    verify: "Open a fresh terminal and check the compiler version.",
    verifyCommand: "gcc --version", verifyExpected: "GCC version information appears."
  },
  {
    id: "windows-cpp-undefined-reference", title: "C++ undefined reference linker error",
    description: "Compilation reached the linker, but a referenced function or symbol could not be found in the object files or linked libraries.",
    patterns: ["undefined reference to", "undefined reference", "ld returned 1 exit status"],
    language: "C++", severity: "HIGH", category: "cpp",
    diagnose: "Read the first undefined-reference line. Check whether the function has a definition, whether its source file is included in the build, and whether the signature matches exactly.",
    diagnoseCommand: "g++ -Wall -Wextra -c main.cpp",
    diagnoseExpected: "This compiles main.cpp to an object file. A linker error will not normally occur at this compile-only stage.",
    fix: "Compile and link every required implementation file together. Replace the example filenames with the actual files in your project.",
    fixCommand: "g++ main.cpp helper.cpp -o app.exe",
    fixExpected: "A successful build creates app.exe. If the function is in a library, add the correct library and library path.",
    verify: "Run the generated executable after a successful link.",
    verifyCommand: ".\\app.exe", verifyExpected: "The program starts and produces its expected output."
  },
  {
    id: "windows-cpp-iostream-not-found", title: "C++ cannot find iostream",
    description: "The compiler cannot locate the standard C++ header iostream, often because the wrong compiler or incomplete toolchain is being used.",
    patterns: ["iostream no such file or directory", "cannot open source file iostream", "fatal error iostream"],
    language: "C++", severity: "HIGH", category: "cpp",
    diagnose: "Check which compiler executable is being used and whether it is a C++ compiler.",
    diagnoseCommand: "where.exe g++",
    diagnoseExpected: "The path should point to the intended GCC C++ compiler.",
    fix: "Install or repair the C++ toolchain for the compiler you intend to use. With MSYS2 UCRT64, install the complete toolchain from its UCRT64 terminal.",
    fixCommand: "pacman -S --needed base-devel mingw-w64-ucrt-x86_64-toolchain",
    fixExpected: "The C++ compiler and standard library development files are installed.",
    verify: "Compile a minimal source file that includes iostream.",
    verifyCommand: "g++ -std=c++20 -Wall -Wextra main.cpp -o app.exe",
    verifyExpected: "The file compiles without an iostream header error, assuming main.cpp contains a valid program."
  },
  {
    id: "windows-cpp-multiple-definition", title: "C++ multiple definition linker error",
    description: "The linker found more than one definition of the same symbol, commonly because a non-inline function or global variable is defined in multiple translation units.",
    patterns: ["multiple definition of", "multiple definition", "already defined"],
    language: "C++", severity: "HIGH", category: "cpp",
    diagnose: "Find the symbol named in the first linker error and search for every definition. Header files should generally contain declarations, not repeated non-inline definitions.",
    diagnoseCommand: "Select-String -Path *.cpp,*.h,*.hpp -Pattern 'main\\s*\\('",
    diagnoseExpected: "The search helps locate declarations/definitions; inspect matches manually to distinguish declarations from definitions.",
    fix: "Keep one definition of each non-inline function/global variable. Put declarations in headers and the single implementation in one source file. Use inline appropriately for definitions intended to appear in multiple translation units.",
    fixCommand: "g++ main.cpp helper.cpp -o app.exe",
    fixExpected: "The linker should complete when duplicate definitions have been removed.",
    verify: "Rebuild the full project and confirm the duplicate-symbol message is gone.",
    verifyCommand: "g++ -Wall -Wextra main.cpp helper.cpp -o app.exe",
    verifyExpected: "A successful link produces app.exe."
  },
  {
    id: "windows-vscode-cpp-header-not-found", title: "VS Code cannot open C++ source/header file",
    description: "The C/C++ extension's IntelliSense configuration cannot locate a header. This may be an editor configuration issue rather than a compiler failure.",
    patterns: ["cannot open source file", "include errors detected", "cannot find header file"],
    language: "VS Code", severity: "MEDIUM", category: "cpp",
    diagnose: "Check whether the same file compiles from the terminal. If it compiles, focus on IntelliSense configuration rather than changing working source code.",
    diagnoseCommand: "g++ -std=c++20 -fsyntax-only main.cpp",
    diagnoseExpected: "No output means the compiler accepted the translation unit. A compiler error means the issue is not limited to IntelliSense.",
    fix: "In VS Code run C/C++: Select IntelliSense Configuration and choose the compiler actually used by the project. Check compilerPath and includePath in c_cpp_properties.json.",
    fixExpected: "The selected IntelliSense configuration should match the real compiler and its include directories.",
    verify: "Reload the VS Code window and check whether the include warning disappears.",
    verifyCommand: "g++ --version", verifyExpected: "The terminal compiler and selected IntelliSense compiler should refer to the same toolchain."
  },
  {
    id: "windows-gpp-no-input-files", title: "g++ fatal error: no input files",
    description: "The compiler was launched without a source file argument, or the build task did not pass the active file path.",
    patterns: ["g++ fatal error no input files", "fatal error: no input files"],
    language: "C++", severity: "LOW", category: "cpp",
    diagnose: "Check the current folder and confirm the source file exists.",
    diagnoseCommand: "Get-ChildItem *.cpp",
    diagnoseExpected: "The command lists C++ source files in the current directory.",
    fix: "Pass the source filename explicitly to g++. If the file is elsewhere, use its correct relative or absolute path.",
    fixCommand: "g++ .\\main.cpp -o .\\main.exe",
    fixExpected: "The compiler receives main.cpp as an input file.",
    verify: "Run the generated executable after a successful compilation.",
    verifyCommand: ".\\main.exe", verifyExpected: "The application starts."
  },
  {
    id: "windows-collect2-linker-failed", title: "collect2.exe: error: ld returned 1 exit status",
    description: "The GCC linker failed. This is a summary line; the actual cause is usually reported in earlier linker output.",
    patterns: ["collect2.exe error ld returned 1 exit status", "ld returned 1 exit status", "collect2 error"],
    language: "C++", severity: "HIGH", category: "cpp",
    diagnose: "Read upward to the first specific linker error. Common causes include undefined references, duplicate definitions, missing libraries, or incompatible object files.",
    diagnoseCommand: "g++ -Wall -Wextra main.cpp -o app.exe",
    diagnoseExpected: "The diagnostic output should show the specific unresolved symbol or other linker cause before the collect2 summary.",
    fix: "Fix the first specific linker error rather than treating the collect2 line as the root cause. Include required source files and libraries in the link command.",
    fixCommand: "g++ main.cpp helper.cpp -o app.exe",
    fixExpected: "The command links both example source files if those are the required implementations.",
    verify: "Rebuild and confirm the linker exits successfully.",
    verifyCommand: "g++ main.cpp helper.cpp -o app.exe",
    verifyExpected: "No linker error; app.exe is generated."
  },
  {
    id: "windows-vscode-cpp-compiler-not-found", title: "VS Code cannot find a C++ compiler",
    description: "The C/C++ extension cannot detect a compiler or the configured compiler path is invalid.",
    patterns: ["compiler not found", "no compiler detected", "could not find compiler", "unable to locate compiler"],
    language: "VS Code", severity: "HIGH", category: "cpp",
    diagnose: "Check whether a compiler is installed and discoverable from the terminal.",
    diagnoseCommand: "where.exe g++",
    diagnoseExpected: "A valid path to g++.exe should be returned.",
    fix: "Install a compiler such as the MSYS2 UCRT64 toolchain, then use C/C++: Select IntelliSense Configuration to select it.",
    fixCommand: "pacman -S --needed base-devel mingw-w64-ucrt-x86_64-toolchain",
    fixExpected: "The toolchain is installed when run inside the appropriate MSYS2 terminal.",
    verify: "Check the compiler version in a new terminal and confirm VS Code's compilerPath points to that same executable.",
    verifyCommand: "g++ --version", verifyExpected: "GCC version information appears."
  },
  {
    id: "windows-cpp-executable-not-generated", title: "C++ executable was not generated",
    description: "The expected .exe file is missing after a build attempt. Compilation may have failed or the output path may differ.",
    patterns: ["exe not generated", "executable not generated", "no exe file after compile", "output file not found"],
    language: "C++", severity: "MEDIUM", category: "cpp",
    diagnose: "Check the compiler exit output and list executable files in the current directory.",
    diagnoseCommand: "Get-ChildItem *.exe",
    diagnoseExpected: "The command lists any executables in the current folder. No result means the expected file may be elsewhere or was not created.",
    fix: "Specify an explicit output filename and resolve all compiler/linker errors before expecting an executable.",
    fixCommand: "g++ main.cpp -o app.exe",
    fixExpected: "A successful build creates app.exe in the current directory.",
    verify: "Confirm the file exists and run it.",
    verifyCommand: "Test-Path .\\app.exe",
    verifyExpected: "True means the executable exists."
  },
  {
    id: "windows-cpp-cxx20-not-supported", title: "GCC does not recognize -std=c++20",
    description: "The selected compiler is too old to recognize the requested C++20 language-standard option, or a different compiler is being invoked than expected.",
    patterns: ["unrecognized command line option -std=c++20", "c++20 not supported", "unrecognized command line option"],
    language: "C++", severity: "HIGH", category: "cpp",
    diagnose: "Check the compiler version and the exact executable found by PATH.",
    diagnoseCommand: "g++ --version",
    diagnoseExpected: "The output identifies the GCC version. Older GCC installations may not support the requested standard flag.",
    fix: "Install a current GCC toolchain and ensure its bin directory appears before older compiler directories in PATH. Reopen the terminal after changing PATH.",
    fixCommand: "where.exe g++",
    fixExpected: "The first path should be the compiler installation you intend to use.",
    verify: "Compile a small C++20 source file with the requested standard.",
    verifyCommand: "g++ -std=c++20 -Wall -Wextra main.cpp -o app.exe",
    verifyExpected: "The compiler accepts the standard flag if the selected GCC version supports it."
  },
  {
    id: "windows-cpp-fatal-header-not-found", title: "C++ fatal error: header file not found",
    description: "The compiler cannot locate a requested header. The header may be misspelled, non-standard, or supplied by a library that is not installed/configured.",
    patterns: ["fatal error no such file or directory", "fatal error header file not found", "no such file or directory"],
    language: "C++", severity: "MEDIUM", category: "cpp",
    diagnose: "Identify whether the missing header belongs to the C++ standard library or an external dependency. Check spelling and capitalization.",
    diagnoseCommand: "g++ --version",
    diagnoseExpected: "Compiler information confirms which toolchain is being used.",
    fix: "For standard headers, repair/install the compiler toolchain. For third-party headers, install the library and add its include directory using the library's documented setup instructions.",
    fixCommand: "g++ -I .\\include main.cpp -o app.exe",
    fixExpected: "The -I option adds the example include directory; replace it with the actual header directory.",
    verify: "Recompile and confirm that the missing-header diagnostic disappears.",
    verifyCommand: "g++ -Wall -Wextra main.cpp -o app.exe",
    verifyExpected: "Compilation proceeds past the header lookup."
  },
  {
    id: "windows-cpp-cannot-find-library", title: "GCC cannot find a linked library",
    description: "The linker cannot locate a library requested with a -l option or the supplied library path.",
    patterns: ["cannot find -l", "cannot find library", "ld cannot find"],
    language: "C++", severity: "MEDIUM", category: "cpp",
    diagnose: "Check the exact library name, whether its development files are installed, and whether the library directory is known to the linker.",
    diagnoseCommand: "g++ --version",
    diagnoseExpected: "Confirms the compiler toolchain in use.",
    fix: "Install the library's development package for the same toolchain and architecture. Add its library directory with -L and link using the documented library name.",
    fixCommand: "g++ main.cpp -L .\\lib -lexample -o app.exe",
    fixExpected: "This is a template: replace example and .\\lib with the actual library name and directory.",
    verify: "Rebuild using the actual dependency and check that the linker resolves it.",
    verifyCommand: "g++ main.cpp -L .\\lib -lexample -o app.exe",
    verifyExpected: "A successful link creates app.exe."
  },
  {
    id: "windows-cpp-main-multiple-definition", title: "Multiple definition of main in C++",
    description: "More than one compiled source file defines the program entry point.",
    patterns: ["multiple definition of main", "multiple definition of `main'"],
    language: "C++", severity: "MEDIUM", category: "cpp",
    diagnose: "Inspect all source files included in the build and identify which files define main(). A single executable normally has one entry point.",
    diagnoseCommand: "Select-String -Path *.cpp -Pattern 'int\\s+main\\s*\\('",
    diagnoseExpected: "The search lists likely main definitions in the current folder.",
    fix: "Build only the intended application source files. Move separate practice programs into separate targets rather than linking all files together.",
    fixCommand: "g++ main.cpp helper.cpp -o app.exe",
    fixExpected: "Only one source file in this command should define main().",
    verify: "Rebuild and check that the duplicate-main linker error is gone.",
    verifyCommand: "g++ main.cpp helper.cpp -o app.exe",
    verifyExpected: "The executable is linked successfully."
  },


  {
    id: "windows-cpp-expected-semicolon", title: "C++ compiler reports expected semicolon",
    description: "The compiler encountered a statement or declaration that appears to be missing a semicolon, or an earlier syntax issue confused the parser.",
    patterns: ["expected ; before", "expected semicolon", "expected ;", "expected primary expression before"],
    language: "C++", severity: "LOW", category: "cpp",
    diagnose: "Read the first syntax diagnostic and inspect the indicated line plus the line immediately before it. The true mistake can be earlier than the reported location.",
    diagnoseCommand: "g++ -fsyntax-only -Wall -Wextra main.cpp",
    diagnoseExpected: "The compiler reports syntax errors without producing an executable.",
    fix: "Add the missing semicolon after the relevant declaration or statement, or correct the earlier unmatched bracket/quote that caused the parser to lose track.",
    fixExpected: "The affected statement is syntactically complete.",
    verify: "Run the syntax-only compilation again.",
    verifyCommand: "g++ -std=c++20 -fsyntax-only -Wall -Wextra main.cpp",
    verifyExpected: "No output means the source passed this syntax check."
  },

  // Python / pip / virtual environments — 15
  {
    id: "windows-python-not-recognized", title: "Python is not recognized by Windows",
    description: "The python command is unavailable because Python is missing, its app execution alias is disabled, or its command path is not configured.",
    patterns: ["python is not recognized as an internal or external command", "python was not found", "python command not found"],
    language: "Python", severity: "HIGH", category: "python",
    diagnose: "Check both the Python launcher and the python command.",
    diagnoseCommand: "py --version",
    diagnoseExpected: "A Python version means the launcher can find a runtime. If py also fails, inspect the installation.",
    fix: "Install Python using the official Windows instructions. Check Manage app execution aliases and ensure the intended Python command is enabled. Restart terminals after installation.",
    fixExpected: "A configured Python runtime should be available from a new terminal.",
    verify: "Check the commands in a newly opened PowerShell window.",
    verifyCommand: "python --version; py --version",
    verifyExpected: "The configured commands display Python version information."
  },
  {
    id: "windows-pip-not-recognized", title: "pip is not recognized by Windows",
    description: "The pip executable is not on PATH, even though Python may be installed.",
    patterns: ["pip is not recognized as an internal or external command", "pip command not found", "pip not recognized"],
    language: "Python", severity: "MEDIUM", category: "python",
    diagnose: "Check pip through the selected Python interpreter instead of relying on the standalone command.",
    diagnoseCommand: "py -m pip --version",
    diagnoseExpected: "pip version and installation location should be displayed.",
    fix: "Use Python's module invocation for package operations. This avoids ambiguity between multiple Python installations.",
    fixCommand: "py -m pip install requests",
    fixExpected: "pip installs requests into the interpreter selected by py.",
    verify: "Ask pip to show the installed package.",
    verifyCommand: "py -m pip show requests",
    verifyExpected: "Package metadata and its installation location appear."
  },
  {
    id: "windows-python-no-module-pip", title: "No module named pip",
    description: "The selected Python installation does not currently have an importable pip module.",
    patterns: ["no module named pip", "no module named pip.__main__", "modulenotfounderror no module named pip"],
    language: "Python", severity: "MEDIUM", category: "python",
    diagnose: "Confirm which Python installation is being invoked.",
    diagnoseCommand: "py -c \"import sys; print(sys.executable)\"",
    diagnoseExpected: "The full interpreter path is printed.",
    fix: "Use Python's ensurepip module to bootstrap pip, where supported by that Python distribution.",
    fixCommand: "py -m ensurepip --upgrade",
    fixExpected: "ensurepip installs or upgrades pip using the components bundled with Python.",
    verify: "Check pip through the same launcher.",
    verifyCommand: "py -m pip --version",
    verifyExpected: "pip version information appears."
  },
  {
    id: "windows-python-module-not-found", title: "ModuleNotFoundError: No module named ...",
    description: "The program's active interpreter cannot import a package. It may be installed into another Python environment.",
    patterns: ["modulenotfounderror no module named", "no module named", "module not found"],
    language: "Python", severity: "MEDIUM", category: "python",
    diagnose: "Identify the missing import name and inspect the interpreter running the script.",
    diagnoseCommand: "python -c \"import sys; print(sys.executable)\"",
    diagnoseExpected: "The full path of the active interpreter is displayed.",
    fix: "Install the corresponding package using the same interpreter. Replace requests with the package matching the missing import; import names and package names are not always identical.",
    fixCommand: "python -m pip install requests",
    fixExpected: "pip installs the package into the active interpreter environment.",
    verify: "Test the import using the same interpreter.",
    verifyCommand: "python -c \"import requests; print('Import successful')\"",
    verifyExpected: "Import successful"
  },
  {
    id: "windows-python-venv-not-found", title: "No module named venv",
    description: "The selected Python distribution cannot import the standard venv module.",
    patterns: ["no module named venv", "modulenotfounderror no module named venv", "no module named venv.__main__"],
    language: "Python", severity: "MEDIUM", category: "python",
    diagnose: "Check the interpreter path and test the venv module.",
    diagnoseCommand: "py -m venv --help",
    diagnoseExpected: "Python displays venv usage information if the module is available.",
    fix: "Repair or install a full Python distribution if the standard venv module is missing. Then create the environment from the project directory.",
    fixCommand: "py -m venv .venv",
    fixExpected: "A .venv directory is created in the current project folder.",
    verify: "Check that the environment's Python executable exists.",
    verifyCommand: "Test-Path .\\.venv\\Scripts\\python.exe",
    verifyExpected: "True means the environment executable exists."
  },
  {
    id: "windows-venv-powershell-activation-blocked", title: "PowerShell blocks Activate.ps1",
    description: "PowerShell's script execution policy prevents the virtual environment activation script from running.",
    patterns: ["running scripts is disabled on this system", "activate.ps1 cannot be loaded", "ps1 script execution disabled"],
    language: "Python", severity: "MEDIUM", category: "python",
    diagnose: "Confirm the environment exists and that its Scripts directory contains the activation scripts.",
    diagnoseCommand: "Get-ChildItem .venv\\Scripts",
    diagnoseExpected: "The directory should contain the environment's Python executable and activation scripts.",
    fix: "You can avoid activation entirely by invoking the environment's Python executable directly. This does not require changing PowerShell's execution policy.",
    fixCommand: ".\\.venv\\Scripts\\python.exe -m pip install requests",
    fixExpected: "requests is installed into the project's .venv environment.",
    verify: "Check that the environment interpreter is active for the command being run.",
    verifyCommand: ".\\.venv\\Scripts\\python.exe -c \"import sys; print(sys.prefix != sys.base_prefix)\"",
    verifyExpected: "True indicates that Python is running inside a virtual environment."
  },
  {
    id: "windows-vscode-python-interpreter-not-selected", title: "VS Code cannot find a Python interpreter",
    description: "VS Code has not selected the intended Python interpreter or has not discovered the project's virtual environment.",
    patterns: ["no python interpreter selected", "interpreter not found", "python interpreter not found", "python environment not detected"],
    language: "VS Code", severity: "MEDIUM", category: "python",
    diagnose: "Check whether Python works in the integrated terminal and whether the environment exists in the workspace.",
    diagnoseCommand: "py --version",
    diagnoseExpected: "A Python version should appear if the launcher is available.",
    fix: "Install the Microsoft Python extension, run Python: Select Interpreter from the Command Palette, and select the project's environment. If it is not listed, run Python Environments: Refresh All Environment Managers.",
    fixExpected: "The selected environment should appear in the VS Code status bar.",
    verify: "Inspect the interpreter path in the integrated terminal.",
    verifyCommand: "python -c \"import sys; print(sys.executable)\"",
    verifyExpected: "The path should point to the interpreter selected for the project."
  },
  {
    id: "windows-python-requirements-file-not-found", title: "requirements.txt was not found",
    description: "pip cannot open requirements.txt because the current working directory or supplied path is incorrect.",
    patterns: ["could not open requirements file", "no such file or directory requirements.txt", "requirements.txt not found"],
    language: "Python", severity: "LOW", category: "python",
    diagnose: "Check the terminal's current directory and list its files.",
    diagnoseCommand: "Get-Location; Get-ChildItem",
    diagnoseExpected: "The current path and files are displayed. Confirm whether requirements.txt is present.",
    fix: "Change to the directory containing requirements.txt, or provide the correct path to the file.",
    fixCommand: "py -m pip install -r .\\requirements.txt",
    fixExpected: "pip reads the requirements file and installs its listed dependencies.",
    verify: "Confirm the file exists at the path you supplied.",
    verifyCommand: "Test-Path .\\requirements.txt",
    verifyExpected: "True means the file exists in the current directory."
  },
  {
    id: "windows-python-pip-permission-denied", title: "Permission denied while installing Python packages",
    description: "pip cannot write to the selected installation directory because the current user lacks the required permissions.",
    patterns: ["permission denied", "access is denied", "winerror 5 access is denied", "could not install packages due to an os error"],
    language: "Python", severity: "MEDIUM", category: "python",
    diagnose: "Identify the interpreter and package installation location before changing permissions.",
    diagnoseCommand: "python -m pip --version",
    diagnoseExpected: "The pip location and Python version are displayed.",
    fix: "Create a project virtual environment and install packages into it rather than changing system-wide permissions.",
    fixCommand: "py -m venv .venv; .\\.venv\\Scripts\\python.exe -m pip install requests",
    fixExpected: "The package is installed inside the project environment.",
    verify: "Inspect the package location.",
    verifyCommand: ".\\.venv\\Scripts\\python.exe -m pip show requests",
    verifyExpected: "The package location should be inside the project's .venv directory."
  },
  {
    id: "windows-python-pip-dependency-conflict", title: "pip dependency resolver reports conflicting requirements",
    description: "The requested packages require incompatible versions of one or more dependencies.",
    patterns: ["resolutionimpossible", "dependency conflict", "pip dependency resolver", "conflicting dependencies"],
    language: "Python", severity: "MEDIUM", category: "python",
    diagnose: "Read the full resolver output and identify the packages and version constraints that cannot be satisfied together.",
    diagnoseCommand: "python -m pip check",
    diagnoseExpected: "pip reports installed packages with incompatible or missing dependencies, if present.",
    fix: "Use a clean virtual environment and install a compatible set of package versions. Do not randomly force-install incompatible versions.",
    fixCommand: "py -m venv .venv; .\\.venv\\Scripts\\python.exe -m pip install -r requirements.txt",
    fixExpected: "The requirements are resolved in an isolated environment if their constraints are mutually compatible.",
    verify: "Ask pip to check installed dependency consistency.",
    verifyCommand: ".\\.venv\\Scripts\\python.exe -m pip check",
    verifyExpected: "No broken requirements found."
  },
  {
    id: "windows-python-could-not-build-wheels", title: "pip failed to build a package wheel",
    description: "A package could not be built locally. The cause may be missing build tools, an unsupported Python version, or unavailable prebuilt wheels.",
    patterns: ["failed building wheel", "could not build wheels", "error building wheel", "wheel build failed"],
    language: "Python", severity: "MEDIUM", category: "python",
    diagnose: "Read the first package-specific build error and check the Python version and architecture. The final wheel message may only summarize an earlier failure.",
    diagnoseCommand: "python --version; python -c \"import platform; print(platform.architecture())\"",
    diagnoseExpected: "Python version and process architecture are displayed.",
    fix: "Check the package's supported Python versions and installation instructions. Upgrade pip's build tooling where appropriate; install native build tools only when the package documentation requires them.",
    fixCommand: "python -m pip install --upgrade pip setuptools wheel",
    fixExpected: "The packaging tools are upgraded if compatible with the current environment.",
    verify: "Retry the package installation and inspect the first remaining build error if it fails.",
    verifyCommand: "python -m pip install PACKAGE_NAME",
    verifyExpected: "Replace PACKAGE_NAME with the actual package. A successful install completes without a wheel build failure."
  },
  {
    id: "windows-python-syntaxerror", title: "Python SyntaxError when running a script",
    description: "The Python parser found invalid syntax in the source file, or the script is being run by an unintended Python version.",
    patterns: ["syntaxerror invalid syntax", "syntaxerror", "invalid syntax python"],
    language: "Python", severity: "MEDIUM", category: "python",
    diagnose: "Read the line and caret shown in the traceback. Check the interpreter version if the code uses syntax introduced in a newer Python release.",
    diagnoseCommand: "python --version",
    diagnoseExpected: "The active Python version is displayed.",
    fix: "Correct the syntax at the indicated line, including missing colons, unmatched brackets, indentation, or syntax unsupported by the active Python version.",
    fixExpected: "The source should parse successfully after the actual syntax issue is corrected.",
    verify: "Ask Python to compile the file without executing it.",
    verifyCommand: "python -m py_compile main.py",
    verifyExpected: "No output means the file passed the syntax compilation check."
  },
  {
    id: "windows-python-ssl-certificate-error", title: "pip SSL certificate verification failed",
    description: "pip cannot verify the package index's TLS certificate. This may be caused by network inspection, proxy configuration, or an outdated certificate store.",
    patterns: ["ssl certificate verify failed", "certificate verify failed", "could not fetch url ssl", "sslerror"],
    language: "Python", severity: "MEDIUM", category: "python",
    diagnose: "Check the exact URL and certificate error. Confirm system date/time and whether the network uses a managed proxy or TLS inspection.",
    diagnoseCommand: "python -m pip config debug",
    diagnoseExpected: "pip configuration locations and configured values are listed; review proxy and index settings without sharing credentials.",
    fix: "Use the correct trusted certificate or network proxy configuration supplied by your network administrator. Do not disable TLS certificate verification as a workaround.",
    fixExpected: "pip should be able to verify the package index certificate using a trusted certificate chain.",
    verify: "Retry a normal package index query.",
    verifyCommand: "python -m pip index versions pip",
    verifyExpected: "The available versions are listed if the configured index is reachable and trusted."
  },
  {
    id: "windows-python-wrong-interpreter-package", title: "Package is installed but Python still cannot import it",
    description: "The package was installed into a different interpreter or environment than the one executing the script.",
    patterns: ["package installed but cannot import", "pip show package but import fails", "installed package not found by python"],
    language: "Python", severity: "MEDIUM", category: "python",
    diagnose: "Compare the executable path used by Python with the pip installation location.",
    diagnoseCommand: "python -c \"import sys; print(sys.executable)\"; python -m pip --version",
    diagnoseExpected: "Both commands should refer to the same interpreter environment.",
    fix: "Install the package through the exact interpreter that runs the application, rather than using a standalone pip command.",
    fixCommand: "python -m pip install PACKAGE_NAME",
    fixExpected: "Replace PACKAGE_NAME with the actual distribution name.",
    verify: "Run an import test using that same Python executable.",
    verifyCommand: "python -c \"import PACKAGE_NAME\"",
    verifyExpected: "Replace PACKAGE_NAME with the correct import module; no exception means the import succeeded."
  },
  {
    id: "windows-python-py-launcher-not-recognized", title: "The py Python launcher is not recognized",
    description: "Windows cannot find the py launcher. Python may still be available through the python command or a direct executable path.",
    patterns: ["py is not recognized as an internal or external command", "py command not found", "python launcher not recognized"],
    language: "Python", severity: "MEDIUM", category: "python",
    diagnose: "Check whether python works and whether the launcher executable is available.",
    diagnoseCommand: "python --version; where.exe py",
    diagnoseExpected: "Python may work even if where.exe cannot locate py.",
    fix: "Use the installed Python distribution's supported installer/manager options to repair or install the launcher. Alternatively, use python -m for Python and pip commands.",
    fixExpected: "The launcher should be available in a new terminal if installed and configured.",
    verify: "Open a new terminal and check the launcher.",
    verifyCommand: "py --version",
    verifyExpected: "The installed Python version is displayed."
  },

  // Node.js / npm / React / Vite — 15
  {
    id: "windows-node-not-recognized", title: "node is not recognized by Windows",
    description: "The Node.js executable is not available in the terminal PATH.",
    patterns: ["node is not recognized as an internal or external command", "node not recognized", "node command not found"],
    language: "JavaScript", severity: "HIGH", category: "node",
    diagnose: "Check whether Windows can locate node.exe.",
    diagnoseCommand: "where.exe node",
    diagnoseExpected: "A path to node.exe should appear.",
    fix: "Install the current supported Node.js release using the official Windows installer or another official installation method. Ensure its installation directory is on PATH, then reopen terminals.",
    fixExpected: "A new terminal should be able to locate node.exe.",
    verify: "Check Node.js and npm versions.",
    verifyCommand: "node --version; npm --version",
    verifyExpected: "Both version commands should return version information."
  },
  {
    id: "windows-npm-not-recognized", title: "npm is not recognized by Windows",
    description: "The npm command cannot be found. Node.js may be missing, or the npm command shim directory is not on PATH.",
    patterns: ["npm is not recognized as an internal or external command", "npm not recognized", "npm command not found"],
    language: "JavaScript", severity: "HIGH", category: "node",
    diagnose: "Check whether Node.js and npm can be located.",
    diagnoseCommand: "where.exe node; where.exe npm",
    diagnoseExpected: "Both commands should resolve to the Node.js installation.",
    fix: "Repair or reinstall Node.js using the official installer and ensure its installation directory is on PATH. Restart terminals after changing PATH.",
    fixExpected: "The Node.js installation supplies both node and npm.",
    verify: "Check both versions in a new terminal.",
    verifyCommand: "node --version; npm --version",
    verifyExpected: "Both commands display versions."
  },
  {
    id: "windows-npm-package-json-not-found", title: "npm cannot find package.json",
    description: "npm was run outside the project directory or the project does not yet contain a package.json file.",
    patterns: ["enoent no such file or directory package.json", "could not read package.json", "package.json not found"],
    language: "JavaScript", severity: "LOW", category: "node",
    diagnose: "Check the current directory and list its files.",
    diagnoseCommand: "Get-Location; Get-ChildItem",
    diagnoseExpected: "Confirm that package.json exists in the current directory.",
    fix: "Navigate to the project root containing package.json. For a new project that does not have one yet, initialize it intentionally.",
    fixCommand: "npm init -y",
    fixExpected: "A basic package.json is created in the current directory.",
    verify: "Confirm that npm can read the project manifest.",
    verifyCommand: "npm pkg get name",
    verifyExpected: "The package name is printed from package.json."
  },
  {
    id: "windows-npm-eresolve", title: "npm ERESOLVE dependency conflict",
    description: "npm cannot resolve a dependency tree because package version or peer dependency requirements conflict.",
    patterns: ["eresolve unable to resolve dependency tree", "eresolve", "unable to resolve dependency tree"],
    language: "JavaScript", severity: "MEDIUM", category: "node",
    diagnose: "Read the complete ERESOLVE report and identify the package and peer version ranges that conflict.",
    diagnoseCommand: "npm ls",
    diagnoseExpected: "npm lists the installed dependency tree and may identify invalid or missing dependencies.",
    fix: "Choose mutually compatible package versions based on their peer dependency requirements. Avoid treating --force or --legacy-peer-deps as a permanent fix.",
    fixExpected: "The package manifest should contain a compatible dependency set.",
    verify: "Reinstall from the corrected manifest.",
    verifyCommand: "npm install",
    verifyExpected: "npm completes dependency resolution without ERESOLVE."
  },
  {
    id: "windows-npm-missing-script", title: "npm Missing script error",
    description: "The requested script name is not defined in the scripts section of package.json.",
    patterns: ["missing script", "missing script dev", "missing script start", "missing script build"],
    language: "JavaScript", severity: "LOW", category: "node",
    diagnose: "List the scripts currently defined in package.json.",
    diagnoseCommand: "npm run",
    diagnoseExpected: "npm prints the available project scripts.",
    fix: "Add the intended script to package.json or run an existing script name. For a Vite project, the usual scripts include dev, build, and preview when configured.",
    fixExpected: "The script name should appear in the package.json scripts object.",
    verify: "Run the script after confirming it exists.",
    verifyCommand: "npm run",
    verifyExpected: "The available script list includes the expected name."
  },
  {
    id: "windows-vite-command-not-found", title: "vite is not recognized or command not found",
    description: "The local Vite executable is unavailable, commonly because dependencies have not been installed or Vite is not in the project dependencies.",
    patterns: ["vite is not recognized", "vite command not found", "vite is not recognized as an internal or external command"],
    language: "JavaScript", severity: "MEDIUM", category: "node",
    diagnose: "Check whether the project has Vite installed.",
    diagnoseCommand: "npm ls vite",
    diagnoseExpected: "npm shows the installed Vite dependency or reports that it is missing.",
    fix: "From the project root, install the project's dependencies. If Vite is intentionally part of the project but absent from package.json, add it as a development dependency.",
    fixCommand: "npm install",
    fixExpected: "The dependencies declared by package.json are installed.",
    verify: "Run the configured development script.",
    verifyCommand: "npm run dev",
    verifyExpected: "Vite starts and prints a local development URL."
  },
  {
    id: "windows-node-module-not-found", title: "Cannot find module in Node.js",
    description: "Node.js cannot resolve a required module because it is missing, the import path is incorrect, or the project is being run from an unexpected location.",
    patterns: ["err_module_not_found", "cannot find module", "module not found", "cannot find package"],
    language: "JavaScript", severity: "MEDIUM", category: "node",
    diagnose: "Identify the missing module name and check whether it is declared and installed in the current project.",
    diagnoseCommand: "npm ls",
    diagnoseExpected: "The dependency tree shows installed packages and missing/invalid entries.",
    fix: "Install the missing package if it is an external dependency, or correct the relative import path if it is a local module.",
    fixCommand: "npm install PACKAGE_NAME",
    fixExpected: "Replace PACKAGE_NAME with the actual package name.",
    verify: "Run the application again from the project root.",
    verifyCommand: "npm run",
    verifyExpected: "The configured scripts are listed; run the appropriate application script."
  },
  {
    id: "windows-node-eaddrinuse", title: "Node.js EADDRINUSE port already in use",
    description: "The application cannot bind to a port because another process is already listening on it.",
    patterns: ["eaddrinuse", "address already in use", "port already in use"],
    language: "JavaScript", severity: "MEDIUM", category: "node",
    diagnose: "Identify the process listening on the reported port. Replace 5000 with the port from the error.",
    diagnoseCommand: "netstat -ano | findstr :5000",
    diagnoseExpected: "The output may show a listening process and its PID.",
    fix: "Stop the previous instance of your own development server gracefully, or configure your application to use another available port. Do not terminate an unknown process.",
    fixExpected: "The chosen port is no longer occupied by the previous application instance.",
    verify: "Start the application again and check its startup output.",
    verifyCommand: "npm run dev",
    verifyExpected: "The server starts and reports its listening URL/port."
  },
  {
    id: "windows-node-unsupported-engine", title: "npm Unsupported engine warning or error",
    description: "A package declares a Node.js or npm version range that does not match the runtime currently installed.",
    patterns: ["unsupported engine", "ebadengine", "not compatible with your version of node"],
    language: "JavaScript", severity: "MEDIUM", category: "node",
    diagnose: "Check the installed Node.js/npm versions and the package's engines requirement.",
    diagnoseCommand: "node --version; npm --version",
    diagnoseExpected: "The active runtime versions are displayed.",
    fix: "Install a Node.js version compatible with the project's engines requirement. Check the project's README and package.json before changing runtime versions.",
    fixExpected: "The active Node.js version satisfies the package's declared engine range.",
    verify: "Re-run installation and inspect whether the engine warning/error remains.",
    verifyCommand: "npm install",
    verifyExpected: "The install completes without an incompatible-engine error."
  },
  {
    id: "windows-npm-cache-corrupt", title: "npm cache or cache integrity error",
    description: "npm reports corrupted or invalid cached package data.",
    patterns: ["npm cache error", "cache integrity check failed", "tarball data seems to be corrupted", "eintegrity"],
    language: "JavaScript", severity: "MEDIUM", category: "node",
    diagnose: "Ask npm to verify the cache before deleting anything.",
    diagnoseCommand: "npm cache verify",
    diagnoseExpected: "npm reports cache verification results.",
    fix: "If npm identifies cache corruption, use npm's supported cache clean operation. Then retry the install. Avoid routinely deleting the cache when verification reports no problem.",
    fixCommand: "npm cache clean --force",
    fixExpected: "npm clears its cache after the explicit force option.",
    verify: "Retry dependency installation.",
    verifyCommand: "npm install",
    verifyExpected: "Dependencies install without the previous cache integrity error."
  },
  {
    id: "windows-npm-lockfile-out-of-sync", title: "package-lock.json is out of sync",
    description: "The lockfile does not match package.json or npm reports that the lockfile needs updating.",
    patterns: ["package lock out of sync", "package-lock json is out of date", "npm ci can only install"],
    language: "JavaScript", severity: "MEDIUM", category: "node",
    diagnose: "Check whether package.json and package-lock.json are both present and whether recent dependency edits were made without updating the lockfile.",
    diagnoseCommand: "Get-Item package.json, package-lock.json",
    diagnoseExpected: "Both manifest files should exist for an npm ci workflow.",
    fix: "If you intentionally changed package.json, run npm install to update the lockfile and review the resulting changes. Do not manually delete lockfile entries.",
    fixCommand: "npm install",
    fixExpected: "npm updates package-lock.json to reflect package.json.",
    verify: "Run the clean install command used by your project/CI.",
    verifyCommand: "npm ci",
    verifyExpected: "npm ci completes when the lockfile and manifest are in sync."
  },
  {
    id: "windows-vite-esm-require-error", title: "Vite ESM package cannot be loaded with require",
    description: "A Vite configuration or dependency uses require() to load a package that is ESM-only.",
    patterns: ["err_require_esm", "this package is esm only", "require of es module not supported"],
    language: "JavaScript", severity: "MEDIUM", category: "node",
    diagnose: "Identify the package named in the error and inspect whether the configuration file is using CommonJS require().",
    diagnoseCommand: "node --version",
    diagnoseExpected: "The active Node.js version is displayed; also inspect package.json and the Vite config module format.",
    fix: "Use the package's supported ESM import syntax. For Vite configuration, follow Vite's current guidance for ESM config, such as using import syntax and an appropriate module file extension or package type.",
    fixExpected: "The config should load the ESM-only package through a supported module mechanism.",
    verify: "Run the Vite development command again.",
    verifyCommand: "npm run dev",
    verifyExpected: "Vite loads its configuration without ERR_REQUIRE_ESM."
  },
  {
    id: "windows-react-invalid-hook-call", title: "React Invalid hook call",
    description: "React detected a Hook being called outside its allowed context, or multiple incompatible React copies/versions are present.",
    patterns: ["invalid hook call", "hooks can only be called inside", "you might have more than one copy of react"],
    language: "JavaScript", severity: "HIGH", category: "node",
    diagnose: "Check the component call site and inspect whether React is duplicated in the dependency tree.",
    diagnoseCommand: "npm ls react react-dom",
    diagnoseExpected: "The dependency tree shows the installed React and React DOM versions and whether multiple copies appear.",
    fix: "Call Hooks only at the top level of React function components or custom Hooks. Align react and react-dom versions and resolve duplicate React installations.",
    fixExpected: "The application should use compatible React packages and obey the Rules of Hooks.",
    verify: "Restart the development server and reproduce the component path that previously failed.",
    verifyCommand: "npm run dev",
    verifyExpected: "The Invalid hook call error no longer appears."
  },
  {
    id: "windows-vite-build-failed", title: "Vite production build failed",
    description: "Vite could not complete the production build due to a source, dependency, configuration, or type-checking issue.",
    patterns: ["vite build failed", "build failed with errors", "rollup failed to resolve import", "failed to resolve import"],
    language: "JavaScript", severity: "HIGH", category: "node",
    diagnose: "Read the first build error and identify whether it is a missing import, syntax issue, plugin/configuration issue, or separate TypeScript check.",
    diagnoseCommand: "npm ls vite",
    diagnoseExpected: "The installed Vite version is shown.",
    fix: "Correct the first reported source/configuration issue. For unresolved imports, verify the file path, filename case, and whether the dependency is installed.",
    fixExpected: "All imported files and build plugins should resolve correctly.",
    verify: "Run the production build again.",
    verifyCommand: "npm run build",
    verifyExpected: "The build completes and writes the production output directory configured by the project."
  },
  {
    id: "windows-node-permission-error", title: "npm EACCES or EPERM permission error",
    description: "npm cannot access a file or directory during an install or update, often because a process has locked it or the directory permissions prevent access.",
    patterns: ["eacces permission denied", "eperm operation not permitted", "operation not permitted npm"],
    language: "JavaScript", severity: "MEDIUM", category: "node",
    diagnose: "Read the full path in the error and check whether an editor, dev server, antivirus scan, or another npm process is using the affected files.",
    diagnoseCommand: "npm config get cache",
    diagnoseExpected: "The configured npm cache directory is printed.",
    fix: "Close the process that owns the project files, use a project directory where your account has write access, and retry. Avoid running npm routinely as Administrator.",
    fixExpected: "npm can write to the project and cache directories.",
    verify: "Retry the original install command.",
    verifyCommand: "npm install",
    verifyExpected: "The install completes without the previous access error."
  },

  // Java / JDK / Maven — 10
  {
    id: "windows-java-not-recognized", title: "java is not recognized by Windows",
    description: "The Java runtime launcher cannot be found through the current PATH.",
    patterns: ["java is not recognized as an internal or external command", "java not recognized", "java command not found"],
    language: "Java", severity: "HIGH", category: "java",
    diagnose: "Check whether Windows can locate java.exe.",
    diagnoseCommand: "where.exe java",
    diagnoseExpected: "A path to java.exe should appear if it is on PATH.",
    fix: "Install a JDK and configure PATH to include its bin directory. Ensure the intended JDK appears before older Java installations.",
    fixExpected: "A new terminal can locate the Java launcher.",
    verify: "Check the runtime version.",
    verifyCommand: "java --version",
    verifyExpected: "The installed Java runtime version is displayed."
  },
  {
    id: "windows-javac-not-recognized", title: "javac is not recognized by Windows",
    description: "The Java compiler is unavailable. A runtime-only installation or incorrect JDK PATH may be configured.",
    patterns: ["javac is not recognized as an internal or external command", "javac not recognized", "javac command not found"],
    language: "Java", severity: "HIGH", category: "java",
    diagnose: "Check whether javac.exe is available.",
    diagnoseCommand: "where.exe javac",
    diagnoseExpected: "A path to javac.exe should appear when a JDK bin directory is on PATH.",
    fix: "Install a full JDK, set JAVA_HOME to the JDK root directory, and add %JAVA_HOME%\\bin to PATH. Restart the terminal.",
    fixExpected: "The JDK compiler is available to the shell.",
    verify: "Check the compiler version.",
    verifyCommand: "javac --version",
    verifyExpected: "The javac version is displayed."
  },
  {
    id: "windows-java-home-invalid", title: "JAVA_HOME is not set or points to an invalid directory",
    description: "A Java tool or build system cannot find the JDK because JAVA_HOME is missing or points to the wrong folder.",
    patterns: ["java_home is not set", "java_home is set to an invalid directory", "invalid java_home", "could not find java_home"],
    language: "Java", severity: "HIGH", category: "java",
    diagnose: "Display JAVA_HOME and inspect whether it points to the JDK root rather than its bin directory.",
    diagnoseCommand: "echo $env:JAVA_HOME; Test-Path \"$env:JAVA_HOME\\bin\\javac.exe\"",
    diagnoseExpected: "The path should exist and the test should return True.",
    fix: "Set JAVA_HOME to the actual JDK installation root, then ensure %JAVA_HOME%\\bin is on PATH. Open a new terminal after changing environment variables.",
    fixExpected: "JAVA_HOME points to a directory containing the JDK bin folder.",
    verify: "Check the environment variable and compiler.",
    verifyCommand: "echo $env:JAVA_HOME; javac --version",
    verifyExpected: "The JDK path and compiler version are displayed."
  },
  {
    id: "windows-java-could-not-find-main", title: "Java could not find or load main class",
    description: "The Java launcher cannot locate the requested class using the current classpath or package-qualified name.",
    patterns: ["could not find or load main class", "classnotfoundexception", "main class not found"],
    language: "Java", severity: "MEDIUM", category: "java",
    diagnose: "Check the current directory, compiled class output location, package declaration, and the exact class name used to launch the program.",
    diagnoseCommand: "Get-ChildItem -Recurse *.class",
    diagnoseExpected: "Compiled class files are listed if they exist beneath the current directory.",
    fix: "Run the class from the correct classpath root and use its fully qualified package name when the source declares a package.",
    fixCommand: "java -cp . Main",
    fixExpected: "For a class in the default package compiled in the current directory, this launches Main.",
    verify: "Run the launcher with the correct classpath and class name.",
    verifyCommand: "java -cp . Main",
    verifyExpected: "The JVM finds the class and begins executing its main method."
  },
  {
    id: "windows-java-class-not-found", title: "Java ClassNotFoundException",
    description: "The JVM could not load a class required at runtime because it is missing from the runtime classpath or dependency set.",
    patterns: ["classnotfoundexception", "java class not found", "class not found exception"],
    language: "Java", severity: "MEDIUM", category: "java",
    diagnose: "Identify the fully qualified class name in the exception and check whether the required JAR or class directory is included at runtime.",
    diagnoseCommand: "echo $env:CLASSPATH",
    diagnoseExpected: "The current CLASSPATH value is displayed; it may be empty, in which case use an explicit -cp argument.",
    fix: "Add the directory or JAR containing the missing class to the runtime classpath. Use the platform classpath separator, a semicolon on Windows.",
    fixCommand: "java -cp \".;lib\\dependency.jar\" Main",
    fixExpected: "The JVM searches the current directory and the specified JAR.",
    verify: "Run the application with the complete classpath.",
    verifyCommand: "java -cp \".;lib\\dependency.jar\" Main",
    verifyExpected: "The missing class can be loaded if the required JAR contains it."
  },
  {
    id: "windows-java-public-class-filename", title: "Java public class name does not match filename",
    description: "A public top-level class must be declared in a source file with the matching filename.",
    patterns: ["class is public should be declared in a file named", "public class filename mismatch", "class name does not match filename"],
    language: "Java", severity: "MEDIUM", category: "java",
    diagnose: "Compare the public class name with the exact source filename, including capitalization.",
    diagnoseCommand: "Get-ChildItem *.java",
    diagnoseExpected: "The source filenames in the current folder are listed.",
    fix: "Rename the source file so its name matches the public top-level class, or change the class declaration if the filename is intended.",
    fixExpected: "For public class Main, the source file should be Main.java.",
    verify: "Compile the correctly named file.",
    verifyCommand: "javac Main.java",
    verifyExpected: "The compiler creates Main.class if the source is valid."
  },
  {
    id: "windows-java-package-does-not-exist", title: "Java package does not exist",
    description: "The compiler cannot find an imported package or dependency on the source path or classpath.",
    patterns: ["package does not exist", "error package does not exist", "cannot find symbol package"],
    language: "Java", severity: "MEDIUM", category: "java",
    diagnose: "Determine whether the missing package is part of the JDK or an external library. Check the import spelling and dependency declaration.",
    diagnoseCommand: "javac --version",
    diagnoseExpected: "The compiler version is displayed.",
    fix: "For external libraries, add the correct JAR to the compile classpath or declare the dependency in the build tool. For project packages, compile from the correct source root.",
    fixCommand: "javac -cp \".;lib\\dependency.jar\" Main.java",
    fixExpected: "The compiler searches the current directory and the specified JAR.",
    verify: "Recompile after confirming the package exists in the configured classpath.",
    verifyCommand: "javac -cp \".;lib\\dependency.jar\" Main.java",
    verifyExpected: "The package-not-found diagnostic disappears if the dependency is correct."
  },
  {
    id: "windows-java-unsupported-class-version", title: "Unsupported class file major version",
    description: "The Java runtime is older than the Java version used to compile the class or one of its dependencies.",
    patterns: ["unsupportedclassversionerror", "unsupported class file major version", "class file version"],
    language: "Java", severity: "HIGH", category: "java",
    diagnose: "Compare the runtime version with the compiler/build target used to produce the class.",
    diagnoseCommand: "java --version; javac --version",
    diagnoseExpected: "Both versions are displayed. The runtime must support the class-file version being executed.",
    fix: "Run the application with a sufficiently recent compatible JDK/JRE, or rebuild the project targeting the Java release required by the deployment environment.",
    fixExpected: "The runtime and compiled bytecode target are compatible.",
    verify: "Run the application again with the selected runtime.",
    verifyCommand: "java Main",
    verifyExpected: "The unsupported class version error no longer appears."
  },
  {
    id: "windows-maven-not-recognized", title: "mvn is not recognized by Windows",
    description: "The Maven command-line executable is not available through PATH.",
    patterns: ["mvn is not recognized as an internal or external command", "maven not recognized", "mvn command not found"],
    language: "Java", severity: "HIGH", category: "java",
    diagnose: "Check whether Maven is available and whether its bin directory is on PATH.",
    diagnoseCommand: "where.exe mvn",
    diagnoseExpected: "A path to mvn.cmd should appear.",
    fix: "Install Apache Maven, extract its binary distribution, and add the extracted Maven bin directory to PATH. Ensure a JDK is installed.",
    fixExpected: "The Maven executable is available in a new terminal.",
    verify: "Check the Maven version and Java runtime it uses.",
    verifyCommand: "mvn --version",
    verifyExpected: "Maven and Java version details are displayed."
  },
  {
    id: "windows-maven-java-home", title: "Maven cannot find a JDK",
    description: "Maven cannot locate a suitable Java installation through JAVA_HOME or PATH.",
    patterns: ["maven requires java_home", "the java_home environment variable is not defined correctly", "maven java home not found"],
    language: "Java", severity: "HIGH", category: "java",
    diagnose: "Check JAVA_HOME and verify that its bin directory contains the Java executable.",
    diagnoseCommand: "echo $env:JAVA_HOME; Test-Path \"$env:JAVA_HOME\\bin\\java.exe\"",
    diagnoseExpected: "The path should exist and the test should return True.",
    fix: "Set JAVA_HOME to the JDK root directory, not its bin subdirectory. Ensure the JDK bin directory is available on PATH.",
    fixExpected: "Maven can locate a valid JDK installation.",
    verify: "Run Maven's version command.",
    verifyCommand: "mvn --version",
    verifyExpected: "Maven reports the Java version and Java home."
  },

  // Rust / Cargo — 10
  {
    id: "windows-rustc-not-recognized", title: "rustc is not recognized by Windows",
    description: "The Rust compiler is not available through the current PATH, commonly because the Cargo bin directory is missing.",
    patterns: ["rustc is not recognized as an internal or external command", "rustc not recognized", "rustc command not found"],
    language: "Rust", severity: "HIGH", category: "rust",
    diagnose: "Check whether Windows can locate rustc and inspect the usual Cargo bin directory.",
    diagnoseCommand: "where.exe rustc; Test-Path \"$env:USERPROFILE\\.cargo\\bin\\rustc.exe\"",
    diagnoseExpected: "The command may find rustc in the user's .cargo\\bin directory.",
    fix: "Install Rust using rustup. Ensure %USERPROFILE%\\.cargo\\bin is on PATH and open a new terminal.",
    fixExpected: "rustup installs rustc and Cargo tools into the Cargo bin directory.",
    verify: "Check the compiler version.",
    verifyCommand: "rustc --version",
    verifyExpected: "The Rust compiler version is displayed."
  },
  {
    id: "windows-cargo-not-recognized", title: "cargo is not recognized by Windows",
    description: "The Cargo package manager is not available in the terminal PATH.",
    patterns: ["cargo is not recognized as an internal or external command", "cargo not recognized", "cargo command not found"],
    language: "Rust", severity: "HIGH", category: "rust",
    diagnose: "Check whether Cargo is installed in the standard rustup directory.",
    diagnoseCommand: "where.exe cargo; Test-Path \"$env:USERPROFILE\\.cargo\\bin\\cargo.exe\"",
    diagnoseExpected: "The executable should exist in the Cargo bin directory after a standard rustup installation.",
    fix: "Install Rust through rustup or repair the PATH entry for %USERPROFILE%\\.cargo\\bin. Restart the terminal after PATH changes.",
    fixExpected: "The Cargo executable becomes discoverable.",
    verify: "Check Cargo's version.",
    verifyCommand: "cargo --version",
    verifyExpected: "Cargo version information appears."
  },
  {
    id: "windows-cargo-no-cargo-toml", title: "Cargo could not find Cargo.toml",
    description: "Cargo was run outside a Rust package/workspace directory or the manifest file is missing.",
    patterns: ["could not find cargo.toml", "could not find cargo.toml in", "no cargo manifest found"],
    language: "Rust", severity: "LOW", category: "rust",
    diagnose: "Check the current directory and locate Cargo.toml.",
    diagnoseCommand: "Get-Location; Get-ChildItem Cargo.toml",
    diagnoseExpected: "Cargo.toml should be present in the package root.",
    fix: "Change to the directory containing Cargo.toml, or pass the manifest path explicitly.",
    fixCommand: "cargo build --manifest-path .\\path\\to\\Cargo.toml",
    fixExpected: "Cargo uses the specified manifest path.",
    verify: "Build from the package root.",
    verifyCommand: "cargo build",
    verifyExpected: "Cargo begins compiling the package and its dependencies."
  },
  {
    id: "windows-cargo-unresolved-import", title: "Rust unresolved import",
    description: "The Rust compiler cannot resolve an import because the module is missing, the path is incorrect, or the dependency is not declared.",
    patterns: ["unresolved import", "no external crate", "could not find in crate root"],
    language: "Rust", severity: "MEDIUM", category: "rust",
    diagnose: "Read the exact import path and determine whether it should refer to a local module or an external crate.",
    diagnoseCommand: "Get-Content .\\Cargo.toml",
    diagnoseExpected: "The manifest shows the package metadata and declared dependencies.",
    fix: "For an external crate, add it under [dependencies] in Cargo.toml using its documented crate name and version. For local modules, correct the module declaration and path.",
    fixCommand: "cargo add serde",
    fixExpected: "If cargo-add is installed, it adds serde to the manifest; otherwise edit Cargo.toml using the crate's official instructions.",
    verify: "Build the package after correcting the import and dependency declaration.",
    verifyCommand: "cargo check",
    verifyExpected: "Cargo checks the project and reports remaining compiler diagnostics, if any."
  },
  {
    id: "windows-cargo-crate-not-found", title: "Cargo cannot find a crate or package",
    description: "Cargo cannot resolve a dependency name/version from the configured registry or source.",
    patterns: ["no matching package named", "failed to select a version for", "package not found in registry"],
    language: "Rust", severity: "MEDIUM", category: "rust",
    diagnose: "Check the exact crate name, version requirement, registry source, and whether the package exists.",
    diagnoseCommand: "Get-Content .\\Cargo.toml",
    diagnoseExpected: "The dependency declaration and version requirement are visible.",
    fix: "Correct the crate name and version requirement using the package's registry documentation. Check custom registry configuration if the crate is private.",
    fixExpected: "Cargo can resolve the declared package from the intended source.",
    verify: "Ask Cargo to resolve and check dependencies.",
    verifyCommand: "cargo check",
    verifyExpected: "Dependency resolution completes if the package and version are available."
  },
  {
    id: "windows-rust-linker-not-found", title: "Rust linker or linker toolchain not found",
    description: "The Rust target requires a native linker or build tools that are not installed/configured.",
    patterns: ["linker link.exe not found", "linker cc not found", "linker not found", "could not exec the linker"],
    language: "Rust", severity: "HIGH", category: "rust",
    diagnose: "Check the active Rust host/target and read the linker name in the error. Windows MSVC targets require the corresponding Visual C++ build tools.",
    diagnoseCommand: "rustc -vV",
    diagnoseExpected: "The output shows the Rust host triple and compiler details.",
    fix: "Install the native build tools required by the selected target. For the default Windows MSVC toolchain, install the Visual Studio C++ Build Tools and a Windows SDK, then open a terminal with the toolchain environment configured.",
    fixExpected: "The target's native linker and required system libraries are available.",
    verify: "Build a simple Rust project.",
    verifyCommand: "cargo build",
    verifyExpected: "The native linker is invoked successfully."
  },
  {
    id: "windows-rust-target-not-installed", title: "Rust target is not installed",
    description: "The requested compilation target is not installed in the active Rust toolchain.",
    patterns: ["target may not be installed", "can't find crate for std", "target not installed"],
    language: "Rust", severity: "MEDIUM", category: "rust",
    diagnose: "List installed targets for the active toolchain and identify the exact target triple from the error.",
    diagnoseCommand: "rustup target list --installed",
    diagnoseExpected: "The installed target triples are listed.",
    fix: "Install the exact target required by the project using rustup. Ensure the target triple matches the intended architecture and ABI.",
    fixCommand: "rustup target add x86_64-pc-windows-msvc",
    fixExpected: "The Windows x64 MSVC target standard library is installed.",
    verify: "Confirm the target appears in the installed list.",
    verifyCommand: "rustup target list --installed",
    verifyExpected: "The requested target triple appears."
  },
  {
    id: "windows-cargo-network-failure", title: "Cargo cannot download crates",
    description: "Cargo cannot reach the registry or download a dependency because of network, proxy, TLS, or registry configuration problems.",
    patterns: ["failed to download", "failed to fetch", "could not connect to server", "crates.io network error"],
    language: "Rust", severity: "MEDIUM", category: "rust",
    diagnose: "Read the registry URL and underlying network/TLS error. Check whether the network or proxy blocks the registry.",
    diagnoseCommand: "cargo search serde",
    diagnoseExpected: "A successful query returns matching crate results; network or registry failures explain why fetching is blocked.",
    fix: "Restore access to the configured registry and configure any required proxy/certificate settings according to the network administrator's instructions. Do not disable TLS verification.",
    fixExpected: "Cargo can connect to its configured registry.",
    verify: "Retry dependency resolution.",
    verifyCommand: "cargo fetch",
    verifyExpected: "Cargo downloads dependencies required by the project."
  },
  {
    id: "windows-rust-toolchain-not-installed", title: "Rust toolchain is not installed or active",
    description: "rustup cannot find the requested toolchain, or the project selects a toolchain that has not been installed.",
    patterns: ["toolchain is not installed", "no default toolchain configured", "rustup could not choose a version"],
    language: "Rust", severity: "MEDIUM", category: "rust",
    diagnose: "List installed toolchains and inspect any rust-toolchain.toml file in the project.",
    diagnoseCommand: "rustup toolchain list",
    diagnoseExpected: "Installed Rust toolchains are listed.",
    fix: "Install the required stable toolchain or the specific version requested by the project. Do not remove a project-pinned version without checking its requirements.",
    fixCommand: "rustup toolchain install stable",
    fixExpected: "The stable toolchain is installed.",
    verify: "Check the active compiler.",
    verifyCommand: "rustc --version",
    verifyExpected: "The active Rust compiler version is displayed."
  },
  {
    id: "windows-cargo-build-failed", title: "Cargo build failed",
    description: "Cargo could not compile the package or one of its dependencies. The summary line is not necessarily the root cause.",
    patterns: ["cargo build failed", "could not compile", "build failed cargo"],
    language: "Rust", severity: "HIGH", category: "rust",
    diagnose: "Read the first compiler or build-script error above the final Cargo summary. Identify whether it belongs to your crate, a dependency, or a native build tool.",
    diagnoseCommand: "cargo check",
    diagnoseExpected: "Cargo checks Rust code and prints the first actionable compiler diagnostics.",
    fix: "Correct the first specific error. For dependency build failures, check that crate's platform requirements and required native tools rather than changing unrelated Rust source.",
    fixExpected: "The source and dependencies compile for the selected target.",
    verify: "Run the build again.",
    verifyCommand: "cargo build",
    verifyExpected: "Cargo finishes with a successful build."
  },

  // VS Code / extensions / terminal — 15
  {
    id: "windows-vscode-terminal-profile-not-found", title: "VS Code terminal profile path does not exist",
    description: "The configured integrated terminal shell executable cannot be found at the configured path.",
    patterns: ["path to shell executable does not exist", "terminal profile not found", "shell executable does not exist"],
    language: "VS Code", severity: "MEDIUM", category: "vscode",
    diagnose: "Open terminal profile settings and inspect the selected shell path. Check whether the executable exists.",
    diagnoseCommand: "where.exe pwsh; where.exe powershell; where.exe cmd",
    diagnoseExpected: "Installed shell executables are listed.",
    fix: "Select an installed terminal profile from the terminal dropdown or correct the custom profile path in VS Code settings.",
    fixExpected: "The selected profile points to an existing executable.",
    verify: "Create a new integrated terminal.",
    verifyExpected: "The terminal opens using the selected shell."
  },
  {
    id: "windows-vscode-terminal-failed-to-launch", title: "VS Code integrated terminal failed to launch",
    description: "The integrated terminal process could not start or exited unexpectedly.",
    patterns: ["terminal process failed to launch", "terminal failed to launch", "terminal exits immediately"],
    language: "VS Code", severity: "MEDIUM", category: "vscode",
    diagnose: "Read the complete terminal error, including shell executable, working directory, and exit code. Check whether the configured shell works outside VS Code.",
    diagnoseCommand: "powershell -NoProfile -Command \"$PSVersionTable.PSVersion\"",
    diagnoseExpected: "PowerShell prints its version if it can launch independently.",
    fix: "Correct the terminal profile executable or starting directory. Temporarily test a standard installed shell profile and disable problematic shell startup customizations only to isolate the cause.",
    fixExpected: "VS Code starts the shell with a valid executable and working directory.",
    verify: "Open a new integrated terminal.",
    verifyExpected: "The terminal remains open and accepts commands."
  },
  {
    id: "windows-vscode-extension-not-working", title: "VS Code extension is not working",
    description: "An extension may be disabled, installed in the wrong environment, incompatible, or failing to activate.",
    patterns: ["vscode extension not working", "extension failed to activate", "extension not activating", "extension disabled"],
    language: "VS Code", severity: "MEDIUM", category: "vscode",
    diagnose: "Check whether the extension is installed and enabled in the current VS Code window/profile. Inspect the Output panel for its activation errors.",
    diagnoseCommand: "code --list-extensions",
    diagnoseExpected: "Installed extension identifiers are listed when the code CLI is available.",
    fix: "Enable or reinstall the extension in the correct local/remote environment, update VS Code if required, and check the extension's compatibility and logs.",
    fixExpected: "The extension is installed, enabled, and compatible with the current VS Code environment.",
    verify: "Reload the VS Code window and check the extension's expected feature.",
    verifyExpected: "The extension activates without a new error in the Output panel."
  },
  {
    id: "windows-vscode-cpp-intellisense-red-underlines", title: "VS Code shows red underlines despite successful C++ build",
    description: "The C/C++ extension's IntelliSense configuration may not match the compiler used to build the project.",
    patterns: ["red squiggles but code compiles", "intellisense errors but compiler works", "include errors detected"],
    language: "VS Code", severity: "LOW", category: "vscode",
    diagnose: "Compile the source from the terminal. If it succeeds, inspect IntelliSense mode, compilerPath, and includePath rather than changing valid source code.",
    diagnoseCommand: "g++ -std=c++20 -fsyntax-only main.cpp",
    diagnoseExpected: "No output means the compiler accepted the file.",
    fix: "Run C/C++: Select IntelliSense Configuration and select the compiler actually used. Ensure the IntelliSense mode matches that compiler/target.",
    fixExpected: "VS Code uses the compiler's system include paths and compatible IntelliSense mode.",
    verify: "Reload the window and check the Problems panel.",
    verifyExpected: "False IntelliSense diagnostics should disappear after the configuration is refreshed."
  },
  {
    id: "windows-vscode-include-path-missing", title: "VS Code includePath is missing headers",
    description: "The C/C++ extension cannot find project or library headers because includePath is incomplete or the wrong configuration is active.",
    patterns: ["include path missing", "cannot open source file", "include errors detected"],
    language: "VS Code", severity: "MEDIUM", category: "vscode",
    diagnose: "Determine whether the missing header is project-local, third-party, or a compiler system header.",
    fix: "Use the C/C++ configuration UI to select the correct compiler and add only the required project include directories. Prefer compiler discovery for system headers.",
    fixExpected: "The configured include paths contain the directories where the headers actually reside.",
    verify: "Reopen the source file and check whether the include diagnostic disappears.",
    verifyExpected: "IntelliSense resolves the header."
  },
  {
    id: "windows-vscode-wrong-compiler-path", title: "VS Code compilerPath points to the wrong compiler",
    description: "The configured compilerPath references a missing or unintended compiler installation.",
    patterns: ["compilerpath invalid", "compiler path not found", "compiler path does not exist"],
    language: "VS Code", severity: "MEDIUM", category: "vscode",
    diagnose: "Check the compiler resolved by the terminal and compare it with compilerPath in c_cpp_properties.json.",
    diagnoseCommand: "where.exe g++; g++ --version",
    diagnoseExpected: "The first matching compiler path and its version are displayed.",
    fix: "Update compilerPath through the C/C++ configuration UI to the full path of the compiler actually used by the project.",
    fixExpected: "The configuration references an existing compiler executable.",
    verify: "Reopen the C++ file and inspect the active IntelliSense configuration.",
    verifyExpected: "The compiler path and IntelliSense mode correspond to the installed compiler."
  },
  {
    id: "windows-vscode-code-runner-no-output", title: "VS Code Code Runner produces no output",
    description: "Code Runner may be using an unexpected working directory, command, output panel, or interpreter.",
    patterns: ["code runner no output", "run code produces no output", "code runner not working"],
    language: "VS Code", severity: "LOW", category: "vscode",
    diagnose: "Run the program directly in the integrated terminal to distinguish a program issue from a Code Runner configuration issue.",
    diagnoseCommand: "Get-Location",
    diagnoseExpected: "The current terminal directory is displayed.",
    fix: "Check Code Runner's executor mapping and run-in-terminal setting. Confirm that the selected language runtime is installed and that the generated command uses the correct file path.",
    fixExpected: "Code Runner invokes the intended interpreter/compiler and displays its output in the configured panel.",
    verify: "Run the file again and compare its output with a direct terminal run.",
    verifyExpected: "Both execution methods should produce the same program output."
  },
  {
    id: "windows-vscode-python-interpreter-mismatch", title: "VS Code runs Python with the wrong interpreter",
    description: "The selected VS Code interpreter differs from the environment where packages were installed or the runtime intended for the project.",
    patterns: ["vscode wrong python interpreter", "wrong interpreter selected", "python uses wrong environment"],
    language: "VS Code", severity: "MEDIUM", category: "vscode",
    diagnose: "Inspect the executable path from the VS Code integrated terminal.",
    diagnoseCommand: "python -c \"import sys; print(sys.executable)\"",
    diagnoseExpected: "The active Python executable path is printed.",
    fix: "Run Python: Select Interpreter and select the intended project environment. If it is not listed, refresh environment discovery and check the workspace search paths.",
    fixExpected: "The correct interpreter is selected for the workspace.",
    verify: "Run the path check again.",
    verifyCommand: "python -c \"import sys; print(sys.executable)\"",
    verifyExpected: "The printed path points to the intended environment."
  },
  {
    id: "windows-vscode-formatter-not-found", title: "VS Code formatter is not available",
    description: "The selected formatter extension is missing, disabled, or not configured as the default formatter for the language.",
    patterns: ["formatter not found", "no formatter installed", "format document unavailable", "no default formatter"],
    language: "VS Code", severity: "LOW", category: "vscode",
    diagnose: "Check whether a formatter extension is installed and enabled for the current workspace and language.",
    fix: "Install/enable the intended formatter extension and select it using Format Document With, then Set as Default Formatter.",
    fixExpected: "VS Code has a formatter registered for the active language.",
    verify: "Run Format Document on a test file.",
    verifyExpected: "The formatter applies its formatting rules without an unavailable-formatter message."
  },
  {
    id: "windows-vscode-debugger-not-configured", title: "VS Code debugger is not configured",
    description: "VS Code does not have a suitable debug configuration or debugger for the selected language and runtime.",
    patterns: ["debugger not configured", "launch json missing", "cannot start debugging", "no debug configuration"],
    language: "VS Code", severity: "MEDIUM", category: "vscode",
    diagnose: "Identify the language/runtime and confirm that its debugger extension and runtime are installed.",
    fix: "Use Run and Debug: Add Configuration to generate a configuration appropriate for the selected language. Check the program path, runtime executable, and working directory.",
    fixExpected: "launch.json contains a valid configuration for the project.",
    verify: "Start a debug session and confirm that VS Code reaches the configured program entry point.",
    verifyExpected: "The debugger starts without a missing-configuration or executable-path error."
  },
  {
    id: "windows-vscode-terminal-wrong-directory", title: "VS Code terminal opens in the wrong directory",
    description: "The integrated terminal starts from an unexpected working directory due to workspace or terminal profile settings.",
    patterns: ["terminal opens in wrong folder", "wrong working directory vscode", "terminal cwd wrong"],
    language: "VS Code", severity: "LOW", category: "vscode",
    diagnose: "Check the terminal's current directory and the workspace folder that is open.",
    diagnoseCommand: "Get-Location",
    diagnoseExpected: "The current working directory is displayed.",
    fix: "Open the intended project folder as the VS Code workspace. Review terminal.integrated.cwd and remove an unintended custom starting directory.",
    fixExpected: "New terminals start in the intended project directory.",
    verify: "Create a new integrated terminal and inspect its location.",
    verifyCommand: "Get-Location",
    verifyExpected: "The terminal opens at the expected project root."
  },
  {
    id: "windows-vscode-path-not-refreshed", title: "VS Code terminal does not see updated PATH",
    description: "VS Code was opened before PATH changed, so its integrated terminals may inherit an older environment.",
    patterns: ["vscode terminal path not updated", "new path not recognized in vscode", "terminal cannot find newly installed command"],
    language: "VS Code", severity: "MEDIUM", category: "vscode",
    diagnose: "Compare command availability in a newly opened external terminal and the VS Code integrated terminal.",
    diagnoseCommand: "where.exe node",
    diagnoseExpected: "The command should resolve if the current process environment contains the updated PATH.",
    fix: "Close all VS Code windows and start VS Code again after updating PATH. Then create a new integrated terminal.",
    fixExpected: "The VS Code process inherits the refreshed user environment.",
    verify: "Check the command from a new VS Code terminal.",
    verifyCommand: "where.exe node",
    verifyExpected: "The expected executable path is displayed."
  },
  {
    id: "windows-vscode-extension-host-crash", title: "VS Code extension host terminated unexpectedly",
    description: "The extension host process stopped, possibly because of an extension crash, conflict, or runtime issue.",
    patterns: ["extension host terminated unexpectedly", "extension host crashed", "extension host process exited"],
    language: "VS Code", severity: "MEDIUM", category: "vscode",
    diagnose: "Open the Output panel and select Log (Extension Host). Check recent activation errors and identify recently installed or updated extensions.",
    fix: "Update VS Code and affected extensions. Use Help: Start Extension Bisect to identify a problematic extension, then disable or reinstall the extension responsible.",
    fixExpected: "The extension host remains running after the conflicting extension is isolated.",
    verify: "Reload the VS Code window and monitor the Extension Host log.",
    verifyExpected: "The extension host does not terminate again during normal use."
  },
  {
    id: "windows-vscode-settings-json-invalid", title: "VS Code settings.json contains invalid JSON",
    description: "VS Code cannot parse the user or workspace settings file because of invalid JSON syntax.",
    patterns: ["settings json invalid", "unable to parse settings json", "invalid json in settings", "json parse error settings"],
    language: "VS Code", severity: "MEDIUM", category: "vscode",
    diagnose: "Open the settings.json file named in the notification and inspect the highlighted syntax error.",
    fix: "Correct JSON syntax: use double-quoted keys/strings, commas between properties, and no trailing comma where strict JSON is required. Preserve unrelated settings.",
    fixExpected: "The settings file is valid JSON and can be parsed.",
    verify: "Save settings.json and check whether the parse notification disappears.",
    verifyExpected: "VS Code accepts the settings file without a JSON parse error."
  },
  {
    id: "windows-vscode-remote-environment-command-missing", title: "VS Code Remote or WSL cannot find an installed command",
    description: "A tool installed on Windows is not automatically available inside a remote WSL/Linux environment, or vice versa.",
    patterns: ["command not found in wsl vscode", "tool not found remote window", "works in windows not wsl"],
    language: "VS Code", severity: "MEDIUM", category: "vscode",
    diagnose: "Check whether the VS Code window is local or connected to WSL/SSH/container, then run the command in that environment's terminal.",
    diagnoseCommand: "uname -a",
    diagnoseExpected: "In WSL/Linux this prints Linux system information; in PowerShell it is not a standard command.",
    fix: "Install the required runtime/tool inside the environment where the code executes. Install remote extensions in the remote environment when VS Code prompts for it.",
    fixExpected: "The command and required extension are available in the execution environment, not just on the Windows host.",
    verify: "Run the tool's version command in the same integrated terminal/environment used by the project.",
    verifyCommand: "node --version",
    verifyExpected: "The environment's Node.js version is displayed if Node is installed there."
  }
];

function buildSteps(issue: RawIssue): StepSeed[] {
  const steps: StepSeed[] = [
    {
      title: "Identify the cause",
      instructions: issue.diagnose,
      ...(issue.diagnoseCommand ? { command: issue.diagnoseCommand } : {}),
      ...(issue.diagnoseExpected ? { expectedOutput: issue.diagnoseExpected } : {})
    },
    {
      title: "Apply the appropriate fix",
      instructions: issue.fix,
      ...(issue.fixCommand ? { command: issue.fixCommand } : {}),
      ...(issue.fixExpected ? { expectedOutput: issue.fixExpected } : {})
    },
    {
      title: "Verify the result",
      instructions: issue.verify,
      ...(issue.verifyCommand ? { command: issue.verifyCommand } : {}),
      ...(issue.verifyExpected ? { expectedOutput: issue.verifyExpected } : {})
    }
  ];

  return steps;
}

const issueSeeds: IssueSeed[] = rawIssues.map(issue => ({
  ...issue,
  solution: {
    title: `Fix: ${issue.title}`,
    description: issue.description,
    verification: issue.verify,
    steps: buildSteps(issue),
    sources: sourceCatalog[issue.category]
  }
}));

async function main() {
  const expectedCounts = {
    cpp: 15,
    python: 15,
    node: 15,
    java: 10,
    rust: 10,
    vscode: 15
  };

  const actualCounts = rawIssues.reduce<Record<string, number>>((counts, issue) => {
    counts[issue.category] = (counts[issue.category] ?? 0) + 1;
    return counts;
  }, {});

  for (const [category, expected] of Object.entries(expectedCounts)) {
    const actual = actualCounts[category] ?? 0;

    if (actual !== expected) {
      throw new Error(
        `Seed count mismatch for ${category}: expected ${expected}, found ${actual}`
      );
    }
  }

  if (issueSeeds.length !== 80) {
    throw new Error(`Expected exactly 80 issues, found ${issueSeeds.length}`);
  }

  let processed = 0;

  for (const issue of issueSeeds) {
    await prisma.issue.upsert({
      where: { id: issue.id },
      update: {
        title: issue.title,
        description: issue.description,
        errorPatterns: issue.patterns,
        os: "WINDOWS",
        language: issue.language,
        severity: issue.severity
      },
      create: {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        errorPatterns: issue.patterns,
        os: "WINDOWS",
        language: issue.language,
        severity: issue.severity,
        solutions: {
          create: [{
            title: issue.solution.title,
            description: issue.solution.description,
            verification: issue.solution.verification,
            steps: {
              create: issue.solution.steps.map((step, index) => ({
                order: index + 1,
                title: step.title,
                instructions: step.instructions,
                command: step.command ?? null,
                expectedOutput: step.expectedOutput ?? null
              }))
            },
            sources: {
              create: issue.solution.sources.map(source => ({
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
    console.log(`[${processed}/${issueSeeds.length}] ${issue.title}`);
  }

  console.log("");
  console.log(`Successfully processed ${processed} troubleshooting entries.`);
  console.log("Categories: C++ 15, Python 15, Node.js/React/Vite 15, Java/Maven 10, Rust/Cargo 10, VS Code 15.");
  console.log("Existing issue records were updated without deleting their related solutions.");
  console.log("New issue records include one solution, three steps, and category documentation sources.");
  console.log("Review and test each guide before treating it as verified.");
}

main()
  .catch(error => {
    console.error("Master database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
