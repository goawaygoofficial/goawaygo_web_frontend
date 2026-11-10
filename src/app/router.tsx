import { Navigate, createBrowserRouter } from 'react-router-dom';
import {
  AuthPage,
  ConfirmEmailPage,
  ForgotPasswordPage,
  RegisterPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from '@/features/auth';
import { HomePage } from '@/features/home';
import { SplashPage } from '@/features/splash';
import { routes } from '@/lib/routes';
import { OverlayLayout } from './layouts/OverlayLayout';
import { ShellLayout } from './layouts/ShellLayout';
import { ScrollToTop } from './ScrollToTop';

/*
 * Speed (4.7): the pages people land on (splash, sign-in, Home) are in the first download; every other page loads
 * the first time it is opened, so the first visit downloads far less. The other tabs load when the browser is idle,
 * so switching tabs stays instant.
 */
const admin = () => import('@/features/admin');
const book = () => import('@/features/book');
const destination = () => import('@/features/destination');
const flights = () => import('@/features/flights');
const getApp = () => import('@/features/getApp');
const legal = () => import('@/features/legal');
const notifications = () => import('@/features/notifications');
const plans = () => import('@/features/plans');
const profile = () => import('@/features/profile');
const rentals = () => import('@/features/rentals');
const stays = () => import('@/features/stays');
const trips = () => import('@/features/trips');
const wanderbook = () => import('@/features/wanderbook');

/** The other tabs, fetched in the background once the first page is up. */
export function prefetchTabs(): void {
  const load = () => {
    void trips();
    void wanderbook();
    void profile();
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(load, { timeout: 4000 });
  else setTimeout(load, 2000);
}

export const router = createBrowserRouter([
  {
    element: <ScrollToTop />,
    // Shown (empty, on the blue background) while a page opened directly is still loading.
    hydrateFallbackElement: <div />,
    children: [
      { path: routes.splash, element: <SplashPage /> },
      {
        path: routes.auth,
        element: <AuthPage />,
        children: [
          { path: routes.register, element: <RegisterPage /> },
          { path: routes.forgotPassword, element: <ForgotPasswordPage /> },
        ],
      },
      // Opened from emailed links, signed in or not.
      { path: routes.resetPassword, element: <ResetPasswordPage /> },
      { path: routes.verifyEmail, element: <VerifyEmailPage /> },
      { path: routes.confirmEmail, element: <ConfirmEmailPage /> },
      {
        element: <ShellLayout />,
        children: [
          { path: routes.home, element: <HomePage /> },
          { path: routes.trips, lazy: async () => ({ Component: (await trips()).MyTripsPage }) },
          {
            path: routes.wanderbook,
            lazy: async () => ({ Component: (await wanderbook()).WanderbookPage }),
          },
          {
            path: routes.wanderbookProfilePattern,
            lazy: async () => ({ Component: (await wanderbook()).WanderbookProfilePage }),
          },
          {
            path: routes.wanderbookPostPattern,
            lazy: async () => ({ Component: (await wanderbook()).PostPage }),
          },
          {
            path: routes.profile,
            lazy: async () => ({ Component: (await profile()).ProfilePage }),
            // Register / Forgot Password from the Profile tab's sign-in panel (signed out only).
            children: [
              { path: routes.profileRegister, element: <RegisterPage /> },
              { path: routes.profileForgotPassword, element: <ForgotPasswordPage /> },
            ],
          },
        ],
      },
      {
        element: <OverlayLayout />,
        children: [
          {
            path: routes.flights,
            lazy: async () => ({ Component: (await flights()).FlightSearchPage }),
          },
          {
            path: routes.flightResults,
            lazy: async () => ({ Component: (await book()).FlightResultsPage }),
          },
          {
            path: routes.stayResults,
            lazy: async () => ({ Component: (await book()).StayResultsPage }),
          },
          {
            path: routes.rentalResults,
            lazy: async () => ({ Component: (await book()).RentalResultsPage }),
          },
          { path: routes.stays, lazy: async () => ({ Component: (await stays()).StaySearchPage }) },
          {
            path: routes.rentals,
            lazy: async () => ({ Component: (await rentals()).RentalSearchPage }),
          },
          {
            path: routes.destinationPattern,
            lazy: async () => ({ Component: (await destination()).DestinationInfoPage }),
          },
          { path: routes.planNew, lazy: async () => ({ Component: (await plans()).PlanFormPage }) },
          {
            path: routes.sharedPlanPattern,
            lazy: async () => {
              const { PlanPage } = await plans();
              return { element: <PlanPage shared /> };
            },
          },
          { path: routes.planPattern, lazy: async () => ({ Component: (await plans()).PlanPage }) },
          {
            path: routes.profileDetails,
            lazy: async () => ({ Component: (await profile()).UserProfilePage }),
          },
          {
            path: routes.recentlyViewed,
            lazy: async () => ({ Component: (await profile()).RecentlyViewedPage }),
          },
          {
            path: routes.download,
            lazy: async () => ({ Component: (await getApp()).DownloadPage }),
          },
          { path: routes.privacy, lazy: async () => ({ Component: (await legal()).PrivacyPage }) },
          { path: routes.terms, lazy: async () => ({ Component: (await legal()).TermsPage }) },
          {
            path: routes.deleteMyData,
            lazy: async () => ({ Component: (await legal()).DeleteDataPage }),
          },
          {
            path: routes.communityGuidelines,
            lazy: async () => ({ Component: (await legal()).CommunityGuidelinesPage }),
          },
          {
            path: routes.wanderbookNewPost,
            lazy: async () => ({ Component: (await wanderbook()).NewPostPage }),
          },
          {
            path: routes.wanderbookEditProfile,
            lazy: async () => ({ Component: (await wanderbook()).EditProfilePage }),
          },
          {
            path: routes.wanderbookPeoplePattern,
            lazy: async () => ({ Component: (await wanderbook()).PeoplePage }),
          },
          {
            path: routes.wanderbookRequests,
            lazy: async () => {
              const { PeoplePage } = await wanderbook();
              return { element: <PeoplePage mode="requests" /> };
            },
          },
          {
            path: routes.wanderbookBlocked,
            lazy: async () => {
              const { PeoplePage } = await wanderbook();
              return { element: <PeoplePage mode="blocked" /> };
            },
          },
          {
            path: routes.adminReports,
            lazy: async () => ({ Component: (await admin()).AdminReportsPage }),
          },
          {
            path: routes.adminAnnouncements,
            lazy: async () => ({ Component: (await admin()).AdminAnnouncementsPage }),
          },
          {
            path: routes.notifications,
            lazy: async () => ({ Component: (await notifications()).NotificationsPage }),
          },
          {
            path: routes.notificationSettings,
            lazy: async () => ({ Component: (await notifications()).NotificationSettingsPage }),
          },
        ],
      },
      { path: '*', element: <Navigate to={routes.home} replace /> },
    ],
  },
]);
