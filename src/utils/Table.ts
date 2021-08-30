export const TableSymbols = {
  ULCorner: '┌',
  USeparator: '┬',
  URCorner: '┐',
  LSeparator: '├',
  CSeparator: '┼',
  RSeparator: '┤',
  DLCorner: '└',
  DSeparator: '┴',
  DRCorner: '┘',
  VSeparator: '│',
  HSeparator: '―'
};

type TableDataEntry = string | number;
type TableDataEntryGenerator = () =>
  | TableDataEntry[]
  | Promise<TableDataEntry[]>;
type TableData = TableDataEntry[] | TableDataEntryGenerator;
type TableDataConstructor = {
  [key: string]: TableData;
};

export interface TableConstructorOptions {
  ellipsis: {
    side: 'left' | 'right';
    symbol: string;
  };
  column: {
    minWidth: number | 'auto';
    maxWidth: number;
  };
}

export default class Table {
  public ellipsis: {
    side: 'left' | 'right';
    symbol: string;
  } = { side: 'right', symbol: '...' };

  public column: {
    minWidth: number | 'auto';
    maxWidth: number;
  } = { minWidth: 'auto', maxWidth: 10 };

  readonly entries: Map<string, TableData> = new Map();

  constructor(
    entries: TableDataConstructor,
    options?: TableConstructorOptions
  ) {
    if (options) Object.assign(this, options);
  }
}
