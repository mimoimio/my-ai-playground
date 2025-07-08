import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';           // GitHub‑style tables, task‑lists, etc.

export default function MarkdownViewer({ source }: { source: string }) {
    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {source}
        </ReactMarkdown>
    );
}
