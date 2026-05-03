import { Component, inject } from '@angular/core';
import { TypingEngineService } from '../../../core/services/typing-engine.service';

@Component({
  selector: 'app-results',
  standalone: true,
  template: `
    @if (engine.result(); as r) {
      <div class="results-wrapper">
        <div class="result-card">
          <div class="card-tabs">
            <span class="tab active">Result</span>
          </div>

          <div class="wpm-hero">
            <span class="wpm-number"
              >{{ r.wpm }} <span class="wpm-label">WPM</span></span
            >
            <span class="wpm-sub">(words per minute)</span>
          </div>

          <table class="stats-table">
            <tbody>
              <tr>
                <td class="stat-name">Keystrokes</td>
                <td class="stat-breakdown">
                  (<span class="correct-ks">{{ r.correctKeystrokes }}</span
                  >&nbsp;|&nbsp;<span class="wrong-ks">{{
                    r.incorrectKeystrokes
                  }}</span
                  >)
                </td>
                <td class="stat-value">{{ r.totalKeystrokes }}</td>
              </tr>
              <tr>
                <td class="stat-name">Accuracy</td>
                <td></td>
                <td class="stat-value">{{ r.accuracy }}%</td>
              </tr>
              <tr>
                <td class="stat-name">Correct words</td>
                <td></td>
                <td class="stat-value correct-val">{{ r.correctWords }}</td>
              </tr>
              <tr>
                <td class="stat-name">Wrong words</td>
                <td></td>
                <td class="stat-value wrong-val">{{ r.errors }}</td>
              </tr>
            </tbody>
          </table>

          <div class="card-footer">
            <button class="retry-btn" (click)="retry()">↺ Try again</button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './results.component.css',
})
export class ResultsComponent {
  engine = inject(TypingEngineService);

  retry(): void {
    this.engine.reset(this.engine.state().timeLimit);
  }
}
