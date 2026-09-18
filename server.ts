import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import mammoth from "mammoth";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 50MB limit to handle image and PDF document uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Gemini Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", aiConfigured: !!process.env.GEMINI_API_KEY });
});

// Document Analysis Endpoint
app.post("/api/analyze-documents", async (req: Request, res: Response) => {
  try {
    const { files = [], pastedText = "", gradeHint = "", subjectHint = "" } = req.body;

    if ((!files || files.length === 0) && (!pastedText || !pastedText.trim())) {
      return res.status(400).json({
        error: "Vui lòng tải lên tài liệu (Word, PDF, hình ảnh) hoặc nhập văn bản nội dung câu hỏi.",
      });
    }

    const ai = getGenAI();

    // Prepare contents for Gemini multimodal prompt
    const parts: any[] = [];
    const extractedImages: string[] = []; // Data URIs collected from Word or Images

    let combinedTextContent = "";
    if (pastedText && pastedText.trim()) {
      combinedTextContent += `\n--- VĂN BẢN TRỰC TIẾP TỪ GIÁO VIÊN ---\n${pastedText}\n`;
    }

    // Process uploaded files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mime = file.mimeType || "";
      const base64 = file.base64Data ? file.base64Data.replace(/^data:.*?;base64,/, "") : "";

      if (mime.includes("wordprocessingml") || file.name.endsWith(".docx")) {
        // Word file parsing using mammoth
        try {
          const buffer = Buffer.from(base64, "base64");
          const result = await mammoth.extractRawText({ buffer });
          combinedTextContent += `\n--- NỘI DUNG TỪ FILE WORD (${file.name}) ---\n${result.value}\n`;

          // Also extract images from docx if present
          await mammoth.convertToHtml({ buffer }, {
            convertImage: (mammoth.images as any).imgElement((element: any) => {
              return element.read("base64").then((imageBuffer: any) => {
                const dataUri = `data:${element.contentType};base64,${imageBuffer}`;
                extractedImages.push(dataUri);
                return { src: dataUri };
              });
            }),
          });
        } catch (docxErr) {
          console.warn("Lỗi đọc file docx:", docxErr);
          combinedTextContent += `\n[Tệp Word: ${file.name} - Hệ thống tiếp tục phân tích]\n`;
        }
      } else if (mime === "application/pdf" || file.name.endsWith(".pdf")) {
        // PDF file sent directly to Gemini multimodal
        if (base64) {
          parts.push({
            inlineData: {
              mimeType: "application/pdf",
              data: base64,
            },
          });
          combinedTextContent += `\n[Tệp PDF đính kèm: ${file.name}]\n`;
        }
      } else if (mime.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name)) {
        // Image file sent to Gemini for OCR & Question Analysis
        if (base64) {
          const realMime = mime || "image/jpeg";
          parts.push({
            inlineData: {
              mimeType: realMime,
              data: base64,
            },
          });
          const fullDataUri = `data:${realMime};base64,${base64}`;
          extractedImages.push(fullDataUri);
          combinedTextContent += `\n[Hình ảnh đính kèm (Hình ${extractedImages.length}): ${file.name}]\n`;
        }
      }
    }

    const systemPrompt = `
Bạn là Trợ lý AI giáo dục tiểu học tại Việt Nam, chuyên bóc tách đề thi, bài tập trắc nghiệm từ tài liệu của giáo viên.
Nhiệm vụ của bạn: Đọc toàn bộ tài liệu (văn bản, PDF, hình ảnh đề thi, file Word) và trích xuất thành danh sách câu hỏi trắc nghiệm hoàn chỉnh.

QUY TẮC CỐT LÕI BẮT BUỘC:
1. KHÔNG tự ý thay đổi câu hỏi của giáo viên. Giữ nguyên câu từ gốc, số liệu và phương án A, B, C, D của giáo viên.
2. Nhận diện thông tin chung:
   - Tên bài thi (title)
   - Môn học (subject: Toán học, Tiếng Việt, Tự nhiên và Xã hội, Khoa học, Lịch sử và Địa lý, Tiếng Anh, Tin học, Đạo đức...)
   - Khối lớp (grade: Lớp 1, Lớp 2, Lớp 3, Lớp 4, Lớp 5)
   - Chủ đề (topic)
   (Nếu giáo viên có gợi ý lớp "${gradeHint}" hoặc môn "${subjectHint}", hãy ưu tiên sử dụng).
3. Nhận diện các câu hỏi:
   - Câu 1, Câu 2... hoặc 1), 2)...
   - Nhận diện các lựa chọn: A, B, C, D... hoặc Đúng / Sai.
   - Nhận diện đáp án đúng nếu tài liệu có sẵn (ví dụ ghi 'Đáp án: C', hoặc chữ C khoanh tròn/in đậm). Nếu tài liệu có sẵn đáp án, đặt "aiProposed": false.
   - NẾU TÀI LIỆU KHÔNG CÓ ĐÁP ÁN: AI hãy suy luận và đề xuất đáp án chính xác nhất, ĐỒNG THỜI ĐẶT "aiProposed": true để cảnh báo giáo viên cần kiểm tra lại!
4. Nhận diện dạng câu hỏi (type):
   - "single": 1 đáp án đúng (A/B/C/D)
   - "multiple": Chọn nhiều đáp án
   - "boolean": Đúng / Sai
   - "image": Câu hỏi có hình vẽ/sơ đồ minh họa hoặc chọn hình.
   - "word_reorder": Sắp xếp các từ thành câu hoàn chỉnh (rất phổ biến trong Tiếng Việt và Tiếng Anh tiểu học).
     + Khi gặp dạng bài này:
       - options: Danh sách các thẻ từ rời rạc cần sắp xếp (ví dụ: ["bạn", "Mai", "chăm chỉ", "học bài", "."])
       - correctSentence: Câu văn hoàn chỉnh chính xác (ví dụ: "Bạn Mai chăm chỉ học bài.")
       - correctOrder: Mảng các từ theo đúng trật tự (ví dụ: ["Bạn", "Mai", "chăm chỉ", "học bài", "."])
   - "reading": Đọc đoạn văn rồi trả lời câu hỏi (Đọc hiểu Tiếng Việt, Tiếng Anh Reading Comprehension).
     + Khi gặp bài đọc, đoạn văn, câu chuyện ngắn (ví dụ: "Hello, my name is Linh. I am a pupil at Hoa Sen Primary School...") kèm theo các câu hỏi liên quan (như câu 21 - 25):
       - Đặt type: "reading"
       - Trích xuất TOÀN BỘ nội dung bài đọc vào trường "readingPassage" cho TẤT CẢ các câu hỏi liên quan đến bài đọc đó!
       - "passageTitle": Tiêu đề bài đọc hoặc lời dẫn (ví dụ: "Read the passage and choose the correct answer:" hoặc "Đọc đoạn văn sau:")
5. Nếu câu hỏi có hình ảnh minh họa trong tài liệu, ghi nhận "imageIndex": 0, 1, 2... tương ứng với thứ tự hình ảnh đính kèm (bắt đầu từ 0).
6. Viết lời giải thích (explanation) ngắn gọn, sư phạm, chuẩn mực cho học sinh tiểu học.
`;

    // Response schema for reliable structured output
    const jsonSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        subject: { type: Type.STRING },
        grade: { type: Type.STRING },
        topic: { type: Type.STRING },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              type: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctAnswer: { type: Type.INTEGER },
              readingPassage: { type: Type.STRING },
              passageTitle: { type: Type.STRING },
              correctSentence: { type: Type.STRING },
              correctOrder: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              explanation: { type: Type.STRING },
              aiProposed: { type: Type.BOOLEAN },
              imageIndex: { type: Type.INTEGER },
            },
            required: ["id", "question", "options", "correctAnswer"],
          },
        },
      },
      required: ["questions"],
    };

    if (ai) {
      parts.push({
        text: `${systemPrompt}\n\nNỘI DUNG TÀI LIỆU CẦN PHÂN TÍCH:\n${combinedTextContent}`,
      });

      // Try primary fast model (gemini-3.1-flash-lite), fallback to gemini-3.8-flash
      const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
      let textOutput = "";
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: parts,
            config: {
              responseMimeType: "application/json",
              responseSchema: jsonSchema,
              temperature: 0.2,
            },
          });
          if (response.text && response.text.trim()) {
            textOutput = response.text.trim();
            break;
          }
        } catch (apiErr: any) {
          console.warn(`Thử model ${modelName} gặp lỗi:`, apiErr?.message || apiErr);
          lastError = apiErr;
          // Continue to fallback model
        }
      }

      if (textOutput) {
        let parsedData: any;
        try {
          parsedData = JSON.parse(textOutput);
        } catch (parseError) {
          const clean = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
          parsedData = JSON.parse(clean);
        }

        // Normalize questions array
        let rawQuestions: any[] = [];
        if (Array.isArray(parsedData)) {
          rawQuestions = parsedData;
        } else if (Array.isArray(parsedData.questions)) {
          rawQuestions = parsedData.questions;
        } else if (Array.isArray(parsedData.data)) {
          rawQuestions = parsedData.data;
        }

        if (rawQuestions.length > 0) {
          const normalizedQuestions = rawQuestions.map((q: any, idx: number) => {
            let assignedImage = undefined;
            if (typeof q.imageIndex === "number" && extractedImages[q.imageIndex]) {
              assignedImage = extractedImages[q.imageIndex];
            } else if (extractedImages.length === 1 && (q.type === "image" || /hình|sơ đồ|quan sát/i.test(q.question || ""))) {
              assignedImage = extractedImages[0];
            }

            // Normalize options
            let options: string[] = [];
            if (Array.isArray(q.options)) {
              options = q.options.map((opt: any) => String(opt).trim());
            } else if (q.options && typeof q.options === "object") {
              options = Object.values(q.options).map((opt: any) => String(opt).trim());
            }
            if (options.length === 0) {
              options = ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"];
            }

            // Normalize correctAnswer
            let correctAnswer: any = 0;
            if (typeof q.correctAnswer === "number") {
              correctAnswer = q.correctAnswer;
            } else if (typeof q.correctAnswer === "string") {
              const letterMatch = q.correctAnswer.trim().toUpperCase();
              const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };
              correctAnswer = map[letterMatch] ?? (parseInt(letterMatch) || 0);
            }

            const isWordReorder = q.type === "word_reorder" || /sắp xếp.*(từ|câu)/i.test(q.question || "");
            const hasPassage = Boolean((q.readingPassage && q.readingPassage.trim()) || q.type === "reading");
            const questionType = isWordReorder ? "word_reorder" : (hasPassage ? "reading" : (q.type || "single"));

            let correctSentence = q.correctSentence || "";
            let correctOrder: string[] = Array.isArray(q.correctOrder) ? q.correctOrder : [];

            if (questionType === "word_reorder") {
              if (!correctSentence && options.length > 0) {
                correctSentence = options.join(" ");
              }
              if (correctOrder.length === 0 && correctSentence) {
                correctOrder = correctSentence.trim().split(/\s+/);
              }
            }

            return {
              id: q.id || idx + 1,
              question: q.question || `Câu hỏi ${idx + 1}`,
              type: questionType,
              options: options,
              correctAnswer: correctAnswer,
              readingPassage: q.readingPassage ? q.readingPassage.trim() : undefined,
              passageTitle: q.passageTitle ? q.passageTitle.trim() : undefined,
              correctSentence: correctSentence,
              correctOrder: correctOrder,
              explanation: q.explanation || "",
              aiProposed: Boolean(q.aiProposed),
              verified: !q.aiProposed,
              image: assignedImage,
            };
          });

          // Propagate reading passage to subsequent questions in the reading block if missing
          let currentReadingPassage: string | undefined = undefined;
          let currentPassageTitle: string | undefined = undefined;
          normalizedQuestions.forEach((q: any) => {
            if (q.readingPassage && q.readingPassage.length > 20) {
              currentReadingPassage = q.readingPassage;
              currentPassageTitle = q.passageTitle || "Đọc đoạn văn sau rồi trả lời câu hỏi:";
            } else if (currentReadingPassage && (q.type === "reading" || /đoạn văn|bài đọc|passage|paragraph|theo bài/i.test(q.question) || (q.options && q.options.length >= 2))) {
              // If it's part of a reading block, share the passage
              if (!q.readingPassage) {
                q.readingPassage = currentReadingPassage;
                q.passageTitle = currentPassageTitle;
                if (q.type === "single" || !q.type) {
                  q.type = "reading";
                }
              }
            }
          });

          return res.json({
            success: true,
            data: {
              title: parsedData.title || "Đề kiểm tra trắc nghiệm",
              subject: parsedData.subject || subjectHint || "Toán học",
              grade: parsedData.grade || gradeHint || "Lớp 4",
              topic: parsedData.topic || "",
              questions: normalizedQuestions,
            },
          });
        }
      }

      // If AI failed or returned empty questions, fallback to smart local parser
      console.warn("AI không trả về kết quả hợp lệ, tự động kích hoạt bộ bóc tách cục bộ.");
      const fallbackQuestions = parseTextLocally(combinedTextContent, extractedImages);
      return res.json({
        success: true,
        data: {
          title: "Đề kiểm tra trắc nghiệm",
          subject: subjectHint || "Toán học",
          grade: gradeHint || "Lớp 4",
          topic: "Luyện tập",
          questions: fallbackQuestions,
          notice: "Hệ thống đã nhận diện đề thi qua bộ bóc tách thông minh.",
        },
      });
    } else {
      // Fallback heuristic extraction if GEMINI_API_KEY is not configured
      console.warn("GEMINI_API_KEY chưa được thiết lập. Sử dụng bộ phân tích cục bộ dự phòng.");
      const fallbackQuestions = parseTextLocally(combinedTextContent, extractedImages);
      return res.json({
        success: true,
        data: {
          title: "Đề kiểm tra trắc nghiệm",
          subject: subjectHint || "Toán học",
          grade: gradeHint || "Lớp 4",
          topic: "Bài học",
          questions: fallbackQuestions,
          notice: "Đã sử dụng bộ phân tích cục bộ dự phòng.",
        },
      });
    }
  } catch (error: any) {
    console.error("Lỗi khi phân tích tài liệu:", error);
    // Never return an unhandled 500 crash to the teacher; fall back to local parsing
    try {
      const fallbackQuestions = parseTextLocally(req.body?.pastedText || "", []);
      return res.json({
        success: true,
        data: {
          title: "Đề kiểm tra trắc nghiệm",
          subject: req.body?.subjectHint || "Toán học",
          grade: req.body?.gradeHint || "Lớp 4",
          topic: "Tự luyện",
          questions: fallbackQuestions,
          notice: "Đã trích xuất câu hỏi từ văn bản.",
        },
      });
    } catch (innerErr) {
      return res.status(500).json({
        error: "Không thể nhận diện nội dung câu hỏi. Vui lòng kiểm tra lại tài liệu hoặc dán văn bản trực tiếp.",
      });
    }
  }
});

