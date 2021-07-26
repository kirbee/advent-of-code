const fs = require('fs');
const readline = require('readline');

async function parseInput() {
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  const integers = [];
  for await (const line of rl) {
    // Get all integers
    integers.push(parseInt(line, 10));
  }
  return integers
}

parseInput().then((integers) => {
  // Part 1
  console.log(integers.reduce((acc, int) => (acc + int), 0));

  // Part 2
  const frequenciesReached = new Set();

  // Initialize
  let currentFrequency = 0;
  let i = 0;

  while (true) {
    // Add current change to previous frequency
    currentFrequency += integers[i];

    // Check if this frequency has occurred before
    if (frequenciesReached.has(currentFrequency)) {
      console.log(currentFrequency);
      break;
    }
    frequenciesReached.add(currentFrequency);
    i++;

    if (i === integers.length) {
      i = 0;
    }
  }
})

