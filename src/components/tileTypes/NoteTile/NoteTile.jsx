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

  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.innerHTML = editContent;
    }
  }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

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
        backgroundColor: computedBgColor,   // persist the computed colour for display
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

  // ----- Display mode -----
  if (!isEditing) {
    // Determine background: prefer bgHue if present, else fallback to backgroundColor
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
      {/* ---------- Toolbar row 1: bold / italic / underline / font +/- ---------- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={applyBold} style={{ fontWeight: 'bold', padding: '0.2rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }}>B</button>
        <button type="button" onClick={applyItalic} style={{ fontStyle: 'italic', padding: '0.2rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }}>I</button>
        <button type="button" onClick={applyUnderline} style={{ textDecoration: 'underline', padding: '0.2rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }}>U</button>
        <button type="button" onClick={() => applyFontSize(editorRef, -1)} title="Decrease font size by 1 px" style={{ padding: '0.2rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>−</button>
        <button type="button" onClick={() => applyFontSize(editorRef, 1)} title="Increase font size by 1 px" style={{ padding: '0.2rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
      </div>

      {/* ---------- Background colour slider ---------- */}
      <div style={{ marginBottom: '0.5rem' }}>
        <ColorSlider label="Background" hue={bgHue} setHue={setBgHue} />
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