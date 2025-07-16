import { Lexer } from './src/lexer';

try {
  console.log('Testing whitespace rejection:');
  
  // This should work (no spaces)
  console.log('Testing: *5@x');
  let lexer = new Lexer('*5@x');
  let tokens = lexer.tokenize();
  console.log('Success:', tokens.map(t => `${t.type}:${t.value}`));

  // This should fail (has space)
  console.log('Testing: *5 @x (should fail)');
  lexer = new Lexer('*5 @x');
  tokens = lexer.tokenize();
  console.log('Unexpected success:', tokens);

} catch (error) {
  console.error('Expected error:', error instanceof Error ? error.message : error);
}
