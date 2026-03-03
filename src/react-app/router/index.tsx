import { Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import routes, { RouteType } from "./config";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useSession } from "../hooks/useUserProfile";

function RootRedirect() {
  const { data: session, isLoading } = useSession()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return <Navigate to={session ? "/rooms" : "/auth"} replace />
}

const Router = () => {
  const renderRoutes = (routes: RouteType[]) => {
    return routes.map((route) => {
      const RouteElement = route.requiresAuth ? (
        <ProtectedRoute>
          <route.component />
        </ProtectedRoute>
      ) : (
        <route.component />
      );

      if (route.index) {
        return <Route index key={route.key} element={RouteElement} />;
      }
      return (
        <Route key={route.key} path={route.path} element={RouteElement}>
          {route.children && renderRoutes(route.children)}
        </Route>
      );
    });
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            {renderRoutes(routes)}
          </Routes>
        </div>
      </div>
    </Suspense>
  );
};

export default Router;
