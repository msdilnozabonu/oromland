import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PlaceService } from '../../services/place.service';
import { City, PlaceType } from '../../models/place.model';

@Component({
  selector: 'app-city-selection',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './city-selection.component.html',
  styleUrl: './city-selection.component.scss'
})
export class CitySelectionComponent implements OnInit {
  cities: City[] = [];
  loading = true;
  placeType: PlaceType = PlaceType.CAMP;
  
  constructor(
    private placeService: PlaceService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get place type from route data
    this.placeType = this.route.snapshot.data['type'] || PlaceType.CAMP;
    this.loadCities();
  }

  loadCities() {
    this.placeService.getCities().subscribe({
      next: (cities) => {
        this.cities = cities;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.loading = false;
      }
    });
  }

  selectCity(city: City) {
    const route = this.placeType === PlaceType.CAMP ? '/camps' : '/sanatoriums';
    this.router.navigate([route, city.id]);
  }

  getPlaceTypeName(): string {
    return this.placeType === PlaceType.CAMP ? 'camps' : 'sanatoriums';
  }
}