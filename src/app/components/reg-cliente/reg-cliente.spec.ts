import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegCliente } from './reg-cliente';

describe('RegCliente', () => {
  let component: RegCliente;
  let fixture: ComponentFixture<RegCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(RegCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
