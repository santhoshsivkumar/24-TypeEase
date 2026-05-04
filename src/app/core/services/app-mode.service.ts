import { Injectable, signal } from '@angular/core';

export type AppMode = 'top200' | 'top1000' | 'custom' | 'multiplayer' | 'competition' | 'textpractice';

export const COMING_SOON_MODES: AppMode[] = ['custom', 'multiplayer', 'competition', 'textpractice'];

export const MODE_CONFIG: Record<
  AppMode,
  { label: string; wordListUrl: string; sentences: boolean }
> = {
  top200: {
    label: 'Typing Test',
    wordListUrl: 'words/en-200.json',
    sentences: false,
  },
  top1000: {
    label: 'Typing Test (advanced)',
    wordListUrl: 'words/en-1000.json',
    sentences: true,
  },
  custom: { label: 'Custom Typing Test', wordListUrl: '', sentences: false },
  multiplayer: { label: 'Multiplayer', wordListUrl: '', sentences: false },
  competition: { label: 'Typing Competition', wordListUrl: '', sentences: false },
  textpractice: { label: 'Text Practice', wordListUrl: '', sentences: false },
};

@Injectable({ providedIn: 'root' })
export class AppModeService {
  private _mode = signal<AppMode>('top200');
  readonly mode = this._mode.asReadonly();

  setMode(mode: AppMode): void {
    this._mode.set(mode);
  }
}
