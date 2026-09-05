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
  Hospital,
  ShieldAlert,
  UserPlus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const { role, isLoading, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getLinksForRole = () => {
    // Show nothing while loading to prevent flash of wrong links
    if (isLoading) return [];
    
    // Default to a safe view if role is somehow undefined
    const activeRole = role || 'RECEPTIONIST'; 

    const common = [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }];
    const patients = { name: 'Patients', href: '/patients', icon: Users };
    const encounters = { name: 'Encounters', href: '/encounters', icon: Stethoscope };
    const documents = { name: 'Documents', href: '/documents', icon: FileText };
    const claims = { name: 'Claims', href: '/claims', icon: FileBadge };
    
    switch(activeRole) {
      case 'ADMIN':
        return [
          ...common,
          { name: 'Hospital Settings', href: '/hospital', icon: Hospital },
          patients,
          { name: 'Doctors', href: '/doctors', icon: Stethoscope },
          encounters,
          claims,
          { name: 'Packages', href: '/packages', icon: ClipboardList },
          { name: 'Staff Users', href: '/users', icon: ShieldAlert },
          { name: 'Audit Logs', href: '/audit', icon: CheckCircle },
        ];
      case 'DOCTOR':
        return [
          ...common,
          { name: 'My Patients', href: '/patients', icon: Users },
          encounters,
          documents,
          claims,
        ];
      case 'NURSE':
        return [
          ...common,
          patients,
          encounters,
          documents
        ];
      case 'RECEPTIONIST':
        return [
          ...common,
          patients,
          encounters,
          { name: 'New Patient', href: '/patients/new', icon: UserPlus },
        ];
      case 'CLAIM_OFFICER':
        return [
          ...common,
          patients,
          encounters,
          claims,
          { name: 'Packages', href: '/packages', icon: ClipboardList },
          documents,
          { name: 'Eligibility', href: '/eligibility', icon: FileBadge },
          { name: 'Consents', href: '/consents', icon: ClipboardList }
        ];
      case 'AUDITOR':
        return [
          ...common,
          claims,
          documents,
          { name: 'Eligibility', href: '/eligibility', icon: FileBadge },
          { name: 'Consents', href: '/consents', icon: ClipboardList },
          { name: 'Audit Logs', href: '/audit', icon: CheckCircle }
        ];
      default:
        return common;
    }
  };

  const links = getLinksForRole();

  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-white min-h-screen relative shadow-xl z-10 transition-all duration-300">
      
      {/* Brand Header */}
      <div className="flex items-center px-6 h-20 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="bg-blue-600 p-2 rounded-lg mr-3 shadow-lg shadow-blue-900/50">
          <Hospital className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">MediPlug</h1>
          <p className="text-xs text-blue-400 font-medium tracking-wider uppercase">HMS Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
        <div className="mb-4 px-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {role ? role.replace('_', ' ') : 'Loading...'} MENU
          </p>
        </div>
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/dashboard');
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-inner' 
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                  isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <div className="flex items-center mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-sm font-bold text-slate-300">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
            <p className="text-xs text-slate-500 truncate">{role?.replace('_', ' ')}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex w-full items-center justify-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800 hover:border-slate-700 transition-all shadow-sm hover:shadow"
        >
          <LogOut className="mr-2 h-4 w-4 text-slate-500" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
