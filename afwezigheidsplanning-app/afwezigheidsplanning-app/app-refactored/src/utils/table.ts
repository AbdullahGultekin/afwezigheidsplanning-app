// Table utility functions for compact Excel-style tables

export interface TableConfig {
  fontSize?: number;
  dayColumnWidth?: number;
  nameColumnWidth?: number;
  stickyColumnWidth?: number;
}

const DEFAULT_CONFIG: Required<TableConfig> = {
  fontSize: 9,
  dayColumnWidth: 32,
  nameColumnWidth: 110,
  stickyColumnWidth: 35,
};

export function getCompactTableStyles(config: TableConfig = {}): string {
  const c = { ...DEFAULT_CONFIG, ...config };
  return `font-size: ${c.fontSize}px; border-collapse: collapse; width: 100%; table-layout: fixed;`;
}

export function getHeaderCellStyle(
  width: number,
  sticky: boolean = false,
  left: number = 0,
  bgColor: string = '#4472C4'
): string {
  let style = `border: 1px solid ${bgColor}; padding: 3px; text-align: center; width: ${width}px; background: ${bgColor}; color: white; font-weight: bold;`;
  if (sticky) {
    style += ` position: sticky; left: ${left}px; z-index: 10;`;
  }
  return style;
}

export function getDataCellStyle(padding: number = 1): string {
  return `border: 1px solid #ddd; padding: ${padding}px; text-align: center; font-size: 9px;`;
}

export function getStickyCellStyle(
  left: number,
  bgColor: string = 'white',
  fontSize: number = 9
): string {
  return `border: 1px solid #ddd; padding: 3px; position: sticky; left: ${left}px; background: ${bgColor}; z-index: 5; font-size: ${fontSize}px;`;
}

export function getDayName(day: number, year: number, month: number): string {
  if (day > new Date(year, month, 0).getDate()) return '';
  const date = new Date(year, month - 1, day);
  const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
  return dayNames[date.getDay()];
}

