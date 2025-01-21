const fs = require("fs");
const path = require("path");

const testData = {
  2024: [
    {
      date: "2024-01-01",
      name: "Confraternização Universal",
      type: "national",
    },
    { date: "2024-02-13", name: "Carnaval", type: "national" },
    { date: "2024-03-29", name: "Sexta-feira Santa", type: "national" },
    { date: "2024-04-21", name: "Tiradentes", type: "national" },
    { date: "2024-05-01", name: "Dia do Trabalho", type: "national" },
  ],
};

const mainScriptPath = path.join(__dirname, "../src/index.ts");
let mainScript = fs.readFileSync(mainScriptPath, "utf8");

const staticDataBlock = `/**
   * Static holiday data - defaults to test data, can be replaced during build
   * @internal
  */
  private static staticHolidays: Record<number, Holiday[]> = ${JSON.stringify(
    testData,
    null,
    2
  )};
`;

// Replace the existing static data block with the test data
mainScript = mainScript.replace(
  /\/\*\*\s*\n\s*\* Static holiday data.*?\*\/\s*\n\s*private static staticHolidays[^;]+;/s,
  staticDataBlock
);

// Write the modified main script to disk
fs.writeFileSync(mainScriptPath, mainScript);
console.log("Test data restored in src/index.ts with success!");
