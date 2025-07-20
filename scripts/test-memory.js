/**
 * scripts/test-memory.js
 *
 * Comprehensive memory leak tests for the BRHoliday class.
 * Tests instance creation/destruction, cache behavior, and API calls.
 */

// Adjust the path to correctly import the class:
const { BRHoliday } = require("../dist");

// Memory thresholds (in MB) for leak detection
const MEMORY_THRESHOLD_INSTANCE_TEST = 10; // Max acceptable heap increase for instance test
const MEMORY_THRESHOLD_API_TEST = 20; // Max acceptable heap increase for API test
const MEMORY_THRESHOLD_STRESS_TEST = 30; // Max acceptable heap increase for stress test

// Test configuration
const INSTANCE_TEST_ITERATIONS = 10000;
const INSTANCE_TEST_LOG_INTERVAL = 1000;
const TEST_DATE = "2024-12-25"; // Sample date for testing

const API_TEST_ITERATIONS = 5000;
const API_TEST_LOG_INTERVAL = 500;
const API_TEST_YEAR_RANGE = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029];
const API_TEST_MONTH = "12";
const API_TEST_DAY = "25";

const STRESS_TEST_BATCHES = 50;
const STRESS_TEST_BATCH_SIZE = 100;
const STRESS_TEST_LOG_INTERVAL = 10;
const STRESS_TEST_API_CALL_FREQUENCY = 10;
const STRESS_TEST_YEAR_BASE = 2020;
const STRESS_TEST_YEAR_RANGE = 10;
const STRESS_TEST_MAX_MONTH = 12;
const STRESS_TEST_MAX_DAY = 28;

const TEST_DELAY_MS = 1000; // Delay between tests
const DATE_PADDING_WIDTH = 2; // Width for padding month/day strings

// Memory conversion and formatting
const BYTES_PER_MB = 1024 * 1024;
const MEMORY_DECIMAL_PLACES = 2;

function formatMemoryUsage() {
  const mem = process.memoryUsage();
  return {
    rss: `${(mem.rss / BYTES_PER_MB).toFixed(MEMORY_DECIMAL_PLACES)} MB`,
    heapTotal: `${(mem.heapTotal / BYTES_PER_MB).toFixed(MEMORY_DECIMAL_PLACES)} MB`,
    heapUsed: `${(mem.heapUsed / BYTES_PER_MB).toFixed(MEMORY_DECIMAL_PLACES)} MB`,
    external: `${(mem.external / BYTES_PER_MB).toFixed(MEMORY_DECIMAL_PLACES)} MB`,
  };
}

function getMemoryValues() {
  const mem = process.memoryUsage();
  return {
    rss: mem.rss / BYTES_PER_MB,
    heapTotal: mem.heapTotal / BYTES_PER_MB,
    heapUsed: mem.heapUsed / BYTES_PER_MB,
    external: mem.external / BYTES_PER_MB,
  };
}

function calculateDelta(before, after) {
  return {
    rss: (after.rss - before.rss).toFixed(MEMORY_DECIMAL_PLACES),
    heapTotal: (after.heapTotal - before.heapTotal).toFixed(MEMORY_DECIMAL_PLACES),
    heapUsed: (after.heapUsed - before.heapUsed).toFixed(MEMORY_DECIMAL_PLACES),
    external: (after.external - before.external).toFixed(MEMORY_DECIMAL_PLACES),
  };
}

/**
 * Test 1: Instance creation and destruction
 * Creates and destroys multiple instances to check for leaks
 */
async function testInstanceCreation() {
  console.log("\n=== Test 1: Instance Creation/Destruction ===");
  
  // Force initial GC
  if (global.gc) {
    global.gc();
  }

  const initialMemory = getMemoryValues();
  console.log("Initial memory:", formatMemoryUsage());

  for (let i = 0; i < INSTANCE_TEST_ITERATIONS; i++) {
    // Create instance, use it, then let it be garbage collected
    const brHoliday = new BRHoliday({ skipStatic: i % 2 === 0 });
    await brHoliday.isHoliday(TEST_DATE);
    
    if (i % INSTANCE_TEST_LOG_INTERVAL === 0) {
      console.log(`Created ${i} instances...`);
    }
  }

  // Force GC after all instances
  if (global.gc) {
    global.gc();
  }

  const finalMemory = getMemoryValues();
  const totalDelta = calculateDelta(initialMemory, finalMemory);

  console.log("\nFinal result:");
  console.log("Final memory:", formatMemoryUsage());
  console.log("Total Delta (MB):", totalDelta);
  
  // Check if memory increased significantly
  if (parseFloat(totalDelta.heapUsed) > MEMORY_THRESHOLD_INSTANCE_TEST) {
    console.error("⚠️  WARNING: Significant memory increase detected!");
  } else {
    console.log("✅ Memory usage stable");
  }
}

/**
 * Test 2: API calls with caching
 * Tests memory behavior with repeated API calls
 */
