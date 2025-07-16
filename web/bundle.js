/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ast.ts":
/*!********************!*\
  !*** ./src/ast.ts ***!
  \********************/
/***/ ((__unused_webpack_module, exports) => {


// Abstract Syntax Tree definitions for bombLang
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Program = exports.BlockStmt = exports.TryStmt = exports.IfStmt = exports.AlertStmt = exports.ReturnStmt = exports.FunctionCallStmt = exports.FunctionDefStmt = exports.AssignmentStmt = exports.ChainExpr = exports.BinaryExpr = exports.IdentifierExpr = exports.LiteralExpr = exports.ASTNode = void 0;
class ASTNode {
}
exports.ASTNode = ASTNode;
// Expressions
class LiteralExpr extends ASTNode {
    constructor(value) {
        super();
        this.value = value;
    }
    accept(visitor) {
        return visitor.visitLiteralExpr(this);
    }
}
exports.LiteralExpr = LiteralExpr;
class IdentifierExpr extends ASTNode {
    constructor(name) {
        super();
        this.name = name;
    }
    accept(visitor) {
        return visitor.visitIdentifierExpr(this);
    }
}
exports.IdentifierExpr = IdentifierExpr;
class BinaryExpr extends ASTNode {
    constructor(left, operator, right) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) {
        return visitor.visitBinaryExpr(this);
    }
}
exports.BinaryExpr = BinaryExpr;
class ChainExpr extends ASTNode {
    constructor(expressions) {
        super();
        this.expressions = expressions;
    }
    accept(visitor) {
        return visitor.visitChainExpr(this);
    }
}
exports.ChainExpr = ChainExpr;
// Statements
class AssignmentStmt extends ASTNode {
    constructor(expression, variable) {
        super();
        this.expression = expression;
        this.variable = variable;
    }
    accept(visitor) {
        return visitor.visitAssignmentStmt(this);
    }
}
exports.AssignmentStmt = AssignmentStmt;
class FunctionDefStmt extends ASTNode {
    constructor(name, params, body) {
        super();
        this.name = name;
        this.params = params;
        this.body = body;
    }
    accept(visitor) {
        return visitor.visitFunctionDefStmt(this);
    }
}
exports.FunctionDefStmt = FunctionDefStmt;
class FunctionCallStmt extends ASTNode {
    constructor(name, args, resultVar) {
        super();
        this.name = name;
        this.args = args;
        this.resultVar = resultVar;
    }
    accept(visitor) {
        return visitor.visitFunctionCallStmt(this);
    }
}
exports.FunctionCallStmt = FunctionCallStmt;
class ReturnStmt extends ASTNode {
    constructor(value) {
        super();
        this.value = value;
    }
    accept(visitor) {
        return visitor.visitReturnStmt(this);
    }
}
exports.ReturnStmt = ReturnStmt;
class AlertStmt extends ASTNode {
    constructor(args) {
        super();
        this.args = args;
    }
    accept(visitor) {
        return visitor.visitAlertStmt(this);
    }
}
exports.AlertStmt = AlertStmt;
class IfStmt extends ASTNode {
    constructor(condition, thenBranch, elseBranch) {
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }
    accept(visitor) {
        return visitor.visitIfStmt(this);
    }
}
exports.IfStmt = IfStmt;
class TryStmt extends ASTNode {
    constructor(label, tryBlock, catchBlock) {
        super();
        this.label = label;
        this.tryBlock = tryBlock;
        this.catchBlock = catchBlock;
    }
    accept(visitor) {
        return visitor.visitTryStmt(this);
    }
}
exports.TryStmt = TryStmt;
class BlockStmt extends ASTNode {
    constructor(statements) {
        super();
        this.statements = statements;
    }
    accept(visitor) {
        return visitor.visitBlockStmt(this);
    }
}
exports.BlockStmt = BlockStmt;
class Program extends ASTNode {
    constructor(statements) {
        super();
        this.statements = statements;
    }
    accept(visitor) {
        return visitor.visitProgram(this);
    }
}
exports.Program = Program;


/***/ }),

