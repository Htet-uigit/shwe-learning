import { useState, useMemo } from 'react';
import { 
  BookOpen, Video, Music, FileText, MessageSquare, CheckCircle, 
  PlayCircle, Clock, Award, ChevronRight, PieChart as PieChartIcon,
  CheckCircle2, Send, Loader2, Sparkles, User
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Student } from '../App';
import { LanguageCode, t } from '../lib/i18n';
import Markdown from 'react-markdown';
import { chatWithOfflineAssistant } from '../lib/gemini';

interface StudentViewProps {
  students: Student[];
  lessonPlan: string;
  topic: string;
  uiLanguage: LanguageCode;
  onCompleteLesson: (studentId: string, topic: string, score: number, total: number) => void;
}

type StudentTab = 'dashboard' | 'lesson';
type LessonContentTab = 'video' | 'audio' | 'pdf' | 'discussion';

export function StudentView({ students, lessonPlan, topic, uiLanguage, onCompleteLesson }: StudentViewProps) {
  const [activeStudentId, setActiveStudentId] = useState<string>(students[0]?.id || '');
  const [activeTab, setActiveTab] = useState<StudentTab>('dashboard');
  const [contentTab, setContentTab] = useState<LessonContentTab>('video');
  const [comments, setComments] = useState<{user: string, text: string}[]>([]);
  const [newComment, setNewComment] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: 'Hello! I am your AI learning assistant. Do you have any questions about the lesson?' }
  ]);
  const [isChatting, setIsChatting] = useState(false);

  const currentStudent = students.find(s => s.id === activeStudentId);

  const progressData = useMemo(() => {
    if (!currentStudent) return [];
    const completed = currentStudent.completedTopics.length;
    const total = 10; // Simulated total courses
    return [
      { name: 'Completed', value: completed },
      { name: 'Remaining', value: total - completed }
    ];
  }, [currentStudent]);

  const COLORS = ['#10b981', '#e7e5e4'];

  const handleAddComment = () => {
    if (!newComment.trim() || !currentStudent) return;
    setComments([...comments, { user: currentStudent.name, text: newComment }]);
    setNewComment('');
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const newHistory = [...chatHistory, { role: 'user' as const, content: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');
    setIsChatting(true);
    
    try {
      const response = await chatWithOfflineAssistant(chatMessage, topic, lessonPlan);
      setChatHistory([...newHistory, { role: 'ai', content: response }]);
    } catch (error) {
      console.error("Error chatting with AI:", error);
      setChatHistory([...newHistory, { role: 'ai', content: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsChatting(false);
    }
  };

  if (!currentStudent) return <div className="p-8">No student selected.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-stone-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
            {currentStudent.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-semibold text-stone-900">{currentStudent.name}</h2>
            <p className="text-xs text-stone-500">{currentStudent.grade} • Student Passport Active</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={activeStudentId}
            onChange={(e) => setActiveStudentId(e.target.value)}
            className="bg-stone-100 border-none text-stone-700 text-sm rounded-lg focus:ring-2 focus:ring-emerald-500 p-2"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('lesson')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'lesson' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Lesson
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' ? (
          <div className="p-8 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <Award className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">Completed</p>
                  <p className="text-2xl font-bold text-stone-900">{currentStudent.completedTopics.length}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">In Progress</p>
                  <p className="text-2xl font-bold text-stone-900">1</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">Overall Progress</p>
                  <p className="text-2xl font-bold text-stone-900">{Math.round((currentStudent.completedTopics.length / 10) * 100)}%</p>
                </div>
                <div className="w-16 h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={progressData}
                        innerRadius={20}
                        outerRadius={30}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {progressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* My Courses */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                My Courses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Active Course */}
                <div 
                  onClick={() => setActiveTab('lesson')}
                  className="bg-white rounded-2xl border-2 border-emerald-500 shadow-md overflow-hidden cursor-pointer hover:scale-[1.02] transition-all group"
                >
                  <div className="h-32 bg-emerald-600 p-6 flex items-end relative">
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">Active</div>
                    <h4 className="text-white font-bold text-xl leading-tight">{topic}</h4>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3" /> 4 Lessons</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 45 mins</span>
                    </div>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-1/4" />
                    </div>
                    <button className="w-full py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold group-hover:bg-emerald-700 transition-colors">Continue Learning</button>
                  </div>
                </div>

                {/* Completed Courses */}
                {currentStudent.completedTopics.map((t, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden opacity-80 grayscale-[0.5]">
                    <div className="h-32 bg-stone-800 p-6 flex items-end relative">
                      <div className="absolute top-4 right-4 bg-emerald-500 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </div>
                      <h4 className="text-white font-bold text-xl leading-tight">{t}</h4>
                    </div>
                    <div className="p-4">
                      <button className="w-full py-2 border border-stone-200 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-50 transition-colors">Review Content</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Lesson Content Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
              {/* Main Content */}
              <div className="lg:col-span-3 overflow-y-auto bg-white">
                {/* Content Tabs */}
                <div className="flex border-b border-stone-100 px-8 sticky top-0 bg-white z-10">
                  <button 
                    onClick={() => setContentTab('video')}
                    className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${contentTab === 'video' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                  >
                    <Video className="w-4 h-4" /> Video
                  </button>
                  <button 
                    onClick={() => setContentTab('audio')}
                    className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${contentTab === 'audio' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                  >
                    <Music className="w-4 h-4" /> Audio
                  </button>
                  <button 
                    onClick={() => setContentTab('pdf')}
                    className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${contentTab === 'pdf' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                  >
                    <FileText className="w-4 h-4" /> PDF
                  </button>
                  <button 
                    onClick={() => setContentTab('discussion')}
                    className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${contentTab === 'discussion' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                  >
                    <MessageSquare className="w-4 h-4" /> Discussion
                  </button>
                </div>

                <div className="p-8">
                  {contentTab === 'video' && (
                    <div className="space-y-6">
                      <div className="aspect-video bg-stone-900 rounded-3xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <PlayCircle className="w-20 h-20 text-white opacity-80 group-hover:scale-110 transition-transform" />
                        <div className="absolute bottom-6 left-6 text-white">
                          <p className="text-xs font-bold uppercase tracking-widest opacity-70">Teaching Script Video</p>
                          <p className="text-xl font-bold">{topic} Explained</p>
                        </div>
                      </div>
                      <div className="prose prose-stone max-w-none">
                        <h3>Lesson Overview</h3>
                        <p>This video covers the fundamental concepts of {topic}. Watch carefully as we use local materials to demonstrate the process.</p>
                      </div>
                    </div>
                  )}

                  {contentTab === 'audio' && (
                    <div className="space-y-6">
                      <div className="bg-stone-900 rounded-3xl p-8 flex flex-col items-center justify-center gap-6 text-white text-center">
                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                          <Music className="w-12 h-12 text-white" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold">Radio Scripter Audio</h4>
                          <p className="text-stone-400">Perfect for low-bandwidth environments.</p>
                        </div>
                        <div className="w-full max-w-md bg-stone-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-1/3" />
                        </div>
                        <div className="flex gap-4">
                          <button className="bg-white text-stone-900 px-6 py-2 rounded-full font-bold">Play Audio</button>
                          <button className="bg-stone-800 text-white px-6 py-2 rounded-full font-bold">Download</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {contentTab === 'pdf' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between bg-stone-100 p-6 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="bg-red-100 p-3 rounded-xl">
                            <FileText className="w-8 h-8 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-stone-900">Localized Curriculum.pdf</h4>
                            <p className="text-sm text-stone-500">2.4 MB • Available Offline</p>
                          </div>
                        </div>
                        <button className="bg-stone-900 text-white px-6 py-2 rounded-xl font-bold">Download PDF</button>
                      </div>
                      <div className="border border-stone-200 rounded-2xl p-8 prose prose-stone max-w-none bg-stone-50/30">
                        <Markdown>{lessonPlan || "# No lesson plan available yet."}</Markdown>
                      </div>
                    </div>
                  )}

                  {contentTab === 'discussion' && (
                    <div className="space-y-6">
                      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-6">
                        <h4 className="font-bold text-lg text-stone-900">Class Discussion</h4>
                        <div className="space-y-4">
                          {comments.length === 0 ? (
                            <p className="text-sm text-stone-400 italic">No comments yet. Be the first to start the discussion!</p>
                          ) : (
                            comments.map((c, i) => (
                              <div key={i} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold">{c.user.charAt(0)}</div>
                                <div className="bg-stone-50 p-3 rounded-2xl rounded-tl-none flex-1">
                                  <p className="text-xs font-bold text-stone-900 mb-1">{c.user}</p>
                                  <p className="text-sm text-stone-700">{c.text}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-stone-100">
                          <input 
                            type="text" 
                            placeholder="Type your question or comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                          />
                          <button 
                            onClick={handleAddComment}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="hidden lg:flex flex-col bg-stone-50 border-l border-stone-200 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">AI Tutor</h4>
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col h-64">
                      <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {chatHistory.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-xl p-2 text-xs ${
                              msg.role === 'user' 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-stone-100 text-stone-800'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {isChatting && (
                          <div className="flex justify-start">
                            <div className="bg-stone-100 text-stone-800 rounded-xl p-2 flex items-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin text-stone-500" />
                              <span className="text-[10px] text-stone-500">Thinking...</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2 border-t border-stone-100 flex gap-2">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Ask..."
                          className="flex-1 bg-stone-50 border-none rounded-lg px-2 py-1 text-[10px] focus:ring-1 focus:ring-emerald-500"
                        />
                        <button 
                          onClick={handleSendMessage}
                          disabled={!chatMessage.trim() || isChatting}
                          className="bg-emerald-600 text-white p-1 rounded-lg disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Next Steps</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-200 text-sm">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle className="w-4 h-4" /></div>
                        <span className="text-stone-400 line-through">Watch Video</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-200 text-sm font-bold">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white">2</div>
                        <span>Take Quiz</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-stone-100 rounded-xl text-sm text-stone-400">
                        <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center">3</div>
                        <span>Final Project</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-stone-200 bg-white">
                  <button 
                    onClick={() => {
                      const score = Math.floor(Math.random() * 41) + 60;
                      onCompleteLesson(currentStudent.id, topic, score, 100);
                      setActiveTab('dashboard');
                    }}
                    className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold shadow-lg shadow-stone-200 flex items-center justify-center gap-2 hover:bg-stone-800 transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Finish Lesson
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
