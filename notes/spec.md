# 💣 bombLang – Language Specification

### 📄 Overview

**bombLang** is an esoteric programming language built on explosive metaphors. Variables are bombs, functions are fuses, and calls are detonations. It focuses on minimal syntax, symbolic operations, and playful semantics. THERE ARE NO WHITESPACES in bomblang. 

---

### 🔧 Core Concepts

| Concept        | Syntax Example              | Description                                                 |
| -------------- | --------------------------- | ----------------------------------------------------------- |
| Variable       | `*5 @x`                     | Creates a bomb (value 5) named `x`                          |
| Arithmetic     | `*x & + & y @z`             | Chains operations left-to-right                             |
| Function       | `~add { ... }`              | Declares a function (fuse)                                  |
| Function Call  | `!add x y @sum`             | Calls function `add` with args `x` and `y`, result in `sum` |
| Conditional    | `:if { ... } :else { ... }` | Conditional blocks                                          |
| Error Handling | `^label { ... }`            | Try block, with matching `^label { ... }` for catch         |
| Return         | `!return val`               | Returns from a function                                     |
| Output         | `!alert "msg"`              | Prints message                                              |
| Comments       | `// This is a comment`      | Ignored by interpreter                                      |

---

### 🧠 Memory Model

* All variables reside in a global scope or local function scope.
* Values are stored as integers (future support for string, list, bool).

---

### 🔣 Syntax Breakdown

#### 🧨 Variable Declaration

```bomb
*5 @x       // Assign literal 5 to variable x
*x & + & *3 @y   // y = x + 3
```

#### 🔁 Arithmetic Chains

```bomb
*x & + & y @z     // z = x + y
*z & *2 & *3 & + @w  // w = z * 2 + 3
```

Supported operators: `+`, `-`, `*`, `/`, `%`, `==`, `!=`, `>`, `<`, `>=`, `<=`

#### 🔩 Fuse (Function) Definition

```bomb
~add {
    *arg1 & + & arg2 @result
    !return result
}
```

#### 💥 Detonation (Function Call)

```bomb
*4 @a
*6 @b
!add a b @sum   // Calls add(a, b), stores result in sum
```

#### ⏳ Conditionals

```bomb
*z & > & *10 :if {
    !alert "Too powerful!"
} :else {
    !alert "Safe."
}
```

#### 🧯 Error Handling

```bomb
^explode {
    *0 & / & *0 @div
} ^explode {
    !alert "Explosion defused!"
}
```

---

### 🔥 Special Commands

| Command   | Purpose          |
| --------- | ---------------- |
| `!alert`  | Print to output  |
| `!return` | Return from fuse |

---

### 🧪 Sample Program

```bomb
// Multiply two values and report if the result is too big

*5 @x
*7 @y

~multiply {
    *arg1 & *arg2 & *1 & *0 & + & + @result
    !return result
}

!multiply x y @z

*z & > & *30 :if {
    !alert "Big boom!"
} :else {
    !alert "Controlled detonation."
}
```

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
