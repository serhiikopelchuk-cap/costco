import { Item } from '../../../types/program';

export interface CellPosition {
  itemId: number;
  costId: number;
}

export interface CellRange {
  startCell: CellPosition;
  endCell: CellPosition;
}

export class SelectionManager {
  private ranges: CellRange[] = [];
  private subscribers: (() => void)[] = [];
  
  constructor(
    private items: Item[],
    private frozenPeriods: { [key: number]: boolean }
  ) {}

  public updateItems(newItems: Item[]): void {
    this.items = newItems;
    this.ranges = [];
    this.notifySubscribers();
  }

  public updateFrozenPeriods(newFrozenPeriods: { [key: number]: boolean }): void {
    this.frozenPeriods = newFrozenPeriods;
    this.notifySubscribers();
  }

  public startNewRange(cell: CellPosition): void {
    if (!this.isValidCell(cell)) return;
    
    console.log('Starting new range:', cell);
    this.ranges = [{
      startCell: cell,
      endCell: cell
    }];
    this.notifySubscribers();
  }

  public updateLastRange(cell: CellPosition): void {
    if (this.ranges.length === 0 || !this.isValidCell(cell)) return;

    console.log('Updating range:', {
      start: this.ranges[0].startCell,
      end: cell
    });

    const lastRange = this.ranges[0];
    lastRange.endCell = cell;
    this.notifySubscribers();
  }

  private isValidCell(cell: CellPosition): boolean {
    const item = this.items.find(i => i.id === cell.itemId);
    if (!item) return false;

    const sortedCosts = [...item.costs].sort((a, b) => (a.id || 0) - (b.id || 0));
    const costIndex = sortedCosts.findIndex(c => c.id === cell.costId);
    
    return costIndex !== -1 && !this.frozenPeriods[costIndex + 1];
  }

  public getSelectedCells(): CellPosition[] {
    if (this.ranges.length === 0) return [];

    const range = this.ranges[0];
    
    const startItemIndex = this.items.findIndex(item => item.id === range.startCell.itemId);
    const endItemIndex = this.items.findIndex(item => item.id === range.endCell.itemId);
    
    if (startItemIndex === -1 || endItemIndex === -1) return [];

    const startItem = this.items[startItemIndex];
    const endItem = this.items[endItemIndex];
    
    if (!startItem?.costs || !endItem?.costs) return [];

    const startCosts = [...startItem.costs].sort((a, b) => (a.id || 0) - (b.id || 0));
    const endCosts = [...endItem.costs].sort((a, b) => (a.id || 0) - (b.id || 0));
    
    const startColIndex = startCosts.findIndex(cost => cost.id === range.startCell.costId);
    const endColIndex = endCosts.findIndex(cost => cost.id === range.endCell.costId);

    const minItemIndex = Math.min(startItemIndex, endItemIndex);
    const maxItemIndex = Math.max(startItemIndex, endItemIndex);
    const minColIndex = Math.min(startColIndex, endColIndex);
    const maxColIndex = Math.max(startColIndex, endColIndex);

    const cells: CellPosition[] = [];
    
    for (let i = minItemIndex; i <= maxItemIndex; i++) {
      const item = this.items[i];
      if (!item?.id || !item.costs) continue;

      const sortedCosts = [...item.costs].sort((a, b) => (a.id || 0) - (b.id || 0));
      
      for (let j = minColIndex; j <= maxColIndex; j++) {
        const cost = sortedCosts[j];
        if (!cost?.id || this.frozenPeriods[j + 1]) continue;

        cells.push({
          itemId: item.id,
          costId: cost.id
        });
      }
    }

    return cells;
  }

  public subscribe(callback: () => void): void {
    this.subscribers.push(callback);
  }

  public unsubscribe(callback: () => void): void {
    this.subscribers = this.subscribers.filter(cb => cb !== callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }
} 