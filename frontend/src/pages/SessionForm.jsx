import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { useToast } from "../components/Toast";
import { getErrorMessage } from "../lib/errors";
import {
  AGE_RESTRICTIONS,
  CANCELLATION_POLICIES,
  CATEGORIES,
  LANGUAGES,
  SKILL_LEVELS,
} from "../lib/format";
import { PageLoader } from "../components/ui";

const EMPTY = {
  title: "",
  description: "",
  category: "workshop",
  price: "0",
  currency: "INR",
  start_time: "",
  duration_minutes: "10",
  capacity: "1",
  location_type: "online",
  location_text: "",
  venue_name: "",
  full_address: "",
  skill_level: "beginner",
  language: "English",
  age_restriction: "all_ages",
  cancellation_policy: "flexible",
  what_you_will_learn: [""],
  agenda: [""],
  whats_included: [""],
  what_to_bring: [""],
  faqs: [{ question: "", answer: "" }],
};

const LIST_FIELDS = ["what_you_will_learn", "agenda", "whats_included", "what_to_bring"];

// ISO -> value for <input type="datetime-local">
function toLocalInput(iso) {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

const orOne = (arr) => (arr && arr.length ? arr : [""]);

export default function SessionForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    (async () => {
      try {
        const { data } = await api.get(`/sessions/${id}/`);
        setForm({
          title: data.title,
          description: data.description,
          category: data.category,
          price: String(data.price),
          currency: data.currency,
          start_time: toLocalInput(data.start_time),
          duration_minutes: String(data.duration_minutes),
          capacity: String(data.capacity),
          location_type: data.location_type,
          location_text: data.location_text || "",
          venue_name: data.venue_name || "",
          full_address: data.full_address || "",
          skill_level: data.skill_level || "beginner",
          language: data.language || "English",
          age_restriction: data.age_restriction || "all_ages",
          cancellation_policy: data.cancellation_policy || "flexible",
          what_you_will_learn: orOne(data.what_you_will_learn),
          agenda: orOne(data.agenda),
          whats_included: orOne(data.whats_included),
          what_to_bring: orOne(data.what_to_bring),
          faqs: data.faqs?.length ? data.faqs : [{ question: "", answer: "" }],
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, editing]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setList = (key, next) => setForm((f) => ({ ...f, [key]: next }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side guard so the list fields can't be submitted empty.
    for (const key of LIST_FIELDS) {
      if (!form[key].some((v) => v.trim())) {
        toast.error("Please fill in every section — none can be left empty.");
        return;
      }
    }
    if (!form.faqs.some((f) => f.question.trim() && f.answer.trim())) {
      toast.error("Add at least one FAQ with both a question and an answer.");
      return;
    }
    // A cover image is required when creating a new session.
    if (!editing && !imageFile) {
      toast.error("Please upload a cover image.");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      price: parseInt(form.price, 10) || 0,
      duration_minutes: parseInt(form.duration_minutes, 10),
      capacity: parseInt(form.capacity, 10),
      start_time: new Date(form.start_time).toISOString(),
      what_you_will_learn: form.what_you_will_learn.filter((v) => v.trim()),
      agenda: form.agenda.filter((v) => v.trim()),
      whats_included: form.whats_included.filter((v) => v.trim()),
      what_to_bring: form.what_to_bring.filter((v) => v.trim()),
      faqs: form.faqs.filter((f) => f.question.trim() && f.answer.trim()),
    };
    try {
      let sessionId = id;
      if (editing) {
        await api.patch(`/sessions/${id}/`, payload);
      } else {
        const { data } = await api.post("/sessions/", payload);
        sessionId = data.id;
      }
      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        await api.post(`/sessions/${sessionId}/image/`, fd);
      }
      toast.success(editing ? "Session updated." : "Session created.");
      navigate("/");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save session."));
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold">{editing ? "Edit session" : "New session"}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Field label="Title">
          <input className="input" required value={form.title} onChange={update("title")} />
        </Field>

        <Field label="Description">
          <textarea
            className="input"
            rows={4}
            required
            value={form.description}
            onChange={update("description")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select className="input" value={form.category} onChange={update("category")}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Capacity (seats)">
            <input
              className="input"
              type="number"
              min="1"
              required
              value={form.capacity}
              onChange={update("capacity")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price">
            <input
              className="input"
              type="number"
              min="0"
              step="1"
              required
              value={form.price}
              onChange={update("price")}
            />
            <p className="mt-1 text-xs text-gray-500">Enter 0 to make this session free.</p>
          </Field>
          <Field label="Currency">
            <select className="input" required value={form.currency} onChange={update("currency")}>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Starts at">
            <input
              className="input"
              type="datetime-local"
              required
              value={form.start_time}
              onChange={update("start_time")}
            />
          </Field>
          <Field label="Duration (minutes)">
            <input
              className="input"
              type="number"
              min="10"
              required
              value={form.duration_minutes}
              onChange={update("duration_minutes")}
            />
            <p className="mt-1 text-xs text-gray-500">Minimum 10 minutes.</p>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Skill level">
            <select className="input" value={form.skill_level} onChange={update("skill_level")}>
              {SKILL_LEVELS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Language">
            <select className="input" value={form.language} onChange={update("language")}>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Age restriction">
            <select
              className="input"
              value={form.age_restriction}
              onChange={update("age_restriction")}
            >
              {AGE_RESTRICTIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cancellation policy">
            <select
              className="input"
              value={form.cancellation_policy}
              onChange={update("cancellation_policy")}
            >
              {CANCELLATION_POLICIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Location type">
            <select className="input" value={form.location_type} onChange={update("location_type")}>
              <option value="online">Online</option>
              <option value="in_person">In person</option>
            </select>
          </Field>
          {form.location_type === "online" ? (
            <Field label="Meeting link">
              <input
                className="input"
                required
                placeholder="e.g. https://zoom.us/j/..."
                value={form.location_text}
                onChange={update("location_text")}
              />
            </Field>
          ) : (
            <Field label="Venue name">
              <input
                className="input"
                required
                placeholder="e.g. Hauz Khas Studio"
                value={form.venue_name}
                onChange={update("venue_name")}
              />
            </Field>
          )}
        </div>

        {form.location_type === "in_person" && (
          <Field label="Full address">
            <input
              className="input"
              required
              placeholder="Street, area, city, PIN"
              value={form.full_address}
              onChange={update("full_address")}
            />
          </Field>
        )}

        <ListEditor
          label="What you'll learn"
          items={form.what_you_will_learn}
          onChange={(v) => setList("what_you_will_learn", v)}
          placeholder="e.g. Reading natural light"
        />
        <ListEditor
          label="Session agenda"
          items={form.agenda}
          onChange={(v) => setList("agenda", v)}
          placeholder="e.g. Warm-up (15 min)"
        />
        <ListEditor
          label="What's included"
          items={form.whats_included}
          onChange={(v) => setList("whats_included", v)}
          placeholder="e.g. All ingredients"
        />
        <ListEditor
          label="What to bring"
          items={form.what_to_bring}
          onChange={(v) => setList("what_to_bring", v)}
          placeholder="e.g. Yoga mat"
        />
        <FaqEditor faqs={form.faqs} onChange={(v) => setList("faqs", v)} />

        <Field label={editing ? "Cover image" : "Cover image *"}>
          <input
            type="file"
            accept="image/*"
            required={!editing}
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <p className="mt-1 text-xs text-gray-500">
            {editing
              ? "Upload a new image to replace the current cover (optional)."
              : "A cover image is required. JPG/PNG, up to 5 MB."}
          </p>
        </Field>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : editing ? "Save changes" : "Create session"}
          </button>
          <button type="button" onClick={() => navigate("/")} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function ListEditor({ label, items, onChange, placeholder }) {
  const setAt = (i, v) => onChange(items.map((item, idx) => (idx === i ? v : item)));
  const add = () => onChange([...items, ""]);
  const remove = (i) => onChange(items.length > 1 ? items.filter((_, idx) => idx !== i) : [""]);

  return (
    <div>
      <label className="label">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="input"
              value={item}
              placeholder={placeholder}
              onChange={(e) => setAt(i, e.target.value)}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="shrink-0 rounded-lg border border-gray-200 px-3 text-gray-500 hover:bg-gray-50"
              aria-label="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 text-sm font-semibold text-brand hover:underline">
        + Add another
      </button>
    </div>
  );
}

function FaqEditor({ faqs, onChange }) {
  const setAt = (i, key, v) =>
    onChange(faqs.map((f, idx) => (idx === i ? { ...f, [key]: v } : f)));
  const add = () => onChange([...faqs, { question: "", answer: "" }]);
  const remove = (i) =>
    onChange(faqs.length > 1 ? faqs.filter((_, idx) => idx !== i) : [{ question: "", answer: "" }]);

  return (
    <div>
      <label className="label">FAQs</label>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-gray-200 p-3">
            <input
              className="input"
              value={f.question}
              placeholder="Question"
              onChange={(e) => setAt(i, "question", e.target.value)}
            />
            <textarea
              className="input"
              rows={2}
              value={f.answer}
              placeholder="Answer"
              onChange={(e) => setAt(i, "answer", e.target.value)}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 text-sm font-semibold text-brand hover:underline">
        + Add FAQ
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
