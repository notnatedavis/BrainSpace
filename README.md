# BrainSpace

A modern, elegant tileable dashboard for organizing various widgets (notes, images, info cards) in a flexible grid layout.

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Usage](#usage)
- [Configuration](#Configuration)
- [Project-Structure](#Project-Structure)
- [Additional-Information](#Additional-Info)

## Introduction

BrainSpace is a React‑based dashboard application that lets you arrange and manage multiple tiles on a single page. It’s designed to be a lightweight, visually clean workspace where you can quickly jot down notes, display images, or show simple information cards. The layout is responsive and uses CSS Grid to automatically arrange tiles. A collapsible sidebar (expands on hover) provides space for future navigation or filtering, and tiles can be removed with a single click.

The project is built with React (using functional components and hooks) and Vite for fast development. State is managed via React Context, and a simple logger utility is included for debugging. Global CSS variables make it easy to customize the look and feel.

## Features

- Tile Grid – tiles are displayed in a responsive grid that adapts to screen size

- Multiple Tile Types – currently supports image, note, and info tiles.

- Add & Remove Tiles – a green “Add Tile” button in the header adds a new note tile. Each tile has a remove button (appears on hover) to delete it.

- Hover‑Expandable Sidebar – the sidebar is collapsed by default to save space; hovering over it expands to reveal menu items

- Error Boundary – a class‑based error boundary catches runtime errors and displays a fallback UI

- Theming via CSS Variables – colors, spacing, typography, and shadows are defined in variables.css for easy global styling

- Logger Utility – conditionally logs messages based on the environment (debug in development, error only in production)

## Usage 
1. cd BrainSpace
2. npm install
3. npm run dev
    - npm run build

## Configuration
- x

## Project-Structure
BrainSpace/
- public/
    - assets/
        - `test.jpg`
- src/
    - assets/
        - `test.jpg`
    - components/
        - common/
            - `ErrorBoundary.jsx`
        - Header/
            - `Header.css`
            - `Header.jsx`
        - Sidebar/
            - `Sidebar.css`
            - `Sidebar.jsx`
        - Tile/
            - `Tile.css`
            - `Tile.jsx`
        - TileContainer/
            - `TileContainer.css`
            - `TileContainer.jsx`
    - context/
        - `TilesContext.jsx`
    - hooks/
        - `useTiles.js`
    - pages/
        - Dashboard/
            - `Dashboard.css`
            - `Dashboard.jsx`
    - styles/
        - `global.css`
        - `variables.css`
    - utils/
        - `layoutHelpers.js`
        - `logger.js`
    - `App.css`
    - `App.jsx`
    - `index.css`
    - `index.js`
    - `main.jsx`
- `.gitignore`
- `index.html`
- `package.json`
- `ReadMe.md`
- `vite.config.js`


## Additional-Info

This portion is for logging or storing notes relevent to the project and its scope.