// Robust Local Fallback Parser for simple formats and reading passages
function parseTextLocally(text: string, images: string[]): any[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const questions: any[] = [];
  let currentQ: any = null;
  let prePassageLines: string[] = [];
  let currentPassage = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const qMatch = line.match(/^(?:(?:Câu|Bài)\s*(\d+)[:.]\s*|(\d+)[.:)]\s*)(.*)/i);
    const optMatch = line.match(/^([A-D])[.:)]\s*(.*)/i);

    if (qMatch) {
      if (!currentPassage && prePassageLines.length > 0) {
        currentPassage = prePassageLines.join(" ").replace(/^["']|["']$/g, "").trim();
      }

      if (currentQ) questions.push(currentQ);
      const questionText = qMatch[3] || line;
      currentQ = {
        id: questions.length + 1,
        question: questionText,
        type: currentPassage ? "reading" : "single",
        options: [],
        correctAnswer: 0,
        readingPassage: currentPassage || undefined,
        passageTitle: currentPassage ? "Đọc đoạn văn sau rồi trả lời câu hỏi:" : undefined,
        explanation: "",
        aiProposed: true,
        verified: false,
        image: images[questions.length] || undefined,
      };
    } else if (optMatch && currentQ) {
      currentQ.options.push(optMatch[2] || line);
    } else if (/^Đáp án[:.]\s*([A-D])/i.test(line) && currentQ) {
      const letter = line.match(/^Đáp án[:.]\s*([A-D])/i)![1].toUpperCase();
      const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
      currentQ.correctAnswer = map[letter] ?? 0;
      currentQ.aiProposed = false;
      currentQ.verified = true;
    } else if (currentQ && currentQ.options.length === 0) {
      currentQ.question += " " + line;
    } else if (!currentQ) {
      // Lines before the first question are part of the reading passage
      prePassageLines.push(line);
    }
  }
  if (currentQ) questions.push(currentQ);

  if (questions.length === 0) {
    questions.push({
      id: 1,
      question: text.slice(0, 150) || "Câu hỏi trắc nghiệm mẫu",
      type: "single",
      options: ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      correctAnswer: 0,
      explanation: "Vui lòng nhập thêm câu hỏi hoặc cấu hình Gemini API.",
      aiProposed: true,
      verified: false,
      image: images[0] || undefined,
    });
  }

  return questions;
}

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server đang chạy tại http://0.0.0.0:${PORT}`);
  });
}

startServer();
