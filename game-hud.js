// ************************** //
// HUD events
// ************************** //

// This module requires game.js

// Event Listeners


document.getElementById("start-game").onclick = startGame;
document.getElementById("continue-game").onclick = continueGame;
document.getElementById("restart-game").onclick = restartGame;
document.getElementById("next-game").onclick = nextLevel;
document.getElementById("leave-game").onclick = leaveGame;
document.getElementById("leave-game-2").onclick = leaveGame;
document.getElementById("leave-game-3").onclick = leaveGame;
document.getElementById("leave-game-4").onclick = leaveGame;
document.getElementById("load-level").onclick = loadGameLevel;

document.getElementById('dynamic-camera').addEventListener('change', (event) => {
  toggleDynamicCamera(event);
})
document.getElementById('mouse-rotation').addEventListener('change', (event) => {
  toggleMouseRotation(event);
})
document.getElementById('volume').addEventListener('change', (event) => {
  changeVolume(event);
})

"change mousewheel keyup keydown".split(" ").forEach( (e) => {
    document.getElementById('sensitivity').addEventListener(e, (event) => {
        changeSensitivity(event);
    })
});

function startGame(){
    if(!gameIsReady)
        return;
    console.log("Starting game");
    document.getElementById("start-menu").style.display = "none";
    document.getElementById("score").innerHTML = "Points: " + points;
    document.getElementById("timer").innerHTML = "Time: " + Math.floor(gameTimer);
    document.getElementById("lives").innerHTML = "Lives: " + lives;
    document.getElementById("lives").style.color = "aliceblue";
    gamePaused = false;
    element.requestPointerLock();
    playRespawnSound();
}

function pauseGame(){
    if(!isAlive)
        return;
    console.log("Pausing game");
    document.exitPointerLock();
    gamePaused = true;
    document.getElementById("pause-menu").style.display = "block";
}

function restartGame(){
    console.log("Restarting game");
    powerUpLimit = 0;
    checkPowerUp();
    loadLevel(levelMapName);
}

function continueGame(){
    console.log("Unpausing game");
    gamePaused = false;
    document.getElementById("pause-menu").style.display = "none";
    element.requestPointerLock();
}

function leaveGame(){
    console.log("Leaving game");
    powerUpLimit = 0;
    checkPowerUp();
    clearGame();
    document.getElementById("win-menu").style.display = "none";
    document.getElementById("game-over").style.display = "none";
    document.getElementById("pause-menu").style.display = "none";
    document.getElementById("score").innerHTML = "";
    document.getElementById("timer").innerHTML = "";
    document.getElementById("lives").innerHTML = "";
    document.getElementById("main-menu").style.display = "block";
    document.getElementById("side-menu").style.display = "block";
    document.getElementById("side-menu2").style.display = "block";
}

function loadGameLevel(){
    const baseName = "map-";
    document.getElementById("main-menu").style.display = "none";
    document.getElementById("side-menu").style.display = "none";
    document.getElementById("side-menu2").style.display = "none";
    for(var i = 1; i <= levels.howManyLevels(); i++){
        if(document.getElementById(baseName + i).classList.contains("active")){
            loadLevel(levels.getLevelNameByNum(i));
            break;
        }
    }
    
}

function toggleDynamicCamera(event){
    if (event.currentTarget.checked)
        dynamicCamera = true;
    else
        dynamicCamera = false;
}

function toggleMouseRotation(event){
    if (event.currentTarget.checked)
        mouseRotation = true;
    else
        mouseRotation = false;
}

function changeSensitivity(event){
    sensitivityX = event.target.value / 10000;
}

function changeVolume(event){
    soundVolume = event.target.value;
    document.getElementById("volume-label").innerHTML = "Volume: " + Math.floor(soundVolume * 100);
}
