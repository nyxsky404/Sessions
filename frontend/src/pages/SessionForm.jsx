import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { CATEGORIES } from "../lib/format";
import { PageLoader } from "../components/ui";

const EMPTY = {
  title: "",
  description: "",
  category: "workshop",
  price: "0",
  currency: "INR",
  start_time: "",
  duration_minutes: "1",
  capacity: "1",
  location_type: "online",
  location_text: "",
};

// ISO -> value for <input type="datetime-local">
function toLocalInput(iso) {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export default function SessionForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) return;
    api.get(`/sessions/${id}/`).then(({ data }) => {
      setForm({
        ...EMPTY,
        ...data,
        price: String(data.price),
        start_time: data.start_time ? toLocalInput(data.start_time) : "",
      });
      setLoading(false);
    });
  }, [id, editing]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        duration_minutes: parseInt(form.duration_minutes, 10),
        capacity: parseInt(form.capacity, 10),
        start_time: new Date(form.start_time).toISOString(),
      };
      const { data } = editing
        ? await api.patch(`/sessions/${id}/`, payload)
        : await api.post("/sessions/", payload);

      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        await api.post(`/sessions/${data.id}/upload_image/`, fd);
      }
      navigate("/creator/dashboard");
    } catch (err) {
      const d = err?.response?.data;
      setError(
        d
          ? Object.entries(d)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" ")
          : "Could not save session."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">
        {editing ? "Edit session" : "New session"}
      </h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={set("title")} required />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={4} value={form.description} onChange={set("description")} required />
        </div>

        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={set("category")}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Price (0 = free)</label>
            <input className="input" type="number" step="0.01" value={form.price} onChange={set("price")} />
          </div>
          <div>
            <label className="label">Currency</label>
            <input className="input" value={form.currency} onChange={set("currency")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start time</label>
            <input className="input" type="datetime-local" value={form.start_time} onChange={set("start_time")} required />
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <input className="input" type="number" value={form.duration_minutes} onChange={set("duration_minutes")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Capacity</label>
            <input className="input" type="number" value={form.capacity} onChange={set("capacity")} />
          </div>
          <div>
            <label className="label">Location type</label>
            <select className="input" value={form.location_type} onChange={set("location_type")}>
              <option value="online">Online</option>
              <option value="in_person">In person</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Location / meeting detail</label>
          <input className="input" value={form.location_text} onChange={set("location_text")} />
        </div>

        <div>
          <label className="label">Cover image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        </div>

        <button className="btn-primary w-full" disabled={saving}>
          {saving ? "Saving…" : editing ? "Save changes" : "Create session"}
        </button>
      </form>
    </div>
  );
}
