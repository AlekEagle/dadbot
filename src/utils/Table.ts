export type TableDataEntry = string | number;
export type TableDataEntryGenerator = () => TableDataEntry[];
export type TableData = TableDataEntry[] | TableDataEntryGenerator;
export type TableDataConstructor = {
  [key: string]: TableData;
};
export type TableDataObject = { [key: string]: TableDataEntry[] };
export type TotalRow = (columns: TableDataObject) => string[];

export interface TableConstructorOptions {
  ellipsis?: {
    side?: "left" | "right";
    symbol?: string;
  };
  column?: {
    minWidth?: number | "auto";
    maxWidth?: number;
    padding?: number;
  };
  totals?: false | TotalRow;
}

export default class Table {
  public static Symbols = {
    ULCorner: "┌",
    USeparator: "┬",
    URCorner: "┐",
    LSeparator: "├",
    CSeparator: "┼",
    RSeparator: "┤",
    DLCorner: "└",
    DSeparator: "┴",
    DRCorner: "┘",
    VSeparator: "│",
    HSeparator: "―",
  };
  public ellipsis: {
    side: "left" | "right";
    symbol: string;
  } = { side: "right", symbol: "..." };

  public column: {
    minWidth: number | "auto";
    maxWidth: number | "auto";
    padding: number;
  } = { minWidth: "auto", maxWidth: "auto", padding: 0 };

  public totals: false | TotalRow = false;

  readonly entries: Map<string, TableData> = new Map();

  constructor(
    entries?: TableDataConstructor,
    options?: TableConstructorOptions
  ) {
    if (options) Object.assign(this, options);

    if (entries) {
      for (let [key, value] of Object.entries(entries)) {
        this.entries.set(key, value);
      }
    }
  }

  public get text(): string {
    return this.constructTable().join("\n");
  }

  public get rows(): string[] {
    return this.constructTable();
  }

  private constructTable(): string[] {
    let rows: string[] = [
        Table.Symbols.ULCorner,
        Table.Symbols.VSeparator,
        Table.Symbols.LSeparator,
      ],
      { tableData } = this.calculateTableData(),
      maxRows = this.calculateMaxRows(this.sortedTableData(tableData)),
      calculatedTotals = !!this.totals ? this.totals(tableData) : null;

    Array.from(Object.entries(tableData)).forEach((entry, ind, arr) => {
      let dataStr = entry[1].map((a) => a.toString()),
        colSize = this.calculateColumnWidth(
          entry[0],
          this.sortedTableData(tableData)[entry[0]].map((a) => a.toString()),
          calculatedTotals !== null ? calculatedTotals[ind] : ""
        ),
        currentDataRow = 0;

      rows[0] +=
        Table.Symbols.HSeparator.repeat(colSize) +
        (ind === arr.length - 1
          ? Table.Symbols.URCorner
          : Table.Symbols.USeparator);

      rows[1] +=
        (entry[0].length <= colSize
          ? entry[0] + " ".repeat(colSize - entry[0].length)
          : this.ellipsisText(entry[0])) + Table.Symbols.VSeparator;

      rows[2] +=
        Table.Symbols.HSeparator.repeat(colSize) +
        (ind === arr.length - 1
          ? Table.Symbols.RSeparator
          : Table.Symbols.CSeparator);

      for (let i = 0; i < maxRows; i++) {
        let e = dataStr[i] || "N/A";
        let tE = this.ellipsisText(e);

        if (ind === 0)
          rows[currentDataRow++ + 3] =
            Table.Symbols.VSeparator +
            tE +
            " ".repeat(colSize - tE.length) +
            Table.Symbols.VSeparator;
        else
          rows[currentDataRow++ + 3] +=
            tE + " ".repeat(colSize - tE.length) + Table.Symbols.VSeparator;
      }

      if (!this.totals) {
        if (ind === 0) {
          rows[currentDataRow + 3] =
            Table.Symbols.DLCorner +
            Table.Symbols.HSeparator.repeat(colSize) +
            Table.Symbols.DSeparator;
        } else if (ind === arr.length - 1) {
          rows[currentDataRow + 3] +=
            Table.Symbols.HSeparator.repeat(colSize) + Table.Symbols.DRCorner;
        } else {
          rows[currentDataRow + 3] +=
            Table.Symbols.HSeparator.repeat(colSize) + Table.Symbols.DSeparator;
        }
      } else {
        if (ind === 0) {
          rows[currentDataRow++ + 3] =
            Table.Symbols.LSeparator +
            Table.Symbols.HSeparator.repeat(colSize) +
            Table.Symbols.CSeparator;
        } else if (ind === arr.length - 1) {
          rows[currentDataRow++ + 3] +=
            Table.Symbols.HSeparator.repeat(colSize) + Table.Symbols.RSeparator;
        } else {
          rows[currentDataRow++ + 3] +=
            Table.Symbols.HSeparator.repeat(colSize) + Table.Symbols.CSeparator;
        }

        let colTotal = calculatedTotals[ind];
        let tT = this.ellipsisText(colTotal);

        if (ind === 0) {
          rows[currentDataRow++ + 3] =
            Table.Symbols.VSeparator +
            tT +
            " ".repeat(colSize - tT.length) +
            Table.Symbols.VSeparator;
        } else {
          rows[currentDataRow++ + 3] +=
            tT + " ".repeat(colSize - tT.length) + Table.Symbols.VSeparator;
        }

        if (ind === 0) {
          rows[currentDataRow + 3] =
            Table.Symbols.DLCorner +
            Table.Symbols.HSeparator.repeat(colSize) +
            Table.Symbols.DSeparator;
        } else if (ind === arr.length - 1) {
          rows[currentDataRow + 3] +=
            Table.Symbols.HSeparator.repeat(colSize) + Table.Symbols.DRCorner;
        } else {
          rows[currentDataRow + 3] +=
            Table.Symbols.HSeparator.repeat(colSize) + Table.Symbols.DSeparator;
        }
      }
    });
    return rows;
  }

