import React, { SetStateAction, useState, useCallback } from 'react';
import './LineItemsTable.css';
import { validateCellValue } from '../utils/validationUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import ActionButtons from './ActionButtons';

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
  categoryName: string;
}

const LineItemsTable: React.FC<LineItemsTableProps> = ({ lineItems, setLineItems, onLineItemAdd, onDeselectAll, selectedLineItems, categoryName }) => {
  const columns = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'Total', 'Average'];
  const numberOfPeriods = 13;

  // Calculate totals for each period and overall
  const periodTotals = Array(numberOfPeriods).fill(0);
  let totalOfTotals = 0;

  lineItems.forEach(item => {
    item.periods.forEach((value, index) => {
      periodTotals[index] += value;
    });
    totalOfTotals += item.periods.reduce((sum, val) => sum + val, 0);
  });

  const averageOfAverages = lineItems.length > 0 ? totalOfTotals / (lineItems.length * numberOfPeriods) : 0;

  const [errorMessages, setErrorMessages] = useState<{ [key: number]: string }>({});

  const handleAddLineItem = useCallback(() => {
    console.log('Adding new line item');
    const newItem: LineItem = {
      id: Date.now() + Math.random(),
      name: `LINE ITEM-${Date.now()}`,
      periods: Array(numberOfPeriods).fill(0),
    };
    setLineItems(prevItems => [...prevItems, newItem]);

    if (onLineItemAdd) {
      onLineItemAdd(newItem);
    }
  }, [setLineItems, onLineItemAdd]);

  const handleUpdateValue = (itemId: number, field: string, value: string, periodIndex?: number) => {
    // Remove the dollar sign for validation and calculation
    const numericValue = value.replace(/\$/g, '');

    // Allow intermediate states like "20."
    if (field === 'period' && periodIndex !== undefined) {
      setLineItems(prevItems => 
        prevItems.map(item => {
          if (item.id === itemId) {
            const newPeriods = [...item.periods];
            newPeriods[periodIndex] = numericValue.endsWith('.') ? parseFloat(numericValue) : parseFloat(numericValue) || 0;
            return { ...item, periods: newPeriods };
          }
          return item;
        })
      );
    } else if (field === 'name') {
      setLineItems(prevItems => 
        prevItems.map(item => {
          if (item.id === itemId) {
            return { ...item, name: numericValue };
          }
          return item;
        })
      );
    }

    // Clear error messages if any
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

  return (
    <div className="line-items-table">
      <div className="table-header">
        <h3 className="category-name">{categoryName}</h3>
        <ActionButtons
          handleRemoveLastLineItem={handleRemoveLastLineItem}
          handleDeselectAll={handleDeselectAll}
          handleAddLineItem={handleAddLineItem}
          selectedLineItemsCount={selectedLineItems.length} cloudProviders={[]} selectedProvider={''} onProviderChange={function (provider: string): void {
            throw new Error('Function not implemented.');
          } }        />
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
            {periodTotals.map((total, index) => (
              <td key={index} className="summary-cell">{total}$</td>
            ))}
            <td className="summary-cell">{totalOfTotals}$</td>
            <td className="summary-cell">{averageOfAverages.toFixed(2)}$</td>
          </tr>
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
                    {/* {errorMessages[item.id] && <span className="error-message">{errorMessages[item.id]}</span>} */}
                  </td>
                </tr>
                <tr>
                  {item.periods.map((value, periodIndex) => (
                    <td key={periodIndex} className="line-item-cell">
                      <input
                        type="text"
                        value={`${value}$`}
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
    </div>
  );
};

export default LineItemsTable;
