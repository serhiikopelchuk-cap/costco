import React, { useState, useContext } from 'react';
import { Item } from '../../../types/program';
import { SelectionProvider, SelectionContext } from './SelectionContext';
import CellSelection from './CellSelection';
import CurrencyInput from '../../common/CurrencyInput';

interface FrozenPeriods {
  [key: number]: boolean;
}

export const frozenTestPeriods: FrozenPeriods = {
  [1]: true,  // P1 frozen
  [2]: false, // P2 not frozen
  [3]: false,
  [4]: false,
  [5]: false
};

const testItems: Item[] = [
  {
    id: 1,
    name: "Test Item 1",
    costs: [
      { id: 101, value: 100 },
      { id: 102, value: 200 },
      { id: 103, value: 300 },
      { id: 104, value: 400 },
      { id: 105, value: 500 },
    ]
  },
  {
    id: 2,
    name: "Test Item 2",
    costs: [
      { id: 201, value: 150 },
      { id: 202, value: 250 },
      { id: 203, value: 350 },
      { id: 204, value: 450 },
      { id: 205, value: 550 },
    ]
  },
  {
    id: 3,
    name: "Test Item 3",
    costs: [
      { id: 301, value: 160 },
      { id: 302, value: 260 },
      { id: 303, value: 360 },
      { id: 304, value: 460 },
      { id: 305, value: 560 },
    ]
  }
];

const TestSelectionTable: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h3>Test Selection Table</h3>
      <SelectionProvider items={testItems} frozenPeriods={frozenTestPeriods}>
        <TestTableContent />
      </SelectionProvider>
    </div>
  );
};

const TestTableContent: React.FC = () => {
  const { selectedCells } = useContext(SelectionContext);
  const [editingValues, setEditingValues] = useState<{ [key: string]: string }>({});
  const [testItemsState, setTestItemsState] = useState<Item[]>(testItems);

  const handleInputChange = (itemId: number, costId: number, value: string) => {
    const sanitizedValue = value.replace(/[^0-9.$]/g, '');
    const numericValue = parseFloat(sanitizedValue.replace(/\$/g, ''));
    
    if (numericValue < 0) return;

    if (selectedCells.some(cell => cell.itemId === itemId && cell.costId === costId)) {
      selectedCells.forEach(cell => {
        const key = `${cell.itemId}-${cell.costId}`;
        setEditingValues(prev => ({
          ...prev,
          [key]: sanitizedValue
        }));
      });
    } else {
      const key = `${itemId}-${costId}`;
      setEditingValues(prev => ({
        ...prev,
        [key]: sanitizedValue
      }));
    }
  };

  const handleInputBlur = (itemId: number, costId: number, value: string) => {
    const numericValue = parseFloat(value.replace(/\$/g, '')) || 0;

    if (selectedCells.some(cell => cell.itemId === itemId && cell.costId === costId)) {
      const updatedItems = [...testItemsState];
      selectedCells.forEach(cell => {
        const itemIndex = updatedItems.findIndex(item => item.id === cell.itemId);
        if (itemIndex !== -1) {
          const costIndex = updatedItems[itemIndex].costs.findIndex(cost => cost.id === cell.costId);
          if (costIndex !== -1) {
            updatedItems[itemIndex].costs[costIndex].value = numericValue;
          }
        }
      });
      setTestItemsState(updatedItems);
    } else {
      setTestItemsState(prev => 
        prev.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              costs: item.costs.map(cost => 
                cost.id === costId ? { ...cost, value: numericValue } : cost
              )
            };
          }
          return item;
        })
      );
    }
    setEditingValues({});
  };

  const isFrozen = (index: number): boolean => {
    return frozenTestPeriods[index + 1] || false;
  };

  return (
    <table className="items-table">
      <thead>
        <tr>
          <th>Item Name</th>
          {['P1', 'P2', 'P3', 'P4', 'P5'].map((period, index) => (
            <th key={period} className={`header-cell ${isFrozen(index) ? 'frozen' : ''}`}>
              {period}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {testItemsState.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            {[...item.costs].sort((a, b) => (a.id || 0) - (b.id || 0)).map((cost, index) => {
              const isSelected = selectedCells.some(cell => 
                cell.itemId === item.id! && 
                cell.costId === cost.id!
              );
              const cellIsFrozen = isFrozen(index);
              
              return (
                <CellSelection
                  key={cost.id}
                  itemId={item.id!}
                  costId={cost.id!}
                  index={index}
                  isFrozen={cellIsFrozen}
                  isSelected={isSelected}
                >
                  <div className="input-container">
                    <CurrencyInput
                      value={editingValues[`${item.id!}-${cost.id}`] !== undefined 
                        ? editingValues[`${item.id!}-${cost.id}`] 
                        : cost.value?.toString() || ''}
                      onChange={(value) => handleInputChange(item.id!, cost.id!, value)}
                      onBlur={(value) => handleInputBlur(item.id!, cost.id!, value)}
                      disabled={cellIsFrozen}
                      className="cost-input"
                    />
                  </div>
                </CellSelection>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TestSelectionTable; 