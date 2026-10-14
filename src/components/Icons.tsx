type IconProps = { className?: string };

export function IconHome({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconNews({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 5.5h11A2.5 2.5 0 0 1 18.5 8v11H7.5A2.5 2.5 0 0 1 5 16.5v-11Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M18.5 9H20a1.5 1.5 0 0 1 1.5 1.5V16A2.5 2.5 0 0 1 19 18.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8.5 9h6M8.5 12.5h6M8.5 16h3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconUni({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m3 10 9-5 9 5-9 5-9-5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7 12.5v4.2c0 .6 2.2 2.3 5 2.3s5-1.7 5-2.3v-4.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M21 10v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconBag({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 8h12l-1 11H7L6 8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 8V6.5A3 3 0 0 1 12 3.5a3 3 0 0 1 3 3V8"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function IconAbout({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 10.5V17M12 7.5h.01"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

const map = {
  home: IconHome,
  about: IconAbout,
  news: IconNews,
  uni: IconUni,
  bag: IconBag,
};

export function NavIcon({
  name,
  className,
}: {
  name: keyof typeof map;
  className?: string;
}) {
  const C = map[name];
  return <C className={className} />;
}
