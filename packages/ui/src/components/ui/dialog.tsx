"use client";
import { X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "../../libs/utils";

interface DialogContextValue {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue>({
	open: false,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onOpenChange: () => {},
});

// Dialog root — controlled via open/onOpenChange, or uncontrolled via defaultOpen
interface DialogProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	defaultOpen?: boolean;
	children?: React.ReactNode;
}

function Dialog({
	open,
	onOpenChange,
	defaultOpen = false,
	children,
}: DialogProps): React.JSX.Element {
	const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
	const isControlled = open !== undefined;
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	const isOpen = isControlled ? (open ?? false) : internalOpen;

	const handleOpenChange = React.useCallback(
		(val: boolean) => {
			if (!isControlled) setInternalOpen(val);
			onOpenChange?.(val);
		},
		[isControlled, onOpenChange],
	);

	return (
		<DialogContext.Provider
			value={{ open: isOpen, onOpenChange: handleOpenChange }}
		>
			{children}
		</DialogContext.Provider>
	);
}
Dialog.displayName = "Dialog";

// DialogTrigger — opens the dialog on click; supports asChild
interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean;
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
	({ asChild, children, onClick, ...props }, ref) => {
		const { onOpenChange } = React.useContext(DialogContext);

		const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
			onClick?.(e);
			onOpenChange(true);
		};

		if (asChild && React.isValidElement(children)) {
			return React.cloneElement(
				children as React.ReactElement<Record<string, unknown>>,
				{ onClick: handleClick },
			);
		}

		return (
			<button ref={ref} onClick={handleClick} {...props}>
				{children}
			</button>
		);
	},
);
DialogTrigger.displayName = "DialogTrigger";

// DialogClose — closes the dialog on click
const DialogClose = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
	const { onOpenChange } = React.useContext(DialogContext);

	return (
		<button
			ref={ref}
			onClick={(e) => {
				onClick?.(e);
				onOpenChange(false);
			}}
			{...props}
		>
			{children}
		</button>
	);
});
DialogClose.displayName = "DialogClose";

// DialogPortal — renders children into document.body via createPortal when open
interface DialogPortalProps {
	children?: React.ReactNode;
}

function DialogPortal({
	children,
}: DialogPortalProps): React.JSX.Element | null {
	const { open } = React.useContext(DialogContext);
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || !open) return null;
	return createPortal(<>{children}</>, document.body);
}
DialogPortal.displayName = "DialogPortal";

// DialogOverlay — full-screen backdrop, click closes dialog
const DialogOverlay = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, onClick, ...props }, ref) => {
	const { onOpenChange } = React.useContext(DialogContext);

	return (
		<div
			ref={ref}
			className={cn("fixed inset-0 z-50 bg-black/80", className)}
			onClick={(e) => {
				onClick?.(e);
				onOpenChange(false);
			}}
			{...props}
		/>
	);
});
DialogOverlay.displayName = "DialogOverlay";

// DialogContent — renders overlay + modal panel in portal; Escape key closes
const DialogContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
	const { open, onOpenChange } = React.useContext(DialogContext);

	// Bind Escape key only while open
	React.useEffect(() => {
		if (!open) return;
		const handleKeyDown = (e: KeyboardEvent): void => {
			if (e.key === "Escape") onOpenChange(false);
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open, onOpenChange]);

	return (
		<DialogPortal>
			<DialogOverlay />
			<div
				ref={ref}
				className={cn(
					"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
					className,
				)}
				{...props}
			>
				{children}
				<DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</DialogClose>
			</div>
		</DialogPortal>
	);
});
DialogContent.displayName = "DialogContent";

function DialogHeader({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
	return (
		<div
			className={cn(
				"flex flex-col space-y-1.5 text-center sm:text-left",
				className,
			)}
			{...props}
		/>
	);
}
DialogHeader.displayName = "DialogHeader";

function DialogFooter({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
	return (
		<div
			className={cn(
				"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
				className,
			)}
			{...props}
		/>
	);
}
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h2
		ref={ref}
		className={cn(
			"text-lg font-semibold leading-none tracking-tight",
			className,
		)}
		{...props}
	/>
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
DialogDescription.displayName = "DialogDescription";

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
