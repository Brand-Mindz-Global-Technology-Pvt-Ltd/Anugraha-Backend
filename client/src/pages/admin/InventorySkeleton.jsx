export default function InventorySkeleton({ rows = 5 }) {
    return (
        <>
            {[...Array(rows)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-slate-100">
                    <td className="px-3 py-4 sm:px-6"><div className="h-4 w-4 bg-slate-200 rounded" /></td>
                    <td className="px-3 py-4 sm:px-6">
                        <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                        <div className="h-3 w-20 bg-slate-100 rounded" />
                    </td>
                    <td className="px-3 py-4 sm:px-6"><div className="h-6 w-16 bg-slate-200 rounded mx-auto" /></td>
                    <td className="px-3 py-4 sm:px-6"><div className="h-6 w-20 bg-slate-100 rounded mx-auto" /></td>
                    <td className="px-3 py-4 sm:px-6"><div className="h-4 w-12 bg-slate-200 rounded" /></td>
                    <td className="px-3 py-4 sm:px-6"><div className="h-4 w-8 bg-slate-200 rounded" /></td>
                    <td className="px-3 py-4 sm:px-6"><div className="h-6 w-16 bg-slate-200 rounded-full mx-auto" /></td>
                </tr>
            ))}
        </>
    );
}