const fs = require('fs');
const readline = require('readline');

class PreviousNumbers {
  constructor(lookbackWindowSize) {
    this.lookbackWindowSize = lookbackWindowSize;
    this.window = [];
  }

  addAndCheck(number) {
    if (this.window.length === this.lookbackWindowSize) {
      if (this.isSumOfPreviousWindow(number)) {
        this.window.shift();
        this.window.push(number);
        return true;
      }
      return false;
    } else {
      this.window.push(number);
      return true;
    }
  }

  isSumOfPreviousWindow(number) {
    for (let i = 0; i < this.window.length; i++) {
      for (let ii = i + 1; ii < this.window.length; ii++) {
        if (number === this.window[i] + this.window[ii]) {
          return true;
        }
      }
    }
    return false;
  }
}

async function parseInstructionsAndFindSolutions() {
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const numbers = [];

  let firstInvalidValue;
  const checker = new PreviousNumbers(25);
  // Parse preamble
  for await (const line of rl) {
    if (!firstInvalidValue) {
      const value = parseInt(line, 10);
      const isValid = checker.addAndCheck(value);
      numbers.push(value);

      if (!isValid) {
        firstInvalidValue = value;
      }
    } else {
      // We have our target value, read the rest of the numbers
      numbers.push(parseInt(line, 25));

      let maxContiguous, minContiguous;

      // Try various window sizes, slide the window
      // Yes I could probably memoize this and also the first part but I'm tired
      for (currentStart = 0; currentStart < numbers.length; currentStart++) {
        for (
          let windowSize = 2;
          windowSize + currentStart < numbers.length;
          windowSize++
        ) {
          const sum = numbers
            .slice(currentStart, currentStart + windowSize)
            .reduce((acc, curr) => acc + curr, 0);
          if (sum === firstInvalidValue) {
            const arr = numbers
              .slice(currentStart, currentStart + windowSize)
              .sort();
            minContiguous = arr[0];
            maxContiguous = arr[arr.length - 1];
            return [firstInvalidValue, minContiguous + maxContiguous];
          } else if (sum > firstInvalidValue) {
            // Short circuit, if we're already above the sum we don't need to keep adding
            break;
          }
        }
      }
    }
  }

  return null;
}

parseInstructionsAndFindSolutions().then((answer) => {
  console.log(`Part 1: ${answer[0]}`);
  console.log(`Part 2: ${answer[1]}`);
});
