import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FusionAuthRegisterButtonComponent } from './fusion-auth-register-button.component';
import { FusionAuthService } from '../../fusion-auth.service';

describe('FusionauthRegisterButtonComponent', () => {
  let component: FusionAuthRegisterButtonComponent;
  let fixture: ComponentFixture<FusionAuthRegisterButtonComponent>;
  const mockService = jasmine.createSpyObj('FusionAuthService', [
    'startRegistration',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FusionAuthRegisterButtonComponent],
      providers: [{ provide: FusionAuthService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FusionAuthRegisterButtonComponent);
    component = fixture.componentInstance;
  });

  it('should invoke the startRegistration method', () => {
    expect(component).toBeTruthy();

    const stateValue = 'hello-world';
    component.state = stateValue;
    fixture.detectChanges();

    component.register();
    expect(mockService.startRegistration).toHaveBeenCalledWith(stateValue);
  });
});
