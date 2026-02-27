"use client";
import * as React from "react";

import { cn } from "../../libs/utils";

// Tracks whether the image inside Avatar has loaded successfully
interface AvatarContextValue {
	imageLoaded: boolean;
	setImageLoaded: (loaded: boolean) => void;
}

const AvatarContext = React.createContext<AvatarContextValue>({
	imageLoaded: false,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setImageLoaded: () => {},
});

const Avatar = React.forwardRef<
	HTMLSpanElement,
	React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
	const [imageLoaded, setImageLoaded] = React.useState(false);

	return (
		<AvatarContext.Provider value={{ imageLoaded, setImageLoaded }}>
			<span
				ref={ref}
				className={cn(
					"relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
					className,
				)}
				{...props}
			/>
		</AvatarContext.Provider>
	);
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
	HTMLImageElement,
	React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, onLoad, onError, src, ...props }, ref) => {
	const { setImageLoaded } = React.useContext(AvatarContext);
	const [hasError, setHasError] = React.useState(false);

	// Reset error state when src changes
	React.useEffect(() => {
		setHasError(false);
		setImageLoaded(false);
	}, [src, setImageLoaded]);

	if (!src || hasError) return null;

	return (
		<img
			ref={ref}
			src={src}
			className={cn(
				"absolute inset-0 aspect-square h-full w-full object-cover",
				className,
			)}
			onLoad={(e) => {
				setImageLoaded(true);
				onLoad?.(e);
			}}
			onError={(e) => {
				setHasError(true);
				onError?.(e);
			}}
			{...props}
		/>
	);
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
	HTMLSpanElement,
	React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
	const { imageLoaded } = React.useContext(AvatarContext);

	if (imageLoaded) return null;

	return (
		<span
			ref={ref}
			className={cn(
				"flex h-full w-full items-center justify-center rounded-full bg-muted",
				className,
			)}
			{...props}
		/>
	);
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarFallback, AvatarImage };
