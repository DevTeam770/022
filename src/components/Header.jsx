import { useEffect, useState } from "react";
import { X, Plus, Bell, ClipboardPlus, MapPin, Send, UserRound } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const API_URL = "http://localhost:3001";

export function Header() {
  const { user } = useAuthStore();
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [systemName, setSystemName] = useState("");
  const [description, setDescription] = useState("");
  const [personalId, setPersonalId] = useState("");
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [faultType, setFaultType] = useState("");
  const [priority, setPriority] = useState("medium");
  const [showValidation, setShowValidation] = useState(false);

  const [systems, setSystems] = useState([]);
  const [faultTypes, setFaultTypes] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/systems`).then((r) => r.json()).then(setSystems);
    fetch(`${API_URL}/faultTypes`).then((r) => r.json()).then(setFaultTypes);
  }, []);

  function handleClose() {
    setIsNewTicketOpen(false);
    setSystemName("");
    setDescription("");
    setPersonalId("");
    setPhone("");
    setMobile("");
    setBuilding("");
    setFloor("");
    setRoom("");
    setFaultType("");
    setShowValidation(false);
    setPriority("medium");
  }

  async function handleSubmit() {
    const hasMissingRequiredFields = !systemName || !description || !personalId || !phone || !mobile;

    if (hasMissingRequiredFields) {
      setShowValidation(true);
      return;
    }

    const ticket = {
      systemName,
      faultType,
      description,
      personalId,
      phone,
      mobile,
      location: [building, floor && `קומה ${floor}`, room && `חדר ${room}`].filter(Boolean).join(", "),
      status: "open",
      priority,
      createdBy: user?.email,
      createdByName: user?.fullName,
      createdAt: new Date().toISOString(),
    };
    try {
      await apiFetch("/tickets", { method: "POST", body: ticket });
      toast.success("התקלה נשמרה במסד הנתונים");
      handleClose();
    } catch {
      toast.error("שגיאה בשמירת התקלה");
    }
  }

  const fieldClass = "h-11 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 caret-blue-700 focus:border-blue-500 focus:ring-blue-500";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-28 items-center justify-between bg-blue-900 px-4 md:px-6">
        {/* Left side - new ticket button */}
        <Button
          onClick={() => setIsNewTicketOpen(true)}
          className="bg-white text-blue-900 hover:bg-blue-50 text-lg px-6 py-6"
        >
          <Plus className="mr-2 h-5 w-5" />
          יצירת תקלה חדשה
        </Button>

        {/* Right side - bell + logo + text */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-white hover:bg-blue-800 h-11 w-11"
          >
            <Bell className="h-7 w-7" />
          </Button>
          <span className="text-2xl font-bold text-white">Call Center 022</span>
          <div className="h-24 w-24 overflow-hidden rounded-full shadow-lg">
            <img
              src="/src/assets/logo022.png"
              alt="022 logo"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </header>

      <Dialog open={isNewTicketOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-h-[92vh] w-[calc(100%-2rem)] max-w-3xl gap-0 overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-2xl [&>button]:hidden" dir="rtl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-blue-100 bg-gradient-to-l from-blue-700 to-blue-600 px-6 py-5 text-white">
            <DialogHeader className="space-y-1 text-right">
              <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <ClipboardPlus className="h-5 w-5" />
                </span>
                יצירת תקלה חדשה
              </DialogTitle>
              <p className="pr-[52px] text-sm text-blue-100">נשמור את הפרטים ונעביר אותם לצוות המתאים</p>
            </DialogHeader>
            <Button onClick={handleClose} variant="ghost" size="icon" className="shrink-0 text-white hover:bg-white/15 hover:text-white">
              <X className="h-5 w-5" />
              <span className="sr-only">סגירה</span>
            </Button>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); handleSubmit(); }} className="p-6 sm:p-8">
            <section className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ClipboardPlus className="h-4 w-4 text-blue-600" />
                <h2 className="font-semibold text-slate-800">פרטי התקלה</h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ticket-system" className="font-medium text-slate-700">רשת <span className="text-red-500">*</span></Label>
                  <Select value={systemName} onValueChange={setSystemName}>
                    <SelectTrigger id="ticket-system" aria-invalid={showValidation && !systemName} className={`${fieldClass} ${showValidation && !systemName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}>
                      <SelectValue placeholder="בחר רשת" />
                    </SelectTrigger>
                    <SelectContent>
                      {systems.map((item) => (
                        <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showValidation && !systemName && <p className="text-sm font-medium text-red-600">נא למלא שדה זה</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket-fault-type" className="font-medium text-slate-700">סוג תקלה</Label>
                  <Select value={faultType} onValueChange={setFaultType}>
                    <SelectTrigger id="ticket-fault-type" className={fieldClass}>
                      <SelectValue placeholder="בחר סוג תקלה" />
                    </SelectTrigger>
                    <SelectContent>
                      {faultTypes.map((item) => (
                        <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticket-description" className="font-medium text-slate-700">תיאור התקלה <span className="text-red-500">*</span></Label>
                <Textarea
                  id="ticket-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="תאר את הבעיה בפירוט כדי שנוכל לטפל בה במהירות"
                  aria-invalid={showValidation && !description}
                  className={`min-h-28 resize-none border-slate-200 text-slate-900 placeholder:text-slate-400 caret-blue-700 focus:border-blue-500 focus:ring-blue-500 ${showValidation && !description ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                />
                {showValidation && !description && <p className="text-sm font-medium text-red-600">נא למלא שדה זה</p>}
              </div>
            </section>

            <section className="mt-8 space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <UserRound className="h-4 w-4 text-blue-600" />
                <h2 className="font-semibold text-slate-800">פרטי יצירת קשר</h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="ticket-personal-id" className="font-medium text-slate-700">מספר אישי <span className="text-red-500">*</span></Label>
                  <Input id="ticket-personal-id" aria-invalid={showValidation && !personalId} value={personalId} onChange={(e) => setPersonalId(e.target.value)} placeholder="מספר אישי" className={`${fieldClass} ${showValidation && !personalId ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`} />
                  {showValidation && !personalId && <p className="text-sm font-medium text-red-600">נא למלא שדה זה</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket-phone" className="font-medium text-slate-700">טלפון אדום <span className="text-red-500">*</span></Label>
                  <Input id="ticket-phone" type="tel" inputMode="tel" pattern="[0-9*+#-]*" aria-invalid={showValidation && !phone} value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9*+#-]/g, ""))} placeholder="מספר טלפון" className={`${fieldClass} ${showValidation && !phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`} />
                  {showValidation && !phone && <p className="text-sm font-medium text-red-600">נא למלא שדה זה</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket-mobile" className="font-medium text-slate-700">נייד <span className="text-red-500">*</span></Label>
                  <Input id="ticket-mobile" type="tel" inputMode="tel" pattern="[0-9*+#-]*" aria-invalid={showValidation && !mobile} value={mobile} onChange={(e) => setMobile(e.target.value.replace(/[^0-9*+#-]/g, ""))} placeholder="מספר נייד" className={`${fieldClass} ${showValidation && !mobile ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`} />
                  {showValidation && !mobile && <p className="text-sm font-medium text-red-600">נא למלא שדה זה</p>}
                </div>
              </div>
            </section>

            <section className="mt-8 space-y-5 border-b border-slate-100 pb-8">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <h2 className="font-semibold text-slate-800">מיקום</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="ticket-building" className="font-medium text-slate-700">בניין</Label>
                  <Select value={building} onValueChange={setBuilding}>
                    <SelectTrigger id="ticket-building" className={fieldClass}><SelectValue placeholder="בחר בניין" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="מגדל צפוני">מגדל צפוני</SelectItem>
                      <SelectItem value="מגדל דרומי">מגדל דרומי</SelectItem>
                      <SelectItem value="כנרית">כנרית</SelectItem>
                      <SelectItem value="הראל">הראל</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket-floor" className="font-medium text-slate-700">קומה</Label>
                  <Input id="ticket-floor" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="מספר קומה" className={fieldClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket-room" className="font-medium text-slate-700">חדר</Label>
                  <Input id="ticket-room" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="מספר חדר" className={fieldClass} />
                </div>
              </div>
            </section>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500"><span className="text-red-500">*</span> שדות חובה</p>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button type="button" variant="outline" onClick={handleClose} className="h-11 border-slate-200 text-slate-700">ביטול</Button>
                <Button type="submit" className="h-11 gap-2 bg-blue-600 px-6 hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                  פתיחת תקלה
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
