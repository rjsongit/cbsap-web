import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { AccountDimensionDetailDTO } from '@core/model/account-dimension-permission/dtos/AccountDimensionDetailDTO';
import { DropdownOptionDto, RoleEntitiyDto } from '@core/model/roles-management';
import { PrimeImportsModule } from '@shared/moduleResources/prime-imports';
// import { RoleAccountDimensionPopupComponent } from '@shared/popup/role-account-dimension-popup/role-account-dimension-popup.component';
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

  constructor(
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {}

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

  addAccountDimension(): void {
    // const ref: DynamicDialogRef = this.dialogService.open(RoleAccountDimensionPopupComponent, {
    //   header: 'Select Coding Permission',
    //   width: '45vw',
    //   modal: true,
    //   closable: true,
    //   contentStyle: { 'overflow-y': 'hidden' },
    //   baseZIndex: 10000,
    //   data: { message: 'Hello from parent' } // Passing data in
    // });
  
    // ref.onClose.subscribe((data: any) => {
    //   if (data) {
    //     console.log('Returned data:', data);
    //   }
    // });
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