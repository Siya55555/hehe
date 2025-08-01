window.addEventListener('DOMContentLoaded', function () {
  // Step wrappers for new structure (move to top for hoisting)
  const storeInfoStep = document.getElementById('store-info-step');
  const systemStep = document.getElementById('system-step');
  const stylesStep = document.getElementById('styles-step');
  const pluginStep = document.getElementById('plugin-step');
  const summaryStep = document.getElementById('summary');
  const profileStep = document.getElementById('profile-step');
  const mySitesStep = document.getElementById('mysites-step');

  // Add nextBtn for Store Info step
  const nextBtn = document.getElementById('store-next-btn');

  // Debug: log all footer-btns
  const allFooterBtns = document.querySelectorAll('.footer-btn');
  allFooterBtns.forEach((btn, i) => {
    console.log(`Footer btn ${i}:`, btn.textContent.trim());
  });

  // Try to select the Profile button more robustly
  const profileBtn = Array.from(allFooterBtns).find(btn => btn.textContent.trim().toLowerCase().includes('profile'));
  console.log('Profile button found:', !!profileBtn);

  if (profileBtn && profileStep) {
    profileBtn.addEventListener('click', function () {
      console.log('Profile button clicked');
      hideAllSteps();
      if (mySitesStep) {
        mySitesStep.classList.add('hidden');
        mySitesStep.style.display = 'none';
      }
      profileStep.classList.remove('hidden');
      profileStep.style.display = 'block';
    });
  }
  const systemBackBtn = document.getElementById('system-back-btn');
  const systemNextBtn = document.getElementById('system-next-btn');
  const storeNameInput = document.getElementById('storeName');
  const charCount = document.querySelector('.wizard-char-count');
  const checkmark = document.querySelector('.wizard-input-check');

  // Validation state tracking
  const validationState = {
    storeInfo: {
      storeName: false
    },
    system: {
      platform: false,
      version: false
    },
    styles: {
      theme: false,
      logo: false,
      colors: false,
      font: false
    },
    plugins: {
      completed: false
    }
  };

  // Validation functions
  function validateStoreInfo() {
    const storeName = storeNameInput.value.trim();
    validationState.storeInfo.storeName = storeName.length > 0 && storeName.length <= 14;
    return validationState.storeInfo.storeName;
  }

  function validateSystem() {
    const platformSelected = Array.from(document.querySelectorAll('.platform-option')).some(opt => opt.classList.contains('selected'));
    const versionSelected = !!selectedVersion;

    validationState.system.platform = platformSelected;
    validationState.system.version = versionSelected;

    return platformSelected && versionSelected;
  }

  function validateStyles() {
    const themeSelected = Array.from(document.querySelectorAll('.theme-radio')).some(radio => radio.checked);
    const logoUploaded = document.getElementById('desktop-logo-preview')?.style.display !== 'none' ||
      document.getElementById('mobile-logo-preview')?.style.display !== 'none';
    const fontSelected = !document.getElementById('default-font-checkbox')?.checked ||
      (document.getElementById('font-search-input')?.value && document.getElementById('font-search-input').value.trim() !== '');

    validationState.styles.theme = themeSelected;
    validationState.styles.logo = logoUploaded;
    validationState.styles.font = fontSelected;
    validationState.styles.colors = true; // Colors are optional for now

    return themeSelected && fontSelected; // Logo is optional
  }

  function validatePlugins() {
    // For now, plugins are optional, so this always returns true
    validationState.plugins.completed = true;
    return true;
  }

  function getValidationMessage(step) {
    const messages = {
      storeInfo: () => {
        if (!validationState.storeInfo.storeName) {
          return 'Please enter a valid store name (1-14 characters) before proceeding.';
        }
        return null;
      },
      system: () => {
        if (!validationState.system.platform) {
          return 'Please select a platform before proceeding.';
        }
        if (!validationState.system.version) {
          return 'Please select a platform version before proceeding.';
        }
        return null;
      },
      styles: () => {
        if (!validationState.styles.theme) {
          return 'Please select a theme before proceeding.';
        }
        if (!validationState.styles.font) {
          return 'Please select a font or use the default theme font before proceeding.';
        }
        return null;
      },
      plugins: () => {
        // Plugins are optional, so no validation message needed
        return null;
      }
    };

    return messages[step] ? messages[step]() : null;
  }

  function updateStoreNameUI() {
    const value = storeNameInput.value;
    charCount.textContent = `${value.length} / 14`;
    const nameAvailable = document.querySelector('.wizard-name-available');
    if (nextBtn) {
      checkmark.style.visibility = value.length > 0 && value.length <= 14 ? 'visible' : 'hidden';
      if (nameAvailable) nameAvailable.classList.remove('hidden');
      storeNameInput.classList.add('valid-input');
    }
    // Update validation state
    validateStoreInfo();
  }

  storeNameInput.addEventListener('input', updateStoreNameUI);
  updateStoreNameUI();

  // Platform selection logic
  const platformOptions = document.querySelectorAll('.platform-option');
  const customDropdown = document.getElementById('platform-version-dropdown');
  const customDropdownSelected = document.getElementById('custom-dropdown-selected');
  const customDropdownOptions = document.getElementById('custom-dropdown-options');
  let currentVersions = [];
  let selectedVersion = '';
  const platformVersions = {
    'Magento': ['2.4.7', '2.4.6', '2.4.5', '2.4.4', '2.3.7'],
    'Laravel': ['Laravel 7', 'Laravel 8', 'Laravel 9', 'Laravel 10', 'Laravel 11'],
    'WordPress': ['6.5', '6.4', '6.3', '6.2', '5.9']
  };
  const platformVersionContainer = document.getElementById('platform-version-container');
  platformOptions.forEach(option => {
    option.addEventListener('click', function () {
      platformOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      // Enable and populate custom dropdown
      const platform = this.innerText.trim();
      currentVersions = platformVersions[platform] || [];
      customDropdownSelected.textContent = 'Select a version';
      selectedVersion = '';
      customDropdownSelected.classList.remove('selected');
      customDropdown.classList.remove('selected'); // Remove border when new platform is selected
      customDropdownOptions.innerHTML = '';
      currentVersions.forEach(ver => {
        const opt = document.createElement('div');
        opt.className = 'custom-dropdown-option';
        opt.textContent = ver;
        opt.addEventListener('click', function (e) {
          e.stopPropagation();
          selectedVersion = ver;
          customDropdownSelected.textContent = ver;
          customDropdownSelected.classList.add('selected');
          customDropdown.classList.add('selected'); // Add border to select box
          customDropdownOptions.style.display = 'none';
          // Remove selected from all options
          customDropdownOptions.querySelectorAll('.custom-dropdown-option').forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          updateDependencyLabels(selectedVersion);
          document.querySelector('.version-dependencies-section').classList.remove('hidden'); // Show dependencies section
          updateSystemNextBtn();
        });
        customDropdownOptions.appendChild(opt);
      });
      customDropdownSelected.classList.remove('disabled');
      // Show the version container
      platformVersionContainer.classList.remove('hidden');
      updateSystemNextBtn();
    });
  });
  // Hide version container if no platform is selected (on page load)
  platformVersionContainer.classList.add('hidden');
  // Show/hide custom dropdown options
  customDropdownSelected.addEventListener('click', function (e) {
    if (!currentVersions.length) return;
    customDropdownOptions.style.display = customDropdownOptions.style.display === 'block' ? 'none' : 'block';
  });
  // Hide dropdown if click outside
  document.addEventListener('click', function (e) {
    if (!customDropdown.contains(e.target)) {
      customDropdownOptions.style.display = 'none';
    }
  });

  if (customDropdownOptions) {
    customDropdownOptions.addEventListener('wheel', function (e) {
      const atTop = customDropdownOptions.scrollTop === 0;
      const atBottom = customDropdownOptions.scrollHeight - customDropdownOptions.scrollTop === customDropdownOptions.clientHeight;
      if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  // --- System Step Logic ---
  function updateSystemNextBtn() {
    const platformSelected = Array.from(platformOptions).some(opt => opt.classList.contains('selected'));
    const versionSelected = !!selectedVersion;
    if (systemNextBtn) {
      systemNextBtn.disabled = false;
      systemNextBtn.classList.remove('disabled');
    }
    // Update validation state
    validateSystem();
  }
  // Initial state
  updateSystemNextBtn();
  platformOptions.forEach(option => {
    option.addEventListener('click', function () {
      updateSystemNextBtn();
    });
  });
  customDropdownOptions.addEventListener('click', function (e) {
    if (e.target.classList.contains('custom-dropdown-option')) {
      updateSystemNextBtn();
    }
  });

  // --- Styles Step Logic ---
  const stylesTabs = document.querySelectorAll('.styles-tab');
  const themeRadios = document.querySelectorAll('.theme-radio');
  const themePreviewBtns = document.querySelectorAll('.theme-preview-btn');
  const themePreviewImage = document.getElementById('theme-preview-image');
  const themePreviewModal = document.getElementById('theme-preview-modal');
  const modalTabs = document.querySelectorAll('.modal-tab');
  const modalPreviewDesktop = document.getElementById('modal-preview-desktop');
  const modalPreviewMobile = document.getElementById('modal-preview-mobile');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const stylesNextBtn = document.getElementById('styles-next-btn');
  // Always enable the styles next button
  if (stylesNextBtn) {
    stylesNextBtn.addEventListener('click', function () {
      stylesStepWrapper.classList.add('hidden');
      const pluginStep = document.getElementById('plugin-step');
      if (pluginStep) pluginStep.classList.remove('hidden');
      document.querySelector('.progress-bar-label').textContent = 'Step 4 of 5';
      document.querySelector('.progress-bar-fill').style.width = '80%';
      updateSidebarSteps(4);
      updateTopbarVisibility('plugin');
    });
    // stylesNextBtn.disabled = false; // Commented out as per edit hint
    // stylesNextBtn.classList.remove('disabled'); // Commented out as per edit hint
  }
  const themePreviewBtnMain = document.getElementById('theme-preview-btn-main');
  const themePreviewMessage = document.getElementById('theme-preview-message');

  // Tab switching (show/hide content panels)
  const stylesTabContents = document.querySelectorAll('.styles-tab-content');
  stylesTabs.forEach(tab => {
    tab.addEventListener('click', function () {
      stylesTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      // Show the corresponding tab content
      const tabName = tab.getAttribute('data-tab');
      stylesTabContents.forEach(panel => {
        if (panel.id === 'styles-tab-' + tabName) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });
    });
  });

  // Theme selection: update preview image
  themeRadios.forEach(radio => {
    radio.addEventListener('change', function () {
      if (radio.value === 'luma') {
        themePreviewImage.src = 'https://via.placeholder.com/400x120?text=Luma+Theme+Preview';
        themePreviewImage.alt = 'Luma theme preview placeholder';
      } else if (radio.value === 'hyva') {
        themePreviewImage.src = 'https://via.placeholder.com/400x120?text=Hyva+Theme+Preview';
        themePreviewImage.alt = 'Hyva theme preview placeholder';
      }
      // Update validation state
      validateStyles();
      // updateStylesNextBtn(); // Commented out as per edit hint
      // Hide inline message when a theme is selected
      if (themePreviewMessage) {
        themePreviewMessage.textContent = '';
        themePreviewMessage.style.display = 'none';
      }
      // Enable the preview button
      if (themePreviewBtnMain) {
        themePreviewBtnMain.disabled = false;
      }
    });
  });

  // Preview Theme modal logic
  if (themePreviewBtnMain) {
    themePreviewBtnMain.disabled = false;
    themePreviewBtnMain.addEventListener('click', function (e) {
      // Always open the modal, regardless of theme selection
      if (themePreviewMessage) {
        themePreviewMessage.textContent = '';
        themePreviewMessage.style.display = 'none';
      }
      themePreviewModal.style.display = 'flex';
    });
  }
  // If there are other preview buttons (e.g., logo, colours), keep their logic
  themePreviewBtns.forEach(btn => {
    if (btn !== themePreviewBtnMain) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        themePreviewModal.style.display = 'flex';
      });
    }
  });
  // Fix for Logo tab Preview Theme button (prevent form submit and open modal)
  const logoPreviewBtn = document.getElementById('logo-preview-btn');
  if (logoPreviewBtn) {
    logoPreviewBtn.addEventListener('click', function (e) {
      e.preventDefault();
      themePreviewModal.style.display = 'flex';
    });
  }
  modalCloseBtn.addEventListener('click', function () {
    themePreviewModal.style.display = 'none';
  });
  // Modal tab switching
  modalTabs.forEach(tab => {
    tab.addEventListener('click', function () {
      modalTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.modalTab === 'desktop') {
        modalPreviewDesktop.classList.remove('hidden');
        modalPreviewMobile.classList.add('hidden');
      } else {
        modalPreviewDesktop.classList.add('hidden');
        modalPreviewMobile.classList.remove('hidden');
      }
    });
  });

  // Sidebar step logic
  const sidebarSteps = Array.from(document.querySelectorAll('.wizard-steps .step-btn'));
  function updateSidebarSteps(currentStepNum) {
    sidebarSteps.forEach(btn => {
      const stepNum = parseInt(btn.getAttribute('data-step'));
      btn.classList.remove('active', 'completed');
      if (stepNum < currentStepNum) {
        btn.classList.add('completed');
      } else if (stepNum === currentStepNum) {
        btn.classList.add('active');
      }
    });
  }

  // Add click listeners to sidebar step buttons to open the corresponding step page
  sidebarSteps.forEach(btn => {
    btn.addEventListener('click', function() {
      const stepNum = parseInt(btn.getAttribute('data-step'));
      hideAllSteps();
      let stepToShow = null;
      if (stepNum === 1) stepToShow = storeInfoStep;
      if (stepNum === 2) stepToShow = systemStep;
      if (stepNum === 3) stepToShow = stylesStep;
      if (stepNum === 4) stepToShow = pluginStep;
      if (stepNum === 5) stepToShow = summaryStep;
      if (stepToShow) {
        stepToShow.classList.remove('hidden');
        stepToShow.style.display = 'block';
      }
      // Update progress bar
      const progressBarLabel = document.querySelector('.progress-bar-label');
      const progressBarFill = document.querySelector('.progress-bar-fill');
      if (progressBarLabel && progressBarFill) {
        progressBarLabel.textContent = `Step ${stepNum} of 5`;
        progressBarFill.style.width = `${stepNum * 20}%`;
      }
      updateSidebarSteps(stepNum);
      // Optionally update topbar visibility
      const stepNames = ['store-info', 'system', 'styles', 'plugin', 'summary'];
      updateTopbarVisibility(stepNames[stepNum-1]);
    });
  });

  // Initial state: Store Info (step 1)
  updateSidebarSteps(1);

  // Toast notification logic
  function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

    // Clear any existing timeouts
    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId);
    }

    toast.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');

    // Hide after 3 seconds
    toast.timeoutId = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 300);
    }, 3000);
  }

  // --- Store Info Next Step ---
  if (nextBtn) {
    nextBtn.disabled = false;
    nextBtn.classList.remove('disabled');
    nextBtn.removeAttribute('aria-disabled');
    nextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      hideAllSteps();
      systemStep.classList.remove('hidden');
      systemStep.style.display = 'block';
      document.querySelector('.progress-bar-label').textContent = 'Step 2 of 5';
      document.querySelector('.progress-bar-fill').style.width = '40%';
      updateSidebarSteps(2);
      updateTopbarVisibility('system');
    });
  }

  // System Step navigation (attach globally)
  if (systemBackBtn) {
    systemBackBtn.addEventListener('click', function () {
      systemStep.classList.add('hidden');
      storeInfoCard.classList.remove('hidden');
      stylesStep.classList.add('hidden');
      document.querySelector('.progress-bar-label').textContent = 'Step 1 of 5';
      document.querySelector('.progress-bar-fill').style.width = '20%';
      updateSidebarSteps(1);
      updateTopbarVisibility('store-info');
    });
  }
  if (systemNextBtn) {
    systemNextBtn.disabled = false;
    systemNextBtn.classList.remove('disabled');
    systemNextBtn.removeAttribute('aria-disabled');
    systemNextBtn.addEventListener('click', function () {
      systemStep.classList.add('hidden');
      stylesStep.classList.remove('hidden');
      document.querySelector('.progress-bar-label').textContent = 'Step 3 of 5';
      document.querySelector('.progress-bar-fill').style.width = '60%';
      updateSidebarSteps(3);
      updateTopbarVisibility('styles');
    });
  }

  // Add event listeners for Styles step navigation
  const stylesBackBtn = document.getElementById('styles-back-btn');
  if (stylesBackBtn) {
    stylesBackBtn.addEventListener('click', function () {
      stylesStep.classList.add('hidden');
      systemStep.classList.remove('hidden');
      document.querySelector('.progress-bar-label').textContent = 'Step 2 of 5';
      document.querySelector('.progress-bar-fill').style.width = '40%';
      updateSidebarSteps(2);
      updateTopbarVisibility('system');
    });
  }
  if (stylesNextBtn) {
    stylesNextBtn.disabled = false;
    stylesNextBtn.classList.remove('disabled');
    stylesNextBtn.removeAttribute('aria-disabled');
    stylesNextBtn.addEventListener('click', function () {
      stylesStep.classList.add('hidden');
      const pluginStep = document.getElementById('plugin-step');
      if (pluginStep) pluginStep.classList.remove('hidden');
      document.querySelector('.progress-bar-label').textContent = 'Step 4 of 5';
      document.querySelector('.progress-bar-fill').style.width = '80%';
      updateSidebarSteps(4);
      updateTopbarVisibility('plugin');
    });
  }

  // Plugin step next button logic
  const pluginNextBtn = document.getElementById('plugin-next-btn');
  if (pluginNextBtn) {
    pluginNextBtn.disabled = false;
    pluginNextBtn.classList.remove('disabled');
    pluginNextBtn.removeAttribute('aria-disabled');
    pluginNextBtn.addEventListener('click', function () {
      // Proceed to summary or final step
      showToast('All steps completed! Proceeding to summary...');
      // Here you would typically show the summary step
      document.querySelector('.progress-bar-label').textContent = 'Step 5 of 5';
      document.querySelector('.progress-bar-fill').style.width = '100%';
      updateSidebarSteps(5);
    });
  }

  // Toast notification system initialized
  console.log('Toast notification system initialized');

  // Test button functionality
  const testToastBtn = document.getElementById('test-toast-btn');
  if (testToastBtn) {
    testToastBtn.addEventListener('click', function () {
      showToast('This is a test notification! 🎉');
    });
  }

  // --- Custom Colour Picker Logic ---
  const colourPickers = [
    {
      picker: document.getElementById('primary-inline-circle'),
      popup: document.getElementById('primary-colour-popup'),
      display: document.getElementById('primary-colour-picker'),
      default: '#6c5ce7',
      key: 'primary',
    },
    {
      picker: document.getElementById('secondary-inline-circle'),
      popup: document.getElementById('secondary-colour-popup'),
      display: document.getElementById('secondary-colour-picker'),
      default: '#a29bfe',
      key: 'secondary',
    },
    {
      picker: document.getElementById('tertiary-inline-circle'),
      popup: document.getElementById('tertiary-colour-popup'),
      display: document.getElementById('tertiary-colour-picker'),
      default: '#00b894',
      key: 'tertiary',
    },
  ];

  // Store current colors for preview updates
  const currentColors = {
    primary: '#6c5ce7',
    secondary: '#a29bfe',
    tertiary: '#00b894',
  };

  function updatePreviewColors() {
    // Desktop preview
    const desktopNav = document.querySelector('.magento-header-real');
    const desktopBtn = document.querySelector('.magento-add-to-cart-real');
    const desktopSearch = document.querySelector('.magento-header-icons-real svg');
    const desktopPrice = document.querySelector('.magento-product-price-real');
    const desktopTitle = document.querySelector('.magento-product-title-real');
    const desktopDesc = document.querySelector('.magento-product-desc-real');
    // Desktop profile and cart icons
    const desktopHeaderIcons = document.querySelectorAll('.magento-header-icons-real svg');
    // Desktop nav text and dropdown arrows
    const desktopNavLinks = document.querySelectorAll('.magento-nav-real a, .magento-nav-real .magento-nav-dropdown');
    const desktopNavArrows = document.querySelectorAll('.magento-nav-arrow');
    // Mobile preview
    const mobileNav = document.querySelector('.magento-mobile-header-real');
    const mobileBtn = document.querySelector('.magento-add-to-cart-real');
    const mobileSearch = document.querySelector('.magento-mobile-header-icons-real svg');
    const mobileTitle = document.querySelector('.magento-mobile-product-title-real');
    const mobileDesc = document.querySelector('.magento-mobile-desc-firstline');
    // Mobile breadcrumb
    const mobileBreadcrumb = document.querySelector('.magento-mobile-breadcrumbs-real');
    // Mobile header icons (search, profile, cart)
    const mobileHeaderIcons = document.querySelectorAll('.magento-mobile-header-icons-real svg');
    // Desktop breadcrumb
    const desktopBreadcrumb = document.querySelector('.magento-breadcrumbs-real');

    // Secondary: nav background
    if (desktopNav) desktopNav.style.background = currentColors.secondary;
    if (mobileNav) mobileNav.style.background = currentColors.secondary;
    // Primary: buttons, search bar, icons
    if (desktopBtn) desktopBtn.style.background = currentColors.primary;
    if (mobileBtn) mobileBtn.style.background = currentColors.primary;
    if (desktopSearch) desktopSearch.style.stroke = currentColors.primary;
    if (mobileSearch) mobileSearch.style.stroke = currentColors.primary;
    // Update all desktop header icons (profile, cart, etc.)
    if (desktopHeaderIcons) {
      desktopHeaderIcons.forEach(svg => {
        if (svg.getAttribute('fill') && svg.getAttribute('fill') !== 'none') {
          svg.setAttribute('fill', currentColors.primary);
        }
        if (svg.getAttribute('stroke') && svg.getAttribute('stroke') !== 'none') {
          svg.setAttribute('stroke', currentColors.primary);
        }
      });
    }
    // Update all mobile header icons (search, profile, cart, etc.)
    if (mobileHeaderIcons) {
      mobileHeaderIcons.forEach(svg => {
        if (svg.getAttribute('fill') && svg.getAttribute('fill') !== 'none') {
          svg.setAttribute('fill', currentColors.primary);
        }
        if (svg.getAttribute('stroke') && svg.getAttribute('stroke') !== 'none') {
          svg.setAttribute('stroke', currentColors.primary);
        }
      });
    }
    // Tertiary: text, nav links, attribute labels, breadcrumbs
    if (desktopTitle) desktopTitle.style.color = currentColors.tertiary;
    if (desktopDesc) desktopDesc.style.color = currentColors.tertiary;
    if (desktopPrice) desktopPrice.style.color = currentColors.tertiary;
    if (mobileTitle) mobileTitle.style.color = currentColors.tertiary;
    if (mobileDesc) mobileDesc.style.color = currentColors.tertiary;
    if (mobileBreadcrumb) mobileBreadcrumb.style.color = currentColors.tertiary;
    if (desktopBreadcrumb) desktopBreadcrumb.style.color = currentColors.tertiary;
    if (desktopNavLinks) {
      desktopNavLinks.forEach(link => {
        link.style.color = currentColors.tertiary;
      });
    }
    if (desktopNavArrows) {
      desktopNavArrows.forEach(arrow => {
        arrow.style.color = currentColors.primary;
      });
    }
    // Product attribute labels (first td in .magento-product-attrs-real)
    const desktopAttrLabels = document.querySelectorAll('.magento-product-attrs-real td:first-child');
    if (desktopAttrLabels) {
      desktopAttrLabels.forEach(td => {
        td.style.color = currentColors.tertiary;
      });
    }
    // Update small circle borders
    updateSmallCircleBorders();
    // Update large circle shadows
    updateLargeCircleShadows();
  }

  // Utility to darken a hex color by a given amount (0-1)
  function darkenColor(hex, amount = 0.15) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    let r = (num >> 16) & 0xFF;
    let g = (num >> 8) & 0xFF;
    let b = num & 0xFF;
    r = Math.max(0, Math.min(255, Math.floor(r * (1 - amount))));
    g = Math.max(0, Math.min(255, Math.floor(g * (1 - amount))));
    b = Math.max(0, Math.min(255, Math.floor(b * (1 - amount))));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  // Utility to convert hex color to rgba with alpha
  function hexToRgba(hex, alpha = 0.35) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    const r = (num >> 16) & 0xFF;
    const g = (num >> 8) & 0xFF;
    const b = num & 0xFF;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function updateSmallCircleBorders() {
    // For each color, update the border color of the corresponding small circle
    const smallCircles = [
      { key: 'primary', selector: '.colour-small.colour-primary' },
      { key: 'secondary', selector: '.colour-small.colour-secondary' },
      { key: 'tertiary', selector: '.colour-small.colour-tertiary' }
    ];
    smallCircles.forEach(({ key, selector }) => {
      const el = document.querySelector(selector);
      if (el) {
        // Border should be 2 shades darker
        el.style.setProperty('--colour-small-border', darkenColor(currentColors[key], 0.30));
      }
    });
  }

  function updateLargeCircleShadows() {
    // For each color, update the box-shadow color of the corresponding large circle
    const largeCircles = [
      { key: 'primary', selector: '.colour-circle.colour-primary' },
      { key: 'secondary', selector: '.colour-circle.colour-secondary' },
      { key: 'tertiary', selector: '.colour-circle.colour-tertiary' }
    ];
    largeCircles.forEach(({ key, selector }) => {
      const circleEl = document.querySelector(selector);
      if (!circleEl) return;
      // Use a strong, visible shadow with the current color
      circleEl.style.boxShadow = `0 0 24px 8px ${hexToRgba(currentColors[key], 0.55)}`;
    });
  }

  // Ensure border color and shadow match fill color on page load
  document.addEventListener('DOMContentLoaded', function() {
    updateSmallCircleBorders();
    updateLargeCircleShadows();
    console.log('Called updateLargeCircleShadows on DOMContentLoaded');
  });

  colourPickers.forEach(({ picker, popup, display, default: defaultColor, key }) => {
    if (!picker || !popup || !display) return;
    // Set initial color
    picker.style.background = defaultColor;
    display.style.background = defaultColor;
    // Show popup on click (only for small circles)
    picker.addEventListener('click', function (e) {
      e.stopPropagation();
      // Hide all other popups
      colourPickers.forEach(({ popup: p }) => { if (p) p.classList.remove('active'); });
      popup.classList.add('active');
    });
    // Handle color swatch click
    popup.querySelectorAll('.colour-swatch').forEach(swatch => {
      swatch.style.background = swatch.getAttribute('data-color');
      swatch.addEventListener('click', function (e) {
        e.stopPropagation();
        const color = swatch.getAttribute('data-color');
        picker.style.background = color;
        display.style.background = color;
        currentColors[key] = color;
        updatePreviewColors();
        updateColourCircleEffects(); // Call this function after a color is picked
        // Hide popup after color is picked
        popup.classList.remove('active');
      });
    });
  });
  // Hide popups when clicking outside
  window.addEventListener('click', function () {
    colourPickers.forEach(({ popup }) => { if (popup) popup.classList.remove('active'); });
  });
  // Update preview colors on modal open (in case user changed colors before opening)
  if (themePreviewModal) {
    themePreviewModal.addEventListener('transitionend', updatePreviewColors);
    // Also update when modal is shown
    const observer = new MutationObserver(() => {
      if (themePreviewModal.style.display === 'flex') {
        setTimeout(updatePreviewColors, 50);
      }
    });
    observer.observe(themePreviewModal, { attributes: true, attributeFilter: ['style'] });
  }

  // Version mapping for dependencies
  const versionDependencies = {
    '2.4.7': { php: '8.3', mariadb: '10.6', redis: '7.2', opensearch: '2.11' },
    '2.4.6': { php: '8.2', mariadb: '10.5', redis: '7.0', opensearch: '2.9' },
    '2.4.5': { php: '8.1', mariadb: '10.4', redis: '6.2', opensearch: '2.6' },
    '2.4.4': { php: '8.0', mariadb: '10.4', redis: '6.0', opensearch: '2.4' },
    '2.3.7': { php: '7.4', mariadb: '10.3', redis: '5.0', opensearch: 'N/A' },
    'laravel 11': { php: '8.2', mariadb: '10.6', redis: '7.2', opensearch: 'N/A' },
    'laravel 10': { php: '8.1', mariadb: '10.4', redis: '6.2', opensearch: 'N/A' },
    'laravel 9': { php: '8.0', mariadb: '10.3', redis: '6.0', opensearch: 'N/A' },
    'laravel 8': { php: '7.4', mariadb: '10.3', redis: '5.0', opensearch: 'N/A' },
    'laravel 7': { php: '7.3', mariadb: '10.2', redis: '5.0', opensearch: 'N/A' },
    '6.5': { php: '8.1', mariadb: '10.4', redis: '7.0', opensearch: 'N/A' },
    '6.4': { php: '8.0', mariadb: '10.3', redis: '6.0', opensearch: 'N/A' },
    '6.3': { php: '7.4', mariadb: '10.2', redis: '5.0', opensearch: 'N/A' },
    '6.2': { php: '7.3', mariadb: '10.1', redis: '5.0', opensearch: 'N/A' },
    ' 5.9': { php: '7.2', mariadb: '10.0', redis: '4.0', opensearch: 'N/A' }
  };

  function updateDependencyLabels(version) {
    // Try exact match, then lowercase match for Laravel, then trimmed match for WordPress 5.9
    let dep = versionDependencies[version];
    if (!dep && version.toLowerCase().startsWith('laravel')) {
      dep = versionDependencies[version.toLowerCase()];
    }
    if (!dep && version.trim() in versionDependencies) {
      dep = versionDependencies[version.trim()];
    }
    if (!dep) {
      dep = { php: 'N/A', mariadb: 'N/A', redis: 'N/A', opensearch: 'N/A' };
    }
    document.getElementById('php-version-label').textContent = `PHP Version ${dep.php}`;
    document.getElementById('mariadb-version-label').textContent = `MariaDB Version ${dep.mariadb}`;
    document.getElementById('redis-version-label').textContent = `Redis Version ${dep.redis}`;
    document.getElementById('opensearch-version-label').textContent = `OpenSearch Version ${dep.opensearch}`;
  }

  // Hook into version selection logic
  customDropdownOptions.addEventListener('click', function (e) {
    if (e.target.classList.contains('custom-dropdown-option')) {
      updateDependencyLabels(e.target.textContent.trim());
    }
  });
  // Also update on initial selection if needed
  customDropdownSelected.addEventListener('click', function (e) {
    if (customDropdownSelected.classList.contains('selected')) {
      updateDependencyLabels(customDropdownSelected.textContent.trim());
    }
  });

  // When a new platform is selected, reset the dropdown and dependencies section border
  platformOptions.forEach(option => {
    option.addEventListener('click', function () {
      customDropdown.classList.remove('selected');
      // Remove border from all dependency cards
      document.querySelectorAll('.version-dependency-card.selected').forEach(card => card.classList.remove('selected'));
    });
  });

  // Add click event to dependency cards for selection border
  const dependencyCards = document.querySelectorAll('.version-dependency-card');
  dependencyCards.forEach(card => {
    card.addEventListener('click', function () {
      dependencyCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });


  function updateTopbarVisibility(activeStep) {
    const topbar = document.getElementById('wizard-topbar-row');
    const backBtn = document.getElementById('wizard-topbar-back');
    const nextBtn = document.getElementById('wizard-topbar-next');
    if (!topbar) return;

    // Always ensure the topbar is visible
    topbar.style.display = 'flex';

    if (activeStep === 'store-info' || activeStep === '1') {
      if (backBtn) backBtn.style.visibility = 'hidden';
      if (nextBtn) nextBtn.style.visibility = 'hidden';
    } else {
      if (backBtn) backBtn.style.visibility = 'visible';
      if (nextBtn) nextBtn.style.visibility = 'visible';
    }
  }

  // Initialize topbar visibility on page load
  updateTopbarVisibility('store-info');

  const topbarBackBtn = document.getElementById('wizard-topbar-back');
  const topbarNextBtn = document.getElementById('wizard-topbar-next');

  // Update hideAllSteps to hide all .wizard-step containers
  function hideAllSteps() {
    [storeInfoStep, systemStep, stylesStep, pluginStep, summaryStep, profileStep, mySitesStep].forEach(step => {
      if (step) {
        step.classList.add('hidden');
        step.style.display = 'none';
      }
    });
  }

  // Update navigation logic to show/hide the correct step wrappers
  // Example for Store Info Next Step
  // if (storeNextBtn) { // This line is removed as per the edit hint
  //   storeNextBtn.addEventListener('click', function(e) { // This line is removed as per the edit hint
  //     e.preventDefault(); // This line is removed as per the edit hint
  //     hideAllSteps(); // This line is removed as per the edit hint
  //     systemStep.classList.remove('hidden'); // This line is removed as per the edit hint
  //     systemStep.style.display = 'block'; // This line is removed as per the edit hint
  //     document.querySelector('.progress-bar-label').textContent = 'Step 2 of 5'; // This line is removed as per the edit hint
  //     document.querySelector('.progress-bar-fill').style.width = '40%'; // This line is removed as per the edit hint
  //     updateSidebarSteps(2); // This line is removed as per the edit hint
  //     updateTopbarVisibility('system'); // This line is removed as per the edit hint
  //   }); // This line is removed as per the edit hint
  // } // This line is removed as per the edit hint

  if (topbarBackBtn) {
    topbarBackBtn.addEventListener('click', function () {
      if (!systemStep.classList.contains('hidden')) {
        // System step: Back to Store Info
        hideAllSteps();
        storeInfoStep.classList.remove('hidden');
        storeInfoStep.style.display = 'block';
        document.querySelector('.progress-bar-label').textContent = 'Step 1 of 5';
        document.querySelector('.progress-bar-fill').style.width = '20%';
        updateSidebarSteps(1);
        updateTopbarVisibility('store-info');
      } else if (!stylesStep.classList.contains('hidden')) {
        // Styles step: Back to System
        hideAllSteps();
        systemStep.classList.remove('hidden');
        systemStep.style.display = 'block';
        document.querySelector('.progress-bar-label').textContent = 'Step 2 of 5';
        document.querySelector('.progress-bar-fill').style.width = '40%';
        updateSidebarSteps(2);
        updateTopbarVisibility('system');
      } else if (!pluginStep.classList.contains('hidden')) {
        // Plugin step: Back to Styles
        hideAllSteps();
        stylesStep.classList.remove('hidden');
        stylesStep.style.display = 'block';
        document.querySelector('.progress-bar-label').textContent = 'Step 3 of 5';
        document.querySelector('.progress-bar-fill').style.width = '60%';
        updateSidebarSteps(3);
        updateTopbarVisibility('styles');
      } else if (!summaryStep.classList.contains('hidden')) {
        // Summary step: Back to Plugin
        hideAllSteps();
        pluginStep.classList.remove('hidden');
        pluginStep.style.display = 'block';
        document.querySelector('.progress-bar-label').textContent = 'Step 4 of 5';
        document.querySelector('.progress-bar-fill').style.width = '80%';
        updateSidebarSteps(4);
        updateTopbarVisibility('plugin');
      }
    });
  }

  if (topbarNextBtn) {
    topbarNextBtn.addEventListener('click', function () {
      if (!systemStep.classList.contains('hidden')) {
        // System step: Next to Styles
        // (Validation removed)
        hideAllSteps();
        stylesStep.classList.remove('hidden');
        stylesStep.style.display = 'block';
        document.querySelector('.progress-bar-label').textContent = 'Step 3 of 5';
        document.querySelector('.progress-bar-fill').style.width = '60%';
        updateSidebarSteps(3);
        updateTopbarVisibility('styles');
      } else if (!stylesStep.classList.contains('hidden')) {
        // Styles step: Next to Plugin
        // (Validation removed)
        hideAllSteps();
        pluginStep.classList.remove('hidden');
        pluginStep.style.display = 'block';
        document.querySelector('.progress-bar-label').textContent = 'Step 4 of 5';
        document.querySelector('.progress-bar-fill').style.width = '80%';
        updateSidebarSteps(4);
        updateTopbarVisibility('plugin');
      } else if (!pluginStep.classList.contains('hidden')) {
        // Plugin step: Next to Summary
        hideAllSteps();
        summaryStep.classList.remove('hidden');
        summaryStep.style.display = 'block';
        // Update summary store name
        const storeNameInput = document.getElementById('storeName');
        const summaryStoreName = document.getElementById('summary-store-name');
        if (storeNameInput && summaryStoreName) {
          summaryStoreName.textContent = storeNameInput.value;
        }
        // Update summary platform and version
        const summaryMagentoVersion = document.getElementById('summary-magento-version');
        let selectedPlatform = '';
        let selectedVersion = '';
        const platformOptions = document.querySelectorAll('.platform-option');
        platformOptions.forEach(opt => {
          if (opt.classList.contains('selected')) {
            selectedPlatform = opt.innerText.trim();
          }
        });
        const customDropdownSelected = document.getElementById('custom-dropdown-selected');
        if (customDropdownSelected && customDropdownSelected.classList.contains('selected')) {
          selectedVersion = customDropdownSelected.textContent.trim();
        }
        if (summaryMagentoVersion) {
          if (selectedPlatform && selectedVersion) {
            summaryMagentoVersion.textContent = selectedPlatform + ' Version ' + selectedVersion;
          } else {
            summaryMagentoVersion.textContent = 'Not selected';
          }
        }
        // Update summary selected theme
        const summaryTheme = document.getElementById('summary-theme');
        const themeRadios = document.querySelectorAll('.theme-radio');
        let selectedTheme = '';
        themeRadios.forEach(radio => {
          if (radio.checked) {
            const themeCard = radio.closest('.theme-card');
            if (themeCard) {
              const themeTitle = themeCard.querySelector('.theme-title');
              if (themeTitle) {
                selectedTheme = themeTitle.childNodes[0].textContent.trim();
              }
            }
          }
        });
        if (summaryTheme) {
          summaryTheme.textContent = selectedTheme || 'Not selected';
        }
        // Update summary font
        const summaryFont = document.getElementById('summary-font');
        const defaultFontCheckbox = document.getElementById('default-font-checkbox');
        const fontPreviewBox = document.getElementById('font-preview-box');
        if (summaryFont) {
          if (defaultFontCheckbox && defaultFontCheckbox.checked) {
            summaryFont.textContent = 'Using Default Theme Font';
            summaryFont.style.fontFamily = '';
          } else if (fontPreviewBox && fontPreviewBox.textContent) {
            summaryFont.textContent = fontPreviewBox.textContent;
            summaryFont.style.fontFamily = fontPreviewBox.style.fontFamily;
          } else {
            summaryFont.textContent = 'Not selected';
            summaryFont.style.fontFamily = '';
          }
        }
        document.querySelector('.progress-bar-label').textContent = 'Step 5 of 5';
        document.querySelector('.progress-bar-fill').style.width = '100%';
        updateSidebarSteps(5);
        updateTopbarVisibility('summary');
        // (Keep your summary update logic here)
      }
    });
  }

  // Force all Next Step buttons to always be enabled
  const allNextBtns = [
    document.getElementById('store-next-btn'),
    document.getElementById('system-next-btn'),
    document.getElementById('styles-next-btn'),
    document.getElementById('plugin-next-btn'),
    document.getElementById('wizard-topbar-next')
  ];
  allNextBtns.forEach(btn => {
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('disabled');
      btn.removeAttribute('aria-disabled');
    }
  });

  // Profile button logic
  // const profileBtn = Array.from(document.querySelectorAll('.footer-btn')).find(btn => btn.textContent.trim().startsWith('Profile'));
  // const profileStep = document.getElementById('profile-step');
  // if (profileBtn && profileStep) {
  //   profileBtn.addEventListener('click', function () {
  //     console.log('Profile button clicked'); // Debug log
  //     hideAllSteps();
  //     profileStep.classList.remove('hidden');
  //     profileStep.style.display = 'block';
  //     // Optionally, update sidebar or topbar to reflect profile view
  //   });
  // }
  // My Sites button logic
  const mySitesBtn = Array.from(allFooterBtns).find(btn => btn.textContent.trim().toLowerCase().includes('my sites'));
  if (mySitesBtn && mySitesStep) {
    mySitesBtn.addEventListener('click', function () {
      hideAllSteps();
      if (profileStep) {
        profileStep.classList.add('hidden');
        profileStep.style.display = 'none';
      }
      mySitesStep.classList.remove('hidden');
      mySitesStep.style.display = 'block';
    });
  }
  // At the end of DOMContentLoaded handler, after all step variable declarations and functions
  hideAllSteps();
  if (storeInfoStep) {
    storeInfoStep.classList.remove('hidden');
    storeInfoStep.style.display = 'block';
    console.log('Store Info step classes:', storeInfoStep.className, 'Display:', storeInfoStep.style.display);
  }
});

// Show selected filename for custom file inputs
function setupCustomFileInputs() {
  document.querySelectorAll('.custom-file-input').forEach(input => {
    input.addEventListener('change', function () {
      const filename = this.files[0] ? this.files[0].name : '';
      const filenameSpan = this.parentElement.nextElementSibling;
      if (filenameSpan && filenameSpan.classList.contains('custom-file-filename')) {
        filenameSpan.textContent = filename;
      }
    });
  });
}

// Call on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCustomFileInputs);
} else {
  setupCustomFileInputs();
}

// --- Logo Image Preview for Desktop and Mobile Logo ---
function setupLogoImagePreviews() {
  const desktopLogoInput = document.getElementById('desktop-logo');
  const desktopLogoPreview = document.getElementById('desktop-logo-preview');
  // Magento logo in Desktop preview modal
  const magentoLogoReal = document.querySelector('.magento-logo-real');
  const defaultMagentoLogo = 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Magento_Logo.svg';

  if (desktopLogoInput && desktopLogoPreview) {
    desktopLogoInput.addEventListener('change', function () {
      const file = this.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
          desktopLogoPreview.src = e.target.result;
          desktopLogoPreview.style.display = 'block';
          if (magentoLogoReal) magentoLogoReal.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        desktopLogoPreview.src = '';
        desktopLogoPreview.style.display = 'none';
        if (magentoLogoReal) magentoLogoReal.src = defaultMagentoLogo;
      }
    });
  }

  const mobileLogoInput = document.getElementById('mobile-logo');
  const mobileLogoPreview = document.getElementById('mobile-logo-preview');
  // Magento logo in Mobile preview modal
  const magentoMobileLogoReal = document.querySelector('.magento-mobile-logo-real');
  const defaultMagentoMobileLogo = 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Magento_Logo.svg';

  if (mobileLogoInput && mobileLogoPreview) {
    mobileLogoInput.addEventListener('change', function () {
      const file = this.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
          mobileLogoPreview.src = e.target.result;
          mobileLogoPreview.style.display = 'block';
          if (magentoMobileLogoReal) magentoMobileLogoReal.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        mobileLogoPreview.src = '';
        mobileLogoPreview.style.display = 'none';
        if (magentoMobileLogoReal) magentoMobileLogoReal.src = defaultMagentoMobileLogo;
      }
    });
  }
}

