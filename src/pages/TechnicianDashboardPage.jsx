import { useState } from "react";
import { useTicketStore } from "@/store/useTicketStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";

const statusLabels = {
  open: "פתוחה",
  "in-progress": "בטיפול",
  resolved: "טופלה",
  closed: "סגורה",
};

const priorityLabels = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה",
  urgent: "דחופה",
};

const priorityColor = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-orange-600",
  urgent: "text-red-600",
};

export function TechnicianDashboardPage() {
  const { tickets, updateTicket } = useTicketStore();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [note, setNote] = useState("");

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  const handleStatusChange = (status) => {
    if (!selectedTicket) return;
    updateTicket(selectedTicket.id, { status });
    toast.success(`סטטוס התקלה עודכן ל${statusLabels[status]}`);
  };

  const handleAddNote = () => {
    if (!selectedTicket || !note) return;
    const notes = [...(selectedTicket.notes || []), { text: note, createdAt: new Date().toISOString() }];
    updateTicket(selectedTicket.id, { notes });
    setNote("");
    toast.success("ההערה נשמרה");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">לוח טכנאי</h1>
        <p className="text-muted-foreground">ניהול וטיפול בכלל התקלות</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>רשימת תקלות</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>כותרת</TableHead>
                  <TableHead>מדווח</TableHead>
                  <TableHead>עדיפות</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>תאריך</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      אין תקלות במערכת
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className={selectedTicketId === ticket.id ? "bg-accent" : "cursor-pointer"}
                      onClick={() => {
                        setSelectedTicketId(ticket.id);
                        setNote("");
                      }}
                    >
                      <TableCell className="font-medium">{ticket.title}</TableCell>
                      <TableCell>{ticket.createdByName || ticket.createdBy}</TableCell>
                      <TableCell className={priorityColor[ticket.priority]}>
                        {priorityLabels[ticket.priority]}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ticket.status === "open" ? "default" : ticket.status === "in-progress" ? "secondary" : "outline"}>
                          {statusLabels[ticket.status]}
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

        <Card>
          <CardHeader>
            <CardTitle>פרטי תקלה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTicket ? (
              <>
                <div>
                  <p className="font-medium">{selectedTicket.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">עדכון סטטוס</p>
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
                  <p className="text-sm font-medium">הערות</p>
                  <div className="max-h-40 space-y-2 overflow-auto">
                    {(selectedTicket.notes || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">אין הערות</p>
                    ) : (
                      selectedTicket.notes.map((n, index) => (
                        <div key={index} className="rounded-md bg-muted p-2 text-sm">
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
                  <Button onClick={handleAddNote} className="w-full">
                    שמור הערה
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">בחר תקלה מהרשימה כדי לצפות בפרטים ולטפל בה</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
