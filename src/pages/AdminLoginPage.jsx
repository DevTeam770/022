import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const API_URL = "http://localhost:3001";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("נא להזין שם משתמש וסיסמה");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admins?username=${username}&password=${password}`);
      const admins = await response.json();

      if (admins.length > 0) {
        login({ username, role: "admin" });
        toast.success("התחברת בהצלחה כמנהל");
        navigate("/admin/dashboard");
      } else {
        toast.error("שם משתמש או סיסמה שגויים");
      }
    } catch {
      toast.error("שגיאה בחיבור לשרת");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">כניסת מנהל</CardTitle>
          <CardDescription>התחבר כדי לצפות בנתוני המערכת</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">שם משתמש</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              התחבר
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
