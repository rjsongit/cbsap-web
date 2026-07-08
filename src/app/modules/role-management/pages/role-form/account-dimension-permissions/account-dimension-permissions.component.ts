import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ENTITYPROFILE } from '@core/constants';
import { AccountDimensionDetailDTO 
  , CodingPermissionCategoryDTO
  , CodingPermissionDTO
  , CodingPermissionEntityDTO
  , CodingPermissionPopupData } from '@core/model/account-dimension-permission';
import { DropdownOptionDto } from '@core/model/roles-management';
import { CodingPermissionService } from '@core/services/coding-permission/coding-permission.service';
import { PrimeImportsModule } from '@shared/moduleResources/prime-imports';
// import { RoleAccountDimensionPopupComponent } from '@shared/popup/role-account-dimension-popup/role-account-dimension-popup.component';
import { CodingPermissionPopupComponent } from '@shared/popup/coding-permission-popup/coding-permission-popup.component';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { BehaviorSubject, from, Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-account-dimension-permissions',
  standalone: true,
  providers: [DialogService],
  imports: [FormsModule, ReactiveFormsModule, PrimeImportsModule, DropdownModule, TableModule, SelectModule],
  templateUrl: './account-dimension-permissions.component.html',
  styleUrl: './account-dimension-permissions.component.scss'
})
export class AccountDimensionPermissionsComponent
  implements OnInit, OnDestroy {
  @Input() formGroup!: FormGroup;
  @Input() formSubmitted!: boolean;

  @Input() roleId = 0;
  @Input() entityOptions: DropdownOptionDto[] = [];
  @Input() categoryOptions: DropdownOptionDto[] = [];

  private destroySubject = new Subject<void>();
  private dataList$ = new BehaviorSubject<AccountDimensionDetailDTO[]>([]);
  private totalRecord$ = new BehaviorSubject<number>(0);

  totalRecords = 0;
  accountDimensionPagination: AccountDimensionDetailDTO[] = [];
  assignedList: CodingPermissionDTO[] = [];
  toBeAssignedList: CodingPermissionDTO[] = [];
  entityList: CodingPermissionEntityDTO[] = [];
  categoryList: CodingPermissionCategoryDTO[] = [];
  selectedEntity: number = 0;
  selectedCategory: number = 1;
  
  constructor(
    private dialogService: DialogService,
    private codingPermissionService: CodingPermissionService
  ) { }


  ngOnInit(): void {
    this.getCategoryList();
    this.getEntityByRole();
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entityOptions'] && this.entityOptions.length) {
      this.autoAssignEntity();
    }
  }

  trackByFn(
    index: number,
    item: AccountDimensionDetailDTO
  ): number {
    return item.entityProfileID;
  }

  // addAccountDimension(): void {
  // const ref: DynamicDialogRef = this.dialogService.open(RoleAccountDimensionPopupComponent, {
  //   header: 'Select Coding Permission',
  //   width: '45vw',
  //   modal: true,
  //   closable: true,
  //   contentStyle: { 'overflow-y': 'hidden' },
  //   baseZIndex: 10000,
  //   data: { message: 'Hello from parent' } // Passing data in
  // });
  openCodingPermission(): void {
    const ref: DynamicDialogRef = this.dialogService.open(CodingPermissionPopupComponent, {
      header: 'Select Coding Permission',
      width: '45vw',
      modal: true,
      closable: true,
      contentStyle: { 'overflow-y': 'hidden' },
      baseZIndex: 10000,
      data: {
        message: 'Hello from parent',
        selectedEntity: this.selectedEntity,
        selectedCategory: this.selectedCategory,
      } // passing data to popup
    });

    // ref.onClose.subscribe((data: any) => {
    //   if (data) {
    //     console.log('Returned data:', data);
    //   }
    // });
    ref.onClose.subscribe((data: CodingPermissionPopupData) => {
      if (data) {
        // passing the returned data to the parent component
        // e.g. [toBeAssignedList] = [permissionList] (with filter)
        this.toBeAssignedList = data.codingPermissions.filter(item => item.originallyAssigned !== item.checked);
        this.selectedEntity = data.selectedEntity;
        this.selectedCategory = data.selectedCategory;
        this.savePermissions();
      }
    });

  }

  getEntityByRole() {
    this.codingPermissionService
      .getCodingPermissionEntitiesByRole(this.roleId)
      .pipe(takeUntil(this.destroySubject))
      .subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.entityList = result.responseData ?? [];
            this.selectedEntity = this.entityList[0].entityProfileID;
            this.getAssignedList();
          }
        },
        error: (error) => this.onError(error),
    });
  }

  getCategoryList() {
      this.codingPermissionService
      .getCodingPermissionCategories()
      .pipe(takeUntil(this.destroySubject))
      .subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.categoryList = result.responseData ?? [];
            this.selectedCategory = this.categoryList[0].categoryID;
          }
        },
        error: (error) => this.onError(error),
    });
  }
 
  getAssignedList() {
    this.codingPermissionService
      .getCodingPermissionAssigned(this.selectedEntity, this.categoryList.find(i => i.categoryID === this.selectedCategory)?.categoryName)
      .pipe(takeUntil(this.destroySubject))
      .subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.assignedList = result.responseData ?? [];
          }
        },
        error: (error) => this.onError(error),
      });
  }

  savePermissions() {
    this.codingPermissionService
      .saveCodingPermission(this.toBeAssignedList)
      .subscribe({
        next: (response) => {
          console.log('Permissions saved successfully:', response);
           this.getAssignedList();
        },
        error: (error) => {
          console.error('Error saving permissions:', error);
        }
      });
  }

  onChangeEntity(event: any) {
    this.selectedEntity = event.value;
    this.getAssignedList();
  }

  onChangeCategory(event: any) {
    this.selectedCategory = event.value;
    this.getAssignedList();
  }


  private autoAssignEntity(): void {
    if (this.entityOptions.length !== 1) {
      return;
    }

    const entityId = this.entityOptions[0].value;

    const updatedRows = this.selectedAccountDimensions.map(row => ({
      ...row,
      entityProfileID: entityId
    }));

    this.f['selectedAccountDimensions'].setValue(updatedRows);
  }

  private onError(error: unknown): void {
    console.error(error);

    this.dataList$.next([]);
    this.totalRecord$.next(0);
  }

  get f() {
    return this.formGroup.controls;
  }

  get selectedAccountDimensions(): AccountDimensionDetailDTO[] {
    return this.f['selectedAccountDimensions']?.value ?? [];
  }

}