/***/ "./src/interpreter.ts":
/*!****************************!*\
  !*** ./src/interpreter.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Interpreter = exports.ReturnValue = exports.BombLangError = void 0;
class BombLangError extends Error {
    constructor(message, label) {
        super(message);
        this.label = label;
        this.name = 'BombLangError';
    }
}
exports.BombLangError = BombLangError;
class ReturnValue extends Error {
    constructor(value) {
        super();
        this.value = value;
        this.name = 'ReturnValue';
    }
}
exports.ReturnValue = ReturnValue;
class Interpreter {
    constructor() {
        this.globals = new Map();
        this.locals = new Map();
        this.functions = new Map();
        this.callStack = [];
        // Initialize built-in functions
        this.setupBuiltins();
    }
    setupBuiltins() {
        // Built-in functions are handled in visitFunctionCallStmt
    }
    interpret(program) {
        try {
            program.accept(this);
        }
        catch (error) {
            if (error instanceof BombLangError) {
                console.error(`💥 Explosion! ${error.message}`);
            }
            else if (error instanceof ReturnValue) {
                // Return at global scope is ignored
            }
            else {
                console.error(`💥 Unexpected explosion: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }
    visitProgram(program) {
        for (const stmt of program.statements) {
            stmt.accept(this);
        }
    }
    visitBlockStmt(stmt) {
        for (const statement of stmt.statements) {
            statement.accept(this);
        }
    }
    visitAssignmentStmt(stmt) {
        const value = stmt.expression.accept(this);
        this.setVariable(stmt.variable, value);
    }
    visitFunctionDefStmt(stmt) {
        this.functions.set(stmt.name, {
            name: stmt.name,
            params: stmt.params,
            body: stmt.body
        });
    }
    visitFunctionCallStmt(stmt) {
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
        }
        catch (error) {
            if (error instanceof ReturnValue) {
                functionResult = error.value;
            }
            else {
                throw error;
            }
        }
        finally {
            // Pop frame first to get back to calling scope
            this.popFrame();
        }
        // Now we're back in the calling scope, set the result variable if specified
        if (stmt.resultVar) {
            this.setVariable(stmt.resultVar, functionResult);
        }
        return functionResult;
    }
    visitReturnStmt(stmt) {
        const value = stmt.value.accept(this);
        throw new ReturnValue(value);
    }
    visitAlertStmt(stmt) {
        const messages = stmt.args.map(arg => String(arg.accept(this)));
        console.log(messages.join(' '));
    }
    visitIfStmt(stmt) {
        const condition = stmt.condition.accept(this);
        // In bombLang, conditions are expressions that should be evaluated
        // For now, treat any non-zero value as true
        if (this.isTruthy(condition)) {
            stmt.thenBranch.accept(this);
        }
        else if (stmt.elseBranch) {
            stmt.elseBranch.accept(this);
        }
    }
    visitTryStmt(stmt) {
        try {
            stmt.tryBlock.accept(this);
        }
        catch (error) {
            if (error instanceof BombLangError) {
                // If the error has a label, only catch it if it matches
                if (error.label) {
                    if (error.label === stmt.label) {
                        stmt.catchBlock.accept(this);
                    }
                    else {
                        // Re-throw labeled errors with different labels
                        throw error;
                    }
                }
                else {
                    // Catch unlabeled bombLang errors
                    stmt.catchBlock.accept(this);
                }
            }
            else if (error instanceof ReturnValue) {
                // Don't catch return statements
                throw error;
            }
            else {
                // Catch any other runtime errors
                stmt.catchBlock.accept(this);
            }
        }
    }
    visitLiteralExpr(expr) {
        return expr.value;
    }
    visitIdentifierExpr(expr) {
        return this.getVariable(expr.name);
    }
    visitBinaryExpr(expr) {
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
    visitChainExpr(expr) {
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
                case '+':
                    result = Number(result) + Number(rightValue);
                    break;
                case '-':
                    result = Number(result) - Number(rightValue);
                    break;
                case '*':
                    result = Number(result) * Number(rightValue);
                    break;
                case '/':
                    if (Number(rightValue) === 0) {
                        throw new BombLangError("Division by zero explosion!");
                    }
                    result = Math.floor(Number(result) / Number(rightValue));
                    break;
                case '%':
                    result = Number(result) % Number(rightValue);
                    break;
                case '==':
                    result = Number(result) === Number(rightValue) ? 1 : 0;
                    break;
                case '!=':
                    result = Number(result) !== Number(rightValue) ? 1 : 0;
                    break;
                case '>':
                    result = Number(result) > Number(rightValue) ? 1 : 0;
                    break;
                case '>=':
                    result = Number(result) >= Number(rightValue) ? 1 : 0;
                    break;
                case '<':
                    result = Number(result) < Number(rightValue) ? 1 : 0;
                    break;
                case '<=':
                    result = Number(result) <= Number(rightValue) ? 1 : 0;
                    break;
                default:
                    throw new BombLangError(`Unknown operator in chain: ${operator}`);
            }
        }
        return result;
    }
    pushFrame() {
        // Save current locals on the stack
        this.callStack.push({
            vars: new Map(this.locals)
        });
        // Clear locals for new function scope
        this.locals = new Map();
    }
    popFrame() {
        const frame = this.callStack.pop();
        if (frame) {
            // Restore previous local scope
            this.locals = frame.vars;
        }
        else {
            // No frame to restore, clear locals (back to global scope)
            this.locals = new Map();
        }
    }
    setVariable(name, value) {
        // Always set variables in the current scope
        // If we're in a function (callStack.length > 0), use locals
        // Otherwise use globals
        if (this.callStack.length > 0) {
            this.locals.set(name, value);
        }
        else {
            this.globals.set(name, value);
        }
    }
    getVariable(name) {
        // Check locals first (if we're in a function), then globals
        if (this.callStack.length > 0 && this.locals.has(name)) {
            return this.locals.get(name);
        }
        if (this.globals.has(name)) {
            return this.globals.get(name);
        }
        throw new BombLangError(`Undefined variable: ${name}`);
    }
    isTruthy(value) {
        if (typeof value === 'number') {
            return value !== 0;
        }
        if (typeof value === 'string') {
            return value.length > 0;
        }
        return Boolean(value);
    }
    // Debug method to see current state
    getState() {
        return {
            globals: new Map(this.globals),
            locals: new Map(this.locals),
            functions: Array.from(this.functions.keys())
        };
    }
}
exports.Interpreter = Interpreter;


/***/ }),

