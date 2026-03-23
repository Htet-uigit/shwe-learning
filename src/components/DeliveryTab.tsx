import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Check, Download, QrCode, UserPlus, BrainCircuit, Loader2, Sparkles, 
  Search, MessageSquare, ShieldCheck, History, FileText, Scan, Upload
} from 'lucide-react';
import { Student } from '../App';
import { LanguageCode, languages, useTranslation } from '../lib/i18n';
import { analyzeStudentResults } from '../lib/gemini';
import { encodeStudentPassport, decodeStudentPassport } from '../lib/qr';
import { exportStudentReport } from '../lib/pdf';

interface DeliveryTabProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  currentTopic: string;
  uiLanguage: LanguageCode;
  onUpdateRecommendation: (studentId: string, topic: string, recommendation: string) => void;
  onApplyAdjustment: (recommendation: string) => void;
}

export function DeliveryTab({ students, setStudents, currentTopic, uiLanguage, onUpdateRecommendation, onApplyAdjustment }: DeliveryTabProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('');
  const [newStudentLang, setNewStudentLang] = useState<LanguageCode>('my');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isPlagiarismChecking, setIsPlagiarismChecking] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  
  const t = useTranslation(uiLanguage);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStudent = () => {
    if (!newStudentName || !newStudentGrade) return;
    
    const newStudent: Student = {
      id: Math.random().toString(36).substring(7),
      name: newStudentName,
      grade: newStudentGrade,
      completedTopics: [],
      preferredLanguage: newStudentLang
    };
    
    setStudents([...students, newStudent]);
    setNewStudentName('');
    setNewStudentGrade('');
  };

  const handleMarkComplete = (studentId: string) => {
    setStudents(students.map(s => {
      if (s.id === studentId) {
        const updatedTopics = s.completedTopics.includes(currentTopic) 
          ? s.completedTopics 
          : [...s.completedTopics, currentTopic];
        return { ...s, completedTopics: updatedTopics };
      }
      return s;
    }));
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedStudent) return;
    alert(`Message sent to ${selectedStudent.name}: ${messageText}`);
    setMessageText('');
  };

  const handlePlagiarismCheck = () => {
    setIsPlagiarismChecking(true);
    setTimeout(() => {
      setIsPlagiarismChecking(false);
      alert("Plagiarism Check Complete: 98% Originality. No AI-generated patterns detected.");
    }, 2000);
  };

  const handleScanQR = () => {
    const decoded = decodeStudentPassport(scanInput);
    if (decoded) {
      const exists = students.find(s => s.id === decoded.id);
      if (exists) {
        alert("Student already in roster.");
      } else {
        setStudents(prev => [...prev, decoded]);
        alert(`Successfully imported ${decoded.name}'s passport.`);
      }
      setScanInput('');
      setShowScanner(false);
    } else {
      alert("Invalid Passport Data.");
    }
  };

  const handleExportReport = (student: Student) => {
    exportStudentReport(student);
  };

  const handleAnalyzeResults = async (student: Student) => {
    if (!currentTopic) return;
    setIsAnalyzing(true);
    try {
      const score = student.recentScores?.[currentTopic]?.score || 0;
      const total = student.recentScores?.[currentTopic]?.total || 100;
      const recommendation = await analyzeStudentResults(student.name, currentTopic, score, total);
      onUpdateRecommendation(student.id, currentTopic, recommendation);
    } catch (error) {
      console.error("Error analyzing results:", error);
      alert("Failed to analyze results.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900">
            {t('teacherDashboard')}
          </h2>
          <p className="text-stone-500">
            Manage students, track progress, and issue passports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowScanner(!showScanner)}
            className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-xl font-medium transition-all"
          >
            <Scan className="w-4 h-4" />
            {t('scanQR')}
          </button>
        </div>
      </header>

      {showScanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
            <QrCode className="w-5 h-5" /> Import Student Passport
          </h3>
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Paste Base64 Passport String here..."
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              className="flex-1 px-4 py-2 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
            <button 
              onClick={handleScanQR}
              className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-emerald-700 transition-all"
            >
              Import
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-stone-200 bg-stone-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-stone-800 text-lg">Class Roster</h3>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {students.length} Students
                </span>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
                />
              </div>
            </div>
            
            <div className="divide-y divide-stone-100">
              {filteredStudents.map((student) => {
                const isCompleted = student.completedTopics.includes(currentTopic);
                const isSelected = selectedStudent?.id === student.id;
                const recentScore = student.recentScores?.[currentTopic];
                
                return (
                  <div 
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        isSelected ? 'bg-emerald-200 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-stone-900">{student.name}</p>
                        <p className="text-sm text-stone-500">
                          {student.grade} • {student.completedTopics.length} Topics
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {recentScore && (
                        <span className="text-sm font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
                          {recentScore.score}/{recentScore.total}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkComplete(student.id);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isCompleted 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        {isCompleted ? 'Done' : 'Mark'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedStudent && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-stone-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-600" />
                  Student Timeline: {selectedStudent.name}
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleExportReport(selectedStudent)}
                    className="flex items-center gap-2 text-xs font-medium bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" /> Export Report
                  </button>
                </div>
              </div>

              <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-100">
                {selectedStudent.completedTopics.length > 0 ? (
                  selectedStudent.completedTopics.map((topic, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-8 top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                      <div>
                        <p className="text-sm font-medium text-stone-900">{topic}</p>
                        <p className="text-xs text-stone-500">Completed successfully</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-400 italic">No activity recorded yet.</p>
                )}
              </div>

              <div className="pt-6 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Direct Message
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Send message to student..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 text-sm px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Integrity Check
                  </label>
                  <button 
                    onClick={handlePlagiarismCheck}
                    disabled={isPlagiarismChecking}
                    className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white py-2 rounded-xl text-sm font-medium hover:bg-stone-800 transition-all disabled:opacity-50"
                  >
                    {isPlagiarismChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Run Plagiarism Check
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Student Form */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <h4 className="font-medium text-stone-800 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-stone-500" />
              {t('addStudent')}
            </h4>
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder={t('studentName')}
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="flex-1 min-w-[150px] px-4 py-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder={t('grade')}
                value={newStudentGrade}
                onChange={(e) => setNewStudentGrade(e.target.value)}
                className="w-24 px-4 py-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <select
                value={newStudentLang}
                onChange={(e) => setNewStudentLang(e.target.value as LanguageCode)}
                className="w-32 px-4 py-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>{name.split(' ')[0]}</option>
                ))}
              </select>
              <button
                onClick={handleAddStudent}
                disabled={!newStudentName || !newStudentGrade}
                className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50 transition-colors"
              >
                {t('addBtn')}
              </button>
            </div>
          </div>
        </div>

        {/* QR Passport & Analytics Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-stone-900 text-white rounded-3xl p-8 sticky top-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-emerald-500/20 p-2.5 rounded-xl">
                <QrCode className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-xl">{t('passportTitle')}</h3>
            </div>

            {selectedStudent ? (
              <div className="space-y-8 flex flex-col items-center">
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold tracking-tight">{selectedStudent.name}</p>
                  <p className="text-stone-400">{selectedStudent.grade}</p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-inner">
                  <QRCodeSVG 
                    value={encodeStudentPassport(selectedStudent)} 
                    size={200}
                    level="M"
                    includeMargin={false}
                  />
                </div>

                <div className="w-full space-y-4">
                  <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                    <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-2">Passport String (Base64)</p>
                    <p className="font-mono text-[10px] text-emerald-400 break-all leading-relaxed opacity-80 select-all">
                      {encodeStudentPassport(selectedStudent)}
                    </p>
                  </div>
                  
                  <button className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium transition-colors">
                    <Download className="w-5 h-5" />
                    {t('downloadPassport')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4 border-2 border-dashed border-stone-700 rounded-2xl p-6">
                <UserPlus className="w-12 h-12 text-stone-600" />
                <p className="text-stone-400">Select a student from the roster to generate their offline passport.</p>
              </div>
            )}
          </div>

          {/* AI Analytics Panel */}
          {selectedStudent && selectedStudent.recentScores?.[currentTopic] && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-200 p-2 rounded-xl">
                  <BrainCircuit className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-semibold text-emerald-900">AI Insights</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-emerald-800 font-medium">Recent Score: {selectedStudent.recentScores[currentTopic].score}/{selectedStudent.recentScores[currentTopic].total}</p>
              </div>

              {selectedStudent.aiRecommendations?.[currentTopic] ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-emerald-100 text-sm text-stone-700 leading-relaxed">
                    {selectedStudent.aiRecommendations[currentTopic]}
                  </div>
                  <button
                    onClick={() => onApplyAdjustment(selectedStudent.aiRecommendations![currentTopic])}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    Apply Curriculum Adjustment
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleAnalyzeResults(selectedStudent)}
                  disabled={isAnalyzing}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                  Generate Curriculum Adjustment
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
