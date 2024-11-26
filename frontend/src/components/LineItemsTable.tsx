import React, { SetStateAction, useState, useCallback } from 'react';
import './LineItemsTable.css';
import { validateCellValue } from '../utils/validationUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faClone } from '@fortawesome/free-solid-svg-icons';
import ActionButtons from './ActionButtons';
import { Program } from '../services/programService';
import { cloneItem } from '../services/itemService';
import { cloneCategory } from '../services/categoryService';

interface LineItem {
  id?: number | undefined;
  name: string;
  costs: { value: number }[];
}

interface LineItemsTableProps {
  lineItems: LineItem[];
  setLineItems: (newLineItems: SetStateAction<LineItem[]>) => void;
  onLineItemAdd: (newLineItem: LineItem) => void;
  onDeselectAll: () => void;
  selectedLineItems: LineItem[];
  categoryName: string;
  cloudProviders: string[];
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  tableData: Program[];
  selectedProgramId: number | null;
  selectedProjectId: number | null;
  selectedCategoryId: number | null;
}

const LineItemsTable: React.FC<LineItemsTableProps> = ({
  lineItems = [],
  setLineItems,
  onLineItemAdd,
  onDeselectAll,
  selectedLineItems,
  // categoryName,
  cloudProviders,
  selectedProvider,
  onProviderChange,
  tableData,
  selectedProgramId,
  selectedProjectId,
  selectedCategoryId,
}) => {
  const categoryName = tableData
    .find(program => program.id === selectedProgramId)
    ?.projects.find(project => project.id === selectedProjectId)
    ?.categories.find(category => category.id === selectedCategoryId)
    ?.name ?? '';
  const columns = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'Total', 'Average'];
  const numberOfCosts = 13;

  // Calculate totals for each cost and overall
  const costTotals = Array(numberOfCosts).fill(0);
  let totalOfTotals = 0;

  (lineItems || []).forEach(item => {
    if (!item.costs || !Array.isArray(item.costs)) {
      console.warn(`LineItem with id ${item.id} has no costs array.`);
      item.costs = Array(numberOfCosts).fill({ value: 0 });
    }
    item.costs.forEach((cost, index) => {
      costTotals[index] += Number(cost.value);
    });
    totalOfTotals += item.costs.reduce((sum, cost) => sum + Number(cost.value), 0);
  });

  const averageOfAverages = lineItems.length > 0 ? totalOfTotals / (lineItems.length * numberOfCosts) : 0;

  const [errorMessages, setErrorMessages] = useState<{ [key: number]: string }>({});

  const handleAddLineItem = useCallback(() => {
    const newItem: LineItem = {
      id: Date.now() + Math.random(),
      name: `LINE ITEM-${Date.now()}`,
      costs: Array(numberOfCosts).fill({ value: 0 }),
    };
    setLineItems(prevItems => [...prevItems, newItem]);

    if (onLineItemAdd) {
      onLineItemAdd(newItem);
    }
  }, [setLineItems, onLineItemAdd]);

  const handleUpdateValue = (itemId: number, field: string, value: string, costIndex?: number) => {
    console.log(`Updating item ${itemId}, field: ${field}, value: ${value}, costIndex: ${costIndex}`);
    const { isValid, message } = validateCellValue(value.replace(/\$/g, ''));

    if (!isValid) {
      setErrorMessages(prevErrors => ({
        ...prevErrors,
        [itemId]: message || ''
      }));
      return;
    }

    const numericValue = parseFloat(value.replace(/\$/g, '')) || 0;

    if (field === 'cost' && costIndex !== undefined) {
      setLineItems(prevItems => 
        prevItems.map(item => {
          if (item.id === itemId) {
            const newCosts = [...item.costs];
            newCosts[costIndex] = { value: numericValue };
            return { ...item, costs: newCosts };
          }
          return item;
        })
      );
    } else if (field === 'name') {
      setLineItems(prevItems => 
        prevItems.map(item => {
          if (item.id === itemId) {
            return { ...item, name: value };
          }
          return item;
        })
      );
    }

    setErrorMessages(prevErrors => ({
      ...prevErrors,
      [itemId]: ''
    }));
  };

  const handleRemoveLastLineItem = () => {
    setLineItems(prevItems => {
      if (prevItems.length > 0) {
        return prevItems.slice(0, -1);
      }
      return prevItems;
    });
  };

  const handleDeselectAll = () => {
    onDeselectAll();
  };

  const handleCloneLineItem = async (item: LineItem) => {
    console.log('Cloning line item:', item);
    try {
      const response = await cloneItem(item.id!, selectedCategoryId || undefined);
      console.log('Response:', response);
      // Create a new line item from the response
      const clonedItem: LineItem = {
        id: response.item.id,
        name: response.item.name,
        costs: response.item.costs,
      };
      
      setLineItems(prevItems => [...prevItems, clonedItem]);
    } catch (error) {
      console.error('Error cloning line item:', error);
      // You might want to add error handling/notification here
    }
  };

  const handleCloneCategory = async () => {
    if (!selectedCategoryId) return;
    
    try {
      const response = await cloneCategory(selectedCategoryId, selectedProjectId || undefined);
      // You might want to add some feedback or refresh mechanism here
      console.log('Category cloned successfully:', response);
    } catch (error) {
      console.error('Error cloning category:', error);
    }
  };

  return (
    <div className="line-items-table">
      <div className="table-header">
        <h3 className="category-name">
          {categoryName}
          <button 
            className="clone-button category-clone"
            onClick={handleCloneCategory}
            title="Clone category"
          >
            <FontAwesomeIcon icon={faClone} />
          </button>
        </h3>
        <ActionButtons
          handleRemoveLastLineItem={handleRemoveLastLineItem}
          handleDeselectAll={handleDeselectAll}
          handleAddLineItem={handleAddLineItem}
          selectedLineItemsCount={selectedLineItems.length}
          cloudProviders={cloudProviders}
          selectedProvider={selectedProvider}
          onProviderChange={onProviderChange}
        />
      </div>
      <table className="line-items-table">
        <thead>
          <tr className="header-row">
            {columns.map((col, index) => (
              <th key={index} className="header-cell">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="summary-row">
            {costTotals.map((total, index) => (
              <td key={index} className="summary-cell">{total.toFixed(0)}$</td>
            ))}
            <td className="summary-cell">{totalOfTotals.toFixed(2)}$</td>
            <td className="summary-cell">{averageOfAverages.toFixed(2)}$</td>
          </tr>
          {lineItems.map((item) => {
            const total = item.costs.reduce((sum, cost) => sum + Number(cost.value), 0);
            const average = total / numberOfCosts;

            return (
              <React.Fragment key={item.id}>
                <tr className="line-item-row">
                  <td className="line-item-label" colSpan={columns.length}>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateValue(item.id!, 'name', e.target.value)}
                      className="line-item-input"
                    />
                    <button 
                      className="clone-button"
                      onClick={() => handleCloneLineItem(item)}
                      title="Clone line item"
                    >
                      <FontAwesomeIcon icon={faClone} />
                    </button>
                  </td>
                </tr>
                <tr>
                  {item.costs.map((cost, costIndex) => (
                    <td key={costIndex} className="line-item-cell">
                      <input
                        type="text"
                        value={`${cost.value}$`}
                        onChange={(e) => handleUpdateValue(item.id!, 'cost', e.target.value, costIndex)}
                        className="cost-input"
                      />
                    </td>
                  ))}
                  <td className="line-item-cell">{total.toFixed(2)}$</td>
                  <td className="line-item-cell">{average.toFixed(2)}$</td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LineItemsTable;
