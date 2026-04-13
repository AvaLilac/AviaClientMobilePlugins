(function(){
  if(window.__aviaclientbackuppatch__) return;
  window.__aviaclientbackuppatch__ = true;

  function importFromText(text, onDone){
    try {
      const data = JSON.parse(text);
      let count = 0;
      for(const [k,v] of Object.entries(data)){
        localStorage.setItem(k,v);
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
    textarea.addEventListener("click", e => e.stopPropagation());
    textarea.addEventListener("mousedown", e => e.stopPropagation());

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
        status.textContent = err ? "✗ Invalid JSON" : `✓ Imported ${count} keys`;
        if(!err) textarea.value = "";
      });
    });

    panel.insertBefore(divider, status);
    panel.insertBefore(label,   status);
    panel.insertBefore(textarea,status);
    panel.insertBefore(btn,     status);
  }

  function tryPatch(){
    document.querySelectorAll("a[data-lsbackup-entry]").forEach(a => {
      const panel = a.nextElementSibling;
      if(panel && panel.tagName === "DIV") patch(panel);
    });
  }

  const observer = new MutationObserver(tryPatch);
  observer.observe(document.body, { childList:true, subtree:true });

  // Also try immediately in case it's already in the DOM
  tryPatch();
})();
