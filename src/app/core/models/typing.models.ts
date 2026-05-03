export interface WpmSnapshot {
  second: number;
  wpm: number;
  errors: number;
  modifications: number;
}

export type CharStatus =
  | 'pending'
  | 'active'
  | 'correct'
  | 'incorrect'
  | 'extra';
export type WordStatus = 'pending' | 'active' | 'correct' | 'incorrect';
export type TestStatus = 'idle' | 'running' | 'finished';
export type TimeLimit = 1 | 30 | 60 | 120;

export interface CharState {
  expected: string;
  status: CharStatus;
}

export interface WordState {
  original: string;
  chars: CharState[];
  status: WordStatus;
}

export interface TypingState {
  words: WordState[];
  currentWordIndex: number;
  currentCharIndex: number;
  inputBuffer: string;
  status: TestStatus;
  startTime: number | null;
  timeLimit: TimeLimit;
  totalKeystrokes: number;
  correctKeystrokes: number;
}

export interface TestResult {
  wpm: number;
  netWpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  correctWords: number;
  totalWords: number;
  correctKeystrokes: number;
  incorrectKeystrokes: number;
  totalKeystrokes: number;
  wpmHistory: WpmSnapshot[];
}
