const fs = require('fs');
const readline = require('readline');

const [one, two, inputFile] = process.argv;
const fileName = inputFile || './input.txt';
// fileName = '/Users/kirbee/workspace/advent-of-code/2020/17/small.txt';

const ACTIVE = '#';

class GridItem {
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

const createGridItems = (stringArr) => {
  const result = new Map();
  stringArr.forEach((row, yValue) => {
    row.split('').forEach((item, xValue) => {
      const gridItem = new GridItem(xValue, yValue, 0, item === ACTIVE);
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
  return new GridItem(gridItem.x, gridItem.y, gridItem.z, gridItem.isActive);
};

const simulateGrid = (gridItems) => {
  let gridWithNeighbours = new Map();

  // Add any new items
  gridItems.forEach((gridItem) => {
    const baseActiveNeighbours = countActiveNeighbours(gridItem, gridItems);
    console.log(shouldSetActive(gridItem, baseActiveNeighbours));
    if (shouldSetActive(gridItem, baseActiveNeighbours)) {
      const newBaseItem = getCopy(gridItem);
      newBaseItem.setIsActive(true);
      gridWithNeighbours.set(newBaseItem.getKey(), newBaseItem);
    }
    gridItem.neighbours.forEach((neighbour) => {
      let neighbourItem;
      if (!gridItems.has(neighbour)) {
        [x, y, z] = neighbour.split(',');
        neighbourItem = new GridItem(x, y, z, false);
      } else {
        neighbourItem = gridItems.get(neighbour);
      }
      if (neighbourItem.z === 2) {
        console.log('waht');
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

  let grid = createGridItems(initialConfig);
  let numIterations = 0;
  let newGrid;

  // console.log('here');
  // console.log(countActiveNeighbours(grid.get('0,2,0'), grid));
  // // console.log(grid.get('2,2,0').neighbours);
  // // console.log(grid.get('2,1,0').isActive);
  // // console.log(grid.get('1,2,0').isActive);
  // grid = simulateGrid(grid);
  while (numIterations <= 5) {
    newGrid = simulateGrid(grid);
    grid = newGrid;
    numIterations++;
  }

  console.log(countActive(newGrid));

  return [1, 2];
}

parseMemoryStuff().then((result) => {
  console.log('Part 1:', result[0]);
  console.log('Part 2:', result[1]);
});
