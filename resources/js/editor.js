import { Vec2 } from "./vec2.js";

export class Editor {

    constructor(app) {

        this.app = app;

        this.pixelSize = 10;

        this.currentColor = '#F00';
        this.isMouseDown  = false;

        this.mousePosition = new Vec2();
        this.mouseStart    = new Vec2();

        const canvas1 = document.querySelector('#panel1');
        const ctx1 = canvas1.getContext('2d');

        const canvas2 = document.querySelector('#panel2');
        const ctx2 = canvas2.getContext('2d');

        const getMousePosition = (e, result)=> {
            if(!result) {
                result = {}
            }
            const rect = canvas1.getBoundingClientRect();
            result.x = e.clientX - rect.left;
            result.y = e.clientY - rect.top;
            return result;
        }

        const mouseMove = (e)=> {
            getMousePosition(e, this.mousePosition);
            this.draw();
        }
        
        const mouseDown = (e)=> {
            this.isMouseDown = true;
            getMousePosition(e, this.mouseStart);
        }
        
        const mouseUp = (e) => {
            this.isMouseDown = false;
            if(this.app.toolSelection === 'line'
            || this.app.toolSelection === 'rect'
            || this.app.toolSelection === 'rect-fill') {
                this.ctx1.drawImage(canvas2, 0, 0);
            }
        }

        const mouseOut = ()=> {
            
        }
        
        canvas2.addEventListener("mousemove", mouseMove, false);
        canvas2.addEventListener("mousedown", mouseDown, false);
        // canvas2.addEventListener("mouseout" , mouseOut , false);

        document.body.addEventListener("mouseup", mouseUp, false);
        document.body.addEventListener("mouseout", (e)=> {
            if(e.target === document.body) {
                mouseUp();
            }
        }, false);

        this.canvas1 = canvas1;
        this.ctx1 = ctx1;
        this.canvas1.width  = 550;
        this.canvas1.height = 550;

        this.canvas2 = canvas2;
        this.ctx2 = ctx2;
        this.canvas2.width  = 550;
        this.canvas2.height = 550;

    }

    draw = ()=> {

        this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);

        if(this.isMouseDown) {

            const x = Math.floor(this.mousePosition.x / this.pixelSize) * this.pixelSize;
            const y = Math.floor(this.mousePosition.y / this.pixelSize) * this.pixelSize;
    
            switch(this.app.toolSelection) {
                case 'eraser' :
                    this.ctx1.clearRect(x, y, this.pixelSize, this.pixelSize);
                    break;
                case 'pencil' :
                    this.ctx1.fillStyle = this.currentColor;
                    this.ctx1.fillRect(x, y, this.pixelSize, this.pixelSize);
                break;
                case 'bucket' :
                    floodFill(this.canvas1, this.mousePosition, this.currentColor);
                break;
                case 'line' :
                    drawLine(this.canvas2, this.mouseStart, this.mousePosition, this.pixelSize, this.currentColor);
                break;
                case 'rect' :
                    drawRect(this.canvas2, this.mouseStart, this.mousePosition, this.pixelSize, this.currentColor);
                break;
                case 'rect-fill' :
                    drawRect(this.canvas2, this.mouseStart, this.mousePosition, this.pixelSize, this.currentColor, true);
                break;
            }
            
        }

    }

}

const sameColors = (a, off1, b, off2 = 0) => {
    for(let i = 0; i < 4; ++i) {
        if(a[i + off1] !== b[i + off2]) return false;
    }
    return true;
}

const hexToRgba = (hex) => {
    const tmp = hex.substring(1); // remove #
    if(tmp.length == 3) {
       return [
           parseInt(tmp.charAt(0) + tmp.charAt(0), 16), 
           parseInt(tmp.charAt(1) + tmp.charAt(1), 16), 
           parseInt(tmp.charAt(2) + tmp.charAt(2), 16), 
           255
        ]
    } else if(tmp.length === 6) {
       return [
           parseInt(tmp.substring(0, 2), 16), 
           parseInt(tmp.substring(2, 4), 16), 
           parseInt(tmp.substring(4, 6), 16), 
           255
        ];
    }
    return [
        parseInt(tmp.substring(0, 2), 16), 
        parseInt(tmp.substring(2, 4), 16), 
        parseInt(tmp.substring(4, 6), 16), 
        parseInt(tmp.substring(6, 8), 16)
    ];
}

