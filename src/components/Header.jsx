import { useEffect, useState } from "react";
import { X, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const API_URL = "http://localhost:3001";

export function Header() {
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [systemName, setSystemName] = useState("");
  const [faultType, setFaultType] = useState("");
  const [base, setBase] = useState("");
  const [call, setCall] = useState("");

  const [systems, setSystems] = useState([]);
  const [faultTypes, setFaultTypes] = useState([]);
  const [bases, setBases] = useState([]);
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/systems`).then((r) => r.json()).then(setSystems);
    fetch(`${API_URL}/faultTypes`).then((r) => r.json()).then(setFaultTypes);
    fetch(`${API_URL}/bases`).then((r) => r.json()).then(setBases);
    fetch(`${API_URL}/calls`).then((r) => r.json()).then(setCalls);
  }, []);

  function handleClose() {
    setIsNewTicketOpen(false);
    setSystemName("");
    setFaultType("");
    setBase("");
    setCall("");
  }

  function handleSubmit() {
    const ticket = { systemName, faultType, base, call, createdAt: new Date().toISOString() };
    fetch(`${API_URL}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticket),
    }).then(() => handleClose());
  }

  const selectClass =
    "w-full rounded-md border-2 border-blue-500 bg-white px-4 py-2 text-lg text-blue-900 focus:outline-none focus:border-blue-700";

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

      <Dialog open={isNewTicketOpen} onOpenChange={handleClose}>
        <DialogContent className="p-0 overflow-hidden border-0 bg-white [&>button]:hidden max-w-md w-full">
          {/* Blue topbar */}
          <div className="relative flex items-center justify-center bg-blue-900 px-4 py-4">
            <button
              onClick={handleClose}
              className="absolute left-4 text-white hover:text-blue-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <DialogHeader className="m-0 p-0">
              <DialogTitle className="text-white text-xl font-bold text-center">יצירת תקלה חדשה</DialogTitle>
            </DialogHeader>
          </div>

          {/* White body */}
          <div className="px-8 py-6 flex flex-col gap-4" dir="rtl">
            <Select value={systemName} onValueChange={setSystemName}>
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="שם מערכת" />
              </SelectTrigger>
              <SelectContent>
                {systems.map((item) => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {systemName && (
              <Select value={faultType} onValueChange={setFaultType}>
                <SelectTrigger className={selectClass}>
                  <SelectValue placeholder="סוג תקלה" />
                </SelectTrigger>
                <SelectContent>
                  {faultTypes.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {systemName && faultType && (
              <Select value={base} onValueChange={setBase}>
                <SelectTrigger className={selectClass}>
                  <SelectValue placeholder="בסיס" />
                </SelectTrigger>
                <SelectContent>
                  {bases.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {systemName && faultType && base && (
              <Select value={call} onValueChange={setCall}>
                <SelectTrigger className={selectClass}>
                  <SelectValue placeholder="קריאה" />
                </SelectTrigger>
                <SelectContent>
                  {calls.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {systemName && faultType && base && call && (
              <Button
                className="w-full bg-blue-900 text-white hover:bg-blue-800 text-lg py-6 mt-2"
                onClick={handleSubmit}
              >
                שליחה
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
