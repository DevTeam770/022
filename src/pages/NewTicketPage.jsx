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

const API_URL = "http://localhost:3001";

const PRIORITIES = [
  { value: "low", label: "נמוכה" },
  { value: "medium", label: "בינונית" },
  { value: "high", label: "גבוהה" },
  { value: "urgent", label: "דחופה" },
];

export function NewTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [systems, setSystems] = useState([]);
  const [systemName, setSystemName] = useState("");
  const [description, setDescription] = useState("");
  const [personalId, setPersonalId] = useState("");
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    fetch(`${API_URL}/systems`).then((r) => r.json()).then(setSystems);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!systemName || !description) {
      toast.error("נא למלא את שם המערכת ותיאור התקלה");
      return;
    }

    const ticket = {
      systemName,
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
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>פתיחת תקלה חדשה</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            <div className="space-y-2">
              <Label htmlFor="systemName">שם מערכת *</Label>
              <Select value={systemName} onValueChange={setSystemName}>
                <SelectTrigger>
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
              <Label htmlFor="description">תיאור התקלה *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="תאר את הבעיה בפירוט"
                rows={5}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="personalId">מס' אישי</Label>
                <Input
                  id="personalId"
                  value={personalId}
                  onChange={(e) => setPersonalId(e.target.value)}
                  placeholder="מספר אישי"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">מס' טלפון</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="טלפון"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">מס' נייד</Label>
                <Input
                  id="mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="נייד"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">עדיפות</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">מיקום / מחלקה</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="לדוג': קריה, בניין 3, קומה 2"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">פתח תקלה</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/tickets")}>
                ביטול
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
