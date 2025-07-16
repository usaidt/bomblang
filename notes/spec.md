# 💣 bombLang – Language Specification

### 📄 Overview

**bombLang** is an esoteric programming language built on explosive metaphors. Variables are bombs, functions are fuses, and calls are detonations. It focuses on minimal syntax, symbolic operations, and playful semantics. 

**CRITICAL RULE: NO WHITESPACE ALLOWED** (except inside string literals). Any space, tab, carriage return, or newline characters outside of strings will cause a lexical error. This makes bombLang extremely compact and forces precise syntax. Code flows continuously like brainfuck.

---

### 🔧 Core Concepts

| Concept        | Syntax Example              | Description                                                 |
| -------------- | --------------------------- | ----------------------------------------------------------- |
| Variable       | `*5@x`                      | Creates a bomb (value 5) named `x`                          |
| Arithmetic     | `*x&+y&@z`                  | Chains operations: value of x + value of y → z              |
| Function       | `~add-x-y_...code..._`      | Declares function `add` with parameters `x` and `y`         |
| Function Call  | `!add-x-y@sum`              | Calls function `add` with args `x` and `y`, result in `sum` |
| Conditional    | `*x&>5&:if_...code..._:else_...code..._`  | Conditional blocks based on preceding expression |
| Error Handling | `^label_...try..._^label_...catch..._`    | Try block, with matching catch block        |
| Return         | `!return-val`               | Returns value from a function                               |
| Output         | `!alert-x-"msg"-y`          | Prints concatenated values/strings                          |
| Comments       | `//Thisisacomment`          | Ignored by interpreter (no spaces in comments!)            |

---

### 🧠 Memory Model

* All variables reside in a global scope or local function scope.
* Values are stored as integers (future support for string, list, bool).

---

### 🔣 Syntax Breakdown

#### 🧨 Variable Declaration

```bomb
*5@x           // Assign literal 5 to variable x
*x&+3&@y       // y = x + 3 (value of x, then literal 3)
```

#### 🔁 Arithmetic Chains

```bomb
*x&+y&@z       // z = x + y (value of x + value of y)
*z&*2&+3&@w    // w = z * 2 + 3 (value of z * literal 2 + literal 3)
```

**Pattern**: `*` starts expression, `&` separates values/operations, literals come after `&`
Supported operators: `+`, `-`, `*`, `/`, `%`, `==`, `!=`, `>`, `<`, `>=`, `<=`

#### 🔩 Fuse (Function) Definition

```bomb
~add-x-y_*x&+y&@result!return-result_
~multiply-a-b-c_*a&*b&*c&@result!return-result_
```

**Pattern**: `~name-param1-param2-..._code_`

#### 💥 Detonation (Function Call)

```bomb
*4@a*6@b!add-a-b@sum   // Calls add(a,b), stores result in sum
!multiply-2-3-4@product // Calls multiply with literals 2,3,4
```

**Pattern**: `!funcname-arg1-arg2-...@resultvar` (optional @resultvar)

#### ⏳ Conditionals

```bomb
*z&>10&:if_!alert-"Toopowerful!"_:else_!alert-"Safe."_
```

**Pattern**: Expression followed by `:if_code_:else_code_` (else is optional)

#### 🧯 Error Handling

```bomb
^explode_*0&/0&@div_^explode_!alert-"Explosiondefused!"_
```

**Pattern**: `^label_trycode_^label_catchcode_`

---

### 🔥 Special Commands

| Command   | Purpose          | Example |
| --------- | ---------------- | ------- |
| `!alert-args...`  | Print concatenated output  | `!alert-x-"sum:"-y` |
| `!return-value` | Return from fuse | `!return-42` |

---

### 🧪 Sample Program

```bomb
//Multiplytwovauesandreportiftheresultistoobig
*5@x*7@y~multiply-a-b_*a&*b&@result!return-result_!multiply-x-y@z*z&>30&:if_!alert-"Bigboom!"_:else_!alert-"Controlleddemotion."_
```

**Breaking it down:**
- `*5@x*7@y` - Set x=5, y=7
- `~multiply-a-b_*a&*b&@result!return-result_` - Define multiply function
- `!multiply-x-y@z` - Call multiply with x,y store in z
- `*z&>30&:if_...` - If z > 30 then print "Bigboom!" else "Controlleddemotion."

---

## 🏗️ bombLang – Implementation Plan (Go)

### 🎯 Goal

Build a minimal interpreter in Go for bombLang that supports:

* Variables
* Arithmetic
* Function calls
* Conditionals
* Basic error handling
* Output

---

### 🧱 Project Structure

```
bombLang/
├── main.go           // CLI entrypoint
├── lexer.go          // Tokenizer for parsing code
├── parser.go         // Builds AST (or flat token list for simple interp)
├── interpreter.go    // Executes logic: variable handling, functions
├── memory.go         // Variable and scope management
├── stdlib.go         // Built-in commands like !alert, !return
└── utils.go          // Error types, helpers
```

---

### 🧠 Internal Models

#### Tokens

```go
type TokenType string

const (
    TokenNumber  TokenType = "NUMBER"
    TokenString  TokenType = "STRING"
    TokenIdent   TokenType = "IDENT"
    TokenOp      TokenType = "OPERATOR"
    TokenKeyword TokenType = "KEYWORD"
    TokenSymbol  TokenType = "SYMBOL"
)

type Token struct {
    Type    TokenType
    Value   string
    Line    int
    Column  int
}
```

#### Memory

```go
type Memory struct {
    vars map[string]int
    stack []Frame // for function scopes
}
```

#### Instructions

```go
type Instruction interface {
    Execute(*Context) error
}
```

---

### 🛠️ Features to Implement

#### ✅ Phase 1 – Core Interpreter

* [ ] Lexical analyzer (tokenizer)
* [ ] Parser (build simple instruction list)
* [ ] Variable storage (`*val @name`)
* [ ] Arithmetic chaining (`&`, `+`, etc.)
* [ ] Basic output (`!alert`)

#### ✅ Phase 2 – Functions

* [ ] Define fuse (`~name { ... }`)
* [ ] Call fuse (`!name args @var`)
* [ ] Implement `!return`

#### ✅ Phase 3 – Conditionals & Errors

* [ ] `:if { ... } :else { ... }` evaluation
* [ ] `^label { ... } ^label { ... }` try/catch blocks

#### ✅ Phase 4 – Extensions (Optional)

* [ ] Memory slots `[0]`, `[1]`...
* [ ] Lists/arrays
* [ ] Logical ops (`==`, `!=`, `&and`, etc.)

---

### 🧪 Testing Plan

* Create small bombLang programs for:

  * Arithmetic
  * Function composition
  * Conditional branching
  * Error triggering and catching

---

### 🧠 Bonus Ideas

* Add a `!explode` command that forcibly throws an error
* Make a web REPL later (TypeScript-based frontend)
