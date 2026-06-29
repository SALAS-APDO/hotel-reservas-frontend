import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Destinos } from './destinos';

describe('Destinos', () => {
  let component: Destinos;
  let fixture: ComponentFixture<Destinos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Destinos],
    }).compileComponents();

    fixture = TestBed.createComponent(Destinos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
