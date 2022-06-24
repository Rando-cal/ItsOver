// Need Functions:
// tank explosion / coloring change
// ground explosion
// turret motion
// End game state ***
// 180 degree motion limit on turret
// muzzle blast
// stop clock
// tank movement?
// background changer
// minmal viable tank ***



// Variables needed:



// Other needed:
// wash backgrounds/
// fire sounds
// turret motion sounds
// explsion sound
// 


// Broken:
// Angle and power go up and down but don't display every key press


/// HELPER FUNCTIONS

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

// let globalX = 0
// let globalY = 0

var isCurrentTurnOverG = false

let displayAngle = 45
let displayPower = 55


// @50 milisecond loop, there are 20 repeating loops in a second. So around 20 frames per second
// 65 appears to be a good balance
let frameLength = 65


// NEEDS: get from html settings... in px
let canvasH = 500
let canvasW = 700


// setting gravity constant
const G = 9.8 

let gameOverState = false


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
const canvasYToRealY = (canvasY) => {  // STUPID  un-used parameter throwing NaN
    y = canvasH - canvasY
    return y
}


const realXYToCanvasXY = (realX,realY) => {
    const canvasY = canvasH - realY
    return [realX, canvasY]
}

const realYToCanvasY = (realYnum) => {
    const canvasY = canvasH -realYnum
    return canvasY
}

// sets the display angle
const showAngle = () => {
    if (Gplayer1Turn){
        angleDisplayGrab.innerText = `Angle: ${tank1.angle}`
    } else {
        angleDisplayGrab.innerText = `Angle: ${tank2.angle}`
    }
}

// sets the display power
const showPower = () => {
    if (Gplayer1Turn){
        powerDisplayGrab.innerText = `Power: ${tank1.power}`
    } else {
        powerDisplayGrab.innerText = `Power: ${tank2.power}`
    }
}

const showPowAng = () => {
    showAngle()
    showPower()
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
    let y = Yinit + power * (newtime - timeInit) * Math.sin(angleToRadians(angle)) - .5 * G * (Math.pow((newtime - timeInit),2))
    return y
}

const angleToRadians = (angle) =>{
   let rads = angle * Math.PI / 180
    return rads
}












// this is not RETURN THE CORRECT Y VALUES
const makeBulTrajArray = (x,y,angle, power) => {


    const bulletTrajArrayX = []
    const bulletTrajArrayY = []

    console.log('239:Y:'+ y);

    let para = parabolicFunction(x,y,angle,power,0)
    let totalTime = para[3]
    const trajectoryFrames = totalTime / .001 // split up the lengtho of airtime / will change with hangtime / NOt what I want
    for (let i = 0; i < trajectoryFrames; i++){
        bulletTrajArrayX.push(getX(angle,power,i,0,x))
        bulletTrajArrayY.push(getY(angle,power,i,0,y))
    }
    console.log('bulletTrajArrayX:'+bulletTrajArrayX[5]);
    console.log('bulletTrajArrayY:'+ bulletTrajArrayY[5]);
    
    return [bulletTrajArrayX,bulletTrajArrayY]
    
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



const detectHit = () => {
    // use 1 big IF statment
    // use x,y,width, height of our objects

    if (bullet1.x < tank2.x + tank2.width
        && bullet1.x + bullet1.width > tank2.x
        && bullet1.y < bullet1.y + tank2.height
        && bullet1.y +  bullet1.height > tank2.y){
            // console.log('we have a hit') // testing

            // here see if hit happens
            if ( tank2.health < 32){
                tank2.show = false
            } else{ tank2.health -= 33 }

            window.alert("HIT!");    
        }
}





// we use e (event)

const movementHandler = (e) => {

    // need an if to grab the player and attribute the + - to the angle and power....
    if (Gplayer1Turn){
        switch (e.keyCode) {
            case (87):
            case (38):  // CASCADE to get it to work with other keys
                // adjusts tank cannon vel

                if (tank1.power >= 99){
                    tank1.power = 99
                }
                tank1.power += 1

                // needs break
                break
            

                case (68):
                case (39):  


                // deacreases angle
                if (tank1.angle <=0 ){   // limits the angle to 180deg
                    tank1.angle = 0
                } else (tank1.angle -= 1)
                break 

            case (83):
            case (40):    
                // decreases the power
                if (tank1.power < 1){
                    tank1.power = 1
                }
                tank1.power -= 1 
                break


                case (65):
                case (37):  
                // this increases the angle
                if (tank1.angle >= 180){   // limits the angle to 180deg
                    tank1.angle =180
                } else (tank1.angle += 1)
                
                break
        }

    } else{


        switch (e.keyCode) {
            case (87):
            case (38):  // CASCADE to get it to work with other keys
                // adjusts tank cannon vel

                if (tank2.power >= 99){
                    tank2.power = 99
                }
                tank2.power += 1

                // needs break
                break
            

                case (68):
                case (39):  


                // deacreases angle
                if (tank2.angle <=0 ){   // limits the angle to 180deg
                    tank2.angle = 0
                } else (tank2.angle -= 1)
                break 

            case (83):
            case (40):    
                // decreases the power
                if (tank2.power < 1){
                    tank2.power = 1
                }
                tank2.power -= 1 
                break


                case (65):
                case (37):  
                // this increases the angle
                if (tank2.angle >= 180){   // limits the angle to 180deg
                    tank2.angle =180
                } else (tank2.angle += 1)
                
                break
        }

    }
}






// constructor(x, y, color, width, height, angle, power, show)
const fireIt = () => {

    let currentTankAngle = undefined
    let currentTankPower = undefined
    let currentTankX     = undefined
    let currentTankY     = undefined

    if ( Gplayer1Turn === true ){

        currentTankAngle = tank1.angle
        currentTankPower = tank1.power
        currentTankX     = tank1.x
        currentTankY     = tank1.y  

    } else{

        currentTankAngle = tank2.angle
        currentTankPower = tank2.power
        currentTankX     = tank2.x
        currentTankY     = tank2.y 
    }

    // Step: erase prior parameters



    let bulletTraj = makeBulTrajArray(currentTankX,canvasYToRealY(currentTankY),currentTankAngle, currentTankPower)  // THIS IS NaNin' the Ys

    // const parabolicFunction = (realX,realY,angle,power, height)
    // have to fix hardcoding for parabolic inputs
    let paraBolics = parabolicFunction(currentTankX,canvasYToRealY(currentTankY),currentTankAngle,currentTankPower, canvasYToRealY(currentTankY))


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
    
        bullet1.show = true 
        bullet1.x = bulletTraj[0][localIterator]
        bullet1.y = realYToCanvasY(bulletTraj[1][localIterator])
        
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
// INIT Grabs / GLOBAL SCOPE

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
        this.y = y,  // HAS TO STORE AS CANVAS Y, then convert when needed
        this.color = color,
        this.width = width,
        this.height = height,
        this.angle = angle,
        this. power = power, 
        this.show = show,

        this.health = 100

        // we can also add methods
        // here our method will be render
        this.render = function() {
            // here, we will se the fillstyle and the fillrect

            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y, this.width, this.height)
        }
    }
}

