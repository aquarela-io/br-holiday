/**
 * scripts/test-memory.js
 *
 * Comprehensive memory leak tests for the BRHoliday class.
 * Tests instance creation/destruction, cache behavior, and API calls.
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

  const ITERATIONS = 10000;

  for (let i = 0; i < ITERATIONS; i++) {
    // Create instance, use it, then let it be garbage collected
    const brHoliday = new BRHoliday({ skipStatic: i % 2 === 0 });
    await brHoliday.isHoliday("2024-12-25");
    
    if (i % 1000 === 0) {
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
  if (parseFloat(totalDelta.heapUsed) > 10) {
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
  const ITERATIONS = 5000;
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029];

  for (let i = 0; i < ITERATIONS; i++) {
    const year = years[i % years.length];
    try {
      await brHoliday.getHolidays(year);
      await brHoliday.isHoliday(`${year}-12-25`);
    } catch (error) {
      // Ignore API errors for testing
    }
    
    if (i % 500 === 0 && i > 0) {
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
  if (parseFloat(totalDelta.heapUsed) > 20) {
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
  const BATCHES = 50;
  const BATCH_SIZE = 100;

  for (let batch = 0; batch < BATCHES; batch++) {
    // Create parallel operations
    const promises = [];
    
    for (let i = 0; i < BATCH_SIZE; i++) {
      const year = 2020 + (Math.random() * 10 | 0);
      const month = (Math.random() * 12 + 1 | 0).toString().padStart(2, '0');
      const day = (Math.random() * 28 + 1 | 0).toString().padStart(2, '0');
      
      promises.push(
        brHoliday.isHoliday(`${year}-${month}-${day}`).catch(() => false)
      );
      
      if (i % 10 === 0) {
        promises.push(
          brHoliday.getHolidays(year).catch(() => [])
        );
      }
    }
    
    await Promise.all(promises);
    
    if (batch % 10 === 0) {
      if (global.gc) {
        global.gc();
      }
      const currentMemory = getMemoryValues();
      const delta = calculateDelta(initialMemory, currentMemory);
      console.log(`Batch ${batch}/${BATCHES} - Delta: ${delta.heapUsed} MB`);
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
  if (parseFloat(totalDelta.heapUsed) > 30) {
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: API calls with static data
    await testApiCallsWithCache(false);
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: API calls without static data
    await testApiCallsWithCache(true);
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
