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

let globalX = 0
let globalY = 0

var isCurrentTurnOverG = false

let displayAngle = 45
let displayPower = 30


// @50 milisecond loop, there are 20 repeating loops in a second. So around 20 frames per second
// 65 appears to be a good balance
let frameLength = 65


// NEEDS: get from html settings... in px
var canvasH = 500
var canvasW = 500


// setting gravity constant
const G = 9.8 


const realOrigin = [0,0]
const canvasOrigin = [0,500]

let player1 = 100
let player2 = 100


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
const canvasYToRealY = (canvasY,canvasH) => {
    return canvasH - canvasY
}


const realXYToCanvasXY = (realX,realY) => {
    const canvasY = canvasH - realY
    return [realX, canvasY]
}

const realYToCanvasY = (realYnum) => {
    const canvasY = canvasH -realYnum
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


const playerChanger = () => {
    const pT = document.getElementById('playerTurn')
    
    if (Gplayer1Turn === true) {
        pT.innerText = "Player 2's Turn"
        Gplayer1Turn = false

    } else {Gplayer1Turn = true
        pT.innerText = "Player 1's Turn"
    }
}



// power 0 to 100 , can add height, in METERS. I"ll need a factor to bring numbers down. Like top power is 30 meters/s...
const parabolicFunction = (realX,realY,angle,power, height) => {
    // these are in meters    

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


const makeBulTrajArray = (x,y,angle, power) => {
    const bulletTrajArrayX = []
    const bulletTrajArrayY = []

    let para = parabolicFunction(x,y,angle,power,0)
    let totalTime = para[3]
    const trajectoryFrames = totalTime / .001 // split up the lengtho of airtime / will change with hangtime / NOt what I want
    for (let i = 0; i < trajectoryFrames; i++){
        bulletTrajArrayX.push(getX(angle,power,i,0,x))
        bulletTrajArrayY.push(getY(angle,power,i,0,y))
    }
    
    return [bulletTrajArrayX,bulletTrajArrayY]
    
}

const showPowAng = () => {
    showAngle()
    showPower()
}

const generateRand = (min,max) => {
    let diff =  max - min
    let rand = Math.random()
    rand = Math.floor (rand * diff)
    rand = rand + min
    return rand
}


const tankPlacerX = () => {
    let halfCanvas = canvasW / 2
    let firstHalfCanvas = [0,halfCanvas]
    let secondHalfCanvas = [halfCanvas,canvasW]
    let position1 = generateRand(firstHalfCanvas[0],firstHalfCanvas[1])
    let position2 = generateRand(secondHalfCanvas[0],secondHalfCanvas[1])
    return [position1,position2]
}

    // SOLUTION??? get length of time for shot and set SHOW.true for that length,
    //  then turn it off....  OR its okay to stop the 'clock'
    //          ADD ITS OWN CLOCK with render???


    // approach - The Bullet is always there, it will get a new TRAJ values, and
    //      render when needed



// constructor(x, y, color, width, height, angle, power, show)
const fireIt = () => {

    let localX = globalX
    let localY = globalY
    
    // Step: erase prior parameters
    let bulletTraj = makeBulTrajArray(tank1.x,tank1.y,tank1.angle, tank1.power)
    
    // have to fix hardcoding for parabolic inputs
    let paraBolics = parabolicFunction(tank1.x,tank1.y,tank1.angle,tank1.power, tank1.y)

    let fltTime = paraBolics[3]
    console.log("fltTime:"+fltTime);
    forLength = fltTime / (frameLength * .001)
    console.log("forLength:" +forLength);

    // LOOP KINDA WORKS. Have to stop it once its finished its fltTime
    let localIterator = 0
    let endLoop = false
    
    let timerID = undefined
    console.log("timerID:"+timerID)    
    
    const localLoop = () => {
    
        // if (iterator >= forLength ){
        //     clearInterval(timerID)
        // }
    
        bullet.show = true 
        bullet.x = bulletTraj[0][localIterator]
        bullet.y = realYToCanvasY(bulletTraj[1][localIterator])
        
        localIterator++

    }
    
    
    const localClock = () => {
        
        let intervalID = setInterval(localLoop,frameLength)
        console.log("intervalID:"+intervalID)
    
        timerID = intervalID
        console.log("timerIDin:"+timerID)
    }


localClock()
playerChanger()
}


///=========================================================================================
// =========================================================================================

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
        this.show = show,

        this.health = 25

        // we can also add methods
        // here our method will be render
        this.render = function() {
            // here, we will se the fillstyle and the fillrect

            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y, this.width, this.height)
        }
    }
}



// SOMETHING FUNKY HERE!!!!
//       constructor(x, y, color, width, height, angle, power, show)   
  // ideally these values will come from the player and tanks settings
let tank1 = new ItsOverEntity(tankPlacerX()[0], 450, 'green', 16, 10, displayAngle, displayPower, true)  //!! set bullet Y here IN CANVAS XY,not real
    globalY = canvasYToRealY(tank1.y)
    globalX = tank1.x


let tank2 = new ItsOverEntity(tankPlacerX()[1], realYToCanvasY(20), 'red', 16, 10,40,70,true)
let bullet = new ItsOverEntity(tank1.x, tank1.y, 'white', 5, 5, tank1.angle, tank1.power, false)







// GONNa try to have a bullet take a shoot path below 

// let bulletTraj1 = makeBulTrajArray(bullet1.angle,bullet1.power)
// for (let i = 0; i < bulletTraj1[0].length; i++){
//     bullet1.x = bulletTraj1[0][i]
//     bullet1.y = bulletTraj1[1][i]
// }


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

    // if (bullet1.show === true) {
    //     if (GlobalIterator > 150){
    //         console.log('stopped');
    //     } else { bullet1.x = bulletTraj1[0][GlobalIterator]
    //         bullet1.y = realYToCanvasX(bulletTraj1[1][GlobalIterator])
    //         console.log(GlobalIterator);
    //         GlobalIterator++}

    //     bullet1.render()
    // }    
    


    tank1.render()

    if (bullet.show) {
        bullet.render()
    } 

    if (tank2.show) {
        tank2.render()   //  you don't it to detecthit() when its dead
    }


        
    }


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

            if (displayPower >= 99){
                displayPower = 99
            }
            displayPower += 1

            // needs break
            break
        

            case (68):
            case (39):  


            // deacreases angle
            if (displayAngle <=0 ){   // limits the angle to 180deg
                displayAngle = 0
            } else (displayAngle -= 1)
            break 

        case (83):
        case (40):    
            // decreases the power
            if (displayPower < 1){
                displayPower = 1
            }
            displayPower -= 1 
            break


            case (65):
            case (37):  
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

    if (bullet.x < tank2.x + tank2.width
        && bullet.x + bullet.width > tank2.x
        && bullet.y < bullet.y + tank2.height
        && bullet.y +  bullet.height > tank2.y){
            // console.log('we have a hit') // testing

            // here see if hit happens
            if ( tank2.health < 32){
                tank2.show = false
            } else{ tank2.health -= 33 }
            
            

        }
}



const fireButtonGrab = document.getElementById('fire')
fireButtonGrab.addEventListener('click',fireIt)


const w3ButtonGrab = document.getElementById('weapon3button')
w3ButtonGrab.addEventListener('click',showPowAng)