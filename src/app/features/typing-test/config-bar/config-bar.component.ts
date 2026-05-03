import { Component, inject, output } from '@angular/core';
import { TypingEngineService } from '../../../core/services/typing-engine.service';
import { TimeLimit } from '../../../core/models/typing.models';

@Component({
  selector: 'app-config-bar',
  standalone: true,
  template: `
    <div class="config-bar">
      <div class="time-options">
        @for (t of timeLimits; track t) {
          <button
            class="time-btn"
            [class.active]="engine.state().timeLimit === t"
            (click)="setTime(t)"
          >
            {{ t }}s
          </button>
        }
      </div>
      <span class="restart-hint"> Press <kbd>Tab</kbd> to restart </span>
    </div>
  `,
  styleUrl: './config-bar.component.css',
})
export class ConfigBarComponent {
  engine = inject(TypingEngineService);
  timeLimits: TimeLimit[] = [1, 30, 60, 120];
  timeLimitSelected = output<TimeLimit>();

  setTime(limit: TimeLimit): void {
    this.engine.setTimeLimit(limit);
    this.timeLimitSelected.emit(limit);
  }
}
