const fs = require('fs');
const readline = require('readline');

const [one, two, inputFile] = process.argv;
let fileName = inputFile || './input.txt';

const rules = {};

class StringRule {
  constructor(id, string) {
    this.string = string;
    this.id = id;
  }

  matchRule(string) {
    const found = string.indexOf(this.string) === 0;
    if (found) {
      return {isFound: true, match: this.string, remainder: string.slice(1)}
    } else {
      return {isFound: false}
    }
  }
}

class SimpleReferenceRule {
  constructor(id, references) {
    this.id = id;
    this.references = references;
  }

  matchRule(string) {
    const total = this.references.reduce((acc, reference) => {
      const rule = rules[reference];
      const result = rule.matchRule(acc.remainder || string);
      if (result.isFound) {
        return {isFound: acc.isFound && true, match: result.match, remainder: result.remainder || ''}
      } else {
        return {isFound: false}
      }
    }, {isFound: true, match: '', remainder: string})

      return total;
  }
}

class OrReferenceRule {
  constructor(id, references) {
    this.id = id;
    this.references = this.createReferences(references)
  }

  // Comes in as nested multiple arrays
  // 1 2 | 2 3 => 
  // [[1, 2], [2,3]]
  createReferences(arrReferences) {
    return arrReferences.map((arr, index) => {
      return new SimpleReferenceRule(this.id + index, arr)
    })
  }

  matchRule(string) {
    let match = {isFound: false};
    this.references.forEach((referenceRule) => {
      const result = referenceRule.matchRule(string)
      if(result.isFound) {
        match = result;
      }
    })
    return match;
  }
}

const stringRuleRegex = /(\d+): "(\w+)"/
const referenceRuleRegex = /(\d+): ([\d\s]*)$/
const referenceRuleOrRegex = /(\d+): ([\d\s]*) \| ([\d\s]*)$/

async function fixShitSatteliteImages() {
  const fileStream = fs.createReadStream(`${fileName}`);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let hasParsedAllRules = false;
  const testStrings = [];
  const passingStrings = [];
  for await (const line of rl) {
    if (!hasParsedAllRules) {
      const stringTest = stringRuleRegex.exec(line);
      if (stringTest) {
        const [all, id, string] = stringTest;
        rules[id] = new StringRule(id, string);
      } 
      const refTest = referenceRuleRegex.exec(line);
      if (refTest) {
        const [all, id, references] = refTest
        rules[id] = new SimpleReferenceRule(id, references.split(' '));
      }
      const refOrTest = referenceRuleOrRegex.exec(line);
      if (refOrTest) {
        const [all, id, reference1, reference2] = refOrTest
        rules[id] = new OrReferenceRule(id, [reference1.split(' '), reference2.split(' ')]);
      }
    } else {
      testStrings.push(line);
    }
    if (line === '') {
      hasParsedAllRules = true;
    }
  }

  testStrings.forEach(string => {
    const resultPart1 = rules[0].matchRule(string);
    if (resultPart1.isFound && resultPart1.remainder === '') {
      passingStrings.push(string);
    }
  })

  console.log(`Part 1: ${passingStrings.length}`);
}

fixShitSatteliteImages();
