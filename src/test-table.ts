import type { CSV } from './csv';
import { measureText } from './xybrush/2dPainter';
import { Box } from './xybrush/box';
import { Scene } from './xybrush/scene';
import type { IStyle } from './xybrush/style';
import { Text } from './xybrush/text';

export function createTable(csv: CSV)
{
    const scene = new Scene();

    document.getElementById('app')?.appendChild(scene.canvas);

    scene.setSize(1000, 1000);

    const fontSize = 12;

    const x = 0;
    let y = 0;
    const rows = csv.rows;

    rows.forEach((row) =>
    {
        const str = row.join(', ');
        const textSize = measureText(str, fontSize);
        const text = new Text({ id: 'text', x, y, width: textSize.width, height: textSize.height, style: { backgroundColor: 'red', alpha: 0.5 } });

        text.fontSize = fontSize;
        text.text = str;
        text.setSize(textSize.width, textSize.height);

        y += textSize.height + 5;

        scene.root.addChild(text);
    });

    // const style: Partial<IStyle> = { backgroundColor: 'red', alpha: 0.5 };
    // const top = new Box({ id: 'top', width: scene.canvas.width, height: 5, style });
    // const bottom = new Box({ id: 'bottom', y: scene.canvas.height - 5, width: scene.canvas.width, height: 5, style });
    // const left = new Box({ id: 'left', width: 5, height: scene.canvas.height, style });
    // const right = new Box({ id: 'right', x: scene.canvas.width - 5, width: 5, height: scene.canvas.height, style });

    // scene.root.addChild(top);
    // scene.root.addChild(bottom);
    // scene.root.addChild(left);
    // scene.root.addChild(right);

    // console.log(scene.root);

    console.log('ready');
    scene.render();
}
