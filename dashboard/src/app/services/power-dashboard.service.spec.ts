import { TestBed } from '@angular/core/testing';

import { PowerDashboardService } from './power-dashboard.service';

describe('PowerDashboardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PowerDashboardService = TestBed.get(PowerDashboardService);
    expect(service).toBeTruthy();
  });
});
