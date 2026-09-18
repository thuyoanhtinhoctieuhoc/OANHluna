import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { UploadSection } from './components/UploadSection';
import { QuestionEditor } from './components/QuestionEditor';
import { ExportConfigView } from './components/ExportConfigView';
import { ExamPlayer } from './components/ExamPlayer';
import { ExamLibrary } from './components/ExamLibrary';
import { Exam, Question, ExamConfig } from './types';
import { sampleExams } from './data/sampleExams';

const STORAGE_KEY = 'ai_exam_creator_saved_exams_v2';
const DEFAULT_TEACHER = 'Cô Oanh Happi';
const DEFAULT_SCHOOL = 'Tiểu học Chi Lăng';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload');
  const [savedExams, setSavedExams] = useState<Exam[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('ai_exam_creator_saved_exams_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((e: Exam) => ({
            ...e,
            config: {
              ...e.config,
              teacherName: (!e.config.teacherName || ['Cô Nguyễn Thị Mai', 'Thầy Trần Văn An', 'Ms. Mai Anh', 'Giáo viên', 'Giáo viên tiểu học'].includes(e.config.teacherName)) 
                ? DEFAULT_TEACHER 
                : e.config.teacherName,
              schoolName: (!e.config.schoolName || ['Trường Tiểu học Chu Văn An', 'Trường Tiểu học Thăng Long', 'Trường Tiểu học Hoa Sen', 'Trường Tiểu học'].includes(e.config.schoolName)) 
                ? DEFAULT_SCHOOL 
                : e.config.schoolName,
            }
          }));
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc dữ liệu localStorage:', e);
    }
    return sampleExams;
  });

  const [currentExam, setCurrentExam] = useState<Exam>(() => {
    return sampleExams[0] || {
      id: 'default_exam',
      title: 'Đề kiểm tra trắc nghiệm',
      subject: 'Toán học',
      grade: 'Lớp 4',
      topic: 'Luyện tập chung',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [],
      config: {
        title: 'Đề kiểm tra trắc nghiệm',
        teacherName: 'Cô Oanh Happi',
        schoolName: 'Tiểu học Chi Lăng',
        subject: 'Toán học',
        grade: 'Lớp 4',
        durationMinutes: 15,
        maxAttempts: 'unlimited',
        mode: 'exam',
        showAnswersAfterSubmit: true,
        allowReview: true,
        shuffleQuestions: false,
        shuffleOptions: false,
        enableLocalStorage: true,
      },
    };
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync saved exams to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedExams));
    } catch (e) {
      console.warn('Lỗi ghi dữ liệu localStorage:', e);
    }
  }, [savedExams]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExamGenerated = (data: {
    title: string;
    subject: string;
    grade: string;
    topic?: string;
    questions: Question[];
  }) => {
    const newExam: Exam = {
      id: 'exam_' + Date.now(),
      title: data.title,
      subject: data.subject,
      grade: data.grade,
      topic: data.topic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: data.questions,
      config: {
        title: data.title,
        teacherName: currentExam.config.teacherName || 'Cô Oanh Happi',
        schoolName: currentExam.config.schoolName || 'Tiểu học Chi Lăng',
        subject: data.subject,
        grade: data.grade,
        durationMinutes: 15,
        maxAttempts: 'unlimited',
        mode: 'exam',
        showAnswersAfterSubmit: true,
        allowReview: true,
        shuffleQuestions: false,
        shuffleOptions: false,
        enableLocalStorage: true,
      },
    };

    setCurrentExam(newExam);
    setSavedExams((prev) => [newExam, ...prev.filter((e) => e.id !== newExam.id)]);
    setActiveTab('editor');
    showToast(`AI đã nhận diện thành công ${data.questions.length} câu hỏi! Chuyển sang bước kiểm tra.`);
  };

  const handleLoadSample = (sample: Exam) => {
    setCurrentExam({ ...sample, id: 'exam_' + Date.now() });
    setActiveTab('editor');
    showToast(`Đã nạp đề mẫu: "${sample.title}" (${sample.questions.length} câu hỏi)`);
  };

  const handleUpdateQuestions = (newQuestions: Question[]) => {
    setCurrentExam((prev) => ({
      ...prev,
      questions: newQuestions,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateConfig = (newConfig: ExamConfig) => {
    setCurrentExam((prev) => ({
      ...prev,
      title: newConfig.title,
      subject: newConfig.subject,
      grade: newConfig.grade,
      config: newConfig,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSaveToLibrary = () => {
    setSavedExams((prev) => {
      const exists = prev.some((e) => e.id === currentExam.id);
      if (exists) {
        return prev.map((e) => (e.id === currentExam.id ? currentExam : e));
      }
      return [currentExam, ...prev];
    });
    showToast('Đã lưu bài thi vào Thư viện thành công!');
  };

  const handleOpenFromLibrary = (exam: Exam) => {
    setCurrentExam(exam);
    setActiveTab('play');
  };

  const handleEditFromLibrary = (exam: Exam) => {
    setCurrentExam(exam);
    setActiveTab('editor');
  };

  const handleDuplicateFromLibrary = (exam: Exam) => {
    const duplicated: Exam = {
      ...exam,
      id: 'exam_' + Date.now(),
      title: `${exam.title} (Bản sao)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: {
        ...exam.config,
        title: `${exam.config.title} (Bản sao)`,
      },
    };
    setSavedExams((prev) => [duplicated, ...prev]);
    showToast(`Đã tạo bản sao bài thi: "${duplicated.title}"`);
  };

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ id: string; title: string } | null>(null);

  const handleDeleteFromLibrary = (id: string) => {
    const target = savedExams.find((e) => e.id === id);
    setDeleteConfirmModal({ id, title: target?.title || 'bài thi này' });
  };

  const confirmDeleteExam = () => {
    if (deleteConfirmModal) {
      setSavedExams((prev) => prev.filter((e) => e.id !== deleteConfirmModal.id));
      showToast('Đã xóa bài thi.');
      setDeleteConfirmModal(null);
    }
  };

  const handleCreateNew = () => {
    setActiveTab('upload');
  };

  const unverifiedCount = currentExam.questions.filter((q) => q.aiProposed && !q.verified).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 font-sans">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Delete Exam Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center text-xl font-bold">
              🗑️
            </div>
            <h3 className="text-base font-bold text-slate-900">Xác nhận xóa bài thi</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thầy/Cô có chắc chắn muốn xóa bài thi{' '}
              <strong className="text-slate-800">"{deleteConfirmModal.title}"</strong> khỏi thư viện?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                HỦY BỎ
              </button>
              <button
                onClick={confirmDeleteExam}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
              >
                XÓA BÀI THI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        questionsCount={currentExam.questions.length}
        unverifiedCount={unverifiedCount}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'upload' && (
          <UploadSection
            onExamGenerated={handleExamGenerated}
            onLoadSample={handleLoadSample}
          />
        )}

        {activeTab === 'editor' && (
          <QuestionEditor
            questions={currentExam.questions}
            onUpdateQuestions={handleUpdateQuestions}
            onConfirmExam={() => {
              handleSaveToLibrary();
              setActiveTab('config');
            }}
            examTitle={currentExam.title}
            onUpdateTitle={(title) => {
              setCurrentExam((p) => ({
                ...p,
                title,
                config: { ...p.config, title },
              }));
            }}
            examSubject={currentExam.subject}
            onUpdateSubject={(subject) => {
              setCurrentExam((p) => ({
                ...p,
                subject,
                config: { ...p.config, subject },
              }));
            }}
            examGrade={currentExam.grade}
            onUpdateGrade={(grade) => {
              setCurrentExam((p) => ({
                ...p,
                grade,
                config: { ...p.config, grade },
              }));
            }}
          />
        )}

        {activeTab === 'config' && (
          <ExportConfigView
            exam={currentExam}
            onUpdateConfig={handleUpdateConfig}
            onLaunchTest={() => setActiveTab('play')}
            onSaveToLibrary={handleSaveToLibrary}
          />
        )}

        {activeTab === 'play' && (
          <ExamPlayer
            exam={currentExam}
            onExit={() => setActiveTab('config')}
          />
        )}

        {activeTab === 'library' && (
          <ExamLibrary
            exams={savedExams}
            onOpenExam={handleOpenFromLibrary}
            onEditExam={handleEditFromLibrary}
            onDuplicateExam={handleDuplicateFromLibrary}
            onDeleteExam={handleDeleteFromLibrary}
            onCreateNew={handleCreateNew}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p className="font-semibold">
            🏆 AI Tạo Bài Thi Trắc Nghiệm Offline • Thiết kế chuyên biệt cho Giáo dục Tiểu học
          </p>
          <p>
            Chạy 100% Offline • Nhúng sẵn ảnh Base64 • Không cần cài đặt máy chủ
          </p>
        </div>
      </footer>
    </div>
  );
}
