import { Token, TokenType } from './token';
import {
  ASTNode, Program, LiteralExpr, IdentifierExpr, BinaryExpr, ChainExpr,
  AssignmentStmt, FunctionDefStmt, FunctionCallStmt, ReturnStmt, AlertStmt,
  IfStmt, TryStmt, BlockStmt
} from './ast';

export class Parser {
  private tokens: Token[];
  private current: number = 0;
  private lastExpression: ASTNode | null = null; // Track last expression for conditionals

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(): Program {
    const statements: ASTNode[] = [];
    
    while (!this.isAtEnd()) {
      const stmt = this.statement();
      if (stmt) {
        statements.push(stmt);
      }
    }
    
    return new Program(statements);
  }

  private statement(): ASTNode | null {
    try {
      // *expression @variable
      if (this.match(TokenType.Asterisk)) {
        return this.assignmentStatement();
      }
      
      // ~name-param1-param2_body_
      if (this.match(TokenType.Tilde)) {
        return this.functionDefinition();
      }
      
      // !function-args OR !alert-args OR !return-value
      if (this.match(TokenType.Bang)) {
        return this.functionCall();
      }
      
      // :if_body_:else_body_ (uses lastExpression as condition)
      if (this.check(TokenType.Colon)) {
        return this.ifStatement();
      }
      
      // ^label_try_^label_catch_
      if (this.match(TokenType.Caret)) {
        return this.tryStatement();
      }

      // Skip over unknown tokens
      this.advance();
      return null;
    } catch (error) {
      // Skip to next statement on error
      this.synchronize();
      return null;
    }
  }

  // *expression @variable
  private assignmentStatement(): AssignmentStmt {
    const expression = this.expression();
    this.lastExpression = expression; // Store for potential conditional use
    this.consume(TokenType.At, "Expected '@' after expression in assignment");
    const varName = this.consume(TokenType.Identifier, "Expected variable name after '@'");
    return new AssignmentStmt(expression, varName.value);
  }

  // ~name-param1-param2_body_
  private functionDefinition(): FunctionDefStmt {
    const name = this.consume(TokenType.Identifier, "Expected function name after '~'");
    
    const params: string[] = [];
    
    // Parse parameters: -param1-param2-param3
    while (this.match(TokenType.Dash)) {
      const param = this.consume(TokenType.Identifier, "Expected parameter name after '-'");
      params.push(param.value);
    }
    
    this.consume(TokenType.Underscore, "Expected '_' to start function body");
    const body = this.blockStatement();
    return new FunctionDefStmt(name.value, params, body);
  }

  // !name-args @result OR !alert-args OR !return-value
  private functionCall(): ASTNode {
    if (this.check(TokenType.Alert)) {
      this.advance(); // consume 'alert'
      const args = this.parseArgumentList();
      return new AlertStmt(args);
    }
    
    if (this.check(TokenType.Return)) {
      this.advance(); // consume 'return'
      this.consume(TokenType.Dash, "Expected '-' after 'return'");
      const value = this.expression();
      return new ReturnStmt(value);
    }
    
    // Regular function call: !funcname-arg1-arg2@result
    if (this.check(TokenType.Identifier)) {
      const name = this.advance().value;
      const args = this.parseArgumentList();
      
      let resultVar: string | undefined;
      if (this.match(TokenType.At)) {
        const varToken = this.consume(TokenType.Identifier, "Expected variable name after '@'");
        resultVar = varToken.value;
      }
      
      return new FunctionCallStmt(name, args, resultVar);
    }
    
    throw new Error("Expected function name after '!'");
  }

  // Parse -arg1-arg2-"string"-arg3 etc.
  private parseArgumentList(): ASTNode[] {
    const args: ASTNode[] = [];
    
    while (this.match(TokenType.Dash)) {
      args.push(this.primary());
    }
    
    return args;
  }

