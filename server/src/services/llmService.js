import config from '../config/env.js';
import logger from '../utils/logger.js';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Ollama } from 'ollama';

/**
 * Service to orchestrate LLM interactions
 */
export class LlmService {
    constructor() {
        this.provider = config.llmProviders;

        if (this.provider === 'groq') {
            this.client = new OpenAI({
                apiKey: config.groqApiKey,
                baseURL: 'https://api.groq.com/openai/v1',
            });
            this.model = config.groqModel;
        } else if (this.provider === 'gemini') {
            this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
            this.model = this.genAI.getGenerativeModel({ model: config.geminiModel });
        } else if (this.provider === 'ollama') {
            this.client = new Ollama({ host: config.ollamaBaseUrl });
            this.model = config.ollamaModel;
        }
    }

    async chat(messages) {
        logger.info({ provider: this.provider }, 'Processing chat request');

        switch (this.provider) {
            case 'groq':
                return this._groqChat(messages);
            case 'gemini':
                return this._geminiChat(messages);
            case 'ollama':
                return this._ollamaChat(messages);
            case 'mock':
                return this._mockChat(messages);
            default:
                throw new Error(`Provider ${this.provider} not implemented`);
        }
    }

    async _groqChat(messages) {
        const response = await this.client.chat.completions.create({
            model: this.model,
            messages,
        });
        return {
            content: response.choices[0].message.content,
            role: 'assistant'
        };
    }

    async _geminiChat(messages) {
        // Simple conversion for Gemini: assumes last message is prompt
        const prompt = messages[messages.length - 1].content;
        const result = await this.model.generateContent(prompt);
        return {
            content: result.response.text(),
            role: 'assistant'
        };
    }

    async _ollamaChat(messages) {
        const response = await this.client.chat({
            model: this.model,
            messages,
        });
        return {
            content: response.message.content,
            role: 'assistant'
        };
    }

    _mockChat(messages) {
        return {
            content: "This is a mock response from NUTRIGUARD AI.",
            role: 'assistant'
        };
    }
}

export const llmService = new LlmService();
