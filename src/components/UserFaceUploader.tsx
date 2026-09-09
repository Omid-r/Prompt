import React, { useRef, useState } from 'react';
import {
  User,
  UploadCloud,
  Camera,
  CheckCircle2,
  Sparkles,
  X,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
  HelpCircle,
} from 'lucide-react';
import { optimizeImageFile } from '../utils/imageOptimizer';

interface UserFaceUploaderProps {
  userFaceImage: string | null;
  userFaceMimeType: string;
  onUserFaceSelected: (base64: string, mimeType: string) => void;
  onClearUserFace: () => void;
  onRenderWithUserFace: () => void;
  isGeneratingImage: boolean;
}

export const UserFaceUploader: React.FC<UserFaceUploaderProps> = ({
  userFaceImage,
  userFaceMimeType,
  onUserFaceSelected,
  onClearUserFace,
  onRenderWithUserFace,
  isGeneratingImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sample portrait faces for instant testing if the user doesn't have a selfie on hand right now
  const sampleFaces = [
    {
      id: 'sample-face-1',
      title: 'پرتره تست مرد (ریش آنکادر)',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'sample-face-2',
      title: 'پرتره تست زن (طبیعی)',
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'sample-face-3',
      title: 'پرتره تست مرد (کلاسیک)',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('لطفاً یک فایل عکس معتبر (سلفی یا پرتره چهره) انتخاب کنید.');
      return;
    }
    setIsProcessing(true);
    try {
      const { base64, mimeType } = await optimizeImageFile(file, 1280, 0.9);
      onUserFaceSelected(base64, mimeType);
    } catch (err) {
      console.warn('Fallback direct read for face image:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onUserFaceSelected(base64, file.type || 'image/jpeg');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessing(false);
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

  const selectSampleFace = (url: string) => {
    onUserFaceSelected(url, 'image/jpeg');
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-stone-900 via-stone-900/90 to-stone-950 border border-emerald-500/30 shadow-2xl space-y-5 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>تست زنده با چهره خودتان</span>
            </span>
            <span className="text-[11px] text-stone-400 font-medium">
              صورت شما + استایل و پرامپت انتخاب‌شده
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-stone-100">
            عکس چهره یا سلفی خودتان را بگذارید تا نتیجه نهایی را روی صورت خودتان ببینید
          </h3>
        </div>

        {userFaceImage && (
          <button
            type="button"
            onClick={onRenderWithUserFace}
            disabled={isGeneratingImage}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              isGeneratingImage
                ? 'bg-stone-800 text-stone-400 cursor-wait'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-stone-950 hover:brightness-110 active:scale-95 shadow-emerald-500/20'
            }`}
          >
            {isGeneratingImage ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                <span>در حال رندر چهره شما...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-stone-950" />
                <span>رندر چهره من با این استایل (Live Render)</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Body */}
      {userFaceImage ? (
        <div className="p-4 rounded-2xl bg-stone-950/80 border border-emerald-500/40 flex flex-col sm:flex-row items-center gap-5">
          {/* User Face Thumbnail with Identity Lock Shield */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-xl shrink-0 group">
            <img
              src={userFaceImage}
              alt="عکس چهره شما"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-2">
              <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>قفل چهره فعال</span>
              </span>
            </div>
            <button
              type="button"
              onClick={onClearUserFace}
              className="absolute top-1.5 left-1.5 p-1 rounded-lg bg-stone-950/80 text-stone-400 hover:text-stone-100 hover:bg-rose-500/80 transition-colors cursor-pointer"
              title="حذف و انتخاب عکس دیگر"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Details & Actions */}
          <div className="space-y-3 flex-1 text-center sm:text-right">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-sm font-bold text-emerald-200">
                  عکس چهره شما با موفقیت قفل شد!
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                  Identity Anchor 100%
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                اکنون هوش مصنوعی می‌داند که باید تمام اجزای صورت (فرم چشم، بینی، گونه، فک و خط مو) را عیناً از این عکس چهره بردارد و استایل، لباس، نورپردازی و بک‌گراند پرامپت را روی آن پیاده‌سازی کند.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
              <button
                type="button"
                onClick={onRenderWithUserFace}
                disabled={isGeneratingImage}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>مشاهده رندر استایل روی چهره من</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition-colors cursor-pointer"
              >
                تغییر عکس چهره
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Upload Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 ${
              dragActive
                ? 'border-emerald-400 bg-emerald-500/10'
                : 'border-stone-800 bg-stone-950/60 hover:border-emerald-500/40 hover:bg-stone-900/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-stone-200">
                یک عکس از چهره یا سلفی خودتان را اینجا بکشید یا کلیک کنید
              </div>
              <p className="text-xs text-stone-400">
                (عکس صاف از روبرو با نور کافی برای قفل صددرصدی چهره بهترین نتیجه را می‌دهد)
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-500">
              <span>فرمت‌های پشتیبانی‌شده: JPG, PNG, WebP</span>
              <span>•</span>
              <span>حفظ ۱۰۰٪ حریم خصوصی در مرورگر</span>
            </div>
          </div>

          {/* Quick Sample Faces if user doesn't have a selfie right now */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
              <span>یا برای تست فوری، یکی از پرتره‌های آزمایشی زیر را انتخاب کنید:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {sampleFaces.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => selectSampleFace(sample.url)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-emerald-500/40 hover:bg-stone-900 text-stone-300 text-xs transition-all text-right cursor-pointer"
                >
                  <img
                    src={sample.url}
                    alt={sample.title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover border border-stone-700 shrink-0"
                  />
                  <div className="font-medium text-[11px] truncate">
                    {sample.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Explanatory footer */}
      <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800/80 text-[11px] text-stone-400 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-emerald-300">فرمول دو مرجع در بنانا (Dual Reference):</strong> وقتی هر دو عکس (استایل مرجع + چهره شما) را در موتور بنانا یا این ابزار وارد می‌کنید، هوش مصنوعی صورت شما را به عنوان هویت قطعی ثابت نگه می‌دارد و فقط لباس، نور و زاویه عکس استایل را بازآفرینی می‌کند.
        </p>
      </div>
    </div>
  );
};
