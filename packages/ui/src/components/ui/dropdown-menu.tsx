"use client";
import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "../../libs/utils";

interface DropdownContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	triggerRef: React.RefObject<HTMLElement | null>;
}

const DropdownContext = React.createContext<DropdownContextValue>({
	open: false,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setOpen: () => {},
	triggerRef: { current: null },
});

function DropdownMenu({
	children,
}: {
	children?: React.ReactNode;
}): React.JSX.Element {
	const [open, setOpen] = React.useState(false);
	const triggerRef = React.useRef<HTMLElement | null>(null);

	return (
		<DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
			{children}
		</DropdownContext.Provider>
	);
}
DropdownMenu.displayName = "DropdownMenu";

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<
	HTMLButtonElement,
	DropdownMenuTriggerProps
>(({ asChild, children, onClick, ...props }, ref) => {
	const { setOpen, triggerRef } = React.useContext(DropdownContext);

	const handleClick = (e: React.MouseEvent<HTMLElement>): void => {
		(onClick as React.MouseEventHandler<HTMLElement> | undefined)?.(e);
		setOpen(true);
	};

	// Callback ref that both stores the trigger element and forwards the ref
	const setRefs = (node: HTMLElement | null): void => {
		triggerRef.current = node;
		if (typeof ref === "function") {
			ref(node as HTMLButtonElement | null);
		} else if (ref) {
			ref.current = node as HTMLButtonElement | null;
		}
	};

	if (asChild && React.isValidElement(children)) {
		return React.cloneElement(
			children as React.ReactElement<Record<string, unknown>>,
			{ ref: setRefs, onClick: handleClick },
		);
	}

	return (
		<button
			ref={setRefs as React.Ref<HTMLButtonElement>}
			onClick={handleClick}
			{...props}
		>
			{children}
		</button>
	);
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// DropdownMenuPortal — stub for API compatibility; content renders in DropdownMenuContent
function DropdownMenuPortal({
	children,
}: {
	children?: React.ReactNode;
}): React.JSX.Element {
	return <>{children}</>;
}
DropdownMenuPortal.displayName = "DropdownMenuPortal";

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
	sideOffset?: number;
	align?: "start" | "center" | "end";
}

const DropdownMenuContent = React.forwardRef<
	HTMLDivElement,
	DropdownMenuContentProps
>(
	(
		{ className, sideOffset = 4, align = "center", children, ...props },
		ref,
	) => {
		const { open, setOpen, triggerRef } = React.useContext(DropdownContext);
		const [mounted, setMounted] = React.useState(false);
		const contentRef = React.useRef<HTMLDivElement | null>(null);
		const [style, setStyle] = React.useState<React.CSSProperties>({});

		React.useEffect(() => {
			setMounted(true);
		}, []);

		// Position the menu below the trigger using fixed viewport coordinates
		React.useEffect(() => {
			if (open && triggerRef.current) {
				const rect = triggerRef.current.getBoundingClientRect();
				const newStyle: React.CSSProperties = {
					position: "fixed",
					top: rect.bottom + sideOffset,
					zIndex: 50,
				};
				if (align === "end") {
					newStyle.right = window.innerWidth - rect.right;
				} else if (align === "start") {
					newStyle.left = rect.left;
				} else {
					newStyle.left = rect.left;
				}
				setStyle(newStyle);
			}
		}, [open, triggerRef, sideOffset, align]);

		// Close on click outside trigger and content
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

		// Close on Escape key
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

		if (!mounted || !open) return null;

		return createPortal(
			<div
				ref={(node) => {
					contentRef.current = node;
					if (typeof ref === "function") ref(node);
					else if (ref) ref.current = node;
				}}
				className={cn(
					"z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
					className,
				)}
				style={style}
				{...props}
			>
				{children}
			</div>,
			document.body,
		);
	},
);
DropdownMenuContent.displayName = "DropdownMenuContent";

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
	inset?: boolean;
	disabled?: boolean;
}

const DropdownMenuItem = React.forwardRef<
	HTMLDivElement,
	DropdownMenuItemProps
>(({ className, inset, onClick, disabled, children, ...props }, ref) => {
	const { setOpen } = React.useContext(DropdownContext);

	return (
		<div
			ref={ref}
			role="menuitem"
			tabIndex={disabled ? -1 : 0}
			className={cn(
				"relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
				inset === true && "pl-8",
				disabled === true && "pointer-events-none opacity-50",
				className,
			)}
			onClick={(e) => {
				if (!disabled) {
					onClick?.(e);
					setOpen(false);
				}
			}}
			onKeyDown={(e) => {
				if (!disabled && (e.key === "Enter" || e.key === " ")) {
					onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
					setOpen(false);
				}
			}}
			{...props}
		>
			{children}
		</div>
	);
});
DropdownMenuItem.displayName = "DropdownMenuItem";

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
	inset?: boolean;
}

const DropdownMenuLabel = React.forwardRef<
	HTMLDivElement,
	DropdownMenuLabelProps
>(({ className, inset, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"px-2 py-1.5 text-sm font-semibold",
			inset === true && "pl-8",
			className,
		)}
		{...props}
	/>
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef<
	HTMLHRElement,
	React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
	<hr
		ref={ref}
		className={cn("-mx-1 my-1 h-px bg-muted border-none", className)}
		{...props}
	/>
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuGroup = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => <div ref={ref} role="group" {...props} />);
DropdownMenuGroup.displayName = "DropdownMenuGroup";

export {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
};
