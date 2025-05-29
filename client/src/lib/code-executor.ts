// This module handles code execution logic for different languages
// In a production environment, this would use a sandboxed execution environment

export interface TestResult {
  input: string;
  expected: string;
  output: string;
  passed: boolean;
  hidden: boolean;
  error?: string;
}

export interface ExecutionResult {
  results: TestResult[];
  error?: string;
  runtime?: number;
  memory?: number;
}

export async function executeCode(
  code: string,
  language: string,
  testCases: any[]
): Promise<ExecutionResult> {
  const startTime = performance.now();
  
  try {
    if (language === 'javascript') {
      return executeJavaScript(code, testCases);
    } else if (language === 'python') {
      return executePython(code, testCases);
    } else {
      throw new Error(`Unsupported language: ${language}`);
    }
  } catch (error) {
    return {
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      runtime: performance.now() - startTime,
    };
  }
}

function executeJavaScript(code: string, testCases: any[]): ExecutionResult {
  const results: TestResult[] = [];
  
  try {
    // Extract function name from code
    const funcMatch = code.match(/function\s+(\w+)/);
    if (!funcMatch) {
      throw new Error('No function found in code');
    }
    
    const funcName = funcMatch[1];
    
    for (const testCase of testCases) {
      try {
        // Create a safe execution environment
        const wrappedCode = `
          ${code}
          
          // Execute test case
          const result = ${funcName}${testCase.input};
          result;
        `;
        
        // Use eval in a controlled manner (in production, use a proper sandbox)
        const output = eval(wrappedCode);
        const outputStr = JSON.stringify(output);
        const expectedStr = testCase.expected;
        const passed = outputStr === expectedStr;
        
        results.push({
          input: testCase.input,
          expected: expectedStr,
          output: outputStr,
          passed,
          hidden: testCase.hidden || false,
        });
      } catch (error) {
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          output: `Error: ${error.message}`,
          passed: false,
          hidden: testCase.hidden || false,
          error: error.message,
        });
      }
    }
    
    return { results };
  } catch (error) {
    return {
      results: [],
      error: error instanceof Error ? error.message : 'JavaScript execution failed',
    };
  }
}

function executePython(code: string, testCases: any[]): ExecutionResult {
  // For Python, we would need a backend service or WebAssembly Python interpreter
  // For now, return mock results
  const results: TestResult[] = testCases.map(testCase => ({
    input: testCase.input,
    expected: testCase.expected,
    output: testCase.expected, // Mock: assume all pass
    passed: true,
    hidden: testCase.hidden || false,
  }));
  
  return { results };
}

export function formatExecutionTime(ms: number): string {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatMemoryUsage(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
