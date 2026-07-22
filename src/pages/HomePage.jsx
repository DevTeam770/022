import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function HomePage() {
  const [openTile, setOpenTile] = useState(null);

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
      <Dialog open={!!openTile} onOpenChange={() => setOpenTile(null)}>
        <DialogContent className="p-0 overflow-hidden border-0 bg-white [&>button]:hidden max-w-md w-full">
          {/* Blue topbar */}
          <div className="relative flex items-center justify-center bg-blue-900 px-4 py-4">
            <button
              onClick={() => setOpenTile(null)}
              className="absolute left-4 text-white hover:text-blue-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <DialogHeader className="m-0 p-0" dir="rtl">
              <DialogTitle className="text-white text-xl font-bold text-center" dir="rtl">
                {openTile?.title}
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* White body */}
          <div className="px-8 py-6 dir-rtl" dir="rtl">
            <p className="text-blue-900 text-center">תוכן עבור: {openTile?.title}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
