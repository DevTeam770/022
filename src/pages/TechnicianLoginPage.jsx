import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

export function TechnicianLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [personalId, setPersonalId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!personalId || !password) {
      toast.error("נא להזין מספר אישי וסיסמה");
      return;
    }

    try {
      const { token, user } = await apiFetch("/auth/login/technician", {
        method: "POST",
        body: { personalId, password },
        auth: false,
      });
      login(user, token);
      toast.success("התחברת בהצלחה כטכנאי");
      navigate("/technician/dashboard");
    } catch {
      const message = "מספר אישי או הסיסמה שגויים. נסה שוב.";
      setLoginError(message);
      toast.error(message);
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
            <CardTitle className="text-2xl">כניסת טכנאי</CardTitle>
            <CardDescription>התחבר כדי לנהל ולטפל בתקלות</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personalId">מספר אישי</Label>
                <Input
                  id="personalId"
                  type="text"
                  placeholder="מספר אישי"
                  value={personalId}
                  onChange={(e) => {
                    setPersonalId(e.target.value);
                    setLoginError("");
                  }}
                  aria-invalid={Boolean(loginError)}
                  className={`caret-blue-700 ${loginError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">סיסמה</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError("");
                  }}
                  aria-invalid={Boolean(loginError)}
                  className={`caret-blue-700 ${loginError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
              </div>
              {loginError && (
                <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {loginError}
                </p>
              )}
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
