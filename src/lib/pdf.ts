
import { jsPDF } from 'jspdf';

export const exportStudentReport = (student: {
  name: string;
  grade: string;
  completedTopics: string[];
  recentScores?: Record<string, { score: number, total: number }>;
}) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(22);
  doc.text('Shwe Learning - Student Progress Report', 20, 20);
  
  // Student Info
  doc.setFontSize(16);
  doc.text(`Student: ${student.name}`, 20, 40);
  doc.text(`Grade: ${student.grade}`, 20, 50);
  
  // Completion Status
  doc.setFontSize(14);
  doc.text('Completed Topics:', 20, 70);
  
  let y = 80;
  student.completedTopics.forEach((topic, index) => {
    const score = student.recentScores?.[topic];
    const scoreText = score ? ` - Score: ${score.score}/${score.total}` : '';
    doc.text(`${index + 1}. ${topic}${scoreText}`, 30, y);
    y += 10;
  });
  
  // AI Satisfaction Tag (Simulated)
  doc.setFontSize(12);
  doc.setTextColor(0, 128, 0); // Green
  doc.text('AI Satisfaction Tag: EXCELLENT PROGRESS', 20, y + 10);
  
  // Save the PDF
  doc.save(`${student.name.replace(/\s+/g, '_')}_Progress_Report.pdf`);
};

export const exportCurriculum = (topic: string, lessonPlan: string, radioScript: string, resilienceChecklist: string) => {
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.text(`Curriculum: ${topic}`, 20, 20);
  
  doc.setFontSize(16);
  doc.text('Lesson Plan', 20, 35);
  doc.setFontSize(10);
  const lessonSplit = doc.splitTextToSize(lessonPlan, 170);
  doc.text(lessonSplit, 20, 45);
  
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Radio Script', 20, 20);
  doc.setFontSize(10);
  const radioSplit = doc.splitTextToSize(radioScript, 170);
  doc.text(radioSplit, 20, 30);
  
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Resilience Checklist', 20, 20);
  doc.setFontSize(10);
  const checklistSplit = doc.splitTextToSize(resilienceChecklist, 170);
  doc.text(checklistSplit, 20, 30);
  
  doc.save(`${topic.replace(/\s+/g, '_')}_Curriculum.pdf`);
};
