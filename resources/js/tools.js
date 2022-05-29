const canvas = document.querySelector('#panel');
const ctx = canvas.getContext('2d');

var pixelSize = 10;

var eraserColor  = '#0F0';
var currentColor = '#000';
var isMouseDown  = false;

const mousePosition = {
    x: 0,
    y: 0
}

const mouseStart = {
    x: 0,
    y: 0
}

const draw = () => {

    if(isMouseDown) {

        const x = Math.floor(mousePosition.x / pixelSize) * pixelSize;
        const y = Math.floor(mousePosition.y / pixelSize) * pixelSize;

        ctx.beginPath();

        switch(toolSelection) {
            case 'eraser' :
                ctx.fillStyle = eraserColor;
                ctx.fillRect(x, y, pixelSize, pixelSize);
                break;
            case 'pencil' :
                ctx.fillStyle = currentColor;
                ctx.fillRect(x, y, pixelSize, pixelSize);
            break;
    
        }
        ctx.closePath();
    }
    
}

const mouseMove = (e)=> {
    mousePosition.x = e.clientX - canvas.offsetLeft;
    mousePosition.y = e.clientY - canvas.offsetTop;
    draw();
}

const mouseDown = (e)=> {
    isMouseDown = true;
    mouseStart.x = e.clientX - canvas.offsetLeft;
    mouseStart.y = e.clientY - canvas.offsetTop;
}

const mouseUp = (e) => {
    isMouseDown = false;
}

canvas.addEventListener("mousemove", mouseMove, false);
canvas.addEventListener("mousedown", mouseDown, false);
canvas.addEventListener("mouseup", mouseUp, false);
canvas.addEventListener("mouseout", mouseUp, false); // TODO