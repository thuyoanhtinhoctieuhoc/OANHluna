import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, Clock, ChevronLeft, ChevronRight, CheckCircle2, 
  XCircle, AlertCircle, RotateCcw, FileText, ArrowLeft, Send, BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Exam, Question } from '../types';

interface ExamPlayerProps {
  exam: Exam;
  onExit: () => void;
}

type PlayerPhase = 'start' | 'quiz' | 'result' | 'review';

export const ExamPlayer: React.FC<ExamPlayerProps> = ({ exam, onExit }) => {
  const [phase, setPhase] = useState<PlayerPhase>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<number, any>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  const timerRef = useRef<any>(null);

  // Initialize questions
  useEffect(() => {
    let list = JSON.parse(JSON.stringify(exam.questions || []));

    if (exam.config.shuffleQuestions) {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
    }

    if (exam.config.shuffleOptions) {
      list.forEach((q: Question) => {
        if (q.options && q.options.length > 1 && q.type === 'single') {
          const cIdx = typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < q.options.length ? q.correctAnswer : 0;
          const correctOpt = q.options[cIdx];
          for (let i = q.options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
          }
          const newIndex = q.options.indexOf(correctOpt);
          q.correctAnswer = newIndex >= 0 ? newIndex : 0;
        }
      });
    }

    setShuffledQuestions(list);
  }, [exam]);

  // Handle timer
  useEffect(() => {
    if (phase === 'quiz' && exam.config.durationMinutes > 0 && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleFinalSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, remainingSeconds]);

  const startExam = () => {
    setStudentAnswers({});
    setCurrentIndex(0);
    setStartTime(Date.now());
    if (exam.config.durationMinutes > 0) {
      setRemainingSeconds(exam.config.durationMinutes * 60);
    }
    setPhase('quiz');
  };

  const handleSelectOption = (optIndex: number) => {
    const q = shuffledQuestions[currentIndex];
    if (!q) return;

    if (q.type === 'multiple') {
      let currentArr = studentAnswers[currentIndex] || [];
      if (!Array.isArray(currentArr)) currentArr = [currentArr];
      if (currentArr.includes(optIndex)) {
        currentArr = currentArr.filter((i: number) => i !== optIndex);
      } else {
        currentArr.push(optIndex);
      }
      setStudentAnswers({ ...studentAnswers, [currentIndex]: currentArr });
    } else {
      setStudentAnswers({ ...studentAnswers, [currentIndex]: optIndex });
    }
  };

  const handleAddWordToSentence = (wordIdx: number) => {
    let currentArr = studentAnswers[currentIndex] || [];
    if (!Array.isArray(currentArr)) currentArr = [];
    if (!currentArr.includes(wordIdx)) {
      setStudentAnswers({ ...studentAnswers, [currentIndex]: [...currentArr, wordIdx] });
    }
  };

  const handleRemoveWordFromSentence = (posInSentence: number) => {
    let currentArr = studentAnswers[currentIndex] || [];
    if (!Array.isArray(currentArr)) return;
    const nextArr = currentArr.filter((_: any, idx: number) => idx !== posInSentence);
    setStudentAnswers({ ...studentAnswers, [currentIndex]: nextArr });
  };

  const handleResetSentence = () => {
    setStudentAnswers({ ...studentAnswers, [currentIndex]: [] });
  };

  const handleFinalSubmit = () => {
    setIsSubmitModalOpen(false);
    clearInterval(timerRef.current);
    setEndTime(Date.now());
    setPhase('result');

    // Confetti on result with safety catch
    setTimeout(() => {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.warn('Confetti blocked or unavailable:', err);
      }
    }, 200);
  };

  // Calculate scores
  const total = shuffledQuestions.length;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  shuffledQuestions.forEach((q, idx) => {
    const ans = studentAnswers[idx];
    if (ans === undefined || (Array.isArray(ans) && ans.length === 0)) {
      skippedCount++;
    } else {
      let isCorrect = false;
      if (q.type === 'word_reorder') {
        const studentIndices = Array.isArray(ans) ? ans : [];
        const studentWords = studentIndices.map((i: number) => q.options[i]).filter(Boolean);
        const studentSentence = studentWords.join(' ').replace(/\s+([.,!?:;])/g, '$1').trim().toLowerCase();
        const targetSentence = (q.correctSentence || (Array.isArray(q.correctOrder) ? q.correctOrder.join(' ') : '')).replace(/\s+([.,!?:;])/g, '$1').trim().toLowerCase();
        isCorrect = studentWords.length > 0 && studentSentence === targetSentence;
      } else if (Array.isArray(q.correctAnswer)) {
        const sArr = Array.isArray(ans) ? [...ans].sort() : [ans];
        const cArr = [...q.correctAnswer].sort();
        isCorrect = JSON.stringify(sArr) === JSON.stringify(cArr);
      } else {
        isCorrect = ans === q.correctAnswer;
      }
      if (isCorrect) correctCount++;
      else wrongCount++;
    }
  });

  const finalScore10 = total > 0 ? ((correctCount / total) * 10).toFixed(1) : '0';

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const currentQ = shuffledQuestions[currentIndex];
  const isPractice = exam.config.mode === 'practice';
  const hasAnsweredCurrent = studentAnswers[currentIndex] !== undefined;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Thoát chế độ thi</span>
        </button>

        <div className="flex items-center gap-3">
          {phase === 'quiz' && exam.config.durationMinutes > 0 && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-sm tabular-nums ${
              remainingSeconds <= 120 ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>
          )}

          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {isPractice ? '🎯 Luyện tập' : '⏱️ Thi chính thức'}
          </span>
        </div>
      </div>

      {/* PHASE 1: START SCREEN */}
      {phase === 'start' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-inner">
            🏆
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              {exam.title || 'Bài thi trắc nghiệm'}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {[exam.config.schoolName, exam.config.teacherName ? `GV: ${exam.config.teacherName}` : ''].filter(Boolean).join(' • ')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto text-left">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Môn học</span>
              <p className="font-extrabold text-slate-800 text-sm mt-0.5">{exam.subject}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Khối lớp</span>
              <p className="font-extrabold text-slate-800 text-sm mt-0.5">{exam.grade}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Số câu</span>
              <p className="font-extrabold text-slate-800 text-sm mt-0.5">{exam.questions.length} câu</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Thời gian</span>
              <p className="font-extrabold text-slate-800 text-sm mt-0.5">
                {exam.config.durationMinutes > 0 ? `${exam.config.durationMinutes} phút` : 'Tự do'}
              </p>
            </div>
          </div>

          <button
            onClick={startExam}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-base sm:text-lg px-8 py-3.5 rounded-2xl shadow-lg shadow-blue-200 transition-all hover:scale-105"
          >
            <span>🚀 BẮT ĐẦU THI</span>
          </button>
        </div>
      )}

      {/* PHASE 2: QUIZ SCREEN */}
      {phase === 'quiz' && currentQ && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-extrabold text-xs tracking-wider">
                CÂU {currentIndex + 1 < 10 ? '0' + (currentIndex + 1) : currentIndex + 1} / {total < 10 ? '0' + total : total}
              </span>
              <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-md">
                {currentQ.type === 'multiple' 
                  ? 'Chọn nhiều phương án' 
                  : currentQ.type === 'word_reorder' 
                  ? '🧩 Sắp xếp từ thành câu' 
                  : currentQ.type === 'reading' || currentQ.readingPassage
                  ? '📖 Đọc hiểu đoạn văn'
                  : 'Chọn 1 phương án đúng'}
              </span>
            </div>

            {/* Reading Passage Card if present */}
            {(currentQ.readingPassage || currentQ.type === 'reading') && (
              <div className="bg-amber-50/70 border-2 border-amber-200/90 rounded-2xl p-5 sm:p-6 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
                  <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-amber-900 uppercase tracking-wide">
                    <BookOpen className="w-4 h-4 text-amber-700" />
                    <span>{currentQ.passageTitle || 'Đoạn văn đọc hiểu (Reading Passage)'}</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    📖 Đọc kỹ đoạn văn
                  </span>
                </div>
                <div className="text-sm sm:text-base leading-relaxed text-slate-800 font-serif whitespace-pre-line bg-white/80 p-4 sm:p-5 rounded-xl border border-amber-100/80">
                  {currentQ.readingPassage}
                </div>
              </div>
            )}

            {/* Question Text */}
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Attached Image */}
            {currentQ.image && (
              <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={currentQ.image}
                  alt="Minh họa"
                  className="max-h-72 mx-auto rounded-lg object-contain shadow-xs"
                />
              </div>
            )}

            {/* Options / Word Reorder Arena */}
            {currentQ.type === 'word_reorder' ? (
              <div className="space-y-6">
                {/* Sentence Assembly Area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>📝 Câu em ghép được:</span>
                    </span>
                    {(studentAnswers[currentIndex] || []).length > 0 && (
                      <button
                        type="button"
                        onClick={handleResetSentence}
                        className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Xếp lại từ đầu</span>
                      </button>
                    )}
                  </div>

                  <div className="min-h-[84px] p-4 bg-blue-50/50 border-2 border-dashed border-blue-300 rounded-2xl flex flex-wrap gap-2.5 items-center transition-all">
                    {(!studentAnswers[currentIndex] || studentAnswers[currentIndex].length === 0) ? (
                      <div className="text-xs sm:text-sm text-blue-500/80 font-medium italic py-2">
                        👉 Hãy bấm vào các thẻ từ bên dưới theo đúng thứ tự để ghép thành câu hoàn chỉnh...
                      </div>
                    ) : (
                      (studentAnswers[currentIndex] as number[]).map((wordIdx: number, pos: number) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => handleRemoveWordFromSentence(pos)}
                          title="Bấm để trả thẻ từ này về kho từ"
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-rose-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-xs transition-all group active:scale-95"
                        >
                          <span className="text-[10px] opacity-75 font-mono">{pos + 1}.</span>
                          <span>{currentQ.options[wordIdx]}</span>
                          <span className="text-[10px] opacity-60 group-hover:opacity-100">✕</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Word Bank Pool */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                    <span>Kho thẻ từ (Bấm vào từ để ghép):</span>
                    <span className="font-normal text-slate-500 text-[11px]">
                      Đã xếp: {(studentAnswers[currentIndex] || []).length}/{currentQ.options.length} từ
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    {currentQ.options.map((word, optIdx) => {
                      const isPlaced = (studentAnswers[currentIndex] || []).includes(optIdx);

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isPlaced}
                          onClick={() => handleAddWordToSentence(optIdx)}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs ${
                            isPlaced
                              ? 'bg-slate-200 text-slate-400 border border-slate-300 opacity-40 cursor-not-allowed scale-95'
                              : 'bg-white text-slate-800 border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 active:scale-95'
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Practice Mode Instant Sentence Feedback */}
                {isPractice && hasAnsweredCurrent && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-xs text-emerald-950 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Đáp án đúng của câu này:</span>
                    </span>
                    <p className="text-sm font-bold text-emerald-900">
                      {currentQ.correctSentence || (Array.isArray(currentQ.correctOrder) ? currentQ.correctOrder.join(' ') : '')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Regular Options */
              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = Array.isArray(studentAnswers[currentIndex])
                    ? studentAnswers[currentIndex]?.includes(optIdx)
                    : studentAnswers[currentIndex] === optIdx;

                  // Practice mode instant feedback
                  let feedbackClass = '';
                  if (isPractice && hasAnsweredCurrent) {
                    const isCorrect = Array.isArray(currentQ.correctAnswer)
                      ? currentQ.correctAnswer.includes(optIdx)
                      : currentQ.correctAnswer === optIdx;

                    if (isCorrect) {
                      feedbackClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (isSelected) {
                      feedbackClass = 'border-rose-500 bg-rose-50 text-rose-900';
                    }
                  } else if (isSelected) {
                    feedbackClass = 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-1 ring-blue-500';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                        feedbackClass || 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs flex-shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {letters[optIdx] || optIdx + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-800 flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Practice Mode Explanation Box */}
            {isPractice && hasAnsweredCurrent && currentQ.explanation && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl text-xs text-emerald-950 space-y-1">
                <span className="font-bold block">💡 Lời giải thích:</span>
                <p>{currentQ.explanation}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>CÂU TRƯỚC</span>
              </button>

              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>📝 NỘP BÀI</span>
              </button>

              <button
                onClick={() => setCurrentIndex((prev) => Math.min(total - 1, prev + 1))}
                disabled={currentIndex === total - 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40"
              >
                <span>CÂU TIẾP THEO</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question Navigator Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-600">
              <span>BẢNG ĐIỀU HƯỚNG CÂU HỎI</span>
              <span>Đã trả lời: {Object.keys(studentAnswers).length}/{total}</span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2">
              {shuffledQuestions.map((_, idx) => {
                const hasAnswer = studentAnswers[idx] !== undefined;
                const isCurrent = idx === currentIndex;

                let btnClass = 'bg-white border-slate-200 text-slate-600';
                if (hasAnswer) btnClass = 'bg-blue-100 border-blue-500 text-blue-800 font-bold';
                if (isCurrent) btnClass = 'bg-slate-900 border-slate-900 text-white font-extrabold scale-105 shadow-xs';

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl border text-xs flex items-center justify-center transition-all ${btnClass}`}
                  >
                    {idx + 1 < 10 ? '0' + (idx + 1) : idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: RESULTS SCREEN */}
      {phase === 'result' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-6">
          <div className="text-5xl">🎉</div>
          <h2 className="text-2xl font-black text-slate-900">HOÀN THÀNH BÀI THI!</h2>
          <p className="text-sm text-slate-500">{exam.title}</p>

          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex flex-col items-center justify-center mx-auto shadow-lg shadow-blue-200">
            <span className="text-3xl font-black">{finalScore10}</span>
            <span className="text-xs font-semibold opacity-80">/ 10 điểm</span>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
              <span className="text-2xl font-black text-emerald-700">{correctCount}</span>
              <p className="text-xs font-bold text-emerald-800 mt-1">Câu đúng</p>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl">
              <span className="text-2xl font-black text-rose-700">{wrongCount}</span>
              <p className="text-xs font-bold text-rose-800 mt-1">Câu sai</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <span className="text-2xl font-black text-slate-600">{skippedCount}</span>
              <p className="text-xs font-bold text-slate-700 mt-1">Chưa làm</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPhase('review')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs"
            >
              🔎 XEM LẠI ĐÁP ÁN
            </button>
            <button
              onClick={startExam}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Làm lại bài thi
            </button>
          </div>
        </div>
      )}

      {/* PHASE 4: REVIEW SCREEN */}
      {phase === 'review' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Chi tiết đáp án từng câu</h3>
            <button
              onClick={() => setPhase('result')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              ← Quay lại kết quả
            </button>
          </div>

          <div className="space-y-6">
            {shuffledQuestions.map((q, idx) => {
              const ans = studentAnswers[idx];
              const isSkipped = ans === undefined || (Array.isArray(ans) && ans.length === 0);

              let isCorrect = false;
              if (!isSkipped) {
                if (Array.isArray(q.correctAnswer)) {
                  const sArr = Array.isArray(ans) ? [...ans].sort() : [ans];
                  const cArr = [...q.correctAnswer].sort();
                  isCorrect = JSON.stringify(sArr) === JSON.stringify(cArr);
                } else {
                  isCorrect = ans === q.correctAnswer;
                }
              }

              return (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">
                      Câu {idx + 1}: {q.question}
                    </span>
                    {isSkipped ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">Chưa làm</span>
                    ) : isCorrect ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">✓ Đúng</span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">✗ Sai</span>
                    )}
                  </div>

                  {q.readingPassage && (
                    <details className="text-xs bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 text-amber-950">
                      <summary className="font-bold cursor-pointer text-amber-900 select-none flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Xem đoạn văn đọc hiểu của câu này</span>
                      </summary>
                      <p className="mt-2 text-slate-800 font-serif whitespace-pre-line leading-relaxed pl-3 border-l-2 border-amber-400">
                        {q.readingPassage}
                      </p>
                    </details>
                  )}

                  {q.image && (
                    <img src={q.image} alt="Minh họa" className="max-h-40 rounded-lg border border-slate-200" />
                  )}

                  <div className="text-xs space-y-1.5 bg-white p-3.5 rounded-lg border border-slate-200">
                    <p>
                      <strong>Đáp án của em:</strong>{' '}
                      <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {isSkipped
                          ? 'Chưa xếp'
                          : q.type === 'word_reorder'
                          ? (Array.isArray(ans) && ans.length > 0
                              ? ans.map((i: number) => q.options[i]).join(' ')
                              : 'Chưa xếp')
                          : Array.isArray(ans)
                          ? ans.map((i: number) => `${letters[i]}. ${q.options[i]}`).join(', ')
                          : `${letters[ans]}. ${q.options[ans]}`}
                      </span>
                    </p>
                    <p>
                      <strong>Đáp án đúng:</strong>{' '}
                      <span className="text-emerald-700 font-bold">
                        {q.type === 'word_reorder'
                          ? (q.correctSentence || (Array.isArray(q.correctOrder) ? q.correctOrder.join(' ') : ''))
                          : Array.isArray(q.correctAnswer)
                          ? q.correctAnswer.map((i: number) => `${letters[i]}. ${q.options[i]}`).join(', ')
                          : `${letters[q.correctAnswer as number]}. ${q.options[q.correctAnswer as number]}`}
                      </span>
                    </p>
                    {q.explanation && (
                      <p className="text-slate-600 pt-1 border-t border-slate-100">
                        <strong>Giải thích:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center text-2xl">
              📝
            </div>
            <h3 className="text-lg font-bold text-slate-900">Xác nhận nộp bài</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Em đã hoàn thành {Object.keys(studentAnswers).length}/{total} câu hỏi.
              {total - Object.keys(studentAnswers).length > 0 && (
                <span className="text-amber-700 block mt-1 font-semibold">
                  (Còn {total - Object.keys(studentAnswers).length} câu chưa trả lời)
                </span>
              )}
              Bạn có chắc chắn muốn nộp bài để xem điểm số không?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                TIẾP TỤC LÀM
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                NỘP BÀI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
