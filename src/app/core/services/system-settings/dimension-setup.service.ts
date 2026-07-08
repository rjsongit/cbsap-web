import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { ResultsHttpService } from '../common/results-http.service';
import { Pagination, ResponseResult } from '@core/model/common';
import { DimensionSetupSearchQuery } from '@core/model/system-settings/dimension-setup/dimension-setup.query';
import { DimensionSetupSearchDto } from '@core/model/system-settings/dimension-setup/dimension-setup-searchDtos';
import { DIMENSION_SETUP_ENPOINT } from '@core/constants/system-settings/dimension-setup.constants';
@Injectable({
  providedIn: 'root',
})
export class DimensionSetupService {
  constructor(
    private resultHttpClient: ResultsHttpService,
  ) {}

  /** Archive Invoice */
  dimensionSetupSearch(
    query: DimensionSetupSearchQuery
  ): Observable<ResponseResult<Pagination<DimensionSetupSearchDto>>> {
    return this.resultHttpClient
      .getSearchWithPagination<DimensionSetupSearchDto>(
        `${
            DIMENSION_SETUP_ENPOINT.GET_DIMENSION_SETUP_QUERY
        }${this.resultHttpClient.serialiazeQueryString(query)}`,
        true
      )
      .pipe(
        map((response) => {
         
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  getAllDimensionSetup(
    ): Observable<ResponseResult<DimensionSetupSearchDto[]>> {
      return this.resultHttpClient.get
        <DimensionSetupSearchDto[]>(
          `${DIMENSION_SETUP_ENPOINT.GET_ALL_DIMENSION_SETUP_QUERY}`,
          true
        )
        .pipe(
          map((response) => {
            return response;
          }),
          catchError((error: HttpErrorResponse) => {
            return throwError(() => error);
          })
        );
    }
  

  updatedimensionSetup(request: DimensionSetupSearchDto): Observable<ResponseResult<boolean>> {
    return this.resultHttpClient
      .put<boolean>(`${DIMENSION_SETUP_ENPOINT.DIMENSION_SETUP}`, request, true)
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }




}
