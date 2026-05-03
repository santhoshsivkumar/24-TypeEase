import {
  Component,
  inject,
  AfterViewChecked,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { TypingEngineService } from '../../../core/services/typing-engine.service';

@Component({
  selector: 'app-word-display',
  standalone: true,
  template: `
    <div class="word-display" #displayEl>
      <div class="words-inner">
        @for (word of engine.state().words; track $index) {
          <span
            class="word"
            [class.active]="word.status === 'active'"
            [class.correct]="word.status === 'correct'"
            [class.incorrect]="word.status === 'incorrect'"
            [attr.data-index]="$index"
          >
            @for (char of word.chars; track $index) {
              <span class="char {{ char.status }}">{{ char.expected }}</span>
            }
          </span>
        }
      </div>
    </div>
  `,
  styleUrl: './word-display.component.css',
})
export class WordDisplayComponent implements AfterViewChecked {
  engine = inject(TypingEngineService);

  @ViewChild('displayEl') displayEl!: ElementRef<HTMLDivElement>;

  private lastWordIndex = -1;

  ngAfterViewChecked(): void {
    const idx = this.engine.state().currentWordIndex;
    if (idx !== this.lastWordIndex) {
      this.lastWordIndex = idx;
      this.scrollActiveWordIntoView(idx);
    }
  }

  private scrollActiveWordIntoView(wordIndex: number): void {
    const container = this.displayEl?.nativeElement;
    if (!container) return;

    const inner = container.querySelector('.words-inner') as HTMLElement | null;
    if (!inner) return;

    const activeWord = inner.querySelector(
      `[data-index="${wordIndex}"]`,
    ) as HTMLElement | null;
    if (!activeWord) return;

    // Scroll so the active word's row is the first visible row
    const top = activeWord.offsetTop;
    inner.style.transform = `translateY(-${top}px)`;
  }
}
