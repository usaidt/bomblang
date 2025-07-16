import { Lexer } from '../src/lexer';
import { Parser } from '../src/parser';
import { Interpreter } from '../src/interpreter';
import { TokenType } from '../src/token';

// Comprehensive example code snippets for the REPL
const examples = {
    // Beginner Examples
    simple: `// Simple variable assignment
*5 @x
*10 @y
!alert "Variables assigned!"`,
    
    strings: `// String literals and concatenation
*"Hello" @greeting
*"World" @target
!alert greeting target`,
    
    operators: `// Basic arithmetic operations
*5 @x
*3 @y
*x & + & y @sum
*x & * & y @product
!alert "Sum:" sum "Product:" product`,
    
    alerts: `// Alert messages
!alert "Welcome to BombLang!"
*42 @answer
!alert "The answer is" answer`,

    // Intermediate Examples
    functions: `// Function definition and calling
~double-n_*n & * & 2 @doubled !return doubled_

*7 @num
!double num @result
!alert "Double of" num "is" result`,

    conditionals: `// Conditional statements
*15 @x
*x & > & 10:if_
  !alert "x is greater than 10"
_:else_
  !alert "x is not greater than 10"
_`,

    comparisons: `// Comparison operations
*5 & != & 3 @result1
*2 & <= & 7 @result2
*9 & >= & 4 @result3
!alert "Results:" result1 result2 result3`,

    chained: `// Chained operations with functions
~double-n_*n & * & 2 @doubled !return doubled_
~quadruple-n_!double n @temp !double temp @quad !return quad_

*7 @num
!quadruple num @final
!alert "Quadruple of" num "is" final`,

    // Advanced Examples
    recursion: `// Recursive factorial function
~factorial-n_*n & <= & 1:if_!return 1_*n & - & 1 @prev !factorial prev @prevfact *n & * & prevfact @result !return result_

*5 @input
!factorial input @result
!alert "Factorial of" input "is" result`,

    fibonacci: `// Fibonacci with recursive approach
~fibonacci-n_*n & <= & 1:if_!return n_*n & - & 1 @prev1 *n & - & 2 @prev2 !fibonacci prev1 @fib1 !fibonacci prev2 @fib2 *fib1 & + & fib2 @result !return result_

*8 @num
!fibonacci num @fib
!alert "Fibonacci of" num "is" fib`,

    errors: `// Error handling with try-catch
~safeDivide-a-b_*b & == & 0:if_!explode "divzero" "Cannot divide by zero!"_*a & / & b @result !return result_

*10 @numerator
*0 @denominator

^divzero_!safeDivide numerator denominator @result !alert "Result:" result_^divzero_!alert "Division by zero caught!"_`,

    complex: `// Complex calculation with multiple features
~isEven-num_*num & % & 2 & == & 0 @check !return check_
~complexCalc-a-b_*a & * & b @step1 *step1 & + & 10 @step2 !isEven step2 @evenCheck !return step2_

*12 @x
*8 @y
!complexCalc x y @result
!alert "Complex result:" result`,

    // Experimental Examples
    nested: `// Nested function calls
~add-a-b_*a & + & b @sum !return sum_
~multiply-a-b_*a & * & b @product !return product_
~addThenMultiply-a-b-c_!add a b @sum !multiply sum c @result !return result_

*3 @x
*4 @y
*5 @z
!addThenMultiply x y z @final
!alert "Result of (3+4)*5 =" final`,

    memoization: `// Fibonacci with step-by-step calculation
~fibonacci-n_
  !alert "Calculating fibonacci of" n
  *n & <= & 1:if_
    !alert "Base case reached"
    !return n
  _
  *n & - & 1 @prev1
  *n & - & 2 @prev2
  !fibonacci prev1 @fib1
  !fibonacci prev2 @fib2
  *fib1 & + & fib2 @result
  !return result
_

*5 @test
!fibonacci test @result
!alert "Final result:" result`,

    validators: `// Input validation example
~validateAge-age_
  *age & < & 0:if_
    !alert "Age cannot be negative"
    !return 0
  _
  *age & > & 150:if_
    !alert "Age seems too high"
    !return 0  
  _
  !alert "Valid age:" age
  !return 1
_

*25 @myAge
!validateAge myAge @valid`,

    utilities: `// Math utility functions
~isEven-num_*num & % & 2 & == & 0 @check !return check_
~isOdd-num_!isEven num @evencheck *evencheck & == & 0 @oddcheck !return oddcheck_
~max-a-b_*a & > & b:if_!return a_!return b_

*15 @testval
!isOdd testval @odd
!isEven testval @even
!alert "15 is odd:" odd "even:" even

*10 @x
*20 @y
!max x y @maximum
!alert "Max of" x "and" y "is" maximum`
};

