// ************************** //
// Path Finding
// ************************** //

// This module requires game.js

function findAdjacentBlocks(x, z){
    const options = [];
    // Check adjacent nodes
    if(x > 0 && level[z][x-1] != "#")
        options.push({x: -1, z: 0, name: "LEFT"});
    if(x + 1 < levelWidth && level[z][x+1] != "#")
        options.push({x: 1, z: 0, name: "RIGHT"});
    if(z > 0 && level[z-1][x] != "#")
        options.push({x: 0, z: -1, name: "DOWN"});
    if(z + 1 < levelHeight && level[z+1][x] != "#")
        options.push({x: 0, z: 1, name: "UP"});

    return options;
}

function getRandomPath(x, z){

    const ghostPos = getCoords(x, z);
    const options = findAdjacentBlocks(ghostPos.x, ghostPos.z);
    const choice = options[Math.floor(Math.random() * options.length)];
    const coords = {x: ghostPos.x + choice.x, z: ghostPos.z + choice.z};
    const path = [ {x: ghostPos.x, z: ghostPos.z}, {x: coords.x, z: coords.z}];
    var findingPath = true;

    // Find a path until next wall
    while(findingPath){
        if(
            coords.x + choice.x >= 0 && coords.x + choice.x < levelWidth && 
            coords.z + choice.z >= 0 && coords.z + choice.z < levelHeight &&
            level[coords.z + choice.z][coords.x + choice.x] != "#"
        ){
            coords.x += choice.x;
            coords.z += choice.z;
            path.push({x: coords.x, z: coords.z});
        }else{
            findingPath = false;
        }
    }

    const pathCoords = [];
    pathCoords.push(getBlockCenter(path[0].x, path[0].z));
    // Shorten the path to the next intersection
    for(var i = 1; i < path.length; i++){
        const adjacentBlocks = findAdjacentBlocks(path[i].x, path[i].z);
        pathCoords.push(getBlockCenter(path[i].x, path[i].z));
        if(adjacentBlocks.length > 2){
            break
        }
    }
    return pathCoords;
}

function getMapCopy(){
    var map = [];
    var line = [];
    for(var i = 0; i < level.length; i++){
        line = [];
        for(var k = 0; k < level[0].length; k++){
            line.push(level[i][k]);
        }
        map.push(line);
    }
    return map;
}

function getShortestPathTo(x, z, destX, destZ){
    // Adapted from
    // https://medium.com/@manpreetsingh.16.11.87/shortest-path-in-a-2d-array-java-653921063884
    
    // Copy the map to a new variable (Shallow copy)
    var map = getMapCopy();

    // Get position in the map
    const destPos = getCoords(destX, destZ);
    const ghostPos = getCoords(x, z);

    if(ghostPos.x == destPos.x && ghostPos.z == destPos.z){
        return [getBlockCenter(ghostPos.x,ghostPos.z)];
    }

    // Create a queue with nodes
    const sourceNode = {x: ghostPos.x, z: ghostPos.z, previous: null};
    const queue = [sourceNode];
    var popedNode, tries = 0;
    
    //console.log("Finding path from [" + x + ", " + z + "] to [" + destX + ", " + destZ + "]")
    while(queue.length > 0){
        tries++;
        popedNode = queue.shift();

        // Check if this Node represents the block pacman is in
        if(popedNode.x == destPos.x && popedNode.z == destPos.z){
            console.log("Found a path to [" + destX + ", " + destZ + "] after searching " + tries + " blocks.");
            //printPath(generatePath(popedNode));
            return generatePath(popedNode);
        }
        //console.log(popedNode)

        // Mark as a wall because it's "unwakable"
        map[popedNode.z][popedNode.x] = "#";

        // Add adjacent nodes
        if(popedNode.x > 0 && map[popedNode.z][popedNode.x-1] != "#")
            queue.push({x: popedNode.x-1, z: popedNode.z, previous: popedNode});
        if(popedNode.x + 1 < levelWidth && map[popedNode.z][popedNode.x+1] != "#")
            queue.push({x: popedNode.x+1, z: popedNode.z, previous: popedNode});
        if(popedNode.z > 0 && map[popedNode.z-1][popedNode.x] != "#")
            queue.push({x: popedNode.x, z: popedNode.z-1, previous: popedNode});
        if(popedNode.z + 1 < levelHeight && map[popedNode.z+1][popedNode.x] != "#")
            queue.push({x: popedNode.x, z: popedNode.z+1, previous: popedNode});

    }

    console.log("Couldn't find a path from [" + x + ", " + z + "] to [" + destX + ", " + destZ + "] after searching " + tries + " blocks.");
    return [];
}

