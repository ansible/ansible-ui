export interface Survey {
  name: string;
  description: string;
  spec: [
    {
      question_name: string;
      question_description: string;
      required: boolean;
      type: string;
      variable: string;
      min: number;
      max: number;
      default: string;
      choices: string;
      new_question: boolean;
    }
  ];
}
