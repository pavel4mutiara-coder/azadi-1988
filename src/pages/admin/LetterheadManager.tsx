import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/constants';
import { 
  FileText, Printer, Save, Edit3, PenTool, Check, Eraser, Download,
  Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent, Undo2, Redo2, Copy, Scissors, CheckSquare,
  AlertTriangle, Upload, Sliders, Eye, EyeOff, QrCode
} from 'lucide-react';
import QRCode from 'qrcode';

const LetterheadStyles = () => (
  <style>{`
    @media print {
      body {
        background: white !important;
        color: black !important;
      }
      .no-print {
        display: none !important;
      }
      /* Ensure A4 printed page matches standard sizes */
      @page {
        size: A4 portrait;
        margin: 0;
      }
      .editor-body {
        overflow: visible !important;
        max-height: none !important;
        min-height: none !important;
      }
    }
    
    /* Screen editor specific styles */
    .editor-body::-webkit-scrollbar {
      width: 6px;
    }
    .editor-body::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.03);
    }
    .editor-body::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.1);
      border-radius: 4px;
    }
    .editor-body:focus {
      outline: none;
    }
    
    /* Bullet lists formatting in editor */
    .editor-body ul {
      list-style-type: disc !important;
      padding-left: 24px !important;
      margin-bottom: 8px !important;
    }
    .editor-body ol {
      list-style-type: decimal !important;
      padding-left: 24px !important;
      margin-bottom: 8px !important;
    }
    .editor-body blockquote {
      border-left: 4px solid #cbd5e1;
      padding-left: 12px;
      margin-left: 0;
      color: #64748b;
      font-style: italic;
    }
  `}</style>
);