function getPathToCorner(x, z){
    // Finds shortest path to the closest corner
    var quarter = "";
    // Find which quarter of the map it is
    if(z > levelHeightCoord / 2)
        quarter += "TOP";
    else    
        quarter += "BOTTOM";
    if(x > levelWidthCoord / 2)
        quarter += "_LEFT";
    else    
        quarter += "_RIGHT";    
    var block;
    switch(quarter){
        case "TOP_RIGHT":
            block = getClosestBlockTo(levelWidth-1,0);
            break;
        case "TOP_LEFT":
            block = getClosestBlockTo(0, 0);
            break;
        case "BOTTOM_RIGHT":
            block = getClosestBlockTo(levelWidth-1,levelHeight-1);
            break;
        case "BOTTOM_LEFT":
            block = getClosestBlockTo(0, levelHeight-1);
            break;
    }

    block = getBlockCenter(block.x, block.z);

    return getShortestPathTo(x, z, block.x, block.z);
}

function getPathToNear(x, z, destX, destZ, minDistance){

}

function getClosestBlockTo(x, z){
    // returns the closest walkable block to the coordinates
    var map = getMapCopy();

    if(map[z][x] != "#" && map[z][x] != "-")
        return({x: x, z: z});

    // Create a queue with nodes
    const sourceNode = {x: x, z: z, previous: null};
    const queue = [sourceNode];
    var popedNode;
    
    while(queue.length > 0){
        popedNode = queue.shift();

        if(popedNode.x < 0 || popedNode.x >= levelWidth || popedNode.z < 0 || popedNode.z >= levelHeight)
            continue;
        if(map[popedNode.z][popedNode.x] != "#" && map[popedNode.z][popedNode.x] != "-" && map[popedNode.z][popedNode.x] != "X"){
            return({x: popedNode.x, z: popedNode.z});
        }

        // Mark as a walked to not repeat blocks
        map[popedNode.z][popedNode.x] = "X";
        // TopLeft, TopRight, BottomLeft, BottomRight
        if(popedNode.x > 0 && popedNode.z > 0 
            && map[popedNode.z-1][popedNode.x-1] != "X")
            queue.push({x: popedNode.x-1, z: popedNode.z-1, previous: popedNode});

        if(popedNode.x + 1 < levelWidth && popedNode.z > 0 
            && map[popedNode.z-1][popedNode.x+1] != "X")
            queue.push({x: popedNode.x+1, z: popedNode.z, previous: popedNode});

        if(popedNode.z + 1 < levelHeight && popedNode.x > 0
            && map[popedNode.z+1][popedNode.x-1] != "X")
            queue.push({x: popedNode.x, z: popedNode.z-1, previous: popedNode});

        if(popedNode.z + 1 < levelHeight && popedNode.x + 1 < levelWidth
            && map[popedNode.z+1][popedNode.x+1] != "X")
            queue.push({x: popedNode.x, z: popedNode.z-1, previous: popedNode});
        // Left, Right, Up, Down
        if(popedNode.x > 0 && map[popedNode.z][popedNode.x-1] != "X")
            queue.push({x: popedNode.x-1, z: popedNode.z, previous: popedNode});

        if(popedNode.x + 1 < levelWidth && map[popedNode.z][popedNode.x+1] != "X")
            queue.push({x: popedNode.x+1, z: popedNode.z, previous: popedNode});

        if(popedNode.z > 0 && map[popedNode.z-1][popedNode.x] != "X")
            queue.push({x: popedNode.x, z: popedNode.z-1, previous: popedNode});

        if(popedNode.z + 1 < levelHeight && map[popedNode.z+1][popedNode.x] != "X")
            queue.push({x: popedNode.x, z: popedNode.z+1, previous: popedNode});

    }

    console.log("Couldn't find a walkable block");
    return [];
}

function generatePath(pathNode){
    // Generates the path from a path node
    const path = [];
    path.push(getBlockCenter(pathNode.x,pathNode.z));
    while(pathNode.previous){
        path.push(getBlockCenter(pathNode.previous.x,pathNode.previous.z));
        pathNode = pathNode.previous;
    }
    return path.reverse();
}

function printPath(path){
    var pathString = "";
    path.forEach((block) => {
            pathString += "["+ block.x + ", " + block.z + "] => ";
        });
    console.log(pathString.substring(0, pathString.length -4));
}

function lerp (start, end, amount){
    // Taken from https://codepen.io/ma77os/pen/OJPVrP
    return (1-amount) * start + amount * end;
}