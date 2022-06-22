// Need Functions:
// tank explosion / coloring change
// ground explosion
// turret motion
// End game state
// 180 degree motion limit on turret
// muzzle blast
// stop clock
// tank placement
// tank movement?
// background changer



// Variables needed:
// tank muzzle origin / tracker / setter
// angle
// power
// player it is
// health
// tank origin
// muzzle origin
// 

// Other needed:
// wash backgrounds/
// fire sounds
// turret motion sounds
// explsion sound
// 


// Broken:
// Angle and power go up and down but don't display every key press


/// HELPER FUNCTIONS

// TEST THE CONVERSIONS

//testing
const downloadToFile = (content, filename, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], {type: contentType})
    
    a.href= URL.createObjectURL(file)
    a.download = filename;
    a.click();

    URL.revokeObjectURL(a.href)
}
//   let text = 'the data to read out'
//   downloadToFile(text, 'my-new-file.txt', 'text/plain');

//#####################################################






//####################





// false is player2
let Gplayer1Turn = true 

var GlobalIterator = 0

var isCurrentTurnOverG = false

let displayAngle = 45
let displayPower = 44


// @50 milisecond loop, there are 20 repeating loops in a second. So around 20 frames per second
let frameLength = 65


// set it to html settings... in px
var canvasH = 500
var canvasW = 500


// setting gravity constant
const G = 9.8 


const realOrigin = [0,0]
const canvasOrigin = [0,500]


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

const realYToCanvasX = (realY) => {
    const canvasY = canvasH -realY
    return [canvasY]
}

// sets the display angle
const showAngle = () => {
    angleDisplayGrab.innerText = `Angle: ${displayAngle}`
}

// sets the display power
const showPower = () => {
    powerDisplayGrab.innerText = `Power: ${displayPower}`
}




// power 0 to 100 , can add height, in METERS. I"ll need a factor to bring numbers down. Like top power is 30 meters/s...
const parabolicFunction = (realX,realY,angle,power, height1) => {
    // these are in meters

    
    let height = 0  // HAVE TO FIX THIS for terrain
    let radians = angle * Math.PI / 180

    let horizontalVelocity = power * (Math.cos(radians))
    let verticalVelocity = power * (Math.sin(radians))
    let flightTimeNoHeight = (2 * verticalVelocity / G) 
    let flightTime = ((verticalVelocity + Math.sqrt(Math.pow(verticalVelocity,2) + 2 * G * height)) / G)
    let rangeNoHeight = (2 * horizontalVelocity * verticalVelocity / G)
    let range = (horizontalVelocity * (verticalVelocity + Math.sqrt(Math.pow(verticalVelocity,2) + 2 * G * height)) / G)
    let maxHeightNoHeight = (Math.pow(verticalVelocity,2) / (2 * G))
    let maxHeight = (height + Math.pow(verticalVelocity,2) / (2 * G))

    return [R(horizontalVelocity),  //[0]
            R(verticalVelocity),    //[1]
            R(flightTimeNoHeight),  //[2]
            R(flightTime),          //[3]
            R(rangeNoHeight),       //[4]
            R(range),               //[5]
            R(maxHeightNoHeight),   //[6]
            R(maxHeight)]           //[7]
}


// give x coordinate given a time and velocity
const getX = (angle, power, newtime, timeInit, Xinit,) => {
    let x = Xinit + power * (newtime - timeInit) * Math.cos(angleToRadians(angle))
    return x
}

const getY = (angle, power, newtime, timeInit, Yinit,) => {
    let x = Yinit + power * (newtime - timeInit) * Math.sin(angleToRadians(angle)) - .5 * G * (Math.pow((newtime - timeInit),2))
    return x
}

const angleToRadians = (angle) =>{
   let rads = angle * Math.PI / 180
    return rads
}


const makeBulTrajArray = (angle, power) => {
    const bulletTrajArrayX = []
    const bulletTrajArrayY = []

    let para = parabolicFunction(0,0,angle,power,0)
    let totalTime = para[3]
    const trajectoryFrames = totalTime / .1 // split up the lengtho of airtime / will change with hangtime / NOt what I want
    for (let i = 0; i < trajectoryFrames; i++){
        bulletTrajArrayX.push(getX(angle,power,i,0,0))
        bulletTrajArrayY.push(getY(angle,power,i,0,0))
    }
    
    return [bulletTrajArrayX,bulletTrajArrayY]
    
}

