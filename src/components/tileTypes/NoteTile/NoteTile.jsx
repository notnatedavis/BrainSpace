// src/components/tileTypes/NoteTile/NoteTile.jsx
// Display only – no inline editing. Clicking opens the edit modal.

import React, { useContext, useRef, useEffect } from 'react';
import { TilesContext } from '../../../context/TilesContext';

// Helper: compute background colour from hue
const getBackgroundFromHue = (hue) => {
  if (hue <= 5) return '#ffffff';
  if (hue >= 355) return '#000000';
  return `hsl(${hue}, 70%, 92%)`;
};

// Helper: update a checkbox's checked attribute in stored HTML content
const updateCheckboxInContent = (contentHtml, dataId, isChecked) => {
  const regex = new RegExp(
    `(<input[^>]*data-id="${dataId}"[^>]*?)(\\s+checked(?:\\s*=\\s*["'][^"']*["'])?)?(\\s*?>)`,
    'i'
  );
  const replacement = isChecked ? `$1 checked$3` : `$1$3`;
  return contentHtml.replace(regex, replacement);
};

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
          const dataId = cb.getAttribute('data-id');
          if (!dataId) return;

          const newChecked = cb.checked;
          const currentContent = tile.content;
          const newContent = updateCheckboxInContent(currentContent, dataId, newChecked);

          if (newContent !== currentContent) {
            updateTile(tile.id, { content: newContent });
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
        overflow: 'auto',
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
      `}</style>
    </div>
  );
};

export default NoteTile;