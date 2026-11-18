import React from 'react';

/**
 * Lightweight safe markdown renderer that supports:
 * - Bold (**text**)
 * - Inline code (`code`)
 * - Bullet lists (* or -)
 * - Links ([text](url))
 * - Line breaks
 */
export const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div style={{ wordBreak: 'break-word', lineHeight: 1.5, fontSize: '14px' }}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // Bullet point
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const bulletText = trimmed.slice(2);
          return (
            <div key={lineIdx} style={{ display: 'flex', gap: '8px', margin: '3px 0' }}>
              <span style={{ userSelect: 'none' }}>•</span>
              <div>{renderInlineFormatting(bulletText)}</div>
            </div>
          );
        }

        // Empty line
        if (!trimmed) {
          return <div key={lineIdx} style={{ height: '8px' }} />;
        }

        return (
          <div key={lineIdx} style={{ margin: '2px 0' }}>
            {renderInlineFormatting(line)}
          </div>
        );
      })}
    </div>
  );
};

function renderInlineFormatting(text: string): React.ReactNode[] {
  // Regex to match **bold**, `code`, and [link](url)
  const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          style={{
            backgroundColor: 'rgba(0,0,0,0.06)',
            padding: '2px 5px',
            borderRadius: '4px',
            fontSize: '12.5px',
            fontFamily: 'monospace',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    // Link: [label](href)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#2563eb', textDecoration: 'underline' }}
        >
          {label}
        </a>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
