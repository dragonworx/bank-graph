import { Scene } from './xybrush/scene';
import { Text } from './xybrush/text';

export function test()
{
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const scene = new Scene(canvas);

    scene.setSize(400, 400);

    const rect1 = new Text(50, 50, 100, 100);
    const rect2 = new Text(10, 10, 50, 50);
    const rect3 = new Text(10, 10, 50, 50);
    const rect4 = new Text(10, 10, 50, 50);

    rect1.id = 'rect1';
    rect2.id = 'rect2';
    rect3.id = 'rect3';
    rect4.id = 'rect4';

    rect2.attachTo(rect1, 'center', 'center');
    scene.addChild(rect1);
    rect1.addChild(rect2);
    rect2.addChild(rect3);
    scene.addChild(rect4);

    (window as any).rect = rect1;
    (window as any).scene = scene;

    setInterval(() =>
    {
        rect1.setSize(rect1.width + 1, rect1.height + 1);
        // rect1.borderWidth += 1;
        scene.render();
    }, 100);

    scene.render();
}
