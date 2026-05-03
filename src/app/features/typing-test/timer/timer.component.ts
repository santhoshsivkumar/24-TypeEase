import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TypingEngineService } from '../../../core/services/typing-engine.service';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div
      class="timer"
      (click)="hidden.set(!hidden())"
      title="Toggle timer"
    >
      <span [style.visibility]="hidden() ? 'hidden' : 'visible'">
        {{ engine.timeRemaining() | number: '2.0-0' }}
      </span>
    </div>
  `,
  styleUrl: './timer.component.css',
})
export class TimerComponent {
  engine = inject(TypingEngineService);
  hidden = signal(false);
}
