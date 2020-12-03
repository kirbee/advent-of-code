const fs = require('fs');
const readline = require('readline');

const TREE = '#';

class TobogganPosition {
  constructor(moveX, moveY, width) {
    this.x = 0;
    this.y = 0;
    this.moveX = moveX;
    this.moveY = moveY;
    this.width = width;
    this.nextY = 1;
  }

  updatePosition() {
    if (this.nextY % this.moveY === 0) {
      this.moved = true;
      const newX = this.x + this.moveX;
      this.x = newX >= this.width ? newX % this.width : newX;
      this.y += this.moveY;
    } else {
      this.moved = false;
    }
    this.nextY++;
  }

  getMoved() {
    return this.moved || false;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }
}

async function readAndTobboggan() {
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let positions;
  let length;
  let slopes = [
    [1, 1],
    [3, 1],
    [5, 1],
    [7, 1],
    [1, 2],
  ];
  let trees = {};

  for await (const line of rl) {
    if (!length) {
      // init
      length = line.length;
      positions = slopes.map((slope) => {
        [moveX, moveY] = slope;
        return new TobogganPosition(moveX, moveY, length);
      });
    }

    const currentYTopo = line.split('');
    positions.forEach((position, index) => {
      if (currentYTopo[position.getX()] === TREE && position.getMoved()) {
        trees = { ...trees, [index]: (trees[index] || 0) + 1 };
      }
      position.updatePosition();
    });
  }
  return trees;
}

readAndTobboggan().then((answer) => {
  console.log(`Part 1: ${answer[1]}`);
  console.log(
    `Part 2: ${Object.keys(answer).reduce(
      (acc, curr) => acc * answer[curr],
      1
    )}`
  );
});
