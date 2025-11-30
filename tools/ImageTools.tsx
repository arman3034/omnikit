import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, Button, InputGroup } from '../components/UIComponents';
import { Upload, Download, Image as ImageIcon, Trash2, FileImage, RefreshCw } from 'lucide-react';
import { ImageFormat } from '../types';
import { useToast } from '../components/Toast';
import Compressor from 'compressorjs';

export const ImageProcessor: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [originalDims, setOriginalDims] = useState<{w:number, h:number} | null>(null);
  const [quality, setQuality] = useState<number>(90);
  const [format, setFormat] = useState<ImageFormat>('image/jpeg');
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Cleanup blob URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        showToast('Please upload a valid image file (PNG, JPG, WebP)', 'error');
        return;
      }
      
      // Clean up previous URL
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      // Note: Dimensions are set in onImageLoad when the <img> tag actually loads the content
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const newDims = { w: img.naturalWidth, h: img.naturalHeight };
    setOriginalDims(newDims);
    
    // Only set width/height if they are currently 0 (first load)
    // or if the previous image was removed.
    if (width === 0 || height === 0) {
        setWidth(newDims.w);
        setHeight(newDims.h);
    }
    showToast('Image loaded successfully', 'info');
  };

  const handleClear = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setWidth(0);
    setHeight(0);
    setOriginalDims(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Tool reset', 'info');
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newWidth = val === '' ? 0 : parseInt(val);
    setWidth(newWidth);
    if (maintainAspect && originalDims && originalDims.h > 0 && newWidth > 0) {
      const ratio = originalDims.w / originalDims.h;
      setHeight(Math.round(newWidth / ratio));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newHeight = val === '' ? 0 : parseInt(val);
    setHeight(newHeight);
    if (maintainAspect && originalDims && originalDims.w > 0 && newHeight > 0) {
      const ratio = originalDims.w / originalDims.h;
      setWidth(Math.round(newHeight * ratio));
    }
  };

  const processImage = useCallback(() => {
    if (!imageFile) {
        showToast('No image selected', 'error');
        return;
    }
    
    if (width <= 0 || height <= 0) {
        showToast('Invalid dimensions', 'error');
        return;
    }

    setIsProcessing(true);

    new Compressor(imageFile, {
      quality: quality / 100,
      mimeType: format,
      width: width,
      height: height,
      success(result) {
        const url = URL.createObjectURL(result);
        const link = document.createElement('a');
        const ext = format.split('/')[1];
        link.download = `processed-${Date.now()}.${ext}`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast(`Saved as ${ext.toUpperCase()}`, 'success');
        setIsProcessing(false);
      },
      error(err) {
        console.error("Compressor Error:", err);
        showToast('Error processing image: ' + err.message, 'error');
        setIsProcessing(false);
      },
    });

  }, [imageFile, width, height, format, quality, showToast]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fakeEvent = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6 order-2 lg:order-1">
        {/* Upload Area */}
        {!previewUrl ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            tabIndex={0}
            role="button"
            aria-label="Upload Image Area: Click or drag and drop an image file."
            className="border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl p-8 text-center cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-400 dark:hover:border-indigo-600 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 focus:outline-none transition-all flex flex-col items-center justify-center min-h-[300px]"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
              aria-hidden="true"
            />
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
              <Upload size={32} />
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Click or Drag to upload an image</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Supports PNG, JPG, WebP</p>
          </div>
        ) : (
          <Card title="Configuration">
             <div className="flex justify-between items-center mb-6 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                 <div className="flex items-center gap-3 overflow-hidden">
                   <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      <FileImage size={20} />
                   </div>
                   <div className="text-sm min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate" title={imageFile?.name}>{imageFile?.name}</p>
                      <p className="text-slate-500 dark:text-slate-400">{imageFile ? formatFileSize(imageFile.size) : ''}</p>
                   </div>
                 </div>
                 <Button variant="secondary" size="sm" onClick={handleClear} aria-label="Remove Image" disabled={isProcessing}>
                   <Trash2 size={16} className="mr-2" /> Reset
                 </Button>
             </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <InputGroup 
                label="Width (px)" 
                type="number" 
                value={width || ''} 
                onChange={handleWidthChange} 
                min={1} 
              />
              <InputGroup 
                label="Height (px)" 
                type="number" 
                value={height || ''} 
                onChange={handleHeightChange} 
                min={1} 
              />
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <input 
                type="checkbox" 
                id="aspect" 
                checked={maintainAspect} 
                onChange={(e) => setMaintainAspect(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer dark:bg-slate-700 dark:border-slate-600"
              />
              <label htmlFor="aspect" className="text-sm text-slate-700 dark:text-slate-300 select-none font-medium cursor-pointer">Maintain Aspect Ratio</label>
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block" htmlFor="quality-range">
                Quality: {quality}% <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">(JPEG/WebP only)</span>
              </label>
              <input 
                id="quality-range"
                type="range" 
                min="10" 
                max="100" 
                value={quality} 
                onChange={(e) => setQuality(parseInt(e.target.value))} 
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-valuetext={`${quality} percent`}
              />
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Output Format</label>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Image Format Selection">
                {(['image/jpeg', 'image/png', 'image/webp'] as ImageFormat[]).map(fmt => (
                  <button
                    key={fmt}
                    role="radio"
                    aria-checked={format === fmt}
                    onClick={() => setFormat(fmt)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${format === fmt ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-indigo-900/50' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                    {fmt.split('/')[1].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={processImage} 
              className="w-full py-4 text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40" 
              size="lg"
              isLoading={isProcessing}
              disabled={isProcessing || width <= 0 || height <= 0}
            >
              <Download size={20} className="mr-2" /> 
              {isProcessing ? 'Processing...' : 'Convert & Download'}
            </Button>
          </Card>
        )}
      </div>

      {/* Preview Area */}
      <Card title="Live Preview" className="h-fit order-1 lg:order-2">
        {previewUrl ? (
          <div className="space-y-4">
             <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50 flex items-center justify-center bg-repeat min-h-[300px] relative group p-2">
              <img 
                src={previewUrl} 
                onLoad={onImageLoad}
                alt="Preview" 
                className="max-w-full h-auto object-contain max-h-[500px] shadow-sm transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                Original: {originalDims?.w}x{originalDims?.h}
              </div>
            </div>
            <div className="flex justify-between items-center text-sm bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1"><RefreshCw size={14}/> Output Size:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{width || originalDims?.w || 0} x {height || originalDims?.h || 0} px</span>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl m-2">
            <ImageIcon size={48} className="mb-2 opacity-30" aria-hidden="true" />
            <p>No image selected</p>
          </div>
        )}
      </Card>
    </div>
  );
};