import { useEffect, useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";

interface QuantityStepperProps {
    value: number;
    onChange: (quantity: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    size?: "sm" | "md";
}

const sanitizeQuantity = (value: string) => value.replace(/[^\d]/g, "");

const clampQuantity = (value: number, min: number, max?: number) => {
    const safeValue = Number.isFinite(value) ? Math.floor(value) : min;
    const upperLimit = typeof max === "number" && max >= min ? max : undefined;
    return Math.max(min, upperLimit ? Math.min(upperLimit, safeValue) : safeValue);
};

export const QuantityStepper = ({
    value,
    onChange,
    min = 1,
    max,
    disabled = false,
    size = "md",
}: QuantityStepperProps) => {
    const [draftValue, setDraftValue] = useState(String(value));
    const buttonSize = size === "sm" ? "h-7 w-7 text-sm" : "h-8 w-8 text-base";
    const inputSize = size === "sm" ? "h-7 w-12 text-sm" : "h-8 w-16 text-sm";
    const canDecrease = !disabled && value > min;
    const canIncrease = !disabled && (typeof max !== "number" || value < max);

    useEffect(() => {
        setDraftValue(String(value));
    }, [value]);

    const commitQuantity = (rawValue: string) => {
        const nextQuantity = clampQuantity(Number(rawValue), min, max);
        setDraftValue(String(nextQuantity));
        if (nextQuantity !== value) {
            onChange(nextQuantity);
        }
    };

    const handleInputChange = (rawValue: string) => {
        const nextDraftValue = sanitizeQuantity(rawValue);
        setDraftValue(nextDraftValue);

        if (!nextDraftValue) return;

        const nextQuantity = clampQuantity(Number(nextDraftValue), min, max);
        if (nextQuantity !== value) {
            onChange(nextQuantity);
        }
    };

    return (
        <div className="flex items-center gap-2 rounded-full bg-background-main px-2 py-1">
            <button
                type="button"
                disabled={!canDecrease}
                onClick={() => onChange(clampQuantity(value - 1, min, max))}
                className={`flex ${buttonSize} items-center justify-center rounded-full bg-white text-text-main shadow-sm transition active:scale-95 disabled:text-text-muted disabled:shadow-none`}
                aria-label="Giảm số lượng"
            >
                <AiOutlineMinus />
            </button>

            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={disabled}
                value={draftValue}
                onChange={(event) => handleInputChange(event.target.value)}
                onBlur={() => commitQuantity(draftValue)}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        event.currentTarget.blur();
                    }
                }}
                aria-label="Số lượng"
                className={`${inputSize} rounded-full bg-white text-center font-extrabold text-text-main shadow-sm outline-none ring-1 ring-transparent transition focus:ring-primary disabled:text-text-muted`}
            />

            <button
                type="button"
                disabled={!canIncrease}
                onClick={() => onChange(clampQuantity(value + 1, min, max))}
                className={`flex ${buttonSize} items-center justify-center rounded-full bg-white text-text-main shadow-sm transition active:scale-95 disabled:text-text-muted disabled:shadow-none`}
                aria-label="Tăng số lượng"
            >
                <AiOutlinePlus />
            </button>
        </div>
    );
};
