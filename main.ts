//// INIT
led.enable(false)
led.enable(false)
let stripPins = [
    DigitalPin.P0,
    DigitalPin.P1,
    DigitalPin.P2,
    DigitalPin.P8,
    DigitalPin.P9,
    DigitalPin.P13,
    DigitalPin.P14,
    DigitalPin.P15];
let numLedsPerStrip = 6;
let stripsArr: neopixel.Strip[] = [];
for (let i = 0; i < stripPins.length; i++) {
    let strip = neopixel.create(stripPins[i], numLedsPerStrip, NeoPixelMode.RGB);
    strip.clear();
    strip.setBrightness(20)
    strip.show();
    stripsArr.push(strip);
}
//// CONSTANTS
// strips
let STRIP_L0 = stripsArr[0]
let STRIP_L1 = stripsArr[1]
let STRIP_L2 = stripsArr[2]
let STRIP_L3 = stripsArr[3]
let STRIP_R0 = stripsArr[7]
let STRIP_R1 = stripsArr[6]
let STRIP_R2 = stripsArr[5]
let STRIP_R3 = stripsArr[4]

// count
let NUM_COLS = stripsArr.length
let NUM_ROWS = numLedsPerStrip

// name
let BUTTON_A = 1
let BUTTON_B = 0

// consts
let INITIAL_LEVEL = 4

// init
let currentLayer = 0
let currentButtonA = stripsArr[0]
let currentButtonB = stripsArr[7]
let firstEntry = true
let isCorrect = false
let currentLevel = INITIAL_LEVEL
let canContinue = true
let canPress = true
let strip = stripsArr[0]
let arrInput: number[] = []
let arrCorrect: number[] = []

// color
let colButtonPressed = NeoPixelColors.Blue
let colCorrectPattern = NeoPixelColors.Orange
let colPassedLayer = NeoPixelColors.Green
let colEmpty = NeoPixelColors.Black

// time
let TIME_LIMIT = currentLevel * 500
let ICON_TIME = 200
let PATTERN_PAUSE = 200
let CORRECT_WRONG_PAUSE = 400
let INIT_DELAY = 500

// states
let TESTING = -2
let INITIALIZATION = -1
let GENERATING_PATTERN = 0
let SHOW_PATTERN = 1
let CHECKING_INPUT = 2
let CORRECT_INPUT = 3
let WRONG_INPUT = 4

//// STATE MACHINE
let state = INITIALIZATION
// state = TESTING
// state = GENERATING_PATTERN
basic.forever(function(){
    if(canContinue){
        if (state === TESTING){
            showCorrect()
        }
        
        else if (state === INITIALIZATION){
            canPress = false
            showCorrect()
            pause(INIT_DELAY)
            state = GENERATING_PATTERN
        }

        else if (state === GENERATING_PATTERN) {
            canPress = false
            getButtonStrips()
            for(let i = 0; i < currentLevel; i++){
                arrCorrect.push(randint(0, 1))
            }
            state = SHOW_PATTERN
        }

        else if (state === SHOW_PATTERN) {
            canPress = false
            pause(500)
            showPattern()
            state = CHECKING_INPUT
        }

        else if (state === CHECKING_INPUT) {
            canPress = true
            if (arrInput.length !== 0) {
                for (let j = 0; j < arrInput.length; j++) {
                    if (arrInput[j] !== arrCorrect[j]) {
                        state = WRONG_INPUT
                    } else {
                        if (j === arrCorrect.length - 1) {
                            state = CORRECT_INPUT
                        }
                    }
                }
            }
        }

        else if (state === CORRECT_INPUT) {
            canPress = false
            showPassedLayer()
            arrInput = []
            arrCorrect = []
            currentLevel = currentLevel + 1
            currentLayer = currentLayer + 1
            checkWin()
            state = GENERATING_PATTERN
        }

        else if (state === WRONG_INPUT) {
            canPress = false
            arrInput = []
            arrCorrect = []
            currentLevel = INITIAL_LEVEL
            state = GENERATING_PATTERN
        }
    }
})

//// FUNCTIONS
function showButton(button: number){
    if (button === BUTTON_A){
        currentButtonA.showColor(colCorrectPattern)
    } else if (button === BUTTON_B){
        currentButtonB.showColor(colCorrectPattern)
    }
}

function clearButton(button: number) {
    if (button === BUTTON_A) {
        currentButtonA.showColor(colEmpty)
    } else if (button === BUTTON_B) {
        currentButtonB.showColor(colEmpty)
    }
}

function showPassedLayer(){
    currentButtonA.showColor(colPassedLayer)
    currentButtonB.showColor(colPassedLayer)
}

function showCorrect(){
    for (let i = 0; i < NUM_COLS; i++){
        stripsArr[i].showColor(NeoPixelColors.Green)
    }
    pause(CORRECT_WRONG_PAUSE)
    for (let i = 0; i < NUM_COLS; i++) {
        stripsArr[i].clear()
        stripsArr[i].show()
    }
}

function showWrong(){
    for (let i = 0; i < NUM_COLS; i++) {
        stripsArr[i].showColor(NeoPixelColors.Red)
    }
    pause(CORRECT_WRONG_PAUSE)
    for (let i = 0; i < NUM_COLS; i++) {
        stripsArr[i].clear()
        stripsArr[i].show()
    }
}

function checkWin(){
    if (currentLayer === NUM_COLS/2){
        showCorrect()
        currentLayer = 0
        currentLevel = INITIAL_LEVEL
    }
}

function getButtonStrips(){
    currentButtonA = stripsArr[0 + currentLayer]
    currentButtonB = stripsArr[7 - currentLayer]
}

function clearAll(){
    for (let i = 0; i < NUM_COLS; i++){
        strip = stripsArr[i]
        strip.clear()
        strip.show()
    }
}

function showPattern(){
    for (let k = 0; k < arrCorrect.length; k++){
        pause(PATTERN_PAUSE)
        showButton(arrCorrect[k])
        pause(PATTERN_PAUSE)
        clearButton(arrCorrect[k])
    }
}

//// INPUTS
control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_A, EventBusValue.MICROBIT_EVT_ANY, function() {
    if(canPress){
        if (control.eventValue() === EventBusValue.MICROBIT_BUTTON_EVT_DOWN){
            arrInput.push(BUTTON_A)
            currentButtonA.showColor(colButtonPressed)
            canContinue = false
        } else if (control.eventValue() === EventBusValue.MICROBIT_BUTTON_EVT_UP) {
            currentButtonA.clear()
            currentButtonA.show()
            canContinue = true
        }
    }
})
control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_EVT_ANY, function () {
    if(canPress){
        if (control.eventValue() === EventBusValue.MICROBIT_BUTTON_EVT_DOWN) {
            arrInput.push(BUTTON_B)
            currentButtonB.showColor(colButtonPressed)
            canContinue = false
        } else if (control.eventValue() === EventBusValue.MICROBIT_BUTTON_EVT_UP) {
            currentButtonB.clear()
            currentButtonB.show()
            canContinue = true
        }
    }
})