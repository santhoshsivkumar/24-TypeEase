import {
  TestResult,
  TypingState,
  WpmSnapshot,
  WordState,
} from '../models/typing.models';

export class StatsService {
  calculate(
    state: TypingState,
    timeElapsed: number,
    wpmHistory: WpmSnapshot[] = [],
  ): TestResult {
    const elapsedMinutes = timeElapsed / 60;

    // Standard WPM: correct characters / 5 / minutes (industry standard, same as MonkeyType)
    const wpm =
      elapsedMinutes > 0
        ? Math.round(state.correctKeystrokes / 5 / elapsedMinutes)
        : 0;

    const incorrectWords = state.words
      .slice(0, state.currentWordIndex)
      .filter((w: WordState) => w.status === 'incorrect').length;

    // Net WPM: additionally subtracts incorrect words per minute as a penalty
    const netWpm = Math.max(
      0,
      elapsedMinutes > 0
        ? Math.round(wpm - incorrectWords / elapsedMinutes)
        : 0,
    );

    const accuracy =
      state.totalKeystrokes > 0
        ? Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100)
        : 100;

    const correctWords = state.words
      .slice(0, state.currentWordIndex)
      .filter((w: WordState) => w.status === 'correct').length;

    return {
      wpm,
      netWpm,
      accuracy,
      errors: incorrectWords,
      timeElapsed,
      correctWords,
      totalWords: state.currentWordIndex,
      correctKeystrokes: state.correctKeystrokes,
      incorrectKeystrokes: state.totalKeystrokes - state.correctKeystrokes,
      totalKeystrokes: state.totalKeystrokes,
      wpmHistory,
    };
  }
}
