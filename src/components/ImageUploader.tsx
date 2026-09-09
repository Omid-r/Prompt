import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Laptop,
  FolderOpen,
  Sparkles,
  RefreshCw,
  Layers,
  Check,
  ArrowRight,
  FileImage,
  X,
} from 'lucide-react';
import { SAMPLE_STYLES } from '../data/sampleStyles';
import { SampleStyle } from '../types';
import { optimizeImageFile } from '../utils/imageOptimizer';

interface ImageUploaderProps {
  currentImage: string | null;
  onImageSelected: (base64: string, mimeType: string, sampleInfo?: SampleStyle) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageSelected,
  onAnalyze,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'upload' | 'samples'>('upload');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('لطفاً یک فایل تصویری معتبر (JPG, PNG, WebP) انتخاب کنید.');
      return;
    }
    setIsProcessingFile(true);
    try {
      const { base64, mimeType } = await optimizeImageFile(file);
      setSelectedSampleId(null);
      setUploadedFileName(file.name);
      onImageSelected(base64, mimeType);
    } catch (err) {
      console.warn('Fallback reading image file directly:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setSelectedSampleId(null);
        setUploadedFileName(file.name);
        onImageSelected(base64, file.type || 'image/jpeg');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Select sample immediately without blocking browser network fetch
  const selectSample = (sample: SampleStyle) => {
    setSelectedSampleId(sample.id);
    setUploadedFileName(null);
    onImageSelected(sample.thumbnail, 'image/jpeg', sample);
  };

  const clearSelection = () => {
    setUploadedFileName(null);
    setSelectedSampleId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Source Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-stone-900/90 border border-stone-800">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeMode === 'upload'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>بارگذاری عکس از کامپیوتر یا گوشی شما</span>
            {uploadedFileName && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('samples')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeMode === 'samples'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>انتخاب از استایل‌های آماده</span>
          </button>
        </div>

        {uploadedFileName && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs mr-auto sm:mr-0">
            <FileImage className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">{uploadedFileName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              className="text-stone-400 hover:text-rose-400 cursor-pointer"
              title="حذف فایل"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Upload & Analysis Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left/Main Container */}
        <div className="lg:col-span-7 flex flex-col">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          {/* Primary Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex-1 min-h-[340px] sm:min-h-[400px] rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-6 text-center group ${
              dragActive
                ? 'border-amber-400 bg-amber-500/15 scale-[1.01]'
                : currentImage
                ? 'border-amber-500/40 bg-stone-900/80 hover:border-amber-400/70'
                : 'border-stone-700 bg-stone-900/40 hover:border-amber-500/50 hover:bg-stone-900/70'
            }`}
          >
            {currentImage ? (
              <div className="relative w-full h-full min-h-[320px] flex flex-col items-center justify-center gap-3">
                <img
                  src={currentImage}
                  alt="Reference target"
                  className="max-h-[330px] max-w-full object-contain rounded-2xl shadow-2xl border border-stone-800"
                />
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-4 py-2 rounded-xl bg-stone-900/90 text-stone-200 text-xs font-semibold border border-stone-700 shadow-lg flex items-center gap-2 group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                    کلیک کنید تا عکس دیگری از کامپیوتر انتخاب کنید
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md p-4">
                <div className="w-20 h-20 rounded-3xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:border-amber-400 transition-all shadow-xl shadow-amber-500/10">
                  <FolderOpen className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-stone-100">
                    عکس استایل مورد نظرتان را از کامپیوتر انتخاب کنید
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                    فایل عکس را اینجا <strong className="text-stone-200">بکشید و رها کنید (Drag & Drop)</strong> یا روی دکمه زیر کلیک کنید.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 text-sm font-extrabold hover:brightness-110 transition-all shadow-lg shadow-amber-500/25 cursor-pointer active:scale-95"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>انتخاب فایل عکس از کامپیوتر</span>
                  </button>
                </div>

                <div className="text-[11px] text-stone-500 pt-1">
                  پشتیبانی از فرمت‌های JPG, PNG, WEBP با حفظ کامل کیفیت
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Samples Gallery & Instant Analyze */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="p-4 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>نمونه‌های آماده برای تست سریع:</span>
              </span>
              <span className="text-[11px] text-stone-500">یا عکس خودتان را آپلود کنید</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-[290px] overflow-y-auto pr-1">
              {SAMPLE_STYLES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => selectSample(sample)}
                  className={`w-full p-2.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                    selectedSampleId === sample.id
                      ? 'border-amber-500 bg-amber-500/10 text-stone-100 ring-1 ring-amber-500/40'
                      : 'border-stone-800/80 bg-stone-900/40 hover:border-stone-700 hover:bg-stone-900 text-stone-300'
                  }`}
                >
                  <img
                    src={sample.thumbnail}
                    alt={sample.titleFa}
                    className="w-14 h-14 rounded-xl object-cover border border-stone-800 shrink-0"
                  />
                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate text-stone-100">
                        {sample.titleFa}
                      </span>
                      {selectedSampleId === sample.id && (
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-amber-400/90 font-medium block truncate">
                      {sample.category}
                    </span>
                    <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                      {sample.descriptionFa}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button: Generate / Reverse Engineer Prompt */}
          <div className="space-y-2">
            <button
              onClick={onAnalyze}
              disabled={!currentImage || isLoading}
              className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer ${
                !currentImage || isLoading
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-800'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 hover:brightness-110 shadow-amber-500/20 active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-stone-950" />
                  <span>در حال استخراج پرامپت و اعمال قفل ۱۰۰٪ هویت...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-stone-950" />
                  <span>استخراج پرامپت بنانا با قفل چهره و هویت</span>
                  <ArrowRight className="w-4 h-4 text-stone-950" />
                </>
              )}
            </button>

            <p className="text-[11px] text-stone-400 text-center">
              پرامپت حاصل را همراه عکس چهره‌تان در بنانا بگذارید تا همین استایل با صورت شما بازتولید شود.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
