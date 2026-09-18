export type QuestionType = 
  | 'single'        // 1 đáp án đúng (A/B/C/D)
  | 'multiple'      // Nhiều đáp án đúng
  | 'boolean'       // Đúng / Sai
  | 'image'         // Chọn hình ảnh / có hình minh họa
  | 'matching'      // Ghép đôi
  | 'ordering'      // Sắp xếp thứ tự
  | 'word_reorder'  // Sắp xếp từ để thành câu hoàn chỉnh
  | 'reading';      // Đọc hiểu đoạn văn rồi trả lời câu hỏi

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Question {
  id: number;
  question: string;
  image?: string; // Data URI: data:image/png;base64,...
  imageCaption?: string;
  type: QuestionType;
  options: string[]; // Options or word bank
  correctAnswer: number | number[]; // 0 = A, 1 = B, 2 = C, 3 = D... or [0, 2] for multiple
  readingPassage?: string; // Đoạn văn đọc hiểu (Reading text / passage)
  passageTitle?: string;   // Tiêu đề đoạn trích (ví dụ: "Đọc đoạn văn sau rồi trả lời câu hỏi:")
  matchingPairs?: MatchingPair[]; // For matching type
  correctOrder?: string[];        // For ordering & word_reorder type
  correctSentence?: string;       // Target correct sentence for word_reorder
  explanation?: string;
  aiProposed?: boolean;           // ⚠️ Đáp án do AI đề xuất – giáo viên cần kiểm tra
  verified?: boolean;             // Đã được giáo viên xác nhận
  scorePoint?: number;            // Điểm số mỗi câu (mặc định 1)
}

export interface ExamConfig {
  title: string;
  subject: string;
  grade: string;
  teacherName: string;
  schoolName?: string;
  durationMinutes: number; // 0 = Không giới hạn, 5, 10, 15, 20, 30, 45...
  mode: 'exam' | 'practice'; // 'exam' (chế độ thi: không hiện đáp án), 'practice' (luyện tập: hiện ngay đáp án và giải thích)
  maxAttempts: 'unlimited' | 'one';
  showAnswersAfterSubmit: boolean;
  allowReview: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  enableLocalStorage: boolean; // Chống mất dữ liệu khi F5
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  grade: string;
  topic?: string;
  createdAt: string;
  updatedAt: string;
  config: ExamConfig;
  questions: Question[];
}

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  base64Data?: string; // without data: prefix or full data URI
  previewUrl?: string;
}

export interface AnalysisRequestPayload {
  files: {
    name: string;
    mimeType: string;
    base64Data: string;
  }[];
  pastedText?: string;
  gradeHint?: string;
  subjectHint?: string;
}

export interface AnalysisResponseData {
  title: string;
  subject: string;
  grade: string;
  topic?: string;
  questions: Question[];
}
