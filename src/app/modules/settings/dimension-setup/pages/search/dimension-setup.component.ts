import { DatePipe, NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { core } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageSeverity } from '@core/constants';
import { Pagination, ResponseResult } from '@core/model/common';
import { TableColumn } from '@core/model/common/grid-column';
import { SearchField } from '@core/model/quick-search/QuickSearchModel';
import { DimensionSetupSearchDto } from '@core/model/system-settings/dimension-setup/dimension-setup-searchDtos';
import { DimensionSetupSearchFilters, DimensionSetupSearchQuery } from '@core/model/system-settings/dimension-setup/dimension-setup.query';
import {
  AlertService,
  ExcelService,
  GridService,
  LookUpsService,
} from '@core/services';
import { PrimeImportsModule } from '@shared/moduleResources/prime-imports';
import { QuickSearchComponent } from '@shared/quick-search/quick-search.component';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import {DimensionSetupService } from '@core/services/system-settings/dimension-setup.service'
import { SearchDimensionQuery } from '@core/model/dimension/search-dimension.query';
import { SearchDimensionLookupDto } from '@core/model/dimension/search-dimension.dto';
import { DimensionDto } from '@core/model/reference-data-lookup/Dimension/dimensionDto';

@Component({
  selector: 'app-dimension-setup',
  standalone: true,
  providers: [AlertService, DatePipe, ConfirmationService],
  imports: [FormsModule, PrimeImportsModule, NgClass, NgFor, NgIf, QuickSearchComponent,NgSwitch,
    NgSwitchCase],
  templateUrl: './dimension-setup.component.html',
  styleUrl: './dimension-setup.component.scss',
})
export class DimensionSetupComponent implements OnInit {

  private destroy$ = new Subject<void>();
  @ViewChild('dtSearchDimensionSetupPagination') table: Table | undefined;
  private destroySubject: Subject<void> = new Subject();

  dimensionSetupSearchFilters: DimensionSetupSearchFilters = {
    DimensionName: '',
    DefaultValue: ''
  };

  DimensionSetuppagination: DimensionSetupSearchDto[] = [];
  
  columns: TableColumn[] = [];
  sizes: any;

  totalRecords: number = 0;
  pageNumber: number = 0;
  pageSize: number = 10;
  loading: boolean = true;
  visible: boolean = false;
  sortField?: string;
  sortOrder: number = 1;

  searchActionButtonsConfig = {
    search: true,
    clear: true,
    export: true,
  };

  clonedRows: { [key: string]: DimensionSetupSearchDto } = {};


  DimensionSetupFields: SearchField<DimensionSetupSearchFilters>[] = [
    {
      key: 'DimensionName',
      label: 'Dimension Name',
      type: 'text',
      fieldType: 'input',
    },
    {
      key: 'DefaultValue',
      label: 'DimensionSetup Code',
      type: 'text',
      fieldType: 'input',
    },
  ];

  dimensionNamesOptions?: SelectItem[] = [];

  constructor(
    private lookUpsService: LookUpsService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private gridService: GridService,
    private DimensionSetupService: DimensionSetupService,
    private message: AlertService,
    private excelService: ExcelService,
    private datePipe: DatePipe
  ) {}

  

  ngOnInit(): void {
    const stored = localStorage.getItem('DimensionSetup-search');
    if (stored) {
      this.dimensionSetupSearchFilters = JSON.parse(stored);
    }

    this.columns = this.gridService.dimensionSetupSearchColumn();
    this.sizes = { name: 'Small', class: 'p-table?-sm' };
    this.loadDimensions();
  }
  

