import { useState } from "react";
import { useCollectionStore } from "@/store/useCollectionStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function CollectionsPage() {
  const { groups, createGroup, deleteGroup, addItemToGroup, deleteItem } = useCollectionStore();

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");

  const handleCreateGroup = () => {
    if (!newGroupName) {
      toast.error("נא להזין שם לקבוצה");
      return;
    }
    const group = createGroup(newGroupName, newGroupDescription);
    setNewGroupName("");
    setNewGroupDescription("");
    setSelectedGroupId(group.id);
    toast.success("קבוצת הליקוט נוצרה");
  };

  const handleAddItem = () => {
    if (!selectedGroupId || !itemName) {
      toast.error("נא לבחור קבוצה ולהזין שם פריט");
      return;
    }
    addItemToGroup(selectedGroupId, { name: itemName, quantity: Number(itemQuantity) || 1 });
    setItemName("");
    setItemQuantity("1");
    toast.success("הפריט נוסף לקבוצה");
  };

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">קבוצות ליקוט</h1>
          <p className="text-muted-foreground">יצירת קבוצות והוספת פריטים</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>קבוצות קיימות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">שם קבוצה חדשה</Label>
              <Input
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="לדוג': ציוד משרדי"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupDescription">תיאור</Label>
              <Textarea
                id="groupDescription"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="תיאור קצר של הקבוצה"
                rows={2}
              />
            </div>
            <Button onClick={handleCreateGroup}>
              <PlusCircle className="mr-2 h-4 w-4" />
              צור קבוצה
            </Button>

            <div className="space-y-2 pt-4">
              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground">עדיין אין קבוצות</p>
              ) : (
                groups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`cursor-pointer rounded-md border p-3 transition-colors ${
                      selectedGroupId === group.id ? "bg-accent" : "hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{group.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {group.description || "אין תיאור"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{group.items.length} פריטים</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGroup(group.id);
                            if (selectedGroupId === group.id) setSelectedGroupId(null);
                            toast.success("הקבוצה נמחקה");
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>פריטים בקבוצה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedGroup ? (
              <>
                <div className="space-y-2">
                  <p className="font-medium">{selectedGroup.name}</p>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="md:col-span-2">
                      <Input
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="שם הפריט"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        min={1}
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(e.target.value)}
                        placeholder="כמות"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddItem} className="w-full">
                    הוסף פריט לקבוצה
                  </Button>
                </div>

                <div className="space-y-2">
                  {selectedGroup.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">אין פריטים בקבוצה זו</p>
                  ) : (
                    selectedGroup.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">כמות: {item.quantity}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            deleteItem(selectedGroup.id, item.id);
                            toast.success("הפריט נמחק");
                          }}
                        >
                          מחק
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">בחר קבוצה כדי לנהל את הפריטים שלה</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
