import React, { SetStateAction } from 'react';
import './LineItemsTable.css';

interface LineItem {
  id: number;
  name: string;
  periods: number[];
}

interface LineItemsTableProps {
  lineItems: LineItem[];
  setLineItems: (newLineItems: SetStateAction<LineItem[]>) => void;
  onLineItemAdd: (newLineItem: LineItem) => void;
  onDeselectAll: () => void;
  selectedLineItems: LineItem[];
}

const LineItemsTable: React.FC<LineItemsTableProps> = ({ lineItems, setLineItems, onLineItemAdd, onDeselectAll, selectedLineItems }) => {
  const columns = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'Total', 'Average'];
  const numberOfPeriods = 13;

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: Date.now(),
      name: `LINE ITEM-${Date.now()}`,
      periods: Array(numberOfPeriods).fill(0),
    };
    setLineItems(prevItems => [...prevItems, newItem]);

    if (onLineItemAdd) {
      onLineItemAdd(newItem);
    }
  };

  const handleUpdateValue = (itemId: number, field: string, value: string | number, periodIndex?: number) => {
    setLineItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          if (field === 'name') {
            return { ...item, name: value as string };
          } else if (field === 'period' && periodIndex !== undefined) {
            const newPeriods = [...item.periods];
            newPeriods[periodIndex] = Number(value) || 0;
            return { ...item, periods: newPeriods };
          }
        }
        return item;
      })
    );
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

  return (
    <>
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
          {lineItems.map((item) => {
            const total = item.periods.reduce((sum, val) => sum + val, 0);
            const average = total / numberOfPeriods;

            return (
              <React.Fragment key={item.id}>
                <tr className="line-item-row">
                  <td className="line-item-label" colSpan={columns.length}>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateValue(item.id, 'name', e.target.value)}
                      className="line-item-input"
                    />
                  </td>
                </tr>
                <tr>
                  {item.periods.map((value, periodIndex) => (
                    <td key={periodIndex} className="line-item-cell">
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleUpdateValue(item.id, 'period', e.target.value, periodIndex)}
                        className="period-input"
                      />
                    </td>
                  ))}
                  <td className="line-item-cell">{total}$</td>
                  <td className="line-item-cell">{average.toFixed(2)}$</td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      <div className="add-item-button-container">
        <button 
          className="remove-item-button"
          onClick={handleRemoveLastLineItem}
          aria-label="Remove last line item"
        >
          -
        </button>
        <button 
          className="deselect-all-button"
          onClick={handleDeselectAll}
          aria-label="Deselect all line items"
          disabled={selectedLineItems.length === 0}
        >
          ⮟
        </button>
        <button 
          className="add-item-button"
          onClick={handleAddLineItem}
          aria-label="Add new line item"
        >
          +
        </button>
      </div>
    </>
  );
};

export default LineItemsTable;
