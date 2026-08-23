"use client";

import { Search, ExternalLink, Shield, ShieldOff } from "lucide-react";

const stadiums = [
  { id: 1, name: "Bambis Meda Stadium", city: "Addis Ababa", owner: "Fatima Hassan", fields: 4, status: "Active", verified: true },
  { id: 2, name: "St George Arena", city: "Addis Ababa", owner: "Kidist Alemayehu", fields: 3, status: "Active", verified: true },
  { id: 3, name: "Hawassa City Park", city: "Hawassa", owner: "TBD", fields: 2, status: "Pending", verified: false },
  { id: 4, name: "Bahir Dar Stadium", city: "Bahir Dar", owner: "TBD", fields: 2, status: "Pending", verified: false },
];

export default function AdminStadiums() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Total", value: "52", color: "text-slate-900" },
          { label: "Active", value: "48", color: "text-green-600" },
          { label: "Pending", value: "4", color: "text-yellow-600" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-white border border-slate-200 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-sm text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-100">
            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Stadium</th>
            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">Owner</th>
            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Fields</th>
            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
            <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {stadiums.map((s) => (
              <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900 text-sm">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.city}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">{s.owner}</td>
                <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">{s.fields}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${s.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{s.status}</span>
                    {s.verified && <Shield className="text-green-600" size={14} />}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <a href={`/microsite`} target="_blank" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 inline-flex"><ExternalLink size={16} /></a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
