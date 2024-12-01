import React from 'react';
import LineItemsTable from '../LineItemsTable';
import DetailsComponent from '../DetailsComponent';
import { Category, Item, Program, Project } from '../../types/program';

type DetailsColumnProps = {
  selectedCategoryId: number | null;
  selectedLineItems: Item[];
  lineItems: Item[];
  handleLineItemUpdate: (updatedItem: Item) => void;
  handleLineItemAdd: (lineItem: Item) => void;
  handleDeselectAll: () => void;
  selectedProvider: string;
  handleProviderChange: (provider: string) => void;
  details: { 
    type: 'program' | 'project';
    name: string;
    id: number;
  } | null;
  tableData: Program[];
  selectedProgramId: number | null;
  selectedProjectId: number | null;
  detailsData: Record<string, Item[]>;
  cloudProviders: string[];
};

const DetailsColumn: React.FC<DetailsColumnProps> = ({
  selectedCategoryId,
  handleLineItemUpdate,
  handleLineItemAdd,
  handleDeselectAll,
  selectedProvider,
  handleProviderChange,
  details,
  tableData,
  selectedProgramId,
  selectedProjectId,
  cloudProviders
}) => (
  <div className="column details-column">
    {selectedCategoryId ? (
      <LineItemsTable 
        onLineItemAdd={handleLineItemAdd}
        onDeselectAll={handleDeselectAll}
        cloudProviders={cloudProviders}
        selectedProvider={selectedProvider}
        onProviderChange={handleProviderChange}
        tableData={tableData}
        selectedProgramId={selectedProgramId}
        selectedProjectId={selectedProjectId}
        selectedCategoryId={selectedCategoryId}
        handleLineItemUpdate={handleLineItemUpdate}
      />
    ) : (
      details && (
        <DetailsComponent 
          type={details.type} 
          name={details.name}
          id={details.id}
          programId={details.type === 'project' && selectedProgramId !== null ? selectedProgramId : undefined}
          categories={
            details.type === 'program' 
              ? Object.fromEntries(
                  tableData.find((program: Program) => program.name === details.name)?.projects.map((project: Project) => [
                    project.name,
                    project.categories.flatMap((category: Category) => category.items)
                  ]) || []
                )
              : Object.fromEntries(
                  tableData.find((program: Program) => program.id === selectedProgramId)?.projects.find((project: Project) => project.name === details.name)?.categories.map(category => [
                    category.name,
                    category.items
                  ]) || []
                )
          } 
        />
      )
    )}
  </div>
);

export default DetailsColumn; 