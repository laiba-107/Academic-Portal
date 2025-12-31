export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-xl shadow-lg border border-border">
                {children}
            </div>
        </div>
    );
}
