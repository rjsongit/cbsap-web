import { CommonModule, DatePipe } from '@angular/common';
import { Component, input, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PO_CONSTANT } from '@core/constants/purchase-order/purchase-order.constants';
import { Pagination } from '@core/model/common';
import { ResponseResult } from '@core/model/common/responseResult';
import { GridConfig } from '@core/model/dynamic-grid/grid.config';
import { batchListPurchaseOrderDto, poDetailDto, poDetailListDto } from '@core/model/purchase-order/po-detail.dto';
import { ExportPurchaseOrderListSearchQuery, POSearchQuery, PurchaseOrderListSearchQuery } from '@core/model/purchase-order/po.query';
import { createPurchaseHeaderForm, PurchaseOrderDetailHeaderFormGroup } from '@core/model/reference-data-lookup/PO/purchase-header.form';
import { ExcelService, GridService } from '@core/services';
import { PurchaseOrderService } from '@core/services/purchase-order/purchase-order.service';
import { DynamicGridService } from '@core/services/shared/dynamic-grid.service';
import { DynamicGridComponent } from '@shared/grid/dynamic-grid/dynamic-grid.component';
import { PrimeImportsModule } from '@shared/moduleResources/prime-imports';
import { MenuItem } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MessageSeverity } from '@core/constants/common/message-severity';

@Component({
  selector: 'app-po-reference-detail',
  standalone: true,
    imports: [FormsModule,
      ReactiveFormsModule,
      PrimeImportsModule,
      CommonModule,  
      DynamicGridComponent,BreadcrumbModule],
  templateUrl: './po-reference-detail.component.html',
  styleUrl: './po-reference-detail.component.scss'
})
export class PoReferenceDetailComponent {

  private destroySubject: Subject<void> = new Subject();
  loading: boolean = true;
  //This PO Primary ID
  Id: number = 0;
  formGroupData!: PurchaseOrderDetailHeaderFormGroup;
  Status: string = '';

  private destroy$ = new Subject<void>();
  gridConfig: GridConfig<poDetailListDto> | null = null;
  totalRecords: number = 0;
  pageNumber: number = 0;
  pageSize: number = 10;

  batchListPurchaseOrderDto: batchListPurchaseOrderDto[] = [];
  //Paging
  currentIndex? : number;
  currentPageSelected? : number;
  currentPageSize? : number;
  currentTotalPage? : number;

  clickStatus ={
    Previous : 1,
    Next : 2
  }

  headerBreadCrums : MenuItem[] | undefined;
  @ViewChild('linkTemplate', { static: false })
  linkTemplate!: TemplateRef<any>;
  @ViewChild(DynamicGridComponent)
  dynamicGridComponent?: DynamicGridComponent<any>;

  searchLine = "";

  constructor(
    private activeRoute: ActivatedRoute,
    private gridService: GridService,
    private purchaseOrderService: PurchaseOrderService,
    private dynamicGridService: DynamicGridService<poDetailListDto>,
    private router: Router,
    private excelService: ExcelService,
    private datePipe: DatePipe
  ) {
    this.Id = Number(
      this.activeRoute.snapshot.params['id'] ?? 0
    );

    this.formGroupData = createPurchaseHeaderForm();
  }

  ngOnInit(): void {

    if (this.Id > 0) {
      this.loadPurchaseOrderDetail(this.Id);

      setTimeout(() => {
        if (this.linkTemplate) {
          this.initializeDynamicGrid();
        } else {
          this.loadData(1);
        }
      });

      this.initializeDynamicGrid();
      this.BatchListPurchaseOrder(0);
    }
  }

  private initializeDynamicGrid() {
    const columns = this.gridService.purchaseOrderDetailLineColumn(this.linkTemplate);

    this.dynamicGridService.setConfig({
      columns,
      data: [],
      totalRecords: 0,
      pageSize: 10,
      pageNumber: 1,
      sortField: '',
      sortOrder: -1,
      loading: false,
      rowClick: [
        {
          allow: false,
        },
      ],
    });
  }

