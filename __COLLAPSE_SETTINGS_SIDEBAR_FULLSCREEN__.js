(function(){
if(window.__COLLAPSE_SETTINGS_SIDEBAR_FULLSCREEN__) return;
window.__COLLAPSE_SETTINGS_SIDEBAR_FULLSCREEN__ = true;

function getPanel(){
  return document.getElementsByClassName('d_flex flex_1_0_218px pl_8px jc_flex-end').item(0);
}

function getContentPanel(){
  return document.getElementsByClassName('will-change_transform scr-bar-c_var(--md-sys-color-primary)_transparent ov-y_auto ov-x_hidden min-w_0 flex_1_1_800px').item(0);
}

function getSettingsRoot(){
  // the flex row that contains both the sidebar panel and content panel
  const panel = getPanel();
  if(!panel) return null;
  return panel.parentElement;
}

function ensureReopenBtn(){
  if(document.getElementById('avia-settings-reopen-btn')) return;

  const btn = document.createElement('div');
  btn.id = 'avia-settings-reopen-btn';
  Object.assign(btn.style, {
    position: 'fixed',
    top: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '999999',
    background: 'var(--md-sys-color-surface-container-high, #2a2a2a)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0 0 8px 8px',
    padding: '4px 16px 6px',
    cursor: 'pointer',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    color: 'var(--md-sys-color-on-surface, #fff)',
    fontSize: '12px',
    fontWeight: '500',
  });

  // down chevron + label
  btn.innerHTML = `
    <svg stroke-width="0" fill="currentColor" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
    </svg>
    <span>Settings</span>
  `;

  btn.addEventListener('click', () => {
    const panel = getPanel();
    if(!panel) return;

    // restore sidebar
    panel.style.display = '';
    Object.assign(panel.style, {
      position: '',
      top: '',
      left: '',
      width: '',
      height: '',
      zIndex: '',
    });

    // hide content again
    const content = getContentPanel();
    if(content) content.style.display = 'none';

    btn.style.display = 'none';
  });

  document.body.appendChild(btn);
}

function applyFullscreenSidebar(){
  const panel = getPanel();
  if(!panel || panel.__avia_fullscreen_applied__) return;
  panel.__avia_fullscreen_applied__ = true;

  // make the sidebar fill the screen, centered
  Object.assign(panel.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '99997',
    display: 'flex',
    justifyContent: 'center',
    background: 'var(--md-sys-color-surface, #1e1e1e)',
    overflowY: 'auto',
  });

  const content = getContentPanel();
  if(content) content.style.display = 'none';
}

function resetFullscreenSidebar(){
  const panel = getPanel();
  if(!panel) return;
  panel.__avia_fullscreen_applied__ = false;
  Object.assign(panel.style, {
    position: '',
    top: '',
    left: '',
    width: '',
    height: '',
    zIndex: '',
    display: '',
    justifyContent: '',
    background: '',
    overflowY: '',
  });
}

function syncReopenBtn(){
  const btn = document.getElementById('avia-settings-reopen-btn');
  if(!btn) return;
  const panel = getPanel();
  // if not in settings at all, hide the btn
  if(!panel){
    btn.style.display = 'none';
    return;
  }

  if(panel.style.display !== 'none'){
    btn.style.display = 'none';
  }
}

function hijack(){
  const panel = getPanel();
  if(!panel) return;

  applyFullscreenSidebar();

  const collapseBtn = panel.querySelector('[aria-label="Collapse"]');
  if(!collapseBtn || collapseBtn.__avia_fs_hijacked__) return;
  collapseBtn.__avia_fs_hijacked__ = true;

  collapseBtn.addEventListener('click', (e) => {
    e.stopImmediatePropagation();

    // hide sidebar
    panel.style.display = 'none';

    // show content panel
    const content = getContentPanel();
    if(content){
      content.style.display = '';
      // center it nicely
      Object.assign(content.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '99996',
        overflowY: 'auto',
      });
    }

    const reopenBtn = document.getElementById('avia-settings-reopen-btn');
    if(reopenBtn) reopenBtn.style.display = 'flex';
  }, true);
}

ensureReopenBtn();

let lastInSettings = false;

new MutationObserver(() => {
  ensureReopenBtn();

  const inSettings = !!getPanel();

  if(inSettings && !lastInSettings){
    // just entered settings — reset any stale state
    const content = getContentPanel();
    if(content){
      Object.assign(content.style, {
        position: '',
        top: '',
        left: '',
        width: '',
        height: '',
        zIndex: '',
        overflowY: '',
      });
    }
  }

  if(!inSettings && lastInSettings){
    // just left settings
    const btn = document.getElementById('avia-settings-reopen-btn');
    if(btn) btn.style.display = 'none';
  }

  lastInSettings = inSettings;

  hijack();
  syncReopenBtn();

}).observe(document.body, { childList: true, subtree: true });

hijack();

})();