export const LetterheadManager: React.FC = () => {
  const { lang, settings, letterhead, saveLetterhead } = useApp();
  const t = TRANSLATIONS[lang];
  
  // Initialize state from local draft if it exists, otherwise fall back to database state
  const [localConfig, setLocalConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('azadi_letterhead_draft');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse draft from localStorage", e);
    }
    return letterhead;
  });

  const [viewMode, setViewMode] = useState<'bn' | 'en'>(lang);
  const [today, setToday] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [signatureTab, setSignatureTab] = useState<'draw' | 'upload'>('draw');
  const [dragActive, setDragActive] = useState(false);
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [isOverlayModalOpen, setIsOverlayModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'signature' | 'qr'>('signature');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
 
  // Track if a restored local draft currently differs from the base DB config
  const [hasRestoredDraft, setHasRestoredDraft] = useState(() => {
    try {
      const saved = localStorage.getItem('azadi_letterhead_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.bodyText !== letterhead.bodyText ||
               parsed.leaderName !== letterhead.leaderName ||
               parsed.designation !== letterhead.designation ||
               parsed.signature !== letterhead.signature ||
               parsed.signatureWidth !== letterhead.signatureWidth ||
               parsed.signatureYOffset !== letterhead.signatureYOffset ||
               parsed.signatureXOffset !== letterhead.signatureXOffset ||
               parsed.signatureRotation !== letterhead.signatureRotation ||
               parsed.signatureOpacity !== letterhead.signatureOpacity ||
               parsed.qrEnabled !== letterhead.qrEnabled ||
               parsed.qrSize !== letterhead.qrSize ||
               parsed.qrPosition !== letterhead.qrPosition ||
               parsed.qrCustomText !== letterhead.qrCustomText ||
               parsed.qrXOffset !== letterhead.qrXOffset ||
               parsed.qrYOffset !== letterhead.qrYOffset;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  });

  // Calculate live word and character counts based on editor HTML content (localConfig.bodyText)
  const { charCount, wordCount } = useMemo(() => {
    if (typeof document === 'undefined') return { charCount: 0, wordCount: 0 };
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = localConfig.bodyText || '';
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const trimmed = text.trim();
    // Use whitespace regex to split into words, filtering out any empty slots
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    return { charCount: text.length, wordCount: words };
  }, [localConfig.bodyText]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const letterheadRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const isEditingRef = useRef(false);

  // Synchronize state when letterhead config changes from DB (only if no active local draft is being edited)
  useEffect(() => {
    if (hasRestoredDraft) return;

    if (editorRef.current && !isEditingRef.current) {
      const currentHTML = editorRef.current.innerHTML;
      const initialHTML = getInitialHtml(letterhead.bodyText);
      if (currentHTML !== initialHTML) {
        editorRef.current.innerHTML = initialHTML;
        setLocalConfig(letterhead);
      }
    }
  }, [letterhead, hasRestoredDraft]);

  // Debounced auto-save effect to store current document state to localStorage
  useEffect(() => {
    const isIdenticalToDB = localConfig.bodyText === letterhead.bodyText &&
                            localConfig.leaderName === letterhead.leaderName &&
                            localConfig.designation === letterhead.designation &&
                            localConfig.signature === letterhead.signature &&
                            localConfig.signatureWidth === letterhead.signatureWidth &&
                            localConfig.signatureYOffset === letterhead.signatureYOffset &&
                            localConfig.signatureXOffset === letterhead.signatureXOffset &&
                            localConfig.signatureRotation === letterhead.signatureRotation &&
                            localConfig.signatureOpacity === letterhead.signatureOpacity &&
                            localConfig.qrEnabled === letterhead.qrEnabled &&
                            localConfig.qrSize === letterhead.qrSize &&
                            localConfig.qrPosition === letterhead.qrPosition &&
                            localConfig.qrCustomText === letterhead.qrCustomText &&
                            localConfig.qrXOffset === letterhead.qrXOffset &&
                            localConfig.qrYOffset === letterhead.qrYOffset;

    if (isIdenticalToDB) {
      localStorage.removeItem('azadi_letterhead_draft');
      setHasRestoredDraft(false);
      setAutoSaveStatus('idle');
      return;
    }

    setAutoSaveStatus('saving');

    const timer = setTimeout(() => {
      try {
        localStorage.setItem('azadi_letterhead_draft', JSON.stringify(localConfig));
        setHasRestoredDraft(true);
        setAutoSaveStatus('saved');
      } catch (e) {
        console.error("Auto-save to localStorage failed", e);
        setAutoSaveStatus('idle');
      }
    }, 1500); // 1.5 seconds debounce

    return () => clearTimeout(timer);
  }, [localConfig, letterhead]);

  // Reset saved indicator back to idle after display duration
  useEffect(() => {
    if (autoSaveStatus === 'saved') {
      const timer = setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoSaveStatus]);

  // Format today's date
  useEffect(() => {
    setToday(new Date().toLocaleDateString(viewMode === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  }, [viewMode]);

  // Generate QR code content dynamically based on document metadata
  const qrVerificationText = useMemo(() => {
    if (localConfig.qrCustomText) {
      return localConfig.qrCustomText;
    }
    // Automatically generate verification code based on document metadata
    const textContent = localConfig.bodyText || '';
    let hash = 0;
    for (let i = 0; i < textContent.length; i++) {
      const char = textContent.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    const refHash = Math.abs(hash).toString(36).toUpperCase().substring(0, 6);
    const refId = `ASWO/PAD/${new Date().getFullYear()}/${(localConfig.leaderName?.split(' ')[0] || 'ADMIN').toUpperCase()}-${refHash}`;
    
    return `ASWO VERIFY
Ref: ${refId}
Signatory: ${localConfig.leaderName || ''}
Designation: ${localConfig.designation || ''}
Words: ${wordCount}
Date: ${today || new Date().toISOString().split('T')[0]}`;
  }, [localConfig.qrCustomText, localConfig.bodyText, localConfig.leaderName, localConfig.designation, wordCount, today]);

  // Regenerate QR Code base64 Data URL
  useEffect(() => {
    if (localConfig.qrEnabled ?? true) {
      QRCode.toDataURL(qrVerificationText, { margin: 1, width: 256 }, (err, url) => {
        if (!err) {
          setQrCodeDataUrl(url);
        } else {
          console.error("Failed to generate QR Code Data URL", err);
        }
      });
    }
  }, [qrVerificationText, localConfig.qrEnabled]);

  const getQrStyle = (): React.CSSProperties => {
    const size = localConfig.qrSize ?? 64;
    const xOffset = localConfig.qrXOffset ?? 0;
    const yOffset = localConfig.qrYOffset ?? 0;
    const position = localConfig.qrPosition ?? 'bottom-left';

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    };

    switch (position) {
      case 'top-right':
        return {
          ...baseStyle,
          top: `${40 + yOffset}px`,
          right: `${40 - xOffset}px`,
        };
      case 'bottom-right':
        return {
          ...baseStyle,
          bottom: `${40 - yOffset}px`,
          right: `${40 - xOffset}px`,
        };
      case 'footer-center':
        return {
          ...baseStyle,
          bottom: `${30 - yOffset}px`,
          left: `calc(50% + ${xOffset}px)`,
          transform: 'translateX(-50%)',
        };
      case 'bottom-left':
      default:
        return {
          ...baseStyle,
          bottom: `${40 - yOffset}px`,
          left: `${40 + xOffset}px`,
        };
    }
  };

  // Signature Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => { setIsDrawing(true); draw(e); };
  const stopDrawing = () => { setIsDrawing(false); if (canvasRef.current) canvasRef.current.getContext('2d')?.beginPath(); };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
    ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
  };

  const clearCanvas = () => canvasRef.current?.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  const saveSignatureFromCanvas = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      setLocalConfig(prev => ({ ...prev, signature: dataUrl }));
      alert(lang === 'bn' ? 'স্বাক্ষর ক্যাপচার করা হয়েছে!' : 'Signature captured successfully!');
    }
  };

  const handleSignatureUpload = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে শুধুমাত্র ছবি ফাইল আপলোড করুন!' : 'Please upload an image file only!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setLocalConfig(prev => ({ ...prev, signature: result }));
        alert(lang === 'bn' ? 'স্বাক্ষর ইমেজ সফলভাবে আপলোড করা হয়েছে!' : 'Signature image successfully uploaded!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSignatureUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => { 
    try {
      await saveLetterhead(localConfig); 
      localStorage.removeItem('azadi_letterhead_draft');
      setHasRestoredDraft(false);
      alert(lang === 'bn' ? 'প্যাড সেটিংস সফলভাবে সেভ করা হয়েছে!' : 'Letterhead configuration successfully saved to Firestore!');
    } catch(e) {
      alert(lang === 'bn' ? 'সেভ করতে ব্যর্থ হয়েছে।' : 'Failed to save letterhead config.');
    }
  };

  const handleDiscardDraft = () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত যে খসড়া সংস্করণটি বাতিল করে ডাটাবেজের সংস্করণে ফিরে যেতে চান?' : 'Are you sure you want to discard the draft and restore the database version?')) {
      localStorage.removeItem('azadi_letterhead_draft');
      setHasRestoredDraft(false);
      if (editorRef.current) {
        editorRef.current.innerHTML = getInitialHtml(letterhead.bodyText);
      }
      setLocalConfig(letterhead);
    }
  };

  const handleSaveDraftToDB = async () => {
    try {
      await saveLetterhead(localConfig);
      localStorage.removeItem('azadi_letterhead_draft');
      setHasRestoredDraft(false);
      alert(lang === 'bn' ? 'প্যাড সেটিংস সফলভাবে সেভ করা হয়েছে!' : 'Letterhead configuration successfully saved to Firestore!');
    } catch (e) {
      alert(lang === 'bn' ? 'সেভ করতে ব্যর্থ হয়েছে।' : 'Failed to save letterhead config.');
    }
  };

  const handleDownloadPDF = () => {
    if (typeof (window as any).html2pdf !== 'undefined') {
      const element = letterheadRef.current;
      const opt = {
        margin: 0,
        filename: `official_pad_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      (window as any).html2pdf().from(element).set(opt).save();
    } else {
      window.print();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Rich Text Editor State & Core Command Helpers
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    justifyLeft: true,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    unorderedList: false,
    orderedList: false,
    fontName: 'Noto Sans Bengali',
    fontSize: '14px',
    color: '#000000',
    lineHeight: '1.5',
    marginBottom: '8px'
  });

  const getInitialHtml = (text: string) => {
    if (!text) return '<p style="margin-bottom: 8px; line-height: 1.5;"><br></p>';
    if (/<[a-z][\s\S]*>/i.test(text)) {
      return text;
    }
    const paragraphs = text.split(/\r?\n\r?\n/);
    return paragraphs.map(p => {
      const lines = p.split(/\r?\n/);
      return `<p style="margin-bottom: 8px; line-height: 1.5;">${lines.join('<br>')}</p>`;
    }).join('');
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      isEditingRef.current = true;
      const html = editorRef.current.innerHTML;
      setLocalConfig(prev => ({ ...prev, bodyText: html }));
      setTimeout(() => {
        isEditingRef.current = false;
      }, 50);
    }
  };

  const updateToolbarState = () => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const isBold = document.queryCommandState('bold');
    const isItalic = document.queryCommandState('italic');
    const isUnderline = document.queryCommandState('underline');
    const isBullet = document.queryCommandState('insertUnorderedList');
    const isOrdered = document.queryCommandState('insertOrderedList');

    const fontName = document.queryCommandValue('fontName') || 'Noto Sans Bengali';
    const color = document.queryCommandValue('foreColor') || '#000000';

    const isLeft = document.queryCommandState('justifyLeft');
    const isCenter = document.queryCommandState('justifyCenter');
    const isRight = document.queryCommandState('justifyRight');
    const isFull = document.queryCommandState('justifyFull');

    let container = selection.getRangeAt(0).commonAncestorContainer as HTMLElement;
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentNode as HTMLElement;
    }
    const block = container.closest('p, div, li, h1, h2, h3, h4, h5, h6') as HTMLElement;
    const lineHeight = block ? block.style.lineHeight || '1.5' : '1.5';
    const marginBottom = block ? block.style.marginBottom || '8px' : '8px';
    const fontSize = block ? block.style.fontSize || '14px' : '14px';

    setActiveStyles({
      bold: isBold,
      italic: isItalic,
      underline: isUnderline,
      justifyLeft: isLeft,
      justifyCenter: isCenter,
      justifyRight: isRight,
      justifyFull: isFull,
      unorderedList: isBullet,
      orderedList: isOrdered,
      fontName: fontName.replace(/"/g, ''),
      fontSize,
      color,
      lineHeight,
      marginBottom
    });
  };

  useEffect(() => {
    const handler = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const container = selection.getRangeAt(0).commonAncestorContainer;
        if (editorRef.current?.contains(container)) {
          updateToolbarState();
        }
      }
    };
    document.addEventListener('selectionchange', handler);
    return () => {
      document.removeEventListener('selectionchange', handler);
    };
  }, []);

  // Set initial text inside editor when mounted (loading from draft if available)
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      const saved = localStorage.getItem('azadi_letterhead_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.bodyText === 'string') {
            editorRef.current.innerHTML = getInitialHtml(parsed.bodyText);
            return;
          }
        } catch (e) {
          console.error("Failed to load initial draft bodyText", e);
        }
      }
      editorRef.current.innerHTML = getInitialHtml(letterhead.bodyText);
    }
  }, []);

  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleEditorInput();
    updateToolbarState();
  };

  const applyInlineStyle = (property: string, value: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    if (property === 'font-size') {
      document.execCommand('fontSize', false, '7');
      const fontTags = editorRef.current?.querySelectorAll('font[size="7"]');
      fontTags?.forEach(tag => {
        const span = document.createElement('span');
        span.style.fontSize = value;
        span.innerHTML = tag.innerHTML;
        tag.parentNode?.replaceChild(span, tag);
      });
    } else if (property === 'font-family') {
      document.execCommand('fontName', false, value);
    } else if (property === 'color') {
      document.execCommand('foreColor', false, value);
    }
    handleEditorInput();
    updateToolbarState();
  };

  const applyBlockStyle = (styleProperty: string, value: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    let container = range.commonAncestorContainer as HTMLElement;
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentNode as HTMLElement;
    }

    const editor = editorRef.current;
    if (!editor) return;

    const blocks = Array.from(editor.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6')) as HTMLElement[];
    let appliedCount = 0;

    blocks.forEach(block => {
      if (selection.containsNode(block, true) || block.contains(container)) {
        block.style.setProperty(styleProperty, value);
        appliedCount++;
      }
    });

    if (appliedCount === 0) {
      const parentBlock = container.closest('p, div, li, h1, h2, h3, h4, h5, h6') as HTMLElement;
      if (parentBlock && editor.contains(parentBlock)) {
        parentBlock.style.setProperty(styleProperty, value);
      } else if (container === editor) {
        editor.style.setProperty(styleProperty, value);
      }
    }

    handleEditorInput();
    updateToolbarState();
  };

  const cleanPastedHTML = (element: HTMLElement): string => {
    const cleanNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        const div = document.createElement('div');
        div.textContent = node.textContent;
        return div.innerHTML;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }
      
      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();
      
      if (['script', 'style', 'meta', 'link', 'xml', 'title', 'head'].includes(tagName)) {
        return '';
      }
      
      let childrenHTML = '';
      for (let i = 0; i < el.childNodes.length; i++) {
        childrenHTML += cleanNode(el.childNodes[i]);
      }
      
      const allowedTags = [
        'p', 'div', 'span', 'b', 'strong', 'i', 'em', 'u', 'ins', 's', 'strike', 'del',
        'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'br', 'a',
        'table', 'thead', 'tbody', 'tr', 'td', 'th'
      ];
      
      if (!allowedTags.includes(tagName)) {
        return childrenHTML;
      }
      
      const cleanEl = document.createElement(tagName);
      cleanEl.innerHTML = childrenHTML;
      
      const styleAttr = el.getAttribute('style');
      if (styleAttr) {
        const tempDiv = document.createElement('div');
        tempDiv.setAttribute('style', styleAttr);
        const styles = tempDiv.style;
        const preservedStyles: string[] = [];
        
        if (styles.textAlign) preservedStyles.push(`text-align: ${styles.textAlign}`);
        if (styles.color) preservedStyles.push(`color: ${styles.color}`);
        if (styles.lineHeight) preservedStyles.push(`line-height: ${styles.lineHeight}`);
        if (styles.marginBottom) preservedStyles.push(`margin-bottom: ${styles.marginBottom}`);
        if (styles.fontWeight) preservedStyles.push(`font-weight: ${styles.fontWeight}`);
        if (styles.fontStyle) preservedStyles.push(`font-style: ${styles.fontStyle}`);
        if (styles.textDecoration) preservedStyles.push(`text-decoration: ${styles.textDecoration}`);
        if (styles.paddingLeft) preservedStyles.push(`padding-left: ${styles.paddingLeft}`);
        if (styles.marginLeft) preservedStyles.push(`margin-left: ${styles.marginLeft}`);
        if (styles.fontFamily) preservedStyles.push(`font-family: ${styles.fontFamily}`);
        if (styles.fontSize) preservedStyles.push(`font-size: ${styles.fontSize}`);
        
        if (preservedStyles.length > 0) {
          cleanEl.setAttribute('style', preservedStyles.join('; '));
        }
      } else {
        if (tagName === 'p') {
          cleanEl.setAttribute('style', 'margin-bottom: 8px; line-height: 1.5;');
        }
      }
      
      if (tagName === 'ol' && el.getAttribute('type')) {
        cleanEl.setAttribute('type', el.getAttribute('type')!);
      }
      if (tagName === 'a' && el.getAttribute('href')) {
        cleanEl.setAttribute('href', el.getAttribute('href')!);
        cleanEl.setAttribute('target', '_blank');
        cleanEl.setAttribute('rel', 'noopener noreferrer');
        cleanEl.setAttribute('style', 'color: #0284c7; text-decoration: underline;');
      }
      
      return cleanEl.outerHTML;
    };
    return cleanNode(element);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const html = clipboardData.getData('text/html');
    const text = clipboardData.getData('text/plain');

    if (html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const cleanHTML = cleanPastedHTML(doc.body);
      document.execCommand('insertHTML', false, cleanHTML);
    } else if (text) {
      const paragraphs = text.split(/\r?\n\r?\n/);
      const htmlParts = paragraphs.map(p => {
        const lines = p.split(/\r?\n/);
        return `<p style="margin-bottom: 8px; line-height: 1.5;">${lines.join('<br />')}</p>`;
      });
      const formattedText = htmlParts.join('');
      document.execCommand('insertHTML', false, formattedText);
    }
    handleEditorInput();
  };

  const BENGALI_STYLE: React.CSSProperties = { 
    fontFamily: '"Noto Sans Bengali", sans-serif',
    letterSpacing: '0px',
    fontVariantLigatures: 'common-ligatures',
    fontWeight: 900
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 bengali">
      <LetterheadStyles />
      
      {isPrintPreview && (
        <style>{`
          header, #app-layout-root > footer, nav {
            display: none !important;
          }
          #app-layout-root {
            padding: 0 !important;
            margin: 0 !important;
            background: #f1f5f9 !important;
          }
          .dark #app-layout-root {
            background: #020617 !important;
          }
        `}</style>
      )}

      {/* Print Preview Mode Sticky Toolbar */}
      {isPrintPreview && (
        <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 select-none no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <FileText size={20} />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {lang === 'bn' ? 'প্রিন্ট প্রিভিউ মোড' : 'Print Preview Mode'}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                {lang === 'bn' ? 'বাস্তবসম্মত A4 সাইজ লেটারহেড যাচাইকরণ' : 'Realistic A4 letterhead size verification'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Document Preview Language Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('bn')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'bn' 
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                বাং
              </button>
              <button
                type="button"
                onClick={() => setViewMode('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'en' 
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                EN
              </button>
            </div>

            <button 
              onClick={handleDownloadPDF} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Download size={14} /> {lang === 'bn' ? 'PDF ডাউনলোড' : 'Download PDF'}
            </button>
            
            <button 
              onClick={handlePrint} 
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer size={14} /> {lang === 'bn' ? 'প্রিন্ট' : 'Print'}
            </button>

            <button 
              onClick={() => setIsPrintPreview(false)} 
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <EyeOff size={14} /> {lang === 'bn' ? 'প্রিভিউ বন্ধ করুন' : 'Exit Preview'}
            </button>
          </div>
        </div>
      )}
      
      {/* Top Main Navigation Action Panel */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 no-print ${isPrintPreview ? 'hidden' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 md:p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-4xl font-black text-slate-900 dark:text-white">
              {t.letterhead}
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              {lang === 'bn' ? 'ডকুমেন্ট ও লেটারহেড এডিটর' : 'Word-Processor Document Editor'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Document Preview Language Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('bn')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                viewMode === 'bn' 
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              বাং
            </button>
            <button
              type="button"
              onClick={() => setViewMode('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                viewMode === 'en' 
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              EN
            </button>
          </div>

          <button 
            onClick={() => setIsPrintPreview(true)} 
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102 active:scale-98 cursor-pointer"
            title={lang === 'bn' ? 'প্রিন্ট প্রিভিউ মোড' : 'Print Preview Mode'}
          >
            <Eye size={16} /> {lang === 'bn' ? 'প্রিভিউ' : 'Print Preview'}
          </button>

          <button onClick={handleSave} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102 active:scale-98 cursor-pointer">
            <Save size={16} /> {lang === 'bn' ? 'সেভ করুন' : 'Save Config'}
          </button>
          <button onClick={handleDownloadPDF} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102 active:scale-98 cursor-pointer">
            <Download size={16} /> {lang === 'bn' ? 'PDF ডাউনলোড' : 'Download PDF'}
          </button>
          <button onClick={handlePrint} className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102 active:scale-98 cursor-pointer">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      {/* Draft Restore Alert Banner */}
      {hasRestoredDraft && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top duration-300 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                {lang === 'bn' ? 'অসংরক্ষিত খসড়া সংস্করণ উদ্ধার করা হয়েছে' : 'Unsaved draft has been restored'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-bold">
                {lang === 'bn' 
                  ? 'আপনার ব্রাউজারে একটি অসংরক্ষিত খসড়া পাওয়া গেছে যা ডাটাবেজের সংস্করণের সাথে মেলেনি।' 
                  : 'We restored your unsaved edits from local storage.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleDiscardDraft}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer"
            >
              {lang === 'bn' ? 'খসড়া বাতিল করুন' : 'Discard Draft'}
            </button>
            <button
              onClick={handleSaveDraftToDB}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase shadow transition-all cursor-pointer"
            >
              {lang === 'bn' ? 'ডাটাবেজে সেভ করুন' : 'Save to DB'}
            </button>
          </div>
        </div>
      )}

      <div className={isPrintPreview ? "w-full space-y-6" : "grid lg:grid-cols-12 gap-6 items-start"}>
        {/* Left Side settings: Signatory details & Draw Signature */}
        <div className={`lg:col-span-3 space-y-6 no-print ${isPrintPreview ? 'hidden' : ''}`}>
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            <h3 className="text-xs font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-widest">
              <Edit3 size={18} className="text-emerald-500" /> 
              {lang === 'bn' ? 'স্বাক্ষরকারী তথ্য' : 'Signatory Details'}
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {lang === 'bn' ? 'স্বাক্ষরকারীর নাম' : 'Signatory Name'}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Al-Haj Md. Abdul Hanan" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl font-bold text-xs" 
                  value={localConfig.leaderName} 
                  onChange={e => setLocalConfig({...localConfig, leaderName: e.target.value})} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {lang === 'bn' ? 'পদবী' : 'Designation'}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. President, Azadi Social Welfare" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl font-bold text-xs" 
                  value={localConfig.designation} 
                  onChange={e => setLocalConfig({...localConfig, designation: e.target.value})} 
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-xs font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-widest">
              <PenTool size={18} className="text-emerald-500" /> 
              {lang === 'bn' ? 'ডিজিটাল স্বাক্ষর' : 'Digital Signature'}
            </h3>

            {/* Tab selection */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl no-print">
              <button
                onClick={() => setSignatureTab('draw')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  signatureTab === 'draw'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                {lang === 'bn' ? 'অঙ্কন করুন' : 'Draw'}
              </button>
              <button
                onClick={() => setSignatureTab('upload')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  signatureTab === 'upload'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                {lang === 'bn' ? 'আপলোড করুন' : 'Upload'}
              </button>
            </div>
            
            {/* Draw signature content */}
            {signatureTab === 'draw' && (
              <div className="space-y-3">
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  {lang === 'bn' 
                    ? 'মাউস বা স্পর্শ দিয়ে নিচে আপনার স্বাক্ষর আঁকুন এবং সবুজ চিহ্নে ক্লিক করুন।' 
                    : 'Draw your signature inside the box below, then click the green check button.'}
                </p>
                
                <div className="relative bg-white border border-slate-200 dark:border-slate-800 rounded-xl h-32 overflow-hidden shadow-inner">
                  <canvas 
                    ref={canvasRef} 
                    width={400} 
                    height={160} 
                    onMouseDown={startDrawing} 
                    onMouseMove={draw} 
                    onMouseUp={stopDrawing} 
                    onTouchStart={startDrawing} 
                    onTouchMove={draw} 
                    onTouchEnd={stopDrawing} 
                    className="w-full h-full cursor-crosshair touch-none" 
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5 no-print">
                    <button 
                      onClick={clearCanvas} 
                      className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 shadow transition-transform active:scale-90"
                      title={lang === 'bn' ? 'মুছে ফেলুন' : 'Clear Canvas'}
                    >
                      <Eraser size={14} />
                    </button>
                    <button 
                      onClick={saveSignatureFromCanvas} 
                      className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 shadow transition-transform active:scale-90"
                      title={lang === 'bn' ? 'সংরক্ষণ করুন' : 'Capture Signature'}
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload signature content */}
            {signatureTab === 'upload' && (
              <div className="space-y-3">
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  {lang === 'bn' 
                    ? 'স্বচ্ছ ব্যাকগ্রাউন্ড বিশিষ্ট (PNG/WEBP) স্বাক্ষর ছবি সিলেক্ট করুন।' 
                    : 'Upload a signature image. Transparent PNG or WEBP formats are highly recommended.'}
                </p>

                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('sig-upload-input')?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[128px] ${
                    dragActive 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-950/40'
                  }`}
                >
                  <input 
                    id="sig-upload-input"
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleSignatureUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden" 
                  />
                  <Upload size={24} className="text-slate-400 dark:text-slate-500 mb-1.5" />
                  <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'ফাইল সিলেক্ট করতে ক্লিক করুন' : 'Click to select file'}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1">
                    {lang === 'bn' ? 'অথবা ড্র্যাগ করে এখানে ছাড়ুন' : 'or drag & drop signature here'}
                  </p>
                  <p className="text-[8px] text-slate-400/80 mt-1 font-mono">
                    (PNG, WEBP, JPG)
                  </p>
                </div>
              </div>
            )}

            {/* Layout & Sizing sliders */}
            {localConfig.signature && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider mb-1">
                  <Sliders size={14} className="text-emerald-500" />
                  {lang === 'bn' ? 'পজিশন ও সাইজ' : 'Layout & Sizing'}
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>{lang === 'bn' ? 'স্বাক্ষরের প্রস্থ' : 'Width'}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-500">{localConfig.signatureWidth ?? 112}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="60" 
                    max="220" 
                    value={localConfig.signatureWidth ?? 112} 
                    onChange={e => setLocalConfig({ ...localConfig, signatureWidth: Number(e.target.value) })}
                    className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>{lang === 'bn' ? 'ভার্টিকাল পজিশন' : 'Vertical Offset'}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-500">{localConfig.signatureYOffset ?? -48}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="-120" 
                    max="10" 
                    value={localConfig.signatureYOffset ?? -48} 
                    onChange={e => setLocalConfig({ ...localConfig, signatureYOffset: Number(e.target.value) })}
                    className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>{lang === 'bn' ? 'হরাইজন্টাল পজিশন' : 'Horizontal Offset'}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-500">{localConfig.signatureXOffset ?? 0}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="-80" 
                    max="80" 
                    value={localConfig.signatureXOffset ?? 0} 
                    onChange={e => setLocalConfig({ ...localConfig, signatureXOffset: Number(e.target.value) })}
                    className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>{lang === 'bn' ? 'স্বাক্ষর আবর্তন (ঘূর্ণন)' : 'Rotation'}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-500">{localConfig.signatureRotation ?? 0}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={localConfig.signatureRotation ?? 0} 
                    onChange={e => setLocalConfig({ ...localConfig, signatureRotation: Number(e.target.value) })}
                    className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>{lang === 'bn' ? 'স্বচ্ছতা (অস্বচ্ছতা)' : 'Opacity'}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-500">{localConfig.signatureOpacity ?? 100}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={localConfig.signatureOpacity ?? 100} 
                    onChange={e => setLocalConfig({ ...localConfig, signatureOpacity: Number(e.target.value) })}
                    className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsOverlayModalOpen(true)}
                  className="w-full mt-2 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/25 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-200/50 dark:border-emerald-900/30"
                >
                  <Sliders size={13} />
                  {lang === 'bn' ? 'ওভারলে ম্যানেজমেন্ট মডাল' : 'Overlay Management Modal'}
                </button>

                <button
                  onClick={() => setLocalConfig({ ...localConfig, signature: '' })}
                  className="w-full mt-1 py-2 border border-rose-200 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'স্বাক্ষর মুছে ফেলুন' : 'Remove Signature'}
                </button>
              </div>
            )}
          </div>

          {/* QR Code Verification Panel */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            <h3 className="text-xs font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-widest">
              <QrCode size={18} className="text-emerald-500" /> 
              {lang === 'bn' ? 'ডকুমেন্ট ভেরিফিকেশন কিউআর' : 'Document Verification QR'}
            </h3>

            <div className="space-y-4">
              {/* Enabled toggle */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  {lang === 'bn' ? 'ভেরিফিকেশন কিউআর সক্রিয়' : 'Enable QR Verification'}
                </span>
                <button
                  type="button"
                  onClick={() => setLocalConfig({ ...localConfig, qrEnabled: !(localConfig.qrEnabled ?? true) })}
                  className={`w-10 h-6 flex items-center rounded-full p-1 duration-300 cursor-pointer ${
                    (localConfig.qrEnabled ?? true) ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md pointer-events-none" />
                </button>
              </div>

              {(localConfig.qrEnabled ?? true) && (
                <>
                  {/* Position selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      {lang === 'bn' ? 'কিউআর কোড পজিশন' : 'QR Position'}
                    </label>
                    <select
                      value={localConfig.qrPosition ?? 'bottom-left'}
                      onChange={e => setLocalConfig({ ...localConfig, qrPosition: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                    >
                      <option value="bottom-left">{lang === 'bn' ? 'নিচে বামে (সিল এরিয়া)' : 'Bottom Left (Stamp Area)'}</option>
                      <option value="top-right">{lang === 'bn' ? 'উপরে ডানে (হেডার এরিয়া)' : 'Top Right (Header Area)'}</option>
                      <option value="bottom-right">{lang === 'bn' ? 'নিচে ডানে (স্বাক্ষরের পাশে)' : 'Bottom Right (Signatory Area)'}</option>
                      <option value="footer-center">{lang === 'bn' ? 'নিচে মাঝে (ফুটার সেন্টার)' : 'Footer Center'}</option>
                    </select>
                  </div>

                  {/* QR Sizing Offset controls */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                        <span>{lang === 'bn' ? 'কিউআর কোড সাইজ' : 'QR Size'}</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-500">{localConfig.qrSize ?? 64}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="40" 
                        max="120" 
                        value={localConfig.qrSize ?? 64} 
                        onChange={e => setLocalConfig({ ...localConfig, qrSize: Number(e.target.value) })}
                        className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                        <span>{lang === 'bn' ? 'হরাইজন্টাল অফসেট (X)' : 'Horizontal Offset (X)'}</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-500">{localConfig.qrXOffset ?? 0}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="-100" 
                        max="100" 
                        value={localConfig.qrXOffset ?? 0} 
                        onChange={e => setLocalConfig({ ...localConfig, qrXOffset: Number(e.target.value) })}
                        className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                        <span>{lang === 'bn' ? 'ভার্টিকাল অফসেট (Y)' : 'Vertical Offset (Y)'}</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-500">{localConfig.qrYOffset ?? 0}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="-100" 
                        max="100" 
                        value={localConfig.qrYOffset ?? 0} 
                        onChange={e => setLocalConfig({ ...localConfig, qrYOffset: Number(e.target.value) })}
                        className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Metadata Content Area */}
                  <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <label className="text-[10px] font-black uppercase text-slate-400 flex justify-between">
                      <span>{lang === 'bn' ? 'কিউআর এনকোড ডাটা' : 'QR Encoded Data'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (localConfig.qrCustomText) {
                            setLocalConfig({ ...localConfig, qrCustomText: '' });
                          } else {
                            setLocalConfig({ ...localConfig, qrCustomText: qrVerificationText });
                          }
                        }}
                        className="text-[9px] text-emerald-600 dark:text-emerald-400 hover:underline font-black uppercase cursor-pointer"
                      >
                        {localConfig.qrCustomText 
                          ? (lang === 'bn' ? 'অটো জেনারেট করুন' : 'Reset to Auto') 
                          : (lang === 'bn' ? 'কাস্টমাইজ করুন' : 'Customize')}
                      </button>
                    </label>
                    <textarea
                      value={localConfig.qrCustomText ? localConfig.qrCustomText : qrVerificationText}
                      readOnly={!localConfig.qrCustomText}
                      onChange={e => setLocalConfig({ ...localConfig, qrCustomText: e.target.value })}
                      rows={4}
                      className={`w-full text-[10px] font-mono p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 resize-none ${
                        localConfig.qrCustomText ? 'focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500' : 'cursor-not-allowed select-none'
                      }`}
                      placeholder="Automatically derived document metadata..."
                    />
                    <p className="text-[8px] text-slate-400 font-bold leading-tight">
                      {lang === 'bn' 
                        ? 'এই কিউআর কোডটি স্ক্যান করলে উপরোক্ত ভেরিফিকেশন তথ্য বা কাস্টম লিংক পাওয়া যাবে।' 
                        : 'Scanning this QR code reveals the official digital verification record above.'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scaled Preview Wrapper with Desktop Toolbar */}
        <div className={isPrintPreview 
          ? "w-full bg-slate-150 dark:bg-slate-950 p-4 md:p-10 flex flex-col items-center justify-start gap-8 duration-300"
          : "lg:col-span-9 bg-slate-100 dark:bg-slate-950 p-3 md:p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden space-y-6 duration-300"
        }>
          
          {/* MICROSOFT WORD STYLE RICH TEXT TOOLBAR */}
          <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-md no-print flex flex-wrap gap-2 items-center justify-between ${isPrintPreview ? 'hidden' : ''}`}>
            <div className="flex flex-wrap items-center gap-1.5">
              {/* History Group */}
              <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-800 pr-1.5">
                <button 
                  onClick={() => executeCommand('undo')} 
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 size={16} />
                </button>
                <button 
                  onClick={() => executeCommand('redo')} 
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 size={16} />
                </button>
              </div>

              {/* Font Picker */}
              <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-1.5">
                <select 
                  value={activeStyles.fontName} 
                  onChange={e => applyInlineStyle('font-family', e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-700 dark:text-slate-200"
                  title="Font Family"
                >
                  <option value="Noto Sans Bengali">Bengali</option>
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="Calibri">Calibri</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                </select>

                <select 
                  value={activeStyles.fontSize} 
                  onChange={e => applyInlineStyle('font-size', e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-700 dark:text-slate-200"
                  title="Font Size"
                >
                  {['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'].map(sz => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
              </div>

              {/* Bold, Italic, Underline Style buttons */}
              <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-800 pr-1.5">
                <button 
                  onClick={() => executeCommand('bold')} 
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeStyles.bold 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Bold (Ctrl+B)"
                >
                  <BoldIcon size={16} />
                </button>
                <button 
                  onClick={() => executeCommand('italic')} 
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeStyles.italic 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Italic (Ctrl+I)"
                >
                  <ItalicIcon size={16} />
                </button>
                <button 
                  onClick={() => executeCommand('underline')} 
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeStyles.underline 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Underline (Ctrl+U)"
                >
                  <UnderlineIcon size={16} />
                </button>
              </div>

              {/* Alignment Buttons */}
              <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-800 pr-1.5">
                <button 
                  onClick={() => executeCommand('justifyLeft')} 
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeStyles.justifyLeft 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Align Left"
                >
                  <AlignLeft size={16} />
                </button>
                <button 
                  onClick={() => executeCommand('justifyCenter')} 
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeStyles.justifyCenter 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Align Center"
                >
                  <AlignCenter size={16} />
                </button>
                <button 
                  onClick={() => executeCommand('justifyRight')} 
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeStyles.justifyRight 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Align Right"
                >
                  <AlignRight size={16} />
                </button>
                <button 
                  onClick={() => executeCommand('justifyFull')} 
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeStyles.justifyFull 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Align Justify"
                >
                  <AlignJustify size={16} />
                </button>
              </div>

              {/* Lists and Indent Group */}
              <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-800 pr-1.5">
                <button 
                  onClick={() => executeCommand('insertUnorderedList')} 
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeStyles.unorderedList 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Bullet List"
                >
                  <List size={16} />
                </button>
                <button 
                  onClick={() => executeCommand('insertOrderedList')} 
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeStyles.orderedList 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Numbered List"
                >
                  <ListOrdered size={16} />
                </button>
                <button 
                  onClick={() => executeCommand('outdent')} 
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Decrease Indent"
                >
                  <Outdent size={16} />
                </button>
                <button 
                  onClick={() => executeCommand('indent')} 
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Increase Indent"
                >
                  <Indent size={16} />
                </button>
              </div>

              {/* Line & Paragraph Spacing Dropdowns */}
              <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-1.5">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 select-none">Line</span>
                  <select 
                    value={activeStyles.lineHeight} 
                    onChange={e => applyBlockStyle('line-height', e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-700 dark:text-slate-200"
                    title="Line Spacing"
                  >
                    <option value="1.0">1.0</option>
                    <option value="1.15">1.15</option>
                    <option value="1.5">1.5</option>
                    <option value="2.0">2.0</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 select-none font-sans">Para</span>
                  <select 
                    value={activeStyles.marginBottom} 
                    onChange={e => applyBlockStyle('margin-bottom', e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-700 dark:text-slate-200"
                    title="Paragraph Spacing"
                  >
                    <option value="0px">0px</option>
                    <option value="4px">4px</option>
                    <option value="8px">8px</option>
                    <option value="12px">12px</option>
                    <option value="16px">16px</option>
                  </select>
                </div>
              </div>

              {/* Color Dot presets with Custom Picker */}
              <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-1.5">
                {['#000000', '#4b5563', '#047857', '#1d4ed8', '#b91c1c', '#6d28d9'].map(c => (
                  <button
                    key={c}
                    onClick={() => applyInlineStyle('color', c)}
                    style={{ backgroundColor: c }}
                    className={`w-4 h-4 rounded-full border transition-transform hover:scale-125 cursor-pointer ${
                      activeStyles.color === c ? 'ring-2 ring-emerald-500 ring-offset-1 scale-110 border-white' : 'border-slate-300'
                    }`}
                    title={c}
                  />
                ))}
                <input 
                  type="color" 
                  value={activeStyles.color} 
                  onChange={e => applyInlineStyle('color', e.target.value)}
                  className="w-5 h-5 cursor-pointer rounded border border-slate-300 bg-transparent p-0 overflow-hidden" 
                  title="Custom Color"
                />
              </div>

              {/* Cut, Copy, Select All */}
              <div className="flex items-center gap-0.5">
                <button 
                  onClick={() => executeCommand('cut')} 
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Cut (Ctrl+X)"
                >
                  <Scissors size={15} />
                </button>
                <button 
                  onClick={() => executeCommand('copy')} 
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Copy (Ctrl+C)"
                >
                  <Copy size={15} />
                </button>
                <button 
                  onClick={() => executeCommand('selectAll')} 
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Select All (Ctrl+A)"
                >
                  <CheckSquare size={15} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {autoSaveStatus === 'saving' && (
                <div className="flex items-center gap-1.5 text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {lang === 'bn' ? 'অটো-সেভ হচ্ছে...' : 'Auto-saving...'}
                  </span>
                </div>
              )}
              {autoSaveStatus === 'saved' && (
                <div className="flex items-center gap-1.5 text-emerald-500 animate-in fade-in duration-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {lang === 'bn' ? 'অটো-সেভড' : 'Auto-saved'}
                  </span>
                </div>
              )}
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden xl:block">
                Ctrl+V to paste
              </div>
            </div>
          </div>

          {/* Actual Letterhead Preview Area */}
          <div className="overflow-x-auto pb-4">
            <div 
              ref={letterheadRef} 
              className="bg-white shadow-2xl relative flex flex-col mx-auto origin-top" 
              style={{ 
                width: '210mm', 
                height: '297mm', 
                padding: '12mm 15mm 15mm 15mm', 
                boxSizing: 'border-box',
                color: '#000000',
                fontFamily: '"Noto Sans Bengali", sans-serif'
              }}
            >
              {/* Pad Slogan Slat Header */}
              <div className="text-center mb-4 select-none pointer-events-none">
                <div className="inline-block px-10 py-1.5 border-b border-emerald-950/10 text-[13px] text-emerald-950 uppercase" style={{ ...BENGALI_STYLE }}>
                  {viewMode === 'bn' ? settings.sloganBn : settings.sloganEn}
                </div>
              </div>

              {/* Main Pad Letter Header */}
              <div className="flex flex-col items-center text-center gap-4 border-b-2 border-emerald-900 pb-4 mb-6 select-none pointer-events-none">
                <div className="flex items-center justify-between w-full">
                  <div className="w-20 h-20 p-1 border-2 border-emerald-600 rounded-full bg-white flex items-center justify-center overflow-hidden">
                     <img src={settings.logo} className="w-full h-full object-contain" alt="Logo" />
                  </div>
                  <div className="flex-1 px-4">
                    <h1 className="text-3xl font-black text-emerald-950 leading-none mb-1" style={{ fontSize: '32px', ...BENGALI_STYLE }}>{viewMode === 'bn' ? settings.nameBn : settings.nameEn}</h1>
                    <p className="text-[10px] font-bold text-emerald-800" style={{ ...BENGALI_STYLE, fontWeight: 700 }}>{viewMode === 'bn' ? settings.establishedBn : settings.establishedEn}</p>
                  </div>
                  <div className="w-20 h-12 border border-slate-100 bg-white flex items-center justify-center rounded-sm">
                    <img src={settings.flag} className="w-full h-full object-cover" alt="Flag" />
                  </div>
                </div>
              </div>

              {/* Date & Reference Row */}
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold mb-4 px-4 select-none pointer-events-none">
                <div className="font-mono">REF: ASWO/PAD/{new Date().getFullYear()}/{(letterhead?.leaderName?.split(' ')[0] || 'ADMIN').toUpperCase()}</div>
                <div>{lang === 'bn' ? 'তারিখ: ' : 'Date: '} <span className="underline decoration-slate-300 underline-offset-4">{today}</span></div>
              </div>

              {/* REAL-TIME WYSIWYG DOCUMENT EDITING BODY AREA */}
              <div 
                ref={editorRef}
                contentEditable={!isPrintPreview}
                onInput={handleEditorInput}
                onPaste={handlePaste}
                className="editor-body flex-1 px-4 text-[14px] leading-relaxed outline-none overflow-y-auto text-slate-800"
                style={{ 
                  ...BENGALI_STYLE, 
                  fontWeight: 500,
                  minHeight: '160mm',
                  maxHeight: '190mm',
                }}
                placeholder={viewMode === 'bn' ? 'পত্রের মূল বিষয়বস্তু এখানে সরাসরি টাইপ বা পেস্ট করুন...' : 'Type or paste the official letter content directly here...'}
              />

              {/* Editor Stats Indicator (Character and Word Counts) */}
              <div className="no-print mt-2 mx-4 py-1.5 border-t border-dashed border-slate-200 flex items-center justify-between text-[11px] font-black uppercase text-slate-400 select-none">
                <div className="flex items-center gap-4">
                  <span>
                    {lang === 'bn' ? 'শব্দ সংখ্যা: ' : 'Words: '}
                    <span className="text-emerald-600 dark:text-emerald-500 font-mono text-xs ml-1">{wordCount}</span>
                  </span>
                  <span>
                    {lang === 'bn' ? 'অক্ষর সংখ্যা: ' : 'Characters: '}
                    <span className="text-emerald-600 dark:text-emerald-500 font-mono text-xs ml-1">{charCount}</span>
                  </span>
                </div>
                <div className="hidden sm:block text-[10px] text-slate-300 font-bold">
                  {lang === 'bn' ? 'প্রস্তাবিত দৈর্ঘ্য: ৩০০ শব্দ' : 'Recommended: < 300 words'}
                </div>
              </div>

              {/* Pad Official Signatory Footer Area */}
              <div className="pt-6 border-t border-emerald-900/5 mt-4 flex justify-between items-end select-none">
                {/* Visual Stamp Block */}
                <div className="w-24 h-24 border-4 border-double border-emerald-900/10 rounded-full flex items-center justify-center text-[8px] font-black opacity-40 select-none">STAMP</div>
                
                {/* Leader Signatory Block */}
                <div className="text-center w-52 space-y-1 relative">
                  {/* Drawn/Uploaded Signature overlay */}
                  {localConfig.signature && (
                    <div 
                      className={`absolute mix-blend-multiply select-none flex items-center justify-center h-16 transition-all ${
                        isPrintPreview 
                          ? 'pointer-events-none' 
                          : 'cursor-pointer hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2 hover:bg-emerald-50/20 rounded px-1 group'
                      }`}
                      style={{
                        width: `${localConfig.signatureWidth ?? 112}px`,
                        top: `${localConfig.signatureYOffset ?? -48}px`,
                        left: '50%',
                        transform: `translateX(calc(-50% + ${localConfig.signatureXOffset ?? 0}px)) rotate(${localConfig.signatureRotation ?? 0}deg)`,
                        opacity: (localConfig.signatureOpacity ?? 100) / 100,
                      }}
                      onClick={() => {
                        if (!isPrintPreview) {
                          setIsOverlayModalOpen(true);
                        }
                      }}
                      title={isPrintPreview ? undefined : (lang === 'bn' ? 'স্বাক্ষর সেটিংস পরিবর্তন করতে ক্লিক করুন' : 'Click to adjust signature overlay')}
                    >
                      <img 
                        src={localConfig.signature} 
                        className="w-full h-full object-contain" 
                        alt="Signature" 
                        crossOrigin="anonymous"
                      />
                      {!isPrintPreview && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {lang === 'bn' ? 'এডজাস্ট করুন' : 'Click to adjust'}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="h-[1.5px] bg-slate-950 w-full mb-1"></div>
                  <div className="text-lg font-black text-slate-950 leading-none" style={{ ...BENGALI_STYLE }}>{localConfig.leaderName}</div>
                  <div className="text-[11px] font-bold text-emerald-900" style={{ ...BENGALI_STYLE, fontWeight: 700 }}>{localConfig.designation}</div>
                </div>
              </div>

              {/* Document Verification QR Code Overlay */}
              {(localConfig.qrEnabled ?? true) && qrCodeDataUrl && (
                <div 
                  className={`select-none transition-all flex flex-col items-center justify-center ${
                    isPrintPreview 
                      ? 'pointer-events-none' 
                      : 'cursor-pointer hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2 hover:bg-emerald-50/20 rounded p-1 group'
                  }`}
                  style={getQrStyle()}
                  onClick={() => {
                    if (!isPrintPreview) {
                      setIsOverlayModalOpen(true);
                    }
                  }}
                  title={isPrintPreview ? undefined : (lang === 'bn' ? 'কিউআর কোড সেটিংস পরিবর্তন করতে ক্লিক করুন' : 'Click to adjust QR Code')}
                >
                  <img 
                    src={qrCodeDataUrl} 
                    className="w-full h-full object-contain mix-blend-multiply" 
                    alt="Verification QR Code" 
                  />
                  <div className="text-[6px] text-slate-400 font-mono tracking-tighter uppercase leading-none mt-0.5 whitespace-nowrap">
                    ASWO VERIFIED
                  </div>
                  {!isPrintPreview && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {lang === 'bn' ? 'এডজাস্ট করুন' : 'Click to adjust'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <p className="text-center text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest no-print">
            {lang === 'bn' ? 'বাম থেকে ডানে স্ক্রল করে সম্পূর্ণ দেখুন' : 'Scroll left to right to see full preview'}
          </p>
        </div>
      </div>

      {/* OVERLAY MANAGEMENT MODAL */}
      {isOverlayModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full p-6 md:p-8 overflow-y-auto max-h-[90vh] flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {lang === 'bn' ? 'ওভারলে এবং কিউআর কোড সেটিংস' : 'Overlay & QR Code Settings'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {lang === 'bn' ? 'স্বাক্ষর এবং কিউআর কোডের পজিশন, আকার এবং আবর্তন ফাইন-টিউন করুন' : 'Fine-tune scale, positioning, opacity, and layout offsets'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOverlayModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <EyeOff size={20} />
              </button>
            </div>

            {/* Modal Content Grid */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Interactive Visual Simulator Container with Checkerboard/Transparency background */}
              <div className="flex flex-col gap-3">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {lang === 'bn' ? 'বাস্তবসম্মত ওভারলে প্রিভিউ' : 'Live Overlay Simulator'}
                </div>
                <div 
                  className="relative w-full aspect-square md:h-80 rounded-2xl bg-slate-100 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-inner p-6 select-none"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
                    opacity: 0.85
                  }}
                >
                  {/* Outer Frame Simulating Letter Bottom */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200/50 shadow-md w-full max-w-xs relative text-center">
                    <div className="text-[8px] text-slate-300 font-bold tracking-widest uppercase mb-6 border-b border-dashed border-slate-100 pb-1.5">
                      {lang === 'bn' ? 'স্বাক্ষর অবস্থান সিমুলেশন' : 'Translucency & Layering View'}
                    </div>
                    
                    {/* Simulated Signature overlay positioning */}
                    {localConfig.signature ? (
                      <div 
                        className="absolute mix-blend-multiply select-none flex items-center justify-center h-16 pointer-events-none"
                        style={{
                          width: `${localConfig.signatureWidth ?? 112}px`,
                          top: `calc(50% + ${localConfig.signatureYOffset ?? -48}px)`,
                          left: '50%',
                          transform: `translateX(calc(-50% + ${localConfig.signatureXOffset ?? 0}px)) rotate(${localConfig.signatureRotation ?? 0}deg)`,
                          opacity: (localConfig.signatureOpacity ?? 100) / 100,
                        }}
                      >
                        <img 
                          src={localConfig.signature} 
                          className="w-full h-full object-contain" 
                          alt="Signature Preview" 
                        />
                      </div>
                    ) : (
                      <div className="h-16 flex items-center justify-center text-[10px] text-slate-300 font-bold uppercase">
                        {lang === 'bn' ? 'কোন স্বাক্ষর পাওয়া যায়নি' : 'No signature loaded'}
                      </div>
                    )}

                    {/* Simulated QR Code Overlay */}
                    {(localConfig.qrEnabled ?? true) && qrCodeDataUrl && (
                      <div 
                        className="absolute select-none pointer-events-none flex flex-col items-center justify-center bg-white border border-slate-150 p-0.5 shadow-sm rounded-sm"
                        style={{
                          width: `${(localConfig.qrSize ?? 64) * 0.45}px`,
                          height: `${(localConfig.qrSize ?? 64) * 0.45}px`,
                          bottom: '12px',
                          left: '12px',
                          ...(localConfig.qrPosition === 'top-right' ? { top: '12px', right: '12px', left: 'auto', bottom: 'auto' } : {}),
                          ...(localConfig.qrPosition === 'bottom-right' ? { bottom: '12px', right: '12px', left: 'auto' } : {}),
                          ...(localConfig.qrPosition === 'footer-center' ? { bottom: '12px', left: '50%', transform: 'translateX(-50%)' } : {}),
                          transform: `${localConfig.qrPosition === 'footer-center' ? 'translateX(-50%)' : ''} translate(${(localConfig.qrXOffset ?? 0) * 0.2}px, ${-(localConfig.qrYOffset ?? 0) * 0.2}px)`,
                        }}
                      >
                        <img 
                          src={qrCodeDataUrl} 
                          className="w-full h-full object-contain" 
                          alt="QR Preview" 
                        />
                      </div>
                    )}

                    <div className="h-[1.5px] bg-slate-900 w-full mb-1"></div>
                    <div className="text-sm font-black text-slate-900 leading-none" style={{ ...BENGALI_STYLE }}>{localConfig.leaderName}</div>
                    <div className="text-[9px] font-bold text-emerald-800 mt-1" style={{ ...BENGALI_STYLE }}>{localConfig.designation}</div>
                  </div>
                  
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded">
                    {lang === 'bn' ? 'স্বচ্ছ ব্যাকগ্রাউন্ড যাচাইকরণ গ্রিড' : 'Transparency verification grid'}
                  </div>
                </div>
              </div>

              {/* Slider Controls Side */}
              <div className="space-y-4">
                {/* Segmented Tab Control */}
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('signature')}
                    className={`flex-1 py-2 text-center rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      activeModalTab === 'signature'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-black'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {lang === 'bn' ? 'স্বাক্ষর সেটিংস' : 'Signature Settings'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('qr')}
                    className={`flex-1 py-2 text-center rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      activeModalTab === 'qr'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-black'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {lang === 'bn' ? 'কিউআর কোড সেটিংস' : 'QR Code Settings'}
                  </button>
                </div>

                {activeModalTab === 'signature' ? (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                      {lang === 'bn' ? 'ডিজিটাল স্বাক্ষর সেটিংস নিয়ন্ত্রণ' : 'Signature Placement & Opacity'}
                    </div>

                    {/* Sizing Width */}
                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <span>{lang === 'bn' ? 'আকার (প্রস্থ)' : 'Scale (Width)'}</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-500 font-bold">{localConfig.signatureWidth ?? 112}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="60" 
                        max="220" 
                        value={localConfig.signatureWidth ?? 112} 
                        onChange={e => setLocalConfig({ ...localConfig, signatureWidth: Number(e.target.value) })}
                        className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    {/* Rotation */}
                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <span>{lang === 'bn' ? 'আবর্তন কোণ (ঘূর্ণন)' : 'Rotation angle'}</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-500 font-bold">{localConfig.signatureRotation ?? 0}°</span>
                      </div>
                      <input 
                        type="range" 
                        min="-180" 
                        max="180" 
                        value={localConfig.signatureRotation ?? 0} 
                        onChange={e => setLocalConfig({ ...localConfig, signatureRotation: Number(e.target.value) })}
                        className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    {/* Opacity */}
                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <span>{lang === 'bn' ? 'অস্বচ্ছতা (স্বচ্ছতা)' : 'Opacity (Translucency)'}</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-500 font-bold">{localConfig.signatureOpacity ?? 100}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={localConfig.signatureOpacity ?? 100} 
                        onChange={e => setLocalConfig({ ...localConfig, signatureOpacity: Number(e.target.value) })}
                        className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    {/* Offsets (X / Y) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                          <span>{lang === 'bn' ? 'ভার্টিকাল' : 'Vertical'}</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-500 font-bold">{localConfig.signatureYOffset ?? -48}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="-120" 
                          max="20" 
                          value={localConfig.signatureYOffset ?? -48} 
                          onChange={e => setLocalConfig({ ...localConfig, signatureYOffset: Number(e.target.value) })}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                      
                      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                          <span>{lang === 'bn' ? 'হরাইজন্টাল' : 'Horizontal'}</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-500 font-bold">{localConfig.signatureXOffset ?? 0}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={localConfig.signatureXOffset ?? 0} 
                          onChange={e => setLocalConfig({ ...localConfig, signatureXOffset: Number(e.target.value) })}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                      {lang === 'bn' ? 'ভেরিফিকেশন কিউআর কোড সেটিংস' : 'Verification QR Placement & Layout'}
                    </div>

                    {/* Position selector */}
                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                      <label className="text-[10px] font-black uppercase text-slate-500">
                        {lang === 'bn' ? 'কিউআর কোড পজিশন' : 'QR Position'}
                      </label>
                      <select
                        value={localConfig.qrPosition ?? 'bottom-left'}
                        onChange={e => setLocalConfig({ ...localConfig, qrPosition: e.target.value as any })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                      >
                        <option value="bottom-left">{lang === 'bn' ? 'নিচে বামে (সিল এরিয়া)' : 'Bottom Left (Stamp Area)'}</option>
                        <option value="top-right">{lang === 'bn' ? 'উপরে ডানে (হেডার এরিয়া)' : 'Top Right (Header Area)'}</option>
                        <option value="bottom-right">{lang === 'bn' ? 'নিচে ডানে (স্বাক্ষরের পাশে)' : 'Bottom Right (Signatory Area)'}</option>
                        <option value="footer-center">{lang === 'bn' ? 'নিচে মাঝে (ফুটার সেন্টার)' : 'Footer Center'}</option>
                      </select>
                    </div>

                    {/* QR Sizing Width */}
                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <span>{lang === 'bn' ? 'কিউআর সাইজ' : 'QR Size Scale'}</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-500 font-bold">{localConfig.qrSize ?? 64}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="40" 
                        max="120" 
                        value={localConfig.qrSize ?? 64} 
                        onChange={e => setLocalConfig({ ...localConfig, qrSize: Number(e.target.value) })}
                        className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    {/* Offsets (X / Y) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                          <span>{lang === 'bn' ? 'ভার্টিকাল (Y)' : 'Vertical Offset (Y)'}</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-500 font-bold">{localConfig.qrYOffset ?? 0}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={localConfig.qrYOffset ?? 0} 
                          onChange={e => setLocalConfig({ ...localConfig, qrYOffset: Number(e.target.value) })}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                      
                      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                          <span>{lang === 'bn' ? 'হরাইজন্টাল (X)' : 'Horizontal Offset (X)'}</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-500 font-bold">{localConfig.qrXOffset ?? 0}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={localConfig.qrXOffset ?? 0} 
                          onChange={e => setLocalConfig({ ...localConfig, qrXOffset: Number(e.target.value) })}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2">
              <button
                type="button"
                onClick={() => {
                  if (activeModalTab === 'signature') {
                    setLocalConfig({
                      ...localConfig,
                      signatureWidth: 112,
                      signatureYOffset: -48,
                      signatureXOffset: 0,
                      signatureRotation: 0,
                      signatureOpacity: 100
                    });
                  } else {
                    setLocalConfig({
                      ...localConfig,
                      qrSize: 64,
                      qrXOffset: 0,
                      qrYOffset: 0,
                      qrPosition: 'bottom-left',
                      qrEnabled: true,
                      qrCustomText: ''
                    });
                  }
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'সেটিংস রিসেট করুন' : 'Reset Defaults'}
              </button>

              <button
                type="button"
                onClick={() => setIsOverlayModalOpen(false)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {lang === 'bn' ? 'প্রয়োগ করুন এবং বন্ধ করুন' : 'Apply & Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
