import {
  CustomButton,
  SearchField,
} from '@core/model/quick-search/QuickSearchModel';
import { DimensionSetupSearchModel } from './dimension-setup.query';

export interface DimensionSetupSearchConfig {
  fields: SearchField<DimensionSetupSearchModel>[];
  model: DimensionSetupSearchModel;
  buttons: {
    search: boolean;
    clear: boolean;
    export: boolean;
    advancedSearch:boolean,
    custom?: CustomButton[];
  };
}

export function buildDimensionSetupSearchConfig(
  customButtons?: CustomButton[]
): DimensionSetupSearchConfig {
  return {
    fields: [
      {
        key: 'DimensionName',
        label: 'Dimension name',
        type: 'text',
        fieldType: 'input',
      },
      {
        key: 'DefaultValue',
        label: 'Default value',
        type: 'text',
        fieldType: 'input',
      },
    ],
    model: {
      DimensionName : '',
      DefaultValue : '',
    },
    buttons: {
      search: true,
      clear: true,
      export: false,
      advancedSearch:false,
      custom: customButtons,
    },
  };
}
