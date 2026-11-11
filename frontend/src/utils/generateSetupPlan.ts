
import type {SetupConfiguration, SetupPlan, SetupStep} from '../types/setup';

export function generateSetupPlan(config: SetupConfiguration): SetupPlan {
  const steps: SetupStep[] = [];

  // C++ setup
  if (config.languages.includes('cpp')) {
    steps.push({
      id: 'cpp-compiler',
      title: 'Install a C++ compiler',
      description: 'Install the compiler required to compile C++ programs.',
      category: 'installation',
      instructions: [
        'Choose a compiler suitable for your operating system.',
        'Install the compiler.',
        'Make sure the compiler is accessible from your terminal.'
      ],
      verificationCommands: ['g++ --version']
    });
  }

  // Python setup
  if (config.languages.includes('python')) {
    steps.push({
      id: 'python-install',
      title: 'Install Python',
      description: 'Install the Python interpreter.',
      category: 'installation',
      instructions: [
        'Download Python from its official website.', 'Install Python.',
        'Make sure Python is accessible from your terminal.'
      ],
      verificationCommands: ['python --version']
    });
  }

  // VS Code setup
  if (config.editors.includes('vscode')) {
    steps.push({
      id: 'vscode-setup',
      title: 'Configure Visual Studio Code',
      description: 'Prepare VS Code for development.',
      category: 'configuration',
      instructions: [
        'Open Visual Studio Code.',
        'Install the extensions required by your selected languages.',
        'Open your development project folder.'
      ]
    });
  }

  return {
    title: 'Your Personalized Setup Plan',
    description: 'Follow these steps to prepare your development environment.',
    steps
  };
}
