const { fetch } = require("undici");
const fs = require("fs");
const path = require("path");

/**
 * Utility class to fetch Brazilian holidays from Brasil API.
 * This is a simplified version of the main BRHoliday class,
 * used only for static data generation.
 */
class staticBRHoliday {
  async getHolidays(year) {
    const holidays = await fetch(
      `https://brasilapi.com.br/api/feriados/v1/${year}`
    );
    const data = await holidays.json();
    return data;
  }
}

/**
 * Generates static holiday data for a 5-year range.
 *
 * The function:
 * 1. Creates an instance of staticBRHoliday
 * 2. Calculates the year range (current year ±2 years)
 * 3. Fetches holiday data for each year from Brasil API
 * 4. Compiles the data into a single object
 * 5. Generates a JavaScript module with the static data
 *
 * The generated file is saved to dist/data/index.js and is used
 * as a fallback data source before making API calls.
 *
 * @returns {Promise<string>} The generated JavaScript module content
 */
async function generateStaticData() {
  const brHoliday = new staticBRHoliday();
  const currentYear = new Date().getFullYear();

  // Generate array of years: [currentYear-2 ... currentYear+2]
  const years = [
    currentYear - 1,
    currentYear,
    currentYear + 1,
  ];

  const holidaysMap = {};

  // Fetch holidays for each year
  for (const year of years) {
    const holidays = await brHoliday.getHolidays(year);
    holidaysMap[year] = holidays;
  }

  // Generate JSON string to inject in index.ts
  return JSON.stringify(holidaysMap, null, 2);
}

// Execute the generation and save the result
generateStaticData()
  .then((content) => {
    const mainScriptPath = path.join(__dirname, "../src/index.ts");
    let mainScript = fs.readFileSync(mainScriptPath, "utf8");

    const staticDataBlock = `// Store static data outside of the class to avoid memory bloat
const STATIC_HOLIDAYS: Readonly<Record<number, Holiday[]>> = Object.freeze(${content});`;

    // Replace the existing static data block with the new one
    mainScript = mainScript.replace(
      /\/\/ Store static data outside of the class to avoid memory bloat\s*\nconst STATIC_HOLIDAYS: Readonly<Record<number, Holiday\[\]>> = Object\.freeze\([^;]+\);/s,
      staticDataBlock
    );

    // Write the modified main script to disk
    fs.writeFileSync(mainScriptPath, mainScript);
    console.log("Static data updated in src/index.ts with success!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
