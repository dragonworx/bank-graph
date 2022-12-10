export class AggregatedRecord
{
    public records: string[][];

    constructor(public readonly columnName: string)
    {
        this.records = [];
    }

    get size()
    {
        return this.records.length;
    }
}

export class Aggregator
{
    private readonly map: Map<string, AggregatedRecord>;

    constructor(public readonly headers: string[])
    {
        this.map = new Map();
    }

    public hasRecord(recordKey: string)
    {
        return this.map.has(recordKey);
    }

    public getRecord(recordKey: string)
    {
        const { map } = this;

        if (!map.has(recordKey))
        {
            throw new Error(`Record with key "${recordKey}" not found`);
        }

        return map.get(recordKey) as AggregatedRecord;
    }

    public addRecord(recordKey: string, record: string[])
    {
        const { map } = this;

        if (!map.has(recordKey))
        {
            map.set(recordKey, new AggregatedRecord(recordKey));
        }

        (map.get(recordKey) as AggregatedRecord).records.push(record);
    }

    public forEach(callback: (record: AggregatedRecord) => void)
    {
        for (const record of this.map.values())
        {
            callback(record);
        }
    }

    public collect(recordKey: string, columnName: string)
    {
        const values: string[] = [];
        const aggregateRecord = this.getRecord(recordKey);
        const index = this.headers.indexOf(columnName);

        if (index === -1)
        {
            throw new Error(`Column "${columnName}" not found`);
        }

        aggregateRecord.records.forEach((record) => values.push(record[index]));

        return values;
    }

    // method to sum the values of a column for a record
    public sum(recordKey: string, columnName: string)
    {
        const values = this.collect(recordKey, columnName);
        const sum = values.reduce((a, b) => a + parseFloat(b), 0);

        return sum;
    }
}

