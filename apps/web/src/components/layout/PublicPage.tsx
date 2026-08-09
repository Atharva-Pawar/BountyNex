import { Outlet } from "react-router-dom";
import { PublicFooter, PublicNavbar } from "./PublicLayout";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <PublicFooter />
    </div>
  );
}
