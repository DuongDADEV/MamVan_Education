/**
 * KHUNG TÍCH HỢP GEMINI AI (GeminiAIService)
 * 
 * =========================================================================
 * ⚠️ LƯU Ý BẢO MẬT QUAN TRỌNG:
 * - KHÔNG BAO GIỜ đặt API Key của Gemini hoặc bất kỳ dịch vụ AI nào trực tiếp
 *   trong code phía trình duyệt (client-side bundle).
 * - Khi triển khai Supabase / Production thật:
 *   + Gọi thông qua Supabase Edge Function (ví dụ: `/functions/v1/ai-generate`)
 *     hoặc API Gateway bảo mật có xác thực phiên đăng nhập của Giáo viên.
 *   + Quản lý Secret Key trong Supabase Dashboard Vault / Environment Secrets.
 *   + Kiểm soát rate-limit và hạn ngạch token trên từng trường/giáo viên.
 * =========================================================================
 */

import {
  AIService,
  AISource,
  AIKeySummaryOptions,
  AITheoryOptions,
  AIQuestionsOptions,
  AIRubricCriterion,
  AIEssayGradingOptions,
  AIEssayGradingResult,
  AIChatResponse,
} from './AIService.ts';
import { Question, KeyPoint, TheoryBlock } from '../../types.ts';

export class GeminiAIService implements AIService {
  private edgeFunctionUrl: string;

  constructor(edgeFunctionUrl = '/api/ai-proxy') {
    this.edgeFunctionUrl = edgeFunctionUrl;
  }

  async generateKeySummary(sources: AISource[], options?: AIKeySummaryOptions): Promise<KeyPoint[]> {
    // TODO: Khi kết nối Supabase, gọi:
    // const res = await fetch(`${this.edgeFunctionUrl}/summary`, { method: 'POST', body: JSON.stringify({ sources, options }) });
    // return await res.json();
    throw new Error('GeminiAIService chưa được kích hoạt. Vui lòng sử dụng MockAIService trong giai đoạn demo.');
  }

  async generateTheory(sources: AISource[], options?: AITheoryOptions): Promise<TheoryBlock[]> {
    throw new Error('GeminiAIService chưa được kích hoạt. Vui lòng sử dụng MockAIService trong giai đoạn demo.');
  }

  async generateQuestions(sources: AISource[], options?: AIQuestionsOptions): Promise<Question[]> {
    throw new Error('GeminiAIService chưa được kích hoạt. Vui lòng sử dụng MockAIService trong giai đoạn demo.');
  }

  async suggestEssayGrade(
    essayText: string,
    rubric: AIRubricCriterion[],
    sampleEssays?: any[],
    options?: AIEssayGradingOptions
  ): Promise<AIEssayGradingResult> {
    throw new Error('GeminiAIService chưa được kích hoạt. Vui lòng sử dụng MockAIService trong giai đoạn demo.');
  }

  async chatWithSources(
    sources: AISource[],
    message: string,
    history?: { role: 'user' | 'assistant'; text: string }[]
  ): Promise<AIChatResponse> {
    throw new Error('GeminiAIService chưa được kích hoạt. Vui lòng sử dụng MockAIService trong giai đoạn demo.');
  }
}
