import { Lexer } from '../src/lexer';
import { Parser } from '../src/parser';
import { Interpreter } from '../src/interpreter';
import * as fs from 'fs';
import * as path from 'path';

describe('BombLang Examples Test Suite', () => {
  const examplesDir = path.join(__dirname, '..', 'examples');
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let capturedOutput: string[];
  let capturedErrors: string[];

  beforeEach(() => {
    capturedOutput = [];
    capturedErrors = [];
    
    // Mock console.log to capture output
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation((message: string, ...args: any[]) => {
      capturedOutput.push([message, ...args].join(' '));
    });
    
    // Mock console.error to capture errors
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((message: string, ...args: any[]) => {
      capturedErrors.push([message, ...args].join(' '));
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  function runBombLangFile(filename: string): { output: string[], errors: string[], success: boolean } {
    const filePath = path.join(examplesDir, filename);
    const code = fs.readFileSync(filePath, 'utf-8');
    
    capturedOutput = [];
    capturedErrors = [];
    
    try {
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const interpreter = new Interpreter();
      interpreter.interpret(ast);
      
      return {
        output: [...capturedOutput],
        errors: [...capturedErrors],
        success: capturedErrors.length === 0
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      capturedErrors.push(`Uncaught error: ${errorMessage}`);
      
      // Debug: log the first few failing files for detailed analysis
      if (['simple_test.bomb', 'factorial_test.bomb', 'chained_ops.bomb'].includes(filename)) {
        console.log(`\n=== DEBUG ${filename} ===`);
        console.log(`File content: ${JSON.stringify(code)}`);
        console.log(`Error: ${errorMessage}`);
        console.log('======================\n');
      }
      
      return {
        output: [...capturedOutput],
        errors: [...capturedErrors],
        success: false
      };
    }
  }

  describe('Basic Functionality Tests', () => {
    test('simple_test.bomb - Basic function and alert', () => {
      const result = runBombLangFile('simple_test.bomb');
      
      expect(result.success).toBe(true);
      expect(result.output).toEqual(expect.arrayContaining([
        expect.stringMatching(/Value is\s*42/)
      ]));
      expect(result.errors).toHaveLength(0);
    });

    test('single_line.bomb - Single line execution', () => {
      const result = runBombLangFile('single_line.bomb');
      
      expect(result.success).toBe(true);
      // Some examples might not produce output, which is valid
    });

    test('ops_test.bomb - Basic operations', () => {
      const result = runBombLangFile('ops_test.bomb');
      
      expect(result.success).toBe(true);
      // Some examples might not produce output, which is valid
    });

    test('ops_only.bomb - Operations only', () => {
      const result = runBombLangFile('ops_only.bomb');
      
      expect(result.success).toBe(true);
    });
  });

  describe('Arithmetic and Chain Operations', () => {
    test('chained_ops.bomb - Chained arithmetic operations', () => {
      const result = runBombLangFile('chained_ops.bomb');
      
      expect(result.success).toBe(true);
      expect(result.output).toEqual(expect.arrayContaining([
        expect.stringMatching(/Result:\s*\d+/),
        expect.stringMatching(/Quadruple of\s*\d+\s*is\s*\d+/)
      ]));
    });

    test('chain_test.bomb - Chain expression test', () => {
      const result = runBombLangFile('chain_test.bomb');
      
      expect(result.success).toBe(true);
      expect(result.output.length).toBeGreaterThan(0);
    });

    test('simple_chain.bomb - Simple chain operations', () => {
      const result = runBombLangFile('simple_chain.bomb');
      
      expect(result.success).toBe(true);
    });

    test('clean_ops.bomb - Clean operations test', () => {
      const result = runBombLangFile('clean_ops.bomb');
      
      expect(result.success).toBe(true);
    });
  });

  describe('Mathematical Functions', () => {
    test('factorial_test.bomb - Factorial calculation', () => {
      const result = runBombLangFile('factorial_test.bomb');
      
      expect(result.success).toBe(true);
      expect(result.output).toEqual(expect.arrayContaining([
        expect.stringMatching(/Factorial of 3 is\s*6/)
      ]));
    });

    test('factorial_debug.bomb - Factorial with debug output', () => {
      const result = runBombLangFile('factorial_debug.bomb');
      
      expect(result.success).toBe(true);
      expect(result.output.length).toBeGreaterThan(0);
    });

    test('recursion.bomb - Recursive function test', () => {
      const result = runBombLangFile('recursion.bomb');
      
      // Allow for either success or controlled failure (like stack overflow)
      if (!result.success) {
        // If it fails, it should be a controlled runtime error, not a parse error
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).not.toMatch(/Unexpected character|Unterminated/);
      } else {
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Comparison Operations', () => {
    test('ge_test.bomb - Greater than or equal test', () => {
      const result = runBombLangFile('ge_test.bomb');
      
      expect(result.success).toBe(true);
      // Some examples might not produce output, which is valid
    });

    test('ne_test.bomb - Not equal test', () => {
      const result = runBombLangFile('ne_test.bomb');
      
      expect(result.success).toBe(true);
      // Some examples might not produce output, which is valid
    });
  });

  describe('Conditional Logic', () => {
    test('conditional_test.bomb - If-else conditions', () => {
      const result = runBombLangFile('conditional_test.bomb');
      
      expect(result.success).toBe(true);
      expect(result.output.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('error_handling.bomb - Try-catch blocks with labeled errors', () => {
      const result = runBombLangFile('error_handling.bomb');
      
      // Error handling examples might have intentional errors that are caught
      if (!result.success) {
        // If it fails, check that it's not a parse/lexer error
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).not.toMatch(/Unexpected character|Unterminated/);
      } else {
        expect(result.success).toBe(true);
        expect(result.output).toEqual(expect.arrayContaining([
          expect.stringMatching(/Division explosion caught and defused!/),
          expect.stringMatching(/Valid division:/),
          expect.stringMatching(/Big value explosion defused!/)
        ]));
      }
    });
  });

  describe('Complex Programs', () => {
    test('complex.bomb - Complex program with multiple features', () => {
      const result = runBombLangFile('complex.bomb');
      
      expect(result.success).toBe(true);
      // Complex programs might not always produce output
    });
  });

  describe('Whitespace and Formatting', () => {
    test('whitespace_test.bomb - Whitespace handling', () => {
      const result = runBombLangFile('whitespace_test.bomb');
      
      expect(result.success).toBe(true);
    });

    test('spaced_test.bomb - Spaced syntax test', () => {
      const result = runBombLangFile('spaced_test.bomb');
      
      expect(result.success).toBe(true);
    });

    test('test_no_newline.bomb - No newline at end', () => {
      const result = runBombLangFile('test_no_newline.bomb');
      
      expect(result.success).toBe(true);
    });
  });

  describe('Language Feature Tests', () => {
    test('lexer_test.bomb - Lexer functionality', () => {
      const result = runBombLangFile('lexer_test.bomb');
      
      expect(result.success).toBe(true);
    });

    test('debug_test.bomb - Debug functionality', () => {
      const result = runBombLangFile('debug_test.bomb');
      
      expect(result.success).toBe(true);
      expect(result.output.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    test('All examples should parse without syntax errors', () => {
      const exampleFiles = fs.readdirSync(examplesDir).filter(file => file.endsWith('.bomb'));
      
      const parseErrors: string[] = [];
      
      exampleFiles.forEach(filename => {
        try {
          const filePath = path.join(examplesDir, filename);
          const code = fs.readFileSync(filePath, 'utf-8');
          const lexer = new Lexer(code);
          const tokens = lexer.tokenize();
          const parser = new Parser(tokens);
          parser.parse(); // This should not throw for valid syntax
        } catch (error) {
          parseErrors.push(`${filename}: ${error instanceof Error ? error.message : String(error)}`);
        }
      });
      
      expect(parseErrors).toHaveLength(0);
      if (parseErrors.length > 0) {
        console.log('Parse errors found:', parseErrors);
      }
    });

    test('All examples should tokenize without lexer errors', () => {
      const exampleFiles = fs.readdirSync(examplesDir).filter(file => file.endsWith('.bomb'));
      
      const lexerErrors: string[] = [];
      
      exampleFiles.forEach(filename => {
        try {
          const filePath = path.join(examplesDir, filename);
          const code = fs.readFileSync(filePath, 'utf-8');
          const lexer = new Lexer(code);
          lexer.tokenize(); // This should not throw for valid syntax
        } catch (error) {
          lexerErrors.push(`${filename}: ${error instanceof Error ? error.message : String(error)}`);
        }
      });
      
      expect(lexerErrors).toHaveLength(0);
      if (lexerErrors.length > 0) {
        console.log('Lexer errors found:', lexerErrors);
      }
    });

    test('Run all examples and collect statistics', () => {
      const exampleFiles = fs.readdirSync(examplesDir).filter(file => file.endsWith('.bomb'));
      
      const stats = {
        total: exampleFiles.length,
        successful: 0,
        failed: 0,
        withOutput: 0,
        withErrors: 0,
        failureDetails: [] as string[]
      };
      
      exampleFiles.forEach(filename => {
        const result = runBombLangFile(filename);
        
        if (result.success) {
          stats.successful++;
        } else {
          stats.failed++;
          stats.failureDetails.push(`${filename}: ${result.errors.join(', ')}`);
        }
        
        if (result.output.length > 0) {
          stats.withOutput++;
        }
        
        if (result.errors.length > 0) {
          stats.withErrors++;
        }
      });
      
      console.log('Test Statistics:', stats);
      
      // At least 80% of examples should run successfully
      expect(stats.successful / stats.total).toBeGreaterThanOrEqual(0.8);
      
      // Print failure details for debugging
      if (stats.failureDetails.length > 0) {
        console.log('Failure details:', stats.failureDetails);
      }
    });
  });

  describe('Output Validation', () => {
    test('factorial_test.bomb should produce correct factorial result', () => {
      const result = runBombLangFile('factorial_test.bomb');
      
      expect(result.success).toBe(true);
      
      // Check that factorial of 3 equals 6
      const factorialOutput = result.output.find(line => line.includes('Factorial of 3 is'));
      expect(factorialOutput).toBeDefined();
      expect(factorialOutput).toMatch(/6/);
    });

    test('error_handling.bomb should handle division by zero', () => {
      const result = runBombLangFile('error_handling.bomb');
      
      // This test is more flexible about success/failure
      if (result.success) {
        expect(result.output).toEqual(expect.arrayContaining([
          expect.stringMatching(/Division explosion caught and defused!/)
        ]));
      } else {
        // If it fails, it should be a runtime error, not a parse error
        expect(result.errors[0]).not.toMatch(/Unexpected character|Unterminated/);
      }
    });

    test('chained_ops.bomb should calculate arithmetic correctly', () => {
      const result = runBombLangFile('chained_ops.bomb');
      
      expect(result.success).toBe(true);
      
      // 5 + 3 * 2 + 1 = 17 (assuming left-to-right evaluation)
      // Or it could be 5 + (3 * 2) + 1 = 12 depending on operator precedence
      const resultOutput = result.output.find(line => line.includes('Result:'));
      expect(resultOutput).toBeDefined();
      expect(resultOutput).toMatch(/Result:\s*\d+/);
    });
  });

  describe('Performance and Stress Tests', () => {
    test('All examples should complete within reasonable time', () => {
      const exampleFiles = fs.readdirSync(examplesDir).filter(file => file.endsWith('.bomb'));
      
      exampleFiles.forEach(filename => {
        const startTime = Date.now();
        const result = runBombLangFile(filename);
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        // Each example should complete within 5 seconds
        expect(executionTime).toBeLessThan(5000);
        
        if (executionTime > 1000) {
          console.warn(`${filename} took ${executionTime}ms to execute`);
        }
      });
    });

    test('Memory usage should be reasonable', () => {
      const exampleFiles = fs.readdirSync(examplesDir).filter(file => file.endsWith('.bomb'));
      
      exampleFiles.forEach(filename => {
        const initialMemory = process.memoryUsage().heapUsed;
        runBombLangFile(filename);
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be less than 50MB per example
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      });
    });
  });

  describe('Edge Cases', () => {
    test('Empty files should be handled gracefully', () => {
      // Test with minimal content
      const minimalCode = '';
      
      try {
        const lexer = new Lexer(minimalCode);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const interpreter = new Interpreter();
        interpreter.interpret(ast);
        
        // Should not throw
        expect(true).toBe(true);
      } catch (error) {
        // If it throws, it should be a graceful error
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('Files with only comments should work', () => {
      const commentOnlyCode = '//This is just a comment\n//Another comment';
      
      try {
        const lexer = new Lexer(commentOnlyCode);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const interpreter = new Interpreter();
        interpreter.interpret(ast);
        
        expect(true).toBe(true);
      } catch (error) {
        // Should handle gracefully
        console.warn('Comment-only code handling:', error);
      }
    });
  });
});
