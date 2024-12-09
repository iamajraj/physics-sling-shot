const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d");

const WIDTH = 1000;
const HEIGHT = 600;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const ballInfo = {
    rad: 50,
    x: (WIDTH /2),
    y: (HEIGHT/2),
    currentX: (WIDTH /2),
    currentY: (HEIGHT/2)
}

let isDragging = false;
let isMouseInBall = false;

let currentXY = {
    x: 0,
    y: 0,
}

const GRAVITY = 0.5; // Gravity value
const VELOCITY_MULTIPLIER = 0.2; // To control the "launch speed" 
const FRICTION = 0.98; // Friction to slow down the ball
const STOP_THRESHOLD = 0.1; // If velocity is smaller than this, stop the ball

let velocityX = 0;
let velocityY = 0;
let isLaunched = false;

function drawLine(){
    ctx.beginPath();
    ctx.moveTo(0, HEIGHT/2);
    ctx.lineTo(WIDTH, HEIGHT/2);
    ctx.stroke();
}

function drawBall(){
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.arc(ballInfo.x, ballInfo.y, ballInfo.rad, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ballInfo.currentX, ballInfo.currentY, 20, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.fillStyle = "black";
}

function drawXY(){
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.font = "18px Arial";
    ctx.textBaseline = "middle";
    ctx.fillText(`X: ${currentXY.x}`, 20, 20)
    ctx.fillText(`Y: ${currentXY.y}`, 20, 45)
    ctx.fillStyle = "black";

    
    ctx.fillText(`Ball Fixed X: ${ballInfo.x}`, 20, 75)
    ctx.fillText(`Ball Fixed Y: ${ballInfo.y}`, 20, 100)
    ctx.fillText(`Radius: ${ballInfo.rad}`, 20, 125)
    ctx.fillText(`Width/Height: ${2*ballInfo.rad}`, 20, 150)
    
    ctx.fillText(`Ball Current X: ${ballInfo.currentX}`, 20, 175)
    ctx.fillText(`Ball Current Y: ${ballInfo.currentY}`, 20, 200)

    ctx.fillText(`Velocity X: ${velocityX}`, 20, 225)
    ctx.fillText(`Velocity Y: ${velocityY}`, 20, 250)
}

function drawBallLine() {
    if (isDragging) {
        let angle = Math.atan2(currentXY.y - ballInfo.y, currentXY.x - ballInfo.x);
        
        const offsetX1 = ballInfo.rad * Math.cos(angle + Math.PI / 2);
        const offsetY1 = ballInfo.rad * Math.sin(angle + Math.PI / 2);
        
        const offsetX2 = ballInfo.rad * Math.cos(angle - Math.PI / 2);
        const offsetY2 = ballInfo.rad * Math.sin(angle - Math.PI / 2);
        
        const anchor1X = ballInfo.x + offsetX1;
        const anchor1Y = ballInfo.y + offsetY1;
        
        const anchor2X = ballInfo.x + offsetX2;
        const anchor2Y = ballInfo.y + offsetY2;
        
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.moveTo(anchor1X, anchor1Y);
        ctx.lineTo(currentXY.x, currentXY.y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(anchor2X, anchor2Y);
        ctx.lineTo(currentXY.x, currentXY.y);
        ctx.stroke();
        
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
    }
}

function drawTrajectory() {
    if (isDragging) {
        const angle = Math.atan2(ballInfo.y - currentXY.y, ballInfo.x - currentXY.x);
        const velocity = Math.sqrt((ballInfo.x - currentXY.x) ** 2 + (ballInfo.y - currentXY.y) ** 2) * VELOCITY_MULTIPLIER;

        let x = ballInfo.x;
        let y = ballInfo.y;

        for (let t = 0; t < 50; t += 2) {
            const nextX = x + velocity * t * Math.cos(angle);
            const nextY = y + velocity * t * Math.sin(angle) + (0.5 * GRAVITY * t ** 2);

            ctx.beginPath();
            ctx.arc(nextX, nextY, 3, 0, Math.PI * 2);
            ctx.fillStyle = "red";
            ctx.fill();
        }
    }
}

function updateBallPosition() {
    if (isLaunched) {
        // Update position based on velocity
        ballInfo.currentX += velocityX;
        ballInfo.currentY += velocityY;

        // Gravity affects vertical velocity
        velocityY += GRAVITY;

        velocityX *= FRICTION;
        velocityY *= FRICTION;

        // Check if the ball hits the ground
        if (ballInfo.currentY + ballInfo.rad > HEIGHT) {
            ballInfo.currentY = HEIGHT - ballInfo.rad; // Prevent ball from going below ground
            velocityY *= -0.7; // Bounce effect (reduce speed)
        }

        // Check if the ball hits the wall
        if (ballInfo.currentX + ballInfo.rad > WIDTH) {
            ballInfo.currentX = WIDTH - ballInfo.rad;
            velocityX *= -0.7; // Bounce back
        }

        if (ballInfo.currentX - ballInfo.rad < 0) {
            ballInfo.currentX = ballInfo.rad;
            velocityX *= -0.7; // Bounce back
        }

        if(Math.abs(velocityX) < STOP_THRESHOLD && Math.abs(velocityY) < STOP_THRESHOLD){
            velocityX = 0;
            velocityY = 0;
            isLaunched = false;
        }
    }
}


canvas.addEventListener('mousemove', (ev) => {
    currentXY.x = ev.offsetX;
    currentXY.y = ev.offsetY
    if(isDragging){
        isDragging = true;
        ballInfo.currentX = currentXY.x;
        ballInfo.currentY = currentXY.y;
    }
})

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    isLaunched = true;

    velocityX = (ballInfo.x - currentXY.x) * VELOCITY_MULTIPLIER;
    velocityY = (ballInfo.y - currentXY.y) * VELOCITY_MULTIPLIER;
})

canvas.addEventListener('mousedown', (ev) => {
    const x = ev.offsetX;
    const y = ev.offsetY;
    currentXY.x = x;
    currentXY.y = y;

    const {x: x1, y: y1, rad} = ballInfo;

    const x2 = ev.offsetX;
    const y2 = ev.offsetY;

    const distance = Math.sqrt((x2 - x1)**2 + (y2 - y1)**2);
    isMouseInBall = distance <= rad;

    if(isMouseInBall){
        isDragging = true;
        isLaunched = false;
        velocityX = 0;
        velocityY = 0;
    }
})

const animate = () => {
    requestAnimationFrame(animate)

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    drawLine();
    drawBall();
    drawXY();
    drawBallLine();
    drawTrajectory();
    updateBallPosition();
}

animate();