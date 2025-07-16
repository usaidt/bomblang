import {
  ASTNode, ASTVisitor, Program, BlockStmt, AssignmentStmt,
  FunctionDefStmt, FunctionCallStmt, ReturnStmt, AlertStmt,
  IfStmt, TryStmt, LiteralExpr, IdentifierExpr, BinaryExpr, ChainExpr
} from './ast';

export class BombLangError extends Error {
  constructor(message: string, public label?: string) {
    super(message);
    this.name = 'BombLangError';
  }
}

export class ReturnValue extends Error {
  constructor(public value: any) {
    super();
    this.name = 'ReturnValue';
  }
}

interface Function {
  name: string;
  params: string[];
  body: BlockStmt;
}

interface Frame {
  vars: Map<string, any>;
}

export class Interpreter implements ASTVisitor<any> {
  private globals = new Map<string, any>();
  private locals = new Map<string, any>();
  private functions = new Map<string, Function>();
  private callStack: Frame[] = [];

  constructor() {
    // Initialize built-in functions
    this.setupBuiltins();
  }

  private setupBuiltins(): void {
    // Built-in functions are handled in visitFunctionCallStmt
  }

  public interpret(program: Program): void {
    try {
      program.accept(this);
    } catch (error) {
      if (error instanceof BombLangError) {
        console.error(`💥 Explosion! ${error.message}`);
      } else if (error instanceof ReturnValue) {
        // Return at global scope is ignored
      } else {
        console.error(`💥 Unexpected explosion: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  visitProgram(program: Program): any {
    for (const stmt of program.statements) {
      stmt.accept(this);
    }
  }

  visitBlockStmt(stmt: BlockStmt): any {
    for (const statement of stmt.statements) {
      statement.accept(this);
    }
  }

  visitAssignmentStmt(stmt: AssignmentStmt): any {
    const value = stmt.expression.accept(this);
    this.setVariable(stmt.variable, value);
  }

  visitFunctionDefStmt(stmt: FunctionDefStmt): any {
    this.functions.set(stmt.name, {
      name: stmt.name,
      params: stmt.params,
      body: stmt.body
    });
  }

  visitFunctionCallStmt(stmt: FunctionCallStmt): any {
    // Handle built-in functions
    if (stmt.name === 'alert') {
      throw new Error("Alert should be handled as AlertStmt");
    }

    // Handle user-defined functions
    const func = this.functions.get(stmt.name);
    if (!func) {
      throw new BombLangError(`Unknown function: ${stmt.name}`);
    }

    // Create new scope for function
    this.pushFrame();
    
    try {
      // Set up parameters
      stmt.args.forEach((arg, index) => {
        const argValue = arg.accept(this); // Evaluate the argument expression
        if (index < func.params.length) {
          this.setVariable(func.params[index], argValue);
        }
      });

      // Execute function body
      func.body.accept(this);

      // If we get here without a return, return 0
      let result = 0;
      
      if (stmt.resultVar) {
        this.setVariable(stmt.resultVar, result);
      }
      
      return result;
    } catch (error) {
      if (error instanceof ReturnValue) {
        const result = error.value;
        if (stmt.resultVar) {
          this.setVariable(stmt.resultVar, result);
        }
        return result;
      }
      throw error;
    } finally {
      this.popFrame();
    }
  }

  visitReturnStmt(stmt: ReturnStmt): any {
    const value = stmt.value.accept(this);
    throw new ReturnValue(value);
  }

  visitAlertStmt(stmt: AlertStmt): any {
    const messages = stmt.args.map(arg => String(arg.accept(this)));
    console.log(messages.join(''));
  }

  visitIfStmt(stmt: IfStmt): any {
    const condition = stmt.condition.accept(this);
    
    // In bombLang, conditions are expressions that should be evaluated
    // For now, treat any non-zero value as true
    if (this.isTruthy(condition)) {
      stmt.thenBranch.accept(this);
    } else if (stmt.elseBranch) {
      stmt.elseBranch.accept(this);
    }
  }

  visitTryStmt(stmt: TryStmt): any {
    try {
      stmt.tryBlock.accept(this);
    } catch (error) {
      if (error instanceof BombLangError && error.label === stmt.label) {
        stmt.catchBlock.accept(this);
      } else if (error instanceof BombLangError) {
        // Re-throw labeled errors with different labels
        throw error;
      } else {
        // Catch any other errors
        stmt.catchBlock.accept(this);
      }
    }
  }

  visitLiteralExpr(expr: LiteralExpr): any {
    return expr.value;
  }

  visitIdentifierExpr(expr: IdentifierExpr): any {
    return this.getVariable(expr.name);
  }

  visitBinaryExpr(expr: BinaryExpr): any {
    const left = expr.left.accept(this);
    const right = expr.right.accept(this);

    switch (expr.operator) {
      case '+': return Number(left) + Number(right);
      case '-': return Number(left) - Number(right);
      case '*': return Number(left) * Number(right);
      case '/': 
        if (Number(right) === 0) {
          throw new BombLangError("Division by zero!");
        }
        return Math.floor(Number(left) / Number(right));
      case '%': return Number(left) % Number(right);
      case '==': return Number(left) === Number(right) ? 1 : 0;
      case '!=': return Number(left) !== Number(right) ? 1 : 0;
      case '>': return Number(left) > Number(right) ? 1 : 0;
      case '>=': return Number(left) >= Number(right) ? 1 : 0;
      case '<': return Number(left) < Number(right) ? 1 : 0;
      case '<=': return Number(left) <= Number(right) ? 1 : 0;
      default:
        throw new BombLangError(`Unknown operator: ${expr.operator}`);
    }
  }

  visitChainExpr(expr: ChainExpr): any {
    if (expr.expressions.length === 0) {
      return 0;
    }

    let result = expr.expressions[0].accept(this);
    
    // Process chain left-to-right: value op value op value...
    for (let i = 1; i < expr.expressions.length; i += 2) {
      if (i + 1 >= expr.expressions.length) break;
      
      const operator = expr.expressions[i].accept(this); // Should be operator literal
      const rightValue = expr.expressions[i + 1].accept(this);
      
      // Create temporary binary expression
      const binaryExpr = new BinaryExpr(
        new LiteralExpr(result),
        String(operator),
        new LiteralExpr(rightValue)
      );
      
      result = this.visitBinaryExpr(binaryExpr);
    }
    
    return result;
  }

  private pushFrame(): void {
    this.callStack.push({
      vars: new Map(this.locals)
    });
    this.locals.clear();
  }

  private popFrame(): void {
    const frame = this.callStack.pop();
    if (frame) {
      this.locals = frame.vars;
    }
  }

  private setVariable(name: string, value: any): void {
    if (this.callStack.length > 0) {
      this.locals.set(name, value);
    } else {
      this.globals.set(name, value);
    }
  }

  private getVariable(name: string): any {
    // Check locals first, then globals
    if (this.locals.has(name)) {
      return this.locals.get(name);
    }
    
    if (this.globals.has(name)) {
      return this.globals.get(name);
    }
    
    throw new BombLangError(`Undefined variable: ${name}`);
  }

  private isTruthy(value: any): boolean {
    if (typeof value === 'number') {
      return value !== 0;
    }
    if (typeof value === 'string') {
      return value.length > 0;
    }
    return Boolean(value);
  }

  // Debug method to see current state
  public getState(): { globals: Map<string, any>, locals: Map<string, any>, functions: string[] } {
    return {
      globals: new Map(this.globals),
      locals: new Map(this.locals),
      functions: Array.from(this.functions.keys())
    };
  }
}
