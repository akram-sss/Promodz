import api from './client';

export const authAPI = {
  /** Login with email/username + password */
  login: (identifier, password) =>
    api.post('/auth/login', { identifier, password }),

  /** Refresh access token */
  refreshToken: (refreshToken) =>
    api.post('/auth/refresh-token', { refreshToken }),

  /** Send password reset code */
  sendResetCode: (email) =>
    api.post('/auth/reset-password/send-code', { email }),

  /** Reset password with code */
  resetPassword: (email, code, newPassword) =>
    api.post('/auth/reset-password/verify', { email, code, newPassword }),
};

export const userAPI = {
  /** Public registration (USER only) */
  registerPublic: (userData) =>
    api.post('/users/register-public', userData),

  /** Verify email after registration */
  verifyEmail: (email, code) =>
    api.post('/users/verify-email', { email, code }),

  /** Resend verification code */
  resendVerification: (email) =>
    api.post('/users/resend-verification', { email }),

  /** Admin-created registration */
  register: (userData) =>
    api.post('/users/register', userData),

  /** Get current user profile */
  getProfile: () =>
    api.get('/users/me'),

  /** Update current user profile */
  updateProfile: (data) =>
    api.patch('/users/me', data),

  /** Delete current user account (requires password confirmation) */
  deleteAccount: (password) =>
    api.delete('/users/me', { data: { password } }),

  /** Get user's favorite products */
  getFavorites: () =>
    api.get('/users/me/favorites'),

  /** Get user's followed companies */
  getFollowing: () =>
    api.get('/users/me/following'),

  /** Get all users (admin) */
  getAll: () =>
    api.get('/users/'),

  /** Get user by ID (admin/super_admin) */
  getById: (userId) =>
    api.get(`/users/${userId}`),

  /** Get active users */
  getActive: () =>
    api.get('/users/active'),

  /** Update user role */
  updateRole: (userId, role) =>
    api.patch(`/users/role/${userId}`, { role }),

  /** Toggle favorite product */
  toggleFavorite: (productId) =>
    api.post(`/users/${productId}/favorite`),

  /** Rate a product */
  rateProduct: (productId, rating) =>
    api.post(`/users/${productId}/rate`, { rating }),

  /** Follow a company */
  followCompany: (companyId) =>
    api.post('/users/follow-company', { companyId }),

  /** Unfollow a company */
  unfollowCompany: (companyId) =>
    api.post('/users/unfollow-company', { companyId }),

  /** Change password */
  changePassword: (oldOrObj, newPwd) => {
    // Accept both changePassword({ oldPassword, newPassword }) and changePassword(old, new)
    const currentPassword = typeof oldOrObj === 'object' ? (oldOrObj.currentPassword || oldOrObj.oldPassword) : oldOrObj;
    const newPassword = typeof oldOrObj === 'object' ? oldOrObj.newPassword : newPwd;
    return api.patch('/users/change-password', { currentPassword, newPassword });
  },
};

export const productAPI = {
  /** Get all products (public) */
  getAll: (params) =>
    api.get('/products/', { params }),

  /** Get active products (public) */
  getActive: (params) =>
    api.get('/products/active', { params }),

  /** Get popular products (public) */
  getPopular: () =>
    api.get('/products/popular'),

  /** Get recommended products (auth required) */
  getRecommended: () =>
    api.get('/products/recommendations'),

  /** Search products (public) */
  search: (query, filters = {}) =>
    api.get('/products/search', { params: { q: query, ...filters } }),

  /** Get trending searches (public) */
  getTrendingSearches: () =>
    api.get('/products/trending-searches'),

  /** Get search suggestions (public) */
  getSuggestions: (query) =>
    api.get('/products/suggestions', { params: { q: query } }),

  /** Get categories with subcategories (public) */
  getCategories: () =>
    api.get('/products/categories'),

  /** Sync/seed categories to DB (admin) */
  syncCategories: () =>
    api.post('/products/categories/sync'),

  /** Get public company info + products (public) */
  getCompanyPublic: (companyName) =>
    api.get(`/products/company/${encodeURIComponent(companyName)}`),

  /** Create a product */
  create: (productData) =>
    api.post('/products/', productData),

  /** Delete a product */
  delete: (productId) =>
    api.delete(`/products/${productId}`),

  /** Update a product */
  update: (productId, data) =>
    api.patch(`/products/${productId}`, data),

  /** Get deleted products */
  getDeleted: () =>
    api.get('/products/deleted'),

  /** Increment product click */
  click: (productId) =>
    api.post(`/products/${productId}/click`),

  /** Update product expiry */
  updateExpiry: (productId, expiresAt) =>
    api.patch(`/products/${productId}/expiry`, { expiresAt }),
};

