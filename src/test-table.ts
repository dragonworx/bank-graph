import type { CSV } from './csv';
import { Box } from './xybrush/box';
import { Scene } from './xybrush/scene';
import type { IStyle } from './xybrush/style';
import { Text } from './xybrush/text';

export function createTable(csv: CSV)
{
    const scene = new Scene();

    document.getElementById('app')?.appendChild(scene.canvas);

    scene.setSize(1000, 1000);

    // const fontSize = 12;

    // const x = 10;
    // let y = 10;
    // const rows = csv.rows;

    // rows.forEach((row) =>
    // {
    //     const str = row.join(', ');
    //     const text = new Text({ id: 'text', x, y, style: { backgroundColor: 'black' } });

    //     text.state.fontSize = fontSize;
    //     text.setText(str);

    //     y += text.state.height + 5;

    //     scene.root.addChild(text);
    // });

    // const style: Partial<IStyle> = { backgroundColor: 'red', alpha: 0.5 };
    // const top = new Box({ id: 'top', width: scene.canvas.width, height: 5, style });
    // const bottom = new Box({ id: 'bottom', y: scene.canvas.height - 5, width: scene.canvas.width, height: 5, style });
    // const left = new Box({ id: 'left', width: 5, height: scene.canvas.height, style });
    // const right = new Box({ id: 'right', x: scene.canvas.width - 5, width: 5, height: scene.canvas.height, style });

    // scene.root.addChild(top);
    // scene.root.addChild(bottom);
    // scene.root.addChild(left);
    // scene.root.addChild(right);

    const style: Partial<IStyle> = { backgroundColor: 'red', alpha: 0.5 };
    const top = new Box({ id: 'top', width: '100%', height: 5, style });
    const bottom = new Box({ id: 'bottom', y: '100%', width: '100%', height: 5, style });
    const left = new Box({ id: 'left', width: 5, height: '100%', style });
    const right = new Box({ id: 'right', x: '100%', width: 5, height: '100%', style });

    scene.root.addChild(top);
    scene.root.addChild(bottom);
    scene.root.addChild(left);
    scene.root.addChild(right);

    const box1 = new Box({ id: 'box1', width: '100%', height: '100%', style: { backgroundColor: 'black', hMargin: 10, vMargin: 20 } });
    const box2 = new Box({ id: 'box2', x: '100%', width: 300, height: 10, style: { backgroundColor: 'red' } });

    scene.root.addChild(box1);
    box1.addChild(box2);

    scene.render();
}
