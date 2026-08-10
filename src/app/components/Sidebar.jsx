"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname =
    usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "▦",
    },
    {
      name: "Search",
      href: "/search",
      icon: "⌕",
    },
    {
      name: "History",
      href: "/history",
      icon: "◷",
    },
    {
      name: "Saved",
      href: "/saved",
      icon: "♡",
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: "▥",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: "♙",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: "⚙",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-gray-200 bg-white">

      {/* LOGO */}
      <div className="flex h-[90px] items-center px-8">

        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-xl text-white">
          ▶
        </div>

        <div className="text-xl font-bold">
          InsightTube-
          <span className="text-purple-600">
            AI
          </span>
        </div>

      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-4">

        {menuItems.map(
          (item) => {

            const active =
              pathname ===
                item.href ||
              (
                item.href ===
                  "/search" &&
                pathname.startsWith(
                  "/search"
                )
              );

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`mb-2 flex items-center gap-4 rounded-xl px-5 py-3.5 text-[15px] font-medium transition ${
                  active
                    ? "bg-purple-50 text-purple-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >

                <span className="w-5 text-lg">
                  {item.icon}
                </span>

                <span>
                  {item.name}
                </span>

              </Link>
            );
          }
        )}

      </nav>

      {/* USER */}
      <div className="border-t border-gray-100 p-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold text-white">
            V
          </div>

          <div>

            <p className="text-sm font-semibold text-gray-800">
              User
            </p>

            <p className="text-xs text-gray-400">
              Student
            </p>

          </div>

        </div>

      </div>

    </aside>
  );
}