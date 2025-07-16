const { Lexer } = require('./dist/lexer');
const { Parser } = require('./dist/parser');
const { Interpreter } = require('./dist/interpreter');

// Test factorial example
const factorialCode = `~factorial-n_*n & <= & 1:if_!return 1_*n & - & 1 @prev !factorial prev @prevfact *n & * & prevfact @result !return result_

*5 @input
!factorial input @result
!alert "Factorial of" input "is" result`;

console.log("Testing factorial recursion...");
try {
    const lexer = new Lexer(factorialCode);
    const tokens = lexer.tokenize();
    
    const parser = new Parser(tokens);
    const ast = parser.parse();
    
    const interpreter = new Interpreter();
    interpreter.interpret(ast);
} catch (error) {
    console.error("Error:", error.message);
}
