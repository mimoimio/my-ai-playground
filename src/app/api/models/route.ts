import { NextResponse } from "next/server";

export async function GET() {
    try {
        const models = [
            // { name: "gpt-4.1", provider: "openai" },
            // { name: "gpt-4.1-nano", provider: "openai" },
            // { name: "o1", provider: "openai" },
            // { name: "o3", provider: "openai" },
            // { name: "o4-mini", provider: "openai" },
            // { name: "gpt-3.5-turbo", provider: "openai" },
            { name: "gemma2-9b-it", provider: "groq" },
            { name: "llama-3.1-8b-instant", provider: "groq" },
            { name: "llama-3.3-70b-versatile", provider: "groq" },
            { name: "deepseek-r1-distill-llama-70b", provider: "groq" },
            { name: "qwen/qwen3-32b", provider: "groq" },
            { name: "mistral-saba-24b", provider: "groq" },
            { name: "meta-llama/llama-4-maverick-17b-128e-instruct", provider: "groq" },
        ];
        return NextResponse.json(models);
    } catch (error) {
        console.error('Failed to fetch models:', error);
        return NextResponse.json(
            { error: 'Failed to fetch models' },
            { status: 500 }
        );
    }
}
