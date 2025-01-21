/**
 * scripts/test-memory.js
 *
 * Detailed test to verify memory leaks
 * in the BRHoliday class, both in skipStatic mode
 * and with static fallback.
 */

// Adjust the path to correctly import the class:
const { BRHoliday } = require("../dist");

function formatMemoryUsage() {
  const mem = process.memoryUsage();
  return {
    rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    external: `${(mem.external / 1024 / 1024).toFixed(2)} MB`,
  };
}

function getMemoryValues() {
  const mem = process.memoryUsage();
  return {
    rss: mem.rss / 1024 / 1024,
    heapTotal: mem.heapTotal / 1024 / 1024,
    heapUsed: mem.heapUsed / 1024 / 1024,
    external: mem.external / 1024 / 1024,
  };
}

function calculateDelta(before, after) {
  return {
    rss: (after.rss - before.rss).toFixed(2),
    heapTotal: (after.heapTotal - before.heapTotal).toFixed(2),
    heapUsed: (after.heapUsed - before.heapUsed).toFixed(2),
    external: (after.external - before.external).toFixed(2),
  };
}

/**
 * Executes multiple getHolidays/isHoliday calls in batches,
 * with memory checkpoints between each batch.
 *
 * @param {boolean} skipStatic
 * @returns {Promise<void>}
 */
async function runMemoryTest(skipStatic) {
  console.log(`\n=== Test with skipStatic = ${skipStatic} ===`);

  // Force initial GC
  if (global.gc) {
    global.gc();
  }

  const initialMemory = getMemoryValues();
  console.log("Initial memory:", formatMemoryUsage());

  // Increase to better see possible leaks
  const TOTAL_ITERATIONS = 1000;
  const BATCH_SIZE = 200;
  const brHoliday = new BRHoliday({ skipStatic });

  for (let batch = 0; batch < TOTAL_ITERATIONS / BATCH_SIZE; batch++) {
    const batchReferences = [];

    console.log(
      `\nExecuting batch ${batch + 1}/${TOTAL_ITERATIONS / BATCH_SIZE}...`
    );

    for (let i = 0; i < BATCH_SIZE; i++) {
      const year = 2022 + Math.floor(Math.random() * 5);
      try {
        const holidays = await brHoliday.getHolidays(year);
        batchReferences.push(holidays);
        const isHoliday = await brHoliday.isHoliday(`${year}-12-25`);
        batchReferences.push(isHoliday);
      } catch (error) {
        batchReferences.push(error.message);
      }
    }

    // Force GC after each batch
    if (global.gc) {
      global.gc();
    }

    const currentMemory = getMemoryValues();
    const delta = calculateDelta(initialMemory, currentMemory);

    console.log(`Memory after batch ${batch + 1}:`, formatMemoryUsage());
    console.log(`Delta since start (MB):`, delta);

    // Clear batch references
    batchReferences.length = 0;
  }

  // Final memory after all batches
  if (global.gc) {
    global.gc();
  }

  const finalMemory = getMemoryValues();
  const totalDelta = calculateDelta(initialMemory, finalMemory);

  console.log("\nFinal result:");
  console.log("Final memory:", formatMemoryUsage());
  console.log("Total Delta (MB):", totalDelta);
}

(async () => {
  console.log("Starting detailed memory test...\n");

  // Test 1: Only API
  await runMemoryTest(true);

  // Test 2: Using static data + fallback
  await runMemoryTest(false);

  console.log("\n*** Test completed ***");
})();
