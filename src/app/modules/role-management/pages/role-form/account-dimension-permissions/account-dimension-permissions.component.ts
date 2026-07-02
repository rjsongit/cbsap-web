import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { AccountDimensionDetailDTO } from '@core/model/account-dimension-permission/dtos/AccountDimensionDetailDTO';
import { CodingPermissionDTO } from '@core/model/account-dimension-permission/dtos/CodingPermissionDTO';
import { DropdownOptionDto, RoleEntitiyDto } from '@core/model/roles-management';
import { CodingPermissionService } from '@core/services/coding-permission/coding-permission.service';
import { PrimeImportsModule } from '@shared/moduleResources/prime-imports';
import { CodingPermissionPopupComponent } from '@shared/popup/coding-permission-popup/coding-permission-popup.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-account-dimension-permissions',
  standalone: true,
  providers: [DialogService],
  imports: [ReactiveFormsModule, FormsModule, PrimeImportsModule],
  templateUrl: './account-dimension-permissions.component.html',
  styleUrl: './account-dimension-permissions.component.scss'
})
export class AccountDimensionPermissionsComponent 
  implements OnInit, OnDestroy 
{
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
  selectedEntity: number = 22;
  selectedCategory: string = 'Account';
  assignedList: CodingPermissionDTO[] = [];
  toBeAssignedList: CodingPermissionDTO[] = [];

  constructor(
    private dialogService: DialogService,
    private codingPermissionService: CodingPermissionService
  ) {}

  ngOnInit(): void {
    this.getAssignedList();
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

  openCodingPermission(): void {
    const ref: DynamicDialogRef = this.dialogService.open(CodingPermissionPopupComponent, {
      header: 'Select Coding Permission',
      width: '45vw',
      modal: true,
      closable: true,
      contentStyle: { 'overflow-y': 'hidden' },
      baseZIndex: 10000,
      data: { message: 'Hello from parent' } // passing data to popup
    });
  
    ref.onClose.subscribe((data: CodingPermissionDTO[]) => {
      if (data) {
        // passing the returned data to the parent component
        // e.g. [toBeAssignedList] = [permissionList] (with filter)
        this.toBeAssignedList = data.filter(item => item.originallyAssigned !== item.checked);
        this.savePermissions();
      }
    });
  }

  getAssignedList() {
    this.codingPermissionService
      .getCodingPermissionAssigned(this.selectedEntity, this.selectedCategory)
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
        },
        error: (error) => {
          console.error('Error saving permissions:', error);
        }
      });
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