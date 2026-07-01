import React from 'react';

interface RichTextRendererProps {
  content: string;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content }) => {
  if (!content) return null;

  // Function to parse inline formatting (bold, italic, underline, links)
  const parseInlineStyles = (text: string): React.ReactNode[] => {
    // Basic HTML tag cleaning/replacement for inline nodes
    // Replace <b>, <strong> with our standard bold placeholder, etc.
    let processed = text
      .replace(/<(b|strong)>(.*?)<\/\1>/gi, '**$2**')
      .replace(/<(i|em)>(.*?)<\/\1>/gi, '*$2*')
      .replace(/<u>(.*?)<\/u>/gi, '__$1__')
      .replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

    const elements: React.ReactNode[] = [];
    let currentIndex = 0;

    // Combined regex for Markdown/HTML inline formatting:
    // 1. Link: \[(.*?)\]\((.*?)\)
    // 2. Bold: \*\*(.*?)\*\*
    // 3. Bold/Underline: __(.*?)__
    // 4. Italic: \*(.*?)\*
    // 5. Code: `(.*?)`
    // 6. URL Autolink: (https?:\/\/[^\s]+)
    const inlineRegex = /\[(.*?)\]\((.*?)\)|\*\*(.*?)\*\*|__(.*?)__|_([^_]+)_|\*(.*?)\*|`([^`]+)`|(https?:\/\/[^\s<]+)/g;

    let match;
    let keyCounter = 0;

    while ((match = inlineRegex.exec(processed)) !== null) {
      const matchIndex = match.index;

      // Add preceding plain text
      if (matchIndex > currentIndex) {
        elements.push(processed.substring(currentIndex, matchIndex));
      }

      const [
        fullMatch,
        linkText, linkUrl,
        boldText,
        underlineText,
        italicTextUnderscore,
        italicTextAsterisk,
        codeText,
        autoLinkUrl
      ] = match;

      if (linkText !== undefined && linkUrl !== undefined) {
        // Render Link
        elements.push(
          <a
            key={`link-${keyCounter++}`}
            href={linkUrl}
            target="_blank"
            referrerPolicy="no-referrer"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold break-all"
          >
            {linkText}
          </a>
        );
      } else if (boldText !== undefined) {
        // Render Bold
        elements.push(
          <strong key={`bold-${keyCounter++}`} className="font-black text-slate-900 dark:text-white">
            {boldText}
          </strong>
        );
      } else if (underlineText !== undefined) {
        // Render Underline
        elements.push(
          <span key={`underline-${keyCounter++}`} className="underline decoration-emerald-500/50 decoration-2">
            {underlineText}
          </span>
        );
      } else if (italicTextUnderscore !== undefined) {
        // Render Italic (underscore)
        elements.push(
          <em key={`italic-u-${keyCounter++}`} className="italic opacity-95">
            {italicTextUnderscore}
          </em>
        );
      } else if (italicTextAsterisk !== undefined) {
        // Render Italic (asterisk)
        elements.push(
          <em key={`italic-a-${keyCounter++}`} className="italic opacity-95">
            {italicTextAsterisk}
          </em>
        );
      } else if (codeText !== undefined) {
        // Render Code block
        elements.push(
          <code key={`code-${keyCounter++}`} className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            {codeText}
          </code>
        );
      } else if (autoLinkUrl !== undefined) {
        // Render Autolink URL
        elements.push(
          <a
            key={`autolink-${keyCounter++}`}
            href={autoLinkUrl}
            target="_blank"
            referrerPolicy="no-referrer"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold break-all"
          >
            {autoLinkUrl}
          </a>
        );
      }

      currentIndex = inlineRegex.lastIndex;
    }

    // Add remaining text
    if (currentIndex < processed.length) {
      elements.push(processed.substring(currentIndex));
    }

    return elements.length > 0 ? elements : [text];
  };

  // Split content by lines and group into list blocks or paragraph blocks
  const parseBlocks = (rawContent: string) => {
    // Normalize newlines
    const normalized = rawContent.replace(/\r\n/g, '\n');
    const lines = normalized.split('\n');
    
    const blocks: React.ReactNode[] = [];
    let currentListItems: string[] = [];
    let currentListType: 'ul' | 'ol' | null = null;
    let keyCounter = 0;

    const flushList = () => {
      if (currentListItems.length > 0 && currentListType) {
        const items = currentListItems.map((item, idx) => (
          <li key={`li-${keyCounter}-${idx}`} className="ml-6 list-outside text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-1.5">
            {parseInlineStyles(item)}
          </li>
        ));

        if (currentListType === 'ul') {
          blocks.push(
            <ul key={`ul-${keyCounter++}`} className="list-disc pl-5 my-4 space-y-1">
              {items}
            </ul>
          );
        } else {
          blocks.push(
            <ol key={`ol-${keyCounter++}`} className="list-decimal pl-5 my-4 space-y-1">
              {items}
            </ol>
          );
        }
        currentListItems = [];
        currentListType = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip completely empty lines, but flush list first
      if (line === '') {
        flushList();
        // Add a small spacing block to represent deliberate line breaks
        blocks.push(<div key={`empty-${keyCounter++}`} className="h-2" />);
        continue;
      }

      // 1. Heading 1: # Heading
      if (line.startsWith('# ')) {
        flushList();
        blocks.push(
          <h1 key={`h1-${keyCounter++}`} className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-8 mb-4 leading-tight border-b border-slate-100 dark:border-slate-800 pb-2">
            {parseInlineStyles(line.substring(2))}
          </h1>
        );
      }
      // 2. Heading 2: ## Heading
      else if (line.startsWith('## ')) {
        flushList();
        blocks.push(
          <h2 key={`h2-${keyCounter++}`} className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-6 mb-3 leading-tight">
            {parseInlineStyles(line.substring(3))}
          </h2>
        );
      }
      // 3. Heading 3: ### Heading
      else if (line.startsWith('### ')) {
        flushList();
        blocks.push(
          <h3 key={`h3-${keyCounter++}`} className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-5 mb-2 leading-tight">
            {parseInlineStyles(line.substring(4))}
          </h3>
        );
      }
      // 4. Bullet list items: "- text", "* text", "• text"
      else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        if (currentListType !== 'ul') {
          flushList();
          currentListType = 'ul';
        }
        currentListItems.push(line.substring(2));
      }
      // 5. Numbered list items: "1. text", "2. text"
      else if (/^\d+\.\s+/.test(line)) {
        if (currentListType !== 'ol') {
          flushList();
          currentListType = 'ol';
        }
        const itemContent = line.replace(/^\d+\.\s+/, '');
        currentListItems.push(itemContent);
      }
      // 6. Inline images: ![alt](url)
      else if (line.startsWith('![') && line.includes('](')) {
        flushList();
        const altMatch = line.match(/!\[(.*?)\]/);
        const urlMatch = line.match(/\((.*?)\)/);
        const alt = altMatch ? altMatch[1] : 'Image';
        const url = urlMatch ? urlMatch[1] : '';
        if (url) {
          blocks.push(
            <div key={`img-block-${keyCounter++}`} className="my-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-soft">
              <img src={url} alt={alt} referrerPolicy="no-referrer" className="w-full max-h-[450px] object-cover" />
              {alt && <div className="bg-slate-50 dark:bg-slate-950 p-3 text-center text-xs text-slate-500 font-bold border-t border-slate-200/50 dark:border-slate-800/50">{alt}</div>}
            </div>
          );
        }
      }
      // 7. Regular paragraph
      else {
        flushList();
        blocks.push(
          <p key={`p-${keyCounter++}`} className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-medium leading-[1.75] mb-4 text-justify select-text">
            {parseInlineStyles(line)}
          </p>
        );
      }
    }

    // Flush any remaining lists
    flushList();

    return blocks;
  };

  return (
    <div className="prose prose-emerald dark:prose-invert max-w-none space-y-1.5 leading-relaxed text-slate-800 dark:text-slate-200 select-text font-sans">
      {parseBlocks(content)}
    </div>
  );
};
