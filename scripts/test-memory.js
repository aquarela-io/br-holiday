/**
 * scripts/test-memory.js
 *
 * Teste detalhado para verificar vazamentos de memória
 * na classe BRHoliday, tanto no modo skipStatic

 * quanto com fallback estático.
 */

// Ajuste o caminho para importar corretamente a classe:
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
 * Executa várias chamadas de getHolidays/isHoliday em batches,
 * com checkpoints de memória entre cada batch.
 *
 * @param {boolean} skipStatic

 * @returns {Promise<void>}
 */
async function runMemoryTest(skipStatic) {
  console.log(`\n=== Teste com skipStatic
 = ${skipStatic} ===`);

  // Força GC inicial
  if (global.gc) {
    global.gc();
  }

  const initialMemory = getMemoryValues();
  console.log("Memória inicial:", formatMemoryUsage());

  // Aumentamos para ter uma visão melhor de possíveis leaks
  const TOTAL_ITERATIONS = 1000;
  const BATCH_SIZE = 200;
  const brHoliday = new BRHoliday({ skipStatic });

  for (let batch = 0; batch < TOTAL_ITERATIONS / BATCH_SIZE; batch++) {
    const batchReferences = [];

    console.log(
      `\nExecutando batch ${batch + 1}/${TOTAL_ITERATIONS / BATCH_SIZE}...`
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

    // Força GC após cada batch
    if (global.gc) {
      global.gc();
    }

    const currentMemory = getMemoryValues();
    const delta = calculateDelta(initialMemory, currentMemory);

    console.log(`Memória após batch ${batch + 1}:`, formatMemoryUsage());
    console.log(`Delta desde o início (MB):`, delta);

    // Limpa referências do batch
    batchReferences.length = 0;
  }

  // Memória final após todos os batches
  if (global.gc) {
    global.gc();
  }

  const finalMemory = getMemoryValues();
  const totalDelta = calculateDelta(initialMemory, finalMemory);

  console.log("\nResultado final:");
  console.log("Memória final:", formatMemoryUsage());
  console.log("Delta total (MB):", totalDelta);
}

(async () => {
  console.log("Iniciando teste de memória detalhado...\n");

  // Teste 1: Somente API
  await runMemoryTest(true);

  // Teste 2: Usando dados estáticos + fallback
  await runMemoryTest(false);

  console.log("\n*** Teste finalizado ***");
})();
