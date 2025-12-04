import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, TextAreaGroup } from '../components/UIComponents';
import { Sparkles, FileText, AlertTriangle, Trash2, Clipboard } from 'lucide-react';
import { summarizeText } from '../services/geminiService';
import { useToast } from '../components/Toast';

export const AiSummarizer: React.FC = () => {
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Add input length limit
  const MAX_INPUT_LENGTH = 10000;
  const inputLength = input.length;
  const isInputTooLong = inputLength > MAX_INPUT_LENGTH;

  const handleSummarize = useCallback(async () => {
    if (!input.trim()) {
      showToast('Please enter text to summarize', 'info');
      return;
    }
    
    if (isInputTooLong) {
      showToast(`Text is too long. Maximum ${MAX_INPUT_LENGTH} characters allowed.`, 'error');
      return;
    }

    setIsLoading(true);
    setSummary('');
    showToast('Generating summary...', 'info');
    
    try {
      const result = await summarizeText(input);
      setSummary(result);
      showToast('Summary generated successfully!', 'success');
    } catch (e) {
      const errorMessage = e instanceof Error 
        ? `Failed to generate summary: ${e.message}`
        : "An error occurred while communicating with the AI service.";
      
      setSummary(errorMessage);
      showToast('Failed to generate summary.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [input, isInputTooLong, showToast]);

  const handleClear = () => {
    setInput('');
    setSummary('');
    showToast('Input cleared', 'info');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSummarize();
    }
  };

  const copySummary = useCallback(async () => {
    if (!summary) {
      showToast('No summary to copy', 'info');
      return;
    }

    // Check if summary is an error message
    if (summary.includes('Failed to generate') || summary.includes('An error occurred')) {
      showToast('Cannot copy error message', 'warning');
      return;
    }

    try {
      // First, try the modern clipboard API
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(summary);
        showToast('Summary copied to clipboard!', 'success');
        return;
      }
      
      // Fallback for older browsers or insecure contexts
      throw new Error('Clipboard API not available');
    } catch (err) {
      console.log('Using fallback copy method:', err);
      
      // Fallback method using execCommand
      try {
        const textArea = document.createElement('textarea');
        textArea.value = summary;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        
        // Focus and select for better compatibility
        textArea.focus();
        textArea.select();
        
        // Try to copy using execCommand
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          showToast('Summary copied to clipboard!', 'success');
        } else {
          // Last resort: show the text and ask user to copy manually
          promptForManualCopy();
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        promptForManualCopy();
      }
    }
  }, [summary, showToast]);

  const promptForManualCopy = () => {
    // Create a temporary textarea for user to select from
    const textArea = document.createElement('textarea');
    textArea.value = summary;
    textArea.style.position = 'fixed';
    textArea.style.left = '50%';
    textArea.style.top = '50%';
    textArea.style.transform = 'translate(-50%, -50%)';
    textArea.style.width = '80%';
    textArea.style.height = '200px';
    textArea.style.zIndex = '9999';
    textArea.style.padding = '10px';
    textArea.style.border = '2px solid #6366f1';
    textArea.style.borderRadius = '8px';
    textArea.style.fontSize = '14px';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    showToast('Please select text and press Ctrl+C to copy', 'info');
    
    // Remove the textarea after 5 seconds
    setTimeout(() => {
      if (document.body.contains(textArea)) {
        document.body.removeChild(textArea);
      }
    }, 5000);
  };

  // Add example text
  const loadExampleText = () => {
    const example = `Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. Leading AI textbooks define the field as the study of "intelligent agents": any system that perceives its environment and takes actions that maximize its chance of achieving its goals.

    AI applications include advanced web search engines (e.g., Google Search), recommendation systems (used by YouTube, Amazon and Netflix), understanding human speech (such as Siri and Alexa), self-driving cars (e.g., Waymo), generative or creative tools (ChatGPT and AI art), automated decision-making and competing at the highest level in strategic game systems (such as chess and Go).

    The field was founded on the assumption that human intelligence "can be so precisely described that a machine can be made to simulate it". This raised philosophical arguments about the mind and the ethical consequences of creating artificial beings endowed with human-like intelligence; these issues have previously been explored by myth, fiction and philosophy since antiquity.`;
    
    setInput(example);
    showToast('Example text loaded. Click "Summarize" to try it out!', 'info');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 flex gap-3 items-start" role="note">
        <Sparkles className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" size={20} aria-hidden="true" />
        <div className="text-sm text-indigo-900 dark:text-indigo-100">
          <p className="font-semibold mb-1">Powered by Google Gemini</p>
          <p>This tool uses advanced AI to condense long articles or text into concise paragraphs.</p>
          <p className="mt-2 text-xs">
            <strong>Tip:</strong> Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border rounded text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border rounded text-xs">Enter</kbd> to summarize quickly
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Original Text
              <span className="ml-2 text-xs font-normal text-slate-500">
                ({inputLength}/{MAX_INPUT_LENGTH})
              </span>
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadExampleText}
              className="text-xs"
            >
              Load Example
            </Button>
          </div>
          
          <TextAreaGroup
            placeholder="Paste your long text here (articles, emails, reports)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-[400px]"
            aria-label="Text content to summarize"
            error={isInputTooLong ? `Text exceeds ${MAX_INPUT_LENGTH} character limit` : undefined}
          />
          
          {isInputTooLong && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle size={16} />
              <span>Text is too long. Please reduce to {MAX_INPUT_LENGTH} characters or less.</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleClear} 
              disabled={!input}
              aria-label="Clear Input"
            >
              <Trash2 size={16} className="mr-2" /> Clear
            </Button>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                Ctrl + Enter to summarize
              </span>
              <Button 
                onClick={handleSummarize} 
                className="w-full md:w-auto" 
                isLoading={isLoading}
                disabled={!input.trim() || isInputTooLong}
                aria-label="Summarize Text"
              >
                <Sparkles size={18} className="mr-2" /> Summarize
              </Button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              AI Summary
            </label>
            {summary && !summary.includes('Failed to generate') && (
              <span className="text-xs text-slate-500">
                {summary.length} characters
              </span>
            )}
          </div>
          
          <div 
            className={`h-[400px] bg-white dark:bg-slate-900 border ${
              summary.includes('Failed to generate') || summary.includes('An error occurred')
                ? 'border-red-200 dark:border-red-800'
                : 'border-slate-200 dark:border-slate-700'
            } text-slate-900 dark:text-slate-100 rounded-xl p-6 overflow-y-auto prose prose-indigo dark:prose-invert relative`}
            aria-live="polite"
            role="region"
            aria-label="Summary Result"
          >
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Generating summary...</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">This may take a few seconds</p>
              </div>
            ) : summary ? (
              <>
                {summary.includes('Failed to generate') || summary.includes('An error occurred') ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <AlertTriangle className="text-red-500 mb-4" size={48} />
                    <p className="text-red-600 dark:text-red-400 font-medium mb-2">Failed to Generate Summary</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{summary}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSummarize}
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <p className="whitespace-pre-wrap">{summary}</p>
                    {/* Highlight text for easy selection */}
                    <div 
                      className="absolute inset-0 cursor-text"
                      onClick={() => {
                        const selection = window.getSelection();
                        const range = document.createRange();
                        range.selectNodeContents(document.querySelector('.prose p') || document.createElement('p'));
                        selection?.removeAllRanges();
                        selection?.addRange(range);
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                <FileText size={48} className="mb-4 opacity-20" aria-hidden="true" />
                <p className="mb-2">Summary will appear here...</p>
                <p className="text-sm text-center">
                  Enter text on the left and click "Summarize"<br />
                  or use the example text to get started
                </p>
              </div>
            )}
          </div>
          
          {summary && !summary.includes('Failed to generate') && !summary.includes('An error occurred') && (
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={copySummary}
                aria-label="Copy summary to clipboard"
              >
                <Clipboard size={18} className="mr-2" />
                Copy Summary
              </Button>
              <p className="text-xs text-slate-500 text-center">
                Click to copy • Text is auto-selected for manual copy (Ctrl+C)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <details className="text-sm text-slate-600 dark:text-slate-400 border-t pt-4 mt-4">
        <summary className="cursor-pointer font-medium">Keyboard Shortcuts & Tips</summary>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium mb-2">Shortcuts:</p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border rounded text-xs">Ctrl</kbd> + 
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border rounded text-xs">Enter</kbd>
                <span className="ml-2">Summarize text</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border rounded text-xs">Ctrl</kbd> + 
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border rounded text-xs">A</kbd>
                <span className="ml-2">Select all text</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border rounded text-xs">Ctrl</kbd> + 
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border rounded text-xs">C</kbd>
                <span className="ml-2">Copy selected text</span>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">Tips:</p>
            <ul className="space-y-1 text-sm list-disc pl-4">
              <li>Text is auto-selected in the summary box for easy copying</li>
              <li>Use the "Load Example" button to try the tool quickly</li>
              <li>Maximum input length is {MAX_INPUT_LENGTH} characters</li>
              <li>Click on the summary text to select it instantly</li>
            </ul>
          </div>
        </div>
      </details>
    </div>
  );
};