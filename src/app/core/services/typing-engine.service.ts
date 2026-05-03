import { Injectable, signal, computed } from '@angular/core';
import {
  CharState,
  TestResult,
  TimeLimit,
  TypingState,
  WordState,
  WpmSnapshot,
} from '../models/typing.models';
import { WordGeneratorService } from './word-generator.service';
import { StatsService } from './stats.service';

const WORDS_PER_BATCH = 80;
const MAX_EXTRA_CHARS = 10;

@Injectable({ providedIn: 'root' })
export class TypingEngineService {
  private stats = new StatsService();
  private static readonly STORAGE_KEY = 'typelite-time-limit';

  private _state = signal<TypingState>(
    this.createInitialState(this.savedTimeLimit()),
  );
  readonly state = this._state.asReadonly();

  readonly currentWord = computed(
    () => this._state().words[this._state().currentWordIndex],
  );
  readonly isFinished = computed(() => this._state().status === 'finished');
  readonly isRunning = computed(() => this._state().status === 'running');
  readonly isIdle = computed(() => this._state().status === 'idle');

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private _timeRemaining = signal<number>(60);
  readonly timeRemaining = this._timeRemaining.asReadonly();

  private _result = signal<TestResult | null>(null);
  readonly result = this._result.asReadonly();

  private _capsLock = signal<boolean>(false);
  readonly capsLock = this._capsLock.asReadonly();

  private _wpmSnapshots: WpmSnapshot[] = [];
  private _errorsThisSecond = 0;
  private _modificationsThisSecond = 0;

  constructor(private wordGen: WordGeneratorService) {}

  private sentenceMode = false;

  async init(
    wordListUrl = 'words/en-200.json',
    sentences = false,
  ): Promise<void> {
    this.sentenceMode = sentences;
    await this.wordGen.load(wordListUrl);
    this.reset(this._state().timeLimit);
  }

  reset(timeLimit: TimeLimit = 60): void {
    this.stopTimer();
    this._result.set(null);
    this._timeRemaining.set(timeLimit);
    this._wpmSnapshots = [];
    this._errorsThisSecond = 0;
    this._modificationsThisSecond = 0;
    const words = this.sentenceMode
      ? this.wordGen.generateSentences(WORDS_PER_BATCH)
      : this.wordGen.generate(WORDS_PER_BATCH);
    this._state.set(this.buildState(words, timeLimit));
  }

  setTimeLimit(limit: TimeLimit): void {
    localStorage.setItem(TypingEngineService.STORAGE_KEY, String(limit));
    this.stopTimer();
    this._result.set(null);
    this._timeRemaining.set(limit);
    this._wpmSnapshots = [];
    this._errorsThisSecond = 0;
    this._modificationsThisSecond = 0;
    // Reuse existing words — only reset progress and time limit
    const existingWords = this._state().words.map((w) => w.original);
    this._state.set(this.buildState(existingWords, limit));
  }

  handleKeydown(event: KeyboardEvent): void {
    const s = this._state();
    if (s.status === 'finished') return;

    this._capsLock.set(event.getModifierState('CapsLock'));

    if (event.key === 'Tab') {
      event.preventDefault();
      this.reset(s.timeLimit);
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      if (event.ctrlKey) {
        this.handleCtrlBackspace();
      } else {
        this.handleBackspace();
      }
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
      this.handleSpace();
      return;
    }
  }

  handleCharInput(char: string): void {
    const s = this._state();
    if (s.status === 'finished') return;
    if (char.length !== 1) return;

    if (s.status === 'idle') this.startTimer();

    // Track errors for per-second WPM chart
    const currentWord = s.words[s.currentWordIndex];
    const isCorrectKey =
      s.currentCharIndex < currentWord.original.length &&
      currentWord.chars[s.currentCharIndex]?.expected === char;
    if (!isCorrectKey) this._errorsThisSecond++;

    this._state.update((prev) => {
      const words = prev.words.map((w, wi) => {
        if (wi !== prev.currentWordIndex) return w;
        const chars = [...w.chars];
        const idx = prev.currentCharIndex;

        // Extra characters beyond word length
        if (idx >= w.original.length) {
          if (idx - w.original.length >= MAX_EXTRA_CHARS) return w;
          const extraChar: CharState = { expected: char, status: 'extra' };
          chars.push(extraChar);
        } else {
          const isCorrect = chars[idx].expected === char;
          chars[idx] = {
            ...chars[idx],
            status: isCorrect ? 'correct' : 'incorrect',
          };
        }
        return { ...w, chars };
      });

      const word = prev.words[prev.currentWordIndex];
      const isCorrect =
        prev.currentCharIndex < word.original.length &&
        word.chars[prev.currentCharIndex]?.expected === char;

      const newCharIndex = prev.currentCharIndex + 1;

      // Mark next char as active
      const finalWords = words.map((w, wi) => {
        if (wi !== prev.currentWordIndex) return w;
        const chars = w.chars.map((c, ci) => ({
          ...c,
          status:
            ci === newCharIndex && c.status === 'pending' ? 'active' : c.status,
        })) as CharState[];
        return { ...w, chars };
      });

      return {
        ...prev,
        words: finalWords,
        currentCharIndex: newCharIndex,
        inputBuffer: prev.inputBuffer + char,
        totalKeystrokes: prev.totalKeystrokes + 1,
        correctKeystrokes: prev.correctKeystrokes + (isCorrect ? 1 : 0),
      };
    });
  }

