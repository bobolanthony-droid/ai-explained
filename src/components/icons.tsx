/** Small line icons. Always decorative: the text label next to them carries the meaning. */
import type { ReactNode } from 'react';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

export const PathIcon = () => (
  <Icon>
    <path d="M6 18c0-5 12-3 12-8 0-2-3-3-4-4" strokeDasharray="0.1 3.6" />
    <circle cx="6" cy="20" r="1.6" />
    <circle cx="13" cy="4.5" r="1.6" />
  </Icon>
);
export const BookIcon = () => (
  <Icon>
    <path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5Z" />
    <path d="M12 6.5v13" />
  </Icon>
);
export const ChatIcon = () => (
  <Icon>
    <path d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 16h-7l-4.5 3.5V16H5a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 5 5Z" />
    <path d="M8 9h8M8 12h5" />
  </Icon>
);
export const PracticeIcon = () => (
  <Icon>
    <rect x="5" y="4.5" width="14" height="16" rx="2.5" />
    <path d="M9 3.5h6v2.5H9zM8.5 13l2.5 2.5 4.5-5" />
  </Icon>
);
export const PersonIcon = () => (
  <Icon>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" />
  </Icon>
);
export const ChevronIcon = () => (
  <Icon>
    <path d="m9 5 7 7-7 7" />
  </Icon>
);
export const BackIcon = () => (
  <Icon>
    <path d="m15 5-7 7 7 7" />
  </Icon>
);
export const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <Icon>
    <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z" fill={filled ? 'currentColor' : 'none'} />
  </Icon>
);
export const HeartIcon = ({ filled }: { filled: boolean }) => (
  <Icon>
    <path
      d="M12 20s-7-4.4-7-9.6A4 4 0 0 1 12 8a4 4 0 0 1 7 2.4c0 5.2-7 9.6-7 9.6Z"
      fill={filled ? 'currentColor' : 'none'}
    />
  </Icon>
);
export const CopyIcon = () => (
  <Icon>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
    <path d="M15.5 5.5v-.500A1.5 1.5 0 0 0 14 3.5H6A1.5 1.5 0 0 0 4.5 5v8A1.5 1.5 0 0 0 6 14.5h.500" />
  </Icon>
);
export const CheckIcon = () => (
  <Icon>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);
