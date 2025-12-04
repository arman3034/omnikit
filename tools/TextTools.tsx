import React, { useState, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import { Card, Button, TextAreaGroup } from '../components/UIComponents';
import { Copy, Type, Code, Trash2, FileText, Download } from 'lucide-react';
import { useToast } from '../components/Toast';
import { generateMarkdownCheatSheet } from '../services/pdfGenerator';

// --- Text Converter (Case, Stats) ---
export const TextConverter: React.FC = () => {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({ words: 0, chars: 0, readingTime: 0 });
  const { showToast } = useToast();

  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readingTime = Math.ceil(words / 200); // approx 200 wpm
    setStats({ words, chars, readingTime });
  }, [text]);

  const transform = (type: 'upper' | 'lower' | 'title' | 'sentence') => {
    let result = text;
    switch (type) {
      case 'upper': result = text.toUpperCase(); break;
      case 'lower': result = text.toLowerCase(); break;
      case 'title': 
        result = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        break;
      case 'sentence':
        result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        break;
    }
    setText(result);
    showToast('Text converted!', 'info');
  };

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  }, [text, showToast]);

  const clearText = () => {
    setText('');
    showToast('Text cleared', 'info');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (!window.getSelection()?.toString() && text) {
          e.preventDefault();
          copyToClipboard();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copyToClipboard, text]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <TextAreaGroup 
          label="Input Text" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="Type or paste your text here..."
          className="h-80 font-mono text-sm leading-relaxed"
          aria-label="Text to convert"
        />
        <div className="flex flex-wrap gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700" role="toolbar" aria-label="Text transformation tools">
          <Button size="sm" variant="outline" onClick={() => transform('upper')}>UPPERCASE</Button>
          <Button size="sm" variant="outline" onClick={() => transform('lower')}>lowercase</Button>
          <Button size="sm" variant="outline" onClick={() => transform('title')}>Title Case</Button>
          <Button size="sm" variant="outline" onClick={() => transform('sentence')}>Sentence case</Button>
          <div className="flex-grow"></div>
           <Button size="sm" variant="secondary" onClick={clearText} aria-label="Clear Text" disabled={!text}>
            <Trash2 size={16} className="mr-2" /> Clear
          </Button>
          <Button size="sm" variant="primary" onClick={copyToClipboard} aria-label="Copy result" disabled={!text}>
            <Copy size={16} className="mr-2" /> Copy Result
          </Button>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-right">Pro tip: Press Ctrl+C to copy full text</p>
      </div>
      
      <div className="space-y-6">
        <Card title="Statistics">
          <div className="space-y-4" aria-live="polite">
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Words</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xl">{stats.words}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Characters</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xl">{stats.chars}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Reading Time</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xl">~{stats.readingTime} min</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Markdown Previewer ---
export const MarkdownPreview: React.FC = () => {
  const [markdown, setMarkdown] = useState('# Hello World\n\nStart typing **markdown** here!');
  const [html, setHtml] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const parsed = marked.parse(markdown);
    if (parsed instanceof Promise) {
        parsed.then(res => setHtml(res));
    } else {
        setHtml(parsed);
    }
  }, [markdown]);

  const copyHtml = useCallback(() => {
    navigator.clipboard.writeText(html);
    showToast('HTML copied to clipboard!', 'success');
  }, [html, showToast]);

  const clearMarkdown = () => {
    setMarkdown('');
    showToast('Markdown cleared', 'info');
  };

  const handleDownloadCheatSheet = () => {
    try {
      generateMarkdownCheatSheet();
      showToast('Opening cheat sheet in new tab', 'info');
    } catch (e) {
      console.error(e);
      showToast('Error generating PDF', 'error');
    }
  };

   useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (!window.getSelection()?.toString() && html) {
          e.preventDefault();
          copyHtml();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copyHtml, html]);

  return (
    <div className="flex flex-col h-full space-y-4">
       <div className="flex flex-wrap justify-end items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadCheatSheet} 
            className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
            aria-label="Download Markdown Cheat Sheet (PDF)"
          >
            <Download size={16} className="mr-2" /> Download Markdown Cheat Sheet (PDF)
          </Button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2 hidden md:block"></div>

          <span className="text-xs text-slate-400 dark:text-slate-500 hidden md:inline mr-2">Ctrl+C to copy HTML</span>
          <Button variant="secondary" size="sm" onClick={clearMarkdown} aria-label="Clear Markdown" disabled={!markdown}>
            <Trash2 size={16} className="mr-2" /> Clear
          </Button>
          <Button variant="outline" size="sm" onClick={copyHtml} aria-label="Copy generated HTML">
            <Code size={16} className="mr-2" /> Copy HTML Code
          </Button>
       </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[500px]">
        <div className="flex flex-col h-full">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1" htmlFor="md-input">Markdown Input</label>
          <textarea 
            id="md-input"
            className="flex-grow w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm resize-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-all"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type your markdown here..."
          />
        </div>
        <div className="flex flex-col h-full">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Live Preview</span>
          <div 
            className="flex-grow w-full p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 overflow-y-auto prose prose-indigo dark:prose-invert max-w-none shadow-inner"
            dangerouslySetInnerHTML={{ __html: html }}
            aria-label="Markdown Preview"
            role="region"
          />
        </div>
      </div>
    </div>
  );
};