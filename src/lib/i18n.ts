
export type LanguageCode = 'en' | 'my' | 'ksw';

export interface Translations {
  [key: string]: {
    [lang in LanguageCode]: string;
  };
}

export const translations: Translations = {
  appName: {
    en: 'Shwe Learning LMS',
    my: 'ရွှေသင်ယူမှု LMS',
    ksw: 'Shwe Learning LMS'
  },
  teacherDashboard: {
    en: 'Teacher Dashboard',
    my: 'ဆရာဒက်ရှ်ဘုတ်',
    ksw: 'Teacher Dashboard'
  },
  studentDashboard: {
    en: 'Student Dashboard',
    my: 'ကျောင်းသားဒက်ရှ်ဘုတ်',
    ksw: 'Student Dashboard'
  },
  myCourses: {
    en: 'My Courses',
    my: 'ကျွန်ုပ်၏သင်တန်းများ',
    ksw: 'My Courses'
  },
  studentPassport: {
    en: 'Student Passport',
    my: 'ကျောင်းသားပတ်စပို့',
    ksw: 'Student Passport'
  },
  scanQR: {
    en: 'Scan QR Code',
    my: 'QR ကုဒ်ဖတ်ရန်',
    ksw: 'Scan QR Code'
  },
  generateQR: {
    en: 'Generate Passport QR',
    my: 'ပတ်စပို့ QR ထုတ်ရန်',
    ksw: 'Generate Passport QR'
  },
  exportCurriculum: {
    en: 'Export Curriculum',
    my: 'သင်ရိုးညွှန်းတမ်းထုတ်ရန်',
    ksw: 'Export Curriculum'
  },
  aiChatbot: {
    en: 'AI Education Assistant',
    my: 'AI ပညာရေးလက်ထောက်',
    ksw: 'AI Education Assistant'
  },
  lessonPlan: {
    en: 'Lesson Plan',
    my: 'သင်ခန်းစာအစီအစဉ်',
    ksw: 'Lesson Plan'
  },
  radioScript: {
    en: 'Radio Script',
    my: 'ရေဒီယိုဇာတ်ညွှန်း',
    ksw: 'Radio Script'
  },
  resilienceChecklist: {
    en: 'Resilience Checklist',
    my: 'ကြံ့ကြံ့ခံနိုင်မှုစစ်ဆေးချက်',
    ksw: 'Resilience Checklist'
  },
  video: {
    en: 'Video',
    my: 'ဗီဒီယို',
    ksw: 'Video'
  },
  audio: {
    en: 'Audio',
    my: 'အသံ',
    ksw: 'Audio'
  },
  pdf: {
    en: 'PDF',
    my: 'PDF',
    ksw: 'PDF'
  },
  discussion: {
    en: 'Discussion',
    my: 'ဆွေးနွေးချက်',
    ksw: 'Discussion'
  },
  progress: {
    en: 'Progress',
    my: 'တိုးတက်မှု',
    ksw: 'Progress'
  },
  complete: {
    en: 'Complete',
    my: 'ပြီးမြောက်သည်',
    ksw: 'Complete'
  },
  generate: {
    en: 'Generate',
    my: 'ထုတ်လုပ်ရန်',
    ksw: 'Generate'
  },
  topicPlaceholder: {
    en: 'Enter topic (e.g., Water Cycle)',
    my: 'ခေါင်းစဉ်ရိုက်ထည့်ပါ (ဥပမာ- ရေစက်ဝန်း)',
    ksw: 'Enter topic'
  }
};

export const languages: Record<LanguageCode, string> = {
  en: 'English',
  my: 'မြန်မာဘာသာ',
  ksw: 'S' + 'gaw Karen' // Split to avoid potential issues with special characters if any
};

export const t = (key: string, lang: LanguageCode): string => {
  return translations[key]?.[lang] || key;
};

export const useTranslation = (lang: LanguageCode) => {
  return (key: string) => t(key, lang);
};
