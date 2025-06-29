import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampsSanatoriums } from './camps-sanatoriums.component';

describe('CampsSanatoriums', () => {
  let component: CampsSanatoriums;
  let fixture: ComponentFixture<CampsSanatoriums>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampsSanatoriums]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampsSanatoriums);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