  // :if_body_:else_body_
  private ifStatement(): IfStmt {
    this.consume(TokenType.Colon, "Expected ':'");
    this.consume(TokenType.If, "Expected 'if'");
    this.consume(TokenType.Underscore, "Expected '_' after 'if'");
    const thenBranch = this.blockStatement();
    
    let elseBranch: BlockStmt | undefined;
    if (this.check(TokenType.Colon) && this.peekNext()?.type === TokenType.Else) {
      this.advance(); // consume ':'
      this.advance(); // consume 'else'
      this.consume(TokenType.Underscore, "Expected '_' after 'else'");
      elseBranch = this.blockStatement();
    }
    
    // Use the last expression as the condition
    const condition = this.lastExpression || new LiteralExpr(1);
    return new IfStmt(condition, thenBranch, elseBranch);
  }

  // ^label_try_^label_catch_
  private tryStatement(): TryStmt {
    const label = this.consume(TokenType.Identifier, "Expected label after '^'");
    this.consume(TokenType.Underscore, "Expected '_' after label");
    const tryBlock = this.blockStatement();
    
    this.consume(TokenType.Caret, "Expected '^' for catch block");
    this.consume(TokenType.Identifier, "Expected same label for catch block");
    this.consume(TokenType.Underscore, "Expected '_' after catch label");
    const catchBlock = this.blockStatement();
    
    return new TryStmt(label.value, tryBlock, catchBlock);
  }

  private blockStatement(): BlockStmt {
    const statements: ASTNode[] = [];
    
    while (!this.check(TokenType.Underscore) && !this.isAtEnd()) {
      const stmt = this.statement();
      if (stmt) {
        statements.push(stmt);
      }
    }
    
    this.consume(TokenType.Underscore, "Expected '_' to close block");
    return new BlockStmt(statements);
  }

  private expression(): ASTNode {
    return this.chainExpression();
  }

  // Handle chained expressions like *x&+y& or *x&+3&*y&
  private chainExpression(): ASTNode {
    let expr = this.primary();
    
    const chain: ASTNode[] = [expr];
    
    while (this.match(TokenType.Ampersand)) {
      if (this.checkOperator()) {
        const operator = this.advance().value;
        chain.push(new LiteralExpr(operator));
        
        // Expect another value after operator
        if (this.match(TokenType.Ampersand)) {
          chain.push(this.primary());
        } else {
          throw new Error("Expected value after operator in chain");
        }
      } else {
        throw new Error("Expected operator after '&'");
      }
    }
    
    if (chain.length > 1) {
      return new ChainExpr(chain);
    }
    
    return expr;
  }

  private primary(): ASTNode {
    if (this.match(TokenType.Number)) {
      const value = this.previous().value;
      return new LiteralExpr(parseInt(value, 10));
    }
    
    if (this.match(TokenType.String)) {
      const value = this.previous().value;
      return new LiteralExpr(value);
    }
    
    // Check for implicit value reference (no * prefix in chains)
    if (this.match(TokenType.Identifier)) {
      const value = this.previous().value;
      return new IdentifierExpr(value);
    }
    
    throw new Error(`Unexpected token: ${this.peek().type} at line ${this.peek().line}`);
  }

  private checkOperator(): boolean {
    return this.check(TokenType.Plus) ||
           this.check(TokenType.Dash) ||
           this.check(TokenType.Asterisk) ||
           this.check(TokenType.Slash) ||
           this.check(TokenType.Percent) ||
           this.check(TokenType.EqualEqual) ||
           this.check(TokenType.BangEqual) ||
           this.check(TokenType.Greater) ||
           this.check(TokenType.GreaterEqual) ||
           this.check(TokenType.Less) ||
           this.check(TokenType.LessEqual);
  }

  // Utility methods
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private peekNext(): Token | null {
    if (this.current + 1 >= this.tokens.length) return null;
    return this.tokens[this.current + 1];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    
    const current = this.peek();
    throw new Error(`${message}. Got ${current.type} at line ${current.line}, column ${current.column}`);
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.Underscore) return;

      switch (this.peek().type) {
        case TokenType.Asterisk:
        case TokenType.Tilde:
        case TokenType.Bang:
        case TokenType.Colon:
        case TokenType.Caret:
          return;
      }

      this.advance();
    }
  }
}
