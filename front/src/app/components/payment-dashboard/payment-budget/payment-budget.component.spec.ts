import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentBudgetComponent } from './payment-budget.component';

describe('PaymentBudgetComponent', () => {
  let component: PaymentBudgetComponent;
  let fixture: ComponentFixture<PaymentBudgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentBudgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
