"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  FileText, 
  Activity, 
  Calendar,
  ClipboardList,
  CheckCircle,
  FileBadge,
  Settings,
  LogOut,
  Hospital
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const { role } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getLinksForRole = () => {
    const defaultRole = role || 'RECEPTIONIST'; // Fallback for dev

    const common = [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }];
    const patients = { name: 'Patients', href: '/patients', icon: Users };
    const encounters = { name: 'Encounters', href: '/encounters', icon: Stethoscope };
    const documents = { name: 'Documents', href: '/documents', icon: FileText };
    const claims = { name: 'Claims', href: '/claims', icon: FileBadge };
    
    switch(defaultRole) {
      case 'ADMIN':
        return [
          ...common,
          patients,
          { name: 'Doctors', href: '/doctors', icon: Stethoscope },
          encounters,
          claims,
          { name: 'Packages', href: '/packages', icon: ClipboardList },
          { name: 'Audit Logs', href: '/audit', icon: CheckCircle },
          { name: 'Settings', href: '/settings', icon: Settings },
        ];
      case 'DOCTOR':
        return [
          ...common,
          { name: 'My Patients', href: '/patients', icon: Users },
          encounters,
          documents
        ];
      case 'NURSE':
        return [
          ...common,
          patients,
          encounters,
          { name: 'Vitals', href: '/vitals', icon: Activity },
          documents
        ];
      case 'RECEPTIONIST':
        return [
          ...common,
          patients,
          { name: 'Appointments', href: '/appointments', icon: Calendar },
        ];
      case 'CLAIM_OFFICER':
        return [
          ...common,
          patients,
          encounters,
          documents,
          { name: 'Packages', href: '/packages', icon: ClipboardList },
          claims
        ];
      case 'AUDITOR':
        return [
          ...common,
          claims,
          { name: 'Audit Logs', href: '/audit', icon: CheckCircle }
        ];
      default:
        return common;
    }
  };

  const links = getLinksForRole();

  return (
    <div className="flex flex-col w-64 bg-slate-900 text-white min-h-screen">
      <div className="flex items-center justify-center h-20 border-b border-slate-800">
        <Hospital className="w-8 h-8 text-blue-500 mr-2" />
        <h1 className="text-xl font-bold text-slate-100">AI Claim Bridge</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`group flex items-center px-2 py-3 text-sm font-medium rounded-md ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center px-2 py-3 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-slate-400" />
          Logout
        </button>
      </div>
    </div>
  );
}
