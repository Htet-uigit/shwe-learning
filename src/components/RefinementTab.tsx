import { useState, useRef } from 'react';
import { CheckCircle2, Edit3, Radio, ShieldCheck, Loader2, Download, Upload, Globe, FileText } from 'lucide-react';
import Markdown from 'react-markdown';
import { LanguageCode, languages, useTranslation } from '../lib/i18n';
import { translateContent } from '../lib/gemini';
import { exportCurriculum } from '../lib/pdf';

interface RefinementTabProps {
  isGenerating: boolean;
  lessonPlan: string;
  setLessonPlan: (plan: string) => void;
  radioScript: string;
  setRadioScript: (script: string) => void;
  resilienceChecklist: string;
  setResilienceChecklist: (checklist: string) => void;
  topic: string;
  setTopic: (topic: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  onFinalize: () => void;
  uiLanguage: LanguageCode;
}

const AVAILABLE_TAGS = ['Math', 'Science', 'Language', 'Safety', 'Health', 'History'];

export function RefinementTab({
  isGenerating,
  lessonPlan,
  setLessonPlan,
  radioScript,
  setRadioScript,
  resilienceChecklist,
  setResilienceChecklist,
  topic,
  setTopic,
  tags,
  setTags,
  onFinalize,
  uiLanguage
}: RefinementTabProps) {
  const [activeSection, setActiveSection] = useState<'lesson' | 'radio' | 'checklist'>('lesson');
  const [isEditing, setIsEditing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState<LanguageCode>('my');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslation(uiLanguage);

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleExportJSON = () => {
    const data = {
      topic,
      tags,
      lessonPlan,
      radioScript,
      resilienceChecklist
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lesson-${topic.replace(/\s+/g, '-').toLowerCase() || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    exportCurriculum(topic, lessonPlan, radioScript, resilienceChecklist);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.lessonPlan) setLessonPlan(data.lessonPlan);
        if (data.radioScript) setRadioScript(data.radioScript);
        if (data.resilienceChecklist) setResilienceChecklist(data.resilienceChecklist);
        if (data.topic) setTopic(data.topic);
        if (data.tags) setTags(data.tags);
      } catch (err) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const handleTranslate = async () => {
    if (!lessonPlan) return;
    setIsTranslating(true);
    try {
      const targetLanguageName = languages[targetLang];
      const [newLesson, newRadio, newChecklist] = await Promise.all([
        translateContent(lessonPlan, targetLanguageName),
        translateContent(radioScript, targetLanguageName),
        translateContent(resilienceChecklist, targetLanguageName)
      ]);
      setLessonPlan(newLesson);
      setRadioScript(newRadio);
      setResilienceChecklist(newChecklist);
    } catch (e) {
      console.error(e);
      alert('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 text-stone-500 min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
        <p className="text-xl font-medium text-stone-700">{t('generatingBtn')}</p>
      </div>
    );
  }

  if (!lessonPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 text-stone-500 min-h-[60vh]">
        <Edit3 className="w-12 h-12 opacity-50" />
        <p className="text-lg">No lesson plan generated yet.</p>
        <div className="flex items-center gap-4 mt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            {t('importBtn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900">
            {t('refinementTitle')}
          </h2>
          <p className="text-stone-500 text-lg mt-2">
            {t('refinementDesc')}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <button
            onClick={onFinalize}
            className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            {t('finalizeBtn')}
          </button>
        </div>
      </header>

      {/* Toolbar: Tags, Export, Import, Translate */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-stone-500 uppercase tracking-wider mr-2">{t('tags')}:</span>
            {AVAILABLE_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  tags.includes(tag) 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border-transparent'
                } border`}
              >
                {tag}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              {t('importBtn')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
          <Globe className="w-5 h-5 text-stone-400" />
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
            className="bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 p-2"
          >
            {Object.entries(languages).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isTranslating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t('translatingBtn')}</>
            ) : (
              <>{t('translateBtn')}</>
            )}
          </button>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex space-x-2 border-b border-stone-200">
        <button
          onClick={() => setActiveSection('lesson')}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
            activeSection === 'lesson'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          {t('lessonPlan')}
        </button>
        <button
          onClick={() => setActiveSection('radio')}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
            activeSection === 'radio'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
          }`}
        >
          <Radio className="w-4 h-4" />
          {t('radioScript')}
        </button>
        <button
          onClick={() => setActiveSection('checklist')}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
            activeSection === 'checklist'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          {t('checklist')}
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-200">
          <h3 className="font-semibold text-stone-800">
            {activeSection === 'lesson' && t('lessonPlan')}
            {activeSection === 'radio' && t('radioScript')}
            {activeSection === 'checklist' && t('checklist')}
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-50 transition-colors"
          >
            {isEditing ? 'Preview Mode' : 'Edit Content'}
          </button>
        </div>

        <div className="p-6 min-h-[400px]">
          {activeSection === 'lesson' && (
            isEditing ? (
              <textarea
                value={lessonPlan}
                onChange={(e) => setLessonPlan(e.target.value)}
                className="w-full h-[400px] p-4 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none font-sans"
              />
            ) : (
              <div className="prose prose-stone max-w-none">
                <Markdown>{lessonPlan}</Markdown>
              </div>
            )
          )}

          {activeSection === 'radio' && (
            isEditing ? (
              <textarea
                value={radioScript}
                onChange={(e) => setRadioScript(e.target.value)}
                className="w-full h-[400px] p-4 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none font-sans"
              />
            ) : (
              <div className="prose prose-stone max-w-none">
                <Markdown>{radioScript}</Markdown>
              </div>
            )
          )}

          {activeSection === 'checklist' && (
            isEditing ? (
              <textarea
                value={resilienceChecklist}
                onChange={(e) => setResilienceChecklist(e.target.value)}
                className="w-full h-[400px] p-4 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none font-sans"
              />
            ) : (
              <div className="prose prose-stone max-w-none">
                <Markdown>{resilienceChecklist}</Markdown>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
