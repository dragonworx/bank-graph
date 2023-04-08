export type TextAlign = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'middle' | 'bottom';

export interface IStyle
{
    borderWidth: number;
    borderColor: string;
    backgroundColor?: string;
    alpha: number;
    hPadding: number;
    vPadding: number;
    hMargin: number;
    vMargin: number;
}

export class Style implements IStyle
{
    public borderWidth;
    public borderColor;
    public backgroundColor?: string;
    public alpha;
    public hPadding;
    public vPadding;
    public hMargin;
    public vMargin;

    constructor({
        borderWidth = 0,
        borderColor = 'white',
        alpha = 1,
        backgroundColor = 'black',
        hPadding = 0,
        vPadding = 0,
        hMargin = 0,
        vMargin = 0,
    }: Partial<IStyle> = {})
    {
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        this.alpha = alpha;
        this.backgroundColor = backgroundColor;
        this.hPadding = hPadding;
        this.vPadding = vPadding;
        this.hMargin = hMargin;
        this.vMargin = vMargin;
    }
}
