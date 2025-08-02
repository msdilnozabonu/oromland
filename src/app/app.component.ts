import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './services/auth.service';
import { TranslationService, Language, LanguageCode } from './services/translation.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, TranslateModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class App implements OnInit {
  title = 'oromland';
  currentUser: User | null = null;
  currentLanguage: LanguageCode = 'eng';
  activeLang: LanguageCode = 'eng';
  languages: Language[] = [];
  isMenuOpen = false;
  isDarkMode = false;

  constructor(
    private authService: AuthService,
    public translationService: TranslationService,
    private router: Router
  ) {
    this.languages = this.translationService.languages;
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.translationService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
      this.activeLang = lang;
    });
    
    // Initialize activeLang from service
    this.activeLang = this.translationService.activeLang;
    
    // Load dark mode preference
    this.loadDarkModePreference();
  }

  changeLanguage(language: LanguageCode) {
    this.translationService.setLanguage(language);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  getDashboardRoute(): string {
    return this.authService.getDashboardRoute();
  }

  goToAuth() {
    this.router.navigate(['/register']);
  }

  getLanguageShortName(lang: LanguageCode): string {
    return this.translationService.getLanguageShortName(lang);
  }

  selectLanguage(langCode: LanguageCode) {
    this.changeLanguage(langCode);
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.saveDarkModePreference();
    this.applyDarkModeToBody();
  }

  private loadDarkModePreference() {
    // Check if we're in browser environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedPreference = localStorage.getItem('darkMode');
      if (savedPreference !== null) {
        this.isDarkMode = JSON.parse(savedPreference);
      } else {
        // Default to light mode for first-time visitors
        this.isDarkMode = false;
      }
    } else {
      // Default to light mode for SSR
      this.isDarkMode = false;
    }
    this.applyDarkModeToBody();
  }

  private saveDarkModePreference() {
    // Check if we're in browser environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
    }
  }

  private applyDarkModeToBody() {
    // Check if we're in browser environment
    if (typeof document !== 'undefined') {
      if (this.isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  }
}
