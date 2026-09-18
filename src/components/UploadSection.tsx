import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, FileSpreadsheet, Image as ImageIcon, 
  Trash2, Sparkles, CheckCircle2, AlertTriangle, RefreshCw, FileUp, BookOpen
} from 'lucide-react';
import { UploadedFileItem, Question, Exam } from '../types';
import { sampleExams } from '../data/sampleExams';

interface UploadSectionProps {
  onExamGenerated: (data: {
    title: string;
    subject: string;
    grade: string;
    topic?: string;
    questions: Question[];
  }) => void;
  onLoadSample: (sample: Exam) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onExamGenerated,
  onLoadSample,
}) => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Lớp 4');
  const [selectedSubject, setSelectedSubject] = useState('Toán học');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (fileList: File[]) => {
    setErrorMessage(null);
    const validExtensions = ['.docx', '.pdf', '.png', '.jpg', '.jpeg', '.webp'];

    fileList.forEach((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!validExtensions.includes(ext)) {
        setErrorMessage(`Tệp "${file.name}" không thuộc định dạng được hỗ trợ (.docx, .pdf, .png, .jpg, .jpeg, .webp).`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        const newItem: UploadedFileItem = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          type: file.type || ext,
          base64Data: base64Data,
          previewUrl: file.type.startsWith('image/') ? base64Data : undefined,
        };

        setFiles((prev) => [...prev, newItem]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleAnalyze = async () => {
    if (files.length === 0 && !pastedText.trim()) {
      setErrorMessage('Vui lòng tải lên ít nhất một tài liệu hoặc dán nội dung câu hỏi vào khung văn bản.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      setAnalysisStep('Đang chuẩn bị và nạp tài liệu...');
      await new Promise((r) => setTimeout(r, 400));

      setAnalysisStep('AI đang đọc nội dung tài liệu & OCR hình ảnh...');
      
      const payload = {
        files: files.map((f) => ({
          name: f.name,
          mimeType: f.type,
          base64Data: f.base64Data || '',
        })),
        pastedText: pastedText,
        gradeHint: selectedGrade,
        subjectHint: selectedSubject,
      };

      const res = await fetch('/api/analyze-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setAnalysisStep('Đang nhận diện câu hỏi, phương án & đối chiếu đáp án...');

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Phân tích thất bại');
      }

      setAnalysisStep('Hoàn tất! Đang chuyển sang màn hình kiểm tra câu hỏi...');
      await new Promise((r) => setTimeout(r, 500));

      if (json.data && json.data.questions) {
        onExamGenerated({
          title: json.data.title || 'Đề kiểm tra trắc nghiệm',
          subject: json.data.subject || selectedSubject,
          grade: json.data.grade || selectedGrade,
          topic: json.data.topic || '',
          questions: json.data.questions,
        });
      } else {
        throw new Error('Không nhận diện được câu hỏi nào từ tài liệu.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Có lỗi xảy ra khi phân tích tài liệu.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold text-amber-300 mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            AI Chuyên gia Giáo dục Tiểu học
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Tạo Bài Thi Trắc Nghiệm Tự Động & Xuất HTML Offline
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Giáo viên chỉ cần tải lên file Word, PDF, hình ảnh chụp đề thi hoặc dán nội dung.
            AI giữ nguyên 100% câu từ gốc, tự động bóc tách đáp án, nhúng hình minh họa và xuất file HTML chạy offline không cần Internet.
          </p>
        </div>

        {/* Decorative bg element */}
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-8 translate-y-8 pointer-events-none">
          <FileSpreadsheet className="w-72 h-72" />
        </div>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upload Area */}
        <div className="lg:col-span-2 space-y-5">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-blue-600 bg-blue-50/80 scale-[0.99]'
                : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/70 shadow-xs'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".docx,.pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-4 shadow-inner">
              <FileUp className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              📂 KÉO THẢ TÀI LIỆU VÀO ĐÂY
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              hoặc <span className="text-blue-600 font-bold hover:underline">bấm để chọn file</span> từ máy tính (chọn được nhiều file cùng lúc)
            </p>

            <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-slate-500 font-semibold">
              <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">Word (.docx)</span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">PDF (.pdf)</span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">Ảnh (.png, .jpg, .webp)</span>
            </div>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tài liệu đã chọn ({files.length})
                </span>
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Xóa tất cả
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {file.previewUrl ? (
                        <img
                          src={file.previewUrl}
                          alt="preview"
                          className="w-10 h-10 rounded object-cover border border-slate-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          {file.name.split('.').pop()?.toUpperCase()}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Xóa tệp"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text Paste Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Hoặc dán trực tiếp nội dung đề thi / câu hỏi vào đây:
              </label>
              <button
                type="button"
                onClick={() => {
                  setSelectedSubject('Tiếng Anh');
                  setSelectedGrade('Lớp 4');
                  setPastedText(`"Hello, my name is Linh. I am a pupil at Hoa Sen Primary School. My school is in a quiet village. It has three big buildings and a large playground. Today is Wednesday, so I have English, Maths, and Science. My favourite subject is English because I want to talk with foreign friends. Yesterday was Tuesday, and I was at the school library with my classmates. We read many interesting books there."

21. Where is Linh's school?
A. In a big city
B. In a quiet village
C. In the mountains
D. Near the beach

22. How many big buildings does her school have?
A. Two
B. Three
C. Four
D. Five

23. What subjects does Linh have on Wednesdays?
A. English, Art, and Music
B. Maths, Science, and IT
C. English, Maths, and Science
D. English and History

24. Why does Linh like English?
A. Because she wants to be a teacher
B. Because she wants to talk with foreign friends
C. Because it is easy
D. Because she likes drawing

25. Where was Linh yesterday?
A. At the campsite
B. On the beach
C. At the school library
D. At home`);
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Dán đề đọc hiểu mẫu (Linh’s School)</span>
              </button>
            </div>
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder={`Ví dụ dạng đọc đoạn văn rồi trả lời:
"Hello, my name is Linh. I am a pupil at Hoa Sen Primary School..."
21. Where is Linh's school?
A. In a big city
B. In a quiet village
C. In the mountains
D. Near the beach`}
              className="w-full text-sm p-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden font-mono bg-slate-50/50"
            />
          </div>
        </div>

        {/* Right 1 Col: Hints & Action */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Thông tin gợi ý cho AI
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Môn học</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white focus:border-blue-500 outline-hidden"
              >
                <option value="Toán học">Toán học</option>
                <option value="Tiếng Việt">Tiếng Việt</option>
                <option value="Khoa học">Khoa học</option>
                <option value="Lịch sử & Địa lý">Lịch sử & Địa lý</option>
                <option value="Tự nhiên và Xã hội">Tự nhiên và Xã hội</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="Tin học">Tin học</option>
                <option value="Đạo đức">Đạo đức</option>
                <option value="Khác">Môn học khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Khối lớp tiểu học</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white focus:border-blue-500 outline-hidden"
              >
                <option value="Lớp 1">Lớp 1</option>
                <option value="Lớp 2">Lớp 2</option>
                <option value="Lớp 3">Lớp 3</option>
                <option value="Lớp 4">Lớp 4</option>
                <option value="Lớp 5">Lớp 5</option>
              </select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Nguyên tắc cam kết:
              </div>
              <p>• Không tự ý thay đổi nội dung câu hỏi của giáo viên.</p>
              <p>• Nếu tài liệu không có đáp án, AI sẽ đề xuất đáp án và dán nhãn để giáo viên kiểm tra.</p>
              <p>• Hình ảnh được lưu dạng Base64 đảm bảo 100% xem offline.</p>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 space-y-2">
                <div className="font-medium">{errorMessage}</div>
                {files.length === 0 && !pastedText.trim() && (
                  <button
                    type="button"
                    onClick={() => onLoadSample(sampleExams[0])}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                  >
                    👉 Hoặc bấm vào đây để nạp đề mẫu thử nghiệm ngay!
                  </button>
                )}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (files.length === 0 && !pastedText.trim())}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                isAnalyzing
                  ? 'bg-blue-400 text-white cursor-wait'
                  : files.length === 0 && !pastedText.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý dữ liệu...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI ĐỌC & PHÂN TÍCH TÀI LIỆU</span>
                </>
              )}
            </button>

            {isAnalyzing && (
              <div className="text-center">
                <p className="text-xs font-semibold text-blue-700 animate-pulse">{analysisStep}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
