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
    
    // Handle built-in explode command for testing error handling
    if (stmt.name === 'explode') {
      const label = stmt.args.length > 0 ? String(stmt.args[0].accept(this)) : undefined;
      const message = stmt.args.length > 1 ? String(stmt.args[1].accept(this)) : "Manual explosion!";
      throw new BombLangError(message, label);
    }

    // Handle user-defined functions
    const func = this.functions.get(stmt.name);
    if (!func) {
      throw new BombLangError(`Unknown function: ${stmt.name}`);
    }

    // Evaluate arguments in the current scope BEFORE creating new frame
    const argValues = stmt.args.map(arg => arg.accept(this));

    // Create new scope for function
    this.pushFrame();
    
    let functionResult = 0;
    
    try {
      // Set up parameters using pre-evaluated values
      argValues.forEach((argValue, index) => {
        if (index < func.params.length) {
          this.setVariable(func.params[index], argValue);
        }
      });

      // Execute function body
      func.body.accept(this);

      // If we get here without a return, return 0
      functionResult = 0;
    } catch (error) {
      if (error instanceof ReturnValue) {
        functionResult = error.value;
      } else {
        throw error;
      }
    } finally {
      // Pop frame first to get back to calling scope
      this.popFrame();
    }
    
    // Now we're back in the calling scope, set the result variable if specified
    if (stmt.resultVar) {
      this.setVariable(stmt.resultVar, functionResult);
    }
    
    return functionResult;
  }

  visitReturnStmt(stmt: ReturnStmt): any {
    const value = stmt.value.accept(this);
    throw new ReturnValue(value);
  }

  visitAlertStmt(stmt: AlertStmt): any {
    const messages = stmt.args.map(arg => String(arg.accept(this)));
    console.log(messages.join(' '));
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
      if (error instanceof BombLangError) {
        // If the error has a label, only catch it if it matches
        if (error.label) {
          if (error.label === stmt.label) {
            stmt.catchBlock.accept(this);
          } else {
            // Re-throw labeled errors with different labels
            throw error;
          }
        } else {
          // Catch unlabeled bombLang errors
          stmt.catchBlock.accept(this);
        }
      } else if (error instanceof ReturnValue) {
        // Don't catch return statements
        throw error;
      } else {
        // Catch any other runtime errors
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

    if (expr.expressions.length === 1) {
      return expr.expressions[0].accept(this);
    }

    // Process chain: value op value op value...
    let result = expr.expressions[0].accept(this);
    
    for (let i = 1; i < expr.expressions.length; i += 2) {
      if (i + 1 >= expr.expressions.length) {
        throw new BombLangError("Incomplete chain expression - missing operand");
      }
      
      const operator = expr.expressions[i].accept(this); // Should be operator literal
      const rightValue = expr.expressions[i + 1].accept(this);
      
      // Apply the operation
      switch (String(operator)) {
        case '+': result = Number(result) + Number(rightValue); break;
        case '-': result = Number(result) - Number(rightValue); break;
        case '*': result = Number(result) * Number(rightValue); break;
        case '/': 
          if (Number(rightValue) === 0) {
            throw new BombLangError("Division by zero explosion!");
          }
          result = Math.floor(Number(result) / Number(rightValue)); 
          break;
        case '%': result = Number(result) % Number(rightValue); break;
        case '==': result = Number(result) === Number(rightValue) ? 1 : 0; break;
        case '!=': result = Number(result) !== Number(rightValue) ? 1 : 0; break;
        case '>': result = Number(result) > Number(rightValue) ? 1 : 0; break;
        case '>=': result = Number(result) >= Number(rightValue) ? 1 : 0; break;
        case '<': result = Number(result) < Number(rightValue) ? 1 : 0; break;
        case '<=': result = Number(result) <= Number(rightValue) ? 1 : 0; break;
        default:
          throw new BombLangError(`Unknown operator in chain: ${operator}`);
      }
    }
    
    return result;
  }

  private pushFrame(): void {
    // Save current locals on the stack
    this.callStack.push({
      vars: new Map(this.locals)
    });
    // Clear locals for new function scope
    this.locals = new Map();
  }

  private popFrame(): void {
    const frame = this.callStack.pop();
    if (frame) {
      // Restore previous local scope
      this.locals = frame.vars;
    } else {
      // No frame to restore, clear locals (back to global scope)
      this.locals = new Map();
    }
  }

  private setVariable(name: string, value: any): void {
    // Always set variables in the current scope
    // If we're in a function (callStack.length > 0), use locals
    // Otherwise use globals
    if (this.callStack.length > 0) {
      this.locals.set(name, value);
    } else {
      this.globals.set(name, value);
    }
  }

  private getVariable(name: string): any {
    // Check locals first (if we're in a function), then globals
    if (this.callStack.length > 0 && this.locals.has(name)) {
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
