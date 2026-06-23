import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { FusionAuthAccountButtonComponent } from './fusion-auth-account-button.component';
import { FusionAuthService } from '../../fusion-auth.service';

describe('FusionauthAccountButtonComponent', () => {
  let component: FusionAuthAccountButtonComponent;
  let fixture: ComponentFixture<FusionAuthAccountButtonComponent>;
  const mockService = { manageAccount: vi.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FusionAuthAccountButtonComponent],
      providers: [{ provide: FusionAuthService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FusionAuthAccountButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should invoke the `manageAccount` method', () => {
    expect(component).toBeTruthy();
    component.manageAccount();
    expect(mockService.manageAccount).toHaveBeenCalled();
  });
});
