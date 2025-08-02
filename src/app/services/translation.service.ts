import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export type LanguageCode = 'eng' | 'ru' | 'uz';

export interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSubject = new BehaviorSubject<LanguageCode>('eng');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();
  
  public activeLang: LanguageCode = 'eng';
  private translationsLoaded = false;
  private apiUrl = `${environment.apiUrl}/translations`;

  public readonly languages: Language[] = [
    { 
      code: 'eng', 
      name: 'English', 
      nativeName: 'English', 
      flag: '/assets/flags/en.png',
      direction: 'ltr'
    },
    { 
      code: 'ru', 
      name: 'Russian', 
      nativeName: 'Русский', 
      flag: '/assets/flags/ru.png',
      direction: 'ltr'
    },
    { 
      code: 'eng', 
      name: 'English', 
      nativeName: 'English', 
      flag: '/assets/flags/en.png',
      direction: 'ltr'
    }
  ];

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {
    this.initializeTranslationService();
  }

  private initializeTranslationService(): void {
    // Set default language and fallback
    this.translate.setDefaultLang('eng');
    
    // Configure supported languages
    this.translate.addLangs(this.languages.map(lang => lang.code));
    
    // Initialize current language
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    let savedLanguage: LanguageCode = 'eng';
    if (isPlatformBrowser(this.platformId)) {
      savedLanguage = (localStorage.getItem('language') as LanguageCode) || 'eng';
      
      // Check browser language if no saved preference
      if (!localStorage.getItem('language')) {
        const browserLang = this.translate.getBrowserLang();
        if (browserLang && ['uz', 'ru', 'eng'].includes(browserLang)) {
          savedLanguage = browserLang as LanguageCode;
        }
      }
    }
    
    this.setLanguage(savedLanguage);
  }

  /**
   * Set application language and load translations
   * @param language Language code to set
   */
  setLanguage(language: LanguageCode): Observable<boolean> {
    if (this.translate.currentLang === language && this.translationsLoaded) {
      return of(true);
    }

    // First try to load from backend
    return this.http.get(`${this.apiUrl}/${language}.json`).pipe(
      tap(translations => {
        this.translate.setTranslation(language, translations, true);
        this.finalizeLanguageChange(language);
        this.translationsLoaded = true;
      }),
      catchError(() => {
        // Fall back to local translations if backend fails
        this.translate.use(language);
        this.finalizeLanguageChange(language);
        return of(true);
      }),
      map(() => true)
    );
  }

  private finalizeLanguageChange(language: LanguageCode): void {
    this.translate.use(language);
    this.currentLanguageSubject.next(language);
    this.activeLang = language;
    
    // Update document attributes
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', language);
      document.documentElement.lang = language;
      
      const currentLang = this.languages.find(l => l.code === language);
      if (currentLang) {
        document.documentElement.dir = currentLang.direction;
      }
    }
  }

  getCurrentLanguage(): LanguageCode {
    return this.currentLanguageSubject.value;
  }

  setActiveLang(langId: LanguageCode): Observable<boolean> {
    this.activeLang = langId;
    return this.setLanguage(langId);
  }

  getLanguageName(code: LanguageCode): string {
    const language = this.languages.find(lang => lang.code === code);
    return language ? language.name : code;
  }

  getNativeLanguageName(code: LanguageCode): string {
    const language = this.languages.find(lang => lang.code === code);
    return language ? language.nativeName : code;
  }

  getLanguageFlag(code: LanguageCode): string {
    const language = this.languages.find(lang => lang.code === code);
    return language ? language.flag : '/assets/flags/default.png';
  }

  getFlagCode(code: LanguageCode): string {
    return this.getLanguageFlag(code);
  }

  getLanguageDirection(code: LanguageCode): 'ltr' | 'rtl' {
    const language = this.languages.find(lang => lang.code === code);
    return language ? language.direction : 'ltr';
  }

  getLanguageShortName(lang: LanguageCode): string {
    const shortNames: Record<LanguageCode, string> = {
      eng: 'EN',
      ru: 'RU',
      uz: 'UZ'
    };
    return shortNames[lang];
  }

  instant(key: string | string[], params?: any): string {
    return this.translate.instant(key, params);
  }

  /**
   * Get translation as observable
   * @param key Translation key
   * @param params Optional parameters
   */
  get(key: string | string[], params?: any): Observable<string> {
    return this.translate.get(key, params);
  }

  /**
   * Load additional translations from backend
   * @param namespace Translation namespace to load
   */
  loadAdditionalTranslations(namespace: string): Observable<boolean> {
    const currentLang = this.getCurrentLanguage();
    return this.http.get(`${this.apiUrl}/${namespace}/${currentLang}.json`).pipe(
      tap(translations => {
        this.translate.setTranslation(currentLang, translations, true);
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * Reload translations from backend
   */
  reloadTranslations(): Observable<boolean> {
    const currentLang = this.getCurrentLanguage();
    this.translationsLoaded = false;
    return this.setLanguage(currentLang);
  }

  /**
   * Detect and set appropriate language based on user preferences
   */
  detectLanguage(): Observable<LanguageCode> {
    if (!isPlatformBrowser(this.platformId)) {
      return of('eng');
    }

    // 1. Check saved preference
    const savedLang = localStorage.getItem('language') as LanguageCode;
    if (savedLang) {
      return of(savedLang);
    }

    // 2. Check browser language
    const browserLang = this.translate.getBrowserLang();
    if (browserLang && ['uz', 'ru', 'eng'].includes(browserLang)) {
      return of(browserLang as LanguageCode);
    }

    // 3. Check browser languages (multiple) - using getBrowserLang as fallback
    const browserLangFallback = this.translate.getBrowserLang();
    if (browserLangFallback && ['uz', 'ru', 'eng'].includes(browserLangFallback)) {
      return of(browserLangFallback as LanguageCode);
    }

    // 4. Default to Uzbek
    return of('eng');
  }
}