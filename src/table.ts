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

    csv.rows.forEach((row) =>
    {
        const str = row.join(', ');
        const textSize = measureText(str, fontSize);
        const text = new Text(x, y, textSize.width, textSize.height);

        text.fontSize = fontSize;
        text.text = str;
        text.setSize(textSize.width, textSize.height);

        y += textSize.height + 5;

        scene.addChild(text);
        scene.render();
    });
}