const floodFill = (canvas, position, color) => {

    const rgb = hexToRgba(color);

    const { width: w, height: h } = canvas;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    let x = position.x << 0;
    let y = position.y << 0;

    let index = (w * y + x) * 4;

    const rc = [ // reference color
        data[index],
        data[index + 1],
        data[index + 2],
        data[index + 3]
    ];

    if(sameColors(rc, 0, rgb)) return;

    const queue = [{x, y}];

    do {

        const pos = queue.shift();
        index = (w * pos.y + pos.x) * 4;

        if(sameColors(data, index, rc)) { // 
            // update color
            data[index    ] = rgb[0]; // r
            data[index + 1] = rgb[1]; // g
            data[index + 2] = rgb[2]; // b
            data[index + 3] = rgb[3]; // a
            // spread color
            if(pos.x - 1 >= 0) queue.push({x: pos.x - 1, y: pos.y});
            if(pos.x + 1 < w ) queue.push({x: pos.x + 1, y: pos.y});
            if(pos.y - 1 >= 0) queue.push({x: pos.x, y: pos.y - 1});
            if(pos.y + 1 < h ) queue.push({x: pos.x, y: pos.y + 1});
        }

    } while(queue.length > 0);

    ctx.putImageData(imageData, 0, 0);

}

const drawLine = (canvas, start, end, pixelSize, color)=> {

    const p0 = new Vec2(start).div(pixelSize).floor().scl(pixelSize).add(pixelSize * 0.5);
    const p1 = new Vec2(end  ).div(pixelSize).floor().scl(pixelSize).add(pixelSize * 0.5);

    const difX = p1.x - p0.x;
    const difY = p1.y - p0.y;
    const dist = Math.abs(difX) + Math.abs(difY);
    const dx = difX / dist;
    const dy = difY / dist;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    for (let x, y, wx, wy, i = 0; i <= dist; i++) {
      wx = p0.x + dx * i;
      wy = p0.y + dy * i;
      x = Math.floor(wx / pixelSize);
      y = Math.floor(wy / pixelSize);
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }

}

const drawRect = (canvas, start, end, pixelSize, color, fill) => {

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;

    const p0 = new Vec2(start).div(pixelSize).floor();
    const p1 = new Vec2(end  ).div(pixelSize).floor();

    let x0, x1, y0, y1;
    if(p0.x > p1.x) {
        x0 = p1.x;
        x1 = p0.x;
    } else {
        x0 = p0.x;
        x1 = p1.x;
    }

    if(p0.y > p1.y) {
        y0 = p1.y;
        y1 = p0.y;
    } else {
        y0 = p0.y;
        y1 = p1.y;
    }

    if(fill) {
        for(let x = x0; x <= x1; ++x) {
            for(let y = y0; y <= y1; ++y) {
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
    } else {
        let tmp1 = y0 * pixelSize;
        let tmp2 = y1 * pixelSize;
        for(let x = x0; x <= x1; ++x) {
            ctx.fillRect(x * pixelSize, tmp1, pixelSize, pixelSize);
            ctx.fillRect(x * pixelSize, tmp2, pixelSize, pixelSize);
        }
        tmp1 = x0 * pixelSize;
        tmp2 = x1 * pixelSize;
        for(let y = y0; y <= y1; ++y) {
            ctx.fillRect(tmp1, y * pixelSize, pixelSize, pixelSize);
            ctx.fillRect(tmp2, y * pixelSize, pixelSize, pixelSize);
        }
    }

}

const drawCircle = ()=> {

}
