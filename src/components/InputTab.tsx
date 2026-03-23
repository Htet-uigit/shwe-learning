import { ChangeEvent, useRef } from 'react';
import { Camera, FileText, Upload, Loader2 } from 'lucide-react';
import { LanguageCode, useTranslation } from '../lib/i18n';

interface InputTabProps {
  topic: string;
  setTopic: (topic: string) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  setImageBase64: (base64: string | null) => void;
  setImageMimeType: (mimeType: string | null) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  uiLanguage: LanguageCode;
}

export function InputTab({
  topic,
  setTopic,
  imageFile,
  setImageFile,
  setImageBase64,
  setImageMimeType,
  onGenerate,
  isGenerating,
  uiLanguage
}: InputTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslation(uiLanguage);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImageMimeType(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setImageBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-10">
      <header className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight text-stone-900">
          Create Lesson
        </h2>
        <p className="text-stone-500 text-lg">
          Generate localized, zero-resource curriculum for your students.
        </p>
      </header>

      <div className="space-y-8">
        {/* Topic Input */}
        <div className="space-y-3">
          <label htmlFor="topic" className="block text-sm font-medium text-stone-700 uppercase tracking-wider">
            Lesson Topic
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-stone-400" />
            </div>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="block w-full pl-11 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow text-lg"
              placeholder={t('topicPlaceholder')}
            />
          </div>
        </div>

        {/* Environmental Object Recognition */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-stone-700 uppercase tracking-wider">
            Zero-Resource Context
          </label>
          <p className="text-sm text-stone-500 mb-4">
            Upload a photo of local materials (stones, leaves, sticks) to incorporate them into the lesson.
          </p>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
              imageFile ? 'border-emerald-500 bg-emerald-50' : 'border-stone-300 hover:border-emerald-400 hover:bg-stone-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {imageFile ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-emerald-800 font-medium">{imageFile.name}</p>
                  <p className="text-emerald-600 text-sm">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                    setImageBase64(null);
                    setImageMimeType(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-sm text-stone-500 hover:text-stone-700 underline mt-2"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-500">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-stone-700 font-medium">Click to upload a photo</p>
                  <p className="text-stone-500 text-sm mt-1">PNG, JPG up to 10MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-6 border-t border-stone-100">
          <button
            onClick={onGenerate}
            disabled={(!topic && !imageFile) || isGenerating}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-8 rounded-xl font-medium text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                {t('generatingBtn')}
              </>
            ) : (
              <>
                {t('generateBtn')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