  private handleBackspace(): void {
    if (this._state().inputBuffer.length > 0) this._modificationsThisSecond++;
    this._state.update((prev) => {
      if (prev.inputBuffer.length === 0) return prev; // blocked at word start

      const newCharIndex = prev.currentCharIndex - 1;
      const words = prev.words.map((w, wi) => {
        if (wi !== prev.currentWordIndex) return w;
        const chars = w.chars.map((c, ci) => {
          if (ci === newCharIndex) return { ...c, status: 'active' as const };
          if (ci > newCharIndex) return { ...c, status: 'pending' as const };
          return c;
        }) as CharState[];
        // Remove extra chars that were appended
        const trimmed =
          newCharIndex < w.original.length
            ? chars.slice(0, w.original.length)
            : chars;
        return { ...w, chars: trimmed };
      });

      return {
        ...prev,
        words,
        currentCharIndex: newCharIndex,
        inputBuffer: prev.inputBuffer.slice(0, -1),
      };
    });
  }

  private handleCtrlBackspace(): void {
    if (this._state().inputBuffer.length > 0) this._modificationsThisSecond++;
    this._state.update((prev) => {
      if (prev.inputBuffer.length === 0) return prev;
      const words = prev.words.map((w, wi) => {
        if (wi !== prev.currentWordIndex) return w;
        const chars = w.chars.slice(0, w.original.length).map((c, ci) => ({
          ...c,
          status: (ci === 0 ? 'active' : 'pending') as CharState['status'],
        }));
        return { ...w, chars };
      });
      return { ...prev, words, currentCharIndex: 0, inputBuffer: '' };
    });
  }

  private handleSpace(): void {
    this._state.update((prev) => {
      if (prev.inputBuffer.length === 0) return prev;

      const word = prev.words[prev.currentWordIndex];
      const typed = prev.inputBuffer;
      const isCorrect = typed === word.original;
      const nextWordIndex = prev.currentWordIndex + 1;

      const words = prev.words.map((w, wi) => {
        if (wi === prev.currentWordIndex) {
          return {
            ...w,
            status: isCorrect ? ('correct' as const) : ('incorrect' as const),
          };
        }
        if (wi === nextWordIndex) {
          const chars = w.chars.map((c, ci) => ({
            ...c,
            status: ci === 0 ? ('active' as const) : c.status,
          })) as CharState[];
          return { ...w, chars, status: 'active' as const };
        }
        return w;
      });

      // Generate more words if near the end
      let finalWords = words;
      if (nextWordIndex >= words.length - 20) {
        const extra = this.wordGen.generate(WORDS_PER_BATCH);
        const extraWords = extra.map((w) => this.buildWordState(w));
        finalWords = [...words, ...extraWords];
      }

      return {
        ...prev,
        words: finalWords,
        currentWordIndex: nextWordIndex,
        currentCharIndex: 0,
        inputBuffer: '',
      };
    });
  }

  private startTimer(): void {
    this._state.update((s) => ({
      ...s,
      status: 'running',
      startTime: Date.now(),
    }));
    this.timerInterval = setInterval(() => {
      const t = this._timeRemaining();
      if (t <= 1) {
        this.finishTest();
        return;
      }
      this._timeRemaining.set(t - 1);
      const elapsed = this._state().timeLimit - (t - 1);
      this.takeWpmSnapshot(elapsed);
    }, 1000);
  }

  private takeWpmSnapshot(elapsed: number): void {
    const s = this._state();
    const elapsedMinutes = elapsed / 60;
    const wpm =
      elapsedMinutes > 0
        ? Math.round(s.correctKeystrokes / 5 / elapsedMinutes)
        : 0;
    this._wpmSnapshots.push({
      second: elapsed,
      wpm,
      errors: this._errorsThisSecond,
      modifications: this._modificationsThisSecond,
    });
    this._errorsThisSecond = 0;
    this._modificationsThisSecond = 0;
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private finishTest(): void {
    this.stopTimer();
    const s = this._state();
    const elapsed = s.timeLimit - this._timeRemaining();
    const result = this.stats.calculate(s, elapsed, this._wpmSnapshots);
    this._result.set(result);
    this._state.update((prev) => ({ ...prev, status: 'finished' }));
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private savedTimeLimit(): TimeLimit {
    const valid: TimeLimit[] = [1, 30, 60, 120];
    const stored = Number(
      localStorage.getItem(TypingEngineService.STORAGE_KEY),
    );
    return (valid.includes(stored as TimeLimit) ? stored : 60) as TimeLimit;
  }

  private createInitialState(timeLimit: TimeLimit): TypingState {
    return {
      words: [],
      currentWordIndex: 0,
      currentCharIndex: 0,
      inputBuffer: '',
      status: 'idle',
      startTime: null,
      timeLimit,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
    };
  }

  private buildState(wordStrings: string[], timeLimit: TimeLimit): TypingState {
    const words = wordStrings.map((w, i) => ({
      ...this.buildWordState(w),
      status: (i === 0 ? 'active' : 'pending') as WordState['status'],
      chars: this.buildWordState(w).chars.map((c, ci) => ({
        ...c,
        status: (i === 0 && ci === 0
          ? 'active'
          : 'pending') as CharState['status'],
      })),
    }));
    return {
      words,
      currentWordIndex: 0,
      currentCharIndex: 0,
      inputBuffer: '',
      status: 'idle',
      startTime: null,
      timeLimit,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
    };
  }

  private buildWordState(word: string): WordState {
    return {
      original: word,
      status: 'pending',
      chars: word
        .split('')
        .map((ch) => ({ expected: ch, status: 'pending' as const })),
    };
  }
}
