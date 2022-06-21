/// HELPER FUNCTIONS

// TEST THE CONVERSIONS


// set it to html settings... in px
var canvasH = 500
var canvasW = 500




// takes in 2 string x,y get array[x,y]
const twoByStrToArray = (num1,num2) => {
    const array = []
    array.push(num1)
    array.push(num2)
    return array
}

const fourByStrToArray = (num1,num2,num3,num4) => {
    const array = []
    array.push(num1)
    array.push(num2)
    array.push(num3)
    array.push(num4)
    return array
}

const sixByStrToArray = (num1,num2,num3,num4,num5,num6) => {
    const array = []
    array.push(num1)
    array.push(num2)
    array.push(num3)
    array.push(num4)
    array.push(num5)
    array.push(num6)
    return array
}

twoByArraytoStr = (twoValueArray) =>{
    return [twoValueArray[0],twoValueArray[1]]
}

fourByArraytoStr = (fourValueArray) =>{
    return [twoValueArray[0],twoValueArray[1],twoValueArray[2],twoValueArray[3]]
}

sixByArraytoStr = (sixValueArray) =>{
    return [twoValueArray[0],twoValueArray[1],twoValueArray[2],twoValueArray[3],twoValueArray[4],twoValueArray[5]]
}

// rounds to 2 decimals
const R = (numWithDec) => {
    return Math.round(numWithDec * 100) /100
}

// change canvas xy to normal x,y coordinates
// so up will be +y, right +x. Run all co-ordindate throughit
const canvasXYToRealXY = (canvasX,canvasY,canvasW,canvasH) => {
    const realY = canvasH - canvasH
    return [canvasX,realY]
}

const realXYToCanvasXY = (realX,realY) => {
    const canvasY = canvasH -realY
    return [realX, canvasY]
}

const realOrigin = [0,0]
const canvasOrigin = [0,500]

// power 0 to 100 , can add height, in METERS. I"ll need a factor to bring numbers down. Like top power is 30 meters/s...
const parabolicFunction = (realX,realY,angle,power, height1) => {
    // these are in meters

    let g = -9.8
    let height = 0
    let radians = angle * Math.PI / 180

    let horizontalVelocity = power * (Math.cos(radians))
    let verticalVelocity = power * (Math.sin(radians))
    let flightTimeNoHeight = (2 * verticalVelocity / g) * -1
    let flightTime = ((verticalVelocity + Math.sqrt(Math.pow(verticalVelocity,2) + 2 * g * height)) / g) *-1
    let rangeNoHeight = (2 * horizontalVelocity * verticalVelocity / g) * -1
    let range = (horizontalVelocity * (verticalVelocity + Math.sqrt(Math.pow(verticalVelocity,2) + 2 * g * height)) / g) * -1
    let maxHeightNoHeight = (Math.pow(verticalVelocity,2) / (2 * g)) * -1
    let maxHeight = (height + Math.pow(verticalVelocity,2) / (2 * g))  * -1

    return [R(horizontalVelocity), 
            R(verticalVelocity),
            R(flightTimeNoHeight),
            R(flightTime), 
            R(rangeNoHeight), 
            R(range), 
            R(maxHeightNoHeight), 
            R(maxHeight)]
}

console.log(parabolicFunction(0,0,45,30))


// horizontal velocity = velocity * cos(angle)
// vertical velocity = velocity * sin(angle)
// flight time = [Vy + √(Vy² + 2 * g * h)] / g

// range = Vx * [Vy + √(Vy² + 2 * g * h)] / g
// max height = h + Vy² / (2 * g)




///######################################################


const game = document.getElementById('canvas')
const movement = document.getElementById('movement')

const ctx = game.getContext('2d')

game.setAttribute('width',getComputedStyle(game)['width'])
game.setAttribute('height',getComputedStyle(game)['height'])





class ItsOverEntity {

    // attributes that are variable, go in the constructor function
    constructor(x, y, color, width, height) {

        // define here: what the object will be made of
        this.x = x,
        // this.x = 0 , all crawlers would have x of 0
    
        this.y = y,
        this.color = color,
        this.width = width,
        this.height = height,
        

        this.show = true,

        // we can also add methods
        // here our method will be render
        this.render = function() {
            // here, we will se the fillstyle and the fillrect

            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y, this.width, this.height)
        }
    }
}

let tank1 = new ItsOverEntity(10, 470, 'green', 16, 16)
let tank2 = new ItsOverEntity(400, 420, 'red', 32, 48)
let bullet1 = new ItsOverEntity(50, 50, 'white', 5, 5)



const gameLoop = () => {

    if (tank2.show) {
        detectHit()
    }
    // need to render both our objects and their respective methods
    // need to update our movement with coords of tank
    // to make movement, we need to clear the canvas every 'frame'


    
    ctx.clearRect(0,0,game.width,game.height)

    bullet1.render()
    // movement.textContent = tank1.x + ', ' + tank1.y
    tank1.render()

        if (tank2.show) {
            tank2.render()   //  you don't it to detecthit() when its dead
        }



    }

// using setInerval to repear our game loop function at specific times

// we're going to do this when the content loads
document.addEventListener('DOMContentLoaded' , function () {
    // we need to have movement handler
document.addEventListener('keydown',movementHandler) // FINSH*******


    // need game loop running at an interval

    setInterval(gameLoop, 60)
})


// this funt is ogint o be how we move our tank around
// we use e (event)

const movementHandler = (e) => {

    switch (e.keyCode) {
        case (87):
        case (38):  // CASCADE to get it to work with other keys
            // moves the tank up
            tank1.y -= 10

            // need break
            break
        
        case (65):
        case (37):

            // this move P left
            tank1.x -= 10
            break 

        case (83):
        case (40):    
            // move tank1 down
            tank1.y += 10
            break

        case (68):
        case (39):    
            // this moves the tank1 to the right
            tank1.x += 10
            break


    }

}


const detectHit = () => {
    // use 1 big IF statment
    // use x,y,width, height of our objects

    if (tank1.x < tank2.x + tank2.width
        && tank1.x + tank1.width > tank2.x
        && tank1.y < tank2.y + tank2.height
        && tank1.y +  tank1.height > tank2.y){
            // console.log('we have a hit') // testing

            // here see if hit happens
            tank2.show = false

        }
}




