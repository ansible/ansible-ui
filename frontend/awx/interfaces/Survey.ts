export interface Survey {
  name: string;
  description: string;
  spec: Spec[];
}

export type SurveyQuestionType =
  | 'text'
  | 'textarea'
  | 'password'
  | 'multiplechoice'
  | 'multiselect'
  | 'integer'
  | 'float'
  | 'boolean';

export type SurveyAnswer = string | number | boolean | string[];

export interface Spec {
  question_name: string;
  question_description: string;
  required: boolean;
  type: string;
  variable: string;
  min: number;
  max: number;
  default: SurveyAnswer;
  choices: string[] | string;
  new_question: boolean;
}
