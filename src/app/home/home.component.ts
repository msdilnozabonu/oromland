import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PlaceService } from '../services/place.service';
import { Place, PlaceType, Season } from '../models/place.model';

interface Testimonial {
  name: string;
  location: string;
  content: string;
  rating: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('placesCarousel', { static: false }) placesCarousel!: ElementRef;
  @ViewChild('testimonialsCarousel', { static: false }) testimonialsCarousel!: ElementRef;

  topPlaces: Place[] = [];
  extendedPlaces: Place[] = [];
  loading = true;

  // Places carousel properties
  currentPlaceIndex = 0;
  placesTransform = 0;
  placesAutoSlideInterval: any;
  placesCardWidth = 350; // Base card width + margin
  placesVisibleCards = 3; // Default for desktop

  // Testimonials data and carousel properties
  testimonials: Testimonial[] = [
    {
      name: 'Malika',
      location: 'Tashkent',
      content: 'My son had the best summer ever! The creative camp was amazing and he learned so much while having fun.',
      rating: '★★★★★'
    },
    {
      name: 'Islom aka',
      location: 'Bukhara',
      content: 'I felt 20 years younger after the sanatorium stay! The wellness program was exactly what I needed.',
      rating: '★★★★★'
    },
    {
      name: 'Sevara',
      location: 'Samarkand',
      content: 'The mountain resort was breathtaking! Perfect place for family vacation with excellent facilities.',
      rating: '★★★★★'
    },
    {
      name: 'Bobur',
      location: 'Fergana',
      content: 'Amazing desert experience! The traditional yurts and stargazing made it unforgettable.',
      rating: '★★★★★'
    }
  ];

  extendedTestimonials: Testimonial[] = [];
  currentTestimonialIndex = 0;
  testimonialsTransform = 0;
  testimonialsAutoSlideInterval: any;
  testimonialsCardWidth = 400; // Base card width + margin
  testimonialsVisibleCards = 1; // Default for mobile-first

