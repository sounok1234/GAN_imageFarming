let timerInterval = null;
let timerSeconds = 0;
/*
var timeList = [2, 4, 6, 8];
var int = Math.floor(Math.random() * 4);
*/
function pad(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

function setTime(timeInSec) {
    document.getElementById('timerDisplay').innerHTML= Math.floor(timeInSec/60).toString() + ':' + pad((timeInSec%60)).toString();
}

function startTimer(initialValue){
    console.log(timerInterval);
    if (timerInterval == null) {
        timerSeconds =  initialValue || 0;
        timerInterval = setInterval(function(){
            const timerDisplay = document.getElementById('timerDisplay');
            timerDisplay.style.fontFamily = "monospace";
            timerDisplay.style.fontSize = "2rem";
            setTime(timerSeconds);
            timerSeconds++;
            if (timerSeconds < 0) {
                window.clearTimeout(timerInterval);
            }
        }, 1000);
    }
}

function clearTimer() {
    window.clearInterval(timerInterval);
    timerInterval = null;
    timerSeconds = 0;
    setTime(0);
}

function stopTimer() {
    window.clearInterval(timerInterval);
    timerInterval = null;
    setTime(timerSeconds);
}

function resumeTimer() {
    startTimer(timerSeconds);
}