export const companyAPI = {
  /** Increment company click */
  click: (companyId) =>
    api.post(`/companies/${companyId}/click`),

  /** Get company's own products */
  getMyProducts: () =>
    api.get('/companies/my-products'),

  /** Get company stats (owner/admin) */
  getStats: () =>
    api.get('/companies/stats'),

  /** Get company stats by admin */
  getStatsAdmin: (companyId) =>
    api.get(`/companies/${companyId}/stats/admin`),

  /** Get public company stats */
  getStatsPublic: (companyId) =>
    api.get(`/companies/${companyId}/stats`),
};

export const adminAPI = {
  /** Get assigned companies (for admin) */
  getAssignedCompanies: () =>
    api.get('/admin/assigned-companies'),
};

export const superAdminAPI = {
  /** Assign admin to company */
  assignAdmin: (adminId, companyId) =>
    api.post('/superadmin/assign-admin', { adminId, companyId }),

  /** Unassign admin from company */
  unassignAdmin: (adminId, companyId) =>
    api.delete(`/superadmin/${adminId}/companies/${companyId}`),

  /** Ban user */
  banUser: (userId, reason) =>
    api.patch(`/superadmin/ban/${userId}`, { reason }),

  /** Unban user */
  unbanUser: (userId) =>
    api.patch(`/superadmin/unban/${userId}`),

  /** Update company admin permissions */
  updatePermissions: (adminId, permissions) =>
    api.patch(`/superadmin/${adminId}`, permissions),

  /** Get global stats */
  getGlobalStats: () =>
    api.get('/superadmin/stats'),

  /** Soft-delete a user */
  deleteUser: (userId) =>
    api.delete(`/superadmin/users/${userId}`),

  /** Get deleted users */
  getDeletedUsers: (params) =>
    api.get('/superadmin/users/deleted', { params }),

  /** Restore a soft-deleted user */
  restoreUser: (userId) =>
    api.patch(`/superadmin/users/${userId}/restore`),

  /** Permanently delete users (array of IDs) */
  permanentDeleteUsers: (userIds) =>
    api.post('/superadmin/users/permanent-delete', { userIds }),
};

export const analyticsAPI = {
  /** Get most clicked companies */
  getMostClickedCompanies: () =>
    api.get('/analytics/most-clicked-companies'),

  /** Get most clicked products */
  getMostClickedProducts: () =>
    api.get('/analytics/most-clicked-products'),

  /** Get monthly city stats */
  getMonthlyCityStats: () =>
    api.get('/analytics/city-stats/monthly'),

  /** Get monthly device stats */
  getMonthlyDeviceStats: () =>
    api.get('/analytics/devices/monthly'),

  /** Get promotion performance (clicks over time) */
  getPromotionPerformance: (days = 30) =>
    api.get('/analytics/promotion-performance', { params: { days } }),

  /** Get company-scoped city stats */
  getCompanyCityStats: () =>
    api.get('/analytics/company-city-stats'),

  /** Get company-scoped device stats */
  getCompanyDeviceStats: () =>
    api.get('/analytics/company-device-stats'),

  /** Get overview stats (scoped by role) */
  getOverviewStats: () =>
    api.get('/analytics/overview-stats'),

  /** Get visitor stats (total visits, unique, today/week/month) */
  getVisitorStats: () =>
    api.get('/analytics/visitor-stats'),

  /** Get browser distribution stats */
  getBrowserStats: () =>
    api.get('/analytics/browser-stats'),

  /** Get OS distribution stats */
  getOsStats: () =>
    api.get('/analytics/os-stats'),

  /** Track a public/guest visit (no auth required) */
  trackVisit: () =>
    api.post('/analytics/track-visit'),

  /** Get map data (city distribution for Algeria map) */
  getMapData: (type = 'visitor') =>
    api.get('/analytics/map-data', { params: { type } }),
};

