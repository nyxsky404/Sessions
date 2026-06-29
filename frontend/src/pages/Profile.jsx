import { useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/client";
import { useToast } from "../components/Toast";
import { getErrorMessage } from "../lib/errors";
import { Avatar, VerifiedBadge } from "../components/ui";

export default function Profile() {
  const { user, setUser, switchRole } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState(user.full_name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [yearsExperience, setYearsExperience] = useState(
    user.years_experience != null ? String(user.years_experience) : "0"
  );
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const saveName = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch("/me/", {
        full_name: fullName,
        bio,
        years_experience: parseInt(yearsExperience, 10) || 0,
      });
      setUser(data);
      toast.success("Profile updated.");
    } catch (e) {
      toast.error(getErrorMessage(e, "Could not update profile."));
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const { data } = await api.post("/me/avatar/", fd);
      setUser(data);
      toast.success("Avatar updated.");
    } catch (e) {
      toast.error(getErrorMessage(e, "Could not upload avatar."));
    }
  };

  const handleSwitch = async () => {
    const next = user.role === "creator" ? "user" : "creator";
    try {
      await switchRole(next);
      toast.success(
        next === "creator" ? "You're now in creator mode." : "You're now in attendee mode."
      );
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const joined = new Date(user.date_joined).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-extrabold">Profile</h1>
        {user.is_verified && <VerifiedBadge />}
      </div>

      <div className="card mt-6 p-6">
        <div className="flex items-center gap-5">
          <Avatar user={user} size={80} />
          <div>
            <button onClick={() => fileRef.current.click()} className="btn-outline">
              Change avatar
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadAvatar(e.target.files[0])}
            />
            <p className="mt-1 text-xs text-gray-500">JPG/PNG, up to 5 MB.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Tell us about yourself."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          {user.role === "creator" && (
            <div>
              <label className="label">Years of experience</label>
              <input
                className="input"
                type="number"
                min="0"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
              />
            </div>
          )}
          <ReadOnly label="Email" value={user.email} />
          <ReadOnly label="Joined" value={joined} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={saveName} disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button onClick={handleSwitch} className="btn-outline">
            Switch to {user.role === "creator" ? "attendee" : "creator"} mode
          </button>
        </div>
      </div>
    </div>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-600">
        {value}
      </div>
    </div>
  );
}
