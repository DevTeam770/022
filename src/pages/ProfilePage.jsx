import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { profile, setProfile, addShortcut, deleteShortcut } = useProfileStore();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [department, setDepartment] = useState(profile.department || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [shortcutName, setShortcutName] = useState("");
  const [shortcutUrl, setShortcutUrl] = useState("");

  const handleSaveProfile = () => {
    updateUser({ fullName });
    setProfile({ fullName, department, phone });
    toast.success("הפרופיל עודכן בהצלחה");
  };

  const handleAddShortcut = () => {
    if (!shortcutName || !shortcutUrl) {
      toast.error("נא למלא שם וכתובת לקיצור");
      return;
    }
    addShortcut({ name: shortcutName, url: shortcutUrl });
    setShortcutName("");
    setShortcutUrl("");
    toast.success("הקיצור נוסף");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">הגדרות פרופיל</h1>

      <Card>
        <CardHeader>
          <CardTitle>פרטים אישיים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">שם מלא</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" value={user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">מחלקה</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="מחלקה"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="טלפון"
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile}>שמור שינויים</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>קיצורים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="shortcutName">שם הקיצור</Label>
              <Input
                id="shortcutName"
                value={shortcutName}
                onChange={(e) => setShortcutName(e.target.value)}
                placeholder="לדוג': פורטל ארגוני"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="shortcutUrl">כתובת (URL)</Label>
              <div className="flex gap-2">
                <Input
                  id="shortcutUrl"
                  value={shortcutUrl}
                  onChange={(e) => setShortcutUrl(e.target.value)}
                  placeholder="https://..."
                />
                <Button onClick={handleAddShortcut}>הוסף</Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {profile.shortcuts.length === 0 ? (
              <p className="text-sm text-muted-foreground">עדיין אין קיצורים</p>
            ) : (
              profile.shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{shortcut.name}</p>
                    <p className="text-sm text-muted-foreground">{shortcut.url}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteShortcut(index)}>
                    מחק
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
