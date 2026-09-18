import React, { useState } from 'react';
import { 
  Settings, Download, PlayCircle, CheckCircle, AlertTriangle, 
  Clock, Shuffle, RotateCcw, ShieldCheck, FileCheck, Copy
} from 'lucide-react';
import { Exam, ExamConfig } from '../types';
import { validateExamBeforeExport } from '../utils/validator';
import { generateOfflineHtml } from '../utils/exportHtml';

interface ExportConfigViewProps {
  exam: Exam;
  onUpdateConfig: (config: ExamConfig) => void;
  onLaunchTest: () => void;
  onSaveToLibrary: () => void;
}

export const ExportConfigView: React.FC<ExportConfigViewProps> = ({
  exam,
  onUpdateConfig,
  onLaunchTest,
  onSaveToLibrary,
}) => {
  const config = exam.config;
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(config.durationMinutes || 15);

  const report = validateExamBeforeExport(exam);

  const handleChange = <K extends keyof ExamConfig>(key: K, value: ExamConfig[K]) => {
    onUpdateConfig({ ...config, [key]: value });
  };

  const handleDownloadOfflineHtml = () => {
    try {
      const htmlContent = generateOfflineHtml(exam);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      // Clean safe filename
      const safeTitle = (exam.title || 'bai-thi-trac-nghiem')
        .toLowerCase()
        .replace(/[^a-z0-9\u00C0-\u024F\u1EA0-\u1EF9]/gi, '-')
        .replace(/-+/g, '-')
        .slice(0, 40);

      link.href = url;
      link.download = `${safeTitle || 'bai-thi'}-offline.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setDownloadSuccess(true);
      onSaveToLibrary();
      setTimeout(() => setDownloadSuccess(false), 6000);
    } catch (err) {
      console.warn('Download error:', err);
    }
  };

  const handleCopyHtml = async () => {
    try {
      const htmlContent = generateOfflineHtml(exam);
      await navigator.clipboard.writeText(htmlContent);
      setCopiedHtml(true);
      onSaveToLibrary();
      setTimeout(() => setCopiedHtml(false), 4000);
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
            <Settings className="w-3.5 h-3.5" />
            Cấu hình bài thi & Đóng gói Offline
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {exam.title || 'Đề kiểm tra trắc nghiệm'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {exam.subject} • {exam.grade} • Tổng số: <strong>{exam.questions.length} câu hỏi</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onLaunchTest}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Thi thử trực tiếp</span>
          </button>

          <button
            onClick={handleCopyHtml}
            title="Sao chép toàn bộ mã HTML vào bộ nhớ tạm"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-300 shadow-xs transition-all"
          >
            <Copy className="w-4 h-4 text-slate-500" />
            <span>Sao chép mã HTML</span>
          </button>

          <button
            onClick={handleDownloadOfflineHtml}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>📦 XUẤT HTML OFFLINE</span>
          </button>
        </div>
      </div>

      {copiedHtml && (
        <div className="bg-blue-50 border border-blue-300 rounded-xl p-4 flex items-center gap-3 text-blue-900 text-sm shadow-xs animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <strong>Đã sao chép toàn bộ mã HTML vào bộ nhớ tạm!</strong> Thầy/Cô có thể dán vào tệp <code>.html</code> hoặc gửi mã qua Zalo, Email cho học sinh.
          </div>
        </div>
      )}

      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center gap-3 text-emerald-900 text-sm shadow-xs animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <strong>Đã xuất file HTML thành công!</strong> Tệp <code>bai-thi-offline.html</code> đã được lưu về máy tính. 
            Thầy/Cô chỉ cần <strong>nhấp đúp chuột</strong> vào file là học sinh có thể làm bài ngay lập tức mà không cần kết nối mạng.
          </div>
        </div>
      )}

      {/* Main Grid: Config (Left 2 cols) + Checklist (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form options */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. General Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              1. Thông tin hiển thị trên đề thi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tên bài thi</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full text-sm font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tên giáo viên</label>
                <input
                  type="text"
                  value={config.teacherName}
                  onChange={(e) => handleChange('teacherName', e.target.value)}
                  placeholder="VD: Cô Oanh Happi"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Trường học</label>
                <input
                  type="text"
                  value={config.schoolName || ''}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  placeholder="VD: Tiểu học Chi Lăng"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Môn học & Khối lớp</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    className="w-1/2 text-sm px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-hidden"
                  />
                  <input
                    type="text"
                    value={config.grade}
                    onChange={(e) => handleChange('grade', e.target.value)}
                    className="w-1/2 text-sm px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Exam Rules & Timer */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              2. Chế độ làm bài & Thời gian
            </h3>

            <div className="space-y-4">
              {/* Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Chế độ bài thi</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    config.mode === 'practice'
                      ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-400'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="examMode"
                      checked={config.mode === 'practice'}
                      onChange={() => handleChange('mode', 'practice')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900">🎯 Chế độ Luyện tập</div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sau khi chọn đáp án, hệ thống báo đúng/sai ngay lập tức và hiển thị giải thích chi tiết.
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    config.mode === 'exam'
                      ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-400'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="examMode"
                      checked={config.mode === 'exam'}
                      onChange={() => handleChange('mode', 'exam')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900">⏱️ Chế độ Thi chính thức</div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ẩn kết quả đúng/sai trong suốt quá trình làm bài. Chỉ chấm điểm và xem giải thích sau khi bấm Nộp bài.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Timer options */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Thời gian làm bài</label>
                <div className="flex flex-wrap gap-2">
                  {[0, 5, 10, 15, 20, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        handleChange('durationMinutes', mins);
                        setCustomMinutes(mins);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        config.durationMinutes === mins
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {mins === 0 ? 'Không giới hạn' : `${mins} phút`}
                    </button>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={customMinutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setCustomMinutes(val);
                        handleChange('durationMinutes', val);
                      }}
                      className="w-16 text-xs px-2 py-1.5 rounded-lg border border-slate-300 text-center"
                    />
                    <span className="text-xs text-slate-500 font-semibold">phút</span>
                  </div>
                </div>
              </div>

              {/* Attempts */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Số lần làm bài</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="attempts"
                      checked={config.maxAttempts === 'unlimited'}
                      onChange={() => handleChange('maxAttempts', 'unlimited')}
                    />
                    Không giới hạn (làm lại thoải mái)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="attempts"
                      checked={config.maxAttempts === 'one'}
                      onChange={() => handleChange('maxAttempts', 'one')}
                    />
                    1 lần duy nhất
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Shuffling and Persistence */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-blue-600" />
              3. Tùy chọn trộn đề & Khôi phục
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={config.shuffleQuestions}
                  onChange={(e) => handleChange('shuffleQuestions', e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Trộn thứ tự câu hỏi khi mở bài thi</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={config.shuffleOptions}
                  onChange={(e) => handleChange('shuffleOptions', e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Trộn thứ tự phương án A/B/C/D</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={config.showAnswersAfterSubmit}
                  onChange={(e) => handleChange('showAnswersAfterSubmit', e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Hiện đáp án sau khi nộp bài</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={config.allowReview}
                  onChange={(e) => handleChange('allowReview', e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Cho phép xem lại chi tiết từng câu</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer p-2 rounded-lg hover:bg-slate-50 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={config.enableLocalStorage}
                  onChange={(e) => handleChange('enableLocalStorage', e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Chống mất dữ liệu (Tự động lưu vào máy, khôi phục nếu học sinh vô tình tải lại trang)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Pre-export Verification Checklist */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Kiểm tra trước khi xuất HTML
              </span>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Chuẩn Offline
              </span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {report.items.map((item) => (
                <div key={item.id} className="flex items-start gap-2">
                  <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${item.passed ? 'text-emerald-500' : 'text-rose-500'}`} />
                  <div>
                    <p className={`font-bold ${item.passed ? 'text-slate-800' : 'text-rose-700'}`}>
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {report.unverifiedCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Còn {report.unverifiedCount} câu chưa kiểm tra
                </div>
                Thầy/Cô vẫn có thể xuất bài, nhưng nên duyệt đáp án trước để đảm bảo bài thi chuẩn xác nhất cho học sinh.
              </div>
            )}

            {/* Big Download Button */}
            <div className="pt-2">
              <button
                onClick={handleDownloadOfflineHtml}
                className="w-full py-4 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-200 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-5 h-5" />
                <span>XUẤT BÀI THI HTML OFFLINE</span>
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
                Tạo 1 file duy nhất <code>bai-thi.html</code> chạy ngay khi nhấp đúp
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
