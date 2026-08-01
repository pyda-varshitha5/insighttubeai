export interface CoreConcept {
  title: string;
  description: string;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
}

export interface AISummary {
  title: string;
  overview: string;
  importance: string;
  working: string;

  advantages: string[];
  disadvantages: string[];

  coreConcepts: CoreConcept[];

  examples: {
  title: string;
  explanation: string;
  language: string;
  code: string;
  output?: string;
}[];

  bestPractices: string[];

  commonMistakes: string[];

  interviewQuestions: InterviewQuestion[];

  keyTakeaways: string[];

  conclusion: string;
}

export type SummaryFetchState =
  | {
      status: "idle";
    }
  | {
      status: "loading";
    }
  | {
      status: "success";
      data: AISummary;
    }
  | {
      status: "error";
      message: string;
    };