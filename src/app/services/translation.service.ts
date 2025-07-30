import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

export type LanguageCode = 'eng' | 'ru' | 'uz';

export interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSubject = new BehaviorSubject<LanguageCode>('uz');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();
  
  public activeLang: LanguageCode = 'uz';

  public readonly languages: Language[] = [
    { code: 'uz', name: 'O\'zbekcha', flag: '/assets/flags/uz.png' },
    { code: 'ru', name: 'Русский', flag: '/assets/flags/ru.png' },
    { code: 'eng', name: 'English', flag: '/assets/flags/en.png' }
  ];

  private readonly flagCodes: Record<LanguageCode, string> = {
    eng: '/assets/flags/en.png',
    ru: '/assets/flags/ru.png',
    uz: '/assets/flags/uz.png'
  };

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    let savedLanguage: LanguageCode = 'uz';
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('language') as LanguageCode;
      savedLanguage = stored || 'uz';
    }
    this.setLanguage(savedLanguage);
  }

  setLanguage(language: LanguageCode): void {
    this.translate.use(language);
    this.currentLanguageSubject.next(language);
    this.activeLang = language;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', language);
    }
  }

  getCurrentLanguage(): LanguageCode {
    return this.currentLanguageSubject.value;
  }

  setActiveLang(langId: LanguageCode): void {
    this.activeLang = langId;
    this.setLanguage(langId);
  }

  getLanguageName(code: LanguageCode): string {
    const language = this.languages.find(lang => lang.code === code);
    return language ? language.name : code;
  }

  getLanguageFlag(code: LanguageCode): string {
    const language = this.languages.find(lang => lang.code === code);
    return language ? language.flag : '/assets/flags/default.png';
  }

  getFlagCode(lang: LanguageCode): string {
    return this.flagCodes[lang];
  }

  getLanguageShortName(lang: LanguageCode): string {
    const shortNames: Record<LanguageCode, string> = {
      eng: 'Eng',
      ru: 'Rus',
      uz: 'Uz'
    };
    return shortNames[lang];
  }

  instant(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }
}