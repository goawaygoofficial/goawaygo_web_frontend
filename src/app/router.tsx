import { Navigate, createBrowserRouter } from 'react-router-dom';
import {
  AuthPage,
  ForgotPasswordPage,
  RegisterPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from '@/features/auth';
import { AdminAnnouncementsPage, AdminReportsPage } from '@/features/admin';
import { DestinationInfoPage } from '@/features/destination';
import { FlightResultsPage, RentalResultsPage, StayResultsPage } from '@/features/book';
import { FlightSearchPage } from '@/features/flights';
import { NotificationSettingsPage, NotificationsPage } from '@/features/notifications';
import { PlanFormPage, PlanPage } from '@/features/plans';
import { DownloadPage } from '@/features/getApp';
import { HomePage } from '@/features/home';
import { CommunityGuidelinesPage, DeleteDataPage, PrivacyPage, TermsPage } from '@/features/legal';
import { ProfilePage, UserProfilePage } from '@/features/profile';
import { RentalSearchPage } from '@/features/rentals';
import { SplashPage } from '@/features/splash';
import { StaySearchPage } from '@/features/stays';
import { MyTripsPage } from '@/features/trips';
import {
  EditProfilePage,
  NewPostPage,
  PeoplePage,
  PostPage,
  WanderbookPage,
  WanderbookProfilePage,
} from '@/features/wanderbook';
import { routes } from '@/lib/routes';
import { OverlayLayout } from './layouts/OverlayLayout';
import { ShellLayout } from './layouts/ShellLayout';
import { ScrollToTop } from './ScrollToTop';

export const router = createBrowserRouter([
  {
    element: <ScrollToTop />,
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
      {
        element: <ShellLayout />,
        children: [
          { path: routes.home, element: <HomePage /> },
          { path: routes.trips, element: <MyTripsPage /> },
          { path: routes.wanderbook, element: <WanderbookPage /> },
          { path: routes.wanderbookProfilePattern, element: <WanderbookProfilePage /> },
          { path: routes.wanderbookPostPattern, element: <PostPage /> },
          {
            path: routes.profile,
            element: <ProfilePage />,
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
          { path: routes.flights, element: <FlightSearchPage /> },
          { path: routes.flightResults, element: <FlightResultsPage /> },
          { path: routes.stayResults, element: <StayResultsPage /> },
          { path: routes.rentalResults, element: <RentalResultsPage /> },
          { path: routes.stays, element: <StaySearchPage /> },
          { path: routes.rentals, element: <RentalSearchPage /> },
          { path: routes.destinationPattern, element: <DestinationInfoPage /> },
          { path: routes.planNew, element: <PlanFormPage /> },
          { path: routes.sharedPlanPattern, element: <PlanPage shared /> },
          { path: routes.planPattern, element: <PlanPage /> },
          { path: routes.profileDetails, element: <UserProfilePage /> },
          { path: routes.download, element: <DownloadPage /> },
          { path: routes.privacy, element: <PrivacyPage /> },
          { path: routes.terms, element: <TermsPage /> },
          { path: routes.deleteMyData, element: <DeleteDataPage /> },
          { path: routes.communityGuidelines, element: <CommunityGuidelinesPage /> },
          { path: routes.wanderbookNewPost, element: <NewPostPage /> },
          { path: routes.wanderbookEditProfile, element: <EditProfilePage /> },
          { path: routes.wanderbookPeoplePattern, element: <PeoplePage /> },
          { path: routes.wanderbookRequests, element: <PeoplePage mode="requests" /> },
          { path: routes.wanderbookBlocked, element: <PeoplePage mode="blocked" /> },
          { path: routes.adminReports, element: <AdminReportsPage /> },
          { path: routes.adminAnnouncements, element: <AdminAnnouncementsPage /> },
          { path: routes.notifications, element: <NotificationsPage /> },
          { path: routes.notificationSettings, element: <NotificationSettingsPage /> },
        ],
      },
      { path: '*', element: <Navigate to={routes.home} replace /> },
    ],
  },
]);
