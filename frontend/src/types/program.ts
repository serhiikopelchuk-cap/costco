// Base types
export interface CostType {
  id: number;
  name: string;
  alias: string;
  programs: Program[];
}

export interface Cost {
  id?: number;
  value: number | string;
}

export type Item = {
  id?: number;
  name: string;
  costs: Cost[];
};

export type CloudProvider = {
  id?: number;
  name: string;
};

export type Category = {
  id: number;
  name: string;
  description?: string;
  note?: string;
  cloudProvider?: string; // TODO: remove this
  cloudProviders?: CloudProvider[];
  items: Item[];
  project?: { id: number };
  costType?: CostType;
};

export type Project = {
  id: number;
  name: string;
  // description?: string;
  categories: Category[];
  settings: any;
};

export type Program = {
  id: number;
  name: string;
  // description?: string;
  projects: Project[];
  settings: any | {
    teamName: string;
    preparedBy: string;
    directInvestment: number;
    indirectInvestment: number;
    directGrowthRates: number[];
    indirectGrowthRates: number[];
  };
};

// UI specific types
export type DetailsType = {
  type: 'program' | 'project';
  name: string;
  id: number;
} | null;

export type SearchState = {
  programSearch: string;
  projectSearch: string;
  categorySearch: string;
  lineItemSearch: string;
};

export type AddInputState = {
  showAddProgramInput: boolean;
  showAddProjectInput: boolean;
  showAddCategoryInput: boolean;
  showAddLineItemInput: boolean;
}; 