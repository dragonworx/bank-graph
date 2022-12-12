import { Box } from './xybrush/box';
import { Scene } from './xybrush/scene';

export function test()
{
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const scene = new Scene(canvas);

    scene.setSize(400, 400);

    const rect1 = new Box(50, 50, 100, 100);
    const rect2 = new Box(10, 10, 50, 50);
    const rect3 = new Box(10, 10, 50, 50);
    const rect4 = new Box(10, 10, 50, 50);

    rect1.id = 'rect1';
    rect2.id = 'rect2';
    rect3.id = 'rect3';
    rect4.id = 'rect4';

    // rect2.attachTo(rect1, 'center', 'bottomLeft');
    scene.addChild(rect1);
    rect1.addChild(rect2);
    rect2.addChild(rect3);
    scene.addChild(rect4);

    scene.draw();

    document.body.onmousemove = (e: MouseEvent) =>
    {
        if (e.shiftKey)
        {
            const { x, y } = scene.localMousePos(e, false);

            scene.setOrigin(x, y);
        }
        else if (e.altKey)
        {
            const { x, y } = scene.localMousePos(e);

            rect1.setPosition(x, y);
        }

        scene.draw();
    };
}
