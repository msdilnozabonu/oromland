import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PlaceService } from '../../services/place.service';
import { Place, PlaceType, City } from '../../models/place.model';

@Component({
  selector: 'app-place-list',
  imports: [CommonModule, RouterLink, TranslateModule, FormsModule],
  templateUrl: './place-list.component.html',
  styleUrl: './place-list.component.scss'
})
export class PlaceListComponent implements OnInit {
  places: Place[] = [];
  loading = true;
  placeType: PlaceType = PlaceType.CAMP;
  cityId: number = 0;
  cityName: string = '';
  searchTerm: string = '';
  
  constructor(
    private placeService: PlaceService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.cityId = +params['cityId'];
      this.placeType = this.route.snapshot.data['type'] || PlaceType.CAMP;
      this.loadPlaces();
    });
  }

  loadPlaces() {
    this.loading = true;
    
    const loadMethod = this.placeType === PlaceType.CAMP 
      ? this.placeService.getCamps(this.cityId)
      : this.placeService.getSanatoriums(this.cityId);

    loadMethod.subscribe({
      next: (places) => {
        this.places = places;
        if (places.length > 0 && places[0].city) {
          this.cityName = places[0].city.name;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading places:', error);
        this.loading = false;
      }
    });
  }

  getFilteredPlaces(): Place[] {
    if (!this.searchTerm) {
      return this.places;
    }
    
    return this.places.filter(place => 
      place.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (place.description && Object.values(place.description).some(desc => 
        desc.toLowerCase().includes(this.searchTerm.toLowerCase())
      ))
    );
  }

  viewPlace(place: Place) {
    const route = this.placeType === PlaceType.CAMP ? '/camps' : '/sanatoriums';
    this.router.navigate([route, this.cityId, place.id]);
  }

  getPlaceTypeName(): string {
    return this.placeType === PlaceType.CAMP ? 'camps' : 'sanatoriums';
  }

  getBackRoute(): string {
    return this.placeType === PlaceType.CAMP ? '/camps' : '/sanatoriums';
  }

  getPlaceDescription(place: Place): string {
    if (typeof place.description === 'string') {
      return place.description;
    }
    
    if (place.description) {
      const desc = place.description as any;
      return desc['uz'] || desc['en'] || desc['ru'] || 'No description available';
    }
    
    return 'No description available';
  }
}