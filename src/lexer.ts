import { Token, TokenType } from "./token";

export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    let token: Token;
    let tokenCount = 0;
    
    do {
      try {
        token = this.nextToken();
        
        if (token.type !== TokenType.Comment) {
          tokens.push(token);
        }
        tokenCount++;
        
        // Safety check to prevent infinite loops
        if (tokenCount > 1000) {
          throw new Error(`Tokenization aborted: too many tokens (${tokenCount}). Possible infinite loop.`);
        }
      } catch (error) {
        console.error(`Error at position ${this.position}, line ${this.line}, column ${this.column}:`);
        console.error(`Current character: "${this.current()}" (code: ${this.current().charCodeAt(0)})`);
        throw error;
      }
    } while (token.type !== TokenType.EOF);
    
    return tokens;
  }

  private nextToken(): Token {
    // Skip any whitespace characters silently
    this.skipWhitespace();

    if (this.isAtEnd()) {
      return this.createToken(TokenType.EOF, "");
    }

    const char = this.current();
    
    const token = this.scanToken(char);
    if (token) {
      return token;
    }

    throw new Error(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
  }

  private scanToken(char: string): Token | null {
    switch (char) {
      case '*': return this.createToken(TokenType.Asterisk, this.advance());
      case '@': return this.createToken(TokenType.At, this.advance());
      case '&': return this.createToken(TokenType.Ampersand, this.advance());
      case '~': return this.createToken(TokenType.Tilde, this.advance());
      case ':': return this.createToken(TokenType.Colon, this.advance());
      case '^': return this.createToken(TokenType.Caret, this.advance());
      case '_': return this.createToken(TokenType.Underscore, this.advance());
      case '+': return this.createToken(TokenType.Plus, this.advance());
      case '-': return this.createToken(TokenType.Dash, this.advance());
      case '%': return this.createToken(TokenType.Percent, this.advance());
      case '!':
        // Look ahead for !=
        if (this.peek() === '=') {
          this.advance(); // consume !
          this.advance(); // consume =
          return this.createToken(TokenType.BangEqual, '!=');
        } else {
          return this.createToken(TokenType.Bang, this.advance());
        }
      case '=':
        // Look ahead for ==
        if (this.peek() === '=') {
          this.advance(); // consume first =
          this.advance(); // consume second =
          return this.createToken(TokenType.EqualEqual, '==');
        } else {
          return null; // Single '=' is not a valid token
        }
      case '>':
        // Look ahead for >=
        if (this.peek() === '=') {
          this.advance(); // consume >
          this.advance(); // consume =
          return this.createToken(TokenType.GreaterEqual, '>=');
        } else {
          return this.createToken(TokenType.Greater, this.advance());
        }
      case '<':
        // Look ahead for <=
        if (this.peek() === '=') {
          this.advance(); // consume <
          this.advance(); // consume =
          return this.createToken(TokenType.LessEqual, '<=');
        } else {
          return this.createToken(TokenType.Less, this.advance());
        }
      case '/':
        if (this.match('/')) {
          return this.comment();
        }
        return this.createToken(TokenType.Slash, this.advance());
      case '"':
        return this.string();
    }

    if (this.isDigit(char)) {
      return this.number();
    }

    if (this.isAlpha(char)) {
      return this.identifier();
    }

    return null;
  }

  private comment(): Token {
    const startColumn = this.column - 2; // Account for '//'
    const startPosition = this.position - 2; // Start of '//'
    
    while (this.peek() !== '\n' && !this.isAtEnd()) {
      this.advance();
    }
    
    return {
      type: TokenType.Comment,
      value: this.input.substring(startPosition, this.position),
      line: this.line,
      column: startColumn,
    };
  }

  private string(): Token {
    const startColumn = this.column;
    this.advance(); // Consume opening "
    const start = this.position;
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line++;
        this.column = 1;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      throw new Error(`Unterminated string at line ${this.line}, column ${startColumn}`);
    }

    const value = this.input.substring(start, this.position);
    this.advance(); // Consume closing "
    return { type: TokenType.String, value, line: this.line, column: startColumn };
  }

  private number(): Token {
    const start = this.position;
    this.advance(); // Consume the first digit
    while (this.isDigit(this.peek())) {
      this.advance();
    }
    const value = this.input.substring(start, this.position);
    return this.createToken(TokenType.Number, value);
  }

  private identifier(): Token {
    const start = this.position;
    this.advance(); // Consume the first character
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }
    const value = this.input.substring(start, this.position);
    const type = this.getKeyword(value) || TokenType.Identifier;
    return this.createToken(type, value);
  }

  private getKeyword(value: string): TokenType | null {
    switch (value) {
      case "if": return TokenType.If;
      case "else": return TokenType.Else;
      case "return": return TokenType.Return;
      case "alert": return TokenType.Alert;
      default: return null;
    }
  }

  private createToken(type: TokenType, value: string): Token {
    return { type, value, line: this.line, column: this.column - value.length };
  }

  private advance(): string {
    const char = this.input[this.position];
    this.position++;
    this.column++;
    return char;
  }

  private match(expected: string): boolean {
    // Check the next character, not the current one
    if (this.position + 1 >= this.input.length) return false;
    if (this.input[this.position + 1] !== expected) return false;
    this.advance(); // Consume the next character
    return true;
  }

  private peek(): string {
    if (this.position + 1 >= this.input.length) return '\0';
    return this.input[this.position + 1];
  }

  private current(): string {
    if (this.isAtEnd()) return '\0';
    return this.input[this.position];
  }

  private isAtEnd(): boolean {
    return this.position >= this.input.length;
  }

  private skipWhitespace(): void {
    while (true) {
      const char = this.peek();
      switch (char) {
        case ' ':
        case '\r':
        case '\t':
          this.advance();
          break;
        case '\n':
          this.line++;
          this.column = 1;
          this.advance();
          break;
        default:
          return;
      }
    }
  }

  private skipNewlines(): void {
    while (this.peek() === '\n' && !this.isAtEnd()) {
      this.line++;
      this.column = 1;
      this.advance();
    }
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
}