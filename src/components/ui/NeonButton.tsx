import type { ButtonHTMLAttributes, ReactNode } from 'react';

type NeonButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type NeonButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: NeonButtonVariant;
    isLoading?: boolean;
    loadingText?: string;
    children: ReactNode;
};

const VARIANT_CLASSES: Record<NeonButtonVariant, string> = {
    primary:
        'bg-primary/80 hover:bg-primary text-black border-transparent shadow-[0_0_12px_rgba(0,243,255,0.3)] hover:shadow-[0_0_20px_rgba(0,243,255,0.5)]',
    secondary:
        'bg-white/[0.05] hover:bg-white/[0.10] text-white border-white/10 hover:border-white/20',
    danger:
        'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30 hover:border-red-500/50',
    ghost:
        'bg-transparent hover:bg-white/[0.05] text-white/60 hover:text-white border-transparent',
};

/**
 * NeonButton — styled CTA button for the SMRE dashboard.
 * Handles its own loading state with accessible disabled behavior.
 */
export function NeonButton({
    variant = 'primary',
    isLoading = false,
    loadingText,
    disabled,
    children,
    className = '',
    ...rest
}: NeonButtonProps) {
    const isDisabled = disabled || isLoading;

    return (
        <button
            {...rest}
            disabled={isDisabled}
            className={`
                inline-flex items-center justify-center gap-2
                px-4 py-1.5
                rounded-lg border
                font-bold text-[10px] tracking-widest uppercase font-mono
                transition-all duration-150
                disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                ${VARIANT_CLASSES[variant]}
                ${className}
            `}
        >
            {isLoading && (
                <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            )}
            {isLoading && loadingText ? loadingText : children}
        </button>
    );
}
