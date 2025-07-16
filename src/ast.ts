// Abstract Syntax Tree definitions for bombLang

export abstract class ASTNode {
  abstract accept<T>(visitor: ASTVisitor<T>): T;
}

export interface ASTVisitor<T> {
  visitLiteralExpr(expr: LiteralExpr): T;
  visitIdentifierExpr(expr: IdentifierExpr): T;
  visitBinaryExpr(expr: BinaryExpr): T;
  visitChainExpr(expr: ChainExpr): T;
  visitAssignmentStmt(stmt: AssignmentStmt): T;
  visitFunctionDefStmt(stmt: FunctionDefStmt): T;
  visitFunctionCallStmt(stmt: FunctionCallStmt): T;
  visitReturnStmt(stmt: ReturnStmt): T;
  visitAlertStmt(stmt: AlertStmt): T;
  visitIfStmt(stmt: IfStmt): T;
  visitTryStmt(stmt: TryStmt): T;
  visitBlockStmt(stmt: BlockStmt): T;
  visitProgram(program: Program): T;
}

// Expressions
export class LiteralExpr extends ASTNode {
  constructor(public value: string | number) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitLiteralExpr(this);
  }
}

export class IdentifierExpr extends ASTNode {
  constructor(public name: string) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitIdentifierExpr(this);
  }
}

export class BinaryExpr extends ASTNode {
  constructor(
    public left: ASTNode,
    public operator: string,
    public right: ASTNode
  ) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }
}

export class ChainExpr extends ASTNode {
  constructor(public expressions: ASTNode[]) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitChainExpr(this);
  }
}

// Statements
export class AssignmentStmt extends ASTNode {
  constructor(public expression: ASTNode, public variable: string) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitAssignmentStmt(this);
  }
}

export class FunctionDefStmt extends ASTNode {
  constructor(public name: string, public params: string[], public body: BlockStmt) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitFunctionDefStmt(this);
  }
}

export class FunctionCallStmt extends ASTNode {
  constructor(
    public name: string,
    public args: ASTNode[],
    public resultVar?: string
  ) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitFunctionCallStmt(this);
  }
}

export class ReturnStmt extends ASTNode {
  constructor(public value: ASTNode) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitReturnStmt(this);
  }
}

export class AlertStmt extends ASTNode {
  constructor(public args: ASTNode[]) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitAlertStmt(this);
  }
}

export class IfStmt extends ASTNode {
  constructor(
    public condition: ASTNode,
    public thenBranch: BlockStmt,
    public elseBranch?: BlockStmt
  ) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitIfStmt(this);
  }
}

export class TryStmt extends ASTNode {
  constructor(
    public label: string,
    public tryBlock: BlockStmt,
    public catchBlock: BlockStmt
  ) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitTryStmt(this);
  }
}

export class BlockStmt extends ASTNode {
  constructor(public statements: ASTNode[]) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitBlockStmt(this);
  }
}

export class Program extends ASTNode {
  constructor(public statements: ASTNode[]) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitProgram(this);
  }
}
