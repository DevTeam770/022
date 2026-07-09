import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useTicketStore } from "@/store/useTicketStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "hardware", label: "חומרה" },
  { value: "software", label: "תוכנה" },
  { value: "network", label: "רשת" },
  { value: "printer", label: "מדפסת" },
  { value: "email", label: "אימייל" },
  { value: "other", label: "אחר" },
];

const PRIORITIES = [
  { value: "low", label: "נמוכה" },
  { value: "medium", label: "בינונית" },
  { value: "high", label: "גבוהה" },
  { value: "urgent", label: "דחופה" },
];

export function NewTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addTicket } = useTicketStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [location, setLocation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description || !category) {
      toast.error("נא למלא את כל השדות החובה");
      return;
    }

    addTicket({
      title,
      description,
      category,
      priority,
      location,
      createdBy: user.email,
      createdByName: user.fullName,
    });

    toast.success("התקלה נפתחה בהצלחה");
    navigate("/tickets");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>פתיחת תקלה חדשה</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">כותרת התקלה *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="לדוג': המחשב לא נדלק"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">קטגוריה *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר קטגוריה" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
