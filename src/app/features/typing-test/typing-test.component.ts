import { Component, inject, OnInit, ElementRef, ViewChild, effect, computed, untracked } from '@angular/core';
import { NgIf } from '@angular/common';
import { TypingEngineService } from '../../core/services/typing-engine.service';
import {
  AppModeService,
  MODE_CONFIG,
  COMING_SOON_MODES,
} from '../../core/services/app-mode.service';
import { ConfigBarComponent } from './config-bar/config-bar.component';
import { WordDisplayComponent } from './word-display/word-display.component';
import { TimerComponent } from './timer/timer.component';
import { ResultsComponent } from './results/results.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-typing-test',
  standalone: true,
  imports: [
    NgIf,
    ConfigBarComponent,
    WordDisplayComponent,
    TimerComponent,
    ResultsComponent,
    SidebarComponent,
    HeaderComponent,
  ],
  template: `
    <div class="layout">
      <div class="site-wrapper">
        <app-header />
        <div class="body-row">
          <app-sidebar />
          <div class="main" (click)="focusInput()">
            <div class="coming-soon" [hidden]="!isComingSoon()">
              <div class="coming-soon-icon">🚧</div>
              <h2 class="coming-soon-title">{{ currentModeLabel() }} — Coming Soon!</h2>
              <p class="coming-soon-msg">We're working hard on this feature. Stay tuned — it'll be worth the wait!</p>
            </div>
            <ng-container *ngIf="true">
            <app-config-bar [hidden]="isComingSoon() || !engine.ready()" (timeLimitSelected)="clearInput()" />
            @if (engine.capsLock() && !isComingSoon()) {
              <div class="caps-warning">Caps Lock is on</div>
            }
            <div class="typing-area" [hidden]="isComingSoon() || !engine.ready()">
              <div class="words-box">
                <app-word-display />
              </div>
              <div class="input-bar">
                <input
                  #hiddenInput
                  class="typing-input"
                  type="text"
                  [placeholder]="engine.isIdle() ? 'Start typing...' : ''"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  (keydown)="onKeydown($event)"
                  (input)="onInput($event)"
                  (paste)="onPaste($event)"
                  (blur)="onBlur()"
                  (focus)="onFocus()"
                />
                @if (!engine.isFinished()) {
                  <div class="timer-box">
                    <app-timer />
                  </div>
                }
                <button
                  class="reset-btn"
                  title="Reset (Tab)"
                  (click)="reset($event)"
                >
                  ↺
                </button>
              </div>
              @if (blurred && engine.isRunning()) {
                <div class="blur-overlay" (click)="focusInput()">
                  Click to resume
                </div>
              }
            </div>
            <app-results [hidden]="isComingSoon()" />
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './typing-test.component.css',
})
export class TypingTestComponent implements OnInit {
  engine = inject(TypingEngineService);
  modeService = inject(AppModeService);

  @ViewChild('hiddenInput') hiddenInput!: ElementRef<HTMLInputElement>;

  blurred = false;

  isComingSoon = computed(() => COMING_SOON_MODES.includes(this.modeService.mode()));
  currentModeLabel = computed(() => MODE_CONFIG[this.modeService.mode()].label);

  constructor() {
    let first = true;
    effect(() => {
      const mode = this.modeService.mode(); // only this signal is tracked
      if (first) { first = false; return; }

      untracked(() => {
        if (COMING_SOON_MODES.includes(mode)) {
          this.engine.reset(this.engine.state().timeLimit);
          return;
        }
        const { wordListUrl, sentences } = MODE_CONFIG[mode];
        this.engine.init(wordListUrl, sentences).then(() => {
          if (this.hiddenInput) this.hiddenInput.nativeElement.value = '';
          setTimeout(() => this.focusInput(), 50);
        });
      });
    });
  }

  async ngOnInit(): Promise<void> {
    const { wordListUrl, sentences } = MODE_CONFIG[this.modeService.mode()];
    await this.engine.init(wordListUrl, sentences);
    setTimeout(() => this.focusInput(), 50);
  }

  focusInput(): void {
    this.hiddenInput?.nativeElement.focus();
  }

  clearInput(): void {
    this.blurred = false;
    if (this.hiddenInput) this.hiddenInput.nativeElement.value = '';
    setTimeout(() => this.focusInput(), 30);
  }

  reset(event: MouseEvent): void {
    event.stopPropagation();
    this.engine.reset(this.engine.state().timeLimit);
    this.clearInput();
  }

  onKeydown(event: KeyboardEvent): void {
    this.engine.handleKeydown(event);
    // Space, Backspace, Tab modify the buffer — sync the input immediately
    const k = event.key;
    if (k === ' ' || k === 'Backspace' || k === 'Tab') {
      if (this.hiddenInput) {
        this.hiddenInput.nativeElement.value = this.engine.state().inputBuffer;
      }
    }
  }

  onInput(event: Event): void {
    const input = event as InputEvent;
    const data = input.data;
    if (data && data !== ' ') {
      this.engine.handleCharInput(data);
    }
    // Always sync to engine's authoritative buffer (handles rejected extra chars too)
    if (this.hiddenInput) {
      this.hiddenInput.nativeElement.value = this.engine.state().inputBuffer;
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
  }

  onBlur(): void {
    if (this.engine.isRunning()) this.blurred = true;
  }

  onFocus(): void {
    this.blurred = false;
  }
}
