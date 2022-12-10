import { Box } from './xybrush/box';
import { Scene } from './xybrush/scene';

export function test()
{
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const scene = new Scene(canvas);

    scene.setSize(400, 400);

    const rect1 = new Box(100, 100, 100, 100);
    const rect2 = new Box(100, 50, 50, 50);

    rect1.id = 'rect1';
    rect2.id = 'rect2';

    rect2.attachTo(rect1, 'center', 'bottomLeft');

    scene.addChild(rect1);

    scene.draw();

    document.body.onmousemove = (e: MouseEvent) =>
    {
        if (e.shiftKey)
        {
            const { x, y } = scene.localMousePos(e, false);

            scene.setOrigin(x, y);
            scene.draw();
        }
        else if (e.altKey)
        {
            const { x, y } = scene.localMousePos(e);

            rect1.setPosition(x, y);
            scene.draw();
        }
    };
}
