window.addEventListener('DOMContentLoaded', function () {
  const storeInfoCard = document.getElementById('store-info-card');
  const systemStepWrapper = document.querySelector('.wizard-step-system');
  const systemStepCard = document.getElementById('system-step-card');
  const systemBackBtn = document.getElementById('system-back-btn');
  const systemNextBtn = document.getElementById('system-next-btn');
  const nextBtn = document.getElementById('store-next-btn');
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
      if (value.length > 0 && value.length <= 14) {
        checkmark.style.visibility = 'visible';
        nextBtn.disabled = false;
        nextBtn.classList.remove('disabled');
        if (nameAvailable) nameAvailable.classList.remove('hidden');
        storeNameInput.classList.add('valid-input');
      } else {
        checkmark.style.visibility = 'hidden';
        nextBtn.disabled = true;
        nextBtn.classList.add('disabled');
        if (nameAvailable) nameAvailable.classList.add('hidden');
        storeNameInput.classList.remove('valid-input');
      }
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
      if (platformSelected && versionSelected) {
        systemNextBtn.disabled = false;
        systemNextBtn.classList.remove('disabled');
      } else {
        systemNextBtn.disabled = true;
        systemNextBtn.classList.add('disabled');
      }
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
  const stylesStepCard = document.getElementById('styles-step-card');
  const stylesStepWrapper = document.getElementById('styles-step');
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
    stylesNextBtn.disabled = false;
    stylesNextBtn.classList.remove('disabled');
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
      updateStylesNextBtn();
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
    // Initially disable the button if no theme is selected
    const isThemeSelected = Array.from(themeRadios).some(radio => radio.checked);
    themePreviewBtnMain.disabled = !isThemeSelected;
    themePreviewBtnMain.addEventListener('click', function (e) {
      const selectedTheme = Array.from(themeRadios).find(radio => radio.checked);
      if (!selectedTheme) {
        // Show inline message
        if (themePreviewMessage) {
          themePreviewMessage.textContent = 'Please select a theme before previewing.';
          themePreviewMessage.style.display = 'block';
          console.log('Theme preview message should now be visible.');
        }
        // Prevent modal from opening
        e.preventDefault();
        return;
      }
      // Hide message and show modal
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
  nextBtn.addEventListener('click', function (e) {
    e.preventDefault();
    storeInfoCard.classList.add('hidden');
    systemStepWrapper.classList.remove('hidden');
    stylesStepWrapper.classList.add('hidden');
    document.querySelector('.progress-bar-label').textContent = 'Step 2 of 5';
    document.querySelector('.progress-bar-fill').style.width = '40%';
    updateSidebarSteps(2);
    updateTopbarVisibility('system');
  });

  // System Step navigation (attach globally)
  if (systemBackBtn) {
    systemBackBtn.addEventListener('click', function () {
      systemStepWrapper.classList.add('hidden');
      storeInfoCard.classList.remove('hidden');
      stylesStepWrapper.classList.add('hidden');
      document.querySelector('.progress-bar-label').textContent = 'Step 1 of 5';
      document.querySelector('.progress-bar-fill').style.width = '20%';
      updateSidebarSteps(1);
      updateTopbarVisibility('store-info');
    });
  }
  if (systemNextBtn) {
    systemNextBtn.addEventListener('click', function () {
      systemStepWrapper.classList.add('hidden');
      stylesStepWrapper.classList.remove('hidden');
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
      stylesStepWrapper.classList.add('hidden');
      systemStepWrapper.classList.remove('hidden');
      document.querySelector('.progress-bar-label').textContent = 'Step 2 of 5';
      document.querySelector('.progress-bar-fill').style.width = '40%';
      updateSidebarSteps(2);
      updateTopbarVisibility('system');
    });
  }
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
    stylesNextBtn.disabled = false;
    stylesNextBtn.classList.remove('disabled');
  }

  // Plugin step next button logic
  const pluginNextBtn = document.getElementById('plugin-next-btn');
  if (pluginNextBtn) {
    pluginNextBtn.addEventListener('click', function () {
      // Proceed to summary or final step
      showToast('All steps completed! Proceeding to summary...');
      // Here you would typically show the summary step
      document.querySelector('.progress-bar-label').textContent = 'Step 5 of 5';
      document.querySelector('.progress-bar-fill').style.width = '100%';
      updateSidebarSteps(5);
    });
    pluginNextBtn.disabled = false;
    pluginNextBtn.classList.remove('disabled');
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
  }

  function darkenColor(hex, amount = 0.15) {
    hex = hex.replace(/^#/, '');
    let num = parseInt(hex, 16);
    let r = (num >> 16) & 0xFF;
    let g = (num >> 8) & 0xFF;
    let b = num & 0xFF;
    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function updateColourCircleEffects() {
    // Map: key -> [largeCircleId, smallCircleId]
    const circleMap = {
      primary: ['primary-colour-picker', 'primary-inline-circle'],
      secondary: ['secondary-colour-picker', 'secondary-inline-circle'],
      tertiary: ['tertiary-colour-picker', 'tertiary-inline-circle'],
    };

    Object.entries(circleMap).forEach(([key, ids]) => {
      const [largeId, smallId] = ids;
      const color = currentColors[key];
      // Large circle
      const largeCircle = document.getElementById(largeId);
      // Small circle
      const smallCircle = document.getElementById(smallId);

      // Remove previous effects
      largeCircle.classList.remove('selected-glow');
      smallCircle.classList.remove('selected-border');
      largeCircle.style.removeProperty('--selected-color');
      smallCircle.style.removeProperty('--selected-color');
      smallCircle.style.removeProperty('--selected-border-color');

      // Add new effects
      if (color) {
        largeCircle.classList.add('selected-glow');
        smallCircle.classList.add('selected-border');
        largeCircle.style.setProperty('--selected-color', color);
        smallCircle.style.setProperty('--selected-color', color);
        smallCircle.style.setProperty('--selected-border-color', darkenColor(color, 0.18));
      }
    });
  }

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
        // Hide popup
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

  if (topbarBackBtn) {
    topbarBackBtn.addEventListener('click', function () {
      if (!systemStepWrapper.classList.contains('hidden')) {
        // On System step, go back to Store Info
        systemStepWrapper.classList.add('hidden');
        storeInfoCard.classList.remove('hidden');
        stylesStepWrapper.classList.add('hidden');
        document.querySelector('.progress-bar-label').textContent = 'Step 1 of 5';
        document.querySelector('.progress-bar-fill').style.width = '20%';
        updateSidebarSteps(1);
        updateTopbarVisibility('store-info');
      } else if (!stylesStepWrapper.classList.contains('hidden')) {
        // On Styles step, go back to System
        stylesStepWrapper.classList.add('hidden');
        systemStepWrapper.classList.remove('hidden');
        document.querySelector('.progress-bar-label').textContent = 'Step 2 of 5';
        document.querySelector('.progress-bar-fill').style.width = '40%';
        updateSidebarSteps(2);
        updateTopbarVisibility('system');
      } else {
        // Add more steps as needed
      }
    });
  }

  if (topbarNextBtn) {
    topbarNextBtn.addEventListener('click', function () {
      if (!systemStepWrapper.classList.contains('hidden')) {
        // On System step, go to Styles
        if (!validateSystem()) {
          const message = getValidationMessage('system');
          if (message) {
            showToast(message);
          }
          return;
        }
        systemStepWrapper.classList.add('hidden');
        stylesStepWrapper.classList.remove('hidden');
        document.querySelector('.progress-bar-label').textContent = 'Step 3 of 5';
        document.querySelector('.progress-bar-fill').style.width = '60%';
        updateSidebarSteps(3);
        updateTopbarVisibility('styles');
      } else if (!stylesStepWrapper.classList.contains('hidden')) {
        // On Styles step, go to Plugin
        if (!validateStyles()) {
          const message = getValidationMessage('styles');
          if (message) {
            showToast(message);
          }
          return;
        }
        stylesStepWrapper.classList.add('hidden');
        const pluginStep = document.getElementById('plugin-step');
        if (pluginStep) pluginStep.classList.remove('hidden');
        document.querySelector('.progress-bar-label').textContent = 'Step 4 of 5';
        document.querySelector('.progress-bar-fill').style.width = '80%';
        updateSidebarSteps(4);
        updateTopbarVisibility('plugin');
      } else {
        // Add more steps as needed
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
    });
    // Hide dropdown if click outside
    document.addEventListener('click', function (e) {
      if (!fontDropdown.contains(e.target) && e.target !== fontDropdownTrigger) {
        fontDropdown.classList.add('hidden');
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
