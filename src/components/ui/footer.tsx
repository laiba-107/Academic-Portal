export function Footer() {
    return (
        <footer className="border-t border-border bg-muted/30 py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    © 2024 Student Academic Portal. All rights reserved.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <a href="#" className="hover:text-primary transition-colors">
                        Privacy Policy
                    </a>
                    <a href="#" className="hover:text-primary transition-colors">
                        Terms of Service
                    </a>
                </div>
            </div>
        </footer>
    );
}
