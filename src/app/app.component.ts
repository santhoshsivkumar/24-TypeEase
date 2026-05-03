import { Component } from '@angular/core';
import { TypingTestComponent } from './features/typing-test/typing-test.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TypingTestComponent],
  template: '<app-typing-test />',
})
export class AppComponent {}
