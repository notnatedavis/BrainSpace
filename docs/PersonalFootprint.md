# Personal Footprint

Personal coding conventions, principles, and patterns – a concise reference for maintaining consistency across all projects

## Table of Contents
- [Principles](#principles)
- [Standards](#standards)
- [Language-Examples](#Language-Examples)
- [Documentation](#Documentation)
- [Additional-Information](#Additional-Info)

---

## Principles

- **Modularization over monoliths** – split code into small, single‑purpose modules; one concern per file
- **Explicit over implicit** – prefer clear function signatures and type annotations
- **Fail fast & log early** – validate inputs at boundaries; log errors with context before re‑raising or handling
- **Immutability by default** – avoid if possible mutating arguments; use `const`, `readonly`, frozen dataclasses, or pure functions
- **Optimise for readability** – write readable contextual code that makes sense when you read it. Sacrifice naming micro‑optimisations until profiling proves otherwise

---

## Standards

### File Layout
Every source file follows this uniform structure :

1. **Header comment** – filename (path relative to project root) and a concise, in‑depth description of the file’s purpose.
2. **Imports section** – marked with a banner comment. External (third‑party) imports come first, then a blank line, then internal project imports.
3. **Helper functions / internal utilities** (optional) – placed before the main logic if they do not justify a separate module.
4. **Main logic** – the primary exported functions, classes, or script execution.

Comment syntax adapts to the language:
- `//` for TypeScript / JavaScript
- `#` for Python, Bash, YAML (comments)
- `<!-- -->` for Markdown
- etc. self explanatory

### Naming Conventions
- Variables / functions: `camelCase` (JS/TS), `snake_case` (Python, Bash)
- Classes / interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case.ext`

### Formatting
- **Max line length:** 110 characters
- **Trailing commas:** in multi‑line constructs
- **Colon spacing:**
  - TypeScript : space before colon in type annotations (`const x : number`)
  - Python : space before colon in function/class definitions (`def foo() :`)
  - Dictionaries / objects: one space before & after colon (`{"key" : "value"}`)
- **Imports grouping:** under the banner `// ----- Imports -----` (or `# ----- Imports -----` or language dependent comment style where applicable), separate external and internal imports with a blank line.
- (other)

---

## Language-Examples

### Typescript
```typescript
//   root/directory/sub/folder/folder/file.ts 
//   (in depth overview of file description)

// ----- Imports -----
import { createHash } from 'node:crypto';
import { Logger } from 'pino';

import { UserRepository } from '../repositories/user-repo'; 
import { User, CreateUserInput } from '../models/user';

const logger = new Logger({ name: 'file' });

// ----- Main -----
export async function createUser(input: CreateUserInput) : Promise<User> {
    if (!isValidEmail(input.email)) {

        logger.error({ email: input.email }, 'Invalid email during user creation');

        throw new ValidationError('Invalid email format');
    }

    const hashedPw = await hashPassword(input.password);

    return UserRepository.save({ ...input, password: hashedPw });
}

```

### Python
```python
#   root/directory/sub/folder/folder/file.py
#   (in depth overview of file description)

# ----- Imports -----
import os
import logging
from dataclasses import dataclass
from pathlib import Path

import yaml

logger = logging.getLogger(__name__)

# ----- Main -----
@dataclass(frozen=True)
class AppConfig :
    database_url : str
    redis_url : str
    log_level : str = "INFO"

def load_config(path: Path | None = None) -> AppConfig :
    # load application config from YAML file, falling back to env vars
    if path is None :
        path = Path(os.getenv("CONFIG_PATH", "./config.yaml"))

    logger.info("Loading configuration from %s", path)

    with path.open() as f :
        raw = yaml.safe_load(f)

    return AppConfig(
        database_url=raw.get("database_url", os.getenv("DATABASE_URL", "")),
        redis_url=raw.get("redis_url", os.getenv("REDIS_URL", "")),
        log_level=raw.get("log_level", "INFO"),
    )
```

## Markdown
```markdown
<!--   root/directory/docs/architecture.md -->
<!--   High‑level system architecture and component interaction. -->

# Architecture

## Overview
The system follows a modular monolith pattern, with clear boundaries between…

## Component Diagram
<!-- Diagram reference or embedded image -->
```

## Bash
```bash

```

## Java / Javascript
```java
//   root/directory/sub/folder/folder/file.java
//   (in depth overview of file description)

// ----- Imports -----
import java.util.Scanner;

// ----- Main -----
public class Life {
    public static void show(boolean[][] grid){
        String s = "";
        for(boolean[] row : grid){
            for(boolean val : row)
                if(val)
                    s += "*";
                else
                    s += ".";
            s += "\n";
        }
        System.out.println(s);
    }
    
    public static boolean[][] gen(){
        boolean[][] grid = new boolean[10][10];
        for(int r = 0; r < 10; r++)
            for(int c = 0; c < 10; c++)
                if( Math.random() > 0.7 )
                    grid[r][c] = true;
        return grid;
    }
    
    public static void main(String[] args){
        boolean[][] world = gen();
        show(world);
        System.out.println();
        world = nextGen(world);
        show(world);
        Scanner s = new Scanner(System.in);
        while(s.nextLine().length() == 0){
            System.out.println();
            world = nextGen(world);
            show(world);
            
        }
    }
    
    public static boolean[][] nextGen(boolean[][] world){
        boolean[][] newWorld 
            = new boolean[world.length][world[0].length];
        int num;
        for(int r = 0; r < world.length; r++){
            for(int c = 0; c < world[0].length; c++){
                num = numNeighbors(world, r, c);
                if( occupiedNext(num, world[r][c]) )
                    newWorld[r][c] = true;
            }
        }
        return newWorld;
    }
    
    public static boolean occupiedNext(int numNeighbors, boolean occupied){
        if( occupied && (numNeighbors == 2 || numNeighbors == 3))
            return true;
        else if (!occupied && numNeighbors == 3)
            return true;
        else
            return false;
    }

    private static int numNeighbors(boolean[][] world, int row, int col) {
        int num = world[row][col] ? -1 : 0;
        for(int r = row - 1; r <= row + 1; r++)
            for(int c = col - 1; c <= col + 1; c++)
                if( inbounds(world, r, c) && world[r][c] )
                    num++;

        return num;
    }

    private static boolean inbounds(boolean[][] world, int r, int c) {
        return r >= 0 && r < world.length && c >= 0 &&
        c < world[0].length;
    }
}
```

## JSX
```java
//   root/directory/sub/folder/folder/main.jsx
//   entry point

// ----- Imports -----
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import './styles/global.css';

// ----- Main -----
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

## C
```c
/*   root/directory/sub/folder/folder/config.h
 *   Defines configuration structure and public interface for
 *   managing system configuration stored in EEPROM at address 0x0040
 */

/* ----- Defined ----- */
#ifndef CONFIG_H_INCLUDED
#define CONFIG_H_INCLUDED

/* Config structure */
typedef struct {
    char token[4];              /* "ASU" */
    unsigned int hi_alarm;      /* 0x3FF */
    unsigned int hi_warn;       /* 0x3FE */
    unsigned int lo_alarm;      /* 0x0000 */
    unsigned int lo_warn;       /* 0x0001 */
    char use_static_ip;         /* 0 = DHCP, 1 = static */
    unsigned char static_ip[4]; /* {192,168,1,100} */
    unsigned char checksum;
} config_struct;

extern config_struct config;

void config_init(void);

void config_update(void);

void config_set_modified(void);

#endif /* CONFIG_H_INCLUDED */
```

## Other
```java
// (update)
```

---

## Documentation

- Comment frequency & depth :
    - comment in blocks of code to avoid slop, being brief descriptive and exact
    - Inline comments explain why something is done, not what; they appear only when the code is non‑obvious
    
- Project‑level docs: ReadMe.md gives an overview; detailed documentation lives in docs/. API references can be generated automatically from docstrings (TypeDoc / Sphinx).
- Self‑documenting code: Names are chosen to minimise the need for extra comments; comments are a supplement, not a crutch

---

## Additional-Info

- Tooling & automation :
    - Linters: ESLint (TS/JS), Ruff (Python)
    - Formatters: Prettier (TS/JS/JSON/Markdown), Black (Python)
- Preferred patterns : Early returns, guard clauses, functional composition, immutable data, explicit error propagation, clean, simplistic, efficient, intuitive, robust, modularization, organization, optimization, maintainability, reusability