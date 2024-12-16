import { Item } from "../../../types/program";

export interface Position {
  itemId: number;
  costId: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export class CellRangeSelector {
  private ranges: Range[] = [];
  private subscribers: (() => void)[] = [];

  constructor(
    private readonly items: Item[],
    private readonly frozenPeriods: { [key: number]: boolean }
  ) {}

  public startNewRange(position: Position): void {
    // Если нажата клетка из существующего range - начинаем новый range
    // Иначе - добавляем новый range к существующим
    const existingRangeIndex = this.findRangeIndex(position);
    
    if (existingRangeIndex !== -1) {
      this.ranges = [{
        start: position,
        end: position
      }];
    } else {
      this.ranges.push({
        start: position,
        end: position
      });
    }
    
    this.notifySubscribers();
  }

  public updateLastRange(position: Position): void {
    if (this.ranges.length === 0) return;
    
    const lastRange = this.ranges[this.ranges.length - 1];
    lastRange.end = position;
    
    this.notifySubscribers();
  }

  public getSelectedCells(): Position[] {
    const cells = new Set<string>();

    this.ranges.forEach(range => {
      const selectedCells = this.getCellsInRange(range);
      selectedCells.forEach(cell => cells.add(`${cell.itemId}-${cell.costId}`));
    });

    return Array.from(cells).map(key => {
      const [itemId, costId] = key.split('-');
      return {
        itemId: parseInt(itemId),
        costId: parseInt(costId)
      };
    });
  }

  private getCellsInRange(range: Range): Position[] {
    const cells: Position[] = [];
    
    // Находим индексы строк
    const startRowIndex = this.items.findIndex(item => item.id === range.start.itemId);
    const endRowIndex = this.items.findIndex(item => item.id === range.end.itemId);
    
    if (startRowIndex === -1 || endRowIndex === -1) return cells;

    // Находим индексы колонок
    const startItem = this.items[startRowIndex];
    const startColIndex = startItem.costs.findIndex(cost => cost.id === range.start.costId);
    const endColIndex = startItem.costs.findIndex(cost => cost.id === range.end.costId);

    if (startColIndex === -1 || endColIndex === -1) return cells;

    // Определяем границы выделения
    const minRow = Math.min(startRowIndex, endRowIndex);
    const maxRow = Math.max(startRowIndex, endRowIndex);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = Math.max(startColIndex, endColIndex);

    // Собираем все клетки в диапазоне
    for (let i = minRow; i <= maxRow; i++) {
      const item = this.items[i];
      if (!item?.id) continue;

      const sortedCosts = [...item.costs].sort((a, b) => (a.id || 0) - (b.id || 0));
      
      for (let j = minCol; j <= maxCol; j++) {
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

  private findRangeIndex(position: Position): number {
    return this.ranges.findIndex(range => 
      this.getCellsInRange(range).some(cell => 
        cell.itemId === position.itemId && 
        cell.costId === position.costId
      )
    );
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