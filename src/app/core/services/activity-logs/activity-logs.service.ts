import { Injectable } from '@angular/core';
import { ResultsHttpService } from '../common/results-http.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Pagination, ResponseResult } from '@core/model/common';
import { SearchActivityLogsQuery } from '@core/model/activity-logs/search-activity-logs.query';
import { SearchActivityLogDto } from '@core/model/activity-logs/search-activity-logs.dto';
import { SEARCH_ACTIVITY_LOGS } from '@core/constants/activity-logs/activity-logs.constants';
import { HttpErrorResponse } from '@core/constants';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogsService {
  constructor(private resultHttpClient: ResultsHttpService) { }

  searchActivityLogs(query: SearchActivityLogsQuery) :
    Observable<ResponseResult<Pagination<SearchActivityLogDto>>> {
      return this.resultHttpClient
        .getSearchWithPagination<SearchActivityLogDto>(
          `${SEARCH_ACTIVITY_LOGS}?${this.resultHttpClient
            .serialiazeQueryString(query)}`, true
        )
        .pipe(map((response) => {
                  return response;
                }),
                catchError((error: HttpErrorResponse) => {
                  return throwError(() => error);
                })
              );
    }
}
