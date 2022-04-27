import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentGraphicalViewComponent } from './payment-graphical-view.component';

describe('PaymentGraphicalViewComponent', () => {
  let component: PaymentGraphicalViewComponent;
  let fixture: ComponentFixture<PaymentGraphicalViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentGraphicalViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentGraphicalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
