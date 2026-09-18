import React, { useState, useRef } from 'react';
import { 
  CheckSquare, AlertTriangle, Plus, Trash2, ArrowUp, ArrowDown, 
  Image as ImageIcon, CheckCircle, Edit3, Sparkles, Check, X,
  HelpCircle, Eye, Shuffle, RefreshCw, BookOpen, BookText
} from 'lucide-react';
import { Question, QuestionType } from '../types';

interface QuestionEditorProps {
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
  onConfirmExam: () => void;
  examTitle: string;
  onUpdateTitle: (title: string) => void;
  examSubject: string;
  onUpdateSubject: (subject: string) => void;
  examGrade: string;
  onUpdateGrade: (grade: string) => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  questions,
  onUpdateQuestions,
  onConfirmExam,
  examTitle,
  onUpdateTitle,
  examSubject,
  onUpdateSubject,
  examGrade,
  onUpdateGrade,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unverified'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentImageQuestionId, setCurrentImageQuestionId] = useState<number | null>(null);

  const unverifiedCount = questions.filter(q => q.aiProposed && !q.verified).length;

  const handleUpdateField = (id: number, field: keyof Question, value: any) => {
    onUpdateQuestions(
      questions.map(q => {
        if (q.id === id) {
          return { ...q, [field]: value };
        }
        return q;
      })
    );
  };

  const handleOptionChange = (qId: number, optIndex: number, text: string) => {
    onUpdateQuestions(
      questions.map(q => {
        if (q.id === qId) {
          const newOpts = [...q.options];
          newOpts[optIndex] = text;
          return { ...q, options: newOpts };
        }
        return q;
      })
    );
  };

  const handleAddOption = (qId: number) => {
    onUpdateQuestions(
      questions.map(q => {
        if (q.id === qId) {
          return { ...q, options: [...q.options, `Phương án mới`] };
        }
        return q;
      })
    );
  };

  const handleRemoveOption = (qId: number, optIndex: number) => {
    onUpdateQuestions(
      questions.map(q => {
        if (q.id === qId && q.options.length > 2) {
          const newOpts = q.options.filter((_, idx) => idx !== optIndex);
          let newCorrect = q.correctAnswer;
          if (typeof newCorrect === 'number') {
            if (newCorrect === optIndex) {
              newCorrect = 0;
            } else if (newCorrect > optIndex) {
              newCorrect = newCorrect - 1;
            }
          } else if (Array.isArray(newCorrect)) {
            newCorrect = newCorrect
              .filter(idx => idx !== optIndex)
              .map(idx => (idx > optIndex ? idx - 1 : idx));
            if (newCorrect.length === 0) newCorrect = [0];
          }
          return { ...q, options: newOpts, correctAnswer: newCorrect };
        }
        return q;
      })
    );
  };

  const handleSplitSentenceToWords = (id: number, sentenceText: string) => {
    if (!sentenceText.trim()) return;
    // Split by slash if user typed slashes (e.g. Bé / đang / tưới hoa / .) or by space
    let tokens: string[] = [];
    if (sentenceText.includes('/')) {
      tokens = sentenceText.split('/').map(t => t.trim()).filter(Boolean);
    } else {
      tokens = sentenceText.trim().split(/\s+/).filter(Boolean);
    }

    if (tokens.length === 0) return;

    // Create scrambled options
    const scrambled = [...tokens].sort(() => Math.random() - 0.5);

    onUpdateQuestions(
      questions.map(q => {
        if (q.id === id) {
          return {
            ...q,
            type: 'word_reorder',
            correctSentence: sentenceText.replace(/\s*\/\s*/g, ' ').trim(),
            correctOrder: tokens,
            options: scrambled,
            verified: true,
            aiProposed: false,
          };
        }
        return q;
      })
    );
  };

  const handleScrambleWords = (id: number) => {
    onUpdateQuestions(
      questions.map(q => {
        if (q.id === id) {
          const scrambled = [...q.options].sort(() => Math.random() - 0.5);
          return { ...q, options: scrambled };
        }
        return q;
      })
    );
  };

  const handleAddWordToBank = (id: number, word: string) => {
    if (!word.trim()) return;
    onUpdateQuestions(
      questions.map(q => {
        if (q.id === id) {
          return { ...q, options: [...q.options, word.trim()] };
        }
        return q;
      })
    );
  };

  const handleRemoveWordFromBank = (id: number, wordIndex: number) => {
    onUpdateQuestions(
      questions.map(q => {
        if (q.id === id) {
          return { ...q, options: q.options.filter((_, idx) => idx !== wordIndex) };
        }
        return q;
      })
    );
  };

