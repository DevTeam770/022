export function Footer() {
  return (
    <footer
      dir="ltr"
      className="fixed bottom-3 left-3 z-40 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-[11px] text-slate-500 shadow-sm backdrop-blur"
    >
      © {new Date().getFullYear()} Call Center 022 · A product of{" "}
      <span className="font-semibold text-blue-900">Avnet</span>
    </footer>
  );
}
