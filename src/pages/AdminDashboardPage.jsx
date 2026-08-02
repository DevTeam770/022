import { useEffect, useState } from "react";
import { Ticket, Users, CheckCircle2, LogOut, Activity, Clock, UserPlus, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001";

const userRoleLabels = {
  customer: "לקוח",
  technician: "טכנאי",
};

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
  const [users, setUsers] = useState([]);
  const [activePanel, setActivePanel] = useState(null);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] = useState(false);

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserPersonalId, setNewUserPersonalId] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("customer");
  const [createUserError, setCreateUserError] = useState("");

  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPasswordError, setResetPasswordError] = useState("");

  const fetchData = () => {
    fetch(`${API_URL}/tickets`).then((r) => r.json()).then(setTickets);
    fetch(`${API_URL}/users`).then((r) => r.json()).then(setUsers);
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

  const closeCreateUser = () => {
    setIsCreateUserOpen(false);
    setNewUserName("");
    setNewUserPersonalId("");
    setNewUserPassword("");
    setNewUserRole("customer");
    setCreateUserError("");
  };

  const handleCreateUser = async () => {
    if (!newUserName || !newUserPersonalId || !newUserPassword) {
      setCreateUserError("נא למלא את כל השדות");
      return;
    }
    if (newUserPassword.length < 6) {
      setCreateUserError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }
    if (users.some((u) => u.personalId === newUserPersonalId)) {
      setCreateUserError("כבר קיים משתמש עם מספר אישי זה");
      return;
    }

    try {
      await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newUserName,
          personalId: newUserPersonalId,
          password: newUserPassword,
          role: newUserRole,
          createdAt: new Date().toISOString(),
        }),
      });
      toast.success("המשתמש נוצר בהצלחה");
      closeCreateUser();
      fetchData();
    } catch {
      setCreateUserError("שגיאה ביצירת המשתמש, נסה שוב");
    }
  };

  const closeResetPassword = () => {
    setResetPasswordUser(null);
    setNewPassword("");
    setConfirmPassword("");
    setResetPasswordError("");
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setResetPasswordError("נא למלא את כל השדות");
      return;
    }
    if (newPassword.length < 6) {
      setResetPasswordError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetPasswordError("הסיסמאות אינן תואמות");
      return;
    }

    try {
      await fetch(`${API_URL}/users/${resetPasswordUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      toast.success("הסיסמה אופסה בהצלחה");
      closeResetPassword();
      fetchData();
    } catch {
      setResetPasswordError("שגיאה באיפוס הסיסמה, נסה שוב");
    }
  };

  const bySystem = countByKey(tickets, "systemName");
  const byStatus = countByKey(tickets, "status");
  const panelTickets = activePanel?.type === "system"
    ? tickets.filter((ticket) => (ticket.systemName || "לא צוין") === activePanel.value)
    : activePanel?.type === "status"
      ? tickets.filter((ticket) => (ticket.status || "לא צוין") === activePanel.value)
      : activePanel?.type === "resolved"
        ? tickets.filter((ticket) => ticket.status === "resolved")
        : tickets;
  const panelTitle = activePanel?.type === "users"
    ? "ניהול משתמשים"
    : activePanel?.type === "resolved"
      ? "תקלות פתורות"
      : activePanel?.type === "system"
        ? `תקלות ברשת ${activePanel.value}`
        : activePanel?.type === "status"
          ? `תקלות בסטטוס ${statusLabels[activePanel.value] || activePanel.value}`
          : "כל התקלות";

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
              onClick={() => setIsLogoutConfirmationOpen(true)} 
              className="gap-2 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 border border-white/30 shadow-lg"
            >
              <LogOut className="h-5 w-5" />
              התנתק
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card onClick={() => setActivePanel({ type: "tickets" })} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && setActivePanel({ type: "tickets" })} className="group relative cursor-pointer overflow-hidden border-0 bg-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
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

          <Card onClick={() => setActivePanel({ type: "resolved" })} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && setActivePanel({ type: "resolved" })} className="group relative cursor-pointer overflow-hidden border-0 bg-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-violet-500 to-purple-500" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl font-semibold text-slate-800">תקלות פתורות</CardTitle>
              <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 p-3 text-white">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-5xl font-bold text-slate-900">{tickets.filter((t) => t.status === "resolved").length}</div>
              <p className="mt-2 text-slate-500">תקלות שטופלו</p>
            </CardContent>
          </Card>

          <Card onClick={() => setActivePanel({ type: "users" })} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && setActivePanel({ type: "users" })} className="group relative cursor-pointer overflow-hidden border-0 bg-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl font-semibold text-slate-800">משתמשים</CardTitle>
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3 text-white">
                <Users className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-5xl font-bold text-slate-900">{users.length}</div>
              <p className="mt-2 text-slate-500">משתמשים רשומים במערכת</p>
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
                      onClick={() => setActivePanel({ type: "system", value: system })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => event.key === "Enter" && setActivePanel({ type: "system", value: system })}
                      className="group flex cursor-pointer items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-white p-4 transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
                      onClick={() => setActivePanel({ type: "status", value: status })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => event.key === "Enter" && setActivePanel({ type: "status", value: status })}
                      className="group flex cursor-pointer items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-white p-4 transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
      </div>

      <Dialog open={isLogoutConfirmationOpen} onOpenChange={setIsLogoutConfirmationOpen}>
        <DialogContent className="max-w-md [&>button]:left-4 [&>button]:right-auto" dir="rtl">
          <DialogHeader className="text-right sm:text-right">
            <DialogTitle className="text-right text-xl font-bold text-slate-800">התנתקות מלוח המנהל</DialogTitle>
          </DialogHeader>
          <p className="text-right text-slate-600">האם אתה בטוח שברצונך להתנתק?</p>
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setIsLogoutConfirmationOpen(false)}>ביטול</Button>
            <Button type="button" onClick={handleLogout} className="bg-rose-600 hover:bg-rose-700">התנתק</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(activePanel)} onOpenChange={(open) => !open && setActivePanel(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto" dir="rtl">
          <DialogHeader className="border-b border-slate-100 pb-4 text-right">
            <DialogTitle className="text-xl font-bold text-slate-800">{panelTitle}</DialogTitle>
          </DialogHeader>
          {activePanel?.type === "users" ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsCreateUserOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-4 w-4" />
                  משתמש חדש
                </Button>
              </div>
              {users.length === 0 ? (
                <p className="py-8 text-center text-slate-500">אין משתמשים רשומים במערכת עדיין</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">שם מלא</TableHead>
                      <TableHead className="text-right">מספר אישי</TableHead>
                      <TableHead className="text-right">תפקיד</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium text-slate-800">{u.fullName}</TableCell>
                        <TableCell className="text-slate-600">{u.personalId}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{userRoleLabels[u.role] || u.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => setResetPasswordUser(u)} className="gap-2">
                            <KeyRound className="h-3.5 w-3.5" />
                            איפוס סיסמה
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {panelTickets.map((ticket) => <div key={ticket.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4"><p className="font-semibold text-slate-800">{ticket.systemName || "ללא רשת"}</p><p className="mt-1 text-sm text-slate-600">{ticket.description || "אין תיאור"}</p><p className="mt-2 text-xs text-slate-500">{statusLabels[ticket.status] || ticket.status}</p></div>)}
              {panelTickets.length === 0 && <p className="py-8 text-center text-slate-500">אין תקלות להצגה</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateUserOpen} onOpenChange={(open) => !open && closeCreateUser()}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right text-xl font-bold text-slate-800">משתמש חדש</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-user-name">שם מלא <span className="text-red-500">*</span></Label>
              <Input id="new-user-name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="שם מלא" className="caret-blue-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-personal-id">מספר אישי <span className="text-red-500">*</span></Label>
              <Input id="new-user-personal-id" value={newUserPersonalId} onChange={(e) => setNewUserPersonalId(e.target.value)} placeholder="מספר אישי" className="caret-blue-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-password">סיסמה <span className="text-red-500">*</span></Label>
              <Input id="new-user-password" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="••••••••" className="caret-blue-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-role">תפקיד</Label>
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger id="new-user-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">לקוח</SelectItem>
                  <SelectItem value="technician">טכנאי</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {createUserError && <p className="text-sm font-medium text-red-600">{createUserError}</p>}
          </div>
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500"><span className="text-red-500">*</span> שדות חובה</p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button type="button" variant="outline" onClick={closeCreateUser}>ביטול</Button>
              <Button type="button" onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700">יצירת משתמש</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(resetPasswordUser)} onOpenChange={(open) => !open && closeResetPassword()}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right text-xl font-bold text-slate-800">איפוס סיסמה{resetPasswordUser ? ` — ${resetPasswordUser.fullName}` : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password-new">סיסמה חדשה <span className="text-red-500">*</span></Label>
              <Input id="reset-password-new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="caret-blue-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-password-confirm">אימות סיסמה <span className="text-red-500">*</span></Label>
              <Input id="reset-password-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="caret-blue-700" />
            </div>
            {resetPasswordError && <p className="text-sm font-medium text-red-600">{resetPasswordError}</p>}
          </div>
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500"><span className="text-red-500">*</span> שדות חובה</p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button type="button" variant="outline" onClick={closeResetPassword}>ביטול</Button>
              <Button type="button" onClick={handleResetPassword} className="bg-blue-600 hover:bg-blue-700">איפוס סיסמה</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
