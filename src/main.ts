import './style.css';

import { CSV } from './csv';
import { DropZone } from './dropzone';
import { test } from './test';

const appElement = document.getElementById('app') as HTMLDivElement;

const dropzone = new DropZone(appElement);

dropzone.on('drop', async (files: FileList) =>
{
    if (files.length > 0)
    {
        const file = files[0];
        const text = await file.text();

        localStorage['csv'] = text;

        const csv = await CSV.fromText(text);

        initCSV(csv);
    }
});

if (localStorage['csv'])
{
    const csv = await CSV.fromText(localStorage['csv']);

    initCSV(csv);
}

async function initCSV(csv: CSV)
{
    csv
        .convert(/\bgoogle\b/i, 'Google')
        .convert(/\btransfer\b/i, 'Transfer')
        .convert(/\binterest\b/i, 'Interest')
        .convert(/\bqbe\b/i, 'QBE')
        .convert(/\bfee\b/i, 'Fee');

    // const aggregator = csv.aggregateBy('Narration');

    // aggregator.forEach((record) =>
    // {
    //     console.log(record.columnName, record.size);
    // });

    // console.log(aggregator.collect('QBE', 'Debit'));
    // console.log(aggregator.sum('QBE', 'Debit'));
}

test();
