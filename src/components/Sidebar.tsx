import { BookOpen, Edit3, QrCode, Sparkles, Globe, GraduationCap, UserCircle, MessageSquare, History } from 'lucide-react';
import { TabType, ViewMode } from '../App';
import { LanguageCode, languages, useTranslation } from '../lib/i18n';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  uiLanguage: LanguageCode;
  setUiLanguage: (lang: LanguageCode) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  recentEdits: string[];
}

export function Sidebar({ activeTab, setActiveTab, uiLanguage, setUiLanguage, viewMode, setViewMode, recentEdits }: SidebarProps) {
  const t = useTranslation(uiLanguage);

  const tabs = [
    { id: 'input', label: t('inputTab') || 'Input', icon: BookOpen },
    { id: 'refinement', label: t('refinementTab') || 'Refine', icon: Edit3 },
    { id: 'delivery', label: t('deliveryTab') || 'Deliver', icon: QrCode },
    { id: 'chatbot', label: t('aiChatbot') || 'AI Chat', icon: MessageSquare },
  ] as const;

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col h-full">
      <div className="p-6 flex items-center gap-3 text-white">
        <div className="bg-emerald-600 p-2 rounded-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <h1 className="font-semibold text-lg tracking-tight">{t('appName')}</h1>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-stone-800 rounded-xl p-1 flex items-center">
          <button
            onClick={() => setViewMode('teacher')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${viewMode === 'teacher' ? 'bg-stone-700 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'}`}
          >
            <UserCircle className="w-4 h-4" />
            Teacher
          </button>
          <button
            onClick={() => setViewMode('student')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${viewMode === 'student' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'}`}
          >
            <GraduationCap className="w-4 h-4" />
            Student
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        {viewMode === 'teacher' ? (
          <>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-stone-800 text-white font-medium' 
                      : 'hover:bg-stone-800/50 hover:text-stone-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : 'text-stone-500'}`} />
                  {tab.label}
                </button>
              );
            })}

            {recentEdits.length > 0 && (
              <div className="mt-8 pt-4 border-t border-stone-800">
                <div className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2 px-4">
                  <History className="w-3 h-3" /> Recent Memory
                </div>
                <div className="space-y-1 px-2">
                  {recentEdits.map((edit, i) => (
                    <div key={i} className="text-xs text-stone-400 px-2 py-1 truncate hover:text-stone-200 transition-colors">
                      {edit}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="px-4 py-6 text-center text-stone-500 text-sm">
            <p>Student Mode Active</p>
            <p className="mt-2 text-xs opacity-70">Simulating offline student experience.</p>
          </div>
        )}
      </nav>

      <div className="p-6 border-t border-stone-800 space-y-4">
        <div>
          <div className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
            <Globe className="w-3 h-3" /> Language
          </div>
          <select 
            value={uiLanguage}
            onChange={(e) => setUiLanguage(e.target.value as LanguageCode)}
            className="w-full bg-stone-800 border border-stone-700 text-stone-300 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2"
          >
            {Object.entries(languages).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>
        
        {viewMode === 'teacher' && (
          <div>
            <div className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2">
              Continuity Architect
            </div>
            <div className="text-sm">Zero-Resource: <span className="text-emerald-500 font-medium">Active</span></div>
          </div>
        )}
      </div>
    </aside>
  );
}
