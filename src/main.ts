import { Lexer } from './lexer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';
import * as fs from 'fs';
import * as path from 'path';

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: ts-node src/main.ts <file>");
    console.log("💣 bombLang Interpreter");
    return;
  }

  const filePath = path.resolve(args[0]);
  
  try {
    const code = fs.readFileSync(filePath, 'utf-8');
    
    // Tokenize
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    if (args.includes('--tokens')) {
      console.log("Tokens:");
      tokens.forEach(token => {
        console.log(`  ${token.type}: '${token.value}' (line ${token.line}, col ${token.column})`);
      });
      return;
    }
    
    // Parse
    const parser = new Parser(tokens);
    const ast = parser.parse();
    
    if (args.includes('--ast')) {
      console.log("AST:");
      console.log(JSON.stringify(ast, null, 2));
      return;
    }
    
    // Interpret
    const interpreter = new Interpreter();
    interpreter.interpret(ast);
    
    if (args.includes('--debug')) {
      console.log("\nFinal state:");
      const state = interpreter.getState();
      console.log("Globals:", Object.fromEntries(state.globals));
      console.log("Functions:", state.functions);
    }
    
  } catch (error) {
    console.error('\n💥 EXPLOSION DETAILS:');
    if (error instanceof Error) {
      console.error(`💥 ${error.message}`);
    } else {
      console.error(`💥 An unknown error occurred: ${error}`);
    }
    process.exit(1);
  }
}

main();