  private loadDimensions(): void {
    const query: SearchDimensionQuery = {
      entity: null,
      dimension: null,
      dimensionName:  null,
      active: null,
      PageNumber: 1,
      PageSize: 10,
      SortField: '',
      SortOrder: null,
    };;
    this.loading = true;

    this.lookUpsService
      .dimensionSearchLookUp(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ResponseResult<Pagination<SearchDimensionLookupDto>>) => {
          if (result.isSuccess && result.responseData) {
            this.dimensionNamesOptions = (result.responseData.data ?? []).map(x => {
              const item: SelectItem = {
                label: x.dimensionName?.toString(),
                value: x.dimensionID
              };
              return item;
            }); 
          } else {
            this.dimensionNamesOptions = [];
          }

        },
        error: () => {
          this.dimensionNamesOptions = [];
        },
      });
  }

  
  getDimensionCodeLabel(id: any): string {
    if (!id) return ''; // id is null or undefined
    if (!this.dimensionNamesOptions || this.dimensionNamesOptions.length === 0) return '';
  
    const option = this.dimensionNamesOptions.find(
      opt => opt.value?.toString() === id.toString()
    );
  
    return option?.label ?? '';
  }

  /** Action Functionality */
  addDimensionSetup() {
    this.router.navigate(['DimensionSetup-profile-management/add-DimensionSetup']);
  }

  /**search pagination */
  search(filters: DimensionSetupSearchFilters) {
    this.dimensionSetupSearchFilters = filters;
    this.searchDimensionSetup();
  }

  clear() {
    localStorage.removeItem('DimensionSetup-search');
    localStorage.removeItem('DimensionSetup-grid');
    this.dimensionSetupSearchFilters = {
      DimensionName: '',
      DefaultValue: '',
    };
    this.pageNumber = 0;
    this.pageSize = 10;
    this.sortField = '';
    this.sortOrder = 1;
    this.table?.reset();
    this.searchDimensionSetup();
  }

  searchDimensionSetup() {

    let searchDimensionSetupQuery: DimensionSetupSearchQuery = {
      DimensionName: this.dimensionSetupSearchFilters.DimensionName,
      DefaultValue: this.dimensionSetupSearchFilters.DefaultValue,
      PageNumber: this.pageNumber,
      PageSize: this.pageSize,
      SortField: this.sortField,
      SortOrder: this.sortOrder,
    };

    if (this.sortField == null) {
      delete searchDimensionSetupQuery.SortField;
    }
    if (this.dimensionSetupSearchFilters.DimensionName == null) {
      delete searchDimensionSetupQuery.DimensionName;
    }
    if (this.dimensionSetupSearchFilters.DefaultValue == null) {
      delete searchDimensionSetupQuery.DefaultValue;
    }

    this.DimensionSetupService
      .dimensionSetupSearch(searchDimensionSetupQuery)
      .pipe(takeUntil(this.destroySubject))
      .subscribe({
        next: (result: ResponseResult<Pagination<DimensionSetupSearchDto>>) => {
          if (result.isSuccess) {
            if (result.responseData?.data) {
              console.log(result.responseData?.data);
              this.DimensionSetuppagination = result.responseData?.data;
              this.totalRecords = result.responseData?.totalCount;
            }
            this.loading = false;
          }
        },
        error: (error) => this.onError(error),
      });
  }

  onLazyLoad(event: any): void {
    this.sortField = event.sortField ? event.sortField : null;
    this.sortOrder = event.sortOrder ? event.sortOrder : 1;
    this.loading = true;
    this.pageNumber = event.first / event.rows + 1; // Calculate page number for the API request
    this.pageSize = event.rows; // Update page size
    this.searchDimensionSetup();
  }

  onError(error: DimensionSetupSearchDto) {}

  validateRange(event: any, row : DimensionSetupSearchDto) {
    const value = event.target.value;

    if(value === '' || value === null) return;

     if (value > 8) event.target.value = 8;
     if (value < 1) event.target.value = 1;

     row.displayOrder = event.target.value;
  }

  onRowEditInit(row: any) {

    for (const col of this.columns) {

  
      // Checkboxes → convert to boolean
      if (col.type === 'checkbox') {
        row[col.field] =
          row[col.field] === true ||
          row[col.field] === 1 ||
          row[col.field] === '1' ||
          row[col.field] === 'true' ||
          row[col.field] === 'Yes';
      }
    }

    this.clonedRows[row.dimensionSetupId] = { ...row };
  }
  
  onRowEditSave(row: DimensionSetupSearchDto) {
    this.updatedimensionSetup(row);

  
  }
  
  onDoubleClickEdit(row : any, table: any){
    table.initRowEdit(row); 
    for (const col of this.columns) {

  
      // Checkboxes → convert to boolean
      if (col.type === 'checkbox') {
        debugger;
        row[col.field] =
          row[col.field] === true ||
          row[col.field] === 1 ||
          row[col.field] === '1' ||
          row[col.field] === 'true' ||
          row[col.field] === 'Yes';
      }
    }

    this.clonedRows[row.dimensionSetupId] = { ...row };
  }

  onRowEditCancel(row: DimensionSetupSearchDto, id: number) {
    const index = this.DimensionSetuppagination.findIndex(
      x => x.dimensionSetupId === id
    );
  
    if (index !== -1) {
      this.DimensionSetuppagination[index] = { ...this.clonedRows[id] };
    }
  
    delete this.clonedRows[id];
  }

  private updatedimensionSetup(formValue: DimensionSetupSearchDto) {

       this.DimensionSetupService.updatedimensionSetup(formValue).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.message.showToast(
            MessageSeverity.success.toString(),
            'Dimension Setup',
            'Dimension Setup has been successfully updated',
            2000
          );
          delete this.clonedRows[formValue.dimensionSetupId];
        }
      },
      error: (error: ResponseResult<boolean>) => {
        this.message.showToast(
          MessageSeverity.error.toString(),
          'Error on Dimension Setup',
          error.messages?.[0],
          2000
        );
      },
      complete: () => {
      }
    });
  }
  
  
}