export const topCompanyAPI = {
  /** Get all top companies (public) */
  getAll: () =>
    api.get('/top-companies'),

  /** Create top company (super_admin) */
  create: (data) =>
    api.post('/top-companies', data),

  /** Update top company (super_admin) */
  update: (id, data) =>
    api.put(`/top-companies/${id}`, data),

  /** Delete top company (super_admin) */
  delete: (id) =>
    api.delete(`/top-companies/${id}`),

  /** Reorder top companies (super_admin) */
  reorder: (order) =>
    api.put('/top-companies/reorder', { order }),
};

export const legalAPI = {
  /** Get all legal sections (public) */
  getAll: () =>
    api.get('/legal'),

  /** Create legal section (super_admin) */
  create: (data) =>
    api.post('/legal', data),

  /** Update legal section (super_admin) */
  update: (id, data) =>
    api.put(`/legal/${id}`, data),

  /** Delete legal section (super_admin) */
  delete: (id) =>
    api.delete(`/legal/${id}`),

  /** Reorder legal sections (super_admin) */
  reorder: (order) =>
    api.put('/legal/reorder', { order }),
};

export const feedbackAPI = {
  /** Send feedback (auth) */
  send: (message) =>
    api.post('/feedback/', { message }),

  /** Send contact form message (public, no auth required) */
  sendContact: (data) =>
    api.post('/feedback/contact', data),

  /** Get all feedbacks (admin) */
  getAll: () =>
    api.get('/feedback/'),

  /** Delete feedback */
  delete: (feedbackId) =>
    api.delete(`/feedback/${feedbackId}`),
};

export const adAPI = {
  /** Get active ads (public) */
  getActive: () =>
    api.get('/ads/public/active'),

  /** Get ads by position */
  getByPosition: (position) =>
    api.get(`/ads/public/position/${position}`),

  /** Track ad click */
  trackClick: (adId) =>
    api.post(`/ads/public/${adId}/click`),

  /** Create ad (admin) */
  create: (adData) =>
    api.post('/ads/', adData),

  /** Get all ads for management (admin) */
  getAllManagement: () =>
    api.get('/ads/management'),

  /** Update ad */
  update: (adId, adData) =>
    api.put(`/ads/${adId}`, adData),

  /** Toggle ad status */
  toggleStatus: (adId) =>
    api.patch(`/ads/${adId}/toggle-status`),

  /** Delete ad */
  delete: (adId) =>
    api.delete(`/ads/${adId}`),

  /** Get ad stats */
  getStats: () =>
    api.get('/ads/stats'),
};

export const subscriptionAPI = {
  /** Assign subscription (admin) */
  assign: (data) =>
    api.post('/subscriptions/assign', data),

  /** Cancel subscription (admin) */
  cancel: (companyId) =>
    api.post(`/subscriptions/cancel/${companyId}`),

  /** Get all subscriptions (admin) */
  getAll: () =>
    api.get('/subscriptions/all'),

  /** Get subscription stats (admin) */
  getStats: () =>
    api.get('/subscriptions/stats'),

  /** Create invoice */
  createInvoice: (data) =>
    api.post('/subscriptions/invoice', data),

  /** Get company subscription */
  getCompanySubscription: (companyId) =>
    api.get(`/subscriptions/company/${companyId}`),

  /** Get my subscription */
  getMySubscription: () =>
    api.get('/subscriptions/my-subscription'),

  /** Update subscription dates only (moderator/admin) */
  updateDates: (companyId, data) =>
    api.patch(`/subscriptions/company/${companyId}/dates`, data),
};
