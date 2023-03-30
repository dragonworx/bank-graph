import type { CSV } from './csv';
import { measureText } from './xybrush/2dPainter';
import { Scene } from './xybrush/scene';
import { Text } from './xybrush/text';

export function createTable(csv: CSV)
{
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const scene = new Scene(canvas);

    scene.setSize(1000, 1000);

    const fontSize = 12;

    const x = 0;
    let y = 0;
    // const rows = csv.rows;
    const rows: string[][] = [];

    for (let i = 0; i < 10000; i++)
    {
        rows.push([`row ${i} - n,dsahkj dsahkjdhiu d dhjksa hdiua djksag dkjasg kjdahsgiu dbiwueeiu w biuds gfdksjbf kjfgdsjkf gfdsgkj gfjkdsg fjkdsg jfsdg jfds`]);
    }

    rows.reverse();

    // const promises: Promise<void>[] = [];

    rows.forEach((row) =>
    {
        const str = row.join(', ');
        const textSize = measureText(str, fontSize);
        const text = new Text(x, y, textSize.width, textSize.height);

        text.fontSize = fontSize;
        text.text = str;
        text.setSize(textSize.width, textSize.height);

        y += textSize.height + 5;

        scene.addChild(text);
        // scene.render();
    });

    console.log('ready');
}
