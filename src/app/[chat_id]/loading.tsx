export default function Loading() {
    return (
        <div className="flex items-center justify-center h-full bg-linear-30 from-background/95 to to-foreground/95">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
}