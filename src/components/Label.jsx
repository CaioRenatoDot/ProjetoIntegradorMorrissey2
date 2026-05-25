export default function Label({ children = "Lembrar acesso" }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 font-semibold text-slate-400 transition hover:text-slate-200">
      <input className="peer sr-only" type="checkbox" />
      <span className="grid h-5 w-5 place-items-center rounded border border-slate-700 bg-zinc-900 text-[10px] font-black text-transparent transition group-hover:border-slate-500 peer-checked:border-[#00c030] peer-checked:bg-[#00c030] peer-checked:text-[#0d0d0d]">
        &#10003;
      </span>
      <span>{children}</span>
    </label>
  );
}
