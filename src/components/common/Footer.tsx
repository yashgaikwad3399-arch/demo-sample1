import React from 'react';
import { Database, Code2, ShieldAlert, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="main-footer" className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-3">
              Smart Examination Portal
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              A full-stack, role-based examination portal designed for academic testing in Java and SQL. Built with React.js, Express.js, and MySQL.
            </p>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-emerald-400" />
              Frontend Stack
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li>• React 19 + TypeScript</li>
              <li>• React Router v7 (SPA Navigation)</li>
              <li>• Tailwind CSS Styling</li>
              <li>• Axios Client with Interceptors</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Backend Stack
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li>• Node.js & Express.js REST API</li>
              <li>• JWT Authentication & bcrypt</li>
              <li>• Server-Side Zero-Leak Evaluation</li>
              <li>• Role-Based Access Control (RBAC)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-400" />
              Database Stack
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li>• MySQL Relational Engine</li>
              <li>• mysql2 Connection Pooling</li>
              <li>• 3NF Normalized Schema</li>
              <li>• Parameterized Prepared Queries</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Smart Examination Portal. Final-Year IT Student Project.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              Step 1: Scaffolding Ready
            </span>
            <span>•</span>
            <span>Express Health Check Enabled</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
