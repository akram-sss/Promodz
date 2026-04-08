import '@styles/App.css'

import GuestMain from '@features/guest/GuestMain'
import AdminRoute from '@features/admin/AdminRoute'
import CompanyRoute from '@features/company/CompanyRoute'
import UserRoute from '@features/user/UserRoute'
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useUserLocation from '@hooks/useUserLocation';
import ModeratorRoute from '@features/moderator/ModeratorRoute'
import { AuthProvider } from '@context/AuthContext';
import { UserInteractionsProvider } from '@context/UserInteractionsContext';
import ProtectedRoute from '@components/ProtectedRoute';
import { analyticsAPI } from '@shared/api';

// Guest pages
import Home from '@features/guest/Home';
import Explore from '@features/guest/Explore';
import Products from '@features/guest/Products';
import Contact from '@features/guest/Contact';
import TermsAndPrivacy from '@features/guest/TermsAndPrivacy';
import PromotionPlans from '@features/guest/PromotionPlans';
import WorkWithUs from '@features/guest/WorkWithUs';
import Registration from '@features/guest/registration/Registration';
import Connection from '@features/guest/registration/Connection';
import ForgotPassword from '@features/guest/registration/ForgotPassword';
import ProductsCompany from '@features/guest/ProductsCompany';
import SearchResults from '@features/guest/SearchResults';
import CategoryResults from '@features/guest/CategoryResults';

// Admin pages
import DachboardAdmin from '@features/admin/Dashboard/DachboardAdmin';
import OverviewDachAdmin from '@features/admin/Dashboard/overviewDachAdmin';
import UsersDachAdmin from '@features/admin/Dashboard/UsersDachAdmin';
import DeletedUsers from '@features/admin/Dashboard/DeletedUsers';
import UserDetailPage from '@features/admin/UserDetailPage';
import ProductAdmin from '@features/admin/Product/ProductAdmin';
import OverviewProdAdmin from '@features/admin/Product/OverviewProdAdmin';
import AddPromotionAdmin from '@features/admin/Product/AddPromotionAdmin';
import CategoryAdmin from '@features/admin/Product/Category';
import DeletedPromotionTableAdmin from '@features/admin/Components/DeletedPromotionTable';
import SiteManagment from '@features/admin/SiteManagment/SiteManagment';
import LegalContentPage from '@features/admin/SiteManagment/LegalContentPage';
import MessagesTablePage from '@features/admin/SiteManagment/MessagesTablePage';
import AdsPage from '@features/admin/SiteManagment/AdsPage';
import PromotionPacksPage from '@features/admin/SiteManagment/PromotionPacksPage';
import TopCompaniesEditor from '@features/admin/SiteManagment/TopCompaniesEditor';
import AdminAccount from '@features/admin/AdminAccount';
import AdminPasswordResetFlow from '@features/admin/Components/restpassword/PasswordResetFlow';

// Company pages
import OverviewDachCompany from '@features/company/Dashboard/overviewDachCompany';
import ProductCompany from '@features/company/Product/ProductCompany';
import OverviewProdCompany from '@features/company/Product/OverviewProdCompany';
import AddPromotionCompany from '@features/company/Product/AddPromotionCompany';
import CategoryCompany from '@features/company/Product/Category';
import DeletedPromotionTableCompany from '@features/company/Components/DeletedPromotionTable';
import CompanyAccount from '@features/company/CompanyAccount';
import CompanyPasswordResetFlow from '@features/company/Components/restpassword/PasswordResetFlow';

// User pages
import OverviewDachUser from '@features/user/Dashboard/overviewDachUser';
import UserFavorit from '@features/user/UserFavorit';
import UserAccount from '@features/user/UserAccount';
import UserFollowing from '@features/user/UserFollowing';
import UserPasswordResetFlow from '@features/user/Components/restpassword/PasswordResetFlow';

// Moderator pages
import ModeratorDashboard from '@features/moderator/Dashboard/DachboardAdmin';
import ModeratorOverview from '@features/moderator/Dashboard/overviewDachAdmin';
import ModeratorUsers from '@features/moderator/Dashboard/UsersDachAdmin';
import ModeratorUserDetail from '@features/moderator/UserDetailPage';
import ModeratorProduct from '@features/moderator/Product/ProductAdmin';
import ModeratorOverviewProd from '@features/moderator/Product/OverviewProdAdmin';
import ModeratorAddPromotion from '@features/moderator/Product/AddPromotionAdmin';
import ModeratorCategory from '@features/moderator/Product/Category';
import ModeratorDeletedPromotions from '@features/moderator/Components/DeletedPromotionTable';
import ModeratorAccount from '@features/moderator/AdminAccount';
import ModeratorPasswordResetFlow from '@features/moderator/Components/restpassword/PasswordResetFlow';

