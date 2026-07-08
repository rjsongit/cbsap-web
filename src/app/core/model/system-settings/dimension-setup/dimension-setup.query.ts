import { BasePaginationQuery } from '@core/model/dynamic-grid/grid.config';


export interface DimensionSetupSearchFilters {
  DimensionName : string;
  DefaultValue : string;
}


export interface DimensionSetupSearchQuery extends BasePaginationQuery {
  DimensionName? : string;
  DefaultValue? : string;
}

