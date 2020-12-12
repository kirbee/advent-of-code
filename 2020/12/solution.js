const fs = require('fs');
const readline = require('readline');

const [one, two, inputFile] = process.argv;
const fileName = inputFile || 'input';

class Ship {
  static directions = {
    N: 'N',
    E: 'E',
    S: 'S',
    W: 'W',
  };

  static directionArray = [
    this.directions.N,
    this.directions.E,
    this.directions.S,
    this.directions.W,
  ];

  constructor() {
    this.direction = Ship.directions.E;
    this.x = 0;
    this.y = 0;
  }

  move(dir, value) {
    if (dir === 'R' || dir === 'L') {
      this.updateDirection(dir, value);
    } else {
      this.updatePosition(dir, value);
    }
  }

  updateDirection(dir, value) {
    let rotationDirection = 0;
    if (dir === 'L') {
      rotationDirection = -1;
    } else if (dir === 'R') {
      rotationDirection = 1;
    }

    const rotationIndex = (value / 90) * rotationDirection;
    const currentIndex = Ship.directionArray.indexOf(this.direction);
    let directionIndex =
      (currentIndex + rotationIndex) % Ship.directionArray.length;
    if (directionIndex < 0) {
      directionIndex = 4 + directionIndex;
    }
    this.direction = Ship.directionArray[directionIndex];
  }

  updatePosition(dir, value) {
    let effectiveDir;
    if (dir == 'F') {
      effectiveDir = this.direction;
    } else {
      effectiveDir = dir;
    }

    switch (effectiveDir) {
      case Ship.directions.N:
        this.y -= value;
        break;
      case Ship.directions.S:
        this.y += value;
        break;
      case Ship.directions.E:
        this.x += value;
        break;
      case Ship.directions.W:
        this.x -= value;
    }
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }
}

class WayPointShip extends Ship {
  constructor() {
    super();
    this.waypointX = 10;
    this.waypointY = -1;
  }

  move(dir, value) {
    if (dir === 'L' || dir === 'R') {
      this.rotateWaypoint(dir, value);
    } else if (dir === 'F') {
      this.updatePosition(value);
    } else {
      this.moveWaypoint(dir, value);
    }
  }

  rotateWaypoint(dir, value) {
    const numRotations = value / 90;
    const effectiveRotations = numRotations % 4;
    const oldX = this.waypointX;
    const oldY = this.waypointY;

    switch (effectiveRotations) {
      case 1:
        // clockwise
        if (dir === 'R') {
          this.waypointX = -oldY;
          this.waypointY = oldX;
        } else {
          this.waypointX = oldY;
          this.waypointY = -oldX;
        }
        // ccw
        break;
      case 2:
        this.waypointX = -oldX;
        this.waypointY = -oldY;
        break;
      case 3:
        this.waypointY = oldX;
        this.waypointX = oldY;
        if (dir === 'R') {
          this.waypointX = oldY;
          this.waypointY = -oldX;
        } else {
          this.waypointX = -oldY;
          this.waypointY = oldX;
        }
        break;
      case 4:
        // Do nothing, 360 degrees
        break;
    }
  }

  moveWaypoint(dir, value) {
    switch (dir) {
      case Ship.directions.N:
        this.waypointY -= value;
        break;
      case Ship.directions.S:
        this.waypointY += value;
        break;
      case Ship.directions.E:
        this.waypointX += value;
        break;
      case Ship.directions.W:
        this.waypointX -= value;
    }
  }

  updatePosition(value) {
    this.x += this.waypointX * value;
    this.y += this.waypointY * value;
  }
}

async function parseNavigationInstructions() {
  const fileStream = fs.createReadStream(`./${fileName}.txt`);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const ship = new Ship();
  const wpShip = new WayPointShip();
  for await (const line of rl) {
    const instrRegex = /(\w)(\d*)/;
    const [_, dir, value] = instrRegex.exec(line);
    const numValue = parseInt(value, 10);
    ship.move(dir, numValue);
    wpShip.move(dir, numValue);
  }
  const { x, y } = ship.getPosition();
  const shipManhattanDistance = Math.abs(x) + Math.abs(y);

  const wpShipPosition = wpShip.getPosition();
  const wpShipManhattanDistance =
    Math.abs(wpShipPosition.x) + Math.abs(wpShipPosition.y);
  return [shipManhattanDistance, wpShipManhattanDistance];
}

parseNavigationInstructions().then((result) => {
  console.log(`Part 1: ${result[0]}`);
  console.log(`Part 2: ${result[1]}`);
  return result;
});
