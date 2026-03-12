import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SearchActivityLogDto } from '@core/model/activity-logs/search-activity-logs.dto';
import { SearchActivityLogsQuery } from '@core/model/activity-logs/search-activity-logs.query';
import { Pagination, ResponseResult } from '@core/model/common';
import { ActivityLogsService } from '@core/services/activity-logs/activity-logs.service';
import { Table } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';

interface ActivityLogGridItem {
  actionDate: string;
  action: string;
  activityClass: string;
  previousValue: string;
  newValue: string;
  reason: string;
  actionedBy: string;
}

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [],
  templateUrl: './activity-logs.component.html',
  styleUrl: './activity-logs.component.scss'
})
export class ActivityLogsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private activityLogsService: ActivityLogsService) { }
  
  activityLogs: ActivityLogGridItem[] = [];
  totalRecords = 0;
  pageNumber = 1;
  pageSize = 10;
  sortField = '';
  sortOrder = 1;
  triggeredBySearch = false;
  loading = false;

  @ViewChild('dtActivityLogs') table: Table | undefined;

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLazyLoad(event: any): void {
    if (this.triggeredBySearch) {
      this.triggeredBySearch = false;
      return;
    }

    this.sortField = event.sortField ? event.sortField : '';
    this.sortOrder = event.sortOrder ? event.sortOrder : 1;
    this.loading = true;
    this.pageNumber = Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.loadActivityLogs();
  }

  private loadActivityLogs(): void {
    const query = this.buildSearchQuery();
    this.loading = true;

    this.activityLogsService
      .searchActivityLogs(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ( result:
          ResponseResult<Pagination<SearchActivityLogDto>>
        ) => {
          if (result.isSuccess && result.responseData) {
            console.log(result.responseData.data);
            this.totalRecords = result.responseData.totalCount;
          }
          else {
            this.activityLogs = [];
            this.totalRecords = 0;
          }

          this.loading = false;
          this.triggeredBySearch = false;
        },
        error: () => {
          this.activityLogs = [];
          this.totalRecords = 0;
          this.loading = false;
          this.triggeredBySearch = false;
        },
      });
  }

  private buildSearchQuery(): SearchActivityLogsQuery {
    const query: SearchActivityLogsQuery = {
      PageNumber: this.pageNumber || 1,
      PageSize: this.pageSize,
    }

    return query;
  }
}
