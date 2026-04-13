(function(){
  if(window.__US_BACKUP_PATCH_JS__) return;
  window.__US_BACKUP_PATCH_JS__ = true;

  function fixText(text){
    let s = text.trim();

    s = s.replace(/^```[a-z]*\n?/i, "").replace(/```\s*$/, "").trim();

    try { JSON.parse(s); return s; } catch(_){}

    try {
      const sanitized = sanitizeJsonString(s);
      JSON.parse(sanitized);
      return sanitized;
    } catch(_){}

    try {
      const t = s.replace(/&quot;/g, '"');
      JSON.parse(t); return t;
    } catch(_){}

    return null;
  }

  function sanitizeJsonString(s){
    let result = "";
    let inString = false;
    let escaped = false;

    for(let i = 0; i < s.length; i++){
      const ch = s[i];
      const code = s.charCodeAt(i);

      if(escaped){
        result += ch;
        escaped = false;
        continue;
      }

      if(ch === "\\"){
        escaped = true;
        result += ch;
        continue;
      }

      if(ch === '"'){
        inString = !inString;
        result += ch;
        continue;
      }

      if(inString){

        if(code < 0x20){
          switch(ch){
            case "\n": result += "\\n"; break;
            case "\r": result += "\\r"; break;
            case "\t": result += "\\t"; break;
            default:   result += "\\u" + code.toString(16).padStart(4,"0");
          }
          continue;
        }
      }

      result += ch;
    }

    return result;
  }

  function importFromText(text, onDone){
    const fixed = fixText(text);
    if(!fixed){ onDone(new Error("invalid")); return; }
    try {
      const data = JSON.parse(fixed);
      if(typeof data !== "object" || Array.isArray(data) || data === null){
        onDone(new Error("Expected a flat key/value object")); return;
      }
      let count = 0;
      for(const [k, v] of Object.entries(data)){

        localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
        count++;
      }
      onDone(null, count);
    } catch(err){ onDone(err); }
  }

  function patch(panel){
    if(panel.hasAttribute("data-lsbackup-patched")) return;
    panel.setAttribute("data-lsbackup-patched","true");
    const status = panel.querySelector("span");
    if(!status) return;

    const divider = document.createElement("div");
    divider.style.cssText = "border-top:1px solid var(--md-sys-color-outline-variant);margin:2px 0;opacity:0.5;";

    const label = document.createElement("span");
    label.textContent = "Or paste JSON below:";
    label.style.cssText = "font-size:11px;opacity:0.7;";

    const textarea = document.createElement("textarea");
    textarea.placeholder = "Paste backup JSON here...";
    textarea.style.cssText = `
      width:100%;min-height:80px;max-height:200px;resize:vertical;
      border-radius:4px;border:1px solid var(--md-sys-color-outline-variant);
      background:var(--md-sys-color-surface-container);
      color:var(--md-sys-color-on-surface);
      font-size:11px;font-family:monospace;
      padding:6px 8px;box-sizing:border-box;
    `;
    textarea.addEventListener("click",     e => e.stopPropagation());
    textarea.addEventListener("mousedown",  e => e.stopPropagation());

    const preview = document.createElement("span");
    preview.style.cssText = "font-size:10px;opacity:0.6;display:block;margin-top:2px;";
    textarea.addEventListener("input", () => {
      const t = textarea.value.trim();
      if(!t){ preview.textContent = ""; return; }
      try {
        const fixed = fixText(t);
        if(fixed){
          const count = Object.keys(JSON.parse(fixed)).length;
          preview.textContent = `✓ Looks good — ${count} keys detected`;
          preview.style.color = "var(--md-sys-color-primary)";
        } else {
          preview.textContent = "✗ Could not parse JSON";
          preview.style.color = "var(--md-sys-color-error)";
        }
      } catch(_){
        preview.textContent = "✗ Could not parse JSON";
        preview.style.color = "var(--md-sys-color-error)";
      }
    });

    const btn = document.createElement("button");
    btn.textContent = "⬆ Import from Text";
    btn.style.cssText = `
      padding:5px 12px;border-radius:4px;border:none;
      font-size:11px;font-weight:600;cursor:pointer;
      background:var(--md-sys-color-secondary);
      color:var(--md-sys-color-on-secondary);
    `;
    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      const text = textarea.value.trim();
      if(!text){ status.textContent = "✗ Textarea is empty"; return; }
      importFromText(text, (err, count) => {
        if(err){
          status.textContent = "✗ Could not fix JSON — check your text";
          console.error("[lsbackup] import error:", err);
        } else {
          status.textContent = `✓ Imported ${count} keys`;
          textarea.value = "";
          preview.textContent = "";
        }
      });
    });

    panel.insertBefore(divider,  status);
    panel.insertBefore(label,    status);
    panel.insertBefore(textarea, status);
    panel.insertBefore(preview,  status);
    panel.insertBefore(btn,      status);
  }

  function tryPatch(){
    document.querySelectorAll("a[data-lsbackup-entry]").forEach(a => {
      const panel = a.nextElementSibling;
      if(panel && panel.tagName === "DIV") patch(panel);
    });
  }

  const observer = new MutationObserver(tryPatch);
  observer.observe(document.body, { childList:true, subtree:true });
  tryPatch();
})();
