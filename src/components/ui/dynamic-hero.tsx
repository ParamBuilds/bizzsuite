import React, { useEffect, useRef, useCallback, useState, forwardRef } from 'react';

// Helper to parse 'rgb(r, g, b)' or 'rgba(r, g, b, a)' string to {r, g, b}
const parseRgbColor = (colorString: string | null) => {
    if (!colorString) return null;
    const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (match) {
        return {
            r: parseInt(match[1], 10),
            g: parseInt(match[2], 10),
            b: parseInt(match[3], 10),
        };
    }
    return null;
};

// A simple SVG Play Icon
const PlayIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
    </svg>
);

interface NavItem {
    id: string;
    label: string;
    href?: string;
    onClick?: () => void;
}

const defaultNavItems: NavItem[] = [
    { id: 'home', label: 'Home', onClick: () => console.info('Default Home clicked') },
    { id: 'about', label: 'About', href: '#about-section' },
    { id: 'pricing', label: 'Pricing', onClick: () => console.info('Default Pricing clicked') },
    { id: 'get-started-nav', label: 'Get Started', onClick: () => console.info('Default Nav Get Started clicked') },
];

interface HeroSectionProps {
    heading?: string;
    tagline?: string;
    buttonText?: string;
    imageUrl?: string;
    videoUrl?: string;
    navItems?: NavItem[];
    onButtonClick?: () => void;
}

