export interface DimensionSetupSearchDto {
    dimensionSetupId : number;
    dimensionSetupName: string | null;
    displayOrder: number | null;
    dimensionName: string | null;
    dimensionValueId: string | null;
    required: boolean | null;
    show: boolean | null;
    dimensionformgroup : string | null;
  }