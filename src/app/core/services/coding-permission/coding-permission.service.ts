import { inject, Injectable } from '@angular/core';
import { HttpService } from '../common/http.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ResponseResult } from '@core/model/common';
import { CodingPermissionCategoryDTO, CodingPermissionDTO, CodingPermissionEntityDTO, CodingPermissionFilterDTO } from '@core/model/account-dimension-permission';
import { CODING_PERMISSION, CODING_PERMISSION_ASSIGN, CODING_PERMISSION_ASSIGNED, CODING_PERMISSION_CATEGORIES, CODING_PERMISSION_ENTITIES, HttpErrorResponse } from '@core/constants';
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

  getCodingPermissionCategories()
    : Observable<ResponseResult<CodingPermissionCategoryDTO[]>> {
        return this.resultHttpClient
          .get<CodingPermissionCategoryDTO[]>(`${CODING_PERMISSION_CATEGORIES}`, true)
          .pipe(
            map((response) => {
              return response;
            }),
            catchError((error: HttpErrorResponse) => {
              return throwError(() => error);
            })
          );
      }

  getCodingPermissionEntitiesByRole(roleID: number)
    : Observable<ResponseResult<CodingPermissionEntityDTO[]>> {
        return this.resultHttpClient
          .get<CodingPermissionEntityDTO[]>(`${CODING_PERMISSION_ENTITIES}/role/${roleID}`, true)
          .pipe(
            map((response) => {
              return response;
            }),
            catchError((error: HttpErrorResponse) => {
              return throwError(() => error);
            })
          );
      }

  getCodingPermissionsByEntityAndCategory(entityProfileID: number, categoryName: string | undefined)
    : Observable<ResponseResult<CodingPermissionDTO[]>> {
        return this.resultHttpClient
          .get<CodingPermissionDTO[]>(`${CODING_PERMISSION}/entity/${entityProfileID}/category/${categoryName}`, true)
          .pipe(
            map((response) => {
              return response;
            }),
            catchError((error: HttpErrorResponse) => {
              return throwError(() => error);
            })
          );
      }

  saveCodingPermission(codingPermissionDTO: CodingPermissionDTO[])
    : Observable<ResponseResult<string>> {
        return this.resultHttpClient
          .post<string>(`${CODING_PERMISSION_ASSIGN}`, codingPermissionDTO, true)
          .pipe(
            map((response) => {
              return response;
            }),
            catchError((error: HttpErrorResponse) => {
              return throwError(() => error);
            })
          );
      }

  getCodingPermissionAssigned(entityProfileID: number, categoryName: string | undefined, roleID: number)
    : Observable<ResponseResult<CodingPermissionDTO[]>> {
        return this.resultHttpClient
          .get<CodingPermissionDTO[]>(`${CODING_PERMISSION_ASSIGNED}/entity/${entityProfileID}/category/${categoryName}/role/${roleID}`, true)
          .pipe(
            map((response) => {
              return response;
            }),
            catchError((error: HttpErrorResponse) => {
              return throwError(() => error);
            })
          );
      }

  getCodingPermissionsByEntityCategoryAndNameCode(codingPermissionFilterDTO: CodingPermissionFilterDTO)
    : Observable<ResponseResult<CodingPermissionDTO[]>> {
        return this.resultHttpClient
          .post<CodingPermissionDTO[]>(`${CODING_PERMISSION}/filter`, codingPermissionFilterDTO, true)
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