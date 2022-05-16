// ************************** //
// Sounds
// ************************** //

// This module requires game.js

// Sounds from
// https://kenney.nl/
const portalSoundsLocation = [
    "sounds/portal/forceField_000.ogg",
    "sounds/portal/forceField_001.ogg",
    "sounds/portal/forceField_002.ogg",
    "sounds/portal/forceField_003.ogg",
    "sounds/portal/forceField_004.ogg",
];
const pacmanDeathSoundsLocation = [
    "sounds/pacman/lowFrequency_explosion_000.ogg",
    "sounds/pacman/lowFrequency_explosion_001.ogg",
];
// Sounds from
// https://opengameart.org/content/512-sound-effects-8-bit-style
const ghostDeathSoundsLocation = [
    "sounds/ghost/sfx_sound_vaporizing.wav",
];
const pointSoundsLocation = [
    "sounds/point/sfx_coin_single1.wav",
    "sounds/point/sfx_coin_single2.wav",
    "sounds/point/sfx_coin_single3.wav",
    "sounds/point/sfx_coin_single4.wav",
    "sounds/point/sfx_coin_single5.wav",
    "sounds/point/sfx_coin_single6.wav",
];
const powerupSoundsLocation = [
    "sounds/powerup/sfx_sounds_fanfare1.wav",
    "sounds/powerup/sfx_sounds_fanfare2.wav",
    "sounds/powerup/sfx_sounds_fanfare3.wav",
];
const fruitSpawnSoundsLocation = [
    "sounds/fruit/sfx_sound_neutral6.wav",
];
const respawnSoundsLocation = [
    "sounds/respawn/sfx_sounds_powerup6.wav",
    "sounds/respawn/sfx_sounds_powerup12.wav",
    "sounds/respawn/sfx_sounds_powerup13.wav",
    "sounds/respawn/sfx_sounds_powerup14.wav",
];


const portalSounds = [];
const pacmanSounds = [];
const respawnSounds = [];
const ghostSounds = [];
const pointSounds = [];
const powerupSounds = [];
const fruitSpawnSounds = [];


function loadSounds(){
    portalSoundsLocation.forEach((ps) => portalSounds.push(new Audio(ps)));
    pacmanDeathSoundsLocation.forEach((ps) => pacmanSounds.push(new Audio(ps)));
    ghostDeathSoundsLocation.forEach((ps) => ghostSounds.push(new Audio(ps)));
    powerupSoundsLocation.forEach((ps) => powerupSounds.push(new Audio(ps)));
    pointSoundsLocation.forEach((ps) => pointSounds.push(new Audio(ps)));
    fruitSpawnSoundsLocation.forEach((ps) => fruitSpawnSounds.push(new Audio(ps)));
    respawnSoundsLocation.forEach((ps) => respawnSounds.push(new Audio(ps)));
}

function playPortalSound(){
    const audio = portalSounds[Math.floor(Math.random() * portalSounds.length)];
    audio.volume = soundVolume;
    audio.play();
}

function playFruitSpawnSound(){
    const audio = fruitSpawnSounds[Math.floor(Math.random() * fruitSpawnSounds.length)];
    audio.volume = soundVolume * 0.8;
    audio.play();
}

function playPowerUpSound(){
    const audio = powerupSounds[Math.floor(Math.random() * powerupSounds.length)];
    audio.volume = soundVolume;
    audio.play();
}

function playPointSound(){
    const audio = pointSounds[Math.floor(Math.random() * pointSounds.length)];
    audio.volume = soundVolume * 0.25;
    audio.play();
}

function playGhostDeadSound(){
    const audio = ghostSounds[Math.floor(Math.random() * ghostSounds.length)];
    audio.volume = soundVolume;
    audio.play();
}

function playPacmanDeadSound(){
    const audio = pacmanSounds[Math.floor(Math.random() * pacmanSounds.length)];
    audio.volume = soundVolume * 2;
    audio.play();
}
function playRespawnSound(){
    const audio = respawnSounds[Math.floor(Math.random() * respawnSounds.length)];
    audio.volume = soundVolume;
    audio.play();
}