import React from 'react';
import { Award, FileText, CheckSquare, Settings, PlayCircle, BookOpen } from 'lucide-react';

export type ActiveTab = 'upload' | 'editor' | 'config' | 'play' | 'library';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  questionsCount: number;
  unverifiedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  questionsCount,
  unverifiedCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & App Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer flex-shrink-0"
            onClick={() => setActiveTab('upload')}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-sm shadow-amber-200">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>AI TẠO BÀI THI TRẮC NGHIỆM</span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-1.5 py-0.5 rounded">
                  OFFLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Dành cho giáo viên & học sinh tiểu học</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Tải tài liệu</span>
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap relative ${
                activeTab === 'editor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Kiểm tra câu hỏi</span>
              {questionsCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'editor' ? 'bg-white text-blue-700' : 'bg-slate-200 text-slate-700'
                }`}>
                  {questionsCount}
                </span>
              )}
              {unverifiedCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5 animate-pulse" title={`${unverifiedCount} câu cần giáo viên kiểm tra`} />
              )}
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'config'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Cấu hình & Xuất HTML</span>
            </button>

            <button
              onClick={() => setActiveTab('play')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'play'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>Thi thử</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'library'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Bài thi đã tạo</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
