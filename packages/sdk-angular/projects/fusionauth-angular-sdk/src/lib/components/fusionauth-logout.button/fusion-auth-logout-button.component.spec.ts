import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FusionAuthLogoutButtonComponent } from './fusion-auth-logout-button.component';
import { FusionAuthService } from '../../fusion-auth.service';

describe('FusionauthLogoutButtonComponent', () => {
  let component: FusionAuthLogoutButtonComponent;
  let fixture: ComponentFixture<FusionAuthLogoutButtonComponent>;
  const mockService = jasmine.createSpyObj('FusionAuthService', ['logout']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FusionAuthLogoutButtonComponent],
      providers: [{ provide: FusionAuthService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FusionAuthLogoutButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should invoke the logout method', () => {
    expect(component).toBeTruthy();
    component.logout();
    expect(mockService.logout).toHaveBeenCalled();
  });
});
