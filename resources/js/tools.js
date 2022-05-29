const canvas = document.querySelector('#panel');
const ctx = canvas.getContext('2d');

var size = 10;

var isMouseDown = false;

const mousePosition = {
    x: 0,
    y: 0
}

const mouseStart = {
    x: 0,
    y: 0
}

const mouseMove = (e)=> {
    mousePosition.x = e.clientX - canvas.offsetLeft;
    mousePosition.y = e.clientY - canvas.offsetTop;

    if(isMouseDown) {

        ctx.beginPath();
        ctx.fillStyle = '#000';
        ctx.fillRect(mousePosition.x, mousePosition.y, size, size);
        ctx.closePath();

    }
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