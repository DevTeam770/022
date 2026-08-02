import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, CheckCircle2, Wrench, Activity, Flag, ClipboardList, User, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

const API_URL = "http://localhost:3001";

const statusLabels = {
  open: "פתוחה",
  "in-progress": "בטיפול",
  resolved: "טופלה",
  closed: "סגורה",
};

const statusVariant = {
  open: "default",
  "in-progress": "secondary",
  resolved: "outline",
  closed: "outline",
};

const priorityLabels = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה",
  urgent: "דחופה",
};

const priorityTextColor = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-orange-600",
  urgent: "text-red-600",
};

const priorityDotColor = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

function countByKey(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "לא צוין";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

export function TechnicianDashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [note, setNote] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] = useState(false);

  const fetchTickets = () => {
    fetch(`${API_URL}/tickets`).then((r) => r.json()).then(setTickets);
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    const onFocus = () => fetchTickets();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  const handleLogout = () => {
    logout();
    navigate("/technician/login");
  };

  const toggleStatusFilter = (status) => {
    setStatusFilter((current) => (current === status ? null : status));
  };

  const handleStatusChange = async (status) => {
    if (!selectedTicket) return;
    try {
      await fetch(`${API_URL}/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast.success(`סטטוס התקלה עודכן ל${statusLabels[status]}`);
      fetchTickets();
    } catch {
      toast.error("שגיאה בעדכון הסטטוס");
    }
  };

  const handleAddNote = async () => {
    if (!selectedTicket || !note) return;
    const notes = [...(selectedTicket.notes || []), { text: note, createdAt: new Date().toISOString() }];
    try {
      await fetch(`${API_URL}/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      setNote("");
      toast.success("ההערה נשמרה");
      fetchTickets();
    } catch {
      toast.error("שגיאה בשמירת ההערה");
    }
  };

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in-progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  const bySystem = countByKey(tickets, "systemName");
  const byPriority = countByKey(tickets, "priority");
  const priorityOrder = ["urgent", "high", "medium", "low"];

  const visibleTickets = (statusFilter ? tickets.filter((t) => t.status === statusFilter) : tickets)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-8 md:p-12 shadow-2xl">
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight md:text-4xl">לוח טכנאי</h1>
              <p className="mt-2 text-lg text-white/90">ניהול וטיפול בתקלות בזמן אמת</p>
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
          <Card
            onClick={() => toggleStatusFilter("open")}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => event.key === "Enter" && toggleStatusFilter("open")}
            className={`group relative cursor-pointer overflow-hidden border-0 bg-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${statusFilter === "open" ? "ring-2 ring-rose-500" : ""}`}
          >
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-rose-500 to-orange-500" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl font-semibold text-slate-800">תקלות פתוחות</CardTitle>
              <div className="rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 p-3 text-white">
                <Ticket className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-5xl font-bold text-slate-900">{openCount}</div>
              <p className="mt-2 text-slate-500">ממתינות לטיפול</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => toggleStatusFilter("resolved")}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => event.key === "Enter" && toggleStatusFilter("resolved")}
            className={`group relative cursor-pointer overflow-hidden border-0 bg-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${statusFilter === "resolved" ? "ring-2 ring-violet-500" : ""}`}
          >
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-violet-500 to-purple-500" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl font-semibold text-slate-800">תקלות פתורות</CardTitle>
              <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 p-3 text-white">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-5xl font-bold text-slate-900">{resolvedCount}</div>
              <p className="mt-2 text-slate-500">תקלות שטופלו</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => toggleStatusFilter("in-progress")}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => event.key === "Enter" && toggleStatusFilter("in-progress")}
            className={`group relative cursor-pointer overflow-hidden border-0 bg-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${statusFilter === "in-progress" ? "ring-2 ring-emerald-500" : ""}`}
          >
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl font-semibold text-slate-800">בטיפול</CardTitle>
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3 text-white">
                <Wrench className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-5xl font-bold text-slate-900">{inProgressCount}</div>
              <p className="mt-2 text-slate-500">תקלות בטיפול כעת</p>
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
                      className="flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-white p-4"
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
                  <Flag className="h-5 w-5" />
                </div>
                התפלגות לפי עדיפות
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {Object.entries(byPriority).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Flag className="h-12 w-12 mb-4 opacity-50" />
                    <p>אין תקלות להצגה</p>
                  </div>
                ) : (
                  Object.entries(byPriority)
                    .sort(([a], [b]) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b))
                    .map(([priority, count]) => (
                      <div
                        key={priority}
                        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-white p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-4 w-4 rounded-full ${priorityDotColor[priority] || "bg-slate-400"} shadow-md`} />
                          <span className="font-semibold text-slate-700">{priorityLabels[priority] || priority}</span>
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

        {/* Tickets + Detail Panel */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-0 bg-white shadow-xl lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 p-2 text-white">
                  <ClipboardList className="h-5 w-5" />
                </div>
                רשימת תקלות
              </CardTitle>
              {statusFilter && (
                <Button variant="outline" size="sm" onClick={() => setStatusFilter(null)}>
                  נקה סינון: {statusLabels[statusFilter]}
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">מערכת</TableHead>
                    <TableHead className="text-right">מדווח</TableHead>
                    <TableHead className="text-right">עדיפות</TableHead>
                    <TableHead className="text-right">סטטוס</TableHead>
                    <TableHead className="text-right">תאריך</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500">
                        אין תקלות להצגה
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleTickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        className={selectedTicketId === ticket.id ? "bg-accent cursor-pointer" : "cursor-pointer"}
                        onClick={() => {
                          setSelectedTicketId(ticket.id);
                          setNote("");
                        }}
                      >
                        <TableCell className="font-medium">{ticket.systemName || "—"}</TableCell>
                        <TableCell>{ticket.createdByName || ticket.createdBy || "לא ידוע"}</TableCell>
                        <TableCell className={priorityTextColor[ticket.priority] || "text-slate-600"}>
                          {priorityLabels[ticket.priority] || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[ticket.status] || "outline"}>
                            {statusLabels[ticket.status] || ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(ticket.createdAt).toLocaleDateString("he-IL")}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-xl">
            <CardHeader className="border-b border-slate-100 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <div className="rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 p-2 text-white">
                  <User className="h-5 w-5" />
                </div>
                פרטי תקלה
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {selectedTicket ? (
                <>
                  <div className="space-y-1 rounded-xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-800">
                      {selectedTicket.systemName || "ללא רשת"}
                      {selectedTicket.faultType ? ` — ${selectedTicket.faultType}` : ""}
                    </p>
                    <p className="text-sm text-slate-600">{selectedTicket.description}</p>
                    {selectedTicket.location && (
                      <p className="text-xs text-slate-500">מיקום: {selectedTicket.location}</p>
                    )}
                    {(selectedTicket.phone || selectedTicket.mobile) && (
                      <p className="text-xs text-slate-500">
                        טלפון: {selectedTicket.phone || selectedTicket.mobile}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">עדכון סטטוס</p>
                    <Select value={selectedTicket.status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">הערות</p>
                    <div className="max-h-40 space-y-2 overflow-auto">
                      {(selectedTicket.notes || []).length === 0 ? (
                        <p className="text-sm text-slate-500">אין הערות</p>
                      ) : (
                        selectedTicket.notes.map((n, index) => (
                          <div key={index} className="rounded-md bg-slate-100 p-2 text-sm text-slate-700">
                            {n.text}
                          </div>
                        ))
                      )}
                    </div>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="הוסף הערה..."
                      rows={2}
                    />
                    <Button onClick={handleAddNote} className="w-full bg-blue-600 hover:bg-blue-700">
                      שמור הערה
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">בחר תקלה מהרשימה כדי לצפות בפרטים ולטפל בה</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isLogoutConfirmationOpen} onOpenChange={setIsLogoutConfirmationOpen}>
        <DialogContent className="max-w-md [&>button]:left-4 [&>button]:right-auto" dir="rtl">
          <DialogHeader className="text-right sm:text-right">
            <DialogTitle className="text-right text-xl font-bold text-slate-800">התנתקות מלוח הטכנאי</DialogTitle>
          </DialogHeader>
          <p className="text-right text-slate-600">האם אתה בטוח שברצונך להתנתק?</p>
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setIsLogoutConfirmationOpen(false)}>ביטול</Button>
            <Button type="button" onClick={handleLogout} className="bg-rose-600 hover:bg-rose-700">התנתק</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
