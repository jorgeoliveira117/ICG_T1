// ************************** //
// Coordinates and Blocks
// ************************** //

// This module requires game.js

/**
 * Gets the block in the given coordinates
 * @param  {float} x X World coordinate of the block's position
 * @param  {float} z Z World coordinate of the block's position
 * @return {string} Block in the location
 */
function getBlock(x, z){
    // Returns the level block in the given coordinates

    // Inspired from
    // https://github.com/butchler/Pacman-3D/blob/gh-pages/game.js
    const coords = getCoords(x, z);

    return(level[coords.z][coords.x]);
}

/**
 * Gets the block center in the given coordinates
 * @param  {float} x X Map coordinate of the block's position
 * @param  {float} z Z Map coordinate of the block's position
 * @return {x: float, z: float} Block center
 */
function getBlockCenter(x, z){
    return {
        x: levelWidthCoord - x * BLOCK_SIZE - BLOCK_SIZE/2,
        z: levelHeightCoord - z * BLOCK_SIZE - BLOCK_SIZE/2
    }
}
/**
 * Gets the Map coordinates in the given World coordinates
 * @param  {float} x X World coordinate of the block's position
 * @param  {float} z Z World coordinate of the block's position
 * @return {x: float, z: float} Map coordinates
 */
function getCoords(x, z){
    const coords = {}

    coords.x = levelWidth - Math.floor( x / BLOCK_SIZE) - 1;
    coords.z = levelHeight - Math.floor( z / BLOCK_SIZE) - 1;

    return coords;
}
