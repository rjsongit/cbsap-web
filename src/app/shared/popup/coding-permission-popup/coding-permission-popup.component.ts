import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CodingPermissionDTO, CodingPermissionEntityDTO, GetRoleAccountDimensionQuery } from '@core/model/account-dimension-permission';
import { EntitySearchDto } from '@core/model/system-settings/entity/entity-searchDto';
import { SelectModule } from 'primeng/select';
import { CodingPermissionCategoryDTO } from '@core/model/account-dimension-permission/dtos/CodingPermissionCategoryDTO';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { CodingPermissionService } from '@core/services';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-coding-permission-popup',
  standalone: true,
  imports: [ButtonModule, FormsModule, ToggleSwitchModule, SelectModule, CheckboxModule, InputTextModule],
  templateUrl: './coding-permission-popup.component.html',
  styleUrl: './coding-permission-popup.component.scss'
})
export class CodingPermissionPopupComponent 
  implements OnInit 
{
  roleId: number = 0;
  receivedData: string = '';
  filterbyAssigned: boolean = true;
  filterbyUnassigned: boolean = true;
  filterbyNameCode: string = '';
  entityList: CodingPermissionEntityDTO[] = [];
  categoryList: CodingPermissionCategoryDTO[] = [];
  selectedEntity: number = 11;
  selectedCategory: number = 1;
  permissionFiltered: CodingPermissionDTO[] = [];
  permissionList: CodingPermissionDTO[] = [];
  private destroySubject: Subject<void> = new Subject();

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private codingPermissionService: CodingPermissionService,
    private activetRoute: ActivatedRoute
  ) { 
    this.roleId = Number(this.activetRoute.snapshot.params['roleID'] ?? 0);
  }

  ngOnInit(): void {
    // access data passed from the parent
    this.receivedData = this.config.data.message;
    this.getEntityByRole();
    this.getCategoryByEntity();
  }

  onError(error: any) {
    console.error('An error occurred:', error);
  }

  closeWithData() {
    // pass data back to the parent
    this.ref.close({ status: 'saved', id: 42 });
  }

  closeDialog() {
    // just close without sending data
    this.ref.close();
  }

  saveAndClose() {
    this.ref.close(this.permissionList);
  }

  getEntityByRole() {
    this.codingPermissionService
      .getCodingPermissionEntitiesByRole(this.roleId)
      .pipe(takeUntil(this.destroySubject))
      .subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.entityList = result.responseData ?? [];
            this.selectedEntity = this.entityList.length > 0 ? this.entityList[0].entityProfileID : 0;
          }

          this.loadPermissionList();
        },
        error: (error) => this.onError(error),
    });
  }

  getCategoryByEntity() {
    // this includes [account] & [dimenstion] tables
    this.categoryList = [
      { categoryID: 1, entityProfileID: 1, categoryName: 'Account', categoryCode: 'EXP' },
      { categoryID: 2, entityProfileID: 2, categoryName: 'Dimension1', categoryCode: 'TRV' },
      { categoryID: 3, entityProfileID: 3, categoryName: 'Dimension2', categoryCode: 'ENT' },
      { categoryID: 4, entityProfileID: 4, categoryName: 'Dimension3', categoryCode: 'TAX' },
      { categoryID: 5, entityProfileID: 5, categoryName: 'Dimension4', categoryCode: 'UBR' },
    ];
  }

  loadPermissionList() {
    const categoryName = this.categoryList.find(cat => cat.categoryID === this.selectedCategory)?.categoryName;

    this.codingPermissionService
      .getCodingPermissionsByEntityAndCategory(this.selectedEntity, categoryName)
      .pipe(takeUntil(this.destroySubject))
      .subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.permissionList = result.responseData ?? [];
            this.permissionFiltered = [...this.permissionList]; // Initialize filtered list with all permissions
          }
        },
        error: (error) => this.onError(error),
    });
  }

  searchFilter() {
    this.loadPermissionList();
  }

  onToggleChange()  {
    this.filterList();
  }
  
  setAllSelectionStates(stateValue: boolean) {
    // handles 'Select All' and 'Unselect All' utility actions inside the filtered window space
    this.permissionList.forEach(item => item.checked = stateValue);
    this.filterList(); 
  }

  filterList() {
    const query = this.filterbyNameCode.trim().toLowerCase();

    this.permissionFiltered = this.permissionList.filter(item => {
      // const matchEntity = !this.selectedEntity || item.entityProfileID === this.selectedEntity;
      // const matchCategory = !this.selectedCategory || item.categoryID === this.selectedCategory;
      const matchText = !query || 
                        item.name.toLowerCase().includes(query) || 
                        item.code.toLowerCase().includes(query);

      // filtering display based on active toggle states
      let matchToggle = false;
      if (this.filterbyAssigned && item.checked) matchToggle = true;
      if (this.filterbyUnassigned && !item.checked) matchToggle = true;
      
      // if neither switch toggle configuration is checked, show nothing
      if (!this.filterbyAssigned && !this.filterbyUnassigned) matchToggle = false;

      return matchText && matchToggle;
    });
  }
}