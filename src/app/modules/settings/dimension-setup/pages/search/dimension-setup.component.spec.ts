import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DimensionSetupComponent } from './dimension-setup.component';

describe('DimensionSetupComponent', () => {
  let component: DimensionSetupComponent;
  let fixture: ComponentFixture<DimensionSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DimensionSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DimensionSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