///######################################################
//

const game = document.getElementById('canvas')
const angleDisplayGrab = document.getElementById('angle')
const powerDisplayGrab = document.getElementById('power')

const ctx = game.getContext('2d')

game.setAttribute('width',getComputedStyle(game)['width'])
game.setAttribute('height',getComputedStyle(game)['height'])


class ItsOverEntity {

    // attributes that are variable, go in the constructor function
    constructor(x, y, color, width, height, angle, power, show) {

        // define here: what the object will be made of
        this.x = x,    
        this.y = y,
        this.color = color,
        this.width = width,
        this.height = height,
        this.angle = angle,
        this. power = power, 
        this.show = false,

        // we can also add methods
        // here our method will be render
        this.render = function() {
            // here, we will se the fillstyle and the fillrect

            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y, this.width, this.height)
        }
    }
}

let bullet1 = new ItsOverEntity(0, 470, 'white', 5, 5, 72, 90, false)  // ideally these values will come from the player and tanks settings
let tank1 = new ItsOverEntity(0, 450, 'green', 16, 16, 80, 50, true)
let tank2 = new ItsOverEntity(400, 420, 'red', 32, 48)

// GONNa try to have a bullet take a shoot path below 

let bulletTraj1 = makeBulTrajArray(bullet1.angle,bullet1.power)
for (let i = 0; i < bulletTraj1[0].length; i++){
    bullet1.x = bulletTraj1[0][i]
    bullet1.y = bulletTraj1[1][i]
}


//##############################################################################################################
//#############################vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv#################################################
const gameLoop = () => {

    if (tank2.show) {
        detectHit()
    }
    // need to render both our objects and their respective methods
    // need to update our movement with coords of tank
    // to make movement, we need to clear the canvas every 'frame'


    
    
    ctx.clearRect(0,0,game.width,game.height)

    if (bullet1.show === true) {
        if (GlobalIterator > 150){
            console.log('stopped');
        } else { bullet1.x = bulletTraj1[0][GlobalIterator]
            bullet1.y = realYToCanvasX(bulletTraj1[1][GlobalIterator])
            console.log(GlobalIterator);
            GlobalIterator++}

        bullet1.render()
    }    
    

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




    let clearID = setInterval(gameLoop, frameLength)
})



//#############################^^^^^^^^^^^^^^^^^^^^^^^##########################################################
//##############################################################################################################


// this funt is ogint o be how we move our tank around
// we use e (event)

const movementHandler = (e) => {

    switch (e.keyCode) {
        case (87):
        case (38):  // CASCADE to get it to work with other keys
            // adjusts tank cannon vel

            if (displayPower > 100){
                displayPower = 100
            }
            displayPower += 1

            // needs break
            break
        
        case (65):
        case (37):

            // deacreases angle
            if (displayAngle <=0 ){   // limits the angle to 180deg
                displayAngle = 0
            } else (displayAngle -= 1)
            
            break 

        case (83):
        case (40):    
            // decreases the power
            displayPower -= 1 
            break

        case (68):
        case (39):    
            // this increases the angle
            if (displayAngle >= 180){   // limits the angle to 180deg
                displayAngle =180
            } else (displayAngle += 1)
            
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


const fireIt = () => {
    playerChanger()
    // create a bullet array
    // grab the projectile values
    // pass the array of bullet traj
    // update the show value
    // show it 

    bullet1.show = true
}

const fireButtonGrab = document.getElementById('fire')
fireButtonGrab.addEventListener('click',fireIt)


const bulletAnimation = (bulletObj, initTime, angle, power) => {
    let para = parabolicFunction(bulletObj)
}


const playerChanger = () => {
    const pT = document.getElementById('playerTurn')
    
    if (Gplayer1Turn === true) {
        pT.innerText = "Player 2's Turn"
        Gplayer1Turn = false

    } else {Gplayer1Turn = true
        pT.innerText = "Player 1's Turn"
    }
}



const w3ButtonGrab = document.getElementById('weapon3button')
w3ButtonGrab.addEventListener('click',showAngle)
