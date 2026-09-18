import { Exam } from '../types';

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates a completely self-contained, single-file HTML document
 * that runs 100% OFFLINE without any Internet, CDN, or server dependency.
 */
export function generateOfflineHtml(exam: Exam): string {
  // Deep clone and clean questions
  const examDataJson = JSON.stringify(exam)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(exam.title)} - Bài thi Trắc nghiệm Offline</title>
  <style>
    :root {
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --primary-light: #eff6ff;
      --success: #16a34a;
      --success-light: #f0fdf4;
      --danger: #dc2626;
      --danger-light: #fef2f2;
      --warning: #d97706;
      --warning-light: #fffbeb;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --bg-page: #f8fafc;
      --bg-card: #ffffff;
      --border: #e2e8f0;
      --radius: 16px;
      --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg-page);
      color: var(--text-main);
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      width: 100%;
      flex: 1;
    }

    header.app-header {
      background: #ffffff;
      border-bottom: 2px solid var(--border);
      padding: 14px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #f1f5f9;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      color: #334155;
    }

    .timer-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 6px 14px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 16px;
      font-variant-numeric: tabular-nums;
    }

    .timer-badge.warning {
      background: #fef2f2;
      color: #991b1b;
      border-color: #fecaca;
      animation: pulse 1s infinite alternate;
    }

    @keyframes pulse {
      from { transform: scale(1); }
      to { transform: scale(1.05); }
    }

    /* Screen Views */
    .screen {
      display: none;
    }
    .screen.active {
      display: block;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Card styling */
    .card {
      background: var(--bg-card);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      padding: 28px;
      margin-bottom: 20px;
    }

    /* Start Screen */
    .start-hero {
      text-align: center;
      padding: 40px 20px;
    }

    .start-icon {
      font-size: 56px;
      margin-bottom: 12px;
      display: inline-block;
    }

    .start-title {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .exam-meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin: 24px 0;
      text-align: left;
    }

    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 14px 16px;
      border-radius: 12px;
    }

    .meta-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      font-weight: 700;
      margin-bottom: 4px;
    }

    .meta-value {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
    }

    /* Question Screen */
    .q-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }

    .q-number-pill {
      background: #e0f2fe;
      color: #0369a1;
      font-size: 14px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 9999px;
      letter-spacing: 0.5px;
    }

    .q-type-pill {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .q-title {
      font-size: 20px;
      font-weight: 700;
      line-height: 1.5;
      color: #0f172a;
      margin-bottom: 20px;
    }

    .q-image-container {
      margin: 16px 0 24px 0;
      text-align: center;
      background: #f8fafc;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .q-image-container img {
      max-width: 100%;
      max-height: 380px;
      border-radius: 8px;
      object-fit: contain;
    }

    .q-image-caption {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 6px;
      font-style: italic;
    }

    /* Options List */
    .options-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .opt-btn {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #ffffff;
      border: 2px solid #e2e8f0;
      padding: 16px 20px;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
      width: 100%;
    }

    .opt-btn:hover:not(:disabled) {
      border-color: #93c5fd;
      background: #f8fafc;
      transform: translateY(-1px);
    }

    .opt-letter {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #f1f5f9;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 15px;
      flex-shrink: 0;
      transition: all 0.15s ease;
    }

    .opt-text {
      flex: 1;
    }

    /* Selected state */
    .opt-btn.selected {
      border-color: var(--primary);
      background: var(--primary-light);
      color: #1e3a8a;
    }

    .opt-btn.selected .opt-letter {
      background: var(--primary);
      color: #ffffff;
    }

    /* Practice Mode Feedback States */
    .opt-btn.correct-feedback {
      border-color: var(--success) !important;
      background: var(--success-light) !important;
      color: #14532d !important;
    }

    .opt-btn.correct-feedback .opt-letter {
      background: var(--success) !important;
      color: #ffffff !important;
    }

    .opt-btn.wrong-feedback {
      border-color: var(--danger) !important;
      background: var(--danger-light) !important;
      color: #7f1d1d !important;
    }

    .opt-btn.wrong-feedback .opt-letter {
      background: var(--danger) !important;
      color: #ffffff !important;
    }

    /* Explanation Box */
    .explanation-box {
      margin-top: 18px;
      padding: 16px 18px;
      border-radius: 12px;
      background: #f0fdf4;
      border-left: 4px solid var(--success);
      font-size: 14px;
      color: #14532d;
      display: none;
    }
    .explanation-box.show {
      display: block;
    }

    /* Reading Passage Styles */
    .reading-passage-box {
      margin-bottom: 20px;
      padding: 16px 20px;
      background: #fefce8;
      border: 2px solid #fef08a;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .reading-passage-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #fef08a;
      font-size: 13px;
      font-weight: 800;
      color: #854d0e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .reading-passage-content {
      font-size: 15px;
      line-height: 1.7;
      font-family: Georgia, Cambria, "Times New Roman", Times, serif;
      color: #1e293b;
      background: rgba(255, 255, 255, 0.85);
      padding: 14px 18px;
      border-radius: 12px;
      border: 1px solid #fef9c3;
      white-space: pre-line;
    }

    /* Word Reorder Styles */
    .word-reorder-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .sentence-zone-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 700;
      color: #334155;
    }

    .sentence-zone {
      min-height: 80px;
      padding: 16px;
      background: #eff6ff;
      border: 2px dashed #93c5fd;
      border-radius: 14px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      transition: all 0.2s;
    }

    .sentence-zone-empty {
      color: #3b82f6;
      font-style: italic;
      font-size: 14px;
      font-weight: 500;
      opacity: 0.8;
    }

    .word-chip-sentence {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #2563eb;
      color: #ffffff;
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
      transition: all 0.15s ease;
      user-select: none;
      border: none;
    }

    .word-chip-sentence:hover {
      background: #dc2626;
      transform: scale(0.98);
    }

    .word-chip-sentence .chip-order {
      font-size: 11px;
      opacity: 0.75;
      font-family: monospace;
    }

    .word-chip-sentence .chip-remove-icon {
      font-size: 11px;
      opacity: 0.7;
    }

    .word-bank-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 700;
      color: #334155;
    }

    .word-bank-zone {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
    }

    .word-chip-bank {
      display: inline-flex;
      align-items: center;
      padding: 10px 16px;
      background: #ffffff;
      border: 2px solid #cbd5e1;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: all 0.15s ease;
      user-select: none;
    }

    .word-chip-bank:hover:not(:disabled) {
      border-color: #2563eb;
      background: #eff6ff;
      color: #1d4ed8;
      transform: translateY(-2px);
    }

    .word-chip-bank:disabled {
      opacity: 0.35;
      background: #e2e8f0;
      border-color: #cbd5e1;
      cursor: not-allowed;
      transform: scale(0.96);
    }

    .btn-reset-sentence {
      background: none;
      border: none;
      color: #dc2626;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
    }

    .btn-reset-sentence:hover {
      background: #fef2f2;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 700;
      padding: 12px 24px;
      border-radius: 12px;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }
    .btn-primary:hover {
      background: var(--primary-hover);
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #334155;
    }
    .btn-secondary:hover {
      background: #e2e8f0;
    }

    .btn-success {
      background: var(--success);
      color: white;
    }
    .btn-success:hover {
      background: #15803d;
    }

    .btn-lg {
      padding: 16px 32px;
      font-size: 18px;
      border-radius: 14px;
    }

    /* Nav Bar Controls */
    .q-footer-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-top: 24px;
    }

    /* Question Navigator Palette */
    .nav-palette {
      margin-top: 24px;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
    }

    .nav-palette-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
    }

    .nav-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
      gap: 8px;
    }

    .nav-dot {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      border: 2px solid #e2e8f0;
      background: #ffffff;
      font-weight: 700;
      font-size: 14px;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .nav-dot:hover {
      border-color: #94a3b8;
    }

    .nav-dot.answered {
      background: #dbeafe;
      border-color: #3b82f6;
      color: #1d4ed8;
    }

    .nav-dot.current {
      background: #1e293b;
      border-color: #1e293b;
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      transform: scale(1.06);
    }

    .palette-legend {
      display: flex;
      gap: 16px;
      margin-top: 14px;
      font-size: 12px;
      color: var(--text-muted);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-badge {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 20px;
    }
    .modal-overlay.open {
      display: flex;
    }

    .modal-content {
      background: white;
      border-radius: 20px;
      max-width: 440px;
      width: 100%;
      padding: 28px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: modalPop 0.2s ease-out;
    }

    @keyframes modalPop {
      from { transform: scale(0.92); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .modal-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .modal-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
    }

    .modal-desc {
      font-size: 15px;
      color: #64748b;
      margin-bottom: 24px;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
    }
    .modal-actions button {
      flex: 1;
    }

    /* Results Screen */
    .result-hero {
      text-align: center;
      padding: 30px 10px;
    }

    .result-score-circle {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px auto;
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.35);
    }

    .score-num {
      font-size: 38px;
      font-weight: 900;
      line-height: 1;
    }

    .score-max {
      font-size: 14px;
      opacity: 0.9;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 24px 0;
    }

    .stat-card {
      padding: 16px;
      border-radius: 14px;
      text-align: center;
    }
    .stat-correct { background: #dcfce7; color: #166534; }
    .stat-wrong { background: #fee2e2; color: #991b1b; }
    .stat-skipped { background: #f1f5f9; color: #475569; }

    .stat-num {
      font-size: 24px;
      font-weight: 800;
    }
    .stat-label {
      font-size: 13px;
      font-weight: 600;
      margin-top: 2px;
    }

    /* Review Screen */
    .review-item {
      border-bottom: 1px solid var(--border);
      padding: 20px 0;
    }
    .review-item:last-child {
      border-bottom: none;
    }

    .review-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .badge-correct { background: #dcfce7; color: #15803d; }
    .badge-wrong { background: #fee2e2; color: #b91c1c; }
    .badge-skipped { background: #f1f5f9; color: #475569; }

    /* Canvas Confetti */
    #confetti-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999;
    }

    @media (max-width: 640px) {
      .card { padding: 18px; }
      .q-title { font-size: 17px; }
      .opt-btn { padding: 12px 14px; font-size: 15px; }
      .stats-row { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <canvas id="confetti-canvas"></canvas>

  <header class="app-header">
    <div class="header-badge">
      <span>🏫</span>
      <span id="header-subject-grade">Bài thi trắc nghiệm</span>
    </div>
    <div id="header-timer" class="timer-badge" style="display: none;">
      <span>⏱️</span>
      <span id="timer-display">--:--</span>
    </div>
    <div id="header-mode-badge" class="header-badge" style="background:#e0f2fe; color:#0284c7;">
      Chế độ thi
    </div>
  </header>

  <div class="container">
    <!-- 1. MÀN HÌNH BẮT ĐẦU -->
    <div id="screen-start" class="screen active">
      <div class="card start-hero">
        <div class="start-icon">🏆</div>
        <h1 class="start-title" id="start-exam-title">Tên bài thi</h1>
        <p style="color: var(--text-muted); font-size: 16px;" id="start-school-teacher">Trường tiểu học</p>

        <div class="exam-meta-grid">
          <div class="meta-box">
            <div class="meta-label">Môn học</div>
            <div class="meta-value" id="start-meta-subject">--</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Khối lớp</div>
            <div class="meta-value" id="start-meta-grade">--</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Số lượng câu</div>
            <div class="meta-value" id="start-meta-count">-- câu</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Thời gian làm bài</div>
            <div class="meta-value" id="start-meta-time">--</div>
          </div>
        </div>

        <div id="restore-notice" style="display: none; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 12px; border-radius: 10px; margin-bottom: 20px; font-size: 14px;">
          💡 <strong>Phát hiện bài làm dở dang:</strong> Hệ thống đã tự động ghi nhớ câu trả lời trước đó của em. Em có thể tiếp tục làm ngay!
        </div>

        <button class="btn btn-primary btn-lg" id="btn-start-exam" onclick="startExam(false)">
          🚀 BẮT ĐẦU THI
        </button>
      </div>
    </div>

    <!-- 2. MÀN HÌNH LÀM BÀI -->
    <div id="screen-quiz" class="screen">
      <div class="card">
        <div class="q-header-bar">
          <span class="q-number-pill" id="current-q-index-pill">CÂU 01 / 20</span>
          <span class="q-type-pill" id="current-q-type-pill">Chọn 1 đáp án đúng</span>
        </div>

        <!-- Reading Passage Container -->
        <div class="reading-passage-box" id="current-q-passage-box" style="display: none;">
          <div class="reading-passage-header">
            <span>📖 <span id="current-q-passage-title">ĐOẠN VĂN ĐỌC HIỂU</span></span>
            <span style="font-size: 11px; text-transform: none; background: #fef08a; padding: 2px 8px; border-radius: 10px; color: #713f12;">Đọc kỹ đoạn văn</span>
          </div>
          <div class="reading-passage-content" id="current-q-passage-text"></div>
        </div>

        <div class="q-title" id="current-q-text">Đang tải câu hỏi...</div>

        <div class="q-image-container" id="current-q-image-box" style="display: none;">
          <img id="current-q-img" src="" alt="Hình minh họa câu hỏi">
          <div class="q-image-caption" id="current-q-caption"></div>
        </div>

        <div class="options-list" id="current-options-container">
          <!-- Options rendered dynamically -->
        </div>

        <div class="explanation-box" id="practice-explanation-box">
          <strong>💡 Giải thích:</strong>
          <span id="practice-explanation-text"></span>
        </div>

        <div class="q-footer-nav">
          <button class="btn btn-secondary" id="btn-prev-q" onclick="goToPrevQuestion()">
            ← CÂU TRƯỚC
          </button>
          <button class="btn btn-success" id="btn-submit-exam" onclick="confirmSubmitExam()">
            📝 NỘP BÀI
          </button>
          <button class="btn btn-primary" id="btn-next-q" onclick="goToNextQuestion()">
            CÂU TIẾP THEO →
          </button>
        </div>
      </div>

      <!-- Bảng số câu hỏi (Navigator) -->
      <div class="nav-palette">
        <div class="nav-palette-title">
          <span>DANH SÁCH CÂU HỎI</span>
          <span id="answered-counter">Đã làm: 0/0</span>
        </div>
        <div class="nav-grid" id="nav-dots-grid">
          <!-- Dot numbers -->
        </div>
        <div class="palette-legend">
          <div class="legend-item"><span class="legend-badge" style="background:#ffffff; border:1px solid #cbd5e1;"></span> Chưa làm</div>
          <div class="legend-item"><span class="legend-badge" style="background:#3b82f6;"></span> Đã chọn</div>
          <div class="legend-item"><span class="legend-badge" style="background:#1e293b;"></span> Câu hiện tại</div>
        </div>
      </div>
    </div>

    <!-- 3. MÀN HÌNH KẾT QUẢ -->
    <div id="screen-result" class="screen">
      <div class="card result-hero">
        <div style="font-size: 50px; margin-bottom: 8px;">🎉</div>
        <h2 style="font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">HOÀN THÀNH BÀI THI!</h2>
        <p style="color: var(--text-muted); font-size: 15px;" id="result-exam-name">Bài kiểm tra</p>

        <div class="result-score-circle">
          <div class="score-num" id="final-score-10">9.5</div>
          <div class="score-max">/ 10 điểm</div>
        </div>

        <p id="result-cheer-msg" style="font-size: 17px; font-weight: 700; color: #15803d; margin-bottom: 16px;">
          Em làm bài rất xuất sắc!
        </p>

        <div class="stats-row">
          <div class="stat-card stat-correct">
            <div class="stat-num" id="stat-correct-count">0</div>
            <div class="stat-label">Số câu đúng</div>
          </div>
          <div class="stat-card stat-wrong">
            <div class="stat-num" id="stat-wrong-count">0</div>
            <div class="stat-label">Số câu sai</div>
          </div>
          <div class="stat-card stat-skipped">
            <div class="stat-num" id="stat-skipped-count">0</div>
            <div class="stat-label">Chưa trả lời</div>
          </div>
        </div>

        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 24px;" id="stat-time-spent">
          Thời gian làm bài: 00:00
        </p>

        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="showReviewScreen()">
            🔎 XEM LẠI ĐÁP ÁN
          </button>
          <button class="btn btn-secondary" onclick="restartExam()">
            🔄 LÀM LẠI BÀI THI
          </button>
        </div>
      </div>
    </div>

    <!-- 4. MÀN HÌNH XEM LẠI ĐÁP ÁN -->
    <div id="screen-review" class="screen">
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
          <h3 style="font-size: 20px; font-weight: 800;">CHI TIẾT ĐÁP ÁN TỪNG CÂU</h3>
          <button class="btn btn-secondary" onclick="showResultScreen()">
            ← Quay lại kết quả
          </button>
        </div>

        <div id="review-questions-list">
          <!-- Rendered review items -->
        </div>
      </div>
    </div>
  </div>

  <!-- POPUP XÁC NHẬN NỘP BÀI -->
  <div class="modal-overlay" id="submit-confirm-modal">
    <div class="modal-content">
      <div class="modal-icon">📝</div>
      <h3 class="modal-title">Nộp bài thi</h3>
      <p class="modal-desc" id="confirm-modal-text">Bạn có chắc chắn muốn nộp bài không?</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeSubmitModal()">TIẾP TỤC LÀM</button>
        <button class="btn btn-success" onclick="finishAndSubmitExam()">NỘP BÀI</button>
      </div>
    </div>
  </div>

  <script>
    // Embedded Exam Data
    const EXAM_DATA = ${examDataJson};

    // State Variables
    let currentQuestionIndex = 0;
    let studentAnswers = {}; // { [qIndex]: optionIndex or [indices] }
    let isSubmitted = false;
    let remainingSeconds = 0;
    let timerInterval = null;
    let startTime = null;
    let endTime = null;
    let questionsList = [];

    // LocalStorage key for offline state persistence
    const STORAGE_KEY = 'offline_exam_state_' + (EXAM_DATA.id || 'current');

    // Initialize application on load
    window.addEventListener('DOMContentLoaded', () => {
      initApp();
    });

    function initApp() {
      // Setup metadata on UI
      document.getElementById('start-exam-title').textContent = EXAM_DATA.title || 'Bài thi trắc nghiệm';
      document.getElementById('start-school-teacher').textContent = [
        EXAM_DATA.config?.schoolName || '',
        EXAM_DATA.config?.teacherName ? ('GV: ' + EXAM_DATA.config.teacherName) : ''
      ].filter(Boolean).join(' • ');

      document.getElementById('start-meta-subject').textContent = EXAM_DATA.subject || 'Tổng hợp';
      document.getElementById('start-meta-grade').textContent = EXAM_DATA.grade || 'Tiểu học';
      document.getElementById('start-meta-count').textContent = (EXAM_DATA.questions?.length || 0) + ' câu';
      
      const duration = EXAM_DATA.config?.durationMinutes || 0;
      document.getElementById('start-meta-time').textContent = duration > 0 ? (duration + ' phút') : 'Tự do (Không giới hạn)';

      document.getElementById('header-subject-grade').textContent = (EXAM_DATA.subject || 'Môn học') + ' - ' + (EXAM_DATA.grade || 'Tiểu học');
      document.getElementById('header-mode-badge').textContent = EXAM_DATA.config?.mode === 'practice' ? '🎯 Chế độ luyện tập' : '⏱️ Chế độ thi';

      // Prepare questions (handling shuffle if configured)
      questionsList = JSON.parse(JSON.stringify(EXAM_DATA.questions || []));
      
      if (EXAM_DATA.config?.shuffleQuestions) {
        shuffleArray(questionsList);
      }

      if (EXAM_DATA.config?.shuffleOptions) {
        questionsList.forEach(q => {
          if (q.options && q.options.length > 1 && q.type === 'single') {
            const correctOpt = q.options[q.correctAnswer];
            shuffleArray(q.options);
            q.correctAnswer = q.options.indexOf(correctOpt);
          }
        });
      }

      // Check localStorage for restore
      if (EXAM_DATA.config?.enableLocalStorage) {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.answers && Object.keys(parsed.answers).length > 0 && !parsed.isSubmitted) {
              studentAnswers = parsed.answers;
              document.getElementById('restore-notice').style.display = 'block';
            }
          }
        } catch (e) {
          console.warn('LocalStorage not available', e);
        }
      }
    }

    function startExam(forceReset) {
      if (forceReset) {
        studentAnswers = {};
        clearSavedState();
      }

      currentQuestionIndex = 0;
      isSubmitted = false;
      startTime = new Date();

      // Setup Timer
      const duration = EXAM_DATA.config?.durationMinutes || 0;
      if (duration > 0) {
        remainingSeconds = duration * 60;
        document.getElementById('header-timer').style.display = 'inline-flex';
        updateTimerDisplay();

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
          remainingSeconds--;
          updateTimerDisplay();

          if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            alert('Hết giờ làm bài! Hệ thống sẽ tự động nộp bài thi của em.');
            finishAndSubmitExam();
          }
        }, 1000);
      } else {
        document.getElementById('header-timer').style.display = 'none';
      }

      // Switch screen
      showScreen('screen-quiz');
      renderQuestion(currentQuestionIndex);
      renderNavDots();
    }

    function updateTimerDisplay() {
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      const displayStr = padZero(minutes) + ':' + padZero(seconds);
      const timerElem = document.getElementById('timer-display');
      const timerBadge = document.getElementById('header-timer');

      if (timerElem) timerElem.textContent = displayStr;
      if (timerBadge) {
        if (remainingSeconds <= 120 && remainingSeconds > 0) {
          timerBadge.classList.add('warning');
        } else {
          timerBadge.classList.remove('warning');
        }
      }
    }

    function renderQuestion(index) {
      if (!questionsList || index < 0 || index >= questionsList.length) return;
      currentQuestionIndex = index;

      const q = questionsList[index];
      const isPractice = EXAM_DATA.config?.mode === 'practice';

      // Number badge
      document.getElementById('current-q-index-pill').textContent = 
        'CÂU ' + padZero(index + 1) + ' / ' + padZero(questionsList.length);

      // Question Type
      let typeLabel = 'Chọn 1 đáp án đúng';
      if (q.type === 'multiple') typeLabel = 'Chọn nhiều đáp án đúng';
      if (q.type === 'boolean') typeLabel = 'Đúng hay Sai?';
      if (q.type === 'word_reorder') typeLabel = '🧩 Sắp xếp từ thành câu';
      if (q.type === 'reading' || q.readingPassage) typeLabel = '📖 Đọc hiểu đoạn văn';
      document.getElementById('current-q-type-pill').textContent = typeLabel;

      // Reading passage
      const passageBox = document.getElementById('current-q-passage-box');
      const passageTitle = document.getElementById('current-q-passage-title');
      const passageText = document.getElementById('current-q-passage-text');
      if (q.readingPassage || q.type === 'reading') {
        passageTitle.textContent = q.passageTitle || 'ĐOẠN VĂN ĐỌC HIỂU (READING PASSAGE)';
        passageText.textContent = q.readingPassage || '';
        passageBox.style.display = 'block';
      } else {
        passageBox.style.display = 'none';
      }

      // Question text
      document.getElementById('current-q-text').textContent = q.question;

      // Question image
      const imgBox = document.getElementById('current-q-image-box');
      const imgElem = document.getElementById('current-q-img');
      const captionElem = document.getElementById('current-q-caption');

      if (q.image) {
        imgElem.src = q.image;
        captionElem.textContent = q.imageCaption || '';
        imgBox.style.display = 'block';
      } else {
        imgBox.style.display = 'none';
      }

      // Options or Word Reorder
      const optionsContainer = document.getElementById('current-options-container');
      optionsContainer.innerHTML = '';

      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const currentAns = studentAnswers[index];
      const hasAnswered = currentAns !== undefined;

      if (q.type === 'word_reorder') {
        renderWordReorder(q, index, optionsContainer, isPractice, hasAnswered);
      } else {
        (q.options || []).forEach((opt, optIndex) => {
          const btn = document.createElement('button');
          btn.className = 'opt-btn';

          const isSelected = Array.isArray(currentAns) 
            ? currentAns.includes(optIndex) 
            : currentAns === optIndex;

          if (isSelected) {
            btn.classList.add('selected');
          }

          // In practice mode, if already answered, highlight feedback immediately
          if (isPractice && hasAnswered) {
            btn.disabled = true;
            const isThisCorrect = Array.isArray(q.correctAnswer)
              ? q.correctAnswer.includes(optIndex)
              : q.correctAnswer === optIndex;

            if (isThisCorrect) {
              btn.classList.add('correct-feedback');
            } else if (isSelected) {
              btn.classList.add('wrong-feedback');
            }
          }

          btn.onclick = () => handleSelectOption(optIndex);

          btn.innerHTML = \`
            <div class="opt-letter">\${letters[optIndex] || (optIndex + 1)}</div>
            <div class="opt-text">\${escapeHtml(opt)}</div>
          \`;

          optionsContainer.appendChild(btn);
        });
      }

      // Explanation in practice mode
      const expBox = document.getElementById('practice-explanation-box');
      const expText = document.getElementById('practice-explanation-text');
      if (isPractice && hasAnswered && q.explanation) {
        expText.textContent = q.explanation;
        expBox.classList.add('show');
      } else {
        expBox.classList.remove('show');
      }

      // Nav buttons state
      document.getElementById('btn-prev-q').disabled = (index === 0);
      document.getElementById('btn-next-q').style.display = (index === questionsList.length - 1) ? 'none' : 'inline-flex';

      updateNavPaletteState();
    }

    function handleSelectOption(optIndex) {
      if (isSubmitted) return;

      const q = questionsList[currentQuestionIndex];
      const isPractice = EXAM_DATA.config?.mode === 'practice';

      if (q.type === 'multiple') {
        let currentArr = studentAnswers[currentQuestionIndex] || [];
        if (!Array.isArray(currentArr)) currentArr = [currentArr];
        
        if (currentArr.includes(optIndex)) {
          currentArr = currentArr.filter(i => i !== optIndex);
        } else {
          currentArr.push(optIndex);
        }
        studentAnswers[currentQuestionIndex] = currentArr;
      } else {
        // Single choice or boolean
        studentAnswers[currentQuestionIndex] = optIndex;
      }

      // Save state to localStorage
      saveState();

      // Re-render
      renderQuestion(currentQuestionIndex);
      updateNavPaletteState();
    }

    function renderWordReorder(q, index, container, isPractice, hasAnswered) {
      const studentWordIndices = Array.isArray(studentAnswers[index]) ? studentAnswers[index] : [];
      const hasPlacedWords = studentWordIndices.length > 0;

      const wrapper = document.createElement('div');
      wrapper.className = 'word-reorder-container';

      // 1. Sentence Zone
      const sentenceZoneHeader = document.createElement('div');
      sentenceZoneHeader.className = 'sentence-zone-header';
      sentenceZoneHeader.innerHTML = \`
        <span>📝 Câu em đã ghép:</span>
        \${hasPlacedWords && !isSubmitted ? '<button class="btn-reset-sentence" onclick="handleResetSentenceOffline()">↺ Xếp lại từ đầu</button>' : ''}
      \`;
      wrapper.appendChild(sentenceZoneHeader);

      const sentenceZone = document.createElement('div');
      sentenceZone.className = 'sentence-zone';

      if (!hasPlacedWords) {
        sentenceZone.innerHTML = '<span class="sentence-zone-empty">👉 Hãy bấm vào các thẻ từ bên dưới theo đúng thứ tự để ghép thành câu...</span>';
      } else {
        studentWordIndices.forEach((wIdx, pos) => {
          const chip = document.createElement('button');
          chip.className = 'word-chip-sentence';
          chip.title = isSubmitted ? '' : 'Bấm để trả thẻ từ này về kho';
          chip.innerHTML = \`
            <span class="chip-order">\${pos + 1}.</span>
            <span>\${escapeHtml(q.options[wIdx] || '')}</span>
            \${!isSubmitted ? '<span class="chip-remove-icon">✕</span>' : ''}
          \`;
          if (!isSubmitted) {
            chip.onclick = () => handleRemoveWordFromSentenceOffline(pos);
          }
          sentenceZone.appendChild(chip);
        });
      }
      wrapper.appendChild(sentenceZone);

      // 2. Word Bank Zone
      const bankHeader = document.createElement('div');
      bankHeader.className = 'word-bank-header';
      bankHeader.innerHTML = \`
        <span>Kho thẻ từ (Bấm chọn từ):</span>
        <span style="font-weight: normal; color: #64748b; font-size: 12px;">Đã dùng: \${studentWordIndices.length}/\${q.options.length} từ</span>
      \`;
      wrapper.appendChild(bankHeader);

      const bankZone = document.createElement('div');
      bankZone.className = 'word-bank-zone';

      (q.options || []).forEach((word, wIdx) => {
        const isPlaced = studentWordIndices.includes(wIdx);
        const btn = document.createElement('button');
        btn.className = 'word-chip-bank';
        btn.textContent = word;
        btn.disabled = isPlaced || isSubmitted;

        if (!isPlaced && !isSubmitted) {
          btn.onclick = () => handleAddWordToSentenceOffline(wIdx);
        }

        bankZone.appendChild(btn);
      });
      wrapper.appendChild(bankZone);

      // 3. Practice feedback
      if (isPractice && hasAnswered) {
        const correctBox = document.createElement('div');
        correctBox.style.cssText = 'background: #f0fdf4; border: 1px solid #86efac; padding: 12px 16px; border-radius: 12px; font-size: 13px; color: #14532d;';
        const targetSentence = q.correctSentence || (Array.isArray(q.correctOrder) ? q.correctOrder.join(' ') : '');
        correctBox.innerHTML = \`
          <strong style="display:block; margin-bottom: 4px;">✓ Đáp án câu hoàn chỉnh:</strong>
          <span>\${escapeHtml(targetSentence)}</span>
        \`;
        wrapper.appendChild(correctBox);
      }

      container.appendChild(wrapper);
    }

    function handleAddWordToSentenceOffline(wIdx) {
      if (isSubmitted) return;
      let currentArr = studentAnswers[currentQuestionIndex] || [];
      if (!Array.isArray(currentArr)) currentArr = [];
      if (!currentArr.includes(wIdx)) {
        studentAnswers[currentQuestionIndex] = [...currentArr, wIdx];
        saveState();
        renderQuestion(currentQuestionIndex);
        updateNavPaletteState();
      }
    }

    function handleRemoveWordFromSentenceOffline(pos) {
      if (isSubmitted) return;
      let currentArr = studentAnswers[currentQuestionIndex] || [];
      if (!Array.isArray(currentArr)) return;
      studentAnswers[currentQuestionIndex] = currentArr.filter((_, idx) => idx !== pos);
      saveState();
      renderQuestion(currentQuestionIndex);
      updateNavPaletteState();
    }

    function handleResetSentenceOffline() {
      if (isSubmitted) return;
      studentAnswers[currentQuestionIndex] = [];
      saveState();
      renderQuestion(currentQuestionIndex);
      updateNavPaletteState();
    }

    function goToPrevQuestion() {
      if (currentQuestionIndex > 0) {
        renderQuestion(currentQuestionIndex - 1);
      }
    }

    function goToNextQuestion() {
      if (currentQuestionIndex < questionsList.length - 1) {
        renderQuestion(currentQuestionIndex + 1);
      }
    }

    function renderNavDots() {
      const grid = document.getElementById('nav-dots-grid');
      grid.innerHTML = '';

      questionsList.forEach((q, idx) => {
        const dot = document.createElement('button');
        dot.className = 'nav-dot';
        dot.textContent = padZero(idx + 1);
        dot.id = 'nav-dot-' + idx;
        dot.onclick = () => renderQuestion(idx);
        grid.appendChild(dot);
      });

      updateNavPaletteState();
    }

    function updateNavPaletteState() {
      let answeredCount = 0;

      questionsList.forEach((q, idx) => {
        const dot = document.getElementById('nav-dot-' + idx);
        if (!dot) return;

        dot.className = 'nav-dot';
        const hasAnswer = studentAnswers[idx] !== undefined && 
          (Array.isArray(studentAnswers[idx]) ? studentAnswers[idx].length > 0 : true);

        if (hasAnswer) {
          dot.classList.add('answered');
          answeredCount++;
        }

        if (idx === currentQuestionIndex) {
          dot.classList.add('current');
        }
      });

      document.getElementById('answered-counter').textContent = 
        'Đã làm: ' + answeredCount + '/' + questionsList.length;
    }

    function confirmSubmitExam() {
      const total = questionsList.length;
      let answeredCount = 0;
      for (let i = 0; i < total; i++) {
        if (studentAnswers[i] !== undefined && 
           (Array.isArray(studentAnswers[i]) ? studentAnswers[i].length > 0 : true)) {
          answeredCount++;
        }
      }

      const unAnswered = total - answeredCount;
      let confirmMsg = 'Em đã hoàn thành ' + answeredCount + '/' + total + ' câu.';
      if (unAnswered > 0) {
        confirmMsg += ' Còn ' + unAnswered + ' câu chưa trả lời. Em có chắc chắn muốn nộp bài không?';
      } else {
        confirmMsg += ' Em có muốn nộp bài để xem kết quả ngay không?';
      }

      document.getElementById('confirm-modal-text').textContent = confirmMsg;
      document.getElementById('submit-confirm-modal').classList.add('open');
    }

    function closeSubmitModal() {
      document.getElementById('submit-confirm-modal').classList.remove('open');
    }

    function finishAndSubmitExam() {
      closeSubmitModal();
      isSubmitted = true;
      endTime = new Date();
      clearInterval(timerInterval);

      // Calculate score
      let correctCount = 0;
      let wrongCount = 0;
      let skippedCount = 0;

      questionsList.forEach((q, idx) => {
        const studentAns = studentAnswers[idx];

        if (studentAns === undefined || (Array.isArray(studentAns) && studentAns.length === 0)) {
          skippedCount++;
        } else {
          let isCorrect = false;
          if (q.type === 'word_reorder') {
            const studentIndices = Array.isArray(studentAns) ? studentAns : [];
            const studentWords = studentIndices.map(i => q.options[i]).filter(Boolean);
            const studentSentence = studentWords.join(' ').replace(/\s+([.,!?:;])/g, '$1').trim().toLowerCase();
            const targetSentence = (q.correctSentence || (Array.isArray(q.correctOrder) ? q.correctOrder.join(' ') : '')).replace(/\s+([.,!?:;])/g, '$1').trim().toLowerCase();
            isCorrect = studentWords.length > 0 && studentSentence === targetSentence;
          } else if (Array.isArray(q.correctAnswer)) {
            const sArr = Array.isArray(studentAns) ? [...studentAns].sort() : [studentAns];
            const cArr = [...q.correctAnswer].sort();
            isCorrect = (JSON.stringify(sArr) === JSON.stringify(cArr));
          } else {
            isCorrect = (studentAns === q.correctAnswer);
          }

          if (isCorrect) {
            correctCount++;
          } else {
            wrongCount++;
          }
        }
      });

      const total = questionsList.length;
      const score10 = total > 0 ? ((correctCount / total) * 10).toFixed(1) : '0';

      // Update UI results
      document.getElementById('final-score-10').textContent = score10;
      document.getElementById('stat-correct-count').textContent = correctCount;
      document.getElementById('stat-wrong-count').textContent = wrongCount;
      document.getElementById('stat-skipped-count').textContent = skippedCount;
      document.getElementById('result-exam-name').textContent = EXAM_DATA.title || 'Bài thi trắc nghiệm';

      // Cheer message
      const numScore = parseFloat(score10);
      let cheer = 'Em cần cố gắng hơn ở các bài sau nhé!';
      if (numScore >= 9) cheer = '🌟 Xuất sắc! Em đạt điểm số gần như tuyệt đối!';
      else if (numScore >= 7) cheer = '👏 Rất tốt! Em đã nắm vững kiến thức bài học!';
      else if (numScore >= 5) cheer = '👍 Em đã hoàn thành bài thi khá tốt!';
      document.getElementById('result-cheer-msg').textContent = cheer;

      // Time spent
      const totalSeconds = startTime ? Math.round((endTime - startTime) / 1000) : 0;
      const spentMin = Math.floor(totalSeconds / 60);
      const spentSec = totalSeconds % 60;
      document.getElementById('stat-time-spent').textContent = 
        'Thời gian làm bài: ' + spentMin + ' phút ' + spentSec + ' giây';

      clearSavedState();
      showScreen('screen-result');

      // Trigger Confetti Celebration if good score
      if (numScore >= 7) {
        launchCelebrationConfetti();
      }
    }

    function showReviewScreen() {
      const reviewContainer = document.getElementById('review-questions-list');
      reviewContainer.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

      questionsList.forEach((q, idx) => {
        const studentAns = studentAnswers[idx];
        const isSkipped = studentAns === undefined || (Array.isArray(studentAns) && studentAns.length === 0);
        
        let isCorrect = false;
        if (!isSkipped) {
          if (q.type === 'word_reorder') {
            const studentIndices = Array.isArray(studentAns) ? studentAns : [];
            const studentWords = studentIndices.map(i => q.options[i]).filter(Boolean);
            const studentSentence = studentWords.join(' ').replace(/\s+([.,!?:;])/g, '$1').trim().toLowerCase();
            const targetSentence = (q.correctSentence || (Array.isArray(q.correctOrder) ? q.correctOrder.join(' ') : '')).replace(/\s+([.,!?:;])/g, '$1').trim().toLowerCase();
            isCorrect = studentWords.length > 0 && studentSentence === targetSentence;
          } else if (Array.isArray(q.correctAnswer)) {
            const sArr = Array.isArray(studentAns) ? [...studentAns].sort() : [studentAns];
            const cArr = [...q.correctAnswer].sort();
            isCorrect = (JSON.stringify(sArr) === JSON.stringify(cArr));
          } else {
            isCorrect = (studentAns === q.correctAnswer);
          }
        }

        const item = document.createElement('div');
        item.className = 'review-item';

        let badgeHtml = '<span class="review-status-badge badge-correct">✓ Trả lời Đúng</span>';
        if (isSkipped) {
          badgeHtml = '<span class="review-status-badge badge-skipped">○ Chưa trả lời</span>';
        } else if (!isCorrect) {
          badgeHtml = '<span class="review-status-badge badge-wrong">✗ Trả lời Sai</span>';
        }

        let studentChoiceText = 'Chưa chọn';
        if (!isSkipped) {
          if (q.type === 'word_reorder') {
            const studentWords = Array.isArray(studentAns) ? studentAns.map(i => q.options[i]).filter(Boolean) : [];
            studentChoiceText = studentWords.length > 0 ? studentWords.join(' ') : 'Chưa ghép câu';
          } else if (Array.isArray(studentAns)) {
            studentChoiceText = studentAns.map(i => letters[i] + '. ' + (q.options[i] || '')).join(' | ');
          } else {
            studentChoiceText = (letters[studentAns] || '') + '. ' + (q.options[studentAns] || '');
          }
        }

        let correctChoiceText = '';
        if (q.type === 'word_reorder') {
          correctChoiceText = q.correctSentence || (Array.isArray(q.correctOrder) ? q.correctOrder.join(' ') : '');
        } else if (Array.isArray(q.correctAnswer)) {
          correctChoiceText = q.correctAnswer.map(i => letters[i] + '. ' + (q.options[i] || '')).join(' | ');
        } else {
          correctChoiceText = (letters[q.correctAnswer] || '') + '. ' + (q.options[q.correctAnswer] || '');
        }

        const passageHtml = q.readingPassage 
          ? \`<details style="margin: 8px 0; font-size: 13px; background: #fefce8; padding: 8px 12px; border-radius: 8px; border: 1px solid #fef08a;">
              <summary style="font-weight: 700; color: #854d0e; cursor: pointer;">📖 Xem đoạn văn đọc hiểu của câu này</summary>
              <div style="margin-top: 6px; font-family: Georgia, serif; line-height: 1.6; color: #1e293b; white-space: pre-line; border-left: 2px solid #eab308; padding-left: 10px;">
                \${escapeHtml(q.readingPassage)}
              </div>
            </details>\` 
          : '';

        item.innerHTML = \`
          \${badgeHtml}
          <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
            Câu \${idx + 1}: \${escapeHtml(q.question)}
          </div>
          \${passageHtml}
          \${q.image ? \`<div style="margin: 10px 0;"><img src="\${q.image}" style="max-height: 180px; border-radius: 8px; border: 1px solid #e2e8f0;" alt="Hình ảnh"></div>\` : ''}
          <div style="background: #f8fafc; border-radius: 10px; padding: 12px; font-size: 14px; margin-top: 8px;">
            <div style="margin-bottom: 4px;">
              <strong>Đáp án của em:</strong> 
              <span style="color: \${isCorrect ? '#15803d' : (isSkipped ? '#64748b' : '#dc2626')}; font-weight: 700;">
                \${escapeHtml(studentChoiceText)}
              </span>
            </div>
            <div>
              <strong>Đáp án đúng:</strong> 
              <span style="color: #15803d; font-weight: 700;">
                \${escapeHtml(correctChoiceText)}
              </span>
            </div>
            \${q.explanation ? \`
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #cbd5e1; color: #334155;">
                <strong>💡 Giải thích:</strong> \${escapeHtml(q.explanation)}
              </div>
            \` : ''}
          </div>
        \`;

        reviewContainer.appendChild(item);
      });

      showScreen('screen-review');
    }

    function showResultScreen() {
      showScreen('screen-result');
    }

    function restartExam() {
      if (confirm('Em có muốn bắt đầu làm lại bài thi từ đầu không?')) {
        startExam(true);
      }
    }

    function showScreen(screenId) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      const target = document.getElementById(screenId);
      if (target) target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function saveState() {
      if (!EXAM_DATA.config?.enableLocalStorage) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          answers: studentAnswers,
          isSubmitted: isSubmitted,
          timestamp: Date.now()
        }));
      } catch (e) {}
    }

    function clearSavedState() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    }

    function padZero(num) {
      return num < 10 ? '0' + num : '' + num;
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }

    // Pure self-contained Canvas Confetti without external CDN
    function launchCelebrationConfetti() {
      const canvas = document.getElementById('confetti-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles = [];
      const colors = ['#2563eb', '#16a34a', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

      for (let i = 0; i < 120; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 3,
          r: Math.random() * 6 + 4,
          dx: (Math.random() - 0.5) * 14,
          dy: (Math.random() - 0.7) * 14,
          color: colors[Math.floor(Math.random() * colors.length)],
          tilt: Math.floor(Math.random() * 10) - 10,
          tiltAngle: 0,
          tiltAngleInc: (Math.random() * 0.07) + 0.05
        });
      }

      let animationFrame;
      let frameCount = 0;

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          p.tiltAngle += p.tiltAngleInc;
          p.y += (Math.cos(p.tiltAngle) + 1 + p.r / 2) / 2 + 1.5;
          p.x += Math.sin(p.tiltAngle) * 2 + p.dx * 0.95;
          p.dx *= 0.98;

          ctx.beginPath();
          ctx.lineWidth = p.r / 2;
          ctx.strokeStyle = p.color;
          ctx.moveTo(p.x + p.tilt + p.r, p.y);
          ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
          ctx.stroke();
        });

        frameCount++;
        if (frameCount < 160) {
          animationFrame = requestAnimationFrame(draw);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          cancelAnimationFrame(animationFrame);
        }
      }

      draw();
    }
  </script>
</body>
</html>`;
}
