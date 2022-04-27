import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMasterComponent } from './payment-master.component';

describe('PaymentMasterComponent', () => {
  let component: PaymentMasterComponent;
  let fixture: ComponentFixture<PaymentMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
