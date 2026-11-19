export const tooltipStyle = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 12,
    color: "#172033",
  },
};

export const colorMap = {
  blue:    { text: "text-[#b8860b]", border: "border-[#d4a13f]/50" },
  cyan:    { text: "text-[#b8860b]", border: "border-[#d4a13f]/50" },
  emerald: { text: "text-[#b8860b]", border: "border-[#d4a13f]/50" },
  teal:    { text: "text-[#b8860b]", border: "border-[#d4a13f]/50" },
  purple:  { text: "text-[#b8860b]", border: "border-[#d4a13f]/50" },
  orange:  { text: "text-[#b8860b]", border: "border-[#d4a13f]/50" },
};

export const LegendDot = ({ color, label, value }) => (
  <div className="flex items-center gap-2">
    <span className={`h-2 w-2 rounded-full ${color}`} />
    <div className="flex flex-col leading-tight">
      <span className="text-xs text-slate-400">{label}</span>
      {value !== undefined && (
        <span className="font-semibold text-slate-800">{value}</span>
      )}
    </div>
  </div>
);