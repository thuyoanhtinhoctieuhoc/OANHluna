import { Exam } from '../types';

// Clean inline SVG converted to Data URI for offline testing
const geometryShapeSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#F8FAFC" rx="12"/>
  <rect x="25" y="40" width="110" height="70" fill="#38BDF8" stroke="#0284C7" stroke-width="3" rx="4"/>
  <text x="80" y="80" font-size="14" font-weight="bold" fill="#0369A1" text-anchor="middle">Hình A: 110 x 70</text>
  <polygon points="230,35 285,130 175,130" fill="#F472B6" stroke="#DB2777" stroke-width="3"/>
  <text x="230" y="105" font-size="14" font-weight="bold" fill="#9D174D" text-anchor="middle">Hình B</text>
  <circle cx="80" cy="155" r="28" fill="#FBBF24" stroke="#D97706" stroke-width="3"/>
  <text x="80" y="160" font-size="13" font-weight="bold" fill="#92400E" text-anchor="middle">Hình C</text>
</svg>
`)}`;

const animalsSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#F0FDF4" rx="12"/>
  <text x="160" y="40" font-size="16" font-weight="bold" fill="#15803D" text-anchor="middle">SƠ ĐỒ VÒNG ĐỜI CỦA BƯỚM</text>
  <rect x="20" y="70" width="60" height="40" rx="8" fill="#BBF7D0" stroke="#16A34A" stroke-width="2"/>
  <text x="50" y="95" font-size="13" font-weight="bold" fill="#14532D" text-anchor="middle">Trứng</text>
  <text x="95" y="95" font-size="16" fill="#16A34A">→</text>
  <rect x="110" y="70" width="60" height="40" rx="8" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
  <text x="140" y="95" font-size="13" font-weight="bold" fill="#713F12" text-anchor="middle">Sâu bướm</text>
  <text x="185" y="95" font-size="16" fill="#16A34A">→</text>
  <rect x="200" y="70" width="45" height="40" rx="8" fill="#FED7AA" stroke="#EA580C" stroke-width="2"/>
  <text x="222" y="95" font-size="13" font-weight="bold" fill="#7C2D12" text-anchor="middle">Nhộng</text>
  <text x="260" y="95" font-size="16" fill="#16A34A">→</text>
  <rect x="270" y="70" width="40" height="40" rx="8" fill="#FBCFE8" stroke="#DB2777" stroke-width="2"/>
  <text x="290" y="95" font-size="12" font-weight="bold" fill="#831843" text-anchor="middle">Bướm</text>
</svg>
`)}`;

