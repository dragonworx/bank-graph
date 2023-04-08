import type Canvas2DPainter from './2dPainter';
import { measureText } from './2dPainter';
import { type BoxOptions, type BoxState, Box } from './box';

export interface TextBoxState extends BoxState
{
    fontFamily: string;
    fontSize: number;
}

export interface TextBoxOptions extends Partial<TextBoxState>
{
    text: string;
}

type Character = {
    text: string;
    width: number;
    height: number;
};

  type Word = {
      text: string;
      width: number;
      height: number;
      characters: Character[];
  };

  type Line = {
      width: number;
      height: number;
      words: Word[];
  };

export class TextBox extends Box<TextBoxState>
{
    public text = '';
    public lines: Line[] = [];

    constructor(options: Partial<BoxOptions> & TextBoxOptions)
    {
        super(options);

        this.text = options.text;
    }

    protected defaultState(): TextBoxState
    {
        return {
            ...super.defaultState(),
            fontSize: 12,
            fontFamily: 'sans-serif',
        };
    }

    get height()
    {
        return this.lines.reduce((acc, line) => acc + line.height, 0);
    }

    protected calcGlobalBounds(): void
    {
        const { text, state: { fontFamily, fontSize } } = this;

        this.lines = layout(text, fontSize, fontFamily, this.scene.painter.canvas, this.width);

        super.calcGlobalBounds();
    }

    public draw(painter: Canvas2DPainter)
    {
        const { globalBounds } = this;

        super.draw(painter);

        let x = 0;
        let y = 0;

        for (const line of this.lines)
        {
            for (const word of line.words)
            {
                // painter.strokeRect(globalBounds.x + x, globalBounds.y + y, word.width, word.height);

                for (const character of word.characters)
                {
                    painter
                        .fontColor('white')
                        .fontSize(this.state.fontSize)
                        .drawText(character.text, globalBounds.x + x, globalBounds.y + y);

                    x += character.width;
                }

                // x += 10;
            }

            x = 0;
            y += line.height;
        }
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

    public onMouseDown(e: MouseEvent): void
    {
        const p = this.localMousePoint(e);
        const result = getSelectedObjects(p.x, p.y, this.lines);

        console.log(result.line, result.word?.text, result.char?.text);
    }
}

function layout(text: string, fontSize: number, fontFamily: string, canvas: HTMLCanvasElement, wrapWidth: number): Line[]
{
    const lines: Line[] = [];
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

    context.font = `${fontSize}px ${fontFamily}`;
    const spaceCharWidth = context.measureText(' ').width;
    const rawLines = text.split('\n');

    // split text into words
    for (const rawLine of rawLines)
    {
        const line: Line = {
            width: 0,
            height: 0,
            words: [],
        };

        lines.push(line);

        // split line into words
        const words = rawLine.split(/\b/g);

        for (const word of words)
        {
            const wordWidth = context.measureText(word).width;
            const wordHeight = fontSize;

            const characters = word.split('').map((char) =>
            {
                const charWidth = context.measureText(char).width;
                const charHeight = fontSize;

                return {
                    text: char,
                    width: charWidth,
                    height: charHeight,
                };
            });

            const wordObj: Word = {
                text: word,
                width: wordWidth,
                height: wordHeight,
                characters,
            };

            line.words.push(wordObj);
        }
    }

    // for each line, overflow words if past wordwrap width
    for (let i = 0; i < lines.length; i++)
    {
        let x = 0;

        for (let j = 0; j < lines[i].words.length; j++)
        {
            const word = lines[i].words[j];

            if (x + word.width > wrapWidth)
            {
                const nextLine = lines[i + 1] ?? {
                    width: 0,
                    height: 0,
                    words: [],
                };

                // move words to new line
                for (let k = j; k < lines[i].words.length; k++)
                {
                    nextLine.words.push(lines[i].words[k]);
                }

                // remove words from old line
                lines[i].words.splice(j, lines[i].words.length - j);

                // insert new line
                lines.splice(i + 1, 0, nextLine);

                x = 0;
            }

            x += word.width + spaceCharWidth;
        }
    }

    // finally calculate line sizes
    for (const line of lines)
    {
        let width = 0;
        let height = 0;

        for (const word of line.words)
        {
            width += word.width;
            height = Math.max(height, word.height);
        }

        line.width = width;
        line.height = height;
    }

    return lines;
}

function getSelectedObjects(localX: number, localY: number, lines: Line[]): { line?: Line; word?: Word; char?: Character }
{
    let selectedLine: Line | undefined;
    let selectedWord: Word | undefined;
    let selectedChar: Character | undefined;

    let lineY = 0;

    for (const line of lines)
    {
        if (localY >= lineY && localY <= lineY + line.height)
        {
            selectedLine = line;
            break;
        }

        lineY += line.height;
    }

    if (selectedLine)
    {
        let wordX = 0;

        for (const word of selectedLine.words)
        {
            if (localX >= wordX && localX <= wordX + word.width && localY >= lineY && localY <= lineY + word.height)
            {
                selectedWord = word;
                break;
            }

            wordX += word.width;
        }

        if (selectedWord)
        {
            let charX = wordX;

            for (const character of selectedWord.characters)
            {
                if (localX >= charX && localX <= charX + character.width && localY >= lineY && localY <= lineY + character.height)
                {
                    selectedChar = character;
                    break;
                }

                charX += character.width;
            }
        }
    }

    return { line: selectedLine, word: selectedWord, char: selectedChar };
}