function App() {
    const location = useUserLocation();

  // Track every visitor (guest or authenticated) on first page load
  useEffect(() => {
    analyticsAPI.trackVisit().catch(() => {});
  }, []);

  useEffect(() => {
    if (location) {
      // Keep silent by default; wire to backend when ready.
    }
  }, [location]);
  return (
    <AuthProvider>
    <UserInteractionsProvider>
    <BrowserRouter>
      <Routes>
        {/* Guest */}
        <Route element={<GuestMain />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/category/:subcategory" element={<CategoryResults />} />
          <Route path="/categories/:category" element={<CategoryResults />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:company" element={<ProductsCompany />} />
          <Route path="/search/:query" element={<SearchResults />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/termsandprivacy" element={<TermsAndPrivacy />} />
          <Route path="/promotion-plans" element={<PromotionPlans />} />
          <Route path="/work-with-us" element={<WorkWithUs />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/connection" element={<Connection />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Admin — SUPER_ADMIN only */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AdminRoute />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="AdminDashboard" replace />} />
          <Route path="AdminDashboard" element={<DachboardAdmin />}>
            <Route index element={<OverviewDachAdmin />} />
            <Route path="Users">
              <Route index element={<UsersDachAdmin />} />
              <Route path=":userId" element={<UserDetailPage />} />
            </Route>
            <Route path="DeletedUsers" element={<DeletedUsers />} />
          </Route>
          <Route path="AdminProduct" element={<ProductAdmin />}>
            <Route index element={<OverviewProdAdmin />} />
            <Route path="AddPromotion" element={<AddPromotionAdmin />} />
            <Route path="DeletedPromotions" element={<DeletedPromotionTableAdmin />} />
            <Route path="Category" element={<CategoryAdmin />} />
          </Route>
          <Route path="SiteManagment" element={<SiteManagment />}>
            <Route index element={<LegalContentPage />} />
            <Route path="LegalContent" element={<LegalContentPage />} />
            <Route path="Messages" element={<MessagesTablePage />} />
            <Route path="Ads" element={<AdsPage />} />
            <Route path="PromotionPacks" element={<PromotionPacksPage />} />
            <Route path="TopCompanies" element={<TopCompaniesEditor />} />
          </Route>
          <Route path="AdminAccount" element={<AdminAccount />} />
          <Route path="PasswordReset" element={<AdminPasswordResetFlow />} />
        </Route>

        {/* Company — ENTREPRISE only */}
        <Route path="/company" element={
          <ProtectedRoute allowedRoles={['ENTREPRISE']}>
            <CompanyRoute />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="CompanyDashboard" replace />} />
          <Route path="CompanyDashboard" element={<OverviewDachCompany />} />
          <Route path="CompanyProduct" element={<ProductCompany />}>
            <Route index element={<OverviewProdCompany />} />
            <Route path="AddPromotion" element={<AddPromotionCompany />} />
            <Route path="DeletedPromotions" element={<DeletedPromotionTableCompany />} />
            <Route path="Category" element={<CategoryCompany />} />
          </Route>
          <Route path="CompanyAccount" element={<CompanyAccount />} />
          <Route path="PasswordReset" element={<CompanyPasswordResetFlow />} />
        </Route>

        {/* User — USER only */}
        <Route path="/user" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <UserRoute />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="UserDashboard" replace />} />
          <Route path="UserDashboard" element={<OverviewDachUser />} />
          <Route path="UserFavorit" element={<UserFavorit />} />
          <Route path="UserAccount" element={<UserAccount />} />
          <Route path="UserFollowing" element={<UserFollowing />} />
          <Route path="PasswordReset" element={<UserPasswordResetFlow />} />
        </Route>

        {/* Moderator — ADMIN role with limited permissions */}
        <Route path="/moderator" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
            <ModeratorRoute />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="ModeratorDashboard" replace />} />
          <Route path="ModeratorDashboard" element={<ModeratorDashboard />}>
            <Route index element={<ModeratorOverview />} />
            <Route path="Users">
              <Route index element={<ModeratorUsers />} />
              <Route path=":userId" element={<ModeratorUserDetail />} />
            </Route>
          </Route>
          <Route path="ModeratorProduct" element={<ModeratorProduct />}>
            <Route index element={<ModeratorOverviewProd />} />
            <Route path="AddPromotion" element={<ModeratorAddPromotion />} />
            <Route path="DeletedPromotions" element={<ModeratorDeletedPromotions />} />
            <Route path="Category" element={<ModeratorCategory />} />
          </Route>
          <Route path="ModeratorAccount" element={<ModeratorAccount />} />
          <Route path="PasswordReset" element={<ModeratorPasswordResetFlow />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </UserInteractionsProvider>
    </AuthProvider>
  )
}

export default App
