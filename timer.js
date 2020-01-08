//window.onload = timer;
/*
var timeList = [2, 4, 6, 8];
var int = Math.floor(Math.random() * 4);
*/
function pad(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

function timer(){
    //console.log(timeList[int])
    var sec = 0;
    var timer = setInterval(function(){
        document.getElementById("safeTimerDisplay").style.fontFamily = "Impact,Charcoal,sans-serif";
        document.getElementById("safeTimerDisplay").style.fontSize = "xx-large";
        document.getElementById('safeTimerDisplay').innerHTML= Math.floor(sec/60).toString() + ':' + pad((sec%60)).toString();
        sec++;
        if (sec < 0) {
            window.clearTimeout(timer);
        }
    }, 1000);
}