import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, TextAreaGroup } from '../components/UIComponents';
import { Sparkles, FileText, AlertTriangle, Trash2 } from 'lucide-react';
import { summarizeText } from '../services/geminiService';
import { useToast } from '../components/Toast';

export const AiSummarizer: React.FC = () => {
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSummarize = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setSummary('');
    showToast('Generating summary...', 'info');
    
    try {
      const result = await summarizeText(input);
      setSummary(result);
      showToast('Summary generated!', 'success');
    } catch (e) {
      setSummary("An error occurred while communicating with the AI service.");
      showToast('Failed to generate summary.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [input, showToast]);

  const handleClear = () => {
    setInput('');
    setSummary('');
    showToast('Input cleared', 'info');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSummarize();
    }
  };

  const copySummary = useCallback(() => {
    navigator.clipboard.writeText(summary);
    showToast('Summary copied to clipboard!', 'success');
  }, [summary, showToast]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
       if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
         // FIXED: Removed the selection check - always copy summary if it exists
         if (summary) {
           e.preventDefault();
           copySummary();
         }
       }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [copySummary, summary]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 flex gap-3 items-start" role="note">
        <Sparkles className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" size={20} aria-hidden="true" />
        <div className="text-sm text-indigo-900 dark:text-indigo-100">
          <p className="font-semibold mb-1">Powered by Google Gemini</p>
          <p>This tool uses advanced AI to condense long articles or text into concise paragraphs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <TextAreaGroup
            label="Original Text"
            placeholder="Paste your long text here (articles, emails, reports)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-[400px]"
            aria-label="Text content to summarize"
          />
          <div className="flex justify-between items-center">
             <Button variant="secondary" size="sm" onClick={handleClear} disabled={!input} aria-label="Clear Input">
                <Trash2 size={16} className="mr-2" /> Clear
             </Button>
            <div className="flex items-center gap-3">
               <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">Ctrl + Enter to summarize</span>
                <Button 
                  onClick={handleSummarize} 
                  className="w-full md:w-auto" 
                  isLoading={isLoading}
                  disabled={!input.trim()}
                  aria-label="Summarize Text"
                >
                  <Sparkles size={18} className="mr-2" /> Summarize
                </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">AI Summary</label>
          <div 
            className="h-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-6 overflow-y-auto prose prose-indigo dark:prose-invert"
            aria-live="polite"
            role="region"
            aria-label="Summary Result"
          >
            {summary ? (
              <p>{summary}</p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                <FileText size={48} className="mb-4 opacity-20" aria-hidden="true" />
                <p>Summary will appear here...</p>
              </div>
            )}
          </div>
          {summary && (
            <Button variant="outline" className="w-full" onClick={copySummary}>
              Copy Summary (Ctrl+C)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};