class Terrain {

    // attributes that are variable, go in the constructor function
    constructor(x, y, color, width, height,show) {

        this.x = x,    
        this.y = y,
        this.color = color,
        this.width = width,
        this.height = height,
        this.show = show,

        this.render = function() {
            // here, we will se the fillstyle and the fillrect

            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y, this.width, this.height)
        }
    }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// INIT OBJECTS



// SOMETHING FUNKY HERE!!!!
//       constructor(x, y, color, width, height, angle, power, show)   
// ideally these values will come from the player and tanks settings
let tank1 = new ItsOverEntity(tankPlacerX()[0], realYToCanvasY(40), 'green', 16, 10, 45, 50, true)  //!! set bullet Y here IN CANVAS XY,not real
let tank2 = new ItsOverEntity(tankPlacerX()[1], realYToCanvasY(40),   'red', 16, 10, 40, 70, true)

let bullet1 = new ItsOverEntity(tank1.x, tank1.y, 'white', 3, 3, tank1.angle, tank1.power, false)
let bullet2 = new ItsOverEntity(tank2.x, tank2.y, 'white', 3, 3, tank2.angle, tank2.power, false)

let terrain = new Terrain(0, realYToCanvasY(30),'gray',canvasW,realYToCanvasY(40),true)


const fireButtonGrab = document.getElementById('fire')
fireButtonGrab.addEventListener('click',fireIt)


const w3ButtonGrab = document.getElementById('weapon3button')
w3ButtonGrab.addEventListener('click',showPowAng)


//##############################################################################################################
//#############################vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv#################################################
const gameLoop = () => {


    if (tank2.show) {
        detectHit()
    }
    // need to render both our objects and their respective methods
    // need to update our movement with coords of tank
    // to make movement, we need to clear the canvas every 'frame'


    showPowAng()
    
    ctx.clearRect(0,0,game.width,game.height)


    tank1.render()

    if (bullet1.show) {
        bullet1.render()
    } 

    if (tank2.show) {
        tank2.render()   //  you don't it to detecthit() when its dead
    }

    terrain.render()


        
}


// we're going to do this when the content loads
document.addEventListener('DOMContentLoaded' , function () {
    // we need to have movement handler
document.addEventListener('keydown',movementHandler) // FINSH*******




    let clearID = setInterval(gameLoop, frameLength)
})