  const handleVerifyQuestion = (id: number) => {
    onUpdateQuestions(
      questions.map(q => {
        if (q.id === id) {
          return { ...q, verified: true, aiProposed: false };
        }
        return q;
      })
    );
  };

  const handleVerifyAll = () => {
    onUpdateQuestions(
      questions.map(q => ({ ...q, verified: true, aiProposed: false }))
    );
  };

  const confirmDeleteQuestion = () => {
    if (questionToDelete !== null) {
      const remaining = questions.filter(q => q.id !== questionToDelete);
      onUpdateQuestions(remaining.map((q, idx) => ({ ...q, id: idx + 1 })));
      setQuestionToDelete(null);
    }
  };

  const handleDeleteQuestion = (id: number) => {
    setQuestionToDelete(id);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const list = [...questions];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    onUpdateQuestions(list.map((q, idx) => ({ ...q, id: idx + 1 })));
  };

  const handleMoveDown = (index: number) => {
    if (index === questions.length - 1) return;
    const list = [...questions];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    onUpdateQuestions(list.map((q, idx) => ({ ...q, id: idx + 1 })));
  };

  const handleAddNewQuestion = () => {
    const newQ: Question = {
      id: questions.length + 1,
      question: 'Nhập nội dung câu hỏi mới...',
      type: 'single',
      options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
      correctAnswer: 0,
      explanation: 'Giải thích cho câu hỏi...',
      verified: true,
      aiProposed: false,
    };
    onUpdateQuestions([...questions, newQ]);
    setEditingId(newQ.id);
  };

  const handleApplyPassageToSubsequent = (fromOriginalIndex: number, passage: string, title?: string) => {
    if (!passage.trim()) return;
    const updated: Question[] = questions.map((q, idx) => {
      if (idx >= fromOriginalIndex) {
        return {
          ...q,
          type: (q.type === 'word_reorder' ? q.type : 'reading') as QuestionType,
          readingPassage: passage,
          passageTitle: title || q.passageTitle || 'Đọc đoạn văn sau rồi trả lời câu hỏi:',
        };
      }
      return q;
    });
    onUpdateQuestions(updated);
  };

  const handleRemovePassageFromQuestion = (qId: number) => {
    onUpdateQuestions(
      questions.map((q): Question => {
        if (q.id === qId) {
          const { readingPassage, passageTitle, ...rest } = q;
          return {
            ...rest,
            type: (q.type === 'reading' ? 'single' : q.type) as QuestionType,
          };
        }
        return q;
      })
    );
  };

  const triggerImageUpload = (qId: number) => {
    setCurrentImageQuestionId(qId);
    fileInputRef.current?.click();
  };

