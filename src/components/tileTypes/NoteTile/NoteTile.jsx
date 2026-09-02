// src/components/tileTypes/NoteTile/NoteTile.jsx
// Display only – no inline editing. Clicking opens the edit modal.
// Checkbox toggles update the content and apply a strikethrough style.

import React, { useContext, useRef, useEffect } from 'react';
import { TilesContext } from '../../../context/TilesContext';
import './NoteTile.css';

// Helper: compute background colour from hue
const getBackgroundFromHue = (hue) => {
  if (hue <= 5) return '#ffffff';
  if (hue >= 355) return '#000000';
  return `hsl(${hue}, 70%, 92%)`;
};

// ----- Upgrade an existing checkbox (without a .todo-item wrapper) to a proper todo item -----
// Returns the new .todo-item element, or null if upgrade fails.
const upgradeToTodoItem = (checkbox) => {
  // Find the nearest block container (div or p)
  let block = checkbox.parentElement;
  while (block && block.nodeName !== 'DIV' && block.nodeName !== 'P') {
    block = block.parentElement;
  }
  if (!block) return null;

  // Create wrapper
  const todoItem = document.createElement('div');
  todoItem.className = 'todo-item';

  // Gather all children of the block, move them into the wrapper
  const children = Array.from(block.childNodes);
  const checkboxIndex = children.indexOf(checkbox);
  if (checkboxIndex === -1) return null;

  // Remove the checkbox from the array so we can move it to the front
  children.splice(checkboxIndex, 1);
  children.forEach(child => todoItem.appendChild(child));
  // Prepend the checkbox
  todoItem.insertBefore(checkbox, todoItem.firstChild);
  // Insert a space after the checkbox for readability
  todoItem.insertBefore(document.createTextNode(' '), checkbox.nextSibling);

  // Replace block content with the wrapper
  block.innerHTML = '';
  block.appendChild(todoItem);

  return todoItem;
};

// ----- Main component -----
const NoteTile = ({ tile }) => {
  const { updateTile, setEditingTileId } = useContext(TilesContext);
  const displayRef = useRef(null);

  // Attach checkbox change listeners in display mode
  useEffect(() => {
    if (displayRef.current) {
      const checkboxes = displayRef.current.querySelectorAll('.note-checkbox');
      const handlers = [];

      checkboxes.forEach((cb) => {
        const changeHandler = (e) => {
          e.stopPropagation();
          const checkbox = e.target;
          const dataId = checkbox.getAttribute('data-id');
          if (!dataId) return;

          const newChecked = checkbox.checked;

          // 1. Find or create a .todo-item wrapper
          let todoItem = checkbox.closest('.todo-item');
          if (!todoItem) {
            // Upgrade legacy checkbox to a todo item
            todoItem = upgradeToTodoItem(checkbox);
            if (!todoItem) {
              // Fallback: just update the checked attribute via old method
              // (kept for extreme edge cases)
              const currentContent = tile.content;
              const regex = new RegExp(
                `(<input[^>]*data-id="${dataId}"[^>]*?)(\\s+checked(?:\\s*=\\s*["'][^"']*["'])?)?(\\s*?>)`,
                'i'
              );
              const replacement = newChecked ? `$1 checked$3` : `$1$3`;
              const newContent = currentContent.replace(regex, replacement);
              if (newContent !== currentContent) {
                updateTile(tile.id, { content: newContent });
              }
              return;
            }
          }

          // 2. Toggle the 'completed' class on the todo-item
          todoItem.classList.toggle('completed', newChecked);

          // 3. Ensure the checkbox's checked attribute is reflected in the HTML
          if (newChecked) {
            checkbox.setAttribute('checked', '');
          } else {
            checkbox.removeAttribute('checked');
          }

          // 4. Persist the updated HTML back to state
          if (displayRef.current) {
            const updatedContent = displayRef.current.innerHTML;
            updateTile(tile.id, { content: updatedContent });
          }
        };

        const clickHandler = (e) => e.stopPropagation();

        cb.addEventListener('change', changeHandler);
        cb.addEventListener('click', clickHandler);
        handlers.push({ cb, changeHandler, clickHandler });
      });

      return () => {
        handlers.forEach(({ cb, changeHandler, clickHandler }) => {
          cb.removeEventListener('change', changeHandler);
          cb.removeEventListener('click', clickHandler);
        });
      };
    }
  }, [tile.content, tile.id, updateTile]);

  const handleTileClick = () => {
    setEditingTileId(tile.id);
  };

  const style = tile.noteStyle || {};
  const bgHueVal = style.bgHue ?? 0;
  const background = getBackgroundFromHue(bgHueVal);

  const textStyles = {
    fontWeight: style.bold ? 'bold' : 'normal',
    fontStyle: style.italic ? 'italic' : 'normal',
    textDecoration: style.underline ? 'underline' : 'none',
    fontSize:
      style.fontSize === 'small' ? '0.875rem' : style.fontSize === 'large' ? '1.25rem' : '1rem',
    fontFamily:
      style.fontFamily === 'serif'
        ? 'Georgia, serif'
        : style.fontFamily === 'mono'
        ? 'monospace'
        : 'sans-serif',
    margin: 0,
    color: '#1e293b',
  };

  const HeaderTag = style.headerLevel >= 1 && style.headerLevel <= 3 ? `h${style.headerLevel}` : 'div';

  return (
    <div
      ref={displayRef}
      style={{
        backgroundColor: background,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
        cursor: 'pointer',
        borderRadius: 'var(--border-radius)',
        boxSizing: 'border-box',
        overflow: 'visible', // Removed scrollbar; allow content to overflow visibly
      }}
      onClick={handleTileClick}
    >
      <HeaderTag style={textStyles}>
        <span dangerouslySetInnerHTML={{ __html: tile.content || 'Empty note' }} />
      </HeaderTag>
      <style>{`
        .note-checkbox {
          width: 1em;
          height: 1em;
          vertical-align: middle;
          margin-right: 0.25em;
          cursor: pointer;
        }
        /* Additional todo-item styles are in NoteTile.css */
      `}</style>
    </div>
  );
};

export default NoteTile;