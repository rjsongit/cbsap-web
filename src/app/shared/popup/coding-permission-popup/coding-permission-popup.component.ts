import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { GetRoleAccountDimensionQuery } from '@core/model/account-dimension-permission';
import { EntitySearchDto } from '@core/model/system-settings/entity/entity-searchDto';
import { SelectModule } from 'primeng/select';
import { CodingPermissionCategoryDTO } from '@core/model/account-dimension-permission/dtos/CodingPermissionCategoryDTO';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { CodingPermissionService } from '@core/services';
import { Subject, takeUntil } from 'rxjs';

interface PermissionLabel {
  id: number;
  name: string;
  code: string;
  entityProfileID: number;
  categoryID: number;
  originallyAssigned: boolean; // Tracking the baseline initial database footprint
  checked: boolean;            // The active state editable by checking/unchecking
}

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
  receivedData: string = '';
  filterbyAssigned: boolean = true;
  filterbyUnassigned: boolean = true;
  filterbyNameCode: string = '';
  entityList: EntitySearchDto[] = [];
  categoryList: CodingPermissionCategoryDTO[] = [];
  selectedEntity: number = 1;
  selectedCategory: number = 1;
  private destroySubject: Subject<void> = new Subject();

  filteredLabels: PermissionLabel[] = [];
  masterLabelsList: PermissionLabel[] = [
    { id: 1, entityProfileID: 4, categoryID: 1, name: 'Food and Meals', code: 'XXXXX', originallyAssigned: true, checked: true },
    { id: 2, entityProfileID: 3, categoryID: 2, name: 'Travel', code: 'XXXXX', originallyAssigned: true, checked: true },
    { id: 3, entityProfileID: 2, categoryID: 3, name: 'Entertainment', code: 'XXXXX', originallyAssigned: true, checked: true },
    { id: 4, entityProfileID: 2, categoryID: 1, name: 'Taxi', code: 'XXXXX', originallyAssigned: true, checked: true },
    { id: 5, entityProfileID: 1, categoryID: 2, name: 'Uber', code: 'XXXXX', originallyAssigned: true, checked: true },
    { id: 6, entityProfileID: 1, categoryID: 3, name: 'Accommodation', code: 'XXXXX', originallyAssigned: true, checked: true },
    { id: 7, entityProfileID: 2, categoryID: 4, name: 'Dimension3', code: 'XXXXX', originallyAssigned: true, checked: true },
    { id: 8, entityProfileID: 3, categoryID: 5, name: 'Dimension4', code: 'XXXXX', originallyAssigned: true, checked: true },
    { id: 9, entityProfileID: 4, categoryID: 1, name: 'Dimension5', code: 'XXXXX', originallyAssigned: true, checked: true },
    { id: 10, entityProfileID: 1, categoryID: 1, name: 'Dimension6', code: 'XXXXX', originallyAssigned: true, checked: true },
    { id: 11, entityProfileID: 1, categoryID: 1, name: 'Dimension7', code: 'XXXXX', originallyAssigned: true, checked: true },
    { id: 12, entityProfileID: 1, categoryID: 1, name: 'Dimension8', code: 'XXXXX', originallyAssigned: true, checked: true },
    { id: 13, entityProfileID: 1, categoryID: 1, name: 'Dimension9', code: 'XXXXX', originallyAssigned: true, checked: true },
  ];

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private codingPermissionService: CodingPermissionService
  ) { }

  ngOnInit(): void {
    // access data passed from the parent
    this.receivedData = this.config.data.message;
    this.getEntityByRole();
    this.getCategoryByEntity();
  }

  getEntityByRole() {
    this.entityList = [
      { entityProfileID: 1, entityName: 'AAA Solutions', entityCode: 'CBS1001', emailAddress: 'cbsap@canon.com.au', taxID: '' },
      { entityProfileID: 2, entityName: 'Brown Tech Solutions', entityCode: 'CBS1002', emailAddress: 'cbsap@canon.com.au', taxID: '' },
      { entityProfileID: 3, entityName: 'Canon Asia', entityCode: 'CBS1003', emailAddress: 'cbsap@canon.com.au', taxID: '' },
      { entityProfileID: 4, entityName: 'Canon PH', entityCode: 'CBS1004', emailAddress: 'cbsap@canon.com.au', taxID: '' },
      { entityProfileID: 5, entityName: 'DIY Enterprise', entityCode: 'CBS1005', emailAddress: 'cbsap@canon.com.au', taxID: '' },
    ];
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

    // this.codingPermissionService
    //   .getCodingPermissionCategories(12)
    //   .pipe(takeUntil(this.destroySubject))
    //   .subscribe({
    //     next: (result) => {
    //       if (result.isSuccess) {
    //         console.log(result.responseData);
    //         this.selectedCategory = result.responseData?.[0]?.categoryID ?? 1;
    //         this.categoryList = result.responseData ?? [];
    //       }
    //     },
    //     error: (error) => this.onError(error),
    // });
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
    // Deliver the completely modified elements list mapping mutations back down to base
    this.ref.close(this.masterLabelsList);
  }

  searchFilter() {
    const query = this.filterbyNameCode.trim().toLowerCase();
    
    this.filteredLabels = this.masterLabelsList.filter(item => {
      const matchEntity = !this.selectedEntity || item.entityProfileID === this.selectedEntity;
      const matchCategory = !this.selectedCategory || item.categoryID === this.selectedCategory;
      const matchText = !query || 
                        item.name.toLowerCase().includes(query) || 
                        item.code.toLowerCase().includes(query);

      // Filtering display based on active toggle states
      let matchToggle = false;
      if (this.filterbyAssigned && item.checked) matchToggle = true;
      if (this.filterbyUnassigned && !item.checked) matchToggle = true;
      
      // If neither switch toggle configuration is checked, show nothing
      if (!this.filterbyAssigned && !this.filterbyUnassigned) matchToggle = false;

      return matchEntity && matchCategory && matchText && matchToggle;
    });

    // let searchQuery: GetRoleAccountDimensionQuery = {
    //   Entity: this.filterbyEntity,
    //   Category: this.filterbyCategory,
    //   NameCode: this.filterbyNameCode
    // };
    // if (!this.filterbyEntity) delete searchQuery.Entity;
    // if (!this.filterbyCategory) delete searchQuery.Category;
    // if (!this.filterbyNameCode) delete searchQuery.NameCode;
  }

  onToggleFilterChange() {
    this.searchFilter();
  }

  // Handles 'Select All' and 'Unselect All' utility actions inside the filtered window space
  setAllSelectionStates(stateValue: boolean) {
    this.filteredLabels.forEach(item => item.checked = stateValue);
    // Refresh visual boundaries to make sure toggles do not drop items out instantly until explicit action
    this.searchFilter(); 
  }
}