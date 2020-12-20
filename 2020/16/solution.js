const fs = require('fs');
const readline = require('readline');

const [one, two, inputFile] = process.argv;
const fileName = inputFile || './input.txt';

const addNumbersInRange = (start, end, set) => {
  start = parseInt(start, 10);
  end = parseInt(end, 10);
  for (let i = start; i <= end; i++) {
    set.add(i);
  }
};

const getPossibleFieldNamesByIndex = (tickets, fieldRanges) => {
  const fieldValues = [];
  const fieldOrder = [];

  tickets.forEach((ticket) => {
    ticket.forEach((fieldValue, i) => {
      if (!Array.isArray(fieldValues[i])) {
        fieldValues[i] = [];
      }
      fieldValues[i].push(fieldValue);
    });
  });

  fieldRanges.forEach((fieldRange) => {
    [start1, end1, start2, end2] = fieldRange.rangePoints;
    fieldValues.forEach((valuesArray, fieldIndex) => {
      const isCorrect = valuesArray.reduce((acc, item) => {
        if (
          (item >= start1 && item <= end1) ||
          (item >= start2 && item <= end2)
        ) {
          return true && acc;
        } else {
          return false;
        }
      }, true);
      if (isCorrect) {
        const currentValues = fieldOrder[fieldIndex];
        if (currentValues) {
          if (Array.isArray(currentValues)) {
            currentValues.push(fieldRange.name);
          } else {
            fieldOrder[fieldIndex] = [currentValues, fieldRange.name];
          }
        } else {
          fieldOrder[fieldIndex] = fieldRange.name;
        }
      }
    });
  });
  return fieldOrder;
};

async function parseMemoryStuff() {
  const fileStream = fs.createReadStream(`${fileName}`);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const fieldRegex = /([\w\s]*): (\d*)-(\d*) or (\d*)-(\d*)/;
  const fieldRanges = [];
  const validNumbers = new Set();
  const validTickets = [];
  const invalidNumbers = [];

  let myTicket;
  let isMyTicket = false;

  let isNearbyTicket = false;
  for await (const line of rl) {
    if (line === 'your ticket:') {
      isMyTicket = true;
    } else if (isMyTicket) {
      myTicket = line.split(',').map((value) => parseInt(value, 10));
      isMyTicket = false;
    } else if (line === 'nearby tickets:') {
      isNearbyTicket = true;
    } else if (isNearbyTicket) {
      const ticketValues = line.split(',');
      let isInvalid = false;
      const ticketNumbers = ticketValues.map((value) => parseInt(value, 10));
      ticketNumbers.forEach((value) => {
        if (!validNumbers.has(value)) {
          invalidNumbers.push(value);
          isInvalid = true;
        }
      });
      if (!isInvalid) {
        validTickets.push(ticketNumbers);
      }
    } else if (line === '') {
      // Do nothing
    } else {
      const [match, fieldName, start1, end1, start2, end2] = fieldRegex.exec(
        line
      );
      addNumbersInRange(start1, end1, validNumbers);
      addNumbersInRange(start2, end2, validNumbers);
      fieldRanges.push({
        name: fieldName,
        rangePoints: [start1, end1, start2, end2],
      });
    }
  }

  const part1Answer = invalidNumbers.reduce((acc, number) => acc + number, 0);
  const possibleFields = getPossibleFieldNamesByIndex(
    validTickets,
    fieldRanges
  );

  let solvedFieldOrder = [...possibleFields];
  while (true) {
    const toRemove = [];
    solvedFieldOrder.forEach((possibleFieldNames) => {
      if (!Array.isArray(possibleFieldNames)) {
        // This can only be this one, so remove it
        toRemove.push(possibleFieldNames);
      }
    });
    let allSolved = true;
    solvedFieldOrder = solvedFieldOrder.map((possibleFieldNames) => {
      if (Array.isArray(possibleFieldNames)) {
        allSolved = false;
        const arrayWithRemoved = possibleFieldNames.filter(
          (name) => !toRemove.includes(name)
        );
        return arrayWithRemoved.length === 1
          ? arrayWithRemoved[0]
          : arrayWithRemoved;
      } else {
        return possibleFieldNames;
      }
    });
    if (allSolved) {
      break;
    }
  }

  const departureFields = solvedFieldOrder
    .map((fieldName, index) =>
      fieldName.split(' ')[0] === 'departure' ? index : null
    )
    .filter((value) => value !== null);

  const part2Answer = departureFields.reduce((acc, i) => acc * myTicket[i], 1);

  return [part1Answer, part2Answer];
}

parseMemoryStuff().then((result) => {
  console.log('Part 1:', result[0]);
  console.log('Part 2:', result[1]);
});
