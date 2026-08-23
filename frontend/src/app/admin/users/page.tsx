"use client";

import { useState } from "react";
import { Search, Shield, UserCheck, UserX } from "lucide-react";

const users = [
  { id: 1, name: "Abebe Kebede", phone: "+251911234567", role: "Player", status: "Active", joined: "Jan 2026" },
  { id: 2, name: "Fatima Hassan", phone: "+251922345678", role: "Owner", status: "Active", joined: "Feb 2026" },
  { id: 3, name: "Daniel Tadesse", phone: "+251933456789", role: "Player", status: "Active", joined: "Mar 2026" },
  { id: 4, name: "Yonas Tesfaye", phone: "+251944567890", role: "Player", status: "Suspended", joined: "Apr 2026" },
  { id: 5, name: "Kidist Alemayehu", phone: "+251955678901", role: "Owner", status: "Active", joined: "May 2026" },
];

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-green-500 outline-none" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-100">
            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">User</th>
            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">Role</th>
            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Joined</th>
            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
            <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-bold">{user.name[0]}</div>
                    <div><p className="font-medium text-slate-900 text-sm">{user.name}</p><p className="text-xs text-slate-500">{user.phone}</p></div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${user.role === "Owner" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{user.role}</span></td>
                <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">{user.joined}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${user.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{user.status}</span></td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Shield size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
