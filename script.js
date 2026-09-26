/* Extracted from index.html */

/* Tailwind configuration */
tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
            mono: ['Consolas', 'Courier New', 'monospace']
          },
          colors: {
            eng: {
              sidebar: '#181b1f',
              panel: '#20242a',
              header: '#2b303c',
              border: '#363d4a',
              accent: '#0d6efd',
              accentHover: '#0b5ed7',
              surface: '#f4f6f8',
              surfaceCard: '#ffffff',
              cardBorder: '#d0d5dd',
              textPrimary: '#1e242c',
              textSecondary: '#5a6270'
            }
          }
        }
      }
    }

/* SiteBridge application logic */
let currentUser = { role: '', name: '', id: '', tier: '' };
    let sidebarCollapsed = false;

    // Site Engineer Progress Counters State
    let seShiftCount = 6;
    let seShiftTotal = 10;
    let seOverallProgress = 72;

    // Real industrial SVG micro-icons (Zero emojis)
    const iconSvgs = {
      health: '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
      finance: '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>',
      contacts: '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 2v20M8 2v20M3 7h18M3 17h18"/></svg>',
      ongoing: '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20M5 20V8l7-5 7 5v12"/></svg>',
      revenue: '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
      inventory: '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg>',
      progress: '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>',
      log: '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      generic: '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'
    };

    const navDefinitions = {
      'client': [
        { label: 'Work Progress', iconKey: 'health', action: () => switchClientTab('health') },
        { label: 'Money & Payments', iconKey: 'finance', action: () => switchClientTab('finance') },
        { label: 'Contractor Phone Book', iconKey: 'contacts', action: () => switchClientTab('contacts') }
      ],
      'project-manager': [
        { label: 'Active Site Works', iconKey: 'ongoing', action: null }
      ],
      'contractor': [
        { label: 'Earnings & Shift Work', iconKey: 'revenue', action: () => switchContractorTab('revenue') },
        { label: 'Materials & Equipment', iconKey: 'inventory', action: () => switchContractorTab('inventory') }
      ],
      'site-engineer': [
        { label: 'Area Work Progress', iconKey: 'progress', action: null }
      ],
      'site-operatives': [
        { label: 'Send Work Report', iconKey: 'log', action: null }
      ],
      'planner': [
        { label: 'Schedule Desk', iconKey: 'generic', action: null }
      ],
      'discipline-engineer': [
        { label: 'Word Translator', iconKey: 'generic', action: null }
      ]
    };

    function determineTier(role) {
      switch(role) {
        case 'CLIENT': return 'client';
        case 'PROJECT MANAGER': return 'project-manager';
        case 'CONTRACTOR': return 'contractor';
        case 'SITE ENGINEER': return 'site-engineer';
        case 'SITE OPERATIVES': return 'site-operatives';
        case 'PLANNER / PROJECT CONTROLS': return 'planner';
        case 'DISCIPLINE ENGINEER': return 'discipline-engineer';
        default: return 'site-engineer';
      }
    }

    function toggleSidebar() {
      const sidebar = document.getElementById('app-sidebar');
      const toggleBtn = document.getElementById('sidebar-toggle-btn');
      const textElements = document.querySelectorAll('.sidebar-text');
      const logoText = document.getElementById('sidebar-logo-text');

      sidebarCollapsed = !sidebarCollapsed;

      if (sidebarCollapsed) {
        sidebar.classList.remove('w-56');
        sidebar.classList.add('w-12');
        toggleBtn.innerText = '»';
        textElements.forEach(el => el.classList.add('hidden'));
        logoText.classList.add('hidden');
      } else {
        sidebar.classList.remove('w-12');
        sidebar.classList.add('w-56');
        toggleBtn.innerText = '«';
        textElements.forEach(el => el.classList.remove('hidden'));
        logoText.classList.remove('hidden');
      }
      renderNavigation();
    }

    function renderNavigation() {
      const navContainer = document.getElementById('sidebar-nav');
      navContainer.innerHTML = '';
      const items = navDefinitions[currentUser.tier] || [];

      items.forEach((item, index) => {
        const a = document.createElement('a');
        a.href = '#';
        a.onclick = (e) => {
          e.preventDefault();
          if (item.action) item.action();
        };
        a.className = index === 0 
          ? 'bg-[#252a33] text-slate-100 flex items-center px-2 py-1.5 text-xs font-medium rounded-[2px]'
          : 'text-slate-400 hover:bg-[#252a33] hover:text-slate-200 flex items-center px-2 py-1.5 text-xs font-medium rounded-[2px] transition-colors';
        
        const iconHtml = iconSvgs[item.iconKey] || iconSvgs['generic'];
        
        if (sidebarCollapsed) {
          a.innerHTML = `<span class="mx-auto" title="${item.label}">${iconHtml}</span>`;
        } else {
          a.innerHTML = `<span class="mr-2 text-slate-400">${iconHtml}</span><span class="truncate sidebar-text">${item.label}</span>`;
        }
        navContainer.appendChild(a);
      });
    }

    function handleAccessSubmit(event) {
      event.preventDefault();
      const role = document.getElementById('select-role').value;
      const name = document.getElementById('input-name').value.trim();
      const id = document.getElementById('input-id').value.trim();

      if (!role || !name || !id) {
        document.getElementById('login-error').classList.remove('hidden');
        return;
      }

      currentUser = { role, name, id, tier: determineTier(role) };

      document.getElementById('auth-landing-page').classList.add('hidden');
      document.getElementById('main-application-shell').classList.remove('hidden');
      document.getElementById('main-application-shell').classList.add('flex');

      document.getElementById('header-authenticated-role').innerText = role;
      document.getElementById('header-user-name').innerText = name;
      document.getElementById('header-user-id').innerText = id;
      document.getElementById('sidebar-name-display').innerText = name;
      document.getElementById('sidebar-id-display').innerText = id;
      document.getElementById('sidebar-badge-display').innerText = role;

      initializeWorkstation();
    }

    function handleLogout() {
      currentUser = { role: '', name: '', id: '', tier: '' };
      document.getElementById('access-form').reset();
      document.getElementById('main-application-shell').classList.add('hidden');
      document.getElementById('main-application-shell').classList.remove('flex');
      document.getElementById('auth-landing-page').classList.remove('hidden');
    }

    function initializeWorkstation() {
      renderNavigation();

      ['client', 'project-manager', 'contractor', 'site-engineer', 'site-operatives', 'planner', 'discipline-engineer'].forEach(t => {
        const panel = document.getElementById(`tier-${t}`);
        if (panel) panel.classList.add('hidden');
      });

      const activePanel = document.getElementById(`tier-${currentUser.tier}`);
      if (activePanel) activePanel.classList.remove('hidden');

      const titleEl = document.getElementById('view-title');
      const subTitleEl = document.getElementById('view-subtitle');

      switch(currentUser.tier) {
        case 'client':
          titleEl.innerText = "Project Status & Money Overview";
          subTitleEl.innerText = "Real-time delivery progress, payment schedules, and key contractor contacts";
          switchClientTab('health');
          break;
        case 'project-manager':
          titleEl.innerText = "Site Work Status & Contacts";
          subTitleEl.innerText = "Current work happening on site and engineers to contact";
          break;
        case 'contractor':
          titleEl.innerText = "Contractor Earnings & Tools";
          subTitleEl.innerText = "Today's earned money, machine tracking, and tool requests";
          switchContractorTab('revenue');
          break;
        case 'site-engineer':
          titleEl.innerText = "Pipe Fitting Area B Status";
          subTitleEl.innerText = "Area work progress and approving daily worker reports";
          break;
        case 'site-operatives':
          titleEl.innerText = "Worker Daily Report Form";
          subTitleEl.innerText = "Send your daily work progress directly from site";
          break;
        default:
          titleEl.innerText = "Workstation Terminal";
          subTitleEl.innerText = "Main project control screen";
      }
    }

    // Client Subview Toggles
    function switchClientTab(tab) {
      const healthView = document.getElementById('client-subview-health');
      const financeView = document.getElementById('client-subview-finance');
      const contactsView = document.getElementById('client-subview-contacts');

      healthView.classList.add('hidden');
      financeView.classList.add('hidden');
      contactsView.classList.add('hidden');

      if (tab === 'health') {
        healthView.classList.remove('hidden');
        showToast("Viewing Work Progress");
      } else if (tab === 'finance') {
        financeView.classList.remove('hidden');
        showToast("Viewing Money & Payments");
      } else {
        contactsView.classList.remove('hidden');
        showToast("Viewing Contractor Phone Book");
      }
    }

    function exportClientBrief() {
      showToast("Downloaded: Project-Status-Summary.pdf");
    }

    // Contractor Subview Toggles
    function switchContractorTab(tab) {
      const revView = document.getElementById('contractor-subview-revenue');
      const invView = document.getElementById('contractor-subview-inventory');

      if (tab === 'revenue') {
        revView.classList.remove('hidden');
        invView.classList.add('hidden');
        showToast("Viewing Today's Earnings");
      } else {
        revView.classList.add('hidden');
        invView.classList.remove('hidden');
        showToast("Viewing Materials & Tools");
      }
    }

    function logStandbyNotice() {
      showToast("Idle Machine Report Sent to Client Office");
    }

    function approveContractorIndent(indentId, itemName) {
      const card = document.getElementById(`indent-card-${indentId}`);
      if (card) card.remove();

      const remaining = document.getElementById('contractor-indent-list').children.length;
      document.getElementById('contractor-indent-badge').innerText = `${remaining} REQUESTS PENDING`;
      showToast(`Approved Request: ${itemName}`);
    }

    function togglePmWorkStream(contentId, arrowId) {
      const content = document.getElementById(contentId);
      const arrow = document.getElementById(arrowId);
      
      if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        arrow.innerText = '▼';
      } else {
        content.classList.add('hidden');
        arrow.innerText = '►';
      }
    }

    // Site Engineer Bulk Approval & Anomaly Inspection
    function updateBulkApproveCount() {
      const checkedBoxes = document.querySelectorAll('.se-req-checkbox:checked').length;
      const btn = document.getElementById('btn-bulk-approve');
      if (btn) {
        btn.innerText = `APPROVE ALL SELECTED (${checkedBoxes})`;
        btn.disabled = (checkedBoxes === 0);
      }
    }

    function bulkApproveOperatives() {
      const checkedBoxes = document.querySelectorAll('.se-req-checkbox:checked');
      if (checkedBoxes.length === 0) return;

      checkedBoxes.forEach(cb => {
        const item = cb.closest('[id^="se-req-"]');
        if (item) item.remove();
        seShiftCount = Math.min(seShiftCount + 1, seShiftTotal);
        seOverallProgress = Math.min(seOverallProgress + 1, 100);
      });

      refreshSeProgressBars();
      showToastWithUndo("All Selected Worker Reports Approved");
    }

    function approveOperativeRequest(requestId) {
      const item = document.getElementById(`se-req-${requestId}`);
      if (item) item.remove();

      seShiftCount = Math.min(seShiftCount + 1, seShiftTotal);
      seOverallProgress = Math.min(seOverallProgress + 1, 100);

      refreshSeProgressBars();
      showToastWithUndo("Worker Report Approved");
    }

    function refreshSeProgressBars() {
      const shiftPercent = Math.round((seShiftCount / seShiftTotal) * 100);
      document.getElementById('se-shift-text').innerText = `${seShiftCount} / ${seShiftTotal} Approved (${shiftPercent}%)`;
      document.getElementById('se-shift-bar').style.width = `${shiftPercent}%`;
      document.getElementById('se-shift-bar').innerText = `${shiftPercent}%`;

      document.getElementById('se-overall-text').innerText = `${seOverallProgress}% Completed`;
      document.getElementById('se-overall-bar').style.width = `${seOverallProgress}%`;
      document.getElementById('se-overall-bar').innerText = `${seOverallProgress}%`;

      const remaining = document.getElementById('se-requests-container').children.length;
      document.getElementById('se-counter-badge').innerText = `${remaining} REPORTS WAITING`;
      updateBulkApproveCount();
    }

    // Drawing & Modal Handlers
    function openVerificationModal(photoDesc, drawingRef) {
      document.getElementById('modal-photo-title').innerText = `Photo from Worker: ${photoDesc}`;
      document.getElementById('modal-drawing-title').innerText = `Official Blueprint: ${drawingRef}`;
      document.getElementById('drawing-modal-overlay').classList.remove('hidden');
    }

    function closeVerificationModal() {
      document.getElementById('drawing-modal-overlay').classList.add('hidden');
    }

    function openHseModal() {
      document.getElementById('hse-modal-overlay').classList.remove('hidden');
    }

    function closeHseModal() {
      document.getElementById('hse-modal-overlay').classList.add('hidden');
    }

    // Site Operative Voice Playback Simulation
    function simulateOperativeVoice() {
      document.getElementById('op-text-input').value = "Bay B line 24 joint J-103 fitup completed, pre-heat treatment checked.";
      document.getElementById('audio-playback-chip').classList.remove('hidden');
      showToast("Voice Message Recorded Cleanly");
    }

    function playSimulatedAudio() {
      showToast("Playing Audio: 'Bay B line 24 joint J-103 fitup...'");
    }

    function reRecordVoice() {
      document.getElementById('op-text-input').value = "";
      document.getElementById('audio-playback-chip').classList.add('hidden');
      showToast("Audio Cleared. Press speak to record again.");
    }

    function operativePhotoSelected(input) {
      if (input.files && input.files[0]) {
        document.getElementById('op-file-name').innerText = `PHOTO SELECTED: ${input.files[0].name.toUpperCase()}`;
      }
    }

    function submitOperativeLog() {
      const val = document.getElementById('op-text-input').value.trim();
      const fileText = document.getElementById('op-file-name').innerText;
      if (!val && !fileText) {
        showToast("Please enter work details or record voice");
        return;
      }
      document.getElementById('op-input-card').classList.add('hidden');
      document.getElementById('op-done-card').classList.remove('hidden');
    }

    function resetOperativeForm() {
      document.getElementById('op-text-input').value = '';
      document.getElementById('op-file-name').innerText = '';
      document.getElementById('audio-playback-chip').classList.add('hidden');
      document.getElementById('op-done-card').classList.add('hidden');
      document.getElementById('op-input-card').classList.remove('hidden');
    }

    // Quick Finder Implementation (Ctrl+K)
    window.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
      }
      if (e.key === 'Escape') {
        closeCommandPalette();
        closeVerificationModal();
        closeHseModal();
      }
    });

    function openCommandPalette() {
      document.getElementById('command-palette-overlay').classList.remove('hidden');
      document.getElementById('command-palette-input').focus();
    }

    function closeCommandPalette() {
      document.getElementById('command-palette-overlay').classList.add('hidden');
    }

    function filterCommandResults(query) {
      const list = document.getElementById('command-results-list');
      const items = list.querySelectorAll('div');
      items.forEach(item => {
        if (item.innerText.toLowerCase().includes(query.toLowerCase())) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    }

    function executeCommand(target) {
      closeCommandPalette();
      showToast(`Selected: ${target}`);
    }

    // Reversible Toast Engine (With Undo Support)
    function showToast(message) {
      const container = document.getElementById('toast-container');
      container.innerHTML = `<span class="bg-[#181b22] border border-[#363d4a] text-slate-200 px-3 py-1 rounded-[2px] text-xs font-mono shadow font-semibold">${message}</span>`;
      setTimeout(() => { container.innerHTML = ''; }, 2600);
    }

    function showToastWithUndo(message) {
      const container = document.getElementById('toast-container');
      container.innerHTML = `
        <div class="bg-[#181b22] border border-[#363d4a] text-slate-200 px-3 py-1 rounded-[2px] text-xs font-mono shadow font-semibold flex items-center space-x-2">
          <span>${message}</span>
          <button onclick="triggerUndoAction()" class="text-amber-400 hover:text-amber-300 font-bold ml-1.5 underline">Undo (10s)</button>
        </div>
      `;
      setTimeout(() => { container.innerHTML = ''; }, 6000);
    }

    function triggerUndoAction() {
      showToast("Undone: Last action cancelled");
    }
