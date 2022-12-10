import csv from 'csvtojson';

import { Aggregator } from './aggregator';

export interface Options
{
    noheader: boolean;
}

export class RecordGroup
{
    constructor(public readonly columnName: string, public readonly rows: string[][])
    {

    }
}

export class CSV
{
    public header: string[];
    public rows: string[][];
    public replacers: Map<RegExp, string>;
    public converters: Map<RegExp, string>;

    public static async fromFile(file: File, options: Partial<Options> = {})
    {
        const text = await file.text();

        return CSV.fromText(text, options);
    }

    public static async fromText(text: string, options: Partial<Options> = {})
    {
        const csvObj = new CSV();

        const csvRows = await csv({
            noheader: true,
            ...options,
            output: 'csv',
        })
            .fromString(text);

        const [header, ...rows] = csvRows;

        csvObj.setData(header, rows);

        return csvObj;
    }

    constructor()
    {
        this.header = [];
        this.rows = [];
        this.replacers = new Map();
        this.converters = new Map();
    }

    public setData(header: string[], rows: string[][])
    {
        this.header = header;
        this.rows = rows;
    }

    get columnCount()
    {
        return this.header.length;
    }

    get rowCount()
    {
        return this.rows.length;
    }

    public replace(regex: RegExp | string, replace: string)
    {
        this.replacers.set(regex instanceof RegExp ? regex : new RegExp(regex), replace);

        return this;
    }

    public convert(regex: RegExp | string, replace: string)
    {
        this.converters.set(regex instanceof RegExp ? regex : new RegExp(regex), replace);

        return this;
    }

    public getColumnIndex(columnName: string)
    {
        const index = this.header.indexOf(columnName);

        if (index === -1)
        {
            throw new Error(`Column "${columnName}" not found`);
        }

        return index;
    }

    public getRowValue(rowIndex: number, columnName: string)
    {
        const index = this.getColumnIndex(columnName);
        const row = this.rows[rowIndex];

        if (!row)
        {
            throw new Error(`Row #${rowIndex} not found`);
        }

        return row[index];
    }

    public replaceValue(value: string)
    {
        for (const [regex, replace] of this.replacers.entries())
        {
            const match = regex.exec(value);

            if (match)
            {
                return value.replace(regex, replace);
            }
        }

        return value;
    }

    public convertValue(value: string)
    {
        for (const [regex, replace] of this.converters.entries())
        {
            const match = regex.exec(value);

            if (match)
            {
                return replace;
            }
        }

        return value;
    }

    public aggregateBy(groupByColumn: string)
    {
        const { rows } = this;
        const aggregator: Aggregator = new Aggregator(this.header);

        for (let i = 0; i < rows.length; i++)
        {
            const row = rows[i];
            let value = this.getRowValue(i, groupByColumn).trim();

            value = this.replaceValue(value);
            value = this.convertValue(value);

            aggregator.addRecord(value, row);
        }

        return aggregator;
    }
}
