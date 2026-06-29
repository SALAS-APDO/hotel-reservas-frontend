import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleReserva } from './detalle-reserva';

describe('DetalleReserva', () => {
  let component: DetalleReserva;
  let fixture: ComponentFixture<DetalleReserva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleReserva],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleReserva);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
