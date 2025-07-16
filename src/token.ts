export enum TokenType {
  // Core symbols needed for bombLang
  Asterisk = "ASTERISK", // * - value reference and multiplication
  At = "AT", // @ - variable assignment
  Ampersand = "AMPERSAND", // & - chain separator
  Bang = "BANG", // ! - function call/commands
  Tilde = "TILDE", // ~ - function definition
  Colon = "COLON", // : - conditionals
  Caret = "CARET", // ^ - error handling
  Dash = "DASH", // - - parameter separator and subtraction
  Underscore = "UNDERSCORE", // _ - block delimiters

  // Literals
  Number = "NUMBER",
  String = "STRING", 
  Identifier = "IDENTIFIER",

  // Operators (used in chains)
  Plus = "PLUS", // +
  Slash = "SLASH", // /
  Percent = "PERCENT", // %
  EqualEqual = "EQUAL_EQUAL", // ==
  BangEqual = "BANG_EQUAL", // !=
  Greater = "GREATER", // >
  GreaterEqual = "GREATER_EQUAL", // >=
  Less = "LESS", // <
  LessEqual = "LESS_EQUAL", // <=

  // Keywords
  If = "IF",
  Else = "ELSE", 
  Return = "RETURN",
  Alert = "ALERT",

  // Misc
  Comment = "COMMENT",
  EOF = "EOF",
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}
