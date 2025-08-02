import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PlaceService } from '../../services/place.service';
import { FeedbackService } from '../../services/feedback.service';
import { AuthService } from '../../services/auth.service';
import { Place, PlaceType, Group } from '../../models/place.model';
import { Feedback } from '../../models/feedback.model';

@Component({
  selector: 'app-place-detail',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './place-detail.component.html',
  styleUrl: './place-detail.component.scss'
})
export class PlaceDetailComponent implements OnInit {
  place: Place | null = null;
  groups: Group[] = [];
  feedbacks: Feedback[] = [];
  loading = true;
  placeType: PlaceType = PlaceType.CAMP;
  placeId: number = 0;
  cityId: number = 0;
  
  constructor(
    private placeService: PlaceService,
    private feedbackService: FeedbackService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.placeId = +params['campId'] || +params['sanatoriumId'];
      this.cityId = +params['cityId'];
      this.placeType = this.route.snapshot.data['type'] || PlaceType.CAMP;
      this.loadPlaceDetails();
    });
  }

  loadPlaceDetails() {
    this.loading = true;
    
    // Load place details
    this.placeService.getPlaceById(this.placeId).subscribe({
      next: (place) => {
        this.place = place;
        this.loadGroups();
        this.loadFeedbacks();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading place details:', error);
        this.loading = false;
      }
    });
  }

  loadGroups() {
    this.placeService.getPlaceGroups(this.placeId).subscribe({
      next: (groups) => {
        this.groups = groups;
      },
      error: (error) => {
        console.error('Error loading groups:', error);
      }
    });
  }

  loadFeedbacks() {
    const placeTypeString = this.placeType === PlaceType.SANATORIUM ? 'sanatorium' : 'camp';
    this.feedbackService.getPlaceFeedbacks(this.placeId, placeTypeString, 0, 5).subscribe({
      next: (response) => {
        this.feedbacks = response.content;
      },
      error: (error) => {
        console.error('Error loading feedbacks:', error);
      }
    });
  }

  bookPlace() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: this.router.url } 
      });
      return;
    }

    // Navigate to booking page
    this.router.navigate(['/dashboard/user/overview'], {
      queryParams: { placeId: this.placeId }
    });
  }

  getBackRoute(): string {
    const type = this.placeType === PlaceType.CAMP ? 'camps' : 'sanatoriums';
    return `/${type}/${this.cityId}`;
  }

  getPlaceDescription(): string {
    if (!this.place?.description) return 'No description available';
    
    if (typeof this.place.description === 'string') {
      return this.place.description;
    }
    
    const desc = this.place.description as any;
    return desc['uz'] || desc['en'] || desc['ru'] || 'No description available';
  }

  getAvailableSpots(): number {
    return this.groups.reduce((total, group) => total + group.availableSpots, 0);
  }

  getTotalCapacity(): number {
    return this.groups.reduce((total, group) => total + group.totalCapacity, 0);
  }

  getAverageRating(): number {
    if (this.feedbacks.length === 0) return 0;
    const sum = this.feedbacks.reduce((total, feedback) => total + feedback.rating, 0);
    return Math.round((sum / this.feedbacks.length) * 10) / 10;
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < Math.floor(rating));
  }
}