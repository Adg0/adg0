/**
 * Adg0 Terminal Workspace Script
 * Coherent sequential terminal staging & interactive shell
 */

document.addEventListener('DOMContentLoaded', () => {
  let isTypingActive = true;
  const charDelay = 20; // snappy ms per char

  // Use or create the single global cursor element
  let cursor = document.getElementById('globalCursor');
  if (!cursor) {
    cursor = document.createElement('span');
    cursor.className = 'active-cursor';
    cursor.id = 'globalCursor';
    cursor.textContent = '█';
  }

  // DOM Elements
  const whoamiBlock = document.getElementById('cmd-block-whoami');
  const whoamiTyped = whoamiBlock ? whoamiBlock.querySelector('.typed-cmd') : null;
  const identityPanel = document.getElementById('identityPanel');

  const projectsBlock = document.getElementById('cmd-block-projects');
  const projectsTyped = projectsBlock ? projectsBlock.querySelector('.typed-cmd') : null;
  const sectionHeadline = document.getElementById('sectionHeadline');

  const cards = [
    document.getElementById('card-companion'),
    document.getElementById('card-temperans'),
    document.getElementById('card-socius'),
    document.getElementById('card-systems')
  ].filter(Boolean);

  const shellBox = document.getElementById('shellBox');
  const workspaceFooter = document.getElementById('workspaceFooter');
  const skipBtn = document.getElementById('skipTypingBtn');

  // Helper: Sleep
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Helper: Type a string into an element with cursor attached
  function typeCommand(parentBlock, textSpan, fullText) {
    return new Promise((resolve) => {
      if (!isTypingActive) {
        if (textSpan) textSpan.textContent = fullText;
        return resolve();
      }

      // Attach the single cursor to the active command line
      if (parentBlock && cursor.parentElement !== parentBlock) {
        parentBlock.appendChild(cursor);
      }

      let idx = 0;
      textSpan.textContent = '';
      const timer = setInterval(() => {
        if (!isTypingActive) {
          clearInterval(timer);
          textSpan.textContent = fullText;
          return resolve();
        }

        textSpan.textContent += fullText[idx];
        idx++;

        if (idx >= fullText.length) {
          clearInterval(timer);
          resolve();
        }
      }, charDelay);
    });
  }

  // Detach cursor from command line
  function detachCursor() {
    if (cursor.parentElement && cursor.parentElement !== document.querySelector('.shell-input-line')) {
      cursor.parentElement.removeChild(cursor);
    }
  }

  // Staged Sequence Execution
  async function runStagedSequence() {
    // -----------------------------------------------------------------
    // STEP 1: whoami command runs with initial cursor visible
    // -----------------------------------------------------------------
    if (whoamiBlock && whoamiTyped) {
      whoamiBlock.appendChild(cursor);
      await sleep(350); // Pause so user sees the prompt with blinking cursor

      if (!isTypingActive) return;

      const whoamiCmd = whoamiTyped.getAttribute('data-text') || 'whoami';
      await typeCommand(whoamiBlock, whoamiTyped, whoamiCmd);
      await sleep(150);
      detachCursor();
    }

    if (!isTypingActive) return;

    // Body for "whoami" renders
    if (identityPanel) {
      identityPanel.classList.add('content-revealed');
      await sleep(350);
    }

    if (!isTypingActive) return;

    // -----------------------------------------------------------------
    // STEP 2: fetch --projects command is typed
    // -----------------------------------------------------------------
    if (projectsBlock && projectsTyped) {
      projectsBlock.classList.add('cmd-ready');
      projectsBlock.appendChild(cursor);
      await sleep(220);

      if (!isTypingActive) return;

      const projectsCmd = projectsTyped.getAttribute('data-text') || 'fetch --projects --featured --all';
      await typeCommand(projectsBlock, projectsTyped, projectsCmd);
      await sleep(160);
      detachCursor();
    }

    if (!isTypingActive) return;

    // -----------------------------------------------------------------
    // STEP 3: Brings up the four terminal initials & "Featured Work" header
    // -----------------------------------------------------------------
    if (sectionHeadline) {
      sectionHeadline.classList.add('content-revealed');
    }

    cards.forEach((card) => {
      card.classList.add('terminals-ready');
    });

    await sleep(300);

    // -----------------------------------------------------------------
    // STEP 4: One-by-one each of the four gets typed and reveals their body
    // -----------------------------------------------------------------
    for (const card of cards) {
      if (!isTypingActive) break;

      const cmdLine = card.querySelector('.unit-cmd');
      const textSpan = card.querySelector('.typed-cmd');
      const cmdText = textSpan ? textSpan.getAttribute('data-text') || '' : '';

      if (cmdLine && textSpan) {
        cmdLine.appendChild(cursor);
        await typeCommand(cmdLine, textSpan, cmdText);
        await sleep(120);
        detachCursor();
      }

      if (!isTypingActive) break;

      // Reveal card body
      card.classList.add('content-revealed');
      await sleep(220);
    }

    if (!isTypingActive) return;

    // -----------------------------------------------------------------
    // FINAL STEP: Reveal shell box & footer, settle cursor on input
    // -----------------------------------------------------------------
    if (shellBox) shellBox.classList.add('content-revealed');
    if (workspaceFooter) workspaceFooter.classList.add('content-revealed');

    const shellInputLine = document.querySelector('.shell-input-line');
    if (shellInputLine && cursor.parentElement !== shellInputLine) {
      shellInputLine.appendChild(cursor);
    }
  }

  // Skip animation handler: reveals all stages immediately
  function skipAll() {
    isTypingActive = false;

    if (whoamiTyped) whoamiTyped.textContent = whoamiTyped.getAttribute('data-text') || 'whoami';
    if (identityPanel) identityPanel.classList.add('content-revealed');

    if (projectsBlock) projectsBlock.classList.add('cmd-ready');
    if (projectsTyped) projectsTyped.textContent = projectsTyped.getAttribute('data-text') || 'fetch --projects --featured --all';
    if (sectionHeadline) sectionHeadline.classList.add('content-revealed');

    cards.forEach((card) => {
      card.classList.add('terminals-ready');
      const textSpan = card.querySelector('.typed-cmd');
      if (textSpan) textSpan.textContent = textSpan.getAttribute('data-text') || '';
      card.classList.add('content-revealed');
    });

    if (shellBox) shellBox.classList.add('content-revealed');
    if (workspaceFooter) workspaceFooter.classList.add('content-revealed');

    const shellInputLine = document.querySelector('.shell-input-line');
    if (shellInputLine && cursor.parentElement !== shellInputLine) {
      shellInputLine.appendChild(cursor);
    }
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', skipAll);
  }

  // Kick off sequence
  runStagedSequence();

  // -----------------------------------------------------------------
  // Interactive Terminal Shell Functionality
  // -----------------------------------------------------------------
  const shellForm = document.getElementById('shellForm');
  const shellInput = document.getElementById('shellInput');
  const shellOutput = document.getElementById('shellOutput');

  function highlightCard(targetEl, msg) {
    if (shellOutput) {
      shellOutput.innerHTML = `> <span style="color:var(--accent-green);">${msg}</span>`;
    }
    if (!targetEl) return;
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetEl.classList.remove('highlight-active');
    void targetEl.offsetWidth; // force reflow
    targetEl.classList.add('highlight-active');
    setTimeout(() => {
      targetEl.classList.remove('highlight-active');
    }, 2800);
  }

  function executeShellCommand(cmdRaw) {
    const cmd = (cmdRaw || '').trim().toLowerCase();
    if (!cmd) return;

    skipAll(); // ensure all content is visible if user executes command

    switch (cmd) {
      case 'help':
        if (shellOutput) {
          shellOutput.innerHTML = '> Available: <span style="color:var(--accent-blue)">companion · temperans · socius · socius --story · systems · whoami · github · clear</span>';
        }
        break;

      case 'companion':
      case 'temperance':
        highlightCard(document.getElementById('card-companion'), 'Focus: Temperance Companion [Kotlin / Compose / SAF]');
        break;

      case 'temperans':
      case 'habits':
        highlightCard(document.getElementById('card-temperans'), 'Focus: Temperans Habits [TypeScript / Obsidian API]');
        break;

      case 'socius':
      case 'voice':
        highlightCard(document.getElementById('card-socius'), 'Focus: Socius — The Reading Partner [Python / Speech AI]. Tip: run "socius --story" for background.');
        break;

      case 'socius --story':
      case 'socius story':
      case 'read-more socius':
      case 'story':
        highlightCard(document.getElementById('card-socius'), '“Socius means ‘partner’ in Latin. We built Socius because difficult reading should not be a solitary struggle. Technical documents, dense academic material, and long-form stories often demand more energy than people have available.”');
        break;

      case 'systems':
      case 'defi':
        highlightCard(document.getElementById('card-systems'), 'Focus: Systems & Protocol Work [Go / Algorand / Sol]');
        break;

      case 'whoami':
        highlightCard(identityPanel, 'Focus: Identity profile (Adg0)');
        break;

      case 'github':
        if (shellOutput) shellOutput.innerHTML = '> Opening <a href="https://github.com/Adg0" target="_blank" rel="noopener">github.com/Adg0</a>...';
        window.open('https://github.com/Adg0', '_blank');
        break;

      case 'clear':
        if (shellOutput) shellOutput.textContent = 'Type a command or click one below:';
        if (shellInput) shellInput.value = '';
        break;

      case 'skip':
        skipAll();
        if (shellOutput) shellOutput.textContent = 'Typing animations skipped.';
        break;

      default:
        if (shellOutput) {
          shellOutput.innerHTML = `> command not found: "<span style="color:var(--text-dim)">${escapeHtml(cmd)}</span>". Type <span style="color:var(--accent-green)">help</span>.`;
        }
        break;
    }
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }

  if (shellForm) {
    shellForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!shellInput) return;
      const cmd = shellInput.value;
      shellInput.value = '';
      executeShellCommand(cmd);
    });
  }

  // Shell chip click handler
  document.querySelectorAll('.cmd-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-command');
      if (cmd) {
        if (shellInput) shellInput.value = cmd;
        executeShellCommand(cmd);
      }
    });
  });

  // Copy Handle Button
  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('https://github.com/Adg0');
        const orig = copyBtn.textContent;
        copyBtn.textContent = '[copied: @Adg0]';
        copyBtn.style.color = 'var(--accent-green)';
        copyBtn.style.borderColor = 'var(--accent-green)';
        setTimeout(() => {
          copyBtn.textContent = orig;
          copyBtn.style.color = '';
          copyBtn.style.borderColor = '';
        }, 2200);
      } catch (err) {
        copyBtn.textContent = '[github.com/Adg0]';
      }
    });
  }
});
