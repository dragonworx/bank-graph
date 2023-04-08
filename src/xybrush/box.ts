import RBush from 'rbush';

import type Canvas2DPainter from './2dPainter';
import { mouseDrag } from './mouseDrag';
import { Rectangle } from './rectangle';
import type { Scene } from './scene';
import { type IStyle, Style } from './style';

export interface BoxState
{
    x: number | string;
    y: number | string;
    width: number | string;
    height: number | string;
}

export interface BoxOptions extends BoxState
{
    id: string;
    style: Partial<IStyle>;
}

export class Box<T extends BoxState = BoxState>
{
    public static tree: RBush<Box> = new RBush();

    public id: string;
    public _scene?: Scene;
    public parent?: Box;
    public children: Box[];
    public style: Style;
    public state: T;
    public depth: number;

    protected _globalBounds?: Rectangle;
    protected temp: any;

    constructor(public readonly options: Partial<BoxOptions> = {}, scene?: Scene)
    {
        const { style = {}, id = '?' } = options;

        this.id = id;
        this.children = [];
        this.style = new Style(style);
        this.depth = 0;
        this._scene = scene;

        const state = this.defaultState();

        Object.keys(options).forEach((key) =>
        {
            if (key in state)
            {
                const stateKey = key as keyof T;
                const optionsVal = (options as T)[stateKey];

                state[stateKey] = optionsVal;
            }
        });

        this.state = state;
    }

    protected defaultState(): T
    {
        const state: BoxState
         = {
             x: 0,
             y: 0,
             width: 0,
             height: 0,
         };

        return state as T;
    }

    get root()
    {
        if (!this.parent)
        {
            return this as unknown as Box;
        }

        // walk parents until root
        let root = this.parent;

        while (root.parent)
        {
            root = root.parent;
        }

        return root;
    }

    get scene()
    {
        const root = this.root;

        return root._scene as Scene;
    }

    get index(): number
    {
        return this.parent ? this.parent.children.indexOf(this) : -1;
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

    get x()
    {
        return (typeof this.state.x === 'string' && this.parent
            ? ((parseFloat(this.state.x) / 100) * this.parent.globalContentBounds.width) - this.width : this.state.x as number) + this.style.hMargin;
    }

    get y()
    {
        return (typeof this.state.y === 'string' && this.parent
            ? ((parseFloat(this.state.y) / 100) * this.parent.globalContentBounds.height) - this.height : this.state.y as number) + this.style.vMargin;
    }

    get width()
    {
        return typeof this.state.width === 'string' && this.parent
            ? ((parseFloat(this.state.width) / 100) * this.parent.globalContentBounds.width) - (this.style.hMargin * 2) : this.state.width as number;
    }

    get height()
    {
        return typeof this.state.height === 'string' && this.parent
            ? ((parseFloat(this.state.height) / 100) * this.parent.globalContentBounds.height) - (this.style.vMargin * 2) : this.state.height as number;
    }

    get globalBounds(): Rectangle
    {
        if (!this._globalBounds)
        {
            this.calcGlobalBounds();
        }

        return this._globalBounds as Rectangle;
    }

    get globalContentBounds(): Rectangle
    {
        const { left, top, width, height } = this.globalBounds;
        const { hPadding, vPadding } = this.style;

        return new Rectangle(
            left + hPadding,
            top + vPadding,
            width - (hPadding * 2),
            height - (vPadding * 2),
        );
    }

    protected calcGlobalBounds()
    {
        const { x: thisX, y: thisY, width, height } = this;

        if (this.parent)
        {
            const { x, y } = this.parent.globalContentBounds;

            this._globalBounds = new Rectangle(
                x + thisX,
                y + thisY,
                width,
                height);
        }
        else
        {
            this._globalBounds = new Rectangle(
                thisX,
                thisY,
                width,
                height,
            );
        }
    }

    public clearBounds()
    {
        Box.tree.remove(this);

        delete this._globalBounds;

        this.children.forEach((child) => child.clearBounds());

        Box.tree.insert(this);
    }

    public setPosition(x: number, y: number)
    {
        this.state.x = x;
        this.state.y = y;

        this.clearBounds();
    }

    public setSize(width: number, height: number)
    {
        this.state.width = width;
        this.state.height = height;

        this.clearBounds();
    }

    public walk<T>(callback: (box: Box, result?: T) => void, result?: T)
    {
        callback(this, result);
        this.children.forEach((child) => child.walk(callback, result));
    }

    public addChild(child: Box)
    {
        child.parent = this;
        this.children.push(child);
        child.depth = this.depth + 1;
        child.clearBounds();
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
