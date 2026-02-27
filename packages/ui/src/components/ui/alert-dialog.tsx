"use client";
import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "../../libs/utils";
import { buttonVariants } from "./button";

interface AlertDialogContextValue {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue>({
	open: false,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onOpenChange: () => {},
});

// AlertDialog root — controlled via open/onOpenChange, or uncontrolled via defaultOpen
interface AlertDialogProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	defaultOpen?: boolean;
	children?: React.ReactNode;
}

function AlertDialog({
	open,
	onOpenChange,
	defaultOpen = false,
	children,
}: AlertDialogProps): React.JSX.Element {
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
		<AlertDialogContext.Provider
			value={{ open: isOpen, onOpenChange: handleOpenChange }}
		>
			{children}
		</AlertDialogContext.Provider>
	);
}
AlertDialog.displayName = "AlertDialog";

interface AlertDialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean;
}

const AlertDialogTrigger = React.forwardRef<
	HTMLButtonElement,
	AlertDialogTriggerProps
>(({ asChild, children, onClick, ...props }, ref) => {
	const { onOpenChange } = React.useContext(AlertDialogContext);

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
});
AlertDialogTrigger.displayName = "AlertDialogTrigger";

// AlertDialogPortal — renders into document.body when open
interface AlertDialogPortalProps {
	children?: React.ReactNode;
}

function AlertDialogPortal({
	children,
}: AlertDialogPortalProps): React.JSX.Element | null {
	const { open } = React.useContext(AlertDialogContext);
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || !open) return null;
	return createPortal(<>{children}</>, document.body);
}
AlertDialogPortal.displayName = "AlertDialogPortal";

// AlertDialogOverlay — backdrop that does NOT close on click (alert dialogs require explicit action)
const AlertDialogOverlay = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("fixed inset-0 z-50 bg-black/80", className)}
		{...props}
	/>
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

// AlertDialogContent — renders overlay + panel in portal; Escape does NOT close
const AlertDialogContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
	<AlertDialogPortal>
		<AlertDialogOverlay />
		<div
			ref={ref}
			className={cn(
				"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	</AlertDialogPortal>
));
AlertDialogContent.displayName = "AlertDialogContent";

function AlertDialogHeader({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
	return (
		<div
			className={cn(
				"flex flex-col space-y-2 text-center sm:text-left",
				className,
			)}
			{...props}
		/>
	);
}
AlertDialogHeader.displayName = "AlertDialogHeader";

function AlertDialogFooter({
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
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h2 ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
AlertDialogDescription.displayName = "AlertDialogDescription";

// AlertDialogAction — closes the dialog after running onClick
const AlertDialogAction = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
	const { onOpenChange } = React.useContext(AlertDialogContext);

	return (
		<button
			ref={ref}
			className={cn(buttonVariants(), className)}
			onClick={(e) => {
				onClick?.(e);
				onOpenChange(false);
			}}
			{...props}
		/>
	);
});
AlertDialogAction.displayName = "AlertDialogAction";

// AlertDialogCancel — closes the dialog explicitly
const AlertDialogCancel = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
	const { onOpenChange } = React.useContext(AlertDialogContext);

	return (
		<button
			ref={ref}
			className={cn(
				buttonVariants({ variant: "outline" }),
				"mt-2 sm:mt-0",
				className,
			)}
			onClick={(e) => {
				onClick?.(e);
				onOpenChange(false);
			}}
			{...props}
		/>
	);
});
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	AlertDialogPortal,
	AlertDialogTitle,
	AlertDialogTrigger,
};
