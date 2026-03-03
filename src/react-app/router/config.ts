import { ComponentType } from 'react';
import { AuthPage } from '../pages/Auth';
import { ConfirmEmailPage } from '../pages/Auth/ConfirmEmail';
import { EmailConfirmedPage } from '../pages/Auth/EmailConfirmed';
import { NotFoundPage } from '../pages/NotFound';
import { AcceptInvitePage } from '../pages/Invite/AcceptInvitePage';
import { RoomListPage } from '../pages/Rooms/RoomListPage';
import { CreateRoomPage } from '../pages/Rooms/CreateRoomPage';
import { RoomBrowserPage } from '../pages/Rooms/RoomBrowserPage';
import { AuditLogPage } from '../pages/Rooms/AuditLogPage';
import { SettingsPage } from '../pages/Rooms/SettingsPage';

export type RouteType = {
  path?: string;
  key: string;
  component: ComponentType<object>;
  children?: RouteType[];
  index?: boolean;
  requiresAuth?: boolean;
};

type RoutesConfig = RouteType[];

const routes: RoutesConfig = [
  {
    path: "/auth",
    key: "Auth",
    component: AuthPage,
  },
  {
    path: "/auth/confirm-email",
    key: "ConfirmEmail",
    component: ConfirmEmailPage,
  },
  {
    path: "/auth/email-confirmed",
    key: "EmailConfirmed",
    component: EmailConfirmedPage,
  },
  {
    path: "/invite",
    key: "AcceptInvite",
    component: AcceptInvitePage,
  },
  {
    path: "/rooms",
    key: "RoomList",
    component: RoomListPage,
    requiresAuth: true,
  },
  {
    path: "/rooms/new",
    key: "CreateRoom",
    component: CreateRoomPage,
    requiresAuth: true,
  },
  {
    path: "/rooms/:roomId",
    key: "RoomBrowser",
    component: RoomBrowserPage,
    requiresAuth: true,
  },
  {
    path: "/rooms/:roomId/audit",
    key: "AuditLog",
    component: AuditLogPage,
    requiresAuth: true,
  },
  {
    path: "/rooms/:roomId/settings",
    key: "Settings",
    component: SettingsPage,
    requiresAuth: true,
  },
  {
    path: "*",
    key: "NotFound",
    component: NotFoundPage,
  },
];

export default routes;
