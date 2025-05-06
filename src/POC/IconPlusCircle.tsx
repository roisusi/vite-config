/* IconPlusCircle.tsx */
import React, { useId } from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { styled } from '@mui/material/styles';

/* Styled wrapper: no fill, pointer cursor, permanent orange stroke */
const MuiSvgIcon = styled(SvgIcon)({
	fill: 'none',
	cursor: 'pointer',
	color: 'red',
});

/*
 * Configuration for each variant.
 * 'as const' makes TS infer literal types and readonly.
 */
const config = {
	small: {
		defaultSize: 24,
		viewBox: '0 0 24 24' as const,
		clipSize: 24,
		paths: (id: string) => (
			<g clipPath={`url(#clip-${id})`}>
				<path
					d="M12.483 20.935C11.621 21.174 10.585 20.757 10.325 19.683C10.2611 19.4192 10.1358 19.1742 9.95929 18.968C9.7828 18.7618 9.56011 18.6001 9.30935 18.4963C9.05859 18.3924 8.78683 18.3491 8.51621 18.3701C8.24559 18.3911 7.98375 18.4757 7.752 18.617C6.209 19.557 4.442 17.791 5.382 16.247C5.5231 16.0153 5.60755 15.7537 5.62848 15.4832C5.64942 15.2128 5.60624 14.9412 5.50247 14.6906C5.3987 14.44 5.23726 14.2174 5.03127 14.0409C4.82529 13.8645 4.58056 13.7391 4.317 13.675C2.561 13.249 2.561 10.751 4.317 10.325C4.5808 10.2611 4.82578 10.1358 5.032 9.95929C5.23822 9.7828 5.39985 9.56011 5.50375 9.30935C5.60764 9.05859 5.65085 8.78683 5.62987 8.51621C5.60889 8.24559 5.5243 7.98375 5.383 7.752C4.443 6.209 6.209 4.442 7.753 5.382C8.753 5.99 10.049 5.452 10.325 4.317C10.751 2.561 13.249 2.561 13.675 4.317C13.7389 4.5808 13.8642 4.82578 14.0407 5.032C14.2172 5.23822 14.4399 5.39985 14.6907 5.50375C14.9414 5.60764 15.2132 5.65085 15.4838 5.62987C15.7544 5.60889 16.0162 5.5243 16.248 5.383C17.791 4.443 19.558 6.209 18.618 7.753C18.4769 7.98466 18.3924 8.24634 18.3715 8.51677C18.3506 8.78721 18.3938 9.05877 18.4975 9.30938C18.6013 9.55999 18.7627 9.78258 18.9687 9.95905C19.1747 10.1355 19.4194 10.2609 19.683 10.325C20.763 10.587 21.179 11.633 20.93 12.498"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M16.0005 19H22.0005"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M19.0005 16V22"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12Z"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
		),
	},
	large: {
		defaultSize: 32,
		viewBox: '0 0 32 32' as const,
		clipSize: 32,
		paths: (id: string) => (
			<g clipPath={`url(#clip-${id})`}>
				<path
					d="M16.644 27.9133C15.4947 28.232 14.1133 27.676 13.7667 26.244C13.6814 25.8923 13.5144 25.5656 13.2791 25.2907C13.0437 25.0157 12.7468 24.8002 12.4125 24.6617C12.0781 24.5231 11.7158 24.4655 11.355 24.4935C10.9941 24.5215 10.645 24.6343 10.336 24.8227C8.27867 26.076 5.92267 23.7213 7.176 21.6627C7.36413 21.3538 7.47673 21.0049 7.50464 20.6443C7.53256 20.2837 7.47499 19.9216 7.33663 19.5875C7.19827 19.2533 6.98301 18.9566 6.70836 18.7213C6.43371 18.486 6.10742 18.3188 5.756 18.2333C3.41467 17.6653 3.41467 14.3347 5.756 13.7667C6.10773 13.6814 6.43437 13.5144 6.70933 13.2791C6.98429 13.0437 7.19981 12.7468 7.33833 12.4125C7.47685 12.0781 7.53447 11.7158 7.50649 11.355C7.47852 10.9941 7.36574 10.645 7.17733 10.336C5.924 8.27867 8.27867 5.92267 10.3373 7.176C11.6707 7.98667 13.3987 7.26933 13.7667 5.756C14.3347 3.41467 17.6653 3.41467 18.2333 5.756C18.3186 6.10773 18.4856 6.43437 18.7209 6.70933C18.9563 6.98429 19.2532 7.19981 19.5875 7.33833C19.9219 7.47685 20.2842 7.53447 20.645 7.50649C21.0059 7.47852 21.355 7.36574 21.664 7.17733C23.7213 5.924 26.0773 8.27867 24.824 10.3373C24.6359 10.6462 24.5233 10.9951 24.4954 11.3557C24.4674 11.7163 24.525 12.0784 24.6634 12.4125C24.8017 12.7467 25.017 13.0434 25.2916 13.2787C25.5663 13.514 25.8926 13.6812 26.244 13.7667C27.684 14.116 28.2387 15.5107 27.9067 16.664"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M21.334 25.3333H29.334"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M25.334 21.3333V29.3333"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M12 16C12 17.0609 12.4214 18.0783 13.1716 18.8284C13.9217 19.5786 14.9391 20 16 20C17.0609 20 18.0783 19.5786 18.8284 18.8284C19.5786 18.0783 20 17.0609 20 16C20 14.9391 19.5786 13.9217 18.8284 13.1716C18.0783 12.4214 17.0609 12 16 12C14.9391 12 13.9217 12.4214 13.1716 13.1716C12.4214 13.9217 12 14.9391 12 16Z"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
		),
	},
} as const;

/* Derive the variant type from the config’s keys: */
type Variant = keyof typeof config; /* "small" | "large" */

/**
 * Props: require variant, optional size, omit viewBox/fontSize/width/height
 */
export interface IconPlusCircleProps
	extends Omit<SvgIconProps, 'viewBox' | 'fontSize' | 'width' | 'height'> {
	variant: Variant;
	size?: number;
}

/** The icon component */
export const IconPlusCircle: React.FC<IconPlusCircleProps> = ({
	variant,
	size,
	...props
}) => {
	const id = useId();
	const { defaultSize, viewBox, clipSize, paths } = config[variant];
	/* if caller passed size, use it; otherwise fall back to defaultSize */
	const appliedSize = size ?? defaultSize;

	return (
		<MuiSvgIcon
			{...props}
			viewBox={viewBox}
			fontSize="inherit" /* turn off MUI’s default CSS sizing */
			width={appliedSize} /* set the SVG attribute */
			height={appliedSize} /* set the SVG attribute */
			style={{ width: appliedSize, height: appliedSize }}
		>
			<defs>
				<clipPath id={`clip-${id}`}>
					<rect width={clipSize} height={clipSize} fill="white" />
				</clipPath>
			</defs>
			{paths(id)}
		</MuiSvgIcon>
	);
};
