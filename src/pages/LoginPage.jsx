import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { setProfile } = useProfileStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("נא למלא את כל השדות");
      return;
    }

    try {
      const { token, user } = await apiFetch("/auth/login/customer", {
        method: "POST",
        body: { email, password },
        auth: false,
      });
      login(user, token);
      setProfile({ fullName: user.fullName, email: user.email });
      toast.success("התחברת בהצלחה");
      navigate("/");
    } catch {
      toast.error("לא ניתן להתחבר לשרת. נסה שוב מאוחר יותר.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <div className="flex flex-1 items-center justify-center p-4">
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
              <Button type="submit" className="w-full">
                התחבר
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
