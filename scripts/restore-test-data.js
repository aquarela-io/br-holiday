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
    { date: "2024-12-25", name: "Natal", type: "national" }
  ],
  2025: [
    { date: "2025-01-01", name: "Test Holiday 1", type: "national" },
    { date: "2025-12-25", name: "Test Holiday 2", type: "national" }
  ],
  2026: [
    { date: "2026-01-01", name: "Test Holiday 1", type: "national" },
    { date: "2026-12-25", name: "Test Holiday 2", type: "national" }
  ]
};

const mainScriptPath = path.join(__dirname, "../src/index.ts");
let mainScript = fs.readFileSync(mainScriptPath, "utf8");

const staticDataBlock = `// Store static data outside of the class to avoid memory bloat
const STATIC_HOLIDAYS: Readonly<Record<number, Holiday[]>> = Object.freeze(${JSON.stringify(
  testData,
  null,
  2
)});`;

// Replace the existing static data block with the test data
mainScript = mainScript.replace(
  /\/\/ Store static data outside of the class to avoid memory bloat\s*\nconst STATIC_HOLIDAYS: Readonly<Record<number, Holiday\[\]>> = Object\.freeze\([^;]+\);/s,
  staticDataBlock
);

// Write the modified main script to disk
fs.writeFileSync(mainScriptPath, mainScript);
console.log("Test data restored in src/index.ts with success!");
