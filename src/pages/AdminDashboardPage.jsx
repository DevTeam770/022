import { useEffect, useState } from "react";
import { Ticket, Users, Shield, LogOut, Activity, AlertCircle, Clock, LayoutDashboard, Settings, BarChart3, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001";

const statusLabels = {
  open: "פתוחה",
  "in-progress": "בטיפול",
  resolved: "טופלה",
  closed: "סגורה",
};

const statusColors = {
  open: "bg-rose-500",
  "in-progress": "bg-amber-500",
  resolved: "bg-emerald-500",
  closed: "bg-slate-500",
};

function countByKey(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "לא צוין";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [tickets, setTickets] = useState([]);
  const [admins, setAdmins] = useState([]);

  const fetchData = () => {
    fetch(`${API_URL}/tickets`).then((r) => r.json()).then(setTickets);
    fetch(`${API_URL}/admins`).then((r) => r.json()).then(setAdmins);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const bySystem = countByKey(tickets, "systemName");
  const byStatus = countByKey(tickets, "status");

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-8 md:p-12 shadow-2xl">
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight md:text-4xl">לוח מנהל</h1>
              <p className="mt-2 text-lg text-white/90">סקירת נתוני המערכת בזמן אמת</p>
            </div>
            <Button 
              onClick={handleLogout} 
              className="gap-2 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 border border-white/30 shadow-lg"
            >
              <LogOut className="h-5 w-5" />
              התנתק
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="group relative overflow-hidden border-0 bg-white shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-rose-500 to-orange-500" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl font-semibold text-slate-800">כמות תקלות</CardTitle>
              <div className="rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 p-3 text-white">
                <Ticket className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-5xl font-bold text-slate-900">{tickets.length}</div>
              <p className="mt-2 text-slate-500">תקלות במערכת</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-white shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl font-semibold text-slate-800">משתמשים</CardTitle>
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3 text-white">
                <Users className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-5xl font-bold text-slate-900">{new Set(tickets.map((t) => t.createdBy).filter(Boolean)).size}</div>
              <p className="mt-2 text-slate-500">מדווחים ייחודיים</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-white shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-violet-500 to-purple-500" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl font-semibold text-slate-800">מנהלים</CardTitle>
              <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 p-3 text-white">
                <Shield className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-5xl font-bold text-slate-900">{admins.length}</div>
              <p className="mt-2 text-slate-500">חשבונות מנהל</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-0 bg-white shadow-xl">
            <CardHeader className="border-b border-slate-100 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2 text-white">
                  <Activity className="h-5 w-5" />
                </div>
                התפלגות תקלות לפי מערכת
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {Object.entries(bySystem).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Activity className="h-12 w-12 mb-4 opacity-50" />
                    <p>אין תקלות להצגה</p>
                  </div>
                ) : (
                  Object.entries(bySystem).map(([system, count], index) => (
                    <div 
                      key={system} 
                      className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-white p-4 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-semibold text-slate-700">{system}</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-md">
                        {count} תקלות
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-xl">
            <CardHeader className="border-b border-slate-100 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2 text-white">
                  <Clock className="h-5 w-5" />
                </div>
                התפלגות לפי סטטוס
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {Object.entries(byStatus).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Clock className="h-12 w-12 mb-4 opacity-50" />
                    <p>אין תקלות להצגה</p>
                  </div>
                ) : (
                  Object.entries(byStatus).map(([status, count]) => (
                    <div 
                      key={status} 
                      className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-white p-4 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-4 w-4 rounded-full ${statusColors[status] || "bg-slate-400"} shadow-md`} />
                        <span className="font-semibold text-slate-700">{statusLabels[status] || status}</span>
                      </div>
                      <Badge className="bg-slate-800 text-white border-0 shadow-md">
                        {count}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tickets */}
        <Card className="border-0 bg-white shadow-xl">
          <CardHeader className="border-b border-slate-100 pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
              <div className="rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 p-2 text-white">
                <AlertCircle className="h-5 w-5" />
              </div>
              תקלות אחרונות
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {tickets.slice(0, 5).map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="group flex items-center justify-between rounded-xl border border-slate-100 bg-gradient-to-r from-white to-slate-50 p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-lg">{ticket.systemName || "ללא מערכת"}</p>
                    <p className="mt-1 text-sm text-slate-600">{ticket.faultType || "ללא סוג תקלה"}</p>
                    <p className="mt-1 text-slate-500 line-clamp-1">{ticket.description || "אין תיאור"}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400 font-medium">
                      {new Date(ticket.createdAt).toLocaleDateString("he-IL")}
                    </span>
                    <Badge className={`${statusColors[ticket.status] || "bg-slate-500"} text-white border-0 shadow-md`}>
                      {statusLabels[ticket.status] || ticket.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
                  <p>אין תקלות במערכת</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
