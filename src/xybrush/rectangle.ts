export class Rectangle
{
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x: number, y: number, width: number, height: number)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get left()
    {
        return this.x;
    }

    get right()
    {
        return this.x + this.width;
    }

    get top()
    {
        return this.y;
    }

    get bottom()
    {
        return this.y + this.height;
    }

    get centerX()
    {
        return this.x + (this.width / 2);
    }

    get centerY()
    {
        return this.y + (this.height / 2);
    }

    public contains(x: number, y: number)
    {
        return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
    }

    public intersects(other: Rectangle)
    {
        return this.right > other.left && this.left < other.right && this.bottom > other.top && this.top < other.bottom;
    }
}
