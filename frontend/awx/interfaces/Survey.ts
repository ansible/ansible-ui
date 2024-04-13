export interface Survey {
  name: string;
  description: string;
  spec: Spec[];
}

export interface Spec {
  question_name: string;
  question_description: string;
  required: boolean;
  type: string;
  variable: string;
  min: number;
  max: number;
  default: string | number;
  choices: string[] | string;
  new_question: boolean;
}
