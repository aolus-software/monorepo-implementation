"use client";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "../../libs/utils";

interface SelectContextValue {
	value: string;
	onValueChange: (value: string) => void;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	triggerRef: React.RefObject<HTMLButtonElement | null>;
	registerLabel: (value: string, label: string) => void;
	getLabel: (value: string) => string | undefined;
}

const SelectContext = React.createContext<SelectContextValue>({
	value: "",
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onValueChange: () => {},
	open: false,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setOpen: () => {},
	triggerRef: { current: null },
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	registerLabel: () => {},
	getLabel: () => undefined,
});

interface SelectProps {
	value?: string;
	onValueChange?: (value: string) => void;
	defaultValue?: string;
	disabled?: boolean;
	children?: React.ReactNode;
}

function Select({
	value,
	onValueChange,
	defaultValue = "",
	children,
}: SelectProps): React.JSX.Element {
	const [internalValue, setInternalValue] = React.useState(defaultValue);
	const isControlled = value !== undefined;
	const currentValue = isControlled ? (value ?? "") : internalValue; // eslint-disable-line @typescript-eslint/no-unnecessary-condition

	const [open, setOpen] = React.useState(false);
	const triggerRef = React.useRef<HTMLButtonElement | null>(null);

	// Label registry — persists across renders without causing re-renders
	const labelsRef = React.useRef<Map<string, string>>(new Map());

	const registerLabel = React.useCallback((val: string, label: string) => {
		labelsRef.current.set(val, label);
	}, []);

	const getLabel = React.useCallback((val: string) => {
		return labelsRef.current.get(val);
	}, []);

	const handleValueChange = React.useCallback(
		(val: string) => {
			if (!isControlled) setInternalValue(val);
			onValueChange?.(val);
			setOpen(false);
		},
		[isControlled, onValueChange],
	);

	return (
		<SelectContext.Provider
			value={{
				value: currentValue,
				onValueChange: handleValueChange,
				open,
				setOpen,
				triggerRef,
				registerLabel,
				getLabel,
			}}
		>
			{children}
		</SelectContext.Provider>
	);
}
Select.displayName = "Select";

type SelectTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
	({ className, children, onClick, ...props }, ref) => {
		const { open, setOpen, triggerRef } = React.useContext(SelectContext);

		const setRefs = (node: HTMLButtonElement | null): void => {
			triggerRef.current = node;
			if (typeof ref === "function") ref(node);
			else if (ref) ref.current = node;
		};

		return (
			<button
				ref={setRefs}
				type="button"
				role="combobox"
				aria-expanded={open}
				className={cn(
					"flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				onClick={(e) => {
					onClick?.(e);
					setOpen((prev) => !prev);
				}}
				{...props}
			>
				<span className="line-clamp-1">{children}</span>
				<ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
			</button>
		);
	},
);
SelectTrigger.displayName = "SelectTrigger";

// SelectValue — shows the label of the selected item, or placeholder if none
interface SelectValueProps {
	placeholder?: string;
	children?: React.ReactNode;
}

function SelectValue({ placeholder }: SelectValueProps): React.JSX.Element {
	const { value, getLabel } = React.useContext(SelectContext);

	if (!value) {
		return <span className="text-muted-foreground">{placeholder}</span>;
	}

	const label = getLabel(value);
	return <span>{label ?? value}</span>;
}
SelectValue.displayName = "SelectValue";