const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(({
    heading = "Something you really want",
    tagline = "You can't live without this product. I'm sure of it.",
    buttonText = "Get Started",
    imageUrl,
    videoUrl,
    navItems = defaultNavItems,
    onButtonClick,
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const targetRef = useRef<HTMLButtonElement>(null);
    const mousePosRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showVideo, setShowVideo] = useState(false);

    const resolvedCanvasColorsRef = useRef({
        strokeStyle: { r: 128, g: 128, b: 128 },
    });

    useEffect(() => {
        const tempElement = document.createElement('div');
        tempElement.style.display = 'none';
        document.body.appendChild(tempElement);

        const updateResolvedColors = () => {
            tempElement.style.color = 'var(--foreground)';
            const computedFgColor = getComputedStyle(tempElement).color;
            const parsedFgColor = parseRgbColor(computedFgColor);
            if (parsedFgColor) {
                resolvedCanvasColorsRef.current.strokeStyle = parsedFgColor;
            } else {
                const isDarkMode = document.documentElement.classList.contains('dark');
                resolvedCanvasColorsRef.current.strokeStyle = isDarkMode ? { r: 250, g: 250, b: 250 } : { r: 10, g: 10, b: 10 };
            }
        };
        updateResolvedColors();
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class' && mutation.target === document.documentElement) {
                    updateResolvedColors();
                    break;
                }
            }
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => {
            observer.disconnect();
            if (tempElement.parentNode) {
                tempElement.parentNode.removeChild(tempElement);
            }
        };
    }, []);

    const drawArrow = useCallback(() => {
        if (!canvasRef.current || !targetRef.current || !ctxRef.current) return;

        const targetEl = targetRef.current;
        const ctx = ctxRef.current;
        const mouse = mousePosRef.current;

        const x0 = mouse.x;
        const y0 = mouse.y;

        if (x0 === null || y0 === null) return;

        const rect = targetEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const a = Math.atan2(cy - y0, cx - x0);
        const x1 = cx - Math.cos(a) * (rect.width / 2 + 12);
        const y1 = cy - Math.sin(a) * (rect.height / 2 + 12);

        const midX = (x0 + x1) / 2;
        const midY = (y0 + y1) / 2;
        const offset = Math.min(200, Math.hypot(x1 - x0, y1 - y0) * 0.5);
        const t = Math.max(-1, Math.min(1, (y0 - y1) / 200));
        const controlX = midX;
        const controlY = midY + offset * t;
        
        const r = Math.sqrt((x1 - x0)**2 + (y1 - y0)**2);
        const opacity = Math.min(1.0, (r - Math.max(rect.width, rect.height) / 2) / 500); 

        const arrowColor = resolvedCanvasColorsRef.current.strokeStyle;
        ctx.strokeStyle = `rgba(${arrowColor.r}, ${arrowColor.g}, ${arrowColor.b}, ${opacity})`;
        ctx.lineWidth = 2;

        // Draw curve
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(controlX, controlY, x1, y1);
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.restore();

        // Draw arrowhead
        const angle = Math.atan2(y1 - controlY, x1 - controlX);
        const headLength = 10 * (ctx.lineWidth / 1.5); 
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(
            x1 - headLength * Math.cos(angle - Math.PI / 6),
            y1 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(x1, y1);
        ctx.lineTo(
            x1 - headLength * Math.cos(angle + Math.PI / 6),
            y1 - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !targetRef.current) return;

        ctxRef.current = canvas.getContext("2d");
        const ctx = ctxRef.current;

        const updateCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mousePosRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener("resize", updateCanvasSize);
        window.addEventListener("mousemove", handleMouseMove);
        updateCanvasSize();

        const animateLoop = () => {
            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawArrow();
            }
            animationFrameIdRef.current = requestAnimationFrame(animateLoop);
        };
        
        animateLoop();

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            window.removeEventListener("mousemove", handleMouseMove);
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [drawArrow]);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement && videoUrl) {
            const handleVideoEnd = () => {
                setShowVideo(false);
                videoElement.currentTime = 0;
            };

            if (showVideo) {
                videoElement.play().catch(error => {
                    console.error("HeroSection: Error playing video:", error);
                    setShowVideo(false);
                });
                videoElement.addEventListener('ended', handleVideoEnd);
            } else {
                videoElement.pause();
            }

            return () => {
                videoElement.removeEventListener('ended', handleVideoEnd);
            };
        }
    }, [showVideo, videoUrl]);

    const handlePlayButtonClick = () => {
        if (videoUrl) {
            setShowVideo(true);
        }
    };

    return (
        <section className="relative min-h-screen w-full bg-background overflow-hidden">
            <nav className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-center gap-1 sm:gap-2 px-4 py-4 md:py-6">
                {navItems.map((item) => {
                    const commonProps = {
                        key: item.id,
                        className: "py-2 px-3 sm:px-4 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/10 dark:hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-150 ease-in-out whitespace-nowrap",
                        onClick: item.onClick,
                    };
                    if (item.href) {
                        return (
                            <a {...commonProps} href={item.href}>
                                {item.label}
                            </a>
                        );
                    }
                    return (
                        <button {...commonProps} type="button">
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20 md:py-24">
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight mb-4 md:mb-6 max-w-4xl mx-auto leading-tight">
                        {heading}
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {tagline}
                    </p>
                </div>

                <div className="mb-8 md:mb-12">
                    <button
                        ref={targetRef}
                        onClick={onButtonClick}
                        className="px-8 py-4 text-lg font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-out focus:outline-none focus:ring-4 focus:ring-ring/50"
                    >
                        {buttonText}
                    </button>
                </div>

                <div className="w-full max-w-4xl mx-auto">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card aspect-video">
                        <div className="absolute inset-0 flex items-center justify-center">
                            {imageUrl && (
                                <img
                                    src={imageUrl}
                                    alt="Hero"
                                    className={`w-full h-full object-cover transition-opacity duration-300 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
                                />
                            )}
                            {videoUrl && (
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
                                    playsInline
                                />
                            )}
                            {!showVideo && videoUrl && imageUrl && (
                                <button
                                    onClick={handlePlayButtonClick}
                                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
                                    aria-label="Play video"
                                >
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform shadow-xl">
                                        <PlayIcon className="w-8 h-8 md:w-10 md:h-10 ml-1" />
                                    </div>
                                </button>
                            )}
                            {!imageUrl && !videoUrl && (
                                <div className="w-full h-full bg-gradient-to-br from-muted/30 via-background to-muted/50 p-4 md:p-6">
                                    {/* Animated Dashboard Mockup */}
                                    <div className="h-full flex flex-col gap-3 md:gap-4">
                                        {/* Header Bar */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                                    <div className="w-4 h-4 rounded bg-primary animate-pulse" />
                                                </div>
                                                <div className="h-4 w-24 bg-muted-foreground/20 rounded animate-pulse" />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="h-8 w-8 rounded-full bg-muted-foreground/10 animate-pulse" />
                                                <div className="h-8 w-8 rounded-full bg-muted-foreground/10 animate-pulse" style={{ animationDelay: '0.1s' }} />
                                            </div>
                                        </div>
                                        
                                        {/* Stats Row */}
                                        <div className="grid grid-cols-4 gap-2 md:gap-3">
                                            {[
                                                { color: 'bg-primary', delay: '0s' },
                                                { color: 'bg-success', delay: '0.1s' },
                                                { color: 'bg-warning', delay: '0.2s' },
                                                { color: 'bg-accent', delay: '0.3s' }
                                            ].map((stat, i) => (
                                                <div key={i} className="p-2 md:p-3 rounded-lg bg-card border border-border/50 shadow-sm">
                                                    <div className={`h-1.5 w-8 ${stat.color} rounded mb-2 animate-pulse`} style={{ animationDelay: stat.delay }} />
                                                    <div className="h-5 w-12 bg-foreground/10 rounded animate-pulse" style={{ animationDelay: stat.delay }} />
                                                    <div className="h-3 w-16 bg-muted-foreground/10 rounded mt-1 animate-pulse" style={{ animationDelay: stat.delay }} />
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Main Content */}
                                        <div className="flex-1 grid grid-cols-3 gap-3 md:gap-4">
                                            {/* Chart Area */}
                                            <div className="col-span-2 rounded-lg bg-card border border-border/50 p-3 md:p-4 shadow-sm">
                                                <div className="h-3 w-20 bg-muted-foreground/20 rounded mb-3 animate-pulse" />
                                                <div className="flex items-end gap-1 h-[calc(100%-24px)]">
                                                    {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((height, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex-1 bg-primary/60 rounded-t transition-all duration-500"
                                                            style={{ 
                                                                height: `${height}%`,
                                                                animationDelay: `${i * 0.05}s`,
                                                                opacity: 0.4 + (i * 0.05)
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {/* Recent List */}
                                            <div className="rounded-lg bg-card border border-border/50 p-3 md:p-4 shadow-sm">
                                                <div className="h-3 w-16 bg-muted-foreground/20 rounded mb-3 animate-pulse" />
                                                <div className="space-y-2">
                                                    {[1, 2, 3, 4].map((item) => (
                                                        <div key={item} className="flex items-center gap-2 p-2 rounded bg-muted/30 animate-pulse" style={{ animationDelay: `${item * 0.1}s` }}>
                                                            <div className="w-6 h-6 rounded-full bg-primary/20" />
                                                            <div className="flex-1">
                                                                <div className="h-2.5 w-full bg-muted-foreground/15 rounded" />
                                                                <div className="h-2 w-2/3 bg-muted-foreground/10 rounded mt-1" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                className="fixed inset-0 z-0 pointer-events-none"
            />

            <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        </section>
    );
});

HeroSection.displayName = 'HeroSection';

export { HeroSection };
