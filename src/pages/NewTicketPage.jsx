import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, ArrowRight, X, LayoutDashboard, BarChart3, FileText, Settings, Shield, LogOut, Bell, ChevronLeft, HelpCircle, Save, User, Building2, Smartphone } from "lucide-react";

const API_URL = "http://localhost:3001";

const PRIORITIES = [
  { value: "low", label: "נמוכה" },
  { value: "medium", label: "בינונית" },
  { value: "high", label: "גבוהה" },
  { value: "urgent", label: "דחופה" },
];

export function NewTicketPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [systems, setSystems] = useState([]);
  const [faultTypes, setFaultTypes] = useState([]);
  const [systemName, setSystemName] = useState("");
  const [faultType, setFaultType] = useState("");
  const [description, setDescription] = useState("");
  const [personalId, setPersonalId] = useState("");
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    fetch(`${API_URL}/systems`).then((r) => r.json()).then(setSystems);
    fetch(`${API_URL}/faultTypes`).then((r) => r.json()).then(setFaultTypes);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!systemName || !description) {
      toast.error("נא למלא את שם המערכת ותיאור התקלה");
      return;
    }

    const ticket = {
      systemName,
      faultType,
      description,
      personalId,
      phone,
      mobile,
      location,
      priority,
      status: "open",
      createdBy: user?.email,
      createdByName: user?.fullName,
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticket),
      });
      toast.success("התקלה נפתחה בהצלחה ונשמרה במסד הנתונים");
      navigate("/tickets");
    } catch {
      toast.error("שגיאה בשמירת התקלה");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex h-full items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">מערכת 022</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" className="gap-2 text-slate-600 hover:text-blue-600" onClick={() => navigate("/admin/dashboard")}>
                <LayoutDashboard className="h-4 w-4" />
                דשבורד
              </Button>
              <Button variant="ghost" className="gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100">
                <Plus className="h-4 w-4" />
                פתיחת תקלה
              </Button>
              <Button variant="ghost" className="gap-2 text-slate-600 hover:text-blue-600" onClick={() => navigate("/tickets")}>
                <FileText className="h-4 w-4" />
                התקלות שלי
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-slate-600">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 pl-4 pr-1 py-1">
              <span className="hidden sm:block text-sm font-medium text-slate-700">{user?.fullName || user?.email}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                <User className="h-4 w-4" />
              </div>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="icon" className="text-slate-600 hover:text-red-600">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-60 flex-col border-l border-slate-200 bg-white lg:flex min-h-[calc(100vh-64px)]">
          <nav className="flex-1 space-y-1 p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-100"
              onClick={() => navigate("/admin/dashboard")}
            >
              <LayoutDashboard className="h-4 w-4" />
              דשבורד
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              פתיחת תקלה
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-100"
              onClick={() => navigate("/tickets")}
            >
              <FileText className="h-4 w-4" />
              התקלות שלי
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-100">
              <BarChart3 className="h-4 w-4" />
              ניתוח נתונים
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-100">
              <Settings className="h-4 w-4" />
              הגדרות
            </Button>
          </nav>

          <div className="border-t border-slate-200 p-4">
            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              className="w-full justify-start gap-3 text-slate-600 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              התנתק
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-5xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Button variant="ghost" className="h-auto p-0 text-slate-500 hover:text-blue-600" onClick={() => navigate("/admin/dashboard")}>
                דשבורד
              </Button>
              <ChevronLeft className="h-4 w-4 rotate-180" />
              <span className="text-slate-900">פתיחת תקלה חדשה</span>
            </div>

            {/* Page Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">פתיחת תקלה חדשה</h1>
                <p className="mt-2 text-slate-500">מלא את הפרטים הבאים כדי לדווח על תקלה במערכת</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/tickets")} className="gap-2 w-fit">
                <X className="h-4 w-4" />
                ביטול
              </Button>
            </div>

            {/* Form Card */}
            <Card className="overflow-hidden border-0 bg-white shadow-lg">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-800">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Plus className="h-5 w-5" />
                  </div>
                  פרטי התקלה
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Ticket Details Section */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <HelpCircle className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold text-slate-800">תיאור הבעיה</h3>
                    </div>
                    
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="systemName" className="text-sm font-medium text-slate-700">
                          שם מערכת <span className="text-red-500">*</span>
                        </Label>
                        <Select value={systemName} onValueChange={setSystemName}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="בחר מערכת" />
                          </SelectTrigger>
                          <SelectContent>
                            {systems.map((sys) => (
                              <SelectItem key={sys.id} value={sys.name}>
                                {sys.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="faultType" className="text-sm font-medium text-slate-700">
                          סוג תקלה
                        </Label>
                        <Select value={faultType} onValueChange={setFaultType}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="בחר סוג תקלה" />
                          </SelectTrigger>
                          <SelectContent>
                            {faultTypes.map((ft) => (
                              <SelectItem key={ft.id} value={ft.name}>
                                {ft.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                        תיאור התקלה <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="תאר את הבעיה בפירוט כדי שנוכל לטפל בה במהירות"
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <User className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold text-slate-800">פרטי יצירת קשר</h3>
                    </div>
                    
                    <div className="grid gap-5 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="personalId" className="text-sm font-medium text-slate-700">מס' אישי</Label>
                        <Input
                          id="personalId"
                          value={personalId}
                          onChange={(e) => setPersonalId(e.target.value)}
                          placeholder="מספר אישי"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-slate-700">טלפון</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="מספר טלפון"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile" className="text-sm font-medium text-slate-700">נייד</Label>
                        <Input
                          id="mobile"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="מספר נייד"
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Priority & Location Section */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold text-slate-800">מיקום ועדיפות</h3>
                    </div>
                    
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="priority" className="text-sm font-medium text-slate-700">עדיפות</Label>
                        <Select value={priority} onValueChange={setPriority}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="בחר עדיפות" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITIES.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium text-slate-700">מיקום / מחלקה</Label>
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="לדוג': קריה, בניין 3, קומה 2"
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-100">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate("/tickets")}
                      className="gap-2 h-11 px-6"
                    >
                      <X className="h-4 w-4" />
                      ביטול
                    </Button>
                    <Button type="submit" className="gap-2 h-11 px-8 bg-blue-600 hover:bg-blue-700">
                      <Save className="h-4 w-4" />
                      פתח תקלה
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