// SelectContent — portal listbox positioned below trigger; always renders to register labels
interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
	position?: "popper" | "item-aligned";
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
	({ className, children, position: _position = "popper", ...props }, ref) => {
		const { open, setOpen, triggerRef } = React.useContext(SelectContext);
		const [mounted, setMounted] = React.useState(false);
		const contentRef = React.useRef<HTMLDivElement | null>(null);
		const [style, setStyle] = React.useState<React.CSSProperties>({});

		React.useEffect(() => {
			setMounted(true);
		}, []);

		// Compute position below trigger when opening
		React.useEffect(() => {
			if (open && triggerRef.current) {
				const rect = triggerRef.current.getBoundingClientRect();
				setStyle({
					position: "fixed",
					top: rect.bottom + 4,
					left: rect.left,
					width: rect.width,
					zIndex: 50,
				});
			}
		}, [open, triggerRef]);

		// Close on click outside
		React.useEffect(() => {
			if (!open) return;
			const handleMouseDown = (e: MouseEvent): void => {
				const target = e.target as Node;
				if (
					contentRef.current &&
					!contentRef.current.contains(target) &&
					triggerRef.current &&
					!triggerRef.current.contains(target)
				) {
					setOpen(false);
				}
			};
			document.addEventListener("mousedown", handleMouseDown);
			return () => {
				document.removeEventListener("mousedown", handleMouseDown);
			};
		}, [open, setOpen, triggerRef]);

		// Close on Escape
		React.useEffect(() => {
			if (!open) return;
			const handleKeyDown = (e: KeyboardEvent): void => {
				if (e.key === "Escape") setOpen(false);
			};
			document.addEventListener("keydown", handleKeyDown);
			return () => {
				document.removeEventListener("keydown", handleKeyDown);
			};
		}, [open, setOpen]);

		// Always render content in portal (display:none when closed) so SelectItem
		// useEffect runs and registers labels even before first open
		if (!mounted) return null;

		return createPortal(
			<div
				ref={(node) => {
					contentRef.current = node;
					if (typeof ref === "function") ref(node);
					else if (ref) ref.current = node;
				}}
				className={cn(
					"z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
					className,
				)}
				style={{ ...style, display: open ? undefined : "none" }}
				{...props}
			>
				<div className="p-1">{children}</div>
			</div>,
			document.body,
		);
	},
);
SelectContent.displayName = "SelectContent";

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
	value: string;
	disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
	({ className, children, value, disabled, ...props }, ref) => {
		const {
			onValueChange,
			value: selectedValue,
			registerLabel,
		} = React.useContext(SelectContext);

		// Register this item's label for SelectValue display
		React.useEffect(() => {
			const label =
				typeof children === "string"
					? children
					: typeof children === "number"
						? String(children)
						: undefined;
			if (label !== undefined) registerLabel(value, label);
		}, [value, children, registerLabel]);

		const isSelected = selectedValue === value;

		return (
			<div
				ref={ref}
				role="option"
				aria-selected={isSelected}
				className={cn(
					"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
					disabled === true && "pointer-events-none opacity-50",
					className,
				)}
				onClick={() => {
					if (!disabled) onValueChange(value);
				}}
				{...props}
			>
				{isSelected && (
					<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
						<Check className="h-4 w-4" />
					</span>
				)}
				{children}
			</div>
		);
	},
);
SelectItem.displayName = "SelectItem";

const SelectGroup = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => <div ref={ref} role="group" {...props} />);
SelectGroup.displayName = "SelectGroup";

const SelectLabel = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
		{...props}
	/>
));
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = React.forwardRef<
	HTMLHRElement,
	React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
	<hr
		ref={ref}
		className={cn("-mx-1 my-1 h-px bg-muted border-none", className)}
		{...props}
	/>
));
SelectSeparator.displayName = "SelectSeparator";

// Scroll buttons — stub implementations for API compatibility
const SelectScrollUpButton = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"flex cursor-default items-center justify-center py-1",
			className,
		)}
		{...props}
	>
		<ChevronUp className="h-4 w-4" />
	</div>
));
SelectScrollUpButton.displayName = "SelectScrollUpButton";

const SelectScrollDownButton = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"flex cursor-default items-center justify-center py-1",
			className,
		)}
		{...props}
	>
		<ChevronDown className="h-4 w-4" />
	</div>
));
SelectScrollDownButton.displayName = "SelectScrollDownButton";

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
