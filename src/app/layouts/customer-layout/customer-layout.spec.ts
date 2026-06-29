import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerLayoutComponent } from './customer-layout'; // 👈 Corregido

describe('CustomerLayoutComponent', () => {
  let component: CustomerLayoutComponent; // 👈 Corregido
  let fixture: ComponentFixture<CustomerLayoutComponent>; // 👈 Corregido

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerLayoutComponent], // 👈 Corregido
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerLayoutComponent); // 👈 Corregido
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});