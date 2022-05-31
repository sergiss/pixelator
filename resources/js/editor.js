/*
 * Copyright (c) 2021, Sergio S.- sergi.ss4@gmail.com http://sergiosoriano.com
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *    	
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 */

const PIXEL_SIZE = 20;

import { Vec2 } from "./vec2.js";

export class Editor {

    constructor(app) {

        this.app = app;

        this.scale = 1;

        this.currentColor = '#000';
        this.isMouseDown  = false;

        this.mousePosition = new Vec2();
        this.mouseStart    = new Vec2();

        const canvas1 = document.querySelector('#panel1');
        const ctx1 = canvas1.getContext('2d');

        const canvas2 = document.querySelector('#panel2');
        const ctx2 = canvas2.getContext('2d');

        const getMousePosition = (e, result)=> {
            if(!result) {
                result = new Vec2();
            }
            const rect = canvas1.getBoundingClientRect();
            result.x = (e.clientX || e.touches[0].clientX) - rect.left;
            result.y = (e.clientY || e.touches[0].clientY) - rect.top;
            result.scl(this.scale);
            return result;
        }

        const mouseMove = (e)=> {
            e.preventDefault();
            getMousePosition(e, this.mousePosition);
            this.draw();
        }
        
        const mouseDown = (e)=> {
            this.isMouseDown = true;
            getMousePosition(e, this.mouseStart);
            this.mousePosition.set(this.mouseStart);
            this.draw();
        }
        
        const mouseUp = (e) => {
            this.isMouseDown = false;
            if(this.app.toolSelection === 'line'
            || this.app.toolSelection === 'rect'
            || this.app.toolSelection === 'rect-fill'
            || this.app.toolSelection === 'circle'
            || this.app.toolSelection === 'circle-fill') {
                this.ctx1.drawImage(canvas2, 0, 0);
            }
        }
        
        canvas2.addEventListener("mousemove", mouseMove, false);
        canvas2.addEventListener("touchmove", mouseMove, false);
        canvas2.addEventListener("mousedown", mouseDown, false);
        canvas2.addEventListener("pointerdown", mouseDown, false);

        // canvas2.addEventListener("mouseout" , mouseOut , false);

        canvas2.addEventListener("pointerup", mouseUp, false);
        document.body.addEventListener("mouseup", mouseUp, false);
        document.body.addEventListener("mouseout", (e)=> {
            if(e.target === document.body) {
                mouseUp();
            }
        }, false);

        this.canvas1 = canvas1;
        this.ctx1 = ctx1;

        this.canvas2 = canvas2;
        this.ctx2 = ctx2;

        // Color picker
        document.querySelector('#color-picker').addEventListener('input', (e)=> {
            this.currentColor = e.target.value;
        });

    }

    initialize = (w, h) => {
        this.canvas1.width  = this.canvas2.width  = w * PIXEL_SIZE;
        this.canvas1.height = this.canvas2.height = h * PIXEL_SIZE;
        const tgtSize = 680;
        if(this.canvas1.width > tgtSize || this.canvas1.height > tgtSize) {
            this.scale = 1;

            this.ctx1.scale(this.scale, this.scale);
            this.ctx2.scale(this.scale, this.scale);
        }
    }

    download = ()=> {
        const link = document.createElement('a');
        link.download = 'image.png';
        link.href = scaleImage(this.canvas1, 1 / PIXEL_SIZE * this.scale).toDataURL('image/png');
        link.click();
    }
    
    openImage = ()=> {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = ".jpg,.jpeg,.png";
        input.addEventListener('change', (e)=> {
            const reader = new FileReader();
            reader.onload = ()=> {
            const image = new Image();
              image.src = reader.result;
              image.addEventListener('load', ()=> {
                this.initialize(image.width, image.height);
                const tmp = scaleImage(image, PIXEL_SIZE);
                this.ctx1.save();
                this.ctx1.webkitImageSmoothingEnabled = false;
                this.ctx1.mozImageSmoothingEnabled = false;
                this.ctx1.imageSmoothingEnabled = false;
                this.ctx1.drawImage(tmp, 0, 0);
                this.ctx1.restore();
              });
            };
            reader.readAsDataURL(e.target.files[0]);
        });
        input.click();
    }