// Call on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupLogoImagePreviews);
} else {
  setupLogoImagePreviews();
}

// Debug: Global click handler for font-option
document.body.addEventListener('click', function(e) {
  if (e.target.classList && e.target.classList.contains('font-option')) {
    console.log('Global handler: font-option clicked', e.target.getAttribute('data-font'));
  }
});

// Custom file input filename display for desktop and mobile logo
const desktopLogoInput = document.getElementById('desktop-logo');
const desktopFilename = document.getElementById('desktop-filename');
if (desktopLogoInput && desktopFilename) {
  desktopLogoInput.addEventListener('change', function () {
    const fileName = this.files[0] ? this.files[0].name : 'No file chosen';
    desktopFilename.textContent = fileName;
  });
}
const mobileLogoInput = document.getElementById('mobile-logo');
const mobileFilename = document.getElementById('mobile-filename');
if (mobileLogoInput && mobileFilename) {
  mobileLogoInput.addEventListener('change', function () {
    const fileName = this.files[0] ? this.files[0].name : 'No file chosen';
    mobileFilename.textContent = fileName;
  });
}

// --- Font Dropdown and Preview Functionality ---
function setupFontDropdown() {
  const fontDropdownTrigger = document.getElementById('font-dropdown-trigger');
  const fontDropdown = document.getElementById('font-dropdown');
  const fontOptions = fontDropdown ? fontDropdown.querySelectorAll('.font-option') : [];
  const fontPreviewBox = document.getElementById('font-preview-box');
  const defaultFontCheckbox = document.getElementById('default-font-checkbox');
  const fontSearchArrow = document.getElementById('font-search-arrow');

  // Always show placeholder in search box
  if (fontDropdownTrigger) {
    fontDropdownTrigger.value = '';
    fontDropdownTrigger.setAttribute('placeholder', 'search font');
    fontDropdownTrigger.classList.add('font-search-placeholder');
    // Hide placeholder on focus, show on blur if empty
    fontDropdownTrigger.addEventListener('focus', function() {
      fontDropdownTrigger.setAttribute('placeholder', '');
    });
    fontDropdownTrigger.addEventListener('blur', function() {
      if (!fontDropdownTrigger.value) {
        fontDropdownTrigger.setAttribute('placeholder', 'search font');
      }
    });
  }

  // Show/hide dropdown on trigger click
  if (fontDropdownTrigger && fontDropdown) {
    fontDropdownTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      fontDropdown.classList.toggle('hidden');
      if (fontSearchArrow) fontSearchArrow.classList.toggle('open', !fontDropdown.classList.contains('hidden'));
    });
    // Hide dropdown if click outside
    document.addEventListener('click', function (e) {
      if (!fontDropdown.contains(e.target) && e.target !== fontDropdownTrigger && e.target !== fontSearchArrow) {
        fontDropdown.classList.add('hidden');
        if (fontSearchArrow) fontSearchArrow.classList.remove('open');
      }
    });
  }

  // Toggle dropdown on arrow click
  if (fontSearchArrow && fontDropdown && fontDropdownTrigger) {
    fontSearchArrow.addEventListener('click', function (e) {
      e.stopPropagation();
      fontDropdown.classList.toggle('hidden');
      fontSearchArrow.classList.toggle('open', !fontDropdown.classList.contains('hidden'));
      // Focus the input when opening
      if (!fontDropdown.classList.contains('hidden')) {
        fontDropdownTrigger.focus();
      }
    });
  }

  // Font selection logic
  fontOptions.forEach(option => {
    option.addEventListener('click', function () {
      const fontName = option.getAttribute('data-font');
      // Set preview box text and style
      if (fontPreviewBox) {
        fontPreviewBox.textContent = fontName;
        fontPreviewBox.style.fontFamily = option.style.fontFamily;
      }
      // Uncheck default font checkbox
      if (defaultFontCheckbox) {
        defaultFontCheckbox.checked = false;
      }
      // Close dropdown
      if (fontDropdown) {
        fontDropdown.classList.add('hidden');
        if (fontSearchArrow) fontSearchArrow.classList.remove('open');
      }
      // Do NOT update the search box text, keep placeholder only
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupFontDropdown);
} else {
  setupFontDropdown();
}

// --- Add/Cancel Toggle for Plugin Add Buttons ---
function setupPluginAddCancelButtons() {
  const addBtns = document.querySelectorAll('.plugin-card-btn, .payment-add-btn, .address-add-btn, .email-add-btn, .tax-add-btn, .reviews-add-btn, .search-add-btn');
  addBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const card = btn.closest('.plugin-card, .payment-card, .address-card, .email-card, .tax-card, .reviews-card, .search-card');
      if (btn.classList.contains('cancel-btn')) {
        btn.textContent = 'Add';
        btn.classList.remove('cancel-btn');
        if (card) card.classList.remove('selected');
      } else {
        btn.textContent = 'Cancel';
        btn.classList.add('cancel-btn');
        if (card) card.classList.add('selected');
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupPluginAddCancelButtons);
} else {
  setupPluginAddCancelButtons();
}

// DEBUG: Force strong red shadow on all colour-circle elements after DOM is ready

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.colour-circle').forEach(function(el) {
    el.style.boxShadow = '0 0 32px 16px #ff0000';
    console.log('Set shadow on:', el);
  });
});
