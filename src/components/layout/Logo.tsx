const Logo = ({ collapsed = false }: { collapsed?: boolean }) => (
  <div className="flex items-center gap-2">
    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
        <path
          d="M8 2C8 2 3.5 6.5 3.5 10C3.5 12.5 5.5 14.5 8 14.5C10.5 14.5 12.5 12.5 12.5 10C12.5 6.5 8 2 8 2Z"
          fill="white"
        />
      </svg>
    </div>
    {!collapsed && (
      <span className="text-foreground font-semibold text-sm tracking-tight">
        Darukaa<span className="text-muted-foreground font-normal">.earth</span>
      </span>
    )}
  </div>
);

export default Logo;
