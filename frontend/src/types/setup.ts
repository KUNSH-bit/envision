
export interface SetupConfiguration {
  operatingSystem: string;
  osVersion: string;
  linuxDistribution: string;
  environmentType: string;
  editors: string[];
  languages: string[];
  purposes: string[];
}

export interface QuestionOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface QuestionDefinition {
  id: keyof SetupConfiguration;
  title: string;
  description: string;
  type: 'single'|'multiple';
  options: QuestionOption[];
  when?: (config: SetupConfiguration) => boolean;
}
