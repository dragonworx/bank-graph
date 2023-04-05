export type TextAlign = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'middle' | 'bottom';

export interface IStyle
{
    borderWidth: number;
    borderColor: string;
    backgroundColor?: string;
    alpha: number;
    textAlign: TextAlign;
    verticalAlign: VerticalAlign;
    hPadding: number;
    vPadding: number;
}

export class Style implements IStyle
{
    public borderWidth;
    public borderColor;
    public backgroundColor?: string;
    public alpha;
    public textAlign: TextAlign;
    public verticalAlign: VerticalAlign;
    public hPadding;
    public vPadding;

    constructor({
        borderWidth = 0,
        borderColor = 'white',
        alpha = 1,
        backgroundColor = 'black',
        textAlign = 'center',
        verticalAlign = 'middle',
        hPadding = 0,
        vPadding = 0,
    }: Partial<IStyle> = {})
    {
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        this.alpha = alpha;
        this.backgroundColor = backgroundColor;
        this.textAlign = textAlign;
        this.verticalAlign = verticalAlign;
        this.hPadding = hPadding;
        this.vPadding = vPadding;
    }
}