  const handleImageFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentImageQuestionId !== null) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        handleUpdateField(currentImageQuestionId, 'image', base64);
        setCurrentImageQuestionId(null);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const filteredQuestions = filterMode === 'unverified'
    ? questions.filter(q => q.aiProposed && !q.verified)
    : questions;

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="space-y-6">
      {/* Hidden input for question images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFilePicked}
        className="hidden"
      />

      {/* Metadata Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Tên bài học / đề thi
            </label>
            <input
              type="text"
              value={examTitle}
              onChange={(e) => onUpdateTitle(e.target.value)}
              className="w-full text-sm font-bold text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-hidden bg-slate-50/50"
              placeholder="VD: Kiểm tra giữa học kì 1"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Môn học
            </label>
            <input
              type="text"
              value={examSubject}
              onChange={(e) => onUpdateSubject(e.target.value)}
              className="w-full text-sm font-semibold text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-hidden bg-slate-50/50"
              placeholder="Toán học"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Khối lớp
            </label>
            <input
              type="text"
              value={examGrade}
              onChange={(e) => onUpdateGrade(e.target.value)}
              className="w-full text-sm font-semibold text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-hidden bg-slate-50/50"
              placeholder="Lớp 4"
            />
          </div>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả ({questions.length})
          </button>

          <button
            onClick={() => setFilterMode('unverified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMode === 'unverified'
                ? 'bg-amber-500 text-white'
                : unverifiedCount > 0
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Cần kiểm tra ({unverifiedCount})</span>
          </button>

          {unverifiedCount > 0 && (
            <button
              onClick={handleVerifyAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold px-2 py-1"
            >
              ✓ Xác nhận tất cả đáp án
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleAddNewQuestion}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm câu hỏi</span>
          </button>

          <button
            onClick={onConfirmExam}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-2 rounded-lg shadow-sm transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            <span>✅ XÁC NHẬN TẠO BÀI THI</span>
          </button>
        </div>
      </div>

      {/* Notice if unverified */}
      {unverifiedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <strong>Lưu ý từ AI:</strong> Có <strong>{unverifiedCount} câu hỏi</strong> tài liệu gốc không ghi sẵn đáp án và được AI suy luận đề xuất. Thầy/Cô vui lòng kiểm tra và xác nhận đáp án đúng trước khi xuất file bài thi.
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">Không có câu hỏi nào cần kiểm tra.</p>
          </div>
        ) : (
          filteredQuestions.map((q, index) => {
            const isUnverified = q.aiProposed && !q.verified;
            const originalIndex = questions.findIndex(item => item.id === q.id);

            return (
              <div
                key={q.id}
                className={`bg-white rounded-xl border transition-all ${
                  isUnverified
                    ? 'border-amber-300 ring-2 ring-amber-100 shadow-xs'
                    : 'border-slate-200 shadow-xs'
                }`}
              >
                {/* Header Row */}
                <div className="p-4 bg-slate-50/60 border-b border-slate-100 rounded-t-xl flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                      {q.id}
                    </span>

                    {/* Type Selector Dropdown */}
                    <select
                      value={q.type}
                      onChange={(e) => {
                        const newType = e.target.value as QuestionType;
                        if (newType === 'word_reorder') {
                          const sentence = q.correctSentence || (q.options && q.options.length > 0 ? q.options.join(' ') : 'Học sinh chăm chỉ học bài .');
                          handleSplitSentenceToWords(q.id, sentence);
                        } else if (newType === 'reading') {
                          handleUpdateField(q.id, 'type', 'reading');
                          if (!q.readingPassage) {
                            handleUpdateField(q.id, 'readingPassage', 'Hello, my name is Linh. I am a pupil at Hoa Sen Primary School. My school is in a quiet village. It has three big buildings and a large playground. Today is Wednesday, so I have English, Maths, and Science. My favourite subject is English because I want to talk with foreign friends. Yesterday was Tuesday, and I was at the school library with my classmates. We read many interesting books there.');
                          }
                          if (!q.passageTitle) {
                            handleUpdateField(q.id, 'passageTitle', 'Đọc đoạn văn sau rồi trả lời câu hỏi:');
                          }
                        } else {
                          handleUpdateField(q.id, 'type', newType);
                        }
                      }}
                      className="text-[11px] font-bold px-2 py-1 rounded bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 cursor-pointer outline-hidden transition-colors"
                      title="Bấm để chuyển đổi dạng câu hỏi"
                    >
                      <option value="single">🔘 1 đáp án (A/B/C/D)</option>
                      <option value="multiple">☑️ Nhiều đáp án</option>
                      <option value="boolean">⚖️ Đúng / Sai</option>
                      <option value="word_reorder">🧩 Sắp xếp từ thành câu</option>
                      <option value="reading">📖 Đọc hiểu đoạn văn</option>
                      <option value="image">🖼️ Câu hỏi có hình</option>
                    </select>

                    {/* AI Proposed Badge */}
                    {isUnverified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Đáp án AI đề xuất
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Đã xác nhận
                      </span>
                    )}
                  </div>

                  {/* Actions: Move, Verify, Delete */}
                  <div className="flex items-center gap-1">
                    {isUnverified && (
                      <button
                        onClick={() => handleVerifyQuestion(q.id)}
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1 rounded-md transition-all mr-2"
                        title="Xác nhận đáp án này đã chuẩn xác"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Xác nhận đúng
                      </button>
                    )}

                    <button
                      onClick={() => handleMoveUp(originalIndex)}
                      disabled={originalIndex === 0}
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                      title="Chuyển lên trên"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(originalIndex)}
                      disabled={originalIndex === questions.length - 1}
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                      title="Chuyển xuống dưới"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => triggerImageUpload(q.id)}
                      className={`p-1.5 rounded transition-all ${
                        q.image ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
                      }`}
                      title={q.image ? 'Đổi hình ảnh' : 'Thêm hình ảnh cho câu hỏi'}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body: Reading passage + Question input + Image */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Reading Passage Editor */}
                  {(q.type === 'reading' || q.readingPassage) && (
                    <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-3.5 sm:p-4 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-200/70 pb-2.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900">
                          <BookOpen className="w-4 h-4 text-amber-700" />
                          <span>Đoạn văn đọc hiểu (Reading Passage)</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApplyPassageToSubsequent(originalIndex, q.readingPassage || '', q.passageTitle)}
                            className="text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-amber-200/80 hover:bg-amber-300 px-2 py-1 rounded transition-colors"
                            title="Sao chép bài đọc này áp dụng cho tất cả câu hỏi phía dưới"
                          >
                            ⬇ Áp dụng cho các câu dưới
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePassageFromQuestion(q.id)}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
                            title="Gỡ đoạn văn khỏi câu này"
                          >
                            Gỡ đoạn văn
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-800 mb-1">
                          Tiêu đề / Lời dẫn bài đọc:
                        </label>
                        <input
                          type="text"
                          value={q.passageTitle || ''}
                          placeholder="Ví dụ: Read the passage and choose the correct answer (Câu 21 - 25):"
                          onChange={(e) => handleUpdateField(q.id, 'passageTitle', e.target.value)}
                          className="w-full text-xs font-semibold text-slate-800 p-2 rounded-lg border border-amber-200 bg-white focus:border-amber-500 outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-800 mb-1">
                          Nội dung đoạn văn:
                        </label>
                        <textarea
                          rows={4}
                          value={q.readingPassage || ''}
                          placeholder="Nhập hoặc dán nội dung đoạn văn đọc hiểu vào đây..."
                          onChange={(e) => handleUpdateField(q.id, 'readingPassage', e.target.value)}
                          className="w-full text-xs font-serif leading-relaxed text-slate-900 p-2.5 rounded-lg border border-amber-200 bg-white focus:border-amber-500 outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-500">
                        Nội dung câu hỏi:
                      </label>
                      {!(q.type === 'reading' || q.readingPassage) && (
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateField(q.id, 'type', 'reading');
                            handleUpdateField(q.id, 'passageTitle', 'Đọc đoạn văn sau rồi trả lời câu hỏi:');
                            handleUpdateField(q.id, 'readingPassage', 'Hello, my name is Linh. I am a pupil at Hoa Sen Primary School. My school is in a quiet village. It has three big buildings and a large playground.');
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Gắn đoạn văn đọc hiểu</span>
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={q.question}
                      onChange={(e) => handleUpdateField(q.id, 'question', e.target.value)}
                      className="w-full text-sm font-semibold text-slate-800 p-2.5 rounded-lg border border-slate-300 focus:border-blue-500 outline-hidden"
                    />
                  </div>

                  {/* Attached Image preview if any */}
                  {q.image && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <img
                        src={q.image}
                        alt="Hình câu hỏi"
                        className="w-20 h-20 object-contain bg-white rounded border border-slate-200 cursor-pointer"
                        onClick={() => setImageModalUrl(q.image!)}
                      />
                      <div className="flex-1 text-xs">
                        <p className="font-bold text-slate-700">Hình ảnh đính kèm câu hỏi</p>
                        <p className="text-slate-500">Đã nhúng Base64 để hiển thị offline khi xuất bài.</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <button
                            onClick={() => setImageModalUrl(q.image!)}
                            className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Xem to
                          </button>
                          <button
                            onClick={() => triggerImageUpload(q.id)}
                            className="text-slate-600 hover:underline font-semibold"
                          >
                            Thay ảnh khác
                          </button>
                          <button
                            onClick={() => handleUpdateField(q.id, 'image', undefined)}
                            className="text-rose-600 hover:underline font-semibold"
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Options List / Word Reorder Editor */}
                  {q.type === 'word_reorder' ? (
                    <div className="space-y-4 bg-blue-50/60 p-4 sm:p-5 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <label className="text-xs font-extrabold text-blue-950 flex items-center gap-1.5">
                          <span>🧩 Cấu hình sắp xếp từ thành câu hoàn chỉnh</span>
                        </label>
                        <span className="text-[11px] text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full font-bold">
                          Thường dùng cho Tiếng Việt & Tiếng Anh
                        </span>
                      </div>

                      {/* Correct sentence input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Câu hoàn chỉnh chính xác (Đáp án đúng):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={q.correctSentence || ''}
                            placeholder="Ví dụ: Bé Mai chăm chỉ học bài. (hoặc: Bé / Mai / chăm chỉ / học / bài / .)"
                            onChange={(e) => handleUpdateField(q.id, 'correctSentence', e.target.value)}
                            className="flex-1 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-blue-500 outline-hidden font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => handleSplitSentenceToWords(q.id, q.correctSentence || '')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs whitespace-nowrap transition-colors"
                            title="Tự động bóc tách câu thành các thẻ từ rời rạc"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Tách thẻ từ</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          💡 Gõ câu hoàn chỉnh rồi bấm <strong>"Tách thẻ từ"</strong> để AI tự động tạo các thẻ từ rời rạc cho học sinh ghép.
                        </p>
                      </div>

                      {/* Word chips */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Các thẻ từ học sinh sẽ nhận được (Thẻ từ rời):
                          </label>
                          <button
                            type="button"
                            onClick={() => handleScrambleWords(q.id)}
                            className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-bold"
                            title="Xáo trộn thứ tự các thẻ từ"
                          >
                            <Shuffle className="w-3.5 h-3.5" />
                            <span>Đảo ngẫu nhiên</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border border-slate-200 min-h-[50px] items-center">
                          {q.options.map((word, wIdx) => (
                            <div
                              key={wIdx}
                              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold shadow-2xs transition-colors"
                            >
                              <span>{word}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveWordFromBank(q.id, wIdx)}
                                className="text-slate-400 hover:text-rose-600 rounded"
                                title="Xóa thẻ từ này"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}

                          {/* Quick add word inline */}
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="+ Thêm từ..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const target = e.currentTarget;
                                  handleAddWordToBank(q.id, target.value);
                                  target.value = '';
                                }
                              }}
                              className="w-24 text-xs px-2 py-1 bg-slate-50 border border-dashed border-slate-300 rounded-md focus:border-blue-500 outline-hidden"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Order indicator */}
                      {Array.isArray(q.correctOrder) && q.correctOrder.length > 0 && (
                        <div className="text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-300 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div>
                            <strong>Thứ tự chuẩn chấm điểm:</strong>{' '}
                            <span className="font-semibold">{q.correctOrder.join(' ')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Options List */
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500">
                        Các phương án trả lời (Bấm vào chữ cái tròn để chọn đáp án đúng):
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelectedCorrect = Array.isArray(q.correctAnswer)
                            ? q.correctAnswer.includes(optIdx)
                            : q.correctAnswer === optIdx;

                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                                isSelectedCorrect
                                  ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-400'
                                  : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (q.type === 'multiple') {
                                    let currentArr = Array.isArray(q.correctAnswer) ? [...q.correctAnswer] : [q.correctAnswer];
                                    if (currentArr.includes(optIdx)) {
                                      currentArr = currentArr.filter(i => i !== optIdx);
                                    } else {
                                      currentArr.push(optIdx);
                                    }
                                    handleUpdateField(q.id, 'correctAnswer', currentArr);
                                  } else {
                                    handleUpdateField(q.id, 'correctAnswer', optIdx);
                                  }
                                  handleVerifyQuestion(q.id);
                                }}
                                className={`w-7 h-7 rounded-md font-extrabold text-xs flex items-center justify-center flex-shrink-0 transition-all ${
                                  isSelectedCorrect
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                                }`}
                                title="Bấm để chọn đây là đáp án đúng"
                              >
                                {letters[optIdx] || (optIdx + 1)}
                              </button>

                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleOptionChange(q.id, optIdx, e.target.value)}
                                className="flex-1 text-xs sm:text-sm bg-transparent border-none outline-hidden font-medium text-slate-800"
                              />

                              {q.options.length > 2 && (
                                <button
                                  onClick={() => handleRemoveOption(q.id, optIdx)}
                                  className="text-slate-400 hover:text-rose-500 p-1 rounded"
                                  title="Xóa phương án này"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleAddOption(q.id)}
                          className="text-xs text-blue-600 hover:underline font-bold"
                        >
                          + Thêm phương án lựa chọn
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Giải thích ngắn gọn (Hiển thị khi học sinh xem lại đáp án):
                    </label>
                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => handleUpdateField(q.id, 'explanation', e.target.value)}
                      placeholder="VD: Cạnh hình vuông là 6 cm nên chu vi = 6 x 4 = 24 cm."
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-hidden bg-slate-50/30"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Question Confirmation Modal */}
      {questionToDelete !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center text-xl font-bold">
              🗑️
            </div>
            <h3 className="text-base font-bold text-slate-900">Xóa câu hỏi #{questionToDelete}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thầy/Cô có chắc chắn muốn xóa câu hỏi này khỏi đề thi không?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setQuestionToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                HỦY BỎ
              </button>
              <button
                onClick={confirmDeleteQuestion}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
              >
                XÓA CÂU HỎI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imageModalUrl && (
        <div
          className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModalUrl(null)}
        >
          <div className="bg-white rounded-2xl p-4 max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-sm text-slate-800">Hình ảnh câu hỏi</span>
              <button
                onClick={() => setImageModalUrl(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={imageModalUrl}
              alt="Zoomed"
              className="max-h-[70vh] object-contain rounded-lg border border-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};
