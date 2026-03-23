import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are the 'Continuity Architect' for the Shwe Learning App.

The Mission: Create a tool for teachers in rural/conflict zones in Myanmar. The app must generate 'Zero-Resource' lesson plans (using stones, bamboo, charcoal) and manage 'Migrant Student Passports'.

The Core Logic:
- Zero-Trust Storage: Since internet is cut off, student progress must be stored in a 'JSON-Compressed QR Code'. This is the student's physical passport.
- Context-Aware Curriculum: If the teacher uploads a curriculum file or an image of their surroundings, rewrite it to work without electricity or textbooks.

When generating a lesson plan, you must provide THREE distinct sections, separated by a clear delimiter like "---SECTION_DIVIDER---":
1. The Lesson Plan (Context-Aware, Zero-Resource)
2. The "Radio-Mode" Script (A 2-minute voice clip script for the lesson to be shared via Bluetooth or radio waves)
3. The Resilience Checklist (A checklist to ensure the lesson is safe, localized, and zero-resource)

All output MUST be in Unicode Burmese.`;

export async function generateLessonPlan(topic: string, imageBase64?: string, mimeType?: string) {
  const parts: any[] = [];
  
  if (imageBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    });
  }
  
  parts.push({
    text: `Generate a lesson plan for the topic: "${topic}". If an image is provided, use the objects in the image as teaching aids.`,
  });

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return response.text;
}

export async function translateContent(text: string, targetLanguage: string) {
  if (!text) return "";
  
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Translate the following educational content into ${targetLanguage}. Maintain the original formatting, markdown structure, and educational tone. If the target language is a specific dialect like S'gaw Karen, Hakha Chin, or Rakhine, use the most accurate script and vocabulary available.\n\nContent to translate:\n${text}`,
  });

  return response.text || text;
}

export async function chatWithOfflineAssistant(message: string, topic: string, lessonPlan: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are an offline AI tutor helping a student learn about "${topic}". 
    Here is the lesson plan for context:
    ${lessonPlan}
    
    The student says: "${message}"
    
    Respond directly to the student in a helpful, encouraging, and simple manner. Keep it concise.`,
  });

  return response.text || "I'm sorry, I couldn't understand that.";
}

export async function analyzeStudentResults(studentName: string, topic: string, score: number, total: number) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `A student named ${studentName} just completed a practice quiz on "${topic}" and scored ${score} out of ${total}.
    
    Based on this score, provide a brief (2-3 sentences) analysis for the teacher. Suggest a specific curriculum adjustment or practice activity suitable for a zero-resource environment.
    
    Format the response as a direct recommendation to the teacher.`,
  });

  return response.text || "No recommendation available.";
}

export async function adjustLessonPlan(lessonPlan: string, recommendation: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are an expert curriculum designer. 
    Here is the current lesson plan:
    ${lessonPlan}
    
    Here is a recommendation based on a student's recent performance:
    ${recommendation}
    
    Please rewrite the lesson plan to incorporate this recommendation. Add a specific "Personalized Practice" or "Adjusted Activity" section if necessary. Keep the rest of the lesson plan intact but adapted to the recommendation.`,
  });

  return response.text || lessonPlan;
}
