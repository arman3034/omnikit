import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, Button, InputGroup } from '../components/UIComponents';
import { Copy, RefreshCw, Download, QrCode, Palette } from 'lucide-react';
import { useToast } from '../components/Toast';

// --- QR Generator ---
export const QRGenerator: React.FC = () => {
  const [input, setInput] = useState('');
  const [generatedValue, setGeneratedValue] = useState('');
  const qrRef = useRef<SVGSVGElement>(null);
  const { showToast } = useToast();

  const handleGenerate = useCallback(() => {
    if (input.trim()) {
      setGeneratedValue(input);
      showToast('QR Code generated!', 'success');
    } else {
      showToast('Please enter some text or URL first.', 'info');
    }
  }, [input, showToast]);

  const handleDownload = () => {
    if (!qrRef.current) return;
    
    // Robust download logic using Blob
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    // Add namespaces if likely missing (though qrcode.react handles this, extra safety)
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Add whitespace padding
      const padding = 40;
      canvas.width = img.width + padding; 
      canvas.height = img.height + padding;
      
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, padding/2, padding/2);
        
        try {
          const pngFile = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.download = `qrcode-${Date.now()}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
          showToast('QR Code downloaded successfully', 'success');
        } catch (e) {
          showToast('Failed to generate image', 'error');
        }
        
        URL.revokeObjectURL(url);
      }
    };
    img.src = url;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <InputGroup 
          label="Enter Content" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={handleKeyDown}
          placeholder="https://example.com"
          aria-label="Content for QR Code"
        />
        <Button onClick={handleGenerate} className="w-full" disabled={!input}>
          <QrCode size={18} className="mr-2" /> Generate QR Code
        </Button>
        <p className="text-sm text-slate-500 dark:text-slate-400" id="qr-help">
          Enter a URL, text, or contact info above and click Generate (or press Enter) to create your custom QR code.
        </p>
      </div>
      
      <Card className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-700/50 min-h-[300px]" aria-live="polite">
        {generatedValue ? (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
            <div 
              className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm"
              role="figure"
              aria-label="QR Code Preview Container"
            >
              <QRCodeSVG 
                ref={qrRef}
                value={generatedValue} 
                size={200} 
                level="H" 
                includeMargin={true}
                title={`QR Code for ${generatedValue}`}
                role="img"
                aria-label={`Generated QR Code containing: ${generatedValue}`}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleDownload} 
              aria-label={`Download QR Code for ${generatedValue} as PNG image`}
            >
              <Download size={18} className="mr-2" /> Download PNG
            </Button>
          </div>
        ) : (
          <div className="text-center text-slate-400 dark:text-slate-500">
            <QrCode size={48} className="mx-auto mb-4 opacity-20" />
            <p>Your QR code will appear here</p>
          </div>
        )}
      </Card>
    </div>
  );
};

// --- Password Generator ---
export const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ uppercase: true, numbers: true, symbols: true });
  const { showToast } = useToast();

  const generate = useCallback(() => {
    const lowers = 'abcdefghijklmnopqrstuvwxyz';
    const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const syms = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    let chars = lowers;
    if (options.uppercase) chars += uppers;
    if (options.numbers) chars += nums;
    if (options.symbols) chars += syms;

    let pass = '';
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  }, [length, options]);

  useEffect(() => {
    if (!password) generate();
  }, [generate, password]);

  const copyToClipboard = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      showToast('Password copied to clipboard', 'success');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        generate();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (!window.getSelection()?.toString() && password) {
          e.preventDefault();
          copyToClipboard();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generate, password, showToast]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div 
        className="bg-slate-900 dark:bg-black rounded-2xl p-8 text-center relative overflow-hidden group border border-slate-800"
        aria-label="Generated Password Display"
      >
        <div className="relative z-10">
          <p className="text-slate-400 text-sm mb-2 font-medium uppercase tracking-wider">Your Secure Password</p>
          <div 
            className="text-3xl md:text-4xl font-mono text-white tracking-wider break-all min-h-[3rem] flex items-center justify-center"
            aria-live="polite"
          >
            {password || "••••••••••••••••"}
          </div>
        </div>
        
        {password && (
          <button 
            onClick={copyToClipboard}
            className="mt-6 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors inline-flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Copy password to clipboard"
          >
            <Copy size={16} className="mr-2" /> Copy to Clipboard <span className="opacity-60 ml-2 text-xs">(or Ctrl+C)</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl space-y-6">
        <div>
          <label className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-4" htmlFor="pass-length">
            <span>Password Length</span>
            <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded text-xs">{length} characters</span>
          </label>
          <input 
            id="pass-length"
            type="range" 
            min="8" 
            max="64" 
            value={length} 
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-valuemin={8}
            aria-valuemax={64}
            aria-valuenow={length}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(options).map(([key, val]) => (
            <label key={key} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus-within:ring-2 focus-within:ring-indigo-500">
              <input 
                type="checkbox" 
                checked={val}
                onChange={() => setOptions(p => ({ ...p, [key as keyof typeof options]: !val }))}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700"
              />
              <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-300">{key}</span>
            </label>
          ))}
        </div>

        <Button onClick={generate} className="w-full" size="lg">
          <RefreshCw size={20} className="mr-2" /> Generate New Password
        </Button>
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">Press Enter to quickly regenerate</p>
      </div>
    </div>
  );
};

// --- Color Palette ---
export const ColorPalette: React.FC = () => {
  const [colors, setColors] = useState<string[]>([]);
  const { showToast } = useToast();

  const generatePalette = useCallback(() => {
    const newColors = Array(5).fill(0).map(() => 
      '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    );
    setColors(newColors);
  }, []);

  useEffect(() => {
    if(colors.length === 0) generatePalette();
  }, [colors.length, generatePalette]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (e.key === ' ') e.preventDefault();
        generatePalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generatePalette]);

  // Helper for contrast
  const getContrastColor = (hex: string) => {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? '#1e293b' : '#ffffff'; // dark slate or white
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    showToast(`Copied ${color}`, 'success');
  };

  return (
    <div className="space-y-8">
      <div 
        className="flex flex-col md:flex-row gap-0 md:gap-4 h-[400px] md:h-64 rounded-2xl overflow-hidden shadow-lg dark:shadow-slate-900/50"
        role="list"
        aria-label="Color Palette"
      >
        {colors.map((color, idx) => {
          const textColor = getContrastColor(color);
          return (
            <div 
              key={idx} 
              role="listitem"
              className="flex-1 flex flex-col items-center justify-center group relative transition-all hover:flex-[1.5]"
              style={{ backgroundColor: color }}
              aria-label={`Color ${color}`}
            >
              <div className="flex flex-col items-center transform transition-transform duration-200 hover:scale-110">
                <span 
                  className="text-lg font-mono font-bold mb-2"
                  style={{ color: textColor }}
                >
                  {color}
                </span>
                <button
                  onClick={() => copyColor(color)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-white/50"
                  style={{ 
                    color: color,
                    backgroundColor: textColor,
                    opacity: 0.9 
                  }}
                  aria-label={`Copy color ${color}`}
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <Button onClick={generatePalette} size="lg" className="px-8">
          <Palette size={20} className="mr-2" /> Generate Random Palette
        </Button>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Click the copy button on any color to grab the Hex code. Press Space or Enter to regenerate.</p>
      </div>
    </div>
  );
};