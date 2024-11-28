// Base types
export interface CostType {
  id: number;
  name: string;
  alias: string;
  programs: Program[];
}

export interface Cost {
  id?: number;
  value: number;
}

export type Item = {
  id?: number;
  name: string;
  costs: { value: number }[];
};

export type Category = {
  id: number;
  name: string;
  description?: string;
  note?: string;
  cloudProvider?: string[];
  items: Item[];
};

export type Project = {
  id: number;
  name: string;
  // description?: string;
  categories: Category[];
};

export type Program = {
  id: number;
  name: string;
  // description?: string;
  projects: Project[];
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