import type Canvas2DPainter from './2dPainter';
import { measureText } from './2dPainter';
import { type BoxOptions, type BoxState, Box } from './box';

export interface TextState extends BoxState
{
    fontSize: number;
}

export interface TextOptions extends BoxOptions, TextState
{
    autoWidth?: boolean;
}

export class Text extends Box<TextState>
{
    public text = '';

    constructor(options: Partial<TextOptions> = {})
    {
        super(options);
    }

    protected defaultState(): TextState
    {
        return {
            ...super.defaultState(),
            fontSize: 12,
        };
    }

    public draw(painter: Canvas2DPainter)
    {
        const { globalBounds, style } = this;
        const { textAlign, verticalAlign, hPadding, vPadding } = style;
        const left = globalBounds.x + hPadding;
        const top = globalBounds.y + vPadding;
        const width = globalBounds.width - (hPadding * 2);
        const height = globalBounds.height - (vPadding * 2);

        super.draw(painter);

        let x = left;
        let y = top;
        let textBaseline: CanvasTextBaseline = 'top';

        if (verticalAlign === 'middle')
        {
            textBaseline = 'middle';
        }
        else if (verticalAlign === 'bottom')
        {
            textBaseline = 'bottom';
        }

        if (textAlign === 'center')
        {
            x += width / 2;
        }
        else if (textAlign === 'right')
        {
            x += width;
        }

        if (verticalAlign === 'middle')
        {
            y += height / 2;
        }
        else if (verticalAlign === 'bottom')
        {
            y += height;
        }

        painter
            .fontColor('white')
            .fontSize(this.state.fontSize)
            .setTextAlign(textAlign)
            .setTextBaseline(textBaseline)
            .drawText(this.text, x, y);
    }

    public setText(text: string)
    {
        this.text = text;
        this.resize();
    }

    public resize()
    {
        const scene = this.scene;
        const textSize = measureText(this.text, this.state.fontSize, scene ? this.scene.painter.font.family : undefined);

        this.setSize(textSize.width, textSize.height);
    }

    public onMouseDown(): void
    {
        // const { globalBounds, scene, style } = this;
        // const bounds = scene.canvasBounds;

    }
}