    draw = ()=> {

        this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);

        if(this.isMouseDown) {

            const x = Math.floor(this.mousePosition.x / PIXEL_SIZE) * PIXEL_SIZE;
            const y = Math.floor(this.mousePosition.y / PIXEL_SIZE) * PIXEL_SIZE;
    
            switch(this.app.toolSelection) {
                case 'eraser' :
                    this.ctx1.clearRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
                    break;
                case 'pencil' :
                    this.ctx1.fillStyle = this.currentColor;
                    this.ctx1.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
                    break;
                case 'bucket' :
                    floodFill(this.canvas1, this.mousePosition, this.currentColor);
                    break;
                case 'line' :
                    drawLine(this.canvas2, this.mouseStart, this.mousePosition, PIXEL_SIZE, this.currentColor);
                    break;
                case 'rect' :
                    drawRect(this.canvas2, this.mouseStart, this.mousePosition, PIXEL_SIZE, this.currentColor);
                    break;
                case 'rect-fill' :
                    drawRect(this.canvas2, this.mouseStart, this.mousePosition, PIXEL_SIZE, this.currentColor, true);
                    break;
                case 'circle' :
                    drawCircle(this.canvas2, this.mouseStart, this.mousePosition, PIXEL_SIZE, this.currentColor);
                    break;
                case 'circle-fill' :
                    drawCircle(this.canvas2, this.mouseStart, this.mousePosition, PIXEL_SIZE, this.currentColor, true);
                    break;
                case 'dropper' :
                    const color = getColorAt(this.canvas1, this.mousePosition);
                    if(color.toLowerCase().endsWith('ff')) {
                        this.currentColor = color.substring(0, 7);
                        document.querySelector('#color-picker').value = this.currentColor;
                    }
                    break;
            }
            
        }

    }

}

const scaleImage = (image, scale) => {
    const canvas = document.createElement('canvas');
    canvas.width  = image.width * scale;
    canvas.height = image.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0);
    return canvas;
}

const getColorAt = (canvas, position)=> {
    const { width: w, height: h } = canvas;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    let x = position.x << 0;
    let y = position.y << 0;

    let index = (w * y + x) * 4;
    return '#' + data[index].toString(16).padStart(2, '0') + data[index + 1].toString(16).padStart(2, '0') + data[index + 2].toString(16).padStart(2, '0') + data[index + 3].toString(16).padStart(2, '0') ;
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

const drawCircle = (canvas, start, end, pixelSize, color, fill) => {

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;

    const p0 = new Vec2(start).div(pixelSize).floor();
    const p1 = new Vec2(end  ).div(pixelSize).floor();

    const dst = Math.floor(p0.dst(p1));

    const tmp = new Vec2();

    let x0 = Math.max(0, p0.x - dst), 
        x1 = Math.min(Math.floor(canvas.width  / pixelSize), p0.x + dst + 1), 
        y0 = Math.max(0, p0.y - dst), 
        y1 = Math.min(Math.floor(canvas.height / pixelSize), p0.y + dst + 1);

    if(fill) {

        for(let x = x0; x < x1; ++x) {
            for(let y = y0; y < y1; ++y) {
                if(tmp.set(x, y).sub(p0.x, p0.y).len() < dst) {
                    let wx = x * pixelSize;
                    let wy = y * pixelSize;
                    ctx.fillRect(wx, wy, pixelSize, pixelSize);
                }
            }
        }

    } else {

        for(let x = x0; x < x1; ++x) {
            for(let y = y0; y < y1; ++y) {
                if(tmp.set(x, y).sub(p0.x, p0.y).len() < dst
                && (tmp.set(x + 1, y).sub(p0.x, p0.y).len() >= dst
                || tmp.set(x - 1, y).sub(p0.x, p0.y).len() >= dst
                || tmp.set(x    , y + 1).sub(p0.x, p0.y).len() >= dst
                || tmp.set(x    , y - 1).sub(p0.x, p0.y).len() >= dst)) {
                    let wx = x * pixelSize;
                    let wy = y * pixelSize;
                    ctx.fillRect(wx, wy, pixelSize, pixelSize);
                }
            }
        }

    }


}
