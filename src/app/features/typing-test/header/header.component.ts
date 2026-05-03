import { Component, inject, signal, HostListener } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

const LANGUAGES = [{ code: 'en', label: 'English' }];

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="site-header">
      <div class="header-top">
        <div class="logo">
          <span class="logo-icon">⌨</span>
          <span class="logo-text"><strong>TYPE</strong>EASE</span>
        </div>
        <span class="tagline">Improve your Typing Speed</span>
        <button
          class="theme-toggle"
          (click)="themeService.toggle()"
          [title]="
            themeService.theme() === 'dark'
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          "
        >
          {{ themeService.theme() === 'dark' ? '☀' : '☾' }}
        </button>
      </div>
      <div class="header-sub">
        <span class="lang-label">
          Language:
          <span class="lang-trigger" (click)="toggle($event)">
            <strong>{{ selectedLabel }}</strong>
            <span class="lang-arrow" [class.open]="open()">▾</span>
            @if (open()) {
              <ul class="lang-menu">
                @for (lang of languages; track lang.code) {
                  <li
                    class="lang-option"
                    [class.selected]="lang.code === selectedCode"
                    (click)="select(lang.code, $event)"
                  >
                    {{ lang.label }}
                  </li>
                }
              </ul>
            }
          </span>
        </span>
      </div>
    </header>
  `,
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  themeService = inject(ThemeService);

  languages = LANGUAGES;
  selectedCode = 'en';
  open = signal(false);

  get selectedLabel(): string {
    return (
      this.languages.find((l) => l.code === this.selectedCode)?.label ??
      'English'
    );
  }

  toggle(e: MouseEvent): void {
    e.stopPropagation();
    this.open.update((v) => !v);
  }

  select(code: string, e: MouseEvent): void {
    e.stopPropagation();
    this.selectedCode = code;
    this.open.set(false);
  }

  @HostListener('document:click')
  closeOnOutside(): void {
    this.open.set(false);
  }
}
