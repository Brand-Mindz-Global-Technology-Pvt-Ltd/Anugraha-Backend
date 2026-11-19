import { useDashboard } from "../../../context/Dashboardcontext.jsx";
import { Skeleton } from "./Skeletons.jsx";

const PRODUCT_COLORS = [
  { bar: "#d4a13f", light: "#ffffff", text: "#b8860b", label: "bg-[#d4a13f]/10 text-[#b8860b]" },
];



const TopProducts = () => {
  const { loading, data } = useDashboard();
  const isLoading    = loading.products;
  const productsData = data.products;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-lg w-full" style={{ border: "1px solid #f1f5f9" }}>
        <Skeleton className="h-5 w-32 mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const products = (productsData?.products ?? []).map((p, idx) => ({
    ...p,
    rank:    idx + 1,
    colors:  PRODUCT_COLORS[idx % PRODUCT_COLORS.length],
    percent: p.percentage,
  }));

  const maxPercent = Math.max(...products.map(p => p.percent), 1);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg w-full" style={{ border: "1px solid #f1f5f9" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">Bestsellers</p>
          <h2 className="text-base font-bold text-slate-800">Top Products</h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
          {products.length} products
        </span>
      </div>

      {/* ── Product List ── */}
      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.productId}
            className="rounded-xl p-3.5 transition-all"
            style={{
              background: p.colors.light,
              border: "1px solid #e2e8f0",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}
          >
            {/* Top row — rank, name, badge */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold w-7 text-center">
                  {p.rank}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {p.name.length > 22 ? p.name.slice(0, 22) + "…" : p.name} 
                    
                  </p>
                  {p.category && (
                    <p className="text-xs text-slate-400 mt-0.5">{p.category}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: p.colors.bar + "18", color: p.colors.text }}
                >
                  {p.percent}%
                </span>
              {p.totalSold}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full" style={{ background: p.colors.bar + "22" }}>
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{
                  width: `${(p.percent / maxPercent) * 100}%`,
                  background: p.colors.bar,
                }}
              />
            </div>

            {/* Bottom row — sales count */}
            {p.totalSales !== undefined && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-400">Total Sales</span>
                <span className="text-xs font-bold" style={{ color: p.colors.text }}>
                  {p.totalSales?.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;