// RANDY D'ABBRACCIO 6.24.2022 Copywrite

// TO DO:

// tank explosion / coloring change   - prob need an new object like a bunch of triangles that change color...
// ground explosion
// turret motion **
// End game state ***
// muzzle blast
// tank movement?
// make canvasH / W get their values from HTML




// Other needed:

// fire sounds
// turret motion sounds
// explsion sound
// minimal viable tank visual ***
// make canvasH / W get their values from HTML




// Broken:
// Check collisions with Tank sprites



// Stretch:

// Random hilly terrain
// exploding terrain
// other weapons
// add arrows in addition to wasd
// ai player 2


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


// false is player2's turn
let Gplayer1Turn = true 

let isCurrentTurnOverG = false

let displayAngle = 45
let displayPower = 55


// @50 milisecond loop, there are 20 repeating loops in a second. So around 20 frames per second
// 65 appears to be a good balance
let frameLength = 20


// NEEDS: get from html settings... in px
let canvasH = 500
let canvasW = 700

// setting gravity constant
const G = 9.8 

let gameOverState = false

let gameLoopEndID
let localLoopId


const realOrigin = [0,0]
const canvasOrigin = [0,500]


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

let updateHealths = () => {
    p1Health.innerText = `Player 1 Health: ${tank1.health}`
    p2Health.innerText = `Player 2 Health: ${tank2.health}`
}

const randomBackground = () => {
    imgLocations = [
    "img/finished/b1-800x571.jpg",
    "img/finished/b2-800x576.jpg",
    "img/finished/b3-800x45x.jpg",
    "img/finished/b11-800x635.jpg",
    "img/finished/b12-800x555.jpg",
    "img/finished/b4-800x556.jpg",
    "img/finished/b5-800x583.jpg",
    "img/finished/b6-800x562.jpg",
    "img/finished/b7-800x610.jpg",
    "img/finished/b8-800x645.jpg",
    "img/finished/b9-800-544.jpg"
    ]

    const canvasBackgrndGrab = document.getElementById("canvas")
    canvasBackgrndGrab.style= `background: url(${imgLocations[generateRand(0,11)]})`
}


// use randn_bm(-500, 1000, 1)  : Add the min(absolute) + max. Divide by 2. Subtract that from max to get
// from https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
function randn_bm(min, max, skew) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random() //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random()
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
    
    num = num / 10.0 + 0.5 // Translate to 0 -> 1
    if (num > 1 || num < 0) 
      num = randn_bm(min, max, skew) // resample between 0 and 1 if out of range
    
    else{
      num = Math.pow(num, skew) // Skew
      num *= max - min // Stretch to fill range
      num += min // offset to min
    }
    return num
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



const disableFireButton = () => {
    const fireButtonGrab2 = document.getElementById('fire')
    fireButtonGrab2.disabled = 'true'
}

const enableFireButton = () => {
    const fireButtonGrab3 = document.getElementById('fire')
    fireButtonGrab3.removeAttribute('disabled')
}



