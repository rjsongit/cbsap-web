import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CodingPermissionDTO, CodingPermissionEntityDTO, CodingPermissionFilterDTO} from '@core/model/account-dimension-permission';
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
  imports: [ReactiveFormsModule, ButtonModule, FormsModule, ToggleSwitchModule, SelectModule, CheckboxModule, InputTextModule],
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
  selectedEntity: number | null = null;
  selectedCategory: number | null = null;
  permissionFiltered: CodingPermissionDTO[] = [];
  permissionList: CodingPermissionDTO[] = [];
  filterParam: CodingPermissionFilterDTO = {
    entityProfileID: 0,
    roleID: 0,
    category: undefined,
    nameCode: '',
    isAssigned: false,
    isUnassigned: false
  };
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
    this.initialLoad();
  }

  initialLoad() {
    this.getEntityByRole();
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
    this.ref.close({
      codingPermissions: this.permissionList,
      selectedEntity: this.selectedEntity,
      selectedCategory: this.selectedCategory
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
            this.selectedEntity = this.config.data.selectedEntity;

            if (this.entityList.length > 0)
              this.getCategoryList();
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
            this.selectedCategory = this.config.data.selectedCategory;
            this.loadPermissionList();
          }
        },
        error: (error) => this.onError(error),
    });
  }

  loadPermissionList() {
    if (this.selectedEntity !== null && this.selectedCategory !== null) {
      this.filterParam = {
        entityProfileID: this.selectedEntity !== null ? this.selectedEntity : 0,
        roleID: this.roleId,
        category: this.selectedCategory !== null 
          ? this.categoryList.find(cat => cat.categoryID === this.selectedCategory)?.categoryName 
          : '',
        nameCode: this.filterbyNameCode.trim(),
        isAssigned: this.filterbyAssigned,
        isUnassigned: this.filterbyUnassigned
      };

      this.codingPermissionService
        .getCodingPermissionsByEntityCategoryAndNameCode(this.filterParam)
        .pipe(takeUntil(this.destroySubject))
        .subscribe({
          next: (result) => {
            if (result.isSuccess) {
              console.log('Fetched coding permissions:', result.responseData);
              this.permissionList = result.responseData ?? [];
              this.permissionFiltered = [...this.permissionList]; // Initialize filtered list with all permissions
            }
          },
          error: (error) => this.onError(error),
      });
    }
    else
      this.permissionFiltered = [];
  }

  searchFilter() {
    this.loadPermissionList();
  }

  onToggleChange()  {
    this.loadPermissionList();
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