import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getPreferences,
  updatePreferences
} from '../services/userService';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants';
import { validatePassword, getPasswordStrength } from '../utils/passwordValidator';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', color: '' });

  // Preferences state
  const [preferences, setPreferences] = useState({
    currency: 'KES',
    notifications: {
      budgetAlerts: true,
      savingsMilestones: true,
      billReminders: true,
      spendingAlerts: true
    },
    customCategories: {
      income: [],
      expense: []
    }
  });
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [preferencesError, setPreferencesError] = useState('');
  const [preferencesSuccess, setPreferencesSuccess] = useState('');

  // Custom categories state
  const [newIncomeCategory, setNewIncomeCategory] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');

  // Account deletion state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchPreferences();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setProfileData({
        name: response.data.name || '',
        email: response.data.email || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await getPreferences();
      if (response.data) {
        setPreferences(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const response = await updateProfile(profileData);
      updateUser(response.data);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (error) {
      setProfileError(error.message || 'Failed to update profile');
      setTimeout(() => setProfileError(''), 5000);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(passwordData.newPassword);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.errors[0]);
      setPasswordErrors(passwordValidation.errors);
      setPasswordLoading(false);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error) {
      setPasswordError(error.message || 'Failed to change password');
      setTimeout(() => setPasswordError(''), 5000);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setPreferencesLoading(true);
    setPreferencesError('');
    setPreferencesSuccess('');

    try {
      await updatePreferences(preferences);
      setPreferencesSuccess('Preferences updated successfully!');
      setTimeout(() => setPreferencesSuccess(''), 3000);
    } catch (error) {
      setPreferencesError(error.message || 'Failed to update preferences');
      setTimeout(() => setPreferencesError(''), 5000);
    } finally {
      setPreferencesLoading(false);
    }
  };

  const handleAddIncomeCategory = () => {
    if (newIncomeCategory.trim() && !preferences.customCategories.income.includes(newIncomeCategory.trim())) {
      setPreferences(prev => ({
        ...prev,
        customCategories: {
          ...prev.customCategories,
          income: [...prev.customCategories.income, newIncomeCategory.trim()]
        }
      }));
      setNewIncomeCategory('');
    }
  };

  const handleRemoveIncomeCategory = (category) => {
    setPreferences(prev => ({
      ...prev,
      customCategories: {
        ...prev.customCategories,
        income: prev.customCategories.income.filter(c => c !== category)
      }
    }));
  };

  const handleAddExpenseCategory = () => {
    if (newExpenseCategory.trim() && !preferences.customCategories.expense.includes(newExpenseCategory.trim())) {
      setPreferences(prev => ({
        ...prev,
        customCategories: {
          ...prev.customCategories,
          expense: [...prev.customCategories.expense, newExpenseCategory.trim()]
        }
      }));
      setNewExpenseCategory('');
    }
  };

  const handleRemoveExpenseCategory = (category) => {
    setPreferences(prev => ({
      ...prev,
      customCategories: {
        ...prev.customCategories,
        expense: prev.customCategories.expense.filter(c => c !== category)
      }
    }));
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm');
      return;
    }

    if (!deletePassword) {
      setDeleteError('Please enter your password');
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      await deleteAccount(deletePassword);
      alert('Your account has been deleted. You will be logged out.');
      logout();
      navigate('/login');
    } catch (error) {
      setDeleteError(error.message || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="settings-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage your account and preferences</p>
          </div>
        </div>

        <div className="settings-container">
          {/* Tabs */}
          <div className="settings-tabs">
            <button
              className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile
            </button>
            <button
              className={`tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              🔒 Password
            </button>
            <button
              className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              ⚙️ Preferences
            </button>
            <button
              className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              📁 Categories
            </button>
            <button
              className={`tab ${activeTab === 'danger' ? 'active' : ''}`}
              onClick={() => setActiveTab('danger')}
            >
              ⚠️ Danger Zone
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Information</h2>
              
              {profileSuccess && (
                <div className="success-banner">{profileSuccess}</div>
              )}
              {profileError && (
                <div className="error-banner">{profileError}</div>
              )}

              <form onSubmit={handleProfileUpdate} className="settings-form">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                    minLength={2}
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={profileLoading}>
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="settings-section">
              <h2>Change Password</h2>
              
              {passwordSuccess && (
                <div className="success-banner">{passwordSuccess}</div>
              )}
              {passwordError && (
                <div className="error-banner">{passwordError}</div>
              )}

              <form onSubmit={handlePasswordChange} className="settings-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, newPassword: e.target.value });
                      const validation = validatePassword(e.target.value);
                      setPasswordErrors(validation.errors);
                      setPasswordStrength(getPasswordStrength(e.target.value));
                    }}
                    required
                    placeholder="Min. 8 chars, uppercase, lowercase, number, special char"
                  />
                  {passwordData.newPassword && (
                    <>
                      <div className="password-strength">
                        <div className="strength-bar">
                          <div 
                            className="strength-fill" 
                            style={{ 
                              width: `${(passwordStrength.strength / 5) * 100}%`,
                              backgroundColor: passwordStrength.color
                            }}
                          ></div>
                        </div>
                        <span className="strength-label" style={{ color: passwordStrength.color }}>
                          {passwordStrength.label || 'Enter password'}
                        </span>
                      </div>
                      {passwordErrors.length > 0 && (
                        <ul className="password-requirements">
                          {passwordErrors.map((err, index) => (
                            <li key={index} className="requirement-error">{err}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={passwordLoading}>
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>Preferences</h2>
              
              {preferencesSuccess && (
                <div className="success-banner">{preferencesSuccess}</div>
              )}
              {preferencesError && (
                <div className="error-banner">{preferencesError}</div>
              )}

              <div className="settings-form">
                <div className="form-group">
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    value={preferences.currency}
                    onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  >
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notification Preferences</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.budgetAlerts}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: {
                            ...preferences.notifications,
                            budgetAlerts: e.target.checked
                          }
                        })}
                      />
                      <span>Budget Alerts</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.savingsMilestones}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: {
                            ...preferences.notifications,
                            savingsMilestones: e.target.checked
                          }
                        })}
                      />
                      <span>Savings Milestones</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.billReminders}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: {
                            ...preferences.notifications,
                            billReminders: e.target.checked
                          }
                        })}
                      />
                      <span>Bill Reminders</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.spendingAlerts}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: {
                            ...preferences.notifications,
                            spendingAlerts: e.target.checked
                          }
                        })}
                      />
                      <span>Spending Alerts</span>
                    </label>
                  </div>
                </div>

                <button 
                  type="button"
                  className="btn-primary" 
                  onClick={handlePreferencesUpdate}
                  disabled={preferencesLoading}
                >
                  {preferencesLoading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="settings-section">
              <h2>Custom Categories</h2>
              <p className="section-description">
                Add custom categories to organize your transactions. Default categories cannot be removed.
              </p>

              <div className="categories-section">
                <div className="category-group">
                  <h3>Income Categories</h3>
                  <div className="category-list">
                    {INCOME_CATEGORIES.map(cat => (
                      <span key={cat} className="category-tag default">{cat}</span>
                    ))}
                    {preferences.customCategories.income.map(cat => (
                      <span key={cat} className="category-tag custom">
                        {cat}
                        <button onClick={() => handleRemoveIncomeCategory(cat)} className="remove-btn">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="add-category">
                    <input
                      type="text"
                      value={newIncomeCategory}
                      onChange={(e) => setNewIncomeCategory(e.target.value)}
                      placeholder="Add custom income category"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddIncomeCategory()}
                    />
                    <button onClick={handleAddIncomeCategory} className="btn-add-category">Add</button>
                  </div>
                </div>

                <div className="category-group">
                  <h3>Expense Categories</h3>
                  <div className="category-list">
                    {EXPENSE_CATEGORIES.map(cat => (
                      <span key={cat} className="category-tag default">{cat}</span>
                    ))}
                    {preferences.customCategories.expense.map(cat => (
                      <span key={cat} className="category-tag custom">
                        {cat}
                        <button onClick={() => handleRemoveExpenseCategory(cat)} className="remove-btn">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="add-category">
                    <input
                      type="text"
                      value={newExpenseCategory}
                      onChange={(e) => setNewExpenseCategory(e.target.value)}
                      placeholder="Add custom expense category"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddExpenseCategory()}
                    />
                    <button onClick={handleAddExpenseCategory} className="btn-add-category">Add</button>
                  </div>
                </div>
              </div>

              <button 
                type="button"
                className="btn-primary" 
                onClick={handlePreferencesUpdate}
                disabled={preferencesLoading}
              >
                {preferencesLoading ? 'Saving...' : 'Save Categories'}
              </button>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="settings-section danger-section">
              <h2>Danger Zone</h2>
              <p className="section-description">
                Once you delete your account, there is no going back. Please be certain.
              </p>

              {deleteError && (
                <div className="error-banner">{deleteError}</div>
              )}

              <div className="danger-zone">
                <div className="form-group">
                  <label htmlFor="deleteConfirm">
                    Type <strong>DELETE</strong> to confirm
                  </label>
                  <input
                    type="text"
                    id="deleteConfirm"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="deletePassword">Enter your password</label>
                  <input
                    type="password"
                    id="deletePassword"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Your password"
                  />
                </div>

                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirm !== 'DELETE' || !deletePassword}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
