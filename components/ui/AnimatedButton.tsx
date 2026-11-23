import type { ComponentType, MouseEventHandler, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight, Loader2, type LucideProps } from "lucide-react";
import { cn } from "@/lib/cn";
import { ICON_STROKE } from "@/lib/tokens";
import { MagneticInner } from "./MagneticInner";
import { PressRipple } from "./PressRipple";

const buttonVariants = cva(
  "group/btn relative inline-flex shrink-0 items-center justify-center gap-2 rounded-button font-display font-semibold whitespace-nowrap transition-[background-color,border-color,color,transform] duration-200 ease-standard select-none active:scale-97 disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-bright-gold text-navy-950 hover:bg-bright-gold/80 active:bg-bright-gold/80",
        secondary: "border bg-transparent",
        ghost: "bg-transparent",
        link: "min-h-0 gap-1.5 px-0 font-sans font-medium underline-offset-4 hover:underline",
      },
      tone: { dark: "", light: "" },
      size: {
        md: "min-h-11 px-5 text-[0.9375rem]",
        lg: "min-h-13 px-7 text-base",
      },
    },
    compoundVariants: [
      {
        variant: "secondary",
        tone: "dark",
        className:
          "border-cloud-50/24 text-cloud-50 hover:border-bright-gold hover:bg-bright-gold/8",
      },
      {
        variant: "secondary",
        tone: "light",
        className: "border-navy-950/20 text-navy-950 hover:border-bright-gold hover:text-bright-gold",
      },
      { variant: "ghost", tone: "dark", className: "text-cloud-50 hover:bg-navy-800" },
      { variant: "ghost", tone: "light", className: "text-navy-950 hover:bg-slate-100" },
      { variant: "link", tone: "dark", className: "text-bright-gold" },
      { variant: "link", tone: "light", className: "text-bright-gold" },
      { variant: "link", size: ["md", "lg"], className: "min-h-11 px-0" },
    ],
    defaultVariants: { variant: "primary", tone: "dark", size: "md" },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface CommonProps {
  children: ReactNode;
  variant?: NonNullable<ButtonVariantProps["variant"]>;
  tone?: NonNullable<ButtonVariantProps["tone"]>;
  size?: NonNullable<ButtonVariantProps["size"]>;
  icon?: ComponentType<LucideProps>;
  iconPosition?: "left" | "right";
  /** Inner content follows the pointer (fine pointers only). */
  magnetic?: boolean;
  className?: string;
  ariaLabel?: string;
}

interface LinkProps extends CommonProps {
  href: string;
  /** Opens in a new tab with rel noopener noreferrer, adds the arrow and hidden notice. */
  external?: boolean;
  download?: never;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

interface ButtonProps extends CommonProps {
  href?: undefined;
  external?: never;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  pressed?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export type AnimatedButtonProps = LinkProps | ButtonProps;

/** The site's single button and CTA component. Renders a link with `href`, a button otherwise. */
export function AnimatedButton(props: AnimatedButtonProps) {
  const {
    children,
    variant = "primary",
    tone = "dark",
    size = "md",
    icon: Icon,
    iconPosition = "right",
    magnetic = false,
    className,
    ariaLabel,
  } = props;

  const iconSize = size === "lg" ? 18 : 16;
  const iconClass =
    "shrink-0 transition-transform duration-200 ease-standard group-hover/btn:translate-x-1";
  const isExternal = props.href !== undefined && props.external === true;
  const loading = props.href === undefined && props.loading === true;

  const content = (
    <>
      {loading ? (
        <Loader2
          aria-hidden="true"
          size={iconSize}
          strokeWidth={ICON_STROKE}
          className="motion-loop animate-spin-ring"
        />
      ) : null}
      {Icon && iconPosition === "left" && !loading ? (
        <Icon aria-hidden="true" size={iconSize} strokeWidth={ICON_STROKE} className="shrink-0" />
      ) : null}
      <span className={cn(loading && "opacity-90")}>{children}</span>
      {Icon && iconPosition === "right" && !isExternal ? (
        <Icon aria-hidden="true" size={iconSize} strokeWidth={ICON_STROKE} className={iconClass} />
      ) : null}
      {isExternal ? (
        <>
          <ArrowUpRight
            aria-hidden="true"
            size={iconSize}
            strokeWidth={ICON_STROKE}
            className="shrink-0 transition-transform duration-200 ease-standard group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
          />{" "}
          <span className="sr-only">(opens in a new tab)</span>
        </>
      ) : null}
    </>
  );

  const magneticContent = magnetic ? <MagneticInner>{content}</MagneticInner> : content;
  // Primary buttons get the soft press ripple (fine pointers only).
  const inner =
    variant === "primary" ? (
      <>
        <PressRipple />
        {magneticContent}
      </>
    ) : (
      magneticContent
    );
  const classes = cn(buttonVariants({ variant, tone, size }), className);

  if (props.href !== undefined) {
    return (
      <a
        href={props.href}
        className={classes}
        aria-label={ariaLabel}
        onClick={props.onClick}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      className={classes}
      aria-label={ariaLabel}
      aria-pressed={props.pressed}
      aria-busy={loading || undefined}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {inner}
    </button>
  );
}
