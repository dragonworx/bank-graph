import type Canvas2DPainter from './2dPainter';
import { Box } from './box';

export class Text extends Box
{
    public text = '';
    public fontSize = 12;

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
            .fontSize(this.fontSize)
            .setTextAlign(textAlign)
            .setTextBaseline(textBaseline)
            .drawText(this.text, x, y);
    }
}