const fiveSecFireDisable = () => {
    setTimeout(function(){document.getElementById("fire").disabled = false;},5000)
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


// give coordinates given a time and velocity and get X,Y. HEART OF THE PARABOLA
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

// !!!! DO WE CARE IF IT DOESN"T KNOW THE BULLET?


    const bulletTrajArrayX = []
    const bulletTrajArrayY = []

    console.log('239:Y:'+ y);

    // para takes, x,y,angle,power,height
    let para = parabolicFunction(x,y,angle,power,0)
    let totalTime = para[3]

    // set FactorZ to .01 for many frames, and .1 for fewer ~ 157
    const factorZ = .01
    const trajectoryFrames = totalTime / factorZ // split ddddup the lengtho of airtime / will change with hangtime / NOt what I want
    
    // !!! the iterator amount in the FOR dictates the bullet path 'fidelity'
    let makeTrajIteratorAmount = .1  // !!!!!
    
    for (let i = 0; i < trajectoryFrames; i= i + makeTrajIteratorAmount){


        // getY = (angle, power, newtime, timeInit, Yinit,)
        if ( getY(angle,power,i,0,y) > (canvasH * -1) ){

            bulletTrajArrayX.push(getX(angle,power,i,0,x))
            bulletTrajArrayY.push(getY(angle,power,i,0,y))
        }
            
    }



    // // testing
    // let text = bulletTrajArrayX
    // downloadToFile(text, 'bulletTrajArrayX', 'text/plain');
    // text2 = bulletTrajArrayY
    // downloadToFile(text2, 'bulletTrajArrayY', 'text/plain');

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


const dumbAiPlayer = () => {
    if(Gplayer1Turn === false){
        tank2.angle = randn_bm(90, 180, 1.3)
        tank2.power = randn_bm(1, 100, .7)
        fireButtonGrab.click()
        }
}


// check
const findDistanceXY = () => {
    let d = Math.sqrt(        
        ((tank2.x-tank1.x)*(tank2.x-tank1.x))
        +
        ((tank2.y-tank1.y)*(tank2.x-tank1.y))       
    )

    return d
}

// check
const findDistX = () => {
    return tank2.x - tank1.x
}


const detectHit = () => {
            // THIS WORKS FOR Mouse
            // yello ride side >= tank2 left side && mouse left side <= tank2 right side
        // yellow bottom >= blue top &&
        // if (mouse.x + 4 >= tank2.x 
        //     && mouse.x <= tank2.x + 16
        //     && mouse.y + 4 >= tank2.y && mouse.y <= tank2.y + 10
            
        //     ) {
        //     console.log("X HIT") 
        // }


    let currentBullet
    let currentTank    

    // use x,y,width, height of our objects

    if (Gplayer1Turn){
        currentBullet = bullet1
        currentTank   = tank2
    } else {
        currentBullet = bullet2
        currentTank   = tank1
    }

            // 4 is W/H of bulelt 10/16 W/H of tank
    // console.log('A:' + (currentBullet.x + currentBullet.width >= currentTank.x))
    // console.log('B:'+ (currentBullet.x <= currentTank.x + currentTank.width))
    // console.log('C:'+ (currentBullet.y + currentBullet.height >= currentTank.y))
    // console.log('D:' + (currentBullet.y <= currentTank.y + currentTank.height))
    // console.log('==================================================================');

    if(currentBullet.x + currentBullet.width >= currentTank.x   &&
        
        currentBullet.x <= currentTank.x + currentTank.width &&

        currentBullet.y + currentBullet.height >= currentTank.y &&
        
        currentBullet.y <= currentTank.y + currentTank.height

    ){



            // this was hitting due to all the detect hits in the main loop
            if (Gplayer1Turn){
                tank2.health -= 50
            } else if (Gplayer1Turn === false){
                tank1.health -= 50
            }
            console.log('!!!!HIT!!!!!'+ new Date() );
    }


    if(tank1.health <= 0 || tank2.health <= 0){
            gameOverState = true
            console.log('==============================');
            console.log('GAME OVER!!!!!!!!!!!!');
            console.log('==============================');
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

    disableFireButton()

    let localIterator = 0

    console.log('in FIREIT:'+ new Date() );

    let currentTankAngle
    let currentTankPower
    let currentTankX
    let currentTankY

    if ( Gplayer1Turn){

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


    let bulletTraj = makeBulTrajArray(currentTankX,canvasYToRealY(currentTankY),currentTankAngle, currentTankPower)

    let paraBolics = parabolicFunction(currentTankX,canvasYToRealY(currentTankY),currentTankAngle,currentTankPower, canvasYToRealY(currentTankY))


    let fltTime = paraBolics[3]
    console.log("fltTime:"+fltTime);

    let factorQ = .001
    let forLength = fltTime / (frameLength * factorQ)   // this will also increase the forLength time, which impacts the loop termination time
    console.log("forLength:" +forLength);

    // LOOP KINDA WORKS. Have to stop it once its finished its fltTime

    
    // let timerID


    const fireItLocalLoop = () => { 
        
        // const fireButtonGrab2 = document.getElementById('fire')
         console.log('in fireItLocalLoop:'+ new Date() );


    
        if (localIterator >= forLength / 3.5 ){  // 3.5 to try and cut down on playerchange time
            clearInterval(localLoopId)
            playerChanger()
            enableFireButton()
            console.log('Cleared fireItLocalLoop');
        }
        

        if(Gplayer1Turn){
            bullet1.show = true 
            bullet1.x = bulletTraj[0][localIterator]
            bullet1.y = realYToCanvasY(bulletTraj[1][localIterator])

        } else {
             bullet2.show = true 
             bullet2.x = bulletTraj[0][localIterator]
             bullet2.y = realYToCanvasY(bulletTraj[1][localIterator])
        }
        const fireItIteratorAmount = 1
        localIterator = localIterator + fireItIteratorAmount

    }
    
    
    const localClock = () => {

        console.log('in localCLock:'+ new Date() );

        
        localLoopId = setInterval(fireItLocalLoop,frameLength)  // SEE THIS VALUE


    
        // timerID = intervalID

    }


clearInterval(localLoopId)

localClock()  // something funky here and next line




console.log('LEAVING Fireit');
}


///=========================================================================================
// INIT Grabs / GLOBAL SCOPE

const game = document.getElementById('canvas')
const angleDisplayGrab = document.getElementById('angle')
const powerDisplayGrab = document.getElementById('power')


const ctx = game.getContext('2d')

game.setAttribute('width',getComputedStyle(game)['width'])
game.setAttribute('height',getComputedStyle(game)['height'])

// testing
// const mouse = {
//     x: canvasW /2,
//     y: canvasH / 2
// }

// addEventListener('mousemove', (event) => {
//     mouse.x = event.clientX
//     mouse.y = event.clientY
// })


class TankEntity {

    // attributes that are variable, go in the constructor function
    constructor(x, y, color, width, height, angle, power, show) {

        // define here: what the object will be made of
        this.x = x,    
        this.y = y,  // HAS TO STORE AS CANVAS Y, then convert when needed
        this.color = color,
        this.width = width,
        this.height = height,
        this.angle = angle,
        this.power = power, 
        this.show = show,

        this.health = 100

        // we can also add methods
        // here our method will be render
        this.render = function() {
            // here, we will se the fillstyle and the fillrect

            // ctx.fillStyle = this.color
            // ctx.fillRect(this.x, this.y, this.width, this.height)

            const tank = new Image()
            tank.src= "img/tank.png"
            tank.onload=()=>{
            ctx.drawImage(tank, this.x, this.y) }
        }
    }
}

class TankEntityRFace {

    // attributes that are variable, go in the constructor function
    constructor(x, y, color, width, height, angle, power, show) {

        // define here: what the object will be made of
        this.x = x,    
        this.y = y,  // HAS TO STORE AS CANVAS Y, then convert when needed
        this.color = color,
        this.width = width,
        this.height = height,
        this.angle = angle,
        this.power = power, 
        this.show = show,
        dumbAiPlayer
        this.health = 100

        // we can also add methods
        // here our method will be render
        this.render = function() {
            // here, we will se the fillstyle and the fillrect

            // ctx.fillStyle = this.color
            // ctx.fillRect(this.x, this.y, this.width, this.height)

            const tank = new Image()
            tank.src= "img/tankflip.png"
            tank.onload=()=>{
            ctx.drawImage(tank, this.x, this.y) }
        }
    }
}

class BulletEntity {

    // attributes that are variable, go in the constructor function
    constructor(x, y, color, width, height, angle, power, show) {

        // define here: what the object will be made of
        this.x = x,    
        this.y = y,  // HAS TO STORE AS CANVAS Y, then convert when needed
        this.color = color,
        this.width = width,
        this.height = height,
        this.angle = angle,
        this.power = power, 
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

class TestObject {

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
            // ctx.fillRect(x, y, color, width, height,show)
            //roundedRect(ctx, 12, 12, 150, 150, 15);
        
        
        }
    }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//       constructor(x, y, color, width, height, angle, power, show)   
// ideally these values will come from the player and tanks settings

let terrain = new Terrain(0, realYToCanvasY(30),'#784212',canvasW,realYToCanvasY(40),true)

// let tank1 = new ItsOverEntity(tankPlacerX()[0], realYToCanvasY(40), 'green', 16, 10, 75, 80, true)  //!! set bullet Y here IN CANVAS XY,not real
// let tank2 = new ItsOverEntity(tankPlacerX()[1], realYToCanvasY(40),   'red', 16, 10, 90, 80, true)

// testing
let tank1 = new TankEntityRFace(tankPlacerX()[0], realYToCanvasY(40), 'green', 16, 10, 78, 93, true)  //!! set bullet Y here IN CANVAS XY,not real
let tank2 = new TankEntity(tankPlacerX()[1], realYToCanvasY(40),   'red', 16, 10, 105, 84, true)


let bullet1 = new BulletEntity(tank1.x, tank1.y, 'white', 3, 3, tank1.angle, tank1.power, false)
let bullet2 = new BulletEntity(tank2.x, tank2.y, 'white', 3, 3, tank2.angle, tank2.power, false)


let tO = new TestObject(tankPlacerX()[0], realYToCanvasY(40), 'black', 16, 10, 45, 50, true)


const fireButtonGrab = document.getElementById('fire')
fireButtonGrab.addEventListener('click',fireIt)


const w3ButtonGrab = document.getElementById('weapon3button')
w3ButtonGrab.addEventListener('click',showPowAng)

let p1Health = document.getElementById('player1HealthDiv')
let p2Health = document.getElementById('player2HealthDiv')


//##############################################################################################################
//#############################vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv#################################################
const gameLoop = () => {


    
    ctx.clearRect(0,0,game.width,game.height)

    showPowAng()
    updateHealths()

        // testing
        // ctx.fillStyle = "yellow"
        // ctx.fillRect(mouse.x,mouse.y,4,4 )

    if (bullet1.show) {
        bullet1.render()
        detectHit()

    } 

    if (bullet2.show) {
        bullet2.render()
        // detectHit()

    }

    if (tank1.show) {
        tank1.render()
    }

    if (tank2.show) {
        tank2.render()   // detecht hit WAS here but was doubling the damage
    }

    dumbAiPlayer()


    terrain.render()

    tO.render()

    if(gameOverState){
        clearInterval(gameLoopEndID)
        clearInterval(localLoopId)

    }
        
}

randomBackground()


// we're going to do this when the content loads
document.addEventListener('DOMContentLoaded' , function () {
    // we need to have movement handler
document.addEventListener('keydown',movementHandler)

gameLoopEndID = setInterval(gameLoop, frameLength)


})