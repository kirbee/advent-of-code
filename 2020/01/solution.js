const fs = require('fs');
const readline = require('readline');

async function findTwoSum2020() {
  const numbersSoFar = {};
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    const number = parseInt(line, 10);
    const match = 2020 - number;
    if (numbersSoFar[match] === 1) {
      const answer = match * number;
      return answer;
    } else {
      numbersSoFar[number] = 1;
    }
  }
}

async function findThreeSum2020() {
  const seenValues = {}; // values seen so far
  const twoSums = {}; // all values seen so far added up pairwise
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    // Get current integer
    const currentInt = parseInt(line, 10);

    // Check if this can add to two others to make 2020
    // If so, we're done
    if (twoSums[2020 - currentInt]) {
      const [firstStored, secondStored] = twoSums[2020 - currentInt];
      return firstStored * secondStored * currentInt;
    }

    // Add this to two-sums
    Object.keys(seenValues).forEach((value) => {
      const valueInt = parseInt(value);
      // store the ints that added up to this value
      twoSums[valueInt + currentInt] = [valueInt, currentInt];
    });

    // Add to values
    seenValues[currentInt] = 1;
  }
}

findTwoSum2020().then((answer) => {
  console.log(`Part 1: ${answer}`);
});

findThreeSum2020().then((answer) => {
  console.log(`Part 2: ${answer}`);
});
