// ************************** //
// Coordinates and Blocks
// ************************** //

// This module requires game.js

function getBlock(x, z){
    // Returns the level block in the given coordinates

    // Inspired from
    // https://github.com/butchler/Pacman-3D/blob/gh-pages/game.js
    const coords = getCoords(x, z);

    return(level[coords.z][coords.x]);
}

function getBlockCenter(x, z){
    return {
        x: levelWidthCoord - x * BLOCK_SIZE - BLOCK_SIZE/2,
        z: levelHeightCoord - z * BLOCK_SIZE - BLOCK_SIZE/2
    }
}

function getCoords(x, z){
    const coords = {}

    coords.x = levelWidth - Math.floor( x / BLOCK_SIZE) - 1;
    coords.z = levelHeight - Math.floor( z / BLOCK_SIZE) - 1;

    return coords;
}
