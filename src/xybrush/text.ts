import type Canvas2DPainter from './2dPainter';
import { Box } from './box';

export class Text extends Box
{
    public text = '';
    public fontSize = 12;

    public draw(painter: Canvas2DPainter)
    {
        const { globalBounds } = this;

        super.draw(painter);

        painter
            .fontSize(this.fontSize)
            .drawText(this.text, globalBounds.x, globalBounds.y);
    }
}
