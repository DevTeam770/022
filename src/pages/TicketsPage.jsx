import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

const API_URL = "http://localhost:3001";

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

const statusVariant = {
  open: "default",
  "in-progress": "secondary",
  resolved: "outline",
  closed: "outline",
};

const priorityColor = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-orange-600",
  urgent: "text-red-600",
};

export function TicketsPage() {
  const navigate = useNavigate();
  const { user, role } = useAuthStore();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/tickets`)
      .then((r) => r.json())
      .then(setTickets);
  }, []);

  const visibleTickets =
    role === "technician" ? tickets : tickets.filter((t) => t.createdBy === user?.email);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {role === "technician" ? "כל התקלות" : "התקלות שלי"}
          </h1>
          <p className="text-muted-foreground">רשימת תקלות וסטטוסן</p>
        </div>
        <Button onClick={() => navigate("/tickets/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          תקלה חדשה
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>מערכת</TableHead>
                <TableHead>סוג תקלה</TableHead>
                <TableHead>תיאור</TableHead>
                <TableHead>עדיפות</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>תאריך</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    אין תקלות להצגה
                  </TableCell>
                </TableRow>
              ) : (
                visibleTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <TableCell className="font-medium">{ticket.systemName || "—"}</TableCell>
                    <TableCell className="text-sm">{ticket.faultType || "—"}</TableCell>
                    <TableCell className="max-w-xs truncate">{ticket.description}</TableCell>
                    <TableCell className={priorityColor[ticket.priority] || "text-gray-600"}>
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
    </div>
  );
}
