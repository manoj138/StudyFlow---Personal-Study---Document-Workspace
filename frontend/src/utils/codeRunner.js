/**
 * Safe Browser Sandboxed Execution Engine for StudyFlow
 * Executes JavaScript code inside an isolated Web Worker blob to capture console logs,
 * handle errors gracefully, and prevent infinite loops without freezing the React app.
 */

export const executeJavaScript = (code, timeoutMs = 3000) => {
  return new Promise((resolve) => {
    if (!code || typeof code !== "string") {
      return resolve({
        logs: [],
        error: "No executable code provided.",
        executionTimeMs: 0
      });
    }

    const startTime = performance.now();

    // Preprocess user code to handle basic JSX returns like <h1>Text</h1>
    let processedCode = code;

    // Convert simple JSX returns (e.g. return <h1>Hello</h1> -> return "Hello")
    processedCode = processedCode.replace(/(return\s*)<([a-zA-Z0-9]+)([^>]*)>([\s\S]*?)<\/\2>/g, '$1"$4"');

    // If code declares a single function like `function Welcome() { ... }` without invocation, auto-append invocation
    if (/function\s+([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*\{/i.test(processedCode) && !/\b([a-zA-Z0-9_$]+)\s*\(/i.test(processedCode.split("function")[1] || "")) {
      const funcNameMatch = processedCode.match(/function\s+([a-zA-Z0-9_$]+)/i);
      if (funcNameMatch && funcNameMatch[1]) {
        processedCode += `\n${funcNameMatch[1]}();`;
      }
    }

    // Create worker script as a Blob
    const workerScript = `
      self.onmessage = function(e) {
        const userCode = e.data;
        const logs = [];

        // Intercept console functions
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        function formatArg(arg) {
          if (arg === undefined) return "undefined";
          if (arg === null) return "null";
          if (typeof arg === "object") {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (err) {
              return String(arg);
            }
          }
          return String(arg);
        }

        console.log = function(...args) {
          logs.push({ type: "log", text: args.map(formatArg).join(" ") });
        };

        console.warn = function(...args) {
          logs.push({ type: "warn", text: args.map(formatArg).join(" ") });
        };

        console.error = function(...args) {
          logs.push({ type: "error", text: args.map(formatArg).join(" ") });
        };

        try {
          const result = eval(userCode);
          self.postMessage({
            success: true,
            logs: logs,
            result: result !== undefined ? formatArg(result) : null
          });
        } catch (error) {
          let errorMsg = error.name + ": " + error.message;
          if (error.message.includes("Unexpected token '<'")) {
            errorMsg += " (Note: Plain JavaScript engine cannot parse raw JSX tags like <h1>. Use JSX/React mode or return a string/console.log).";
          }
          self.postMessage({
            success: false,
            logs: logs,
            error: errorMsg
          });
        }
      };
    `;

    let workerBlob;
    let worker;
    let timer;

    try {
      workerBlob = new Blob([workerScript], { type: "application/javascript" });
      worker = new Worker(URL.createObjectURL(workerBlob));
    } catch (err) {
      // Fallback for environments where Web Workers are restricted
      return executeInFallbackSandbox(code, startTime, resolve);
    }

    // Set timeout to prevent infinite loops (e.g. while(true))
    timer = setTimeout(() => {
      worker.terminate();
      const duration = Math.round(performance.now() - startTime);
      resolve({
        logs: [],
        error: "Execution Timed Out (Maximum 3000ms limit reached to prevent infinite loops).",
        executionTimeMs: duration
      });
    }, timeoutMs);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      const duration = Math.round(performance.now() - startTime);
      const data = e.data;

      if (data.success) {
        resolve({
          logs: data.logs,
          result: data.result,
          error: null,
          executionTimeMs: duration
        });
      } else {
        resolve({
          logs: data.logs,
          result: null,
          error: data.error,
          executionTimeMs: duration
        });
      }
    };

    worker.onerror = (err) => {
      clearTimeout(timer);
      worker.terminate();
      const duration = Math.round(performance.now() - startTime);
      resolve({
        logs: [],
        result: null,
        error: err.message || "Execution Error",
        executionTimeMs: duration
      });
    };

    // Post user code to Web Worker
    worker.postMessage(processedCode);
  });
};

// Fallback Sandbox using indirect Function execution if Blob Workers are unavailable
function executeInFallbackSandbox(code, startTime, resolve) {
  const logs = [];

  const fakeConsole = {
    log: (...args) => logs.push({ type: "log", text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ") }),
    warn: (...args) => logs.push({ type: "warn", text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ") }),
    error: (...args) => logs.push({ type: "error", text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ") })
  };

  try {
    const runner = new Function("console", code);
    const result = runner(fakeConsole);
    const duration = Math.round(performance.now() - startTime);
    resolve({
      logs,
      result: result !== undefined ? String(result) : null,
      error: null,
      executionTimeMs: duration
    });
  } catch (err) {
    const duration = Math.round(performance.now() - startTime);
    resolve({
      logs,
      result: null,
      error: err.name + ": " + err.message,
      executionTimeMs: duration
    });
  }
}