export const sampleExams: Exam[] = [
  {
    id: 'exam-toan-lop4-sample',
    title: 'Kiểm tra Giữa Học Kì 1 - Môn Toán Lớp 4',
    subject: 'Toán học',
    grade: 'Lớp 4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    config: {
      title: 'Kiểm tra Giữa Học Kì 1 - Môn Toán Lớp 4',
      subject: 'Toán học',
      grade: 'Lớp 4',
      teacherName: 'Cô Oanh Happi',
      schoolName: 'Tiểu học Chi Lăng',
      durationMinutes: 15,
      mode: 'practice',
      maxAttempts: 'unlimited',
      showAnswersAfterSubmit: true,
      allowReview: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      enableLocalStorage: true,
    },
    questions: [
      {
        id: 1,
        question: 'Số gồm "5 trăm nghìn, 8 nghìn, 4 trăm và 3 đơn vị" được viết là:',
        type: 'single',
        options: ['508 403', '580 403', '58 403', '508 430'],
        correctAnswer: 0,
        explanation: 'Số gồm 5 trăm nghìn (500 000), 0 chục nghìn, 8 nghìn (8 000), 4 trăm (400), 0 chục và 3 đơn vị viết là 508 403.',
        verified: true,
      },
      {
        id: 2,
        question: 'Quan sát hình bên dưới. Hình nào là hình tròn?',
        image: geometryShapeSvg,
        imageCaption: 'Hình minh họa các dạng hình học cơ bản',
        type: 'single',
        options: ['Hình A', 'Hình B', 'Hình C', 'Cả ba hình trên'],
        correctAnswer: 2,
        explanation: 'Hình C là hình tròn có tâm và đường tròn viền vàng cam.',
        verified: true,
      },
      {
        id: 3,
        question: 'Giá trị của chữ số 7 trong số 472 856 là bao nhiêu?',
        type: 'single',
        options: ['700', '7 000', '70 000', '700 000'],
        correctAnswer: 2,
        explanation: 'Chữ số 7 nằm ở hàng chục nghìn, vì vậy có giá trị là 70 000.',
        verified: true,
      },
      {
        id: 4,
        question: 'Chọn các phép tính có kết quả bằng 100 (Có thể chọn nhiều đáp án):',
        type: 'multiple',
        options: ['25 × 4', '50 + 50', '200 : 2', '35 + 55'],
        correctAnswer: [0, 1, 2],
        explanation: '25 × 4 = 100, 50 + 50 = 100, 200 : 2 = 100. Còn 35 + 55 = 90 (sai).',
        verified: true,
      },
      {
        id: 5,
        question: 'Một hình vuông có cạnh dài 6 cm thì chu vi của hình vuông đó là 24 cm. Đúng hay Sai?',
        type: 'boolean',
        options: ['Đúng', 'Sai'],
        correctAnswer: 0,
        explanation: 'Chu vi hình vuông = Cạnh × 4 = 6 × 4 = 24 cm. Khẳng định này Đúng.',
        verified: true,
      },
      {
        id: 6,
        question: 'Quan sát sơ đồ vòng đời sinh trưởng sau đây. Giai đoạn nào xảy ra ngay trước khi biến thành bướm trưởng thành?',
        image: animalsSvg,
        imageCaption: 'Sơ đồ các giai đoạn sinh trưởng của bướm',
        type: 'single',
        options: ['Trứng', 'Sâu bướm', 'Nhộng', 'Kén rỗng'],
        correctAnswer: 2,
        explanation: 'Theo sơ đồ: Trứng → Sâu bướm → Nhộng → Bướm trưởng thành. Giai đoạn ngay trước bướm là Nhộng.',
        aiProposed: false,
        verified: true,
      },
      {
        id: 7,
        question: 'Hãy sắp xếp các từ sau để tạo thành một câu hoàn chỉnh:',
        type: 'word_reorder',
        options: ['bài', 'Em', 'chăm chỉ', 'làm', 'toán'],
        correctSentence: 'Em chăm chỉ làm bài toán',
        correctOrder: ['Em', 'chăm chỉ', 'làm', 'bài', 'toán'],
        correctAnswer: 0,
        explanation: 'Thứ tự câu đúng là: "Em chăm chỉ làm bài toán".',
        aiProposed: false,
        verified: true,
      },
    ],
  },
  {
    id: 'exam-tieng-viet-lop3-sample',
    title: 'Ôn tập Sắp xếp từ thành câu - Tiếng Việt & Tiếng Anh',
    subject: 'Tiếng Việt',
    grade: 'Lớp 3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    config: {
      title: 'Ôn tập Sắp xếp từ thành câu - Tiếng Việt & Tiếng Anh',
      subject: 'Tiếng Việt',
      grade: 'Lớp 3',
      teacherName: 'Cô Oanh Happi',
      schoolName: 'Tiểu học Chi Lăng',
      durationMinutes: 10,
      mode: 'practice',
      maxAttempts: 'unlimited',
      showAnswersAfterSubmit: true,
      allowReview: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      enableLocalStorage: true,
    },
    questions: [
      {
        id: 1,
        question: 'Hãy bấm chọn các thẻ từ để sắp xếp thành câu tục ngữ, ca dao hoàn chỉnh:',
        type: 'word_reorder',
        options: ['thương nhau', 'cùng', 'Người trong một nước', 'phải'],
        correctSentence: 'Người trong một nước phải thương nhau cùng',
        correctOrder: ['Người trong một nước', 'phải', 'thương nhau', 'cùng'],
        correctAnswer: 0,
        explanation: 'Câu ca dao đúng: "Người trong một nước phải thương nhau cùng".',
        verified: true,
      },
      {
        id: 2,
        question: 'Reorder the words to form a correct English sentence:',
        type: 'word_reorder',
        options: ['to school', 'I', 'every day', 'walk'],
        correctSentence: 'I walk to school every day',
        correctOrder: ['I', 'walk', 'to school', 'every day'],
        correctAnswer: 0,
        explanation: 'Correct sentence order is: "I walk to school every day".',
        verified: true,
      },
      {
        id: 3,
        question: 'Trong câu "Bé Mai chăm chỉ học bài", từ nào là từ chỉ hoạt động?',
        type: 'single',
        options: ['học', 'Bé Mai', 'chăm chỉ', 'bài'],
        correctAnswer: 0,
        explanation: '"học" là từ chỉ hoạt động của bạn Mai.',
        verified: true,
      },
    ],
  },
  {
    id: 'exam-tieng-anh-reading-sample',
    title: 'Đọc hiểu Tiếng Anh Lớp 4 - Linh’s School and Routine',
    subject: 'Tiếng Anh',
    grade: 'Lớp 4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    config: {
      title: 'Đọc hiểu Tiếng Anh Lớp 4 - Linh’s School and Routine',
      subject: 'Tiếng Anh',
      grade: 'Lớp 4',
      teacherName: 'Cô Oanh Happi',
      schoolName: 'Tiểu học Chi Lăng',
      durationMinutes: 15,
      mode: 'practice',
      maxAttempts: 'unlimited',
      showAnswersAfterSubmit: true,
      allowReview: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      enableLocalStorage: true,
    },
    questions: [
      {
        id: 21,
        question: "Where is Linh's school?",
        type: 'reading',
        readingPassage: "Hello, my name is Linh. I am a pupil at Hoa Sen Primary School. My school is in a quiet village. It has three big buildings and a large playground. Today is Wednesday, so I have English, Maths, and Science. My favourite subject is English because I want to talk with foreign friends. Yesterday was Tuesday, and I was at the school library with my classmates. We read many interesting books there.",
        passageTitle: "Read the passage and choose the correct answer:",
        options: ['In a big city', 'In a quiet village', 'In the mountains', 'Near the beach'],
        correctAnswer: 1, // B
        explanation: 'Theo bài đọc: "My school is in a quiet village."',
        verified: true,
      },
      {
        id: 22,
        question: "How many big buildings does her school have?",
        type: 'reading',
        readingPassage: "Hello, my name is Linh. I am a pupil at Hoa Sen Primary School. My school is in a quiet village. It has three big buildings and a large playground. Today is Wednesday, so I have English, Maths, and Science. My favourite subject is English because I want to talk with foreign friends. Yesterday was Tuesday, and I was at the school library with my classmates. We read many interesting books there.",
        passageTitle: "Read the passage and choose the correct answer:",
        options: ['Two', 'Three', 'Four', 'Five'],
        correctAnswer: 1, // B
        explanation: 'Theo bài đọc: "It has three big buildings and a large playground."',
        verified: true,
      },
      {
        id: 23,
        question: "What subjects does Linh have on Wednesdays?",
        type: 'reading',
        readingPassage: "Hello, my name is Linh. I am a pupil at Hoa Sen Primary School. My school is in a quiet village. It has three big buildings and a large playground. Today is Wednesday, so I have English, Maths, and Science. My favourite subject is English because I want to talk with foreign friends. Yesterday was Tuesday, and I was at the school library with my classmates. We read many interesting books there.",
        passageTitle: "Read the passage and choose the correct answer:",
        options: ['English, Art, and Music', 'Maths, Science, and IT', 'English, Maths, and Science', 'English and History'],
        correctAnswer: 2, // C
        explanation: 'Theo bài đọc: "Today is Wednesday, so I have English, Maths, and Science."',
        verified: true,
      },
      {
        id: 24,
        question: "Why does Linh like English?",
        type: 'reading',
        readingPassage: "Hello, my name is Linh. I am a pupil at Hoa Sen Primary School. My school is in a quiet village. It has three big buildings and a large playground. Today is Wednesday, so I have English, Maths, and Science. My favourite subject is English because I want to talk with foreign friends. Yesterday was Tuesday, and I was at the school library with my classmates. We read many interesting books there.",
        passageTitle: "Read the passage and choose the correct answer:",
        options: ['Because she wants to be a teacher', 'Because she wants to talk with foreign friends', 'Because it is easy', 'Because she likes drawing'],
        correctAnswer: 1, // B
        explanation: 'Theo bài đọc: "My favourite subject is English because I want to talk with foreign friends."',
        verified: true,
      },
      {
        id: 25,
        question: "Where was Linh yesterday?",
        type: 'reading',
        readingPassage: "Hello, my name is Linh. I am a pupil at Hoa Sen Primary School. My school is in a quiet village. It has three big buildings and a large playground. Today is Wednesday, so I have English, Maths, and Science. My favourite subject is English because I want to talk with foreign friends. Yesterday was Tuesday, and I was at the school library with my classmates. We read many interesting books there.",
        passageTitle: "Read the passage and choose the correct answer:",
        options: ['At the campsite', 'On the beach', 'At the school library', 'At home'],
        correctAnswer: 2, // C
        explanation: 'Theo bài đọc: "Yesterday was Tuesday, and I was at the school library with my classmates."',
        verified: true,
      },
    ],
  },
];
