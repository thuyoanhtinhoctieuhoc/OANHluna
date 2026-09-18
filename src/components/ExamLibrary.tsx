import React from 'react';
import { 
  BookOpen, PlayCircle, Edit, Copy, Trash2, Download, 
  Calendar, Layers, FileQuestion, Plus
} from 'lucide-react';
import { Exam } from '../types';
import { generateOfflineHtml } from '../utils/exportHtml';

interface ExamLibraryProps {
  exams: Exam[];
  onOpenExam: (exam: Exam) => void;
  onEditExam: (exam: Exam) => void;
  onDuplicateExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
  onCreateNew: () => void;
}

export const ExamLibrary: React.FC<ExamLibraryProps> = ({
  exams,
  onOpenExam,
  onEditExam,
  onDuplicateExam,
  onDeleteExam,
  onCreateNew,
}) => {
  const handleExportHtml = (exam: Exam, e: React.MouseEvent) => {
    e.stopPropagation();
    const htmlContent = generateOfflineHtml(exam);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const safeTitle = (exam.title || 'bai-thi')
      .toLowerCase()
      .replace(/[^a-z0-9\u00C0-\u024F\u1EA0-\u1EF9]/gi, '-')
      .replace(/-+/g, '-')
      .slice(0, 40);

    link.href = url;
    link.download = `${safeTitle}-offline.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Thư viện lưu trữ
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            📚 BÀI THI ĐÃ TẠO ({exams.length})
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Các bài kiểm tra đã lưu trên trình duyệt, sẵn sàng thi thử hoặc xuất file HTML offline bất cứ lúc nào.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo bài thi mới</span>
        </button>
      </div>

      {/* Exam Grid */}
      {exams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Chưa có bài thi nào được lưu</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Hãy tải tài liệu ở mục "Tải tài liệu" để AI tự động tạo bài thi hoặc nạp dữ liệu mẫu để bắt đầu.
          </p>
          <button
            onClick={onCreateNew}
            className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" /> Bắt đầu tạo bài
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((item) => {
            const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Mới tạo';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  {/* Subject and Grade Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                      {item.subject}
                    </span>
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {item.grade}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-base text-slate-900 line-clamp-2 hover:text-blue-600 cursor-pointer" onClick={() => onOpenExam(item)}>
                    {item.title}
                  </h3>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.questions.length} câu hỏi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dateStr}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenExam(item)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-all"
                      title="Thi thử bài này"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Mở thi</span>
                    </button>

                    <button
                      onClick={() => onEditExam(item)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-200 border border-slate-200 px-2 py-1.5 rounded-lg transition-all"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicateExam(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
                      title="Nhân bản / Sao chép"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleExportHtml(item, e)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50"
                      title="Xuất file HTML offline"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteExam(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Xóa bài thi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
