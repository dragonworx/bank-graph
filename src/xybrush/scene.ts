import Canvas2DPainter from './2dPainter';
import { Box } from './box';
import { Rectangle } from './rectangle';

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

        document.body.onmousemove = (e: MouseEvent) =>
        {
            if (e.shiftKey)
            {
                const { x, y } = this.localMousePos(e, false);

                this.setOrigin(x, y);
            }
            else if (e.altKey)
            {
                const { x, y } = this.localMousePos(e);

                this.children[this.children.length - 1].setPosition(x, y);
            }

            this.render();
        };
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
        this.render();
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

    protected getVisibleAtRect(x: number, y: number, w: number, h: number, reverse = true)
    {
        const minX = Math.min(x, x + w);
        const minY = Math.min(y, y + h);
        const maxX = Math.max(x, x + w);
        const maxY = Math.max(y, y + h);

        const boxes = Box.tree.search({
            minX,
            minY,
            maxX,
            maxY,
        });

        boxes.sort((a: Box, b: Box) =>
        {
            const aIndex = a.index;
            const bIndex = b.index;
            const aDepth = a.depth;
            const bDepth = b.depth;
            const aKey = `${aDepth}-${aIndex}`;
            const bKey = `${bDepth}-${bIndex}`;

            return aKey.localeCompare(bKey);
        });

        if (reverse)
        {
            boxes.reverse();
        }

        return boxes;
    }

    protected getVisibleAtPoint(x: number, y: number)
    {
        return this.getVisibleAtRect(
            x,
            y,
            1,
            1,
        );
    }

    public render()
    {
        const { screenBounds, painter } = this;

        const visibleBoxes = this.getVisibleAtRect(screenBounds.x, screenBounds.y, screenBounds.width, screenBounds.height, false);

        painter.clear();

        // this.drawScreenBounds();
        // this.drawGrid(10, 'darkgreen');
        // this.drawGrid(50, 'lime');

        this.painter
            .save()
            .translate(-screenBounds.left, -screenBounds.top);

        for (const box of visibleBoxes)
        {
            box.render(this.painter);
        }

        // console.log(visibleBoxes.length);

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
        box.depth = 0;
    }

    protected onMouseDown = (e: MouseEvent) =>
    {
        const { x, y } = this.localMousePos(e);
        const boxes = this.getVisibleAtPoint(x, y);

        // console.log(boxes.map((box) => box.id));
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
