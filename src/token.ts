export enum TokenType {
  // Symbols
  Asterisk = "ASTERISK", // *
  At = "AT", // @
  Ampersand = "AMPERSAND", // &
  Bang = "BANG", // !
  Tilde = "TILDE", // ~
  Colon = "COLON", // :
  Caret = "CARET", // ^
  LBrace = "LBRACE", // {
  RBrace = "RBRACE", // }
  LParen = "LPAREN", // (
  RParen = "RPAREN", // )
  Dash = "DASH", // -
  Underscore = "UNDERSCORE", // _

  // Literals
  Number = "NUMBER",
  String = "STRING",
  Identifier = "IDENTIFIER",

  // Operators
  Plus = "PLUS", // +
  Minus = "MINUS", // -
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