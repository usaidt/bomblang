# 💣 bombLang

An esoteric programming language built on explosive metaphors, now in TypeScript.

## Overview

**bombLang** is a minimalist programming language where:
- Variables are bombs (`*5 @x`)
- Functions are fuses (`~add { ... }`)
- Function calls are detonations (`!add x y @sum`)
- No whitespace allowed in syntax

## Quick Start

```bash
# Install dependencies
npm install

# Run a bombLang program
npm start -- examples/hello.bomb

# Start the REPL
npm run repl
```

## Language Features

- [ ] Variables and arithmetic
- [ ] Functions (fuses)
- [ ] Conditionals
- [ ] Error handling
- [ ] Built-in commands

## Documentation

The language specification is a work in progress.

## Examples

```bomb
// Simple arithmetic
*5 @x
*7 @y
*x & + & y @sum
!alert sum

// Function definition and call
~multiply {
    *arg1 & * & arg2 @result
    !return result
}

!multiply x y @product
```

## Development

```bash
# Build the project
npm run build

# Run tests (not yet implemented)
npm test
```