  constructor(
    private placeService: PlaceService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadTopPlaces();
    this.setupCarousels();
    
    // Debug: Log image paths
    console.log('Sample places with images:', this.topPlaces.slice(0, 2).map((p: any) => ({
      name: p.name,
      images: p.images
    })));
    
    if (isPlatformBrowser(this.platformId)) {
      this.updateCarouselSettings();
      this.startAutoSlide();
      
      // Listen for window resize
      window.addEventListener('resize', () => this.updateCarouselSettings());
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.placesAutoSlideInterval) {
        clearInterval(this.placesAutoSlideInterval);
      }
      if (this.testimonialsAutoSlideInterval) {
        clearInterval(this.testimonialsAutoSlideInterval);
      }
      window.removeEventListener('resize', () => this.updateCarouselSettings());
    }
  }

  loadTopPlaces() {
    this.placeService.getTopPlaces().subscribe({
      next: (places) => {
        this.topPlaces = places;
        this.setupCarousels();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading top places:', error);
        this.loading = false;
        // Fallback to empty array or mock data when backend is unavailable
        this.topPlaces = this.getFallbackPlaces();
        this.setupCarousels();
      }
    });
  }

  setupCarousels() {
    // Setup places carousel with infinite scroll
    if (this.topPlaces.length > 0) {
      this.extendedPlaces = [
        ...this.topPlaces.slice(-2), // Last 2 items at the beginning
        ...this.topPlaces,
        ...this.topPlaces.slice(0, 2)  // First 2 items at the end
      ];
    }

    // Setup testimonials carousel with infinite scroll
    this.extendedTestimonials = [
      ...this.testimonials.slice(-2), // Last 2 items at the beginning
      ...this.testimonials,
      ...this.testimonials.slice(0, 2)  // First 2 items at the end
    ];
  }

  updateCarouselSettings() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const width = window.innerWidth;
    
    // Update places carousel settings
    if (width < 768) {
      this.placesVisibleCards = 1;
      this.placesCardWidth = width - 40; // Full width minus padding
    } else if (width < 992) {
      this.placesVisibleCards = 2;
      this.placesCardWidth = (width - 80) / 2; // Half width minus padding
    } else {
      this.placesVisibleCards = 3;
      this.placesCardWidth = 350;
    }

    // Update testimonials carousel settings
    if (width < 768) {
      this.testimonialsVisibleCards = 1;
      this.testimonialsCardWidth = width - 40;
    } else if (width < 992) {
      this.testimonialsVisibleCards = 2;
      this.testimonialsCardWidth = (width - 80) / 2;
    } else {
      this.testimonialsVisibleCards = 2;
      this.testimonialsCardWidth = 500;
    }

    this.updateCarouselPositions();
  }

  updateCarouselPositions() {
    // Update places carousel position
    const placesOffset = (this.currentPlaceIndex + 2) * this.placesCardWidth;
    this.placesTransform = -placesOffset;

    // Update testimonials carousel position
    const testimonialsOffset = (this.currentTestimonialIndex + 2) * this.testimonialsCardWidth;
    this.testimonialsTransform = -testimonialsOffset;
  }

  startAutoSlide() {
    // Auto-slide places carousel every 4 seconds
    this.placesAutoSlideInterval = setInterval(() => {
      this.nextPlace();
    }, 4000);

    // Auto-slide testimonials carousel every 5 seconds
    this.testimonialsAutoSlideInterval = setInterval(() => {
      this.nextTestimonial();
    }, 5000);
  }

  // Places carousel methods
  nextPlace() {
    this.currentPlaceIndex = (this.currentPlaceIndex + 1) % this.topPlaces.length;
    this.updateCarouselPositions();
    this.checkPlacesInfiniteLoop();
  }

  prevPlace() {
    this.currentPlaceIndex = this.currentPlaceIndex === 0 ? this.topPlaces.length - 1 : this.currentPlaceIndex - 1;
    this.updateCarouselPositions();
    this.checkPlacesInfiniteLoop();
  }

  goToPlace(index: number) {
    this.currentPlaceIndex = index;
    this.updateCarouselPositions();
  }

  checkPlacesInfiniteLoop() {
    setTimeout(() => {
      if (this.currentPlaceIndex === 0) {
        // Jump to the real first item (after the duplicated last items)
        this.placesTransform = -(2 * this.placesCardWidth);
      } else if (this.currentPlaceIndex === this.topPlaces.length - 1) {
        // Jump to the real last item (before the duplicated first items)
        this.placesTransform = -((this.topPlaces.length + 1) * this.placesCardWidth);
      }
    }, 300); // Wait for transition to complete
  }

  // Testimonials carousel methods
  nextTestimonial() {
    this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % this.testimonials.length;
    this.updateCarouselPositions();
    this.checkTestimonialsInfiniteLoop();
  }

  prevTestimonial() {
    this.currentTestimonialIndex = this.currentTestimonialIndex === 0 ? this.testimonials.length - 1 : this.currentTestimonialIndex - 1;
    this.updateCarouselPositions();
    this.checkTestimonialsInfiniteLoop();
  }

  goToTestimonial(index: number) {
    this.currentTestimonialIndex = index;
    this.updateCarouselPositions();
  }

  checkTestimonialsInfiniteLoop() {
    setTimeout(() => {
      if (this.currentTestimonialIndex === 0) {
        // Jump to the real first item (after the duplicated last items)
        this.testimonialsTransform = -(2 * this.testimonialsCardWidth);
      } else if (this.currentTestimonialIndex === this.testimonials.length - 1) {
        // Jump to the real last item (before the duplicated first items)
        this.testimonialsTransform = -((this.testimonials.length + 1) * this.testimonialsCardWidth);
      }
    }, 300); // Wait for transition to complete
  }

  private getFallbackPlaces(): Place[] {
    return [
      {
        id: 1,
        name: 'Chimgan Mountain Resort',
        description: {
          'uz': 'Oila dam olish va ochiq havoda faoliyat uchun ajoyib tog\' kurortu.',
          'en': 'Beautiful mountain resort perfect for family vacations and outdoor activities.',
          'ru': 'Прекрасный горный курорт, идеальный для семейного отдыха и активного отдыха.'
        },
        type: PlaceType.CAMP,
        cityId: 1,
        locationId: 1,
        availableSeasons: [Season.SPRING, Season.SUMMER, Season.AUTUMN],
        createdBy: 1,
        images: [
          'https://e7.pngegg.com/pngimages/493/598/png-clipart-debit-card-child-online-banking-child-angle-child.png',
        ],
        amenities: ['WiFi', 'Restaurant', 'Pool', 'Spa', 'Mountain View'],
        rating: 4.5,
        price: 150000,
        groups: []
      },
      {
        id: 2,
        name: 'Samarkand Health Sanatorium',
        description: {
          'uz': 'Zamonaviy tibbiy asbob-uskunalar bilan jihozlangan yuqori sifatli salomatlik va sog\'lomlashtirish muassasasi.',
          'en': 'Premium health and wellness facility with modern medical equipment.',
          'ru': 'Премиальный оздоровительный центр с современным медицинским оборудованием.'
        },
        type: PlaceType.SANATORIUM,
        cityId: 2,
        locationId: 2,
        availableSeasons: [Season.SPRING, Season.SUMMER, Season.AUTUMN, Season.WINTER],
        createdBy: 1,
        images: [
          'https://avatars.mds.yandex.net/i?id=31199cac7d54739448076a1194b29942f7b212ac-4809555-images-thumbs&n=1328',
        ],
        amenities: ['Medical Care', 'Spa', 'Gym', 'Restaurant', 'WiFi'],
        rating: 4.8,
        price: 200000,
        groups: []
      },
      {
        id: 3,
        name: 'Bukhara Heritage Camp',
        description: {
          'uz': 'Ushbu asl meros lagerida an\'anaviy o\'zbek madaniyatini his eting.',
          'en': 'Experience traditional Uzbek culture in this authentic heritage camp.',
          'ru': 'Познакомьтесь с традиционной узбекской культурой в этом аутентичном лагере наследия.'
        },
        type: PlaceType.CAMP,
        cityId: 3,
        locationId: 3,
        availableSeasons: [Season.SPRING, Season.SUMMER, Season.AUTUMN],
        createdBy: 1,
        images: [
          'https://e7.pngegg.com/pngimages/493/598/png-clipart-debit-card-child-online-banking-child-angle-child.png',
        ],
        amenities: ['Cultural Tours', 'Traditional Food', 'WiFi', 'Gift Shop'],
        rating: 4.3,
        price: 120000,
        groups: []
      },
      {
        id: 4,
        name: 'Tashkent Wellness Sanatorium',
        description: {
          'uz': 'Poytaxtda joylashgan zamonaviy sog\'lomlashtirish markazi.',
          'en': 'Modern wellness center located in the capital city.',
          'ru': 'Современный оздоровительный центр, расположенный в столице.'
        },
        type: PlaceType.SANATORIUM,
        cityId: 1,
        locationId: 1,
        availableSeasons: [Season.SPRING, Season.SUMMER, Season.AUTUMN, Season.WINTER],
        createdBy: 1,
        images: [
          'https://avatars.mds.yandex.net/i?id=31199cac7d54739448076a1194b29942f7b212ac-4809555-images-thumbs&n=1328',
        ],
        amenities: ['Medical Care', 'Spa', 'Fitness Center', 'Pool', 'Restaurant'],
        rating: 4.6,
        price: 180000,
        groups: []
      },
      {
        id: 5,
        name: 'Fergana Valley Adventure Camp',
        description: {
          'uz': 'Farg\'ona vodiysida sarguzasht va tabiat sevuvchilar uchun lager.',
          'en': 'Adventure camp for nature lovers in the beautiful Fergana Valley.',
          'ru': 'Приключенческий лагерь для любителей природы в прекрасной Ферганской долине.'
        },
        type: PlaceType.CAMP,
        cityId: 4,
        locationId: 4,
        availableSeasons: [Season.SPRING, Season.SUMMER, Season.AUTUMN],
        createdBy: 1,
        images: [
          'https://e7.pngegg.com/pngimages/493/598/png-clipart-debit-card-child-online-banking-child-angle-child.png',
        ],
        amenities: ['Hiking Trails', 'Camping', 'Bonfire Area', 'WiFi', 'Adventure Sports'],
        rating: 4.4,
        price: 130000,
        groups: []
      },
      {
        id: 6,
        name: 'Khiva Desert Retreat',
        description: {
          'uz': 'Xiva yaqinidagi cho\'l muhitida noyob dam olish tajribasi.',
          'en': 'Unique desert retreat experience near the historic city of Khiva.',
          'ru': 'Уникальный опыт отдыха в пустыне рядом с историческим городом Хива.'
        },
        type: PlaceType.CAMP,
        cityId: 5,
        locationId: 5,
        availableSeasons: [Season.SPRING, Season.AUTUMN, Season.WINTER],
        createdBy: 1,
        images: [
          'https://e7.pngegg.com/pngimages/493/598/png-clipart-debit-card-child-online-banking-child-angle-child.png',
        ],
        amenities: ['Desert Tours', 'Stargazing', 'Traditional Yurts', 'Camel Rides', 'Cultural Shows'],
        rating: 4.7,
        price: 170000,
        groups: []
      }
    ];
  }

  getPlaceRoute(place: Place): string {
    const cityId = place.cityId || 1; // Default city if not specified
    const placeType = place.type === PlaceType.CAMP ? 'camps' : 'sanatoriums';
    return `/${placeType}/${cityId}/${place.id}`;
  }

  getPlaceTypeRoute(type: string): string {
    return `/${type.toLowerCase()}s`;
  }

  getPlaceDescription(place: Place): string {
    if (place.description) {
      if (typeof place.description === 'string') {
        return place.description;
      } else if (typeof place.description === 'object') {
        // Try to get description in current language or fallback
        const desc = place.description as any;
        return desc['uz'] || desc['en'] || desc['ru'] || 'No description available';
      }
    }
    return 'No description available';
  }



  getDefaultImage(placeType: PlaceType): string {
    if (placeType === PlaceType.CAMP) {
      return 'assets/camp-default.png';
    } else {
      return 'assets/sanatorium-default.png';
    }
  }

  onImageError(event: any, placeType: PlaceType) {
    const img = event.target;
    console.log('Image error for:', img.src, 'PlaceType:', placeType);
    
    // If the current src is already a default image, try Unsplash fallback
    if (img.src.includes('/assets/')) {
      console.log('Local asset failed, trying Unsplash fallback');
      if (placeType === PlaceType.CAMP) {
        img.src = 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80';
      } else {
        img.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80';
      }
    } else {
      console.log('Trying local default image');
      // First fallback to local default
      img.src = this.getDefaultImage(placeType);
    }
  }

  onImageLoad(event: any) {
    const img = event.target;
    console.log('Image loaded successfully:', img.src);
    const placeholder = img.nextElementSibling;
    if (placeholder && placeholder.classList.contains('image-loading-placeholder')) {
      placeholder.style.display = 'none';
    }
  }
}
