import type Canvas2DPainter from './2dPainter';
import { measureText } from './2dPainter';
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

    public setText(text: string)
    {
        this.text = text;
        this.resize();
    }

    public resize()
    {
        const scene = this.scene;
        const textSize = measureText(this.text, this.fontSize, scene ? this.scene.painter.font.family : undefined);

        this.setSize(textSize.width, textSize.height);
    }

    public onMouseDown(): void
    {
        const { globalBounds, scene, style } = this;
        const bounds = scene.canvasBounds;
        const container = document.createElement('div');

        container.style.cssText = `
            position: absolute;
            left: ${bounds.left + globalBounds.x - 1}px;
            top: ${bounds.top + globalBounds.y + 0}px;
            width: ${globalBounds.width}px;
            height: ${globalBounds.height}px;
            background-color: ${style.backgroundColor};
        `;

        const input = document.createElement('input');

        input.value = this.text;
        input.oninput = () =>
        {
            this.text = input.value;
            // scene.render();
        };

        input.focus();

        input.onkeydown = (e) =>
        {
            if (e.key === 'Enter')
            {
                container.remove();
                scene.render();
            }
        };

        input.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: transparent;
            border: none;
            color: ${'white'};
            font-size: ${this.fontSize}px;
            font-family: sans-serif;
            outline: none;
        `;

        container.appendChild(input);

        document.body.appendChild(container);
    }
}
