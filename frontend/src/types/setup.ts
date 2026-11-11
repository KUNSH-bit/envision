
export interface SetupConfiguration {
  operatingSystem: string;
  osVersion: string;
  environmentType: string;
  linuxDistribution: string;
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
