import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FusionAuthLoginButtonComponent } from './fusion-auth-login-button.component';
import { FusionAuthService } from '../../fusion-auth.service';

describe('FusionauthLoginButtonComponent', () => {
  let component: FusionAuthLoginButtonComponent;
  let fixture: ComponentFixture<FusionAuthLoginButtonComponent>;
  const mockService = jasmine.createSpyObj('FusionAuthService', ['startLogin']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FusionAuthLoginButtonComponent],
      providers: [{ provide: FusionAuthService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FusionAuthLoginButtonComponent);
    component = fixture.componentInstance;
  });

  it('should invoke the startLogin method', () => {
    expect(component).toBeTruthy();
    const stateValue = 'state-value';
    component.state = stateValue;
    fixture.detectChanges();

    component.login();
    expect(mockService.startLogin).toHaveBeenCalledWith(stateValue);
  });
});
