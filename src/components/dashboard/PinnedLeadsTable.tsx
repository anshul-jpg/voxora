"use client";

import React, { useState } from "react";
import LeadDetailDrawer from "./LeadDetailDrawer";

export default function PinnedLeadsTable({ leads, columns }: { leads: any[]; columns: any[] }) {
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  // Filter only pinned columns, cap at 3
  const pinnedColumns = columns.filter((c) => c.isPinned).slice(0, 3);

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {pinnedColumns.map((col) => (
                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedLead(lead)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.status}</td>
                {pinnedColumns.map((col) => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.customData?.[col.key] || "-"}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900">View</button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={pinnedColumns.length + 3} className="px-6 py-4 text-center text-sm text-gray-500">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <LeadDetailDrawer lead={selectedLead} isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
}
