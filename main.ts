//// INIT
led.enable(false)
let stripArr: neopixel.Strip[] = [];
let NUM_LEDS_PER_STRIP = 6;
let PINS_ARR = [
    DigitalPin.P0,
    DigitalPin.P1,
    DigitalPin.P2,
    DigitalPin.P8,
    DigitalPin.P9,
    DigitalPin.P13,
    DigitalPin.P14,
    DigitalPin.P15];
for (let i = 0; i < PINS_ARR.length; i++) {
    let strip = neopixel.create(PINS_ARR[i], NUM_LEDS_PER_STRIP, NeoPixelMode.RGB);
    strip.clear();
    strip.setBrightness(5)
    strip.show();
    stripArr.push(strip);
}
let NUM_STRIPS = stripArr.length

// consts
let INITIAL_LEVEL = 2
let BUTTON_A = 1
let BUTTON_B = 0
let ANIM_SWIPE_OFFSET = 4

// init
let currentLayer = 0
let currentButtonA = stripArr[0]
let currentButtonB = stripArr[7]
let firstEntry = true
let isCorrect = false
let currentLevel = INITIAL_LEVEL
let canContinue = true
let canPress = true
let arrInput: number[] = []
let arrCorrect: number[] = []

// color
let colButtonPressed = NeoPixelColors.Blue
let colCorrectPattern = NeoPixelColors.Orange
let colPassedLayer = NeoPixelColors.Green
let colWrongPattern = NeoPixelColors.Red
let colInitialSwipe = NeoPixelColors.White
let colEmpty = NeoPixelColors.Black

// time
let TIME_LIMIT = currentLevel * 500
let ICON_TIME = 200
let PATTERN_PAUSE = 200
let CORRECT_WRONG_PAUSE = 400
let INIT_DELAY = 500
let ANIM_SWIPE_DELAY = 20

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
basic.forever(function(){
    if(canContinue){
        if (state === TESTING){
            animSwipe(colWrongPattern, ANIM_SWIPE_DELAY, ANIM_SWIPE_OFFSET)
            pause(1000)
        }
        
        else if (state === INITIALIZATION){
            canPress = false
            animSwipe(colInitialSwipe, ANIM_SWIPE_DELAY, ANIM_SWIPE_OFFSET)
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
            currentLayer = 0
            animSwipe(colWrongPattern, ANIM_SWIPE_DELAY, ANIM_SWIPE_OFFSET)
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

function animSwipe(color: NeoPixelColors, delay: number, offset: number){
    for (let i = 0; i < NUM_STRIPS+offset; i++){
        if (i < NUM_STRIPS){
            stripArr[i].showColor(color)
        }
        if (i >= offset){
            stripArr[i-offset].showColor(colEmpty)
        }
        pause(delay)
    }
}

function showPassedLayer(){
    currentButtonA.showColor(colPassedLayer)
    currentButtonB.showColor(colPassedLayer)
}

function showCorrect(){
    for (let i = 0; i < NUM_STRIPS; i++){
        stripArr[i].showColor(NeoPixelColors.Green)
    }
    pause(CORRECT_WRONG_PAUSE)
    for (let i = 0; i < NUM_STRIPS; i++) {
        stripArr[i].clear()
        stripArr[i].show()
    }
}

function showWrong(){
    for (let i = 0; i < NUM_STRIPS; i++) {
        stripArr[i].showColor(NeoPixelColors.Red)
    }
    pause(CORRECT_WRONG_PAUSE)
    for (let i = 0; i < NUM_STRIPS; i++) {
        stripArr[i].clear()
        stripArr[i].show()
    }
}

function checkWin(){
    showPassedLayer()
    if (currentLayer === NUM_STRIPS/2){
        animSwipe(colEmpty, ANIM_SWIPE_DELAY, ANIM_SWIPE_OFFSET-2)
        animSwipe(colPassedLayer, ANIM_SWIPE_DELAY, ANIM_SWIPE_OFFSET+4)
        currentLayer = 0
        currentLevel = INITIAL_LEVEL
    }
}

function getButtonStrips(){
    currentButtonA = stripArr[0 + currentLayer]
    currentButtonB = stripArr[7 - currentLayer]
}

function clearAll(){
    for (let i = 0; i < NUM_STRIPS; i++){
        let strip = stripArr[i]
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