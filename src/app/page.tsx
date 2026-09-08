'use client';

import {Calendar} from '@/components/ui/calendar';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {ScrollArea} from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {Textarea} from '@/components/ui/textarea';
import {useEffect, useState} from 'react';
import {LucideIcon} from 'lucide-react';
import {BarChart, Calendar as CalendarIcon, LayoutDashboard, ListChecks, Wallet} from 'lucide-react';
import {getAppointments} from '@/services/calendar';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: CalendarIcon,
  },
  {
    title: 'Revenue',
    href: '/revenue',
    icon: Wallet,
  },
  {
    title: 'Expenses',
    href: '/expenses',
    icon: ListChecks,
  },
];

export default function Home() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function loadAppointments() {
      const now = new Date();
      const future = new Date();
      future.setDate(now.getDate() + 30);
      const loadedAppointments = await getAppointments(now, future);
      setAppointments(loadedAppointments);
    }

    loadAppointments();
  }, []);

  return (
    <SidebarProvider>
      <Sidebar className="w-64 border-r bg-secondary">
        <SidebarHeader>
          <h1 className="text-2xl font-bold">BizFlow</h1>
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="h-[calc(100vh - 8rem)]">
            <SidebarMenu>
              {navigationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton href={item.href} className="gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BizFlow
          </p>
        </SidebarFooter>
      </Sidebar>
      <div className="flex-1 p-4">
        <Dashboard appointments={appointments} />
      </div>
    </SidebarProvider>
  );
}

function Dashboard({appointments}: {appointments: any[]}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Summary</CardTitle>
          <CardDescription>Overview of your business performance</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for summary charts */}
          <BarChart className="h-32 w-full" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Logging</CardTitle>
            <CardDescription>Log your income transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm type="Revenue" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Logging</CardTitle>
            <CardDescription>Log your expense transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm type="Expense" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Calendar</CardTitle>
          <CardDescription>Schedule and view your appointments</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <CalendarComponent appointments={appointments} />
        </CardContent>
      </Card>
    </div>
  );
}

function TransactionForm({type}: {type: string}) {
  return (
    <form className="space-y-4">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input type="date" id="date" />
      </div>
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input type="number" id="amount" placeholder="0.00" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Enter transaction description" />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input type="text" id="category" placeholder="Enter category or let AI suggest" />
      </div>
      <button type="submit" className="bg-primary text-primary-foreground rounded-md px-4 py-2">
        Log {type}
      </button>
    </form>
  );
}

function CalendarComponent({appointments}: {appointments: any[]}) {
  return (
    <div className="border rounded-md">
      <Calendar />
      <ul>
        {appointments.map((appointment, index) => (
          <li key={index}>{appointment.title}</li>
        ))}
      </ul>
    </div>
  );
}
