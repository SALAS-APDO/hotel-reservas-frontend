import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitacionesLimpieza } from './habitaciones-limpieza';

describe('HabitacionesLimpieza', () => {
  let component: HabitacionesLimpieza;
  let fixture: ComponentFixture<HabitacionesLimpieza>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitacionesLimpieza],
    }).compileComponents();

    fixture = TestBed.createComponent(HabitacionesLimpieza);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
