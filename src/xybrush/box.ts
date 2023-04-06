import RBush from 'rbush';

import type Canvas2DPainter from './2dPainter';
import { mouseDrag } from './mouseDrag';
import { Rectangle } from './rectangle';
import type { Scene } from './scene';
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

export interface BoxState
{
    x: number;
    y: number;
    width: number;
    height: number;
    originX: number;
    originY: number;
    anchorX?: number;
    anchorY?: number;
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

    constructor(public readonly options: Partial<BoxOptions> = {})
    {
        const { style = {}, id = '?' } = options;

        this.id = id;
        this.children = [];
        this.style = new Style(style);
        this.depth = 0;

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
        console.log(this.id, state);

        this.calcGlobalBounds();
    }

    protected defaultState(): T
    {
        return {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            originX: 0,
            originY: 0,
        } as T;
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

    get originOffsetX()
    {
        return this.state.width * this.state.originX;
    }

    get originOffsetY()
    {
        return this.state.height * this.state.originY;
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

    public clearBounds()
    {
        Box.tree.remove(this);

        delete this._globalBounds;

        this.children.forEach((child) => child.clearBounds());

        Box.tree.insert(this);
    }

    protected calcGlobalBounds()
    {
        const { state, originOffsetX, originOffsetY } = this;
        const originX = state.x - originOffsetX;
        const originY = state.y - originOffsetY;

        if (this.parent)
        {
            const { x, y, width, height } = this.parent.globalBounds;

            let left = x + originX;
            let top = y + originY;

            if (typeof state.anchorX === 'number')
            {
                left = x + (width * state.anchorX) - originOffsetX;
            }

            if (typeof state.anchorY === 'number')
            {
                top = y + (height * state.anchorY) - originOffsetY;
            }

            this._globalBounds = new Rectangle(left, top, this.state.width, this.state.height);
        }
        else
        {
            this._globalBounds = new Rectangle(originX, originY, this.state.width, this.state.height);
        }
    }

    public setOrigin(x: number, y: number)
    {
        this.state.originX = x;
        this.state.originY = y;

        this.clearBounds();
    }

    public setAnchor(x: number | undefined, y: number | undefined)
    {
        this.state.anchorX = x;
        this.state.anchorY = y;

        this.clearBounds();
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
        const startX = this.state.x;
        const startY = this.state.y;

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
        console.log(this.id, this.state);
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
