export function degToRad(deg: number)
{
    return deg * (Math.PI / 180);
}

export const px = (value: number) => value + 0.5;

export const defaultFontFamily = 'sans-serif';

export function isCanvasSupported()
{
    return document.createElement('canvas').getContext('2d') !== null;
}

export function createTextCanvas(
    text: string,
    fontSize = 12,
    padding = 3,
    color = 'black',
    bgColor = 'transparent',
)
{
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    ctx.font = `${fontSize}px ${defaultFontFamily}`;

    const metrics = ctx.measureText(text);
    const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const width = metrics.width;

    canvas.width = width + padding;
    canvas.height = height + padding;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width + padding, height + padding);
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ${defaultFontFamily}`;
    ctx.fillText(text, padding / 2, height + (padding / 2));

    return canvas;
}

const textMeasureCanvas: HTMLCanvasElement = document.createElement('canvas');

export function measureText(text: string, fontSize = 12, fontFamily = defaultFontFamily)
{
    const ctx = textMeasureCanvas.getContext('2d') as CanvasRenderingContext2D;

    ctx.font = `${fontSize}px ${fontFamily}`;

    const metrics = ctx.measureText(text);
    const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const width = metrics.width;

    return { width, height };
}

export type FontStyle = 'normal' | 'bold' | 'italic';

export default class Canvas2DPainter
{
    public canvas: HTMLCanvasElement;

    protected _backgroundColor: string;
    protected _fontColor: string;
    protected _fontSize: number;
    protected _fontStyle: FontStyle;
    protected _fontFamily: string;
    protected _textBaseline: CanvasTextBaseline;

    constructor(canvas: HTMLCanvasElement, backgroundColor = 'black')
    {
        this._fontColor = 'white';
        this._fontSize = 11;
        this._fontStyle = 'normal';
        this._fontFamily = defaultFontFamily;
        this._textBaseline = 'top';

        this._backgroundColor = backgroundColor;
        this.canvas = canvas;
        this
            .size(canvas.offsetWidth, canvas.offsetHeight)
            .updateFont()
            .clear();
    }

    get ctx()
    {
        return this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    get width()
    {
        return this.canvas.width;
    }

    get height()
    {
        return this.canvas.height;
    }

    public size(width: number, height: number)
    {
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        return this;
    }

    public setTransform(transform: DOMMatrix)
    {
        this.ctx.setTransform(transform);
    }

    public resetTransform()
    {
        this.ctx.resetTransform();

        return this;
    }

    public translate(x: number, y: number)
    {
        this.ctx.translate(x, y);

        return this;
    }

    public alpha(alpha: number)
    {
        this.ctx.globalAlpha = alpha;

        return this;
    }

    public clear()
    {
        this.ctx.fillStyle = this._backgroundColor;
        this.fillRect(0, 0, this.width, this.height);

        return this;
    }

    public fillRect(x: number, y: number, w: number, h: number)
    {
        this.ctx.fillRect(px(x), px(y), px(w), px(h));

        return this;
    }

    public strokeRect(x: number, y: number, w: number, h: number)
    {
        this.ctx.strokeRect(px(x), px(y), px(w), px(h));

        return this;
    }

    public fillColor(color: string)
    {
        this.ctx.fillStyle = color;

        return this;
    }

    public strokeStyle(color: string, lineWidth = 1)
    {
        return this.strokeColor(color).lineWidth(lineWidth);
    }

    public strokeColor(color: string)
    {
        this.ctx.strokeStyle = color;

        return this;
    }

    public lineWidth(width: number)
    {
        this.ctx.lineWidth = width;

        return this;
    }

    public line(x1: number, y1: number, x2: number, y2: number)
    {
        const { ctx } = this;

        ctx.beginPath();
        ctx.moveTo(px(x1), px(y1));
        ctx.lineTo(px(x2), px(y2));
        ctx.stroke();
        ctx.closePath();

        return this;
    }

    public setTextAlign(align: CanvasTextAlign)
    {
        this.ctx.textAlign = align;

        return this;
    }

    public setTextBaseline(baseline: CanvasTextBaseline)
    {
        this._textBaseline = baseline;
        this.ctx.textBaseline = baseline;

        return this;
    }

    public drawText(text: string, x: number, y: number)
    {
        const { ctx } = this;
        const fillStyle = ctx.fillStyle;

        this.ctx.textBaseline = this._textBaseline;
        ctx.fillStyle = this._fontColor;
        ctx.fillText(text, x, y);
        ctx.fillStyle = fillStyle;

        return this;
    }

    public drawPoint(x: number, y: number, radius = 3)
    {
        const { ctx } = this;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, degToRad(360));
        ctx.fill();
        ctx.closePath();

        return this;
    }

    protected updateFont()
    {
        this.ctx.font = `${this._fontStyle} ${this._fontSize}px ${this._fontFamily}`;

        return this;
    }

    public fontSize(size: number)
    {
        this._fontSize = size;

        return this.updateFont();
    }

    public fontStyle(style: FontStyle)
    {
        this._fontStyle = style;

        return this.updateFont();
    }

    public fontFamily(font: string)
    {
        this._fontFamily = font;

        return this.updateFont();
    }

    public fontColor(color: string)
    {
        this._fontColor = color;

        return this;
    }

    public save()
    {
        this.ctx.save();

        return this;
    }

    public restore()
    {
        this.ctx.restore();

        return this;
    }

    public clip(x: number, y: number, w: number, h: number)
    {
        const region = new Path2D();

        region.rect(x, y, w, h);
        this.ctx.clip(region, 'nonzero');

        return this;
    }

    public setFont(size: number, family: string, style: FontStyle, color: string)
    {
        this._fontSize = size;
        this._fontStyle = style;
        this._fontFamily = family;
        this._fontColor = color;

        return this.updateFont();
    }

    public get font()
    {
        return {
            size: this._fontSize,
            style: this._fontStyle,
            family: this._fontFamily,
            color: this._fontColor,
        };
    }

    public get backgroundColor()
    {
        return this._backgroundColor;
    }
}