  //prepared the initial list for next and previous
  private BatchListPurchaseOrder(currentPage?: number,clickStatus? : number) {

    const stored = localStorage.getItem(PO_CONSTANT.SEARCH_FILTER_LOCALSTORAGE.PURCHASEORDER);
  
    let query: POSearchQuery | null = stored ? JSON.parse(stored) : null;
  
    // If nothing in localStorage, create a default query
    if (!query) {
      query = {
        PageNumber: 1,
        PageSize: 10,
        TotalPage: 1
      };
    }
  
    // Determine current page
    this.currentPageSelected = currentPage === 0
      ? query.PageNumber
      : currentPage ?? query.PageNumber;
  
    this.currentPageSize = query.PageSize;
    this.currentTotalPage = query.TotalPage!;
  
    // Update query
    query.PageNumber = this.currentPageSelected;
  
    this.poBatchListPurchaseOrder(query,clickStatus);
  }

  onSearchClick(value : string){
this.searchLine = value;
    this.loadData(1,this.searchLine);
  }


  poBatchListPurchaseOrder(query: POSearchQuery, clickStatus? : number) {
    this.purchaseOrderService
      .BatchListPurchaseOrder(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {

            if( res.responseData != null)
            {

              this.searchLine = "";
              this.batchListPurchaseOrderDto = res.responseData.data!;

              const firstRow = this.batchListPurchaseOrderDto.at(0);
              const lastRow  = this.batchListPurchaseOrderDto.at(-1);

              if(clickStatus == this.clickStatus.Next)
              {
                this.Id = firstRow?.purchaseOrderID!;
                this.currentIndex = firstRow?.indexId;
                this.loadPurchaseOrderDetail(this.Id);
              }
              else if(clickStatus == this.clickStatus.Previous)
              {
                this.Id = lastRow?.purchaseOrderID!;
                this.currentIndex = lastRow?.indexId;
                this.loadPurchaseOrderDetail(this.Id);
              }
              else
              {
                var currentRow =  this.batchListPurchaseOrderDto.find(x => x.purchaseOrderID == this.Id);
                this.Id = currentRow!.purchaseOrderID!;
                this.currentIndex = currentRow!.indexId;
                this.loadPurchaseOrderDetail(this.Id);
              }
            }

    
           
          }
        },
      });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  onClickPrevious(){

    if(this.currentIndex! == 1 && this.currentPageSelected == 1)
    {
      return;
    }

    if(this.currentIndex == 1 && this.currentPageSelected! > 1)
    {
      this.currentPageSelected! -=1;
      this.BatchListPurchaseOrder(this.currentPageSelected,this.clickStatus.Previous);
    }
    else
    {
      this.currentIndex! -=1;

      const poId = this.batchListPurchaseOrderDto
      .find(p => p.indexId === this.currentIndex);
    
      this.Id = poId?.purchaseOrderID!;
  
      this.loadPurchaseOrderDetail(this.Id);
    }

    this.loadData(0);

  }
  public onClickNext(){
    var getLastIndex = this.batchListPurchaseOrderDto.at(-1);

    if(this.currentIndex! == getLastIndex?.indexId  && this.currentPageSelected == this.currentTotalPage)
    {
      return;
    }

    if(this.currentIndex! == getLastIndex?.indexId! && this.currentPageSelected! >= 1)
    {
      this.currentPageSelected! +=1;
      this.BatchListPurchaseOrder(this.currentPageSelected,this.clickStatus.Next);
    }
    else
    {
      this.currentIndex! +=1;

      const poId = this.batchListPurchaseOrderDto
      .find(p => p.indexId === this.currentIndex);
    
      this.Id = poId?.purchaseOrderID!;
  
      this.loadPurchaseOrderDetail(this.Id);
    }

    this.loadData(0);
  }

  onClickCancel(){
    setTimeout(() => {
      this.router.navigate(['/reference-data-lookup','purchase-orders']);
    }, 1000);
  }


  onRowClick(rowId : number){
    debugger;
    this.router.navigate(['invoices',rowId, 'edit'], {
      state: { returnUrl: this.router.url },
    });
  }
  


  private loadPurchaseOrderDetail(purchaseOrderId: number) {
    this.purchaseOrderService
    .purchaseHeaderGetById(purchaseOrderId)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (results: ResponseResult<poDetailDto>) => {
        if (results.isSuccess && results.responseData) {
          this.patchFormValues(results.responseData);
          console.log(results.responseData)
          this.headerBreadCrums = [{ label : 'Purchase Order'}, {label : this.formGroupData.value.PurchaseOrderNo ?? '' }]
        }
      },
      error: (error) => console.log(error),
    });
  }

  loadData(pageNum: number, searchLine? : string) {
    const pageNumber = pageNum;
    const rows =  10;
    const sortField =  '';
    const sortOrder = -1;

    const query: PurchaseOrderListSearchQuery = {
      PurchaseOrderId: this.Id,
      PageNumber: pageNumber,
      PageSize: rows,
      SortField: sortField,
      SortOrder: sortOrder,
      SearchLine: this.searchLine
    };

    this.dynamicGridService.setLoading(true);
    this.searchPoDetailLine(query);
  }

  private patchFormValues(data: poDetailDto): void {
    const pascalData = this.convertKeysToPascal(data);
    this.Status = pascalData.Status! || '';
    this.formGroupData.patchValue(pascalData);
  }

 toPascalCase(str: string) {
    return str
      .replace(/(^\w|_\w)/g, (match) => match.replace('_', '').toUpperCase());
  }
  
 convertKeysToPascal(obj: any) {
    const newObj: any = {};
    for (const key in obj) {
      const pascalKey = this.toPascalCase(key);
      newObj[pascalKey] = obj[key];
    }
    return newObj;
  }

  onChangeColorStatus(){
    return (this.Status == "Active") ? "p-button-success" : "p-button-danger";
  }

  //List

  
  onLazyLoad(event: any): void {
    const pageNumber = event.pageNumber;
    const rows = event.pageSize ?? 10;
    const sortField = event.sortField || '';
    const sortOrder = event.sortOrder ?? -1;

    const query: PurchaseOrderListSearchQuery = {
      PurchaseOrderId: this.Id,
      PageNumber: pageNumber,
      PageSize: rows,
      SortField: sortField,
      SortOrder: sortOrder,
      SearchLine : this.searchLine
    };
    this.dynamicGridService.setLoading(true);

    this.searchPoDetailLine(query);
  }

  searchPoDetailLine(query: PurchaseOrderListSearchQuery) {

    this.purchaseOrderService
      .purchaseHeaderDetailLineListGetById(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
      
          if (res.isSuccess) {
        
            this.dynamicGridService.updateData(
              res.responseData?.data ?? [],
              res.responseData?.totalCount ?? 0,
              query.PageSize
            );

            this.totalRecords = res.responseData?.totalCount ?? 0;
          }
        },
        error: () => {
          this.dynamicGridService.setLoading(false);
        },
      });
  }

  onExportToExcel() {

  debugger;
    const query: ExportPurchaseOrderListSearchQuery = {
      PurchaseOrderId: this.Id,
      SearchLine : this.searchLine
    };

    this.purchaseOrderService
      .exportPOLine(query)
      .pipe(takeUntil(this.destroySubject))
      .subscribe({
        next: (result: ResponseResult<Blob>) => {
          if (result.isSuccess && result.responseData) {
            const blob = result.responseData;
            this.excelService.saveFile(blob, this.getTimestampedFileName());
          }
          this.loading = false;
        },
      });
  }

  getTimestampedFileName(): string {
    const timestamp = this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss');
    return `PurchaseOrderLineDetails_${timestamp}.xlsx`;
  }
  

}
