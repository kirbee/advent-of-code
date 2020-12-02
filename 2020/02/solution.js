const fs = require('fs');
const readline = require('readline');

const regex = /(\d*)\-(\d*) (\w)\: (\w*)/;

async function numValidPasswordsPart1() {
  let validSoFar = 0;
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    // parse with regex
    // format:
    // "4-10 z: vhkrzzcbzzrzdcq"
    [all, min, max, letter, password] = regex.exec(line);
    const count = password.split('').filter((char) => char === letter).length;
    if (count >= parseInt(min, 10) && count <= parseInt(max, 10)) {
      validSoFar++;
    }
  }
  return validSoFar;
}

async function numValidPasswordsPart2() {
  let validSoFar = 0;
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    // parse with regex
    // format:
    // "4-10 z: vhkrzzcbzzrzdcq"
    [all, index1, index2, letter, password] = regex.exec(line);
    const zeroIndex1 = parseInt(index1, 10) - 1; // get zero-indexed
    const zeroIndex2 = parseInt(index2, 10) - 1; // get zero-indexed
    const validAtIndex1 = password[zeroIndex1] === letter;
    const validAtIndex2 = password[zeroIndex2] === letter;

    // bitwise xor
    if (validAtIndex1 ^ validAtIndex2) {
      validSoFar++;
    }
  }
  return validSoFar;
}

numValidPasswordsPart1().then((answer) => {
  console.log(`Part 1: ${answer}`);
});

numValidPasswordsPart2().then((answer) => {
  console.log(`Part 2: ${answer}`);
});
