
/**
 * Compresses student data into a Base64-encoded JSON string for QR code generation.
 */
export const encodeStudentPassport = (student: {
  id: string;
  name: string;
  grade: string;
  completedTopics: string[];
}): string => {
  const data = JSON.stringify({
    i: student.id,
    n: student.name,
    g: student.grade,
    c: student.completedTopics
  });
  return btoa(data);
};

/**
 * Decodes a Base64-encoded JSON string from a QR code back into student data.
 */
export const decodeStudentPassport = (encoded: string): {
  id: string;
  name: string;
  grade: string;
  completedTopics: string[];
} | null => {
  try {
    const data = JSON.parse(atob(encoded));
    return {
      id: data.i,
      name: data.n,
      grade: data.g,
      completedTopics: data.c
    };
  } catch (error) {
    console.error('Failed to decode student passport:', error);
    return null;
  }
};
