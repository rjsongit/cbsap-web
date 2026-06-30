import { inject, Injectable } from '@angular/core';
import { HttpService } from '../common/http.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ResponseResult } from '@core/model/common';
import { CodingPermissionCategoryDTO } from '@core/model/account-dimension-permission/dtos/CodingPermissionCategoryDTO';
import { CODING_PERMISSION, CODING_PERMISSION_CATEGORIES, HttpErrorResponse } from '@core/constants';
import { ResultsHttpService } from '../common/results-http.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CodingPermissionService {
  private http = inject(HttpClient);

  constructor(
    private httpClient: HttpService,
    private resultHttpClient: ResultsHttpService
  ) { }

  getCodingPermissionCategories(entityProfileID: number): 
    Observable<ResponseResult<CodingPermissionCategoryDTO[]>> {
      return this.resultHttpClient
        .get<CodingPermissionCategoryDTO[]>(`${CODING_PERMISSION_CATEGORIES}/${entityProfileID}`, true)
        .pipe(
          map((response) => {
            return response;
          }),
          catchError((error: HttpErrorResponse) => {
            return throwError(() => error);
          })
        );
    }

  getCodingPermissionsByEntityAndCategory(entityProfileID: number, categoryID: number):
    Observable<ResponseResult<CodingPermissionCategoryDTO[]>> {
      return this.resultHttpClient
        .get<CodingPermissionCategoryDTO[]>(`${CODING_PERMISSION}/${entityProfileID}/${categoryID}`, true)
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
