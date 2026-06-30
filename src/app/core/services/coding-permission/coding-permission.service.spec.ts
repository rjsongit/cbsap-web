import { TestBed } from '@angular/core/testing';

import { CodingPermissionService } from './coding-permission.service';

describe('CodingPermissionService', () => {
  let service: CodingPermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodingPermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
