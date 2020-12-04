const fs = require('fs');
const readline = require('readline');

let numPassportsWithAllFields = 0;
let numPassportsWithAllFieldsValid = 0;

const requiredFields = ['byr', 'iyr', 'eyr', 'hgt', 'hcl', 'ecl', 'pid'];

const requiredFieldRegex = {
  byr: /^(19[2-9]\d|200[0-2])$/,
  iyr: /^(201\d|2020)$/,
  eyr: /^(202\d|2030)$/,
  hgt: /^(1([5-8][0-9]|9[0-3])cm|(59|6\d|7[0-6])in)$/,
  hcl: /^#[0-9a-f]{6}$/,
  ecl: /^(amb|blu|brn|gry|grn|hzl|oth)$/,
  pid: /^\d{9}$/,
};

const hasRequiredFields = (passportData) => {
  const passportString = passportData.join(' ');
  let allPresent = true;
  requiredFields.forEach((field) => {
    if (!passportString.match(`${field}`)) {
      allPresent = false;
    }
  });
  return allPresent;
};

const areRequiredFieldsValid = (passportData) => {
  const passportString = passportData.join(' ');
  let allValid = true;
  Object.keys(requiredFieldRegex).forEach((fieldName) => {
    const fieldRegex = `${fieldName}:([^ ]*)`;
    const [_, fieldValue] = passportString.match(fieldRegex);
    if (!fieldValue.match(requiredFieldRegex[fieldName])) {
      allValid = false;
    }
  });
  return allValid;
};

const checkFieldsAndValidity = (passportData) => {
  if (hasRequiredFields(passportData)) {
    numPassportsWithAllFields++;

    if (areRequiredFieldsValid(passportData)) {
      numPassportsWithAllFieldsValid++;
    }
  }
};

async function parseAndValidatePassports() {
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let passportData = [];

  for await (const line of rl) {
    if (line !== '') {
      // Keep reading until we have all the data
      passportData.push(line);
    } else {
      // Time to parse the passport and reset the string
      checkFieldsAndValidity(passportData);
      passportData = [];
    }
  }
  // Don't forget that last one with no line break at the end!
  checkFieldsAndValidity(passportData);

  return [numPassportsWithAllFields, numPassportsWithAllFieldsValid];
}

parseAndValidatePassports().then((answer) => {
  console.log(`Part 1: ${answer[0]}`);
  console.log(`Part 2: ${answer[1]}`);
});
