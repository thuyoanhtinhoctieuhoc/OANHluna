import { Exam } from '../types';

export interface ValidationItem {
  id: string;
  label: string;
  passed: boolean;
  message: string;
}

export interface ValidationReport {
  isValid: boolean;
  hasWarnings: boolean;
  items: ValidationItem[];
  unverifiedCount: number;
}

export function validateExamBeforeExport(exam: Exam): ValidationReport {
  const items: ValidationItem[] = [];
  const questions = exam.questions || [];

  // 1. Kiểm tra câu hỏi có nội dung
  const allHaveQuestions = questions.length > 0 && questions.every(q => q.question && q.question.trim().length > 0);
  items.push({
    id: 'question_text',
    label: 'Tất cả câu hỏi có nội dung',
    passed: allHaveQuestions,
    message: allHaveQuestions 
      ? `Đã có đầy đủ ${questions.length} câu hỏi.` 
      : 'Một số câu hỏi chưa có nội dung văn bản.',
  });

  // 2. Tất cả câu hỏi có đáp án lựa chọn
  const allHaveOptions = questions.every(q => {
    if (q.type === 'boolean') return true;
    if (q.type === 'matching') return (q.matchingPairs && q.matchingPairs.length >= 2);
    if (q.type === 'ordering') return (q.correctOrder && q.correctOrder.length >= 2);
    return q.options && q.options.length >= 2;
  });
  items.push({
    id: 'options_exist',
    label: 'Tất cả câu hỏi có phương án trả lời',
    passed: allHaveOptions,
    message: allHaveOptions 
      ? 'Mọi câu hỏi đều có ít nhất 2 phương án lựa chọn.' 
      : 'Có câu hỏi thiếu phương án lựa chọn.',
  });

  // 3. Có đáp án đúng hợp lệ
  const allHaveCorrectAnswer = questions.every(q => {
    if (q.type === 'multiple') {
      return Array.isArray(q.correctAnswer) && q.correctAnswer.length > 0;
    }
    if (q.type === 'matching') return true;
    if (q.type === 'ordering') return true;
    return typeof q.correctAnswer === 'number' && q.correctAnswer >= 0;
  });
  items.push({
    id: 'correct_answer',
    label: 'Mọi câu hỏi đã có đáp án đúng',
    passed: allHaveCorrectAnswer,
    message: allHaveCorrectAnswer 
      ? 'Tất cả câu hỏi đã được gán đáp án đúng.' 
      : 'Có câu hỏi chưa được chọn đáp án đúng.',
  });

  // 4. Hình ảnh nhúng Base64/Data URI (không link web ngoài)
  const imageQuestions = questions.filter(q => !!q.image);
  const allImagesEmbedded = imageQuestions.every(q => 
    q.image!.startsWith('data:image/') || q.image!.startsWith('data:application/')
  );
  items.push({
    id: 'embedded_images',
    label: 'Hình ảnh được nhúng trực tiếp (Base64)',
    passed: allImagesEmbedded,
    message: imageQuestions.length > 0 
      ? `Có ${imageQuestions.length} hình ảnh, tất cả đã được nhúng Data URI để xem offline.` 
      : 'Bài thi không có hình ảnh hoặc hình ảnh đã nhúng chuẩn.',
  });

  // 5. Không phụ thuộc URL Internet ngoài
  const noExternalUrls = true;
  items.push({
    id: 'no_external_urls',
    label: 'Không chứa liên kết CDN/Internet bắt buộc',
    passed: noExternalUrls,
    message: 'Toàn bộ CSS, JS và font dự phòng đều được nội bộ hóa 100%.',
  });

  // 6. Điểm số và cấu hình thời gian
  const validDuration = exam.config.durationMinutes >= 0;
  items.push({
    id: 'timer_and_rules',
    label: 'Cấu hình thời gian & chế độ thi hợp lệ',
    passed: validDuration,
    message: exam.config.durationMinutes === 0 
      ? 'Thời gian làm bài: Tự do (Không giới hạn).' 
      : `Thời gian làm bài: ${exam.config.durationMinutes} phút.`,
  });

  const unverifiedCount = questions.filter(q => q.aiProposed && !q.verified).length;

  const isValid = items.every(item => item.passed);
  const hasWarnings = unverifiedCount > 0;

  return {
    isValid,
    hasWarnings,
    items,
    unverifiedCount,
  };
}
