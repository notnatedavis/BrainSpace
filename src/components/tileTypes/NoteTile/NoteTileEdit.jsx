// src/components/tileTypes/NoteTile/NoteTileEdit.jsx
// Full edit UI for NoteTile – rendered inside TileEditModal.
// Background matches note's current hue; only essential controls are shown.

import React, { useState, useRef, useEffect } from 'react';
import ColorSlider from '../../common/ColorSlider';

// ----- Helpers -----
const getCurrentFontSize = (editorRef) => {
  const selection = window.getSelection();
  if (!selection.rangeCount || !editorRef.current) return 16;
  const range = selection.getRangeAt(0);
  let node = range.startContainer;
  if (range.collapsed && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
  else if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
  if (node && node.nodeType === Node.ELEMENT_NODE) {
    const fontSize = window.getComputedStyle(node).fontSize;
    return parseFloat(fontSize) || 16;
  }
  return 16;
};

const applyFontSize = (editorRef, deltaPx) => {
  const selection = window.getSelection();
  if (!selection.rangeCount || !editorRef.current) return;
  const editor = editorRef.current;
  const currentSize = getCurrentFontSize(editorRef);
  const newSize = Math.max(6, currentSize + deltaPx);
  editor.focus();
  document.execCommand('styleWithCSS', true, null);
  const range = selection.getRangeAt(0);
  if (range.collapsed) {
    let node = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    if (node && node.nodeType === Node.ELEMENT_NODE && node !== editor) {
      node.style.fontSize = newSize + 'px';
    } else {
      editor.style.fontSize = newSize + 'px';
    }
  } else {
    const extractedContent = range.extractContents();
    const wrapper = document.createElement('span');
    wrapper.style.fontSize = newSize + 'px';
    wrapper.appendChild(extractedContent);
    range.insertNode(wrapper);
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    selection.addRange(newRange);
  }
};

// ----- Insert a checkbox wrapped in a .todo-item container at the start of the current line -----
const insertCheckboxAtLineStart = (editorRef) => {
  if (!editorRef.current) return;
  editorRef.current.focus();
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);

  // Find the nearest block container (div or p)
  let startContainer = range.startContainer;
  if (startContainer.nodeType === Node.TEXT_NODE) startContainer = startContainer.parentElement;
  let block = startContainer;
  while (block && block !== editorRef.current) {
    if (block.nodeName === 'DIV' || block.nodeName === 'P' ||
        (block.parentNode === editorRef.current && block.nodeName !== 'SPAN')) break;
    block = block.parentElement;
  }
  if (!block || block === editorRef.current) {
    block = editorRef.current.firstChild || editorRef.current;
    if (block.nodeType !== Node.ELEMENT_NODE) {
      const newDiv = document.createElement('div');
      editorRef.current.appendChild(newDiv);
      block = newDiv;
    }
  }

  // If the block already starts with a checkbox, do nothing
  const firstChild = block.firstChild;
  if (firstChild && firstChild.nodeType === Node.ELEMENT_NODE && firstChild.tagName === 'INPUT' && firstChild.type === 'checkbox') {
    return;
  }

  // Create todo-item wrapper
  const todoItem = document.createElement('div');
  todoItem.className = 'todo-item';

  // Create checkbox input
  const uniqueId = `cb_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'note-checkbox';
  checkbox.setAttribute('data-id', uniqueId);

  // Move all existing children of the block into the todo-item
  while (block.firstChild) {
    todoItem.appendChild(block.firstChild);
  }

  // Prepend the checkbox and a space
  todoItem.insertBefore(checkbox, todoItem.firstChild);
  todoItem.insertBefore(document.createTextNode(' '), checkbox.nextSibling);

  // Clear block and append the todo-item
  block.innerHTML = '';
  block.appendChild(todoItem);

  // Place the cursor after the checkbox (after the space)
  const newRange = document.createRange();
  const textNode = todoItem.childNodes[1]; // checkbox then text node (space)
  if (textNode && textNode.nodeType === Node.TEXT_NODE) {
    newRange.setStart(textNode, 1);
  } else {
    newRange.setStart(todoItem, 2);
  }
  newRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(newRange);
};

const getBackgroundFromHue = (hue) => {
  if (hue <= 5) return '#ffffff';
  if (hue >= 355) return '#000000';
  return `hsl(${hue}, 70%, 92%)`;
};

// ----- Main -----
const NoteTileEdit = ({ tile, onSave }) => {
  const [content, setContent] = useState(tile.content || '');
  const [noteStyle, setNoteStyle] = useState(
    tile.noteStyle || {
      bold: false,
      italic: false,
      underline: false,
      fontFamily: 'sans',
      bgHue: 0,
    }
  );
  const [bgHue, setBgHue] = useState(tile.noteStyle?.bgHue ?? 0);
  const editorRef = useRef(null);

  // Populate editor when content changes
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = content;
  }, [content]);

  const updateStyle = (key, value) => {
    setNoteStyle((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const html = editorRef.current ? editorRef.current.innerHTML : content;
    const computedBgColor = getBackgroundFromHue(bgHue);
    onSave({
      content: html,
      noteStyle: {
        bold: noteStyle.bold,
        italic: noteStyle.italic,
        underline: noteStyle.underline,
        fontFamily: noteStyle.fontFamily,
        bgHue,
        backgroundColor: computedBgColor,
      },
      title: '',
    });
  };

  // Formatting actions
  const applyBold = () => editorRef.current && document.execCommand('bold', false, null);
  const applyItalic = () => editorRef.current && document.execCommand('italic', false, null);
  const applyUnderline = () => editorRef.current && document.execCommand('underline', false, null);
  const applyStrikethrough = () => editorRef.current && document.execCommand('strikeThrough', false, null);
  const handleInsertCheckbox = () => insertCheckboxAtLineStart(editorRef);
  const increaseFont = () => applyFontSize(editorRef, 1);
  const decreaseFont = () => applyFontSize(editorRef, -1);

  // Background colour for the edit window
  const editWindowBackground = getBackgroundFromHue(bgHue);

  // Inline styles (consistent with other edit modals)
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
    backgroundColor: editWindowBackground,
    borderRadius: 'var(--border-radius)',
    padding: '0.5rem',
  };

  const toolbarButtonStyle = {
    padding: '0.2rem 0.6rem',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '0.875rem',
  };

  const labelStyle = {
    fontWeight: '500',
    fontSize: '0.875rem',
    color: 'var(--color-text-light)',
    marginBottom: '0.25rem',
    display: 'block',
  };

  const selectStyle = {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    fontSize: 'var(--font-size-base)',
    fontFamily: 'inherit',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    outline: 'none',
    width: '100%',
  };

  const buttonStyle = {
    backgroundColor: 'var(--color-accent)',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: 'var(--font-size-base)',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    alignSelf: 'flex-end',
  };

  return (
    <div style={formStyle}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={applyBold} style={toolbarButtonStyle}>B</button>
        <button type="button" onClick={applyItalic} style={toolbarButtonStyle}>I</button>
        <button type="button" onClick={applyUnderline} style={toolbarButtonStyle}>U</button>
        <button type="button" onClick={applyStrikethrough} style={toolbarButtonStyle}>S</button>
        <button type="button" onClick={decreaseFont} style={toolbarButtonStyle}>−</button>
        <button type="button" onClick={increaseFont} style={toolbarButtonStyle}>+</button>
        <button type="button" onClick={handleInsertCheckbox} style={toolbarButtonStyle}>☐</button>
      </div>

      {/* Editable content area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          padding: '0.5rem',
          minHeight: '150px',
          maxHeight: '300px',
          overflowY: 'auto',
          fontFamily: 'inherit',
          fontSize: '1rem',
          backgroundColor: 'var(--color-surface)',
          outline: 'none',
        }}
      />

      {/* Background hue slider */}
      <ColorSlider label="Background Hue" hue={bgHue} setHue={setBgHue} />

      {/* Font family dropdown */}
      <div>
        <label style={labelStyle}>Font Family</label>
        <select
          value={noteStyle.fontFamily}
          onChange={(e) => updateStyle('fontFamily', e.target.value)}
          style={selectStyle}
        >
          <option value="sans">Sans-serif</option>
          <option value="serif">Serif</option>
          <option value="mono">Monospace</option>
        </select>
      </div>

      {/* Save button */}
      <button type="button" onClick={handleSave} style={buttonStyle}>
        Save Note
      </button>
    </div>
  );
};

export default NoteTileEdit;