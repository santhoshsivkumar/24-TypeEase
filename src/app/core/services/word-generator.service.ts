import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WordGeneratorService {
  private pool: string[] = [];

  constructor(private http: HttpClient) {}

  async load(url = 'words/en-200.json'): Promise<void> {
    const words = await firstValueFrom(this.http.get<string[]>(url));
    this.pool = words;
  }

  /** Plain shuffled words — used for basic mode. */
  generate(count: number): string[] {
    if (this.pool.length === 0) return [];
    const result: string[] = [];
    const shuffled = [...this.pool].sort(() => Math.random() - 0.5);
    while (result.length < count) {
      result.push(...shuffled);
    }
    return result.slice(0, count);
  }

  /**
   * Sentence-style words — capitalised start, period at end of each sentence.
   * Sentence length is random between min and max (inclusive).
   */
  generateSentences(count: number, minLen = 6, maxLen = 12): string[] {
    if (this.pool.length === 0) return [];

    const flat: string[] = [];
    const shuffled = [...this.pool].sort(() => Math.random() - 0.5);
    // fill enough raw words
    while (flat.length < count) flat.push(...shuffled);
    const raw = flat.slice(0, count);

    const result: string[] = [];
    let i = 0;
    while (i < raw.length) {
      const len = minLen + Math.floor(Math.random() * (maxLen - minLen + 1));
      const sentence = raw.slice(i, i + len);
      if (sentence.length === 0) break;
      // capitalise first word
      sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
      // add period to last word
      sentence[sentence.length - 1] += '.';
      result.push(...sentence);
      i += len;
    }
    return result.slice(0, count);
  }
}
