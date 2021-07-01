var fs = require("fs");
var readLine = require("readline");

//Start time of the program
const startTime = Date.now();

//Create a Hash map of english and french word
const word_mapping = fs
  .readFileSync("./documents_needed/french_dictionary.csv", {
    encoding: "utf-8",
  })
  .split("\n")
  .reduce((acc, ele) => {
    if (ele.split(",")[0].length) {
      acc[ele.split(",")[0]] = { word: ele.split(",")[1], count: 0 };
    }
    return acc;
  }, {});

//Function to find the word in hash map exist in given text file
const wordMapExists = (word) => {
  if (word_mapping[word.toLowerCase()]) {
    //if word exist increase the count
    word_mapping[word.toLowerCase()].count++;

    return word_mapping[word.toLowerCase()].word;
  }
  return null;
};

//Create a stream for fetching the file line by line
var lineReader = readLine.createInterface({
  input: fs.createReadStream("./documents_needed/t8.shakespeare.txt"),
});

var output = fs.createWriteStream(
  "./output_documents/t8.shakespeare.translated.txt"
);

var result = "";
lineReader.on("line", function (line) {
  //Regex to split the line word by word
  const regex = /\b\w+\b/gm;

  let replacedLine = line;
  while ((m = regex.exec(line)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    m.forEach((match) => {
      const wordMapExistsInDic = wordMapExists(match);
      if (wordMapExistsInDic) {
        replacedLine = replacedLine.replace(match, wordMapExistsInDic);
      }
    });
  }
  result = result + replacedLine + "\n";
});
lineReader.on("close", () => {
  output.write(result);
  fs.writeFileSync(
    "./output_documents/frequency.csv",
    "English word,French word,Frequenc\n" +
      Object.entries(word_mapping)
        .map((ele) => `${ele[0]},${ele[1]["word"]},${ele[1]["count"]}`)
        .join("\n")
  );
  const used = process.memoryUsage().heapUsed / 1024 / 1024;

  const memoryUsed = `Memory Used: ${Math.round(used * 100) / 100} MB`;
  var tempTime = Date.now() - startTime;
  const seconds = tempTime / 1000;
  const minutes = seconds / 60;
  const timeTaken = `Time to process: ${Math.round(
    minutes
  )} minutes ${seconds} seconds`;
  fs.writeFileSync(
    "./output_documents/performance.txt",
    `${timeTaken}\n${memoryUsed}`
  );
});