// Test cases for the lexer
interface TestCase {
    name: string;
    input: string;
    expected: Array<{ type: TokenType; value: string }>;
}

const testCases: TestCase[] = [
    {
        name: "Simple variable assignment",
        input: "*5 @x",
        expected: [
            { type: TokenType.Asterisk, value: "*" },
            { type: TokenType.Number, value: "5" },
            { type: TokenType.At, value: "@" },
            { type: TokenType.Identifier, value: "x" },
            { type: TokenType.EOF, value: "" }
        ]
    },
    {
        name: "String literal",
        input: '*"Hello World" @greeting',
        expected: [
            { type: TokenType.Asterisk, value: "*" },
            { type: TokenType.String, value: "Hello World" },
            { type: TokenType.At, value: "@" },
            { type: TokenType.Identifier, value: "greeting" },
            { type: TokenType.EOF, value: "" }
        ]
    },
    {
        name: "Arithmetic expression",
        input: "*x & + & y @sum",
        expected: [
            { type: TokenType.Asterisk, value: "*" },
            { type: TokenType.Identifier, value: "x" },
            { type: TokenType.Ampersand, value: "&" },
            { type: TokenType.Plus, value: "+" },
            { type: TokenType.Ampersand, value: "&" },
            { type: TokenType.Identifier, value: "y" },
            { type: TokenType.At, value: "@" },
            { type: TokenType.Identifier, value: "sum" },
            { type: TokenType.EOF, value: "" }
        ]
    },
    {
        name: "Function call",
        input: '!alert "Boom!"',
        expected: [
            { type: TokenType.Bang, value: "!" },
            { type: TokenType.Alert, value: "alert" },
            { type: TokenType.String, value: "Boom!" },
            { type: TokenType.EOF, value: "" }
        ]
    },
    {
        name: "Comparison operators",
        input: "*x & == & 5",
        expected: [
            { type: TokenType.Asterisk, value: "*" },
            { type: TokenType.Identifier, value: "x" },
            { type: TokenType.Ampersand, value: "&" },
            { type: TokenType.EqualEqual, value: "==" },
            { type: TokenType.Ampersand, value: "&" },
            { type: TokenType.Number, value: "5" },
            { type: TokenType.EOF, value: "" }
        ]
    },
    {
        name: "Comments",
        input: "// This is a comment\n*5 @x",
        expected: [
            { type: TokenType.Asterisk, value: "*" },
            { type: TokenType.Number, value: "5" },
            { type: TokenType.At, value: "@" },
            { type: TokenType.Identifier, value: "x" },
            { type: TokenType.EOF, value: "" }
        ]
    },
    {
        name: "Complex expression with braces",
        input: "~add-a-b_*a&+&b@result!return-result_",
        expected: [
            { type: TokenType.Tilde, value: "~" },
            { type: TokenType.Identifier, value: "add" },
            { type: TokenType.Dash, value: "-" },
            { type: TokenType.Identifier, value: "a" },
            { type: TokenType.Dash, value: "-" },
            { type: TokenType.Identifier, value: "b" },
            { type: TokenType.Underscore, value: "_" },
            { type: TokenType.Asterisk, value: "*" },
            { type: TokenType.Identifier, value: "a" },
            { type: TokenType.Ampersand, value: "&" },
            { type: TokenType.Plus, value: "+" },
            { type: TokenType.Ampersand, value: "&" },
            { type: TokenType.Identifier, value: "b" },
            { type: TokenType.At, value: "@" },
            { type: TokenType.Identifier, value: "result" },
            { type: TokenType.Bang, value: "!" },
            { type: TokenType.Return, value: "return" },
            { type: TokenType.Dash, value: "-" },
            { type: TokenType.Identifier, value: "result" },
            { type: TokenType.Underscore, value: "_" },
            { type: TokenType.EOF, value: "" }
        ]
    }
];

class WebREPL {
    private codeInput: HTMLTextAreaElement;
    private output: HTMLElement;
    private executionOutput: HTMLElement;
    private errorSection: HTMLElement;
    private errorOutput: HTMLElement;
    private testResults: HTMLElement;
    private interpreter: Interpreter;
    private stats = {
        tokensProcessed: 0,
        examplesRun: 0,
        errorsCaught: 0
    };