  private calculateMaxRows(data: TableDataObject): number {
    return Object.values(data).sort((a, b) => b.length - a.length)[0].length;
  }

  private calculateColumnWidth(
    name: string,
    data: string[],
    totalData: string
  ): number {
    if (
      this.column.minWidth !== "auto" &&
      name.length < this.column.minWidth &&
      data[0].length < this.column.minWidth &&
      totalData.length < this.column.minWidth
    )
      return this.column.minWidth + this.column.padding;

    if (
      this.column.maxWidth !== "auto" &&
      (name.length >= this.column.maxWidth ||
        totalData.length >= this.column.maxWidth ||
        data[0].length >= this.column.maxWidth)
    )
      return this.column.maxWidth + this.column.padding;

    return (
      Math.max(name.length, data[0].length, totalData.length) +
      this.column.padding
    );
  }

  private sortedTableData(data: TableDataObject): {
    [key: string]: TableDataEntry[];
  } {
    let interData = Object.entries(data).map((entry) => {
      return [
        entry[0],
        [...entry[1]].sort((a, b) => {
          return (
            (typeof b === "number" ? b.toString().length : b.length) -
            (typeof a === "number" ? a.toString().length : a.length)
          );
        }),
      ];
    });

    let finalData: TableDataObject = {};

    interData.forEach((e) => {
      finalData[e[0] as string] = e[1] as TableDataEntry[];
    });

    return finalData;
  }

  private calculateTableData(): {
    tableData: TableDataObject;
    totals: string[] | null;
  } {
    let finalData: TableDataObject = {};

    Array.from(this.entries).forEach((entry) => {
      let functOut = typeof entry[1] === "function" ? entry[1]() : entry[1];

      finalData[entry[0]] = functOut;
    });

    return {
      tableData: finalData,
      totals: !!this.totals ? this.totals(finalData) : null,
    };
  }

  private ellipsisText(text: string | number): string {
    if (this.column.maxWidth === "auto") return text.toString();
    let workingText = typeof text === "number" ? text.toString() : text;

    if (workingText.length <= this.column.maxWidth) return workingText;
    else {
      switch (this.ellipsis.side) {
        case "left":
          workingText =
            this.ellipsis.symbol +
            workingText.slice(
              workingText.length -
                this.column.maxWidth -
                1 +
                this.ellipsis.symbol.length,
              workingText.length
            );
          break;

        case "right":
          workingText =
            workingText.slice(
              0,
              this.column.maxWidth - this.ellipsis.symbol.length
            ) + this.ellipsis.symbol;
          break;
      }
      return workingText;
    }
  }
}
