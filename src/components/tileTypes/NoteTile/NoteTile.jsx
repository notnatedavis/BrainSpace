//   src/components/tileTypes/NoteTile/NoteTile.jsx

// ----- Imports -----
import React, { useState, useContext, useRef, useEffect } from 'react';
import { TilesContext } from '../../../context/TilesContext';
import ColorSlider from '../../common/ColorSlider';

// ----- Helper: get current font size (in px) of the selection or cursor -----
const getCurrentFontSize = (editorRef) => {
  const selection = window.getSelection();
  if (!selection.rangeCount || !editorRef.current) return 16;

  const range = selection.getRangeAt(0);
  let node = range.startContainer;

  if (range.collapsed && node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  } else if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }

  if (node && node.nodeType === Node.ELEMENT_NODE) {
    const fontSize = window.getComputedStyle(node).fontSize;
    return parseFloat(fontSize) || 16;
  }
  return 16;
};

// ----- Helper: apply a font‑size change (delta in px) -----
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

// ----- Helper: insert a checkbox at the start of the current line -----
const insertCheckboxAtLineStart = (editorRef) => {
  if (!editorRef.current) return;
  editorRef.current.focus();

  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);

  // Find the nearest block ancestor (div, p, or direct child of editor)
  let startContainer = range.startContainer;
  if (startContainer.nodeType === Node.TEXT_NODE) {
    startContainer = startContainer.parentElement;
  }
  let block = startContainer;
  while (block && block !== editorRef.current) {
    if (block.nodeName === 'DIV' || block.nodeName === 'P' ||
        (block.parentNode === editorRef.current && block.nodeName !== 'SPAN')) {
      break;
    }
    block = block.parentElement;
  }
  if (!block || block === editorRef.current) {
    // Fallback: use the first child or create a new div
    block = editorRef.current.firstChild || editorRef.current;
    if (block.nodeType !== Node.ELEMENT_NODE) {
      const newDiv = document.createElement('div');
      editorRef.current.appendChild(newDiv);
      block = newDiv;
    }
  }

  // Check if line already starts with a checkbox
  const innerHtml = block.innerHTML;
  if (innerHtml.trimStart().startsWith('<input type="checkbox" class="note-checkbox"')) {
    return; // already has checkbox at start
  }

  // Generate unique data-id for this checkbox
  const uniqueId = `cb_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  const checkboxHtml = `<input type="checkbox" class="note-checkbox" data-id="${uniqueId}"> `;

  // Insert at beginning of block
  block.innerHTML = checkboxHtml + innerHtml;

  // Move cursor after the checkbox
  const newRange = document.createRange();
  const textNodeAfter = block.firstChild.nextSibling;
  if (textNodeAfter && textNodeAfter.nodeType === Node.TEXT_NODE) {
    newRange.setStart(textNodeAfter, 0);
  } else {
    newRange.setStart(block, 1);
  }
  newRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(newRange);
};

// ----- Helper: update a checkbox's checked attribute in the stored HTML content -----
const updateCheckboxInContent = (contentHtml, dataId, isChecked) => {
  // Build regex that matches the entire input tag containing this data-id
  const regex = new RegExp(`(<input[^>]*data-id="${dataId}"[^>]*?)(\\s+checked)?(\\s*?>)`, 'i');
  const replacement = isChecked ? `$1 checked$3` : `$1$3`;
  return contentHtml.replace(regex, replacement);
};

// ----- Compute background colour from hue -----
const getBackgroundFromHue = (hue) => {
  if (hue <= 5) return '#ffffff';
  if (hue >= 355) return '#000000';
  return `hsl(${hue}, 70%, 92%)`;
};

// ----- Main -----
const NoteTile = ({ tile }) => {
  const { updateTile } = useContext(TilesContext);
  const [isEditing, setIsEditing] = useState(false);

  // Local editing state – initialised from current tile props
  const [editContent, setEditContent] = useState(tile.content || '');
  const [editStyle, setEditStyle] = useState(
    tile.noteStyle || {
      backgroundColor: '#ffffff',
      bold: false,
      italic: false,
      underline: false,
      fontSize: 'medium',
      fontFamily: 'sans',
      headerLevel: 0,
      bgHue: 0,
    }
  );

  const [bgHue, setBgHue] = useState(tile.noteStyle?.bgHue ?? 0);

  const editorRef = useRef(null);
  const displayRef = useRef(null); // to attach checkbox event listeners

  // ----- Synchronise editing state with the latest tile props when entering edit mode -----
  useEffect(() => {
    if (isEditing) {
      // on entering edit mode, reset the local state so it always matches
      // the current tile data (fixes stale content bug)
      setEditContent(tile.content || '');
      setBgHue(tile.noteStyle?.bgHue ?? 0);
    }
  }, [isEditing, tile.content, tile.noteStyle?.bgHue]);

  // ----- Populate the contentEditable div when editing starts or content changes -----
  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.innerHTML = editContent;
    }
  }, [isEditing, editContent]);

  // ----- Attach checkbox change listeners in display mode -----
  useEffect(() => {
    if (!isEditing && displayRef.current) {
      const checkboxes = displayRef.current.querySelectorAll('.note-checkbox');
      const handlers = [];

      checkboxes.forEach((cb) => {
        const handler = (e) => {
          e.stopPropagation();
          const dataId = cb.getAttribute('data-id');
          if (!dataId) return;

          const newChecked = cb.checked;
          const currentContent = tile.content;
          const newContent = updateCheckboxInContent(currentContent, dataId, newChecked);

          if (newContent !== currentContent) {
            updateTile(tile.id, { content: newContent });
          }
        };
        cb.addEventListener('change', handler);
        handlers.push({ cb, handler });
      });

      return () => {
        handlers.forEach(({ cb, handler }) => {
          cb.removeEventListener('change', handler);
        });
      };
    }
  }, [isEditing, tile.content, tile.id, updateTile]);

  const handleTileClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = () => {
    const html = editorRef.current ? editorRef.current.innerHTML : editContent;
    const computedBgColor = getBackgroundFromHue(bgHue);
    updateTile(tile.id, {
      content: html,
      noteStyle: {
        ...editStyle,
        bgHue,
        backgroundColor: computedBgColor,
      },
      title: '',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(tile.content || '');
    setEditStyle(
      tile.noteStyle || {
        backgroundColor: '#ffffff',
        bold: false,
        italic: false,
        underline: false,
        fontSize: 'medium',
        fontFamily: 'sans',
        headerLevel: 0,
        bgHue: 0,
      }
    );
    setBgHue(tile.noteStyle?.bgHue ?? 0);
  };

  const currentBackground = getBackgroundFromHue(bgHue);

  // ----- Text formatting helpers -----
  const applyBold = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('bold', false, null);
    }
  };

  const applyItalic = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('italic', false, null);
    }
  };

  const applyUnderline = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('underline', false, null);
    }
  };

  const applyStrikethrough = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('strikeThrough', false, null);
    }
  };

  // ----- Checkbox insertion -----
  const handleInsertCheckbox = () => {
    if (editorRef.current) {
      insertCheckboxAtLineStart(editorRef);
    }
  };

  // ----- Display mode -----
  if (!isEditing) {
    const style = tile.noteStyle || {};
    const bgHueVal = style.bgHue;
    const background = bgHueVal !== undefined ? getBackgroundFromHue(bgHueVal) : (style.backgroundColor || '#ffffff');

    const { bold = false, italic = false, underline = false, fontSize = 'medium', fontFamily = 'sans', headerLevel = 0 } = style;
    const textStyles = {
      fontWeight: bold ? 'bold' : 'normal',
      fontStyle: italic ? 'italic' : 'normal',
      textDecoration: underline ? 'underline' : 'none',
      fontSize:
        fontSize === 'small' ? '0.875rem' : fontSize === 'large' ? '1.25rem' : '1rem',
      fontFamily:
        fontFamily === 'serif'
          ? 'Georgia, serif'
          : fontFamily === 'mono'
          ? 'monospace'
          : 'sans-serif',
      margin: 0,
      color: '#1e293b',
    };

    const HeaderTag = headerLevel >= 1 && headerLevel <= 3 ? `h${headerLevel}` : 'div';

    return (
      <div
        className="note-tile-display"
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
        }}
        onClick={handleTileClick}
      >
        <HeaderTag style={textStyles}>
          <span dangerouslySetInnerHTML={{ __html: tile.content || 'note pad' }} />
        </HeaderTag>
        {/* Inline style for checkboxes – scales with text size */}
        <style>{`
          .note-checkbox {
            width: 1em;
            height: 1em;
            vertical-align: middle;
            margin-right: 0.25em;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  // ----- Editing mode -----
  return (
    <div
      className="note-tile-edit"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        padding: '2.5rem 0.5rem 0.5rem 0.5rem',
        backgroundColor: currentBackground,
        boxSizing: 'border-box',
        borderRadius: 'var(--border-radius)',
        overflow: 'hidden',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ---------- Toolbar row 1: bold / italic / underline / strikethrough / font +/- / checkbox ---------- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={applyBold} style={{ fontWeight: 'bold', padding: '0.2rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }}>B</button>
        <button type="button" onClick={applyItalic} style={{ fontStyle: 'italic', padding: '0.2rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }}>I</button>
        <button type="button" onClick={applyUnderline} style={{ textDecoration: 'underline', padding: '0.2rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }}>U</button>
        {/* Strikethrough button */}
        <button type="button" onClick={applyStrikethrough} style={{ textDecoration: 'line-through', padding: '0.2rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }}>S</button>
        <button type="button" onClick={() => applyFontSize(editorRef, -1)} title="Decrease font size by 1 px" style={{ padding: '0.2rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>−</button>
        <button type="button" onClick={() => applyFontSize(editorRef, 1)} title="Increase font size by 1 px" style={{ padding: '0.2rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
        {/* Checkbox insertion button */}
        <button type="button" onClick={handleInsertCheckbox} title="Insert checkbox at line start" style={{ padding: '0.2rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent', cursor: 'pointer', fontSize: '1.1rem' }}>☐</button>
      </div>

      {/* ---------- Background colour slider (label hidden) ---------- */}
      <div style={{ marginBottom: '0.5rem' }}>
        <ColorSlider label="Background" hue={bgHue} setHue={setBgHue} hideLabel={true} />
      </div>

      {/* ---------- Editable area ---------- */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        style={{
          flex: 1,
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '0.5rem',
          fontFamily: 'inherit',
          fontSize: '1rem',
          background: 'rgba(255,255,255,0.9)',
          outline: 'none',
          overflowY: 'auto',
          minHeight: 0,
        }}
        onFocus={(e) => {
          if (e.currentTarget.textContent.trim() === '') {
            e.currentTarget.setAttribute('data-placeholder', 'Write your note…');
          }
        }}
        onBlur={(e) => {
          if (e.currentTarget.textContent.trim() === '') {
            e.currentTarget.removeAttribute('data-placeholder');
          }
        }}
      />

      {/* ---------- Save / Cancel actions ---------- */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button type="button" onClick={handleCancel} style={{ padding: '0.3rem 0.8rem', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
        <button type="button" onClick={handleSave} style={{ padding: '0.3rem 0.8rem', border: 'none', borderRadius: '4px', background: 'var(--color-accent)', color: 'white', cursor: 'pointer', fontWeight: 500 }}>Save</button>
      </div>
    </div>
  );
};

export default NoteTile;