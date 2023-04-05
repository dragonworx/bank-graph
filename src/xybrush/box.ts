import RBush from 'rbush';

import type Canvas2DPainter from './2dPainter';
import { mouseDrag } from './mouseDrag';
import { Rectangle } from './rectangle';
import { type IStyle, Style } from './style';

const corners = {
    center: [0.5, 0.5],
    topLeft: [0, 0],
    topCenter: [0.5, 0],
    topRight: [1, 0],
    rightCenter: [1, 0.5],
    bottomRight: [1, 1],
    bottomCenter: [0.5, 1],
    bottomLeft: [0, 1],
    leftCenter: [0, 0.5],
} as const;

type Corner = keyof typeof corners;

export interface BoxOptions
{
    x: number;
    y: number;
    width: number;
    height: number;
    style?: Partial<IStyle>;
    id: string;
}

export class Box
{
    public static tree: RBush<Box> = new RBush();

    public id: string;

    public parent?: Box;
    public children: Box[];

    public x: number;
    public y: number;
    public width: number;
    public height: number;

    public originX = 0;
    public originY = 0;
    public anchorX?: number;
    public anchorY?: number;

    public style: Style;

    public depth: number;

    protected _globalBounds?: Rectangle;

    protected temp: any;

    constructor(options: Partial<BoxOptions> = {})
    {
        const { x = 0, y = 0, width = 0, height = 0, style, id = '?' } = options;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.children = [];

        this.style = new Style(style);

        this.depth = 0;

        this.id = id;

        this.calcGlobalBounds();
    }

    public clearBounds()
    {
        Box.tree.remove(this);

        delete this._globalBounds;

        this.children.forEach((child) => child.clearBounds());

        Box.tree.insert(this);
    }

    protected calcGlobalBounds()
    {
        const { x, y, originOffsetX, originOffsetY, anchorX, anchorY } = this;
        const originX = x - originOffsetX;
        const originY = y - originOffsetY;

        if (this.parent)
        {
            const { x, y, width, height } = this.parent.globalBounds;

            let left = x + originX;
            let top = y + originY;

            if (typeof anchorX === 'number')
            {
                left = x + (width * anchorX) - originOffsetX;
            }

            if (typeof anchorY === 'number')
            {
                top = y + (height * anchorY) - originOffsetY;
            }

            this._globalBounds = new Rectangle(left, top, this.width, this.height);
        }
        else
        {
            this._globalBounds = new Rectangle(originX, originY, this.width, this.height);
        }
    }

    get index()
    {
        return this.parent ? this.parent.children.indexOf(this) : -1;
    }

    get originOffsetX()
    {
        return this.width * this.originX;
    }

    get originOffsetY()
    {
        return this.height * this.originY;
    }

    get globalBounds(): Rectangle
    {
        if (!this._globalBounds)
        {
            this.calcGlobalBounds();
        }

        return this._globalBounds as Rectangle;
    }

    get minX()
    {
        return this.globalBounds.left;
    }

    get minY()
    {
        return this.globalBounds.top;
    }

    get maxX()
    {
        return this.globalBounds.right;
    }

    get maxY()
    {
        return this.globalBounds.bottom;
    }

    public setOrigin(x: number, y: number)
    {
        this.originX = x;
        this.originY = y;

        this.clearBounds();
    }

    public setAnchor(x: number | undefined, y: number | undefined)
    {
        this.anchorX = x;
        this.anchorY = y;

        this.clearBounds();
    }

    public setPosition(x: number, y: number)
    {
        this.x = x;
        this.y = y;

        this.clearBounds();
    }

    public setSize(width: number, height: number)
    {
        this.width = width;
        this.height = height;

        this.clearBounds();
    }

    public attachTo(parent: Box, sourceCorner: Corner, targetCorner: Corner)
    {
        parent.addChild(this);

        const [originX, originY] = corners[sourceCorner];
        const [anchorX, anchorY] = corners[targetCorner];

        this.setOrigin(originX, originY);
        this.setAnchor(anchorX, anchorY);
    }

    public walk<T>(callback: (box: Box, result?: T) => void, result?: T)
    {
        callback(this, result);
        this.children.forEach((child) => child.walk(callback, result));
    }

    public addChild(child: Box)
    {
        child.parent = this;
        child.clearBounds();
        this.children.push(child);
        child.depth = this.depth + 1;
    }

    public render(painter: Canvas2DPainter)
    {
        const { globalBounds, style } = this;
        const { borderWidth } = style;
        const p = borderWidth;

        painter.save();

        painter.clip(globalBounds.x - p, globalBounds.y - p, globalBounds.width + (p * 2), globalBounds.height + (p * 2));
        this.draw(painter);

        painter.restore();
    }

    public drawBackground(painter: Canvas2DPainter)
    {
        const { globalBounds, style } = this;

        painter
            .fillColor(style.backgroundColor ?? painter.backgroundColor)
            .fillRect(globalBounds.x, globalBounds.y, globalBounds.width, globalBounds.height);
    }

    public draw(painter: Canvas2DPainter)
    {
        const { globalBounds, style } = this;
        const { alpha, borderWidth, borderColor } = style;

        painter
            .fillColor(painter.backgroundColor)
            .fillRect(globalBounds.x, globalBounds.y, globalBounds.width, globalBounds.height);

        painter.alpha(alpha);

        this.drawBackground(painter);

        if (borderWidth > 0)
        {
            painter
                .strokeStyle(borderColor, borderWidth)
                .strokeRect(globalBounds.x, globalBounds.y, globalBounds.width, globalBounds.height);
        }

        // painter.drawText(this.id, globalBounds.x + 10, globalBounds.y + 10);
    }

    public onMouseDown(e: MouseEvent)
    {
        console.log('onMouseDown', this.id);
        const startX = this.x;
        const startY = this.y;

        mouseDrag(e, (deltaX, deltaY) =>
        {
            this.setPosition(startX + deltaX, startY + deltaY);
        });
    }

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onMouseMove(e: MouseEvent)
    {
        // console.log('onMouseMove', this.id);
    }

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onMouseOver(e: MouseEvent)
    {
        this.temp = this.style.backgroundColor;
        // console.log('onMouseOver', this.id);
        this.style.backgroundColor = 'blue';
    }

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onMouseOut(e: MouseEvent)
    {
        // console.log('onMouseOut', this.id);
        this.style.backgroundColor = this.temp;
    }

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onMouseUp(e: MouseEvent)
    {
        // console.log('onMouseUp', this.id);
    }
}