/***/ "./src/lexer.ts":
/*!**********************!*\
  !*** ./src/lexer.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Lexer = void 0;
const token_1 = __webpack_require__(/*! ./token */ "./src/token.ts");
class Lexer {
    constructor(input) {
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.input = input;
    }
    tokenize() {
        const tokens = [];
        let token;
        let tokenCount = 0;
        do {
            try {
                token = this.nextToken();
                if (token.type !== token_1.TokenType.Comment) {
                    tokens.push(token);
                }
                tokenCount++;
                // Safety check to prevent infinite loops
                if (tokenCount > 1000) {
                    throw new Error(`Tokenization aborted: too many tokens (${tokenCount}). Possible infinite loop.`);
                }
            }
            catch (error) {
                console.error(`Error at position ${this.position}, line ${this.line}, column ${this.column}:`);
                console.error(`Current character: "${this.current()}" (code: ${this.current().charCodeAt(0)})`);
                throw error;
            }
        } while (token.type !== token_1.TokenType.EOF);
        return tokens;
    }
    nextToken() {
        // Skip any whitespace characters silently
        this.skipWhitespace();
        if (this.isAtEnd()) {
            return this.createToken(token_1.TokenType.EOF, "");
        }
        const char = this.current();
        const token = this.scanToken(char);
        if (token) {
            return token;
        }
        throw new Error(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
    }
    scanToken(char) {
        switch (char) {
            case '*': return this.createToken(token_1.TokenType.Asterisk, this.advance());
            case '@': return this.createToken(token_1.TokenType.At, this.advance());
            case '&': return this.createToken(token_1.TokenType.Ampersand, this.advance());
            case '~': return this.createToken(token_1.TokenType.Tilde, this.advance());
            case ':': return this.createToken(token_1.TokenType.Colon, this.advance());
            case '^': return this.createToken(token_1.TokenType.Caret, this.advance());
            case '_': return this.createToken(token_1.TokenType.Underscore, this.advance());
            case '+': return this.createToken(token_1.TokenType.Plus, this.advance());
            case '-': return this.createToken(token_1.TokenType.Dash, this.advance());
            case '%': return this.createToken(token_1.TokenType.Percent, this.advance());
            case '!':
                // Look ahead for !=
                if (this.peek() === '=') {
                    this.advance(); // consume !
                    this.advance(); // consume =
                    return this.createToken(token_1.TokenType.BangEqual, '!=');
                }
                else {
                    return this.createToken(token_1.TokenType.Bang, this.advance());
                }
            case '=':
                // Look ahead for ==
                if (this.peek() === '=') {
                    this.advance(); // consume first =
                    this.advance(); // consume second =
                    return this.createToken(token_1.TokenType.EqualEqual, '==');
                }
                else {
                    return null; // Single '=' is not a valid token
                }
            case '>':
                // Look ahead for >=
                if (this.peek() === '=') {
                    this.advance(); // consume >
                    this.advance(); // consume =
                    return this.createToken(token_1.TokenType.GreaterEqual, '>=');
                }
                else {
                    return this.createToken(token_1.TokenType.Greater, this.advance());
                }
            case '<':
                // Look ahead for <=
                if (this.peek() === '=') {
                    this.advance(); // consume <
                    this.advance(); // consume =
                    return this.createToken(token_1.TokenType.LessEqual, '<=');
                }
                else {
                    return this.createToken(token_1.TokenType.Less, this.advance());
                }
            case '/':
                if (this.match('/')) {
                    return this.comment();
                }
                return this.createToken(token_1.TokenType.Slash, this.advance());
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
    comment() {
        const startColumn = this.column - 2; // Account for '//'
        const startPosition = this.position - 2; // Start of '//'
        while (!this.isAtEnd() && this.current() !== '\n') {
            this.advance();
        }
        return {
            type: token_1.TokenType.Comment,
            value: this.input.substring(startPosition, this.position),
            line: this.line,
            column: startColumn,
        };
    }
    string() {
        const startColumn = this.column;
        this.advance(); // Consume opening "
        const start = this.position;
        while (!this.isAtEnd() && this.current() !== '"') {
            if (this.current() === '\n') {
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
        return { type: token_1.TokenType.String, value, line: this.line, column: startColumn };
    }
    number() {
        const start = this.position;
        this.advance(); // Consume the first digit
        while (!this.isAtEnd() && this.isDigit(this.current())) {
            this.advance();
        }
        const value = this.input.substring(start, this.position);
        return this.createToken(token_1.TokenType.Number, value);
    }
    identifier() {
        const start = this.position;
        this.advance(); // Consume the first character
        while (!this.isAtEnd() && this.isAlphaNumeric(this.current())) {
            this.advance();
        }
        const value = this.input.substring(start, this.position);
        const type = this.getKeyword(value) || token_1.TokenType.Identifier;
        return this.createToken(type, value);
    }
    getKeyword(value) {
        switch (value) {
            case "if": return token_1.TokenType.If;
            case "else": return token_1.TokenType.Else;
            case "return": return token_1.TokenType.Return;
            case "alert": return token_1.TokenType.Alert;
            default: return null;
        }
    }
    createToken(type, value) {
        return { type, value, line: this.line, column: this.column - value.length };
    }
    advance() {
        const char = this.input[this.position];
        this.position++;
        this.column++;
        return char;
    }
    match(expected) {
        // Check the next character, not the current one
        if (this.position + 1 >= this.input.length)
            return false;
        if (this.input[this.position + 1] !== expected)
            return false;
        this.advance(); // Consume the next character
        return true;
    }
    peek() {
        if (this.position + 1 >= this.input.length)
            return '\0';
        return this.input[this.position + 1];
    }
    current() {
        if (this.isAtEnd())
            return '\0';
        return this.input[this.position];
    }
    isAtEnd() {
        return this.position >= this.input.length;
    }
    skipWhitespace() {
        while (!this.isAtEnd()) {
            const char = this.current();
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
    skipNewlines() {
        while (this.peek() === '\n' && !this.isAtEnd()) {
            this.line++;
            this.column = 1;
            this.advance();
        }
    }
    isDigit(char) {
        return char >= '0' && char <= '9';
    }
    isAlpha(char) {
        return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
    }
    isAlphaNumeric(char) {
        return this.isAlpha(char) || this.isDigit(char);
    }
}
exports.Lexer = Lexer;


/***/ }),

/***/ "./src/parser.ts":
/*!***********************!*\
  !*** ./src/parser.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Parser = void 0;
const token_1 = __webpack_require__(/*! ./token */ "./src/token.ts");
const ast_1 = __webpack_require__(/*! ./ast */ "./src/ast.ts");
class Parser {
    constructor(tokens) {
        this.current = 0;
        this.lastExpression = null; // Track last expression for conditionals
        this.tokens = tokens;
    }
    parse() {
        const statements = [];
        while (!this.isAtEnd()) {
            const stmt = this.statement();
            if (stmt) {
                statements.push(stmt);
            }
        }
        return new ast_1.Program(statements);
    }
    statement() {
        try {
            // *expression @variable
            if (this.match(token_1.TokenType.Asterisk)) {
                return this.assignmentStatement();
            }
            // ~name-param1-param2_body_
            if (this.match(token_1.TokenType.Tilde)) {
                return this.functionDefinition();
            }
            // !function-args OR !alert-args OR !return-value
            if (this.match(token_1.TokenType.Bang)) {
                return this.functionCall();
            }
            // :if_body_:else_body_ (uses lastExpression as condition)
            if (this.check(token_1.TokenType.Colon)) {
                return this.ifStatement();
            }
            // ^label_try_^label_catch_
            if (this.match(token_1.TokenType.Caret)) {
                return this.tryStatement();
            }
            // Skip over unknown tokens
            this.advance();
            return null;
        }
        catch (error) {
            // Skip to next statement on error
            this.synchronize();
            return null;
        }
    }
    // *expression @variable
    assignmentStatement() {
        const expression = this.expression();
        this.lastExpression = expression; // Store for potential conditional use
        // Check if this is actually a conditional (expression followed by :if)
        if (this.check(token_1.TokenType.Colon) && this.peekNext()?.type === token_1.TokenType.If) {
            return this.ifStatement();
        }
        this.consume(token_1.TokenType.At, "Expected '@' after expression in assignment");
        const varName = this.consume(token_1.TokenType.Identifier, "Expected variable name after '@'");
        return new ast_1.AssignmentStmt(expression, varName.value);
    }
    // ~name-param1-param2_body_
    functionDefinition() {
        const name = this.consume(token_1.TokenType.Identifier, "Expected function name after '~'");
        const params = [];
        // Parse parameters: -param1-param2-param3
        while (this.match(token_1.TokenType.Dash)) {
            const param = this.consume(token_1.TokenType.Identifier, "Expected parameter name after '-'");
            params.push(param.value);
        }
        this.consume(token_1.TokenType.Underscore, "Expected '_' to start function body");
        const body = this.blockStatement();
        return new ast_1.FunctionDefStmt(name.value, params, body);
    }
    // !name-args @result OR !alert-args OR !return-value
    functionCall() {
        if (this.check(token_1.TokenType.Alert)) {
            this.advance(); // consume 'alert'
            const args = this.parseAlertArguments();
            return new ast_1.AlertStmt(args);
        }
        if (this.check(token_1.TokenType.Return)) {
            this.advance(); // consume 'return'
            const value = this.expression();
            return new ast_1.ReturnStmt(value);
        }
        // Regular function call: !funcname-arg1-arg2@result OR !funcname arg1 arg2@result
        if (this.check(token_1.TokenType.Identifier)) {
            const name = this.advance().value;
            const args = this.parseFunctionArguments();
            let resultVar;
            if (this.match(token_1.TokenType.At)) {
                const varToken = this.consume(token_1.TokenType.Identifier, "Expected variable name after '@'");
                resultVar = varToken.value;
            }
            return new ast_1.FunctionCallStmt(name, args, resultVar);
        }
        throw new Error("Expected function name after '!'");
    }
    // Parse -arg1-arg2-"string"-arg3 etc.
    parseArgumentList() {
        const args = [];
        while (this.match(token_1.TokenType.Dash)) {
            args.push(this.primary());
        }
        return args;
    }
    // Parse arguments for alert statements (no dashes required)
    parseAlertArguments() {
        const args = [];
        // Parse all following expressions until we hit a statement boundary
        while (!this.isAtEnd() &&
            !this.check(token_1.TokenType.Bang) &&
            !this.check(token_1.TokenType.Asterisk) &&
            !this.check(token_1.TokenType.Tilde) &&
            !this.check(token_1.TokenType.Caret) &&
            !this.check(token_1.TokenType.Colon) &&
            !this.check(token_1.TokenType.Underscore)) {
            args.push(this.primary());
        }
        return args;
    }
    // :if_body_:else_body_
    ifStatement() {
        this.consume(token_1.TokenType.Colon, "Expected ':'");
        this.consume(token_1.TokenType.If, "Expected 'if'");
        this.consume(token_1.TokenType.Underscore, "Expected '_' after 'if'");
        const thenBranch = this.blockStatement();
        let elseBranch;
        if (this.check(token_1.TokenType.Colon) && this.peekNext()?.type === token_1.TokenType.Else) {
            this.advance(); // consume ':'
            this.advance(); // consume 'else'
            this.consume(token_1.TokenType.Underscore, "Expected '_' after 'else'");
            elseBranch = this.blockStatement();
        }
        // Use the last expression as the condition
        const condition = this.lastExpression || new ast_1.LiteralExpr(1);
        return new ast_1.IfStmt(condition, thenBranch, elseBranch);
    }
    // ^label_try_^label_catch_
    tryStatement() {
        const label = this.consume(token_1.TokenType.Identifier, "Expected label after '^'");
        this.consume(token_1.TokenType.Underscore, "Expected '_' after label");
        const tryBlock = this.blockStatement();
        this.consume(token_1.TokenType.Caret, "Expected '^' for catch block");
        this.consume(token_1.TokenType.Identifier, "Expected same label for catch block");
        this.consume(token_1.TokenType.Underscore, "Expected '_' after catch label");
        const catchBlock = this.blockStatement();
        return new ast_1.TryStmt(label.value, tryBlock, catchBlock);
    }
    blockStatement() {
        const statements = [];
        while (!this.check(token_1.TokenType.Underscore) && !this.isAtEnd()) {
            const stmt = this.statement();
            if (stmt) {
                statements.push(stmt);
            }
        }
        this.consume(token_1.TokenType.Underscore, "Expected '_' to close block");
        return new ast_1.BlockStmt(statements);
    }
    expression() {
        return this.chainExpression();
    }
    // Handle chained expressions like *x&+&y&+&z& or *5&+&3&*&2&
    chainExpression() {
        let expr = this.primary();
        const chain = [expr];
        while (this.match(token_1.TokenType.Ampersand)) {
            if (this.checkOperator()) {
                const operator = this.advance().value;
                chain.push(new ast_1.LiteralExpr(operator));
                // Expect another ampersand and then a value
                this.consume(token_1.TokenType.Ampersand, "Expected '&' after operator in chain");
                chain.push(this.primary());
            }
            else {
                throw new Error("Expected operator after '&'");
            }
        }
        if (chain.length > 1) {
            return new ast_1.ChainExpr(chain);
        }
        return expr;
    }
    primary() {
        if (this.match(token_1.TokenType.Number)) {
            const value = this.previous().value;
            return new ast_1.LiteralExpr(parseInt(value, 10));
        }
        if (this.match(token_1.TokenType.String)) {
            const value = this.previous().value;
            return new ast_1.LiteralExpr(value);
        }
        // Check for implicit value reference (no * prefix in chains)
        if (this.match(token_1.TokenType.Identifier)) {
            const value = this.previous().value;
            return new ast_1.IdentifierExpr(value);
        }
        throw new Error(`Unexpected token: ${this.peek().type} at line ${this.peek().line}`);
    }
    checkOperator() {
        return this.check(token_1.TokenType.Plus) ||
            this.check(token_1.TokenType.Dash) ||
            this.check(token_1.TokenType.Asterisk) ||
            this.check(token_1.TokenType.Slash) ||
            this.check(token_1.TokenType.Percent) ||
            this.check(token_1.TokenType.EqualEqual) ||
            this.check(token_1.TokenType.BangEqual) ||
            this.check(token_1.TokenType.Greater) ||
            this.check(token_1.TokenType.GreaterEqual) ||
            this.check(token_1.TokenType.Less) ||
            this.check(token_1.TokenType.LessEqual);
    }
    // Parse arguments for function calls (supports both -arg1-arg2 and arg1 arg2 styles)
    parseFunctionArguments() {
        const args = [];
        // Check if we're using dash-separated style (-arg1-arg2)
        if (this.check(token_1.TokenType.Dash)) {
            while (this.match(token_1.TokenType.Dash)) {
                args.push(this.primary());
            }
        }
        else {
            // Use space-separated style (arg1 arg2) - parse until @ or statement boundary
            while (!this.isAtEnd() &&
                !this.check(token_1.TokenType.At) &&
                !this.check(token_1.TokenType.Bang) &&
                !this.check(token_1.TokenType.Asterisk) &&
                !this.check(token_1.TokenType.Tilde) &&
                !this.check(token_1.TokenType.Caret) &&
                !this.check(token_1.TokenType.Colon) &&
                !this.check(token_1.TokenType.Underscore)) {
                args.push(this.primary());
            }
        }
        return args;
    }
    // Utility methods
    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    check(type) {
        if (this.isAtEnd())
            return false;
        return this.peek().type === type;
    }
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.previous();
    }
    isAtEnd() {
        return this.peek().type === token_1.TokenType.EOF;
    }
    peek() {
        return this.tokens[this.current];
    }
    peekNext() {
        if (this.current + 1 >= this.tokens.length)
            return null;
        return this.tokens[this.current + 1];
    }
    previous() {
        return this.tokens[this.current - 1];
    }
    consume(type, message) {
        if (this.check(type))
            return this.advance();
        const current = this.peek();
        throw new Error(`${message}. Got ${current.type} at line ${current.line}, column ${current.column}`);
    }
    synchronize() {
        this.advance();
        while (!this.isAtEnd()) {
            if (this.previous().type === token_1.TokenType.Underscore)
                return;
            switch (this.peek().type) {
                case token_1.TokenType.Asterisk:
                case token_1.TokenType.Tilde:
                case token_1.TokenType.Bang:
                case token_1.TokenType.Colon:
                case token_1.TokenType.Caret:
                    return;
            }
            this.advance();
        }
    }
}
exports.Parser = Parser;


/***/ }),

/***/ "./src/token.ts":
/*!**********************!*\
  !*** ./src/token.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    // Core symbols needed for bombLang
    TokenType["Asterisk"] = "ASTERISK";
    TokenType["At"] = "AT";
    TokenType["Ampersand"] = "AMPERSAND";
    TokenType["Bang"] = "BANG";
    TokenType["Tilde"] = "TILDE";
    TokenType["Colon"] = "COLON";
    TokenType["Caret"] = "CARET";
    TokenType["Dash"] = "DASH";
    TokenType["Underscore"] = "UNDERSCORE";
    // Literals
    TokenType["Number"] = "NUMBER";
    TokenType["String"] = "STRING";
    TokenType["Identifier"] = "IDENTIFIER";
    // Operators (used in chains)
    TokenType["Plus"] = "PLUS";
    TokenType["Slash"] = "SLASH";
    TokenType["Percent"] = "PERCENT";
    TokenType["EqualEqual"] = "EQUAL_EQUAL";
    TokenType["BangEqual"] = "BANG_EQUAL";
    TokenType["Greater"] = "GREATER";
    TokenType["GreaterEqual"] = "GREATER_EQUAL";
    TokenType["Less"] = "LESS";
    TokenType["LessEqual"] = "LESS_EQUAL";
    // Keywords
    TokenType["If"] = "IF";
    TokenType["Else"] = "ELSE";
    TokenType["Return"] = "RETURN";
    TokenType["Alert"] = "ALERT";
    // Misc
    TokenType["Comment"] = "COMMENT";
    TokenType["EOF"] = "EOF";
})(TokenType || (exports.TokenType = TokenType = {}));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!********************!*\
  !*** ./web/app.ts ***!
  \********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const lexer_1 = __webpack_require__(/*! ../src/lexer */ "./src/lexer.ts");
