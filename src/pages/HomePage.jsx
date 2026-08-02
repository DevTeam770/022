import { useState } from "react";
import { X, FileText, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function HomePage() {
  const [openTile, setOpenTile] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [newName, setNewName] = useState("");
  const [showValidation, setShowValidation] = useState(false);

  const handleClose = () => {
    setOpenTile(null);
    setName("");
    setPhone("");
    setDescription("");
    setNewName("");
    setShowValidation(false);
  };

  const handleNameRequest = (event) => {
    event.preventDefault();
    if (!name || !phone || !description || !newName) {
      setShowValidation(true);
      return;
    }
    toast.success("הבקשה נשלחה בהצלחה");
    handleClose();
  }; 

  const tiles = [
    { id: 1, title: "שינוי/הוספת שם" },
    { id: 2, title: "מחיקת/הוספת קיצורים" },
    { id: 3, title: "שינוי/הוספת/מחיקת פרופיל" },
    { id: 4, title: "יצירת/מחיקת קבוצת ליקוט" },
  ];

  return (
    <div className="fixed inset-0 top-24 z-0">
      {/* Background image - full page */}
      <img
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop"
        alt="Mountains and water"
        className="h-full w-full object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center -mt-24">
        <div className="flex flex-col gap-6">
          {/* Title - shifted slightly up and right */}
          <h1 className="text-3xl font-bold text-white drop-shadow-lg text-right relative -top-10 left-16">
            פעולות בשירות עצמי
          </h1>

          {/* Grid of 4 tiles - centered */}
          <div className="grid grid-cols-4 gap-8">
          {tiles.map((item) => (
            <div
              key={item.id}
              onClick={() => setOpenTile(item)}
              className="flex h-24 w-60 cursor-pointer items-center justify-center rounded-lg border-2 border-white bg-white/90 p-3 text-center transition-all duration-200 hover:scale-110 hover:bg-white hover:shadow-2xl"
            >
              <span className="text-base font-medium text-black">{item.title}</span>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Tile Dialog */}
      <Dialog open={!!openTile} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-h-[92vh] w-[calc(100%-2rem)] max-w-xl gap-0 overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-2xl [&>button]:hidden" dir="rtl">
          {/* Blue topbar */}
          <div className="relative flex items-center justify-start bg-blue-900 px-4 py-4">
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="absolute left-4 text-white hover:bg-white/15 hover:text-blue-300"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">סגירה</span>
            </Button>
            <DialogHeader className="m-0 p-0 text-right sm:text-right" dir="rtl">
              <DialogTitle className="text-white text-xl font-bold text-right" dir="rtl">
                {openTile?.title}
              </DialogTitle>
            </DialogHeader>
          </div>

          {openTile?.id === 1 ? (
            <form onSubmit={handleNameRequest} className="space-y-6 p-6 sm:p-8">
              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-blue-900">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <h2 className="font-semibold">פרטי הבקשה</h2>
                  <p className="mt-1 text-sm text-blue-700">מלא את הפרטים ונעביר את הבקשה לטיפול.</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="request-name" className="font-medium text-slate-700">שם <span className="text-red-500">*</span></Label>
                  <Input id="request-name" aria-invalid={showValidation && !name} value={name} onChange={(event) => setName(event.target.value)} placeholder="הזן שם מלא" className={`h-11 caret-blue-700 ${showValidation && !name ? "border-red-500 focus-visible:ring-red-500" : ""}`} />
                  {showValidation && !name && <p className="text-sm font-medium text-red-600">נא למלא שדה זה</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request-phone" className="font-medium text-slate-700">מספר טלפון <span className="text-red-500">*</span></Label>
                  <Input id="request-phone" type="tel" inputMode="tel" aria-invalid={showValidation && !phone} value={phone} onChange={(event) => setPhone(event.target.value.replace(/[^0-9*+#-]/g, ""))} placeholder="הזן מספר טלפון" className={`h-11 caret-blue-700 ${showValidation && !phone ? "border-red-500 focus-visible:ring-red-500" : ""}`} />
                  {showValidation && !phone && <p className="text-sm font-medium text-red-600">נא למלא שדה זה</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-description" className="font-medium text-slate-700">תיאור <span className="text-red-500">*</span></Label>
                <Textarea id="request-description" aria-invalid={showValidation && !description} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="תאר בקצרה את השינוי המבוקש" className={`min-h-28 resize-none caret-blue-700 ${showValidation && !description ? "border-red-500 focus-visible:ring-red-500" : ""}`} />
                {showValidation && !description && <p className="text-sm font-medium text-red-600">נא למלא שדה זה</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-new-name" className="font-medium text-slate-700">שם חדש <span className="text-red-500">*</span></Label>
                <Input id="request-new-name" aria-invalid={showValidation && !newName} value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="הזן את השם החדש" className={`h-11 caret-blue-700 ${showValidation && !newName ? "border-red-500 focus-visible:ring-red-500" : ""}`} />
                {showValidation && !newName && <p className="text-sm font-medium text-red-600">נא למלא שדה זה</p>}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500"><span className="text-red-500">*</span> שדות חובה</p>
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <Button type="button" variant="outline" onClick={handleClose} className="h-11">ביטול</Button>
                  <Button type="submit" className="h-11 gap-2 bg-blue-600 px-6 hover:bg-blue-700">
                    <Send className="h-4 w-4" />
                    שליחת בקשה
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="px-8 py-6 dir-rtl" dir="rtl">
              <p className="text-center text-blue-900">תוכן עבור: {openTile?.title}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
