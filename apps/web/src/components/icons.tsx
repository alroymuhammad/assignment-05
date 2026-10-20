import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function MajuTelcoMark({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path
        d="M4 18V9.5L12 15l8-5.5V18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 7.5A6.3 6.3 0 0 1 12 5.7a6.3 6.3 0 0 1 4.5 1.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="4" r="1.6" fill="currentColor" />
    </svg>
  )
}

export function ComposeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </Icon>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  )
}

export function ChatsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 14.5a2 2 0 0 1-2 2H8.6L4 20V5.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z" />
      <path d="M8 9h8M8 12.5h5" />
    </Icon>
  )
}

export function ProjectsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5Z" />
    </Icon>
  )
}

export function ArtifactsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m12 3-1.8 5.5a2 2 0 0 1-1.3 1.3L3.5 11.6l5.4 1.8a2 2 0 0 1 1.3 1.3L12 20l1.8-5.3a2 2 0 0 1 1.3-1.3l5.4-1.8-5.4-1.8a2 2 0 0 1-1.3-1.3Z" />
      <path d="M19 3v3M20.5 4.5h-3" />
    </Icon>
  )
}

export function PanelLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3.5" width="18" height="17" rx="2.5" />
      <path d="M9.5 3.5v17" />
    </Icon>
  )
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Icon>
  )
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 19V5" />
      <path d="m5.5 11.5 6.5-6.5 6.5 6.5" />
    </Icon>
  )
}

export function StopIcon(props: IconProps) {
  return (
    <Icon fill="currentColor" stroke="none" {...props}>
      <rect x="7" y="7" width="10" height="10" rx="2" />
    </Icon>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  )
}

export function SlidersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h4M12 7h8M4 12h10M18 12h2M4 17h2M10 17h10" />
      <circle cx="10" cy="7" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="8" cy="17" r="2" />
    </Icon>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  )
}

export function CopyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M15 5.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h.5" />
    </Icon>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 12.5 4.5 4.5L19 6.5" />
    </Icon>
  )
}

export function RefreshIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 12a8.5 8.5 0 0 1 14.4-6.1L21 8.5" />
      <path d="M21 3.5v5h-5" />
      <path d="M20.5 12a8.5 8.5 0 0 1-14.4 6.1L3 15.5" />
      <path d="M3 20.5v-5h5" />
    </Icon>
  )
}

export function MoreIcon(props: IconProps) {
  return (
    <Icon fill="currentColor" stroke="none" {...props}>
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </Icon>
  )
}