const parser_1 = __webpack_require__(/*! ../src/parser */ "./src/parser.ts");
const interpreter_1 = __webpack_require__(/*! ../src/interpreter */ "./src/interpreter.ts");
const token_1 = __webpack_require__(/*! ../src/token */ "./src/token.ts");
// Comprehensive example code snippets for the REPL
const examples = {
    // Beginner Examples
    simple: `// Simple variable assignment
*5 @x
*10 @y
!alert "Variables assigned!"`,
    strings: `// String literals and concatenation
*"Hello" @greeting
*"World" @target
!alert greeting target`,
    operators: `// Basic arithmetic operations
*5 @x
*3 @y
*x & + & y @sum
*x & * & y @product
!alert "Sum:" sum "Product:" product`,
    alerts: `// Alert messages
!alert "Welcome to BombLang!"
*42 @answer
!alert "The answer is" answer`,
    // Intermediate Examples
    functions: `// Function definition and calling
~double-n_*n & * & 2 @doubled !return doubled_

*7 @num
!double num @result
!alert "Double of" num "is" result`,
    conditionals: `// Conditional statements
*15 @x
*x & > & 10:if_
  !alert "x is greater than 10"
_:else_
  !alert "x is not greater than 10"
_`,
    comparisons: `// Comparison operations
*5 & != & 3 @result1
*2 & <= & 7 @result2
*9 & >= & 4 @result3
!alert "Results:" result1 result2 result3`,
    chained: `// Chained operations with functions
~double-n_*n & * & 2 @doubled !return doubled_
~quadruple-n_!double n @temp !double temp @quad !return quad_

*7 @num
!quadruple num @final
!alert "Quadruple of" num "is" final`,
    // Advanced Examples
    recursion: `// Recursive factorial function
~factorial-n_*n & <= & 1:if_!return 1_*n & - & 1 @prev !factorial prev @prevfact *n & * & prevfact @result !return result_

*5 @input
!factorial input @result
!alert "Factorial of" input "is" result`,
    fibonacci: `// Fibonacci with recursive approach
~fibonacci-n_*n & <= & 1:if_!return n_*n & - & 1 @prev1 *n & - & 2 @prev2 !fibonacci prev1 @fib1 !fibonacci prev2 @fib2 *fib1 & + & fib2 @result !return result_

*8 @num
!fibonacci num @fib
!alert "Fibonacci of" num "is" fib`,
    errors: `// Error handling with try-catch
~safeDivide-a-b_*b & == & 0:if_!explode "divzero" "Cannot divide by zero!"_*a & / & b @result !return result_

*10 @numerator
*0 @denominator

^divzero_!safeDivide numerator denominator @result !alert "Result:" result_^divzero_!alert "Division by zero caught!"_`,
    complex: `// Complex calculation with multiple features
~isEven-num_*num & % & 2 & == & 0 @check !return check_
~complexCalc-a-b_*a & * & b @step1 *step1 & + & 10 @step2 !isEven step2 @evenCheck !return step2_

*12 @x
*8 @y
!complexCalc x y @result
!alert "Complex result:" result`,
    // Experimental Examples
    nested: `// Nested function calls
~add-a-b_*a & + & b @sum !return sum_
~multiply-a-b_*a & * & b @product !return product_
~addThenMultiply-a-b-c_!add a b @sum !multiply sum c @result !return result_

*3 @x
*4 @y
*5 @z
!addThenMultiply x y z @final
!alert "Result of (3+4)*5 =" final`,
    memoization: `// Fibonacci with step-by-step calculation
~fibonacci-n_
  !alert "Calculating fibonacci of" n
  *n & <= & 1:if_
    !alert "Base case reached"
    !return n
  _
  *n & - & 1 @prev1
  *n & - & 2 @prev2
  !fibonacci prev1 @fib1
  !fibonacci prev2 @fib2
  *fib1 & + & fib2 @result
  !return result
_

*5 @test
!fibonacci test @result
!alert "Final result:" result`,
    validators: `// Input validation example
~validateAge-age_
  *age & < & 0:if_
    !alert "Age cannot be negative"
    !return 0
  _
  *age & > & 150:if_
    !alert "Age seems too high"
    !return 0  
  _
  !alert "Valid age:" age
  !return 1
_

*25 @myAge
!validateAge myAge @valid`,
    utilities: `// Math utility functions
~isEven-num_*num & % & 2 & == & 0 @check !return check_
~isOdd-num_!isEven num @evencheck *evencheck & == & 0 @oddcheck !return oddcheck_
~max-a-b_*a & > & b:if_!return a_!return b_

*15 @testval
!isOdd testval @odd
!isEven testval @even
!alert "15 is odd:" odd "even:" even

*10 @x
*20 @y
!max x y @maximum
!alert "Max of" x "and" y "is" maximum`
};
const testCases = [
    {
        name: "Simple variable assignment",
        input: "*5 @x",
        expected: [
            { type: token_1.TokenType.Asterisk, value: "*" },
            { type: token_1.TokenType.Number, value: "5" },
            { type: token_1.TokenType.At, value: "@" },
            { type: token_1.TokenType.Identifier, value: "x" },
            { type: token_1.TokenType.EOF, value: "" }
        ]
    },
    {
        name: "String literal",
        input: '*"Hello World" @greeting',
        expected: [
            { type: token_1.TokenType.Asterisk, value: "*" },
            { type: token_1.TokenType.String, value: "Hello World" },
            { type: token_1.TokenType.At, value: "@" },
            { type: token_1.TokenType.Identifier, value: "greeting" },
            { type: token_1.TokenType.EOF, value: "" }
        ]
    },
    {
        name: "Arithmetic expression",
        input: "*x & + & y @sum",
        expected: [
            { type: token_1.TokenType.Asterisk, value: "*" },
            { type: token_1.TokenType.Identifier, value: "x" },
            { type: token_1.TokenType.Ampersand, value: "&" },
            { type: token_1.TokenType.Plus, value: "+" },
            { type: token_1.TokenType.Ampersand, value: "&" },
            { type: token_1.TokenType.Identifier, value: "y" },
            { type: token_1.TokenType.At, value: "@" },
            { type: token_1.TokenType.Identifier, value: "sum" },
            { type: token_1.TokenType.EOF, value: "" }
        ]
    },
    {
        name: "Function call",
        input: '!alert "Boom!"',
        expected: [
            { type: token_1.TokenType.Bang, value: "!" },
            { type: token_1.TokenType.Alert, value: "alert" },
            { type: token_1.TokenType.String, value: "Boom!" },
            { type: token_1.TokenType.EOF, value: "" }
        ]
    },
    {
        name: "Comparison operators",
        input: "*x & == & 5",
        expected: [
            { type: token_1.TokenType.Asterisk, value: "*" },
            { type: token_1.TokenType.Identifier, value: "x" },
            { type: token_1.TokenType.Ampersand, value: "&" },
            { type: token_1.TokenType.EqualEqual, value: "==" },
            { type: token_1.TokenType.Ampersand, value: "&" },
            { type: token_1.TokenType.Number, value: "5" },
            { type: token_1.TokenType.EOF, value: "" }
        ]
    },
    {
        name: "Comments",
        input: "// This is a comment\n*5 @x",
        expected: [
            { type: token_1.TokenType.Asterisk, value: "*" },
            { type: token_1.TokenType.Number, value: "5" },
            { type: token_1.TokenType.At, value: "@" },
            { type: token_1.TokenType.Identifier, value: "x" },
            { type: token_1.TokenType.EOF, value: "" }
        ]
    },
    {
        name: "Complex expression with braces",
        input: "~add-a-b_*a&+&b@result!return-result_",
        expected: [
            { type: token_1.TokenType.Tilde, value: "~" },
            { type: token_1.TokenType.Identifier, value: "add" },
            { type: token_1.TokenType.Dash, value: "-" },
            { type: token_1.TokenType.Identifier, value: "a" },
            { type: token_1.TokenType.Dash, value: "-" },
            { type: token_1.TokenType.Identifier, value: "b" },
            { type: token_1.TokenType.Underscore, value: "_" },
            { type: token_1.TokenType.Asterisk, value: "*" },
            { type: token_1.TokenType.Identifier, value: "a" },
            { type: token_1.TokenType.Ampersand, value: "&" },
            { type: token_1.TokenType.Plus, value: "+" },
            { type: token_1.TokenType.Ampersand, value: "&" },
            { type: token_1.TokenType.Identifier, value: "b" },
            { type: token_1.TokenType.At, value: "@" },
            { type: token_1.TokenType.Identifier, value: "result" },
            { type: token_1.TokenType.Bang, value: "!" },
            { type: token_1.TokenType.Return, value: "return" },
            { type: token_1.TokenType.Dash, value: "-" },
            { type: token_1.TokenType.Identifier, value: "result" },
            { type: token_1.TokenType.Underscore, value: "_" },
            { type: token_1.TokenType.EOF, value: "" }
        ]
    }
];
class WebREPL {
    constructor() {
        this.stats = {
            tokensProcessed: 0,
            examplesRun: 0,
            errorsCaught: 0
        };
        this.codeInput = document.getElementById('code-input');
        this.output = document.getElementById('output');
        this.executionOutput = document.getElementById('execution-output');
        this.errorSection = document.getElementById('error-section');
        this.errorOutput = document.getElementById('error-output');
        this.testResults = document.getElementById('test-results');
        this.interpreter = new interpreter_1.Interpreter();
        // Override the interpreter's alert function to show in the web UI
        this.setupInterpreterAlert();
        this.setupEventListeners();
    }
    setupInterpreterAlert() {
        // Store the original console.log
        const originalLog = console.log;
        // Override console.log to capture interpreter output
        console.log = (...args) => {
            const message = args.join(' ');
            this.addToExecutionOutput(message);
            originalLog.apply(console, args);
        };
    }
    addToExecutionOutput(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.executionOutput.textContent += `[${timestamp}] ${message}\n`;
        this.executionOutput.scrollTop = this.executionOutput.scrollHeight;
    }
    setupEventListeners() {
        // Tokenize button
        const tokenizeBtn = document.getElementById('tokenize-btn');
        tokenizeBtn?.addEventListener('click', () => this.tokenizeCode());
        // Run button
        const runBtn = document.getElementById('run-btn');
        runBtn?.addEventListener('click', () => this.runCode());
        // Clear button
        const clearBtn = document.getElementById('clear-btn');
        clearBtn?.addEventListener('click', () => this.clearAll());
        // Example buttons
        const exampleBtns = document.querySelectorAll('.example-btn-small');
        exampleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target;
                const exampleType = target.getAttribute('data-example');
                this.loadExample(exampleType);
            });
        });
        // Test button
        const testBtn = document.getElementById('run-tests-btn');
        testBtn?.addEventListener('click', () => this.runTests());
        // Test examples button
        const testExamplesBtn = document.getElementById('run-examples-btn');
        testExamplesBtn?.addEventListener('click', () => this.testAllExamples());
        // Enter key in textarea
        this.codeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.runCode();
            }
        });
    }
    tokenizeCode() {
        const code = this.codeInput.value.trim();
        if (!code) {
            this.showError("Please enter some BombLang code to tokenize.");
            return;
        }
        try {
            this.hideError();
            const lexer = new lexer_1.Lexer(code);
            const tokens = lexer.tokenize();
            this.displayTokens(tokens);
            this.stats.tokensProcessed += tokens.length;
            this.updateStats();
        }
        catch (error) {
            this.stats.errorsCaught++;
            this.updateStats();
            this.showError(error instanceof Error ? error.message : "An unknown error occurred.");
        }
    }
    runCode() {
        const code = this.codeInput.value.trim();
        if (!code) {
            this.showError("Please enter some BombLang code to run.");
            return;
        }
        try {
            this.hideError();
            this.executionOutput.textContent = ""; // Clear previous output
            this.addToExecutionOutput("🚀 Starting execution...");
            const lexer = new lexer_1.Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new parser_1.Parser(tokens);
            const ast = parser.parse();
            this.interpreter.interpret(ast);
            this.addToExecutionOutput("✅ Execution completed successfully!");
            this.stats.tokensProcessed += tokens.length;
            this.stats.examplesRun++;
            this.updateStats();
            // Also show tokens for debugging
            this.displayTokens(tokens);
        }
        catch (error) {
            this.stats.errorsCaught++;
            this.updateStats();
            const errorMsg = error instanceof Error ? error.message : "An unknown error occurred.";
            this.addToExecutionOutput(`💥 Explosion: ${errorMsg}`);
            this.showError(errorMsg);
        }
    }
    displayTokens(tokens) {
        this.output.innerHTML = '';
        if (tokens.length === 1 && tokens[0].type === token_1.TokenType.EOF) {
            this.output.innerHTML = '<div class="token">No tokens found (empty input)</div>';
            return;
        }
        tokens.forEach((token, index) => {
            if (token.type !== token_1.TokenType.EOF) {
                const tokenElement = document.createElement('div');
                tokenElement.className = 'token';
                tokenElement.innerHTML = `
                    <span class="token-type">${token.type}</span>: 
                    <span class="token-value">'${this.escapeHtml(token.value)}'</span>
                    <span class="token-position">(line ${token.line}, col ${token.column})</span>
                `;
                this.output.appendChild(tokenElement);
            }
        });
        // Add a summary
        const nonEofTokens = tokens.filter(t => t.type !== token_1.TokenType.EOF);
        const summary = document.createElement('div');
        summary.style.marginTop = '15px';
        summary.style.padding = '10px';
        summary.style.background = '#e7f3ff';
        summary.style.borderRadius = '6px';
        summary.style.borderLeft = '4px solid #007bff';
        summary.innerHTML = `<strong>Summary:</strong> Found ${nonEofTokens.length} tokens`;
        this.output.appendChild(summary);
    }
    showError(message) {
        this.errorOutput.textContent = message;
        this.errorSection.style.display = 'block';
    }
    hideError() {
        this.errorSection.style.display = 'none';
    }
    clearAll() {
        this.codeInput.value = '';
        this.output.innerHTML = '';
        this.executionOutput.textContent = 'Ready for explosive code! 💣';
        this.hideError();
        this.codeInput.focus();
    }
    loadExample(exampleType) {
        this.codeInput.value = examples[exampleType];
        this.hideError();
        this.output.innerHTML = '';
        this.executionOutput.textContent = `Loaded ${exampleType} example - ready to explode! 💥`;
        this.codeInput.focus();
        this.stats.examplesRun++;
        this.updateStats();
    }
    testAllExamples() {
        this.testResults.innerHTML = '<div>🧪 Testing all examples...</div>';
        let passed = 0;
        let failed = 0;
        const results = [];
        Object.entries(examples).forEach(([name, code]) => {
            try {
                const lexer = new lexer_1.Lexer(code);
                const tokens = lexer.tokenize();
                const parser = new parser_1.Parser(tokens);
                const ast = parser.parse();
                // Create a temporary interpreter for testing
                const testInterpreter = new interpreter_1.Interpreter();
                testInterpreter.interpret(ast);
                passed++;
                results.push(`<div class="test-pass">✅ ${name} - Example runs successfully</div>`);
            }
            catch (error) {
                failed++;
                const errorMsg = error instanceof Error ? error.message : "Unknown error";
                results.push(`<div class="test-fail">❌ ${name}<br>&nbsp;&nbsp;&nbsp;&nbsp;Error: ${errorMsg}</div>`);
            }
        });
        // Display results
        const summaryClass = failed === 0 ? 'success' : 'failure';
        const summaryText = `Example tests completed: ${passed} passed, ${failed} failed`;
        this.testResults.innerHTML = `
            <div class="test-summary ${summaryClass}">${summaryText}</div>
            ${results.join('')}
        `;
    }
    runTests() {
        this.testResults.innerHTML = '<div>🧪 Running lexer tests...</div>';
        let passed = 0;
        let failed = 0;
        const results = [];
        testCases.forEach((testCase, index) => {
            try {
                const lexer = new lexer_1.Lexer(testCase.input);
                const tokens = lexer.tokenize();
                // Compare tokens
                let testPassed = true;
                let errorMessage = '';
                if (tokens.length !== testCase.expected.length) {
                    testPassed = false;
                    errorMessage = `Expected ${testCase.expected.length} tokens, got ${tokens.length}`;
                }
                else {
                    for (let i = 0; i < tokens.length; i++) {
                        if (tokens[i].type !== testCase.expected[i].type ||
                            tokens[i].value !== testCase.expected[i].value) {
                            testPassed = false;
                            errorMessage = `Token ${i}: expected ${testCase.expected[i].type}:'${testCase.expected[i].value}', got ${tokens[i].type}:'${tokens[i].value}'`;
                            break;
                        }
                    }
                }
                if (testPassed) {
                    passed++;
                    results.push(`<div class="test-pass">✅ ${testCase.name}</div>`);
                }
                else {
                    failed++;
                    results.push(`<div class="test-fail">❌ ${testCase.name}<br>&nbsp;&nbsp;&nbsp;&nbsp;${errorMessage}</div>`);
                }
            }
            catch (error) {
                failed++;
                const errorMsg = error instanceof Error ? error.message : "Unknown error";
                results.push(`<div class="test-fail">❌ ${testCase.name}<br>&nbsp;&nbsp;&nbsp;&nbsp;Error: ${errorMsg}</div>`);
            }
        });
        // Display results
        const summaryClass = failed === 0 ? 'success' : 'failure';
        const summaryText = `Lexer tests completed: ${passed} passed, ${failed} failed`;
        this.testResults.innerHTML = `
            <div class="test-summary ${summaryClass}">${summaryText}</div>
            ${results.join('')}
        `;
    }
    updateStats() {
        const tokensEl = document.getElementById('tokens-processed');
        const examplesEl = document.getElementById('examples-run');
        const errorsEl = document.getElementById('errors-caught');
        if (tokensEl)
            tokensEl.textContent = this.stats.tokensProcessed.toString();
        if (examplesEl)
            examplesEl.textContent = this.stats.examplesRun.toString();
        if (errorsEl)
            errorsEl.textContent = this.stats.errorsCaught.toString();
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
// Initialize the REPL when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WebREPL();
});

})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map