"use client";

import React from "react";

export default function LeadDetailDrawer({ lead, isOpen, onClose }: { lead: any; isOpen: boolean; onClose: () => void }) {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
      <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
            <div className="px-4 py-6 bg-indigo-600 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white">Lead Details</h2>
                <div className="ml-3 h-7 flex items-center">
                  <button
                    className="bg-indigo-600 rounded-md text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close panel</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-1">
                <p className="text-sm text-indigo-300">
                  Detailed view of {lead.name || lead.phone}'s profile and custom attributes.
                </p>
              </div>
            </div>
            <div className="mt-6 relative flex-1 px-4 sm:px-6">
              <div className="space-y-6 pb-16">
                <div>
                  <h3 className="font-medium text-gray-900">Contact Information</h3>
                  <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                    <div className="py-3 flex justify-between text-sm font-medium">
                      <dt className="text-gray-500">Phone</dt>
                      <dd className="text-gray-900">{lead.phone}</dd>
                    </div>
                    {lead.name && (
                      <div className="py-3 flex justify-between text-sm font-medium">
                        <dt className="text-gray-500">Name</dt>
                        <dd className="text-gray-900">{lead.name}</dd>
                      </div>
                    )}
                    {lead.email && (
                      <div className="py-3 flex justify-between text-sm font-medium">
                        <dt className="text-gray-500">Email</dt>
                        <dd className="text-gray-900">{lead.email}</dd>
                      </div>
                    )}
                    <div className="py-3 flex justify-between text-sm font-medium">
                      <dt className="text-gray-500">Status</dt>
                      <dd className="text-gray-900">{lead.status}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">Custom Attributes</h3>
                  <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                    {lead.customData && Object.entries(lead.customData).length > 0 ? (
                      Object.entries(lead.customData).map(([key, value]) => (
                        <div key={key} className="py-3 flex justify-between text-sm font-medium">
                          <dt className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                          <dd className="text-gray-900">{String(value)}</dd>
                        </div>
                      ))
                    ) : (
                      <div className="py-3 text-sm text-gray-500">No custom attributes extracted yet.</div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
