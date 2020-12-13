const fs = require('fs');
const readline = require('readline');

const [one, two, inputFile] = process.argv;
const fileName = inputFile || './input.txt';

class OffsetBus {
  constructor(id, index) {
    this.id = id;
    this.index = index;
  }

  getId() {
    return this.id;
  }

  getIndex() {
    return this.index;
  }

  isValidTimestamp(timestamp) {
    return (this.index + timestamp) % this.id === 0;
  }
}

const getBusAndTimeOfShortestWait = (departureTime, buses) => {
  return buses
    .filter((item) => item !== 'x')
    .reduce((acc, bus) => {
      const waitTime = -(departureTime % bus) + bus;
      if (acc) {
        if (waitTime < acc.waitTime) {
          return { bus, waitTime };
        }
        return acc;
      }
      return { bus, waitTime };
    }, null);
};

const combineBuses = (busMap) => {
  if (busMap.length === 1) {
    return busMap[0];
  }
  const largestBus = busMap.reduce((acc, bus) => {
    if (bus.getId() > acc.getId()) {
      return bus;
    }
    return acc;
  }, new OffsetBus(0, 0));
  const secondLargestBus = busMap.reduce((acc, bus) => {
    if (bus.getId() > acc.getId() && bus.getId() !== largestBus.getId()) {
      return bus;
    }
    return acc;
  }, new OffsetBus(0, 0));
  const validInterval = getValidTimeBetweenTwoBuses(
    largestBus,
    secondLargestBus
  );
  // create a new bus out of these largest buses, and then search using that
  const newBus = new OffsetBus(
    secondLargestBus.getId() * largestBus.getId(),
    -validInterval
  );
  const finalBuses = busMap.filter(
    (bus) =>
      bus.getId() !== secondLargestBus.getId() &&
      bus.getId() !== largestBus.getId()
  );
  return combineBuses([...finalBuses, newBus]);
};

const getValidTimeBetweenTwoBuses = (bus1, bus2) => {
  let factor = 1;
  while (true) {
    const testTimestamp = factor * bus1.getId() - bus1.getIndex();
    const isValidTimestamp = bus2.isValidTimestamp(testTimestamp);
    if (isValidTimestamp) {
      return testTimestamp;
    }
    factor += 1;
  }
};

async function parseBusStuff() {
  const fileStream = fs.createReadStream(`${fileName}`);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let timeToLeave;
  let buses;
  for await (const line of rl) {
    if (!timeToLeave) {
      timeToLeave = parseInt(line, 10);
    } else {
      buses = line
        .split(',')
        .map((string) => (string !== 'x' ? parseInt(string, 10) : 'x'));
    }
  }
  return [timeToLeave, buses];
}

parseBusStuff().then((result) => {
  const [timeToLeave, buses] = result;
  const shortestWaitTime = getBusAndTimeOfShortestWait(timeToLeave, buses);
  const combinedBus = combineBuses(
    buses
      .map((id, index) => new OffsetBus(id, index))
      .filter((bus) => bus.getId() !== 'x')
  );
  const sequentialTimestamp = Math.abs(combinedBus.getIndex());

  console.log('Part 1:', shortestWaitTime.bus * shortestWaitTime.waitTime);
  console.log('Part 2:', sequentialTimestamp);
});