    constructor() {
        this.codeInput = document.getElementById('code-input') as HTMLTextAreaElement;
        this.output = document.getElementById('output') as HTMLElement;
        this.executionOutput = document.getElementById('execution-output') as HTMLElement;
        this.errorSection = document.getElementById('error-section') as HTMLElement;
        this.errorOutput = document.getElementById('error-output') as HTMLElement;
        this.testResults = document.getElementById('test-results') as HTMLElement;
        this.interpreter = new Interpreter();

        // Override the interpreter's alert function to show in the web UI
        this.setupInterpreterAlert();
        this.setupEventListeners();
    }

    private setupInterpreterAlert(): void {
        // Store the original console.log
        const originalLog = console.log;
        
        // Override console.log to capture interpreter output
        console.log = (...args: any[]) => {
            const message = args.join(' ');
            this.addToExecutionOutput(message);
            originalLog.apply(console, args);
        };
    }

    private addToExecutionOutput(message: string): void {
        const timestamp = new Date().toLocaleTimeString();
        this.executionOutput.textContent += `[${timestamp}] ${message}\n`;
        this.executionOutput.scrollTop = this.executionOutput.scrollHeight;
    }

    private setupEventListeners(): void {
        // Tokenize button
        const tokenizeBtn = document.getElementById('tokenize-btn');
        tokenizeBtn?.addEventListener('click', () => this.tokenizeCode());

        // Run button
        const runBtn = document.getElementById('run-btn');
        runBtn?.addEventListener('click', () => this.runCode());

        // Clear button
        const clearBtn = document.getElementById('clear-btn');
        clearBtn?.addEventListener('click', () => this.clearAll());

        // Example buttons
        const exampleBtns = document.querySelectorAll('.example-btn-small');
        exampleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const exampleType = target.getAttribute('data-example') as keyof typeof examples;
                this.loadExample(exampleType);
            });
        });

        // Test button
        const testBtn = document.getElementById('run-tests-btn');
        testBtn?.addEventListener('click', () => this.runTests());

        // Test examples button
        const testExamplesBtn = document.getElementById('run-examples-btn');
        testExamplesBtn?.addEventListener('click', () => this.testAllExamples());

        // Enter key in textarea
        this.codeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.runCode();
            }
        });
    }

    private tokenizeCode(): void {
        const code = this.codeInput.value.trim();
        if (!code) {
            this.showError("Please enter some BombLang code to tokenize.");
            return;
        }

        try {
            this.hideError();
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            this.displayTokens(tokens);
            this.stats.tokensProcessed += tokens.length;
            this.updateStats();
        } catch (error) {
            this.stats.errorsCaught++;
            this.updateStats();
            this.showError(error instanceof Error ? error.message : "An unknown error occurred.");
        }
    }

    private runCode(): void {
        const code = this.codeInput.value.trim();
        if (!code) {
            this.showError("Please enter some BombLang code to run.");
            return;
        }

        try {
            this.hideError();
            this.executionOutput.textContent = ""; // Clear previous output
            this.addToExecutionOutput("🚀 Starting execution...");
            
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            this.interpreter.interpret(ast);
            this.addToExecutionOutput("✅ Execution completed successfully!");
            
            this.stats.tokensProcessed += tokens.length;
            this.stats.examplesRun++;
            this.updateStats();
            
            // Also show tokens for debugging
            this.displayTokens(tokens);
            
        } catch (error) {
            this.stats.errorsCaught++;
            this.updateStats();
            const errorMsg = error instanceof Error ? error.message : "An unknown error occurred.";
            this.addToExecutionOutput(`💥 Explosion: ${errorMsg}`);
            this.showError(errorMsg);
        }
    }

    private displayTokens(tokens: any[]): void {
        this.output.innerHTML = '';
        
        if (tokens.length === 1 && tokens[0].type === TokenType.EOF) {
            this.output.innerHTML = '<div class="token">No tokens found (empty input)</div>';
            return;
        }

        tokens.forEach((token, index) => {
            if (token.type !== TokenType.EOF) {
                const tokenElement = document.createElement('div');
                tokenElement.className = 'token';
                tokenElement.innerHTML = `
                    <span class="token-type">${token.type}</span>: 
                    <span class="token-value">'${this.escapeHtml(token.value)}'</span>
                    <span class="token-position">(line ${token.line}, col ${token.column})</span>
                `;
                this.output.appendChild(tokenElement);
            }
        });

        // Add a summary
        const nonEofTokens = tokens.filter(t => t.type !== TokenType.EOF);
        const summary = document.createElement('div');
        summary.style.marginTop = '15px';
        summary.style.padding = '10px';
        summary.style.background = '#e7f3ff';
        summary.style.borderRadius = '6px';
        summary.style.borderLeft = '4px solid #007bff';
        summary.innerHTML = `<strong>Summary:</strong> Found ${nonEofTokens.length} tokens`;
        this.output.appendChild(summary);
    }

    private showError(message: string): void {
        this.errorOutput.textContent = message;
        this.errorSection.style.display = 'block';
    }

    private hideError(): void {
        this.errorSection.style.display = 'none';
    }

    private clearAll(): void {
        this.codeInput.value = '';
        this.output.innerHTML = '';
        this.executionOutput.textContent = 'Ready for explosive code! 💣';
        this.hideError();
        this.codeInput.focus();
    }

    private loadExample(exampleType: keyof typeof examples): void {
        this.codeInput.value = examples[exampleType];
        this.hideError();
        this.output.innerHTML = '';
        this.executionOutput.textContent = `Loaded ${exampleType} example - ready to explode! 💥`;
        this.codeInput.focus();
        this.stats.examplesRun++;
        this.updateStats();
    }

    private testAllExamples(): void {
        this.testResults.innerHTML = '<div>🧪 Testing all examples...</div>';
        
        let passed = 0;
        let failed = 0;
        const results: string[] = [];

        Object.entries(examples).forEach(([name, code]) => {
            try {
                const lexer = new Lexer(code);
                const tokens = lexer.tokenize();
                
                const parser = new Parser(tokens);
                const ast = parser.parse();
                
                // Create a temporary interpreter for testing
                const testInterpreter = new Interpreter();
                testInterpreter.interpret(ast);
                
                passed++;
                results.push(`<div class="test-pass">✅ ${name} - Example runs successfully</div>`);
                
            } catch (error) {
                failed++;
                const errorMsg = error instanceof Error ? error.message : "Unknown error";
                results.push(`<div class="test-fail">❌ ${name}<br>&nbsp;&nbsp;&nbsp;&nbsp;Error: ${errorMsg}</div>`);
            }
        });

        // Display results
        const summaryClass = failed === 0 ? 'success' : 'failure';
        const summaryText = `Example tests completed: ${passed} passed, ${failed} failed`;
        
        this.testResults.innerHTML = `
            <div class="test-summary ${summaryClass}">${summaryText}</div>
            ${results.join('')}
        `;
    }

    private runTests(): void {
        this.testResults.innerHTML = '<div>🧪 Running lexer tests...</div>';
        
        let passed = 0;
        let failed = 0;
        const results: string[] = [];

        testCases.forEach((testCase, index) => {
            try {
                const lexer = new Lexer(testCase.input);
                const tokens = lexer.tokenize();
                
                // Compare tokens
                let testPassed = true;
                let errorMessage = '';

                if (tokens.length !== testCase.expected.length) {
                    testPassed = false;
                    errorMessage = `Expected ${testCase.expected.length} tokens, got ${tokens.length}`;
                } else {
                    for (let i = 0; i < tokens.length; i++) {
                        if (tokens[i].type !== testCase.expected[i].type || 
                            tokens[i].value !== testCase.expected[i].value) {
                            testPassed = false;
                            errorMessage = `Token ${i}: expected ${testCase.expected[i].type}:'${testCase.expected[i].value}', got ${tokens[i].type}:'${tokens[i].value}'`;
                            break;
                        }
                    }
                }

                if (testPassed) {
                    passed++;
                    results.push(`<div class="test-pass">✅ ${testCase.name}</div>`);
                } else {
                    failed++;
                    results.push(`<div class="test-fail">❌ ${testCase.name}<br>&nbsp;&nbsp;&nbsp;&nbsp;${errorMessage}</div>`);
                }

            } catch (error) {
                failed++;
                const errorMsg = error instanceof Error ? error.message : "Unknown error";
                results.push(`<div class="test-fail">❌ ${testCase.name}<br>&nbsp;&nbsp;&nbsp;&nbsp;Error: ${errorMsg}</div>`);
            }
        });

        // Display results
        const summaryClass = failed === 0 ? 'success' : 'failure';
        const summaryText = `Lexer tests completed: ${passed} passed, ${failed} failed`;
        
        this.testResults.innerHTML = `
            <div class="test-summary ${summaryClass}">${summaryText}</div>
            ${results.join('')}
        `;
    }

    private updateStats(): void {
        const tokensEl = document.getElementById('tokens-processed');
        const examplesEl = document.getElementById('examples-run');
        const errorsEl = document.getElementById('errors-caught');
        
        if (tokensEl) tokensEl.textContent = this.stats.tokensProcessed.toString();
        if (examplesEl) examplesEl.textContent = this.stats.examplesRun.toString();
        if (errorsEl) errorsEl.textContent = this.stats.errorsCaught.toString();
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the REPL when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WebREPL();
});
