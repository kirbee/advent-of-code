const fs = require('fs');
const readline = require('readline');

const [one, two, inputFile] = process.argv;
const fileName = inputFile || './input.txt';

getBitmaskedValue = (bitmask, value) => {
  const leadingZeroes = bitmask.length - value.length;
  const valueArr = [...new Array(leadingZeroes).fill(0), ...value.split('')];
  const bitmaskArr = bitmask.split('');

  return bitmaskArr
    .map((bitmaskBit, index) => {
      switch (bitmaskBit) {
        case 'X':
          return valueArr[index];
        case '1':
          return 1;
        case '0':
          return 0;
      }
    })
    .join('');
};

const getBitStringFromDecimalString = (value) =>
  parseInt(value, 10).toString(2);

const sumMemoryBitz = (memory) => {
  return Object.keys(memory).reduce((acc, key) => {
    if (!isNaN(parseInt(memory[key], 2))) {
      return acc + parseInt(memory[key], 2);
    }
    return acc;
  }, 0);
};

const getMemoryToWrite = (bitmask, addr) => {
  const leadingZeroes = 36 - addr.length;
  const addrArr = [...new Array(leadingZeroes).fill(0), ...addr.split('')];

  let values = [];
  for (let i = 0; i < bitmask.length; i++) {
    let possibleValues;
    switch (bitmask[i]) {
      case 'X':
        possibleValues = [1, 0];
        break;
      case '1':
        possibleValues = [1];
        break;
      case '0':
        possibleValues = [addrArr[i]];
        // console.log(i, addrArr, bitmask[i]);
        break;
    }
    values.push(possibleValues);
  }
  let finalValues = [];
  values.forEach((intArray) => {
    let finalValuesTemp = [];
    if (finalValues.length === 0) {
      finalValuesTemp = [...intArray];
    } else {
      finalValues.forEach((currentValue) => {
        intArray.forEach((bit) => {
          finalValuesTemp.push(`${currentValue}${bit}`);
        });
      });
    }
    finalValues = finalValuesTemp;
  });
  console.log(
    Math.pow(2, bitmask.split('').filter((i) => i === 'X').length),
    finalValues.length
  );

  // console.log(finalValues);
  return finalValues;
};

async function parseMemoryStuff() {
  const fileStream = fs.createReadStream(`${fileName}`);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const bitMaskRegex = /mask = ([01X]*)/;
  const memRegex = /mem\[(\d*)\] = ([\d]*)/;

  let bitmask;
  const memory = {};
  const volatileMemory = {};
  for await (const line of rl) {
    if (bitMaskRegex.exec(line)) {
      bitmask = bitMaskRegex.exec(line)[1];
    } else {
      const [_, addr, value] = memRegex.exec(line);

      // Part 1
      memory[addr] = getBitmaskedValue(
        bitmask,
        getBitStringFromDecimalString(value)
      );

      // Part 2
      const memoryToWrite = getMemoryToWrite(
        bitmask,
        getBitStringFromDecimalString(addr)
      );
      memoryToWrite.forEach((addr) => {
        volatileMemory[addr] = value;
      });
    }
  }

  const result = sumMemoryBitz(memory);
  const result2 = Object.keys(volatileMemory).reduce(
    (acc, curr) => acc + parseInt(volatileMemory[curr], 10),
    0
  );

  return [result, result2];
}

parseMemoryStuff().then((result) => {
  console.log('Part 1:', result[0]);
  console.log('Part 2:', result[1]);
});
