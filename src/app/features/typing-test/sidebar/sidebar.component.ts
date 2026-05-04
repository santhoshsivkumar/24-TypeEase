import { Component, inject } from '@angular/core';
import {
  AppModeService,
  AppMode,
  MODE_CONFIG,
} from '../../../core/services/app-mode.service';

interface NavItem {
  icon: string;
  label: string;
  sublabel: string;
  mode: AppMode;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  template: `
    <nav class="sidebar">
      @for (item of navItems; track item.label) {
        <div
          class="nav-item"
          [class.active]="item.mode === modeService.mode()"
          (click)="item.mode !== modeService.mode() && select(item.mode)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <div class="nav-text">
            <span class="nav-label">{{ item.label }}</span>
            <span class="nav-sublabel">{{ item.sublabel }}</span>
          </div>
        </div>
      }
    </nav>
  `,
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  modeService = inject(AppModeService);

  navItems: NavItem[] = [
    {
      icon: '▶',
      label: 'Typing Test',
      sublabel: 'Top 200 words',
      mode: 'top200',
    },
    {
      icon: '▶▶',
      label: 'Typing Test (advanced)',
      sublabel: 'Top 1000 words',
      mode: 'top1000',
    },
    { icon: '⚙', label: 'Custom Typing Test', sublabel: 'Create your own!', mode: 'custom' },
    { icon: '👥', label: 'Multiplayer', sublabel: 'Play against others', mode: 'multiplayer' },
    { icon: '🏆', label: 'Typing Competition', sublabel: 'Who types the fastest?', mode: 'competition' },
    { icon: '📄', label: 'Text Practice', sublabel: 'Practice your own text', mode: 'textpractice' },
  ];

  select(mode: AppMode): void {
    this.modeService.setMode(mode);
  }
}
