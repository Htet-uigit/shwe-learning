/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputTab } from './components/InputTab';
import { RefinementTab } from './components/RefinementTab';
import { DeliveryTab } from './components/DeliveryTab';
import { StudentView } from './components/StudentView';
import { AIChatbot } from './components/AIChatbot';
import { generateLessonPlan, adjustLessonPlan } from './lib/gemini';
import { LanguageCode, t } from './lib/i18n';

export type TabType = 'input' | 'refinement' | 'delivery' | 'chatbot';
export type ViewMode = 'teacher' | 'student';

export interface Student {
  id: string;
  name: string;
  grade: string;
  completedTopics: string[];
  preferredLanguage?: LanguageCode;
  recentScores?: Record<string, { score: number, total: number }>;
  aiRecommendations?: Record<string, string>;
}

const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Aung Aung', grade: 'Grade 5', completedTopics: ['Math Basics'], preferredLanguage: 'my', recentScores: {} },
  { id: '2', name: 'Su Su', grade: 'Grade 5', completedTopics: ['Math Basics', 'Science'], preferredLanguage: 'my', recentScores: {} },
];

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('teacher');
  const [activeTab, setActiveTab] = useState<TabType>('input');
  const [uiLanguage, setUiLanguage] = useState<LanguageCode>('en');
  const [recentEdits, setRecentEdits] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  
  // Persistence
  useEffect(() => {
    const savedStudents = localStorage.getItem('shwe_students');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
    const savedEdits = localStorage.getItem('shwe_recent_edits');
    if (savedEdits) {
      setRecentEdits(JSON.parse(savedEdits));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shwe_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('shwe_recent_edits', JSON.stringify(recentEdits));
  }, [recentEdits]);

  const addRecentEdit = (edit: string) => {
    setRecentEdits(prev => [edit, ...prev.slice(0, 4)]);
  };
  const [topic, setTopic] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  
  // State for Refinement Tab
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessonPlan, setLessonPlan] = useState('');
  const [radioScript, setRadioScript] = useState('');
  const [resilienceChecklist, setResilienceChecklist] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // State for Delivery Tab
  const handleGenerate = async () => {
    if (!topic && !imageBase64) return;
    
    setIsGenerating(true);
    setActiveTab('refinement');
    
    try {
      const result = await generateLessonPlan(topic, imageBase64 || undefined, imageMimeType || undefined);
      
      if (result) {
        addRecentEdit(`Generated: ${topic}`);
        // Parse the result based on the delimiter
        const sections = result.split('---SECTION_DIVIDER---');
        if (sections.length >= 3) {
          setLessonPlan(sections[0].trim());
          setRadioScript(sections[1].trim());
          setResilienceChecklist(sections[2].trim());
        } else {
          // Fallback if the model didn't use the delimiter perfectly
          setLessonPlan(result);
        }
      }
    } catch (error) {
      console.error("Error generating lesson plan:", error);
      alert("Failed to generate lesson plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStudentCompleteLesson = (studentId: string, topic: string, score: number, total: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          completedTopics: s.completedTopics.includes(topic) ? s.completedTopics : [...s.completedTopics, topic],
          recentScores: {
            ...(s.recentScores || {}),
            [topic]: { score, total }
          }
        };
      }
      return s;
    }));
  };

  const handleUpdateStudentRecommendation = (studentId: string, topic: string, recommendation: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          aiRecommendations: {
            ...(s.aiRecommendations || {}),
            [topic]: recommendation
          }
        };
      }
      return s;
    }));
  };

  const handleApplyAdjustment = async (recommendation: string) => {
    setIsGenerating(true);
    setActiveTab('refinement');
    try {
      const updatedLessonPlan = await adjustLessonPlan(lessonPlan, recommendation);
      setLessonPlan(updatedLessonPlan);
      addRecentEdit(`Adjusted: ${topic}`);
    } catch (error) {
      console.error("Error applying adjustment:", error);
      alert("Failed to apply adjustment. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-stone-100 font-sans text-stone-900">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        uiLanguage={uiLanguage}
        setUiLanguage={setUiLanguage}
        viewMode={viewMode}
        setViewMode={setViewMode}
        recentEdits={recentEdits}
      />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-200 min-h-[calc(100vh-4rem)]">
          {viewMode === 'teacher' ? (
            <>
              {activeTab === 'input' && (
                <InputTab 
                  topic={topic} 
                  setTopic={setTopic}
                  imageFile={imageFile}
                  setImageFile={setImageFile}
                  setImageBase64={setImageBase64}
                  setImageMimeType={setImageMimeType}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  uiLanguage={uiLanguage}
                />
              )}
              
              {activeTab === 'refinement' && (
                <RefinementTab 
                  isGenerating={isGenerating}
                  lessonPlan={lessonPlan}
                  setLessonPlan={setLessonPlan}
                  radioScript={radioScript}
                  setRadioScript={setRadioScript}
                  resilienceChecklist={resilienceChecklist}
                  setResilienceChecklist={setResilienceChecklist}
                  topic={topic}
                  setTopic={setTopic}
                  tags={tags}
                  setTags={setTags}
                  onFinalize={() => setActiveTab('delivery')}
                  uiLanguage={uiLanguage}
                />
              )}
              
              {activeTab === 'delivery' && (
                <DeliveryTab 
                  students={students}
                  setStudents={setStudents}
                  currentTopic={topic || 'New Lesson'}
                  uiLanguage={uiLanguage}
                  onUpdateRecommendation={handleUpdateStudentRecommendation}
                  onApplyAdjustment={handleApplyAdjustment}
                />
              )}

              {activeTab === 'chatbot' && (
                <AIChatbot uiLanguage={uiLanguage} />
              )}
            </>
          ) : (
            <StudentView 
              students={students}
              lessonPlan={lessonPlan}
              topic={topic || 'New Lesson'}
              uiLanguage={uiLanguage}
              onCompleteLesson={handleStudentCompleteLesson}
            />
          )}
        </div>
      </main>
    </div>
  );
}
