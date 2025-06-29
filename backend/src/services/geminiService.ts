import axios from 'axios';

export class GeminiService {
  private apiKey: string;
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Gemini API key not configured');
    }
  }

  async generateReport(analysis: Record<string, unknown>, template: string): Promise<string> {
    try {
      const prompt = this.buildReportPrompt(analysis, template);
      
      const response = await axios.post(
        `${this.baseURL}/models/gemini-1.5-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini report generation error:', error);
      return this.generateFallbackReport(analysis);
    }
  }

  async generateChatResponse(message: string, similarCases: Record<string, unknown>[], context?: Record<string, unknown>): Promise<string> {
    try {
      const prompt = this.buildChatPrompt(message, similarCases, context);
      
      const response = await axios.post(
        `${this.baseURL}/models/gemini-1.5-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini chat response error:', error);
      return 'I apologize, but I\'m having trouble processing your request right now. Please try again later.';
    }
  }

  private buildReportPrompt(analysis: Record<string, unknown>, template: string): string {
    const dicomFileData = analysis.dicomFileId as Record<string, unknown>;
    const findings = analysis.findings as Array<Record<string, unknown>>;
    
    return `
      Generate a professional medical imaging report based on the following analysis:
      
      Patient ID: ${dicomFileData.patientId || 'Unknown'}
      Study Type: ${dicomFileData.modality || 'Unknown'}
      Body Part: ${dicomFileData.bodyPart || 'Unknown'}
      
      AI Analysis Findings:
      ${findings.map(f => `- ${f.type}: ${f.description} (Confidence: ${((f.confidence as number) * 100).toFixed(1)}%)`).join('\n')}
      
      Template: ${template}
      
      Please generate a structured radiology report including:
      1. Clinical History (if available)
      2. Technique
      3. Findings
      4. Impression
      5. Recommendations
      
      Use professional medical terminology and follow standard radiology reporting conventions.
    `;
  }

  private buildChatPrompt(message: string, similarCases: Record<string, unknown>[], _context?: Record<string, unknown>): string {
    const casesContext = similarCases.length > 0 
      ? `\n\nSimilar cases for reference:\n${similarCases.map(c => `- ${c.description}`).join('\n')}`
      : '';

    return `
      You are an AI medical assistant specializing in radiology and medical imaging. 
      Respond to the following query with accurate, helpful medical information.
      
      User Query: ${message}
      ${casesContext}
      
      Please provide a comprehensive, professional response that includes:
      - Direct answer to the query
      - Relevant medical context
      - Differential diagnoses when appropriate
      - Recommendations for further evaluation if needed
      
      Keep the response informative but accessible to medical professionals.
    `;
  }

  private generateFallbackReport(analysis: Record<string, unknown>): string {
    const dicomFileData = analysis.dicomFileId as Record<string, unknown>;
    const findings = analysis.findings as Array<Record<string, unknown>>;
    
    return `
MEDICAL IMAGING REPORT

Patient ID: ${dicomFileData.patientId || 'Unknown'}
Study Date: ${new Date().toLocaleDateString()}
Modality: ${dicomFileData.modality || 'Unknown'}

FINDINGS:
${findings.map(f => `${f.type}: ${f.description}`).join('\n')}

IMPRESSION:
AI-assisted analysis completed. ${findings.length} finding(s) identified.
Overall confidence: ${((analysis.confidence as number) * 100).toFixed(1)}%

RECOMMENDATIONS:
Clinical correlation recommended. Consider follow-up imaging if clinically indicated.

This report was generated using AI assistance and should be reviewed by a qualified radiologist.
    `;
  }
}