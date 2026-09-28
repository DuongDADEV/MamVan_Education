/**
 * Xuất khẩu AIService instance và các kiểu dữ liệu
 */

import { AIService } from './AIService.ts';
import { MockAIService } from './MockAIService.ts';
import { GeminiAIService } from './GeminiAIService.ts';

// Mặc định sử dụng MockAIService (kèm độ trễ giả lập và mô phỏng ngữ văn thực tế)
export const aiService: AIService = new MockAIService();

export { MockAIService, GeminiAIService };
export * from './AIService.ts';
