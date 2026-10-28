
import { useEffect, useState } from "react";
import api from "../services/api";
import { updateStoredUser } from "../services/auth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await api.get("/users/me");

        if (active) {
          setProfile(response.data.user);
          setFullName(response.data.user.full_name || "");
        }
      } catch (error) {
        if (active) {
          setProfileError(
            error.response?.data?.message || "Could not load profile."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  async function updateProfile(event) {
    event.preventDefault();
    setProfileError("");
    setSuccess("");

    const trimmedName = fullName.trim();

    if (trimmedName.length < 3 || trimmedName.length > 100) {
      setProfileError("Full name must be between 3 and 100 characters.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.put("/users/me", {
        full_name: trimmedName,
      });

      setProfile(response.data.user);
      setFullName(response.data.user.full_name);
      updateStoredUser(response.data.user);
      setSuccess(response.data.message);
    } catch (error) {
      setProfileError(
        error.response?.data?.errors?.full_name ||
          error.response?.data?.message ||
          "Could not update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setPasswordError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");
      return;
    }

    if (new TextEncoder().encode(newPassword).length > 72) {
      setPasswordError("Password must not exceed 72 UTF-8 bytes.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.put("/users/me/password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setSuccess(response.data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || "Could not change password."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="container profile-page">
        <h1>My Profile</h1>

        {loading ? (
          <p className="loading">Loading profile...</p>
        ) : (
          <>
            {profileError && <p className="error">{profileError}</p>}
            {success && <p className="success">{success}</p>}

            {profile && (
              <section className="section-card">
                <h2>Profile Information</h2>
                <p><strong>User ID:</strong> {profile.id}</p>
                <p><strong>Username:</strong> {profile.username}</p>
                <p><strong>Full Name:</strong> {profile.full_name}</p>
                <p><strong>Role:</strong> {profile.role}</p>
              </section>
            )}

            <section className="section-card">
              <h2>Change Full Name</h2>

              <form onSubmit={updateProfile}>
                <div className="form-group">
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    id="full_name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    minLength={3}
                    maxLength={100}
                    required
                  />
                </div>

                <button className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Update Full Name"}
                </button>
              </form>
            </section>

            <section className="section-card">
              <h2>Change Password</h2>

              <form onSubmit={changePassword}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    minLength={8}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </div>

                {passwordError && (
                  <p className="error" role="alert">{passwordError}</p>
                )}

                <button className="btn btn-primary" disabled={saving}>
                  {saving ? "Changing..." : "Change Password"}
                </button>
              </form>
            </section>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Profile;
