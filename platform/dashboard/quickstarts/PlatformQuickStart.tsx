export interface PlatformQuickStart {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  durationMinutes: number;
  prerequisites: string[];
  introduction: string;
  tasks: {
    title: string;
    description: string;
    actions: string[];
    review: {
      question: string;
    };
  }[];
  conclusion: string;
}
