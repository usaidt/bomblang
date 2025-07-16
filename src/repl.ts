import * as readline from 'readline';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';
import { Token, TokenType } from './token';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '💣> ',
});

console.log("💣 bombLang REPL - Type 'exit' to quit");
console.log("Commands: .tokens (show tokens), .ast (show AST), .state (show variables)");

const interpreter = new Interpreter();

rl.prompt();

rl.on('line', (line) => {
  if (line.trim().toLowerCase() === 'exit') {
    console.log('💥 Boom! Goodbye!');
    rl.close();
    return;
  }

  if (line.trim() === '.state') {
    const state = interpreter.getState();
    console.log("Variables:", Object.fromEntries(state.globals));
    console.log("Functions:", state.functions);
    rl.prompt();
    return;
  }

  try {
    const lexer = new Lexer(line);
    const tokens = lexer.tokenize();
    
    if (line.trim() === '.tokens') {
      console.log("Tokens:");
      tokens.forEach(token => {
        if (token.type !== TokenType.EOF) {
          console.log(`  ${token.type}: '${token.value}'`);
        }
      });
      rl.prompt();
      return;
    }
    
    const parser = new Parser(tokens);
    const ast = parser.parse();
    
    if (line.trim() === '.ast') {
      console.log("AST:", JSON.stringify(ast, null, 2));
      rl.prompt();
      return;
    }
    
    // Execute the code
    interpreter.interpret(ast);
    
  } catch (error) {
    if (error instanceof Error) {
      console.error(`💥 Explosion: ${error.message}`);
    } else {
      console.error('An unknown explosion occurred.');
    }
  }

  rl.prompt();
}).on('close', () => {
  process.exit(0);
});