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
  mode: AppMode | null;
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
          [class.disabled]="!item.mode"
          (click)="
            item.mode && item.mode !== modeService.mode() && select(item.mode)
          "
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
    {
      icon: '⚙',
      label: 'Custom Typing Test',
      sublabel: 'Create your own!',
      mode: null,
    },
    {
      icon: '👥',
      label: 'Multiplayer',
      sublabel: 'Play against others',
      mode: null,
    },
    {
      icon: '🏆',
      label: 'Typing Competition',
      sublabel: 'Who types the fastest?',
      mode: null,
    },
    {
      icon: '📄',
      label: 'Text Practice',
      sublabel: 'Practice your own text',
      mode: null,
    },
  ];

  select(mode: AppMode): void {
    this.modeService.setMode(mode);
  }
}