async function testApiCallsWithCache(skipStatic) {
  console.log(`\n=== Test 2: API Calls (skipStatic=${skipStatic}) ===`);

  // Force initial GC
  if (global.gc) {
    global.gc();
  }

  const initialMemory = getMemoryValues();
  console.log("Initial memory:", formatMemoryUsage());

  const brHoliday = new BRHoliday({ skipStatic });
  for (let i = 0; i < API_TEST_ITERATIONS; i++) {
    const year = API_TEST_YEAR_RANGE[i % API_TEST_YEAR_RANGE.length];
    try {
      await brHoliday.getHolidays(year);
      await brHoliday.isHoliday(`${year}-${API_TEST_MONTH}-${API_TEST_DAY}`);
    } catch (error) {
      // Ignore API errors for testing
    }
    
    if (i % API_TEST_LOG_INTERVAL === 0 && i > 0) {
      if (global.gc) {
        global.gc();
      }
      const currentMemory = getMemoryValues();
      const delta = calculateDelta(initialMemory, currentMemory);
      console.log(`After ${i} iterations - Delta: ${delta.heapUsed} MB`);
    }
  }

  // Force final GC
  if (global.gc) {
    global.gc();
  }

  const finalMemory = getMemoryValues();
  const totalDelta = calculateDelta(initialMemory, finalMemory);

  console.log("\nFinal result:");
  console.log("Final memory:", formatMemoryUsage());
  console.log("Total Delta (MB):", totalDelta);
  
  // Check if memory increased significantly
  if (parseFloat(totalDelta.heapUsed) > MEMORY_THRESHOLD_API_TEST) {
    console.error("⚠️  WARNING: Significant memory increase detected!");
  } else {
    console.log("✅ Memory usage stable");
  }
}

/**
 * Test 3: Stress test with parallel operations
 * Simulates real-world usage with concurrent operations
 */
async function stressTest() {
  console.log("\n=== Test 3: Stress Test with Parallel Operations ===");

  // Force initial GC
  if (global.gc) {
    global.gc();
  }

  const initialMemory = getMemoryValues();
  console.log("Initial memory:", formatMemoryUsage());

  const brHoliday = new BRHoliday();
  for (let batch = 0; batch < STRESS_TEST_BATCHES; batch++) {
    // Create parallel operations
    const promises = [];
    
    for (let i = 0; i < STRESS_TEST_BATCH_SIZE; i++) {
      const year = STRESS_TEST_YEAR_BASE + (Math.random() * STRESS_TEST_YEAR_RANGE | 0);
      const month = (Math.random() * STRESS_TEST_MAX_MONTH + 1 | 0).toString().padStart(DATE_PADDING_WIDTH, '0');
      const day = (Math.random() * STRESS_TEST_MAX_DAY + 1 | 0).toString().padStart(DATE_PADDING_WIDTH, '0');
      
      promises.push(
        brHoliday.isHoliday(`${year}-${month}-${day}`).catch(() => false)
      );
      
      if (i % STRESS_TEST_API_CALL_FREQUENCY === 0) {
        promises.push(
          brHoliday.getHolidays(year).catch(() => [])
        );
      }
    }
    
    await Promise.all(promises);
    
    if (batch % STRESS_TEST_LOG_INTERVAL === 0) {
      if (global.gc) {
        global.gc();
      }
      const currentMemory = getMemoryValues();
      const delta = calculateDelta(initialMemory, currentMemory);
      console.log(`Batch ${batch}/${STRESS_TEST_BATCHES} - Delta: ${delta.heapUsed} MB`);
    }
  }

  // Force final GC
  if (global.gc) {
    global.gc();
  }

  const finalMemory = getMemoryValues();
  const totalDelta = calculateDelta(initialMemory, finalMemory);

  console.log("\nFinal result:");
  console.log("Final memory:", formatMemoryUsage());
  console.log("Total Delta (MB):", totalDelta);
  
  // Check if memory increased significantly
  if (parseFloat(totalDelta.heapUsed) > MEMORY_THRESHOLD_STRESS_TEST) {
    console.error("⚠️  WARNING: Significant memory increase detected!");
  } else {
    console.log("✅ Memory usage stable");
  }
}

// Main test runner
(async () => {
  console.log("Starting comprehensive memory tests...");
  console.log("Node version:", process.version);
  console.log("Platform:", process.platform);
  console.log("Architecture:", process.arch);
  
  try {
    // Test 1: Instance creation
    await testInstanceCreation();
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, TEST_DELAY_MS));
    
    // Test 2: API calls with static data
    await testApiCallsWithCache(false);
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, TEST_DELAY_MS));
    
    // Test 2: API calls without static data
    await testApiCallsWithCache(true);
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, TEST_DELAY_MS));
    
    // Test 3: Stress test
    await stressTest();
    
    console.log("\n=== All tests completed ===");
    
    // Final cleanup
    if (global.gc) {
      global.gc();
    }
    
    console.log("\nFinal process memory:", formatMemoryUsage());
    
  } catch (error) {
    console.error("Test error:", error);
    process.exit(1);
  }
})();
