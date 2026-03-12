import { Routes } from '@angular/router';
import { ActivityLogsComponent } from './activity-logs/activity-logs.component';

export const REPORTS_ROUTES: Routes = [
  {
    path: 'activity-logs',
    component: ActivityLogsComponent,
  },
]