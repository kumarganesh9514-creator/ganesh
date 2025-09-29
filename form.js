
document.addEventListener("DOMContentLoaded", () => {
  const API_URL = 'http://127.0.0.1:3000/api/students'; // <-- full backend URL (must match server PORT)
  const form = document.getElementById("studentForm");
  const photo = document.getElementById("photo");
  const preview = document.getElementById("preview");
  const msg = document.getElementById("message");
  const submitBtn = document.getElementById("submitBtn");

  if (!form || !photo || !preview || !msg || !submitBtn) {
    console.warn("Some form elements not found in DOM.");
    return;
  }

  photo.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) {
      preview.style.backgroundImage = "none";
      preview.setAttribute("aria-hidden", "true");
      return;
    }
    const url = URL.createObjectURL(file);
    preview.style.backgroundImage = `url(${url})`;
    preview.setAttribute("aria-hidden", "false");
    const img = new Image();
    img.src = url;
    img.onload = () => URL.revokeObjectURL(url);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    msg.style.color = "#000";
    submitBtn.disabled = true;

    const formData = new FormData(form);

    try {
      const res = await fetch(API_URL, { method: "POST", body: formData });
      // attempt to decode JSON (safe)
      let data = {};
      try { data = await res.json(); } catch (_) { data = {}; }

      if (res.ok) {
        msg.style.color = "green";
        msg.textContent = "✅ Thank You to share Data With Ganesh.";
        form.reset();
        preview.style.backgroundImage = "none";
        preview.setAttribute("aria-hidden", "true");
      } else {
        console.error('Server error response:', res.status, data);
        msg.style.color = "crimson";
        msg.textContent = data.message || `❌ Failed to save (status ${res.status}).`;
      }
    } catch (err) {
      console.error("Fetch error:", err);
      msg.style.color = "crimson";
      msg.textContent = "⚠️ Network error (server not reachable).";
    } finally {
      submitBtn.disabled = false;
    }
  });
});
