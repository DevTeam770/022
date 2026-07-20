import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { setProfile } = useProfileStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("נא למלא את כל השדות");
      return;
    }

    const fullName = email.split("@")[0];
    login({ email, fullName, role });
    setProfile({ fullName, email });
    toast.success(`התחברת בהצלחה כ${role === "technician" ? "טכנאי" : "לקוח"}`);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Wrench className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">מערכת תקלות</CardTitle>
          <CardDescription>התחבר כדי לפתוח ולנהל תקלות</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <div className="space-y-2">
              <Label htmlFor="role">סוג משתמש</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              >
                <option value="customer">לקוח</option>
                <option value="technician">טכנאי</option>
              </select>
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
