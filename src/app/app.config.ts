import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

function preloadWordLists(http: HttpClient) {
  return () => Promise.all([
    firstValueFrom(http.get('words/en-200.json')),
    firstValueFrom(http.get('words/en-1000.json')),
  ]);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: preloadWordLists,
      deps: [HttpClient],
      multi: true,
    },
  ],
};
