import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "../../libs/utils";

// Preserves Radix CheckboxPrimitive.Root API: checked, onCheckedChange, disabled, id, name, value
interface CheckboxProps extends Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	"type" | "onChange"
> {
	onCheckedChange?: (checked: boolean | "indeterminate") => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
	({ className, onCheckedChange, checked, ...props }, ref) => (
		<span className="relative inline-flex h-4 w-4 shrink-0">
			<input
				type="checkbox"
				ref={ref}
				checked={checked}
				className={cn(
					"peer absolute inset-0 h-4 w-4 cursor-pointer appearance-none rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary",
					className,
				)}
				onChange={(e) => {
					onCheckedChange?.(e.target.checked);
				}}
				{...props}
			/>
			{/* Checkmark icon — visible only when checked via peer-checked */}
			<span className="pointer-events-none absolute inset-0 flex items-center justify-center text-primary-foreground opacity-0 peer-checked:opacity-100">
				<Check className="h-3 w-3" />
			</span>
		</span>
	),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
