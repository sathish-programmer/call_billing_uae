import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTariffComponent } from './manage-tariff.component';

describe('ManageTariffComponent', () => {
  let component: ManageTariffComponent;
  let fixture: ComponentFixture<ManageTariffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageTariffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTariffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
