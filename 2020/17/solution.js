const fs = require('fs');
const readline = require('readline');

const [one, two, inputFile] = process.argv;
const fileName = inputFile || './input.txt';
// fileName = '/Users/kirbee/workspace/advent-of-code/2020/17/small.txt';

const ACTIVE = '#';

class GridItem3D {
  constructor(x, y, z, isActive) {
    this.x = parseInt(x, 10);
    this.y = parseInt(y, 10);
    this.z = parseInt(z, 10);
    this.isActive = isActive;
    this.neighbours = this.getNeighbours();
  }

  getNeighbours() {
    let result = [];
    for (let xVal = this.x - 1; xVal < this.x + 2; xVal++) {
      for (let yVal = this.y - 1; yVal < this.y + 2; yVal++) {
        for (let zVal = this.z - 1; zVal < this.z + 2; zVal++) {
          if (xVal === this.x && yVal === this.y && zVal === this.z) {
          } else {
            result.push(this.getKey(xVal, yVal, zVal));
          }
        }
      }
    }
    return result;
  }

  getDimensions() {
    return 3;
  }

  getKey(x, y, z) {
    x = typeof x !== 'number' ? this.x : x;
    y = typeof y !== 'number' ? this.y : y;
    z = typeof z !== 'number' ? this.z : z;

    return `${x},${y},${z}`;
  }

  setIsActive(isActive) {
    this.isActive = isActive;
  }
}

class GridItem4D {
  constructor(x, y, z, w, isActive) {
    this.x = parseInt(x, 10);
    this.y = parseInt(y, 10);
    this.z = parseInt(z, 10);
    this.w = parseInt(w, 10);
    this.isActive = isActive;
    this.neighbours = this.getNeighbours();
  }

  getNeighbours() {
    let result = [];
    for (let xVal = this.x - 1; xVal < this.x + 2; xVal++) {
      for (let yVal = this.y - 1; yVal < this.y + 2; yVal++) {
        for (let zVal = this.z - 1; zVal < this.z + 2; zVal++) {
          for (let wVal = this.w - 1; wVal < this.w + 2; wVal++) {
            if (
              xVal === this.x &&
              yVal === this.y &&
              zVal === this.z &&
              wVal === this.w
            ) {
            } else {
              result.push(this.getKey(xVal, yVal, zVal, wVal));
            }
          }
        }
      }
    }
    return result;
  }

  getDimensions() {
    return 4;
  }

  getKey(x, y, z, w) {
    x = typeof x !== 'number' ? this.x : x;
    y = typeof y !== 'number' ? this.y : y;
    z = typeof z !== 'number' ? this.z : z;
    w = typeof w !== 'number' ? this.w : w;

    return `${x},${y},${z},${w}`;
  }

  setIsActive(isActive) {
    this.isActive = isActive;
  }
}

const countActive = (gridMap) => {
  let result = 0;
  gridMap.forEach((item) => {
    if (item.isActive) {
      // console.log(item.getKey());
      result++;
    }
  });

  return result;
};

const shouldSetActive = (item, activeNeighbours) => {
  if (item.isActive) {
    if (activeNeighbours === 3 || activeNeighbours === 2) {
      return true;
    } else {
      return false;
    }
  } else {
    if (activeNeighbours === 3) {
      return true;
    } else {
      return false;
    }
  }
};

const createGridItems = (stringArr, dimensions = 3) => {
  const result = new Map();
  stringArr.forEach((row, yValue) => {
    row.split('').forEach((item, xValue) => {
      let gridItem;
      if (dimensions === 4) {
        gridItem = new GridItem4D(xValue, yValue, 0, 0, item === ACTIVE);
      } else {
        gridItem = new GridItem3D(xValue, yValue, 0, item === ACTIVE);
      }
      result.set(gridItem.getKey(), gridItem);
    });
  });
  return result;
};

const countActiveNeighbours = (item, grid) => {
  return item.neighbours
    .map((neighbour) => {
      if (grid.has(neighbour)) {
        if (grid.get(neighbour).isActive) {
          return 1;
        }
        return 0;
      }
      return 0;
    })
    .reduce((acc, item) => acc + item, 0);
};

const getCopy = (gridItem) => {
  if (typeof gridItem.w !== 'undefined') {
    return new GridItem4D(
      gridItem.x,
      gridItem.y,
      gridItem.z,
      gridItem.w,
      gridItem.isActive
    );
  } else {
    return new GridItem3D(
      gridItem.x,
      gridItem.y,
      gridItem.z,
      gridItem.isActive
    );
  }
};

const simulateGrid = (gridItems) => {
  let gridWithNeighbours = new Map();

  // Add any new items
  gridItems.forEach((gridItem) => {
    const baseActiveNeighbours = countActiveNeighbours(gridItem, gridItems);
    if (shouldSetActive(gridItem, baseActiveNeighbours)) {
      const newBaseItem = getCopy(gridItem);
      newBaseItem.setIsActive(true);
      gridWithNeighbours.set(newBaseItem.getKey(), newBaseItem);
    }
    gridItem.neighbours.forEach((neighbour) => {
      let neighbourItem;
      if (!gridItems.has(neighbour)) {
        const coordinates = neighbour.split(',');
        if (coordinates.length === 4) {
          [x, y, z, w] = coordinates;
          neighbourItem = new GridItem4D(x, y, z, w, false);
        } else {
          [x, y, z] = coordinates;
          neighbourItem = new GridItem3D(x, y, z, false);
        }
      } else {
        neighbourItem = gridItems.get(neighbour);
      }
      const activeNeighbours = countActiveNeighbours(neighbourItem, gridItems);
      const newItem = getCopy(neighbourItem);
      newItem.setIsActive(shouldSetActive(neighbourItem, activeNeighbours));
      if (newItem.isActive) {
        gridWithNeighbours.set(newItem.getKey(), newItem);
      }
    });
  });

  return gridWithNeighbours;
};

async function parseMemoryStuff() {
  const fileStream = fs.createReadStream(`${fileName}`);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const initialConfig = [];
  for await (const line of rl) {
    initialConfig.push(line);
  }

  let grid3d = createGridItems(initialConfig);
  let grid4d = createGridItems(initialConfig, 4);
  let numIterations = 0;
  let newGrid3d;
  let newGrid4d;

  // console.log('here');
  // console.log(countActiveNeighbours(grid.get('0,2,0'), grid));
  // // console.log(grid.get('2,2,0').neighbours);
  // // console.log(grid.get('2,1,0').isActive);
  // // console.log(grid.get('1,2,0').isActive);
  // grid = simulateGrid(grid);
  while (numIterations <= 5) {
    newGrid3d = simulateGrid(grid3d);
    grid3d = newGrid3d;

    newGrid4d = simulateGrid(grid4d);
    grid4d = newGrid4d;

    numIterations++;
  }

  console.log(countActive(grid3d), countActive(grid4d));

  return [1, 2];
}

parseMemoryStuff().then((result) => {
  console.log('Part 1:', result[0]);
  console.log('Part 2:', result[1]);
});
