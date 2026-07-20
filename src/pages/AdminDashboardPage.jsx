import { useEffect, useState } from "react";
import { Ticket, Users, Shield, LogOut, Activity, AlertCircle, Clock } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white shadow-xl md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">לוח מנהל</h1>
            <p className="mt-1 text-blue-100">סקירת נתוני המערכת בזמן אמת</p>
          </div>
          <Button onClick={handleLogout} variant="secondary" className="gap-2 text-blue-900 hover:bg-white">
            <LogOut className="h-4 w-4" />
            התנתק
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="h-2 bg-gradient-to-r from-rose-500 to-orange-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium text-slate-700">כמות תקלות</CardTitle>
              <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                <Ticket className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-slate-900">{tickets.length}</div>
              <p className="mt-1 text-sm text-slate-500">תקלות במערכת</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium text-slate-700">משתמשים</CardTitle>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-slate-900">{new Set(tickets.map((t) => t.createdBy).filter(Boolean)).size}</div>
              <p className="mt-1 text-sm text-slate-500">מדווחים ייחודיים</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium text-slate-700">מנהלים</CardTitle>
              <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                <Shield className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-slate-900">{admins.length}</div>
              <p className="mt-1 text-sm text-slate-500">חשבונות מנהל</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Activity className="h-5 w-5 text-blue-600" />
                התפלגות תקלות לפי מערכת
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(bySystem).length === 0 ? (
                  <p className="text-center text-slate-500">אין תקלות</p>
                ) : (
                  Object.entries(bySystem).map(([system, count]) => (
                    <div key={system} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                      <span className="font-medium text-slate-700">{system}</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        {count} תקלות
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Clock className="h-5 w-5 text-amber-600" />
                התפלגות לפי סטטוס
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(byStatus).length === 0 ? (
                  <p className="text-center text-slate-500">אין תקלות</p>
                ) : (
                  Object.entries(byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${statusColors[status] || "bg-slate-400"}`} />
                        <span className="font-medium text-slate-700">{statusLabels[status] || status}</span>
                      </div>
                      <Badge variant="secondary" className="bg-slate-200 text-slate-800 hover:bg-slate-200">
                        {count}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <AlertCircle className="h-5 w-5 text-rose-600" />
              תקלות אחרונות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
                  <div>
                    <p className="font-semibold text-slate-800">{ticket.systemName || "ללא מערכת"}</p>
                    <p className="text-sm text-slate-500 line-clamp-1">{ticket.description || "אין תיאור"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">{new Date(ticket.createdAt).toLocaleDateString("he-IL")}</span>
                    <Badge className={`${statusColors[ticket.status] || "bg-slate-500"} text-white`}>
                      {statusLabels[ticket.status] || ticket.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <p className="text-center text-slate-500">אין תקלות במערכת</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
