import { Rectangle } from '@pixi/math';

import Canvas2DPainter from './2dPainter';
import { Box } from './box';

export class Scene
{
    public children: Box[] = [];
    public painter: Canvas2DPainter;
    public screenX: number;
    public screenY: number;

    protected focus?: Box;

    constructor(public readonly canvas: HTMLCanvasElement)
    {
        canvas.width = parseFloat(canvas.style.width);
        canvas.height = parseFloat(canvas.style.height);

        this.painter = new Canvas2DPainter(canvas);

        this.screenX = 0;
        this.screenY = 0;

        canvas.addEventListener('mousedown', this.onMouseDown);
        canvas.addEventListener('mousemove', this.onMouseMove);
        canvas.addEventListener('mouseup', this.onMouseUp);
    }

    get ctx()
    {
        return this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    get screenBounds()
    {
        return new Rectangle(this.screenX, this.screenY, this.canvas.offsetWidth, this.canvas.offsetHeight);
    }

    public setSize(w: number, h: number)
    {
        this.canvas.width = w;
        this.canvas.height = h;
        this.canvas.style.width = `${w}px`;
        this.canvas.style.height = `${h}px`;
    }

    public setOrigin(x: number, y: number)
    {
        this.screenX = x;
        this.screenY = y;
        this.draw();
    }

    public localMousePos(e: MouseEvent, applyScreenBounds = true)
    {
        const { clientX, clientY } = e;
        const { canvas, screenBounds } = this;
        const bounds = canvas.getBoundingClientRect();

        return {
            x: clientX - bounds.left + (applyScreenBounds ? screenBounds.left : 0),
            y: clientY - bounds.top + (applyScreenBounds ? screenBounds.top : 0),
        };
    }

    protected getVisibleAtRect(x: number, y: number, w: number, h: number)
    {
        const minX = Math.min(x, x + w);
        const minY = Math.min(y, y + h);
        const maxX = Math.max(x, x + w);
        const maxY = Math.max(y, y + h);

        return Box.tree.search({
            minX,
            minY,
            maxX,
            maxY,
        });
    }

    protected getVisibleAtPoint(x: number, y: number)
    {
        return Box.tree.search({
            minX: x,
            minY: y,
            maxX: x,
            maxY: y,
        });
    }

    public draw()
    {
        const { screenBounds, painter } = this;

        const visibleBoxes = this.getVisibleAtRect(screenBounds.x, screenBounds.y, screenBounds.width, screenBounds.height);

        painter.clear();

        this.drawScreenBounds();
        this.drawGrid(10, 'darkgreen');
        this.drawGrid(50, 'lime');

        this.painter
            .save()
            .translate(-screenBounds.left, -screenBounds.top);

        for (const box of visibleBoxes)
        {
            box.draw(this.painter);
        }

        console.log(visibleBoxes.length);

        this.painter.restore();

        return this;
    }

    protected drawScreenBounds()
    {
        const { painter, screenBounds } = this;

        painter
            .save()
            .strokeColor('cyan')
            .translate(-screenBounds.left, -screenBounds.top)
            .strokeRect(0, 0, screenBounds.width, screenBounds.height)
            .restore();
    }

    protected drawGrid(inc: number, color: string)
    {
        const { painter, screenBounds } = this;

        painter
            .save()
            .strokeColor(color)
            .translate(-screenBounds.left, -screenBounds.top)
            .strokeRect(0, 0, screenBounds.width, screenBounds.height);

        for (let y = 0; y < screenBounds.height; y += inc)
        {
            painter.line(0, y, screenBounds.width, y);

            for (let x = 0; x < screenBounds.width; x += inc)
            {
                painter.line(x, 0, x, screenBounds.height);
            }
        }

        painter.restore();
    }

    public addChild(box: Box)
    {
        this.children.push(box);
        Box.tree.insert(box);
    }

    protected onMouseDown = (e: MouseEvent) =>
    {
        const { x, y } = this.localMousePos(e);
        const boxes = this.getVisibleAtPoint(x, y);

        if (boxes.length > 0)
        {
            boxes[0].onMouseDown(e);
        }
    };

    protected onMouseMove = (e: MouseEvent) =>
    {
        const { x, y } = this.localMousePos(e);
        const boxes = this.getVisibleAtPoint(x, y);

        if (boxes.length > 0)
        {
            const box = boxes[0];

            if (this.focus !== box)
            {
                if (this.focus)
                {
                    this.focus.onMouseOut(e);
                }

                this.focus = box;
                box.onMouseOver(e);
            }

            boxes[0].onMouseMove(e);
        }
        else if (this.focus)
        {
            this.focus.onMouseOut(e);
            this.focus = undefined;
        }
    };

    protected onMouseUp = (e: MouseEvent) =>
    {
        const { x, y } = this.localMousePos(e);
        const boxes = this.getVisibleAtPoint(x, y);

        if (boxes.length > 0)
        {
            boxes[0].onMouseUp(e);
        }
    };
}
