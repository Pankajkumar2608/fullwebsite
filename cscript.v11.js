"use strict";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded. Initializing App...");

  // --- Configuration ---
  const config = {
    apiUrlBase: "https://csabapi.onrender.com/api", // Base URL for API calls
    itemsPerPage: 25,
    paginationMaxPagesToShow: 5,
    choicesOptions: {
      searchEnabled: true,
      itemSelectText: "",
      shouldSort: false, 
    },
    localStorageKey: "savedCollegesMK_v2",
    userRankLineColor: "rgb(239, 68, 68)",
  };

  // --- State ---
  let state = {
    filteredData: [], 
    savedColleges: [], 
    currentPage: 1,
    totalPages: 0, // Will be set by API response
    instituteChoices: null,
    programChoices: null,
    isLoading: true,
    trendChartInstance: null,
    domReady: false,
    optionsLoaded: {
      years: false,
      rounds: false,
      quotas: false,
      seatTypes: false,
      genders: false,
      institutes: false,
      programs: false,
    },
  };

  let dom = {}; // DOM elements will be acquired by getDomElements

  // --- Utility Functions ---
  const logError = (message, error = null) => {
    console.error(message, error);
    // Basic error display - enhance as needed
    if (dom.resultsStatus) {
        updateResultsStatus(message || "An unexpected error occurred.", "error");
    } else {
        alert(`Error: ${message}`); // Fallback
    }
    showLoading(false); // Ensure loading is hidden on error
  };

  const showLoading = (show, message = "Loading...") => {
    state.isLoading = show;
    if (!dom.loadingIndicator) {
        dom.loadingIndicator = document.getElementById("loading");
    }
    if (!dom.loadingIndicator) return;

    const loaderText = dom.loadingIndicator.querySelector("span");
    if (loaderText) loaderText.textContent = message;

    if (show) {
        dom.loadingIndicator.classList.remove("hidden");
        dom.loadingIndicator.setAttribute("aria-busy", "true");
    } else {
        if (!dom.loadingIndicator.classList.contains("hidden")) {
            dom.loadingIndicator.classList.add("hidden");
            dom.loadingIndicator.setAttribute("aria-busy", "false");
        }
    }
  };

  // --- API Fetch Functions (NEW) ---

  /**
   * Fetches options for dropdowns from the backend API.
   * Example endpoint: GET /api/options?type=years,rounds,institutes...
   */
  async function fetchDropdownOptions() {
      console.log("Fetching dropdown options from API...");
      showLoading(true, "Loading filter options...");
      const optionTypes = ['years', 'rounds', 'quotas', 'seatTypes', 'genders', 'institutes', 'programs'];
      try {
          // Example: Fetch all options in one go (adjust API endpoint as needed)
          const response = await fetch(`${config.apiUrlBase}/options?types=${optionTypes.join(',')}`);
          if (!response.ok) {
              throw new Error(`API Error (${response.status}): Failed to load filter options.`);
          }
          const optionsData = await response.json();
          console.log("Received options:", optionsData);

          // Populate selects based on API response
          populateSelect(dom.yearSelect, optionsData.years || [], true);
          populateSelect(dom.roundSelect, optionsData.rounds || []);
          populateSelect(dom.quotaSelect, optionsData.quotas || []);
          populateSelect(dom.seatTypeSelect, optionsData.seatTypes || []);
          populateSelect(dom.genderSelect, optionsData.genders || []);

          if (typeof Choices === "function") {
              if (dom.instituteSelect) {
                  state.instituteChoices = populateChoicesSelect(
                      dom.instituteSelect,
                      optionsData.institutes || [],
                      "Select Institute (Optional)..."
                  );
              }
              if (dom.programSelect) {
                  state.programChoices = populateChoicesSelect(
                      dom.programSelect,
                      optionsData.programs || [],
                      "Select Program (Optional)..."
                  );
              }
          } else {
              // Fallback for native selects if Choices.js fails or isn't present
              if (dom.instituteSelect) populateSelect(dom.instituteSelect, optionsData.institutes || []);
              if (dom.programSelect) populateSelect(dom.programSelect, optionsData.programs || []);
          }

          // Mark options as loaded
          optionTypes.forEach(type => {
              if (optionsData[type]) state.optionsLoaded[type] = true;
          });

          console.log("Dropdown options populated successfully.");
          return true;

      } catch (error) {
          logError("Failed to fetch or populate dropdown options: " + error.message, error);
          disableForm(); // Disable form if essential options fail
          return false;
      } finally {
          // Hide loading only if all initial tasks are done
          if (Object.values(state.optionsLoaded).every(loaded => loaded)) {
            //   showLoading(false); // Moved hiding loader to initializeUI completion
          }
      }
  }

  /**
   * Fetches filtered and paginated results from the backend API.
   * Example endpoint: GET /api/colleges?rank=...&seatType=...&page=...&limit=...
   */
  async function fetchResultsFromAPI(page = 1, fetchAllForDownload = false) {
      if (!dom.submitButton || !dom.resultsSection || !dom.resultsBody) {
          logError("Cannot fetch results: Required DOM elements missing.", null);
          return;
      }

      const filters = getFilterValues(); // Get current filter values from the form

      // Basic validation before API call (optional, but good UX)
      clearFormErrors();
      if (!validateForm()) {
          updateResultsStatus("Please correct the highlighted errors.", "error");
          return;
      }

      // Show loading state on button / general loader
      const buttonToLoad = fetchAllForDownload ? dom.downloadButton : dom.submitButton;
      const loadingText = fetchAllForDownload ? "Fetching all data..." : "Predicting...";
      if (buttonToLoad) setButtonLoading(buttonToLoad, true, loadingText);
      if (!fetchAllForDownload) {
         showLoading(true, "Fetching predictions...");
         dom.resultsSection.style.display = "block"; // Show results section immediately
         updateResultsStatus("Filtering data based on your selections...", "info");
      }


      // Construct query parameters
      const params = new URLSearchParams();
      if (filters.rank) params.append("rank", filters.rank);
      if (filters.seatType) params.append("seatType", filters.seatType); // Mandatory
      if (filters.year) params.append("year", filters.year);
      if (filters.round) params.append("round", filters.round);
      if (filters.quota) params.append("quota", filters.quota);
      if (filters.gender) params.append("gender", filters.gender);
      if (filters.institute) params.append("institute", filters.institute);
      if (filters.program) params.append("program", filters.program);

      if (fetchAllForDownload) {
          params.append("fetchAll", "true"); // Signal to backend to skip pagination
      } else {
          params.append("page", page);
          params.append("limit", config.itemsPerPage);
      }

      try {
          console.log(`Fetching results from: ${config.apiUrlBase}/colleges?${params.toString()}`);
          const response = await fetch(`${config.apiUrlBase}/colleges?${params.toString()}`);

          if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
              throw new Error(`API Error (${response.status}): ${errorData.message || response.statusText}`);
          }

          const data = await response.json();
          console.log("Received results:", data);

          if (fetchAllForDownload) {
              // Handle data specifically for download
              console.log(`Fetched ${data.results?.length || 0} total results for download.`);
              // Trigger download function with this full data set
              generateAndDownloadPdf(data.results || [], filters);
          } else {
              // Update state for paginated display
              state.filteredData = data.results || []; // Store only the current page's data
              state.currentPage = data.currentPage || page;
              state.totalPages = data.totalPages || 0;

              updateResultsTable(); // Render the current page
              renderPagination();   // Render pagination controls

              const resultCount = data.totalCount || state.filteredData.length; // Use totalCount from API if available
              updateResultsStatus(
                  resultCount > 0
                      ? `Showing ${state.filteredData.length} of ${resultCount} result(s).`
                      : "No colleges found matching your criteria. Try adjusting filters.",
                  resultCount > 0 ? "success" : "info"
              );
              if (dom.downloadButton) dom.downloadButton.disabled = resultCount === 0;

              if (resultCount > 0 && dom.resultsSection.style.display === "block") {
                  setTimeout(scrollToResults, 150);
              }
          }

      } catch (error) {
          logError("Error fetching prediction results: " + error.message, error);
          if (!fetchAllForDownload) {
             if (dom.resultsBody) dom.resultsBody.innerHTML = `<tr class="no-results"><td colspan="5">An error occurred fetching results. Please try again.</td></tr>`;
             if (dom.downloadButton) dom.downloadButton.disabled = true;
             if (dom.paginationControls) dom.paginationControls.style.display = "none";
             state.filteredData = [];
             state.totalPages = 0;
             renderPagination(); // Clear pagination
          } else {
             alert("Error fetching data for download. Please try again.");
          }
      } finally {
          if (buttonToLoad) setButtonLoading(buttonToLoad, false);
          if (!fetchAllForDownload) showLoading(false);
      }
  }

  /**
   * Fetches trend data for a specific college/program combination from the backend.
   * Example endpoint: GET /api/trends?institute=...&program=..."a=...&seatType=...&gender=...&round=...
   */
  async function fetchTrendDataFromAPI(baseRowData) {
    console.log("Fetching trend data for:", baseRowData);
    // Fix property names to match the data structure
    const params = new URLSearchParams({
        institute: baseRowData.institute || baseRowData.Institute, // Handle both cases
        program: baseRowData.program_name,
        quota: baseRowData.quota || baseRowData.Quota, // Handle both cases
        seatType: baseRowData.seat_type,
        gender: baseRowData.gender || baseRowData.Gender, // Handle both cases
        round: baseRowData.round || baseRowData.Round // Handle both cases
    });

    try {
        const response = await fetch(`${config.apiUrlBase}/trends?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`API Error (${response.status}): Failed to load trend data.`);
        }
        const trendData = await response.json();
        console.log("Received trend data:", trendData);
        return trendData || []; // Ensure we return the results array
    } catch (error) {
        logError("Failed to fetch trend data: " + error.message, error);
        return null;
    }
  }

  // --- Initialization Steps ---

  function getDomElements() {
    // ... (Keep this function exactly as it was)
    console.log("getDomElements: Acquiring DOM elements...");
    try {
      const get = (id) => {
        const el = document.getElementById(id);
        if (!el)
          throw new Error(`Required DOM element with ID '${id}' not found.`);
        return el;
      };
      const query = (selector) => {
        const el = document.querySelector(selector);
        if (!el)
          console.warn(
            `Optional DOM element with selector '${selector}' not found.`
          );
        return el;
      };

      dom = {
        loadingIndicator: get("loading"),
        filterForm: get("filter-form"),
        resultsSection: get("results-section"),
        resultsBody: get("result-body"),
        resultsStatus: get("results-status"),
        paginationControls: get("pagination"),
        mainContainer: query(".container"),
        yearSelect: get("year"),
        roundSelect: get("round_no"),
        quotaSelect: get("quota"),
        seatTypeSelect: get("seat_type"),
        genderSelect: get("gender"),
        instituteSelect: get("institute_name"),
        programSelect: get("program_name"),
        rankInput: get("your_rank"),
        submitButton: get("submit-btn"),
        clearFiltersButton: get("clear-filters-btn"),
        downloadButton: get("download-results-btn"),
        viewSavedButton: get("view-saved-btn"),
        viewSavedButtonMobile: get("view-saved-btn-mobile"),
        trendModal: get("trend-modal"),
        trendModalTitle: get("trend-modal-title"),
        trendInfo: get("trend-info"),
        trendChartCanvas: get("trend-chart"),
        trendError: get("trend-error"),
        savedCollegesModal: get("saved-colleges-modal"),
        savedCollegesList: get("saved-colleges-list"),
        clearSavedButton: get("clear-saved-btn"),
        modalCloseButtons: document.querySelectorAll(".modal-close"),
        header: query("header"),
        navMenu: query("#main-nav"),
        mobileMenuToggle: query("#mobile-menu-toggle"),
        savedCountSpan: query("#saved-count"),
        savedCountSpanMobile: query("#saved-count-mobile"),
        currentYearSpan: query("#current-year"),
      };
      state.domReady = true;
      console.log("getDomElements: Success.");
      return true;
    } catch (error) {
      logError(
        "Fatal Error during DOM element acquisition: " + error.message,
        error
      );
      document.body.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--error-red); background-color: rgba(239, 68, 68, 0.1); border: 1px solid var(--error-red); border-radius: var(--border-radius); font-family: var(--font-body);">${error.message}<br>The application cannot start. Please ensure the HTML structure is correct or contact support.</div>`;
      showLoading(false);
      return false;
    }
  }

  // REMOVED: loadCoreData() - Data loading is now via API in initializeUI

  async function initializeUI() {
    if (!state.domReady) {
      console.warn("initializeUI: Skipping, DOM not ready.");
      return;
    }
    console.log("initializeUI: Initializing UI components...");
    showLoading(true, "Initializing interface..."); // Keep loader until options loaded

    try {
      updateCurrentYear();
      loadSavedColleges(); // Load saved items from localStorage

      // Fetch dropdown options from the backend
      const optionsLoaded = await fetchDropdownOptions();

      if (optionsLoaded) {
          setupEventListeners();
          updateResultsStatus(
              'Enter Rank, select Category, and click "Predict College".',
              "info"
          );
          if (dom.resultsSection) dom.resultsSection.style.display = "none";
          if (dom.paginationControls) dom.paginationControls.style.display = "none";
          if (dom.downloadButton) dom.downloadButton.disabled = true;
          updateSavedCountDisplay();
          console.log("initializeUI: Success.");
      } else {
          // Handle case where options failed to load
          updateResultsStatus("Failed to load initial filter options. Please refresh or contact support.", "error");
          disableForm(); // Keep form disabled
      }
    } catch (error) {
        logError("Error during UI initialization: " + error.message, error);
        disableForm();
    } finally {
        // Hide loading indicator *after* all initial setup attempts
        console.log("initializeUI: Hiding loader (finally block).");
        showLoading(false);
    }
  }

  // --- Main Execution Flow ---
  async function main() {
    if (!getDomElements()) {
        return; // Stop if essential DOM elements are missing
    }
    showLoading(true); // Show initial loading
    await initializeUI(); // Fetch options and set up UI

    // Optional: Timeout to hide loader if something unexpected hangs initialization
    setTimeout(() => {
        if (state.isLoading) {
            console.warn("Forcing loading indicator hide after timeout.");
            showLoading(false);
        }
    }, 15000); // Increased timeout as API calls are involved
  }

  // --- Core Functions ---

  // REMOVED: parseCsv() - Parsing happens on the backend
  // REMOVED: extractUniqueOptions() - Unique options come from the API

  // MODIFIED: Simplified populateSelect, assuming backend provides sorted options if needed
  function populateSelect(selectElement, options, sortDesc = false) {
    if (!selectElement) {
        console.warn("populateSelect called with null element");
        return;
    }
    const placeholder = selectElement.options[0] && selectElement.options[0].value === ""
        ? selectElement.options[0].cloneNode(true)
        : null;

    selectElement.innerHTML = ""; // Clear existing options

    if (placeholder) {
        selectElement.appendChild(placeholder);
    }

    // Backend should ideally provide sorted options. Client-side sort as fallback:
    let sortedOptions = [...options];
    // if (sortDesc) { // Example: if you still need specific client-side sorting
    //     sortedOptions.sort((a, b) => String(b).localeCompare(String(a), undefined, { numeric: true }));
    // } else {
    //     sortedOptions.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
    // }

    sortedOptions.forEach((optionValue) => {
        const option = document.createElement("option");
        option.value = optionValue;
        option.textContent = optionValue;
        selectElement.appendChild(option);
    });
  }

  // MODIFIED: populateChoicesSelect - relies on config.choicesOptions, assumes backend provides sorted options
  function populateChoicesSelect(selectElement, options, placeholderText = "Select...", sort = false) { // Default sort to false
    if (!selectElement || typeof Choices !== "function") {
        console.warn("populateChoicesSelect: Element or Choices library missing.");
        // Fallback to native select population if Choices fails
        if(selectElement) populateSelect(selectElement, options);
        return null;
    }

    // Destroy previous instance if exists
    const existingInstance = selectElement.choicesInstance;
    if (existingInstance) {
        try {
            existingInstance.destroy();
        } catch (e) {
            console.warn("Could not destroy previous Choices instance:", e);
        }
    }

    // Set placeholder option
    selectElement.innerHTML = `<option value="">${placeholderText}</option>`;

    // Populate options (assuming they are pre-sorted from backend)
    options.forEach((optionValue) => {
        const option = document.createElement("option");
        option.value = optionValue;
        option.textContent = optionValue;
        selectElement.appendChild(option);
    });

    let currentChoicesOptions = JSON.parse(JSON.stringify(config.choicesOptions || {}));
    currentChoicesOptions.placeholderValue = "";
    // Ensure sorting is explicitly off if backend handles it
    currentChoicesOptions.shouldSort = sort;

    try {
        const newChoicesInstance = new Choices(selectElement, currentChoicesOptions);
        selectElement.choicesInstance = newChoicesInstance; // Store instance reference
        return newChoicesInstance;
    } catch (error) {
        logError("Failed to initialize Choices.js on element: " + error.message, error);
        // Fallback to native select population if Choices fails
        populateSelect(selectElement, options);
        return null;
    }
  }

  function setupEventListeners() {
    // ... (Keep this function largely the same, ensure IDs match)
    console.log("Setting up event listeners...");
    try {
      if (dom.filterForm)
        dom.filterForm.addEventListener("submit", handleFormSubmit); // Still prevents default, calls new fetch function
      else console.warn("Filter form not found for submit listener.");

      if (dom.clearFiltersButton)
        dom.clearFiltersButton.addEventListener("click", handleClearFilters);
      else console.warn("Clear filters button not found.");

      // MODIFIED: Download button now triggers a specific API fetch or uses cached full data
      if (dom.downloadButton)
        dom.downloadButton.addEventListener("click", handleDownload);
      else console.warn("Download button not found.");

      if (dom.viewSavedButton)
        dom.viewSavedButton.addEventListener("click", showSavedCollegesModal);
      else console.warn("View Saved button (desktop) not found.");
      if (dom.viewSavedButtonMobile)
        dom.viewSavedButtonMobile.addEventListener(
          "click",
          showSavedCollegesModal
        );
      else console.warn("View Saved button (mobile) not found.");

      if (dom.clearSavedButton)
        dom.clearSavedButton.addEventListener("click", handleClearSaved); // Still clears localStorage
      else console.warn("Clear Saved button not found.");

      // Modal close buttons, background clicks - remain the same
      if (dom.modalCloseButtons && dom.modalCloseButtons.length > 0) {
        dom.modalCloseButtons.forEach((btn) =>
          btn.addEventListener("click", closeModal)
        );
      } else {
        console.warn("Modal close buttons not found.");
      }
      [dom.trendModal, dom.savedCollegesModal].forEach((modal) => {
        if (modal) {
          modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
          });
        } else {
          console.warn(`Modal element for background close not found.`);
        }
      });

      // Table actions (save, trend) - remain the same listener setup
      if (dom.resultsBody)
        dom.resultsBody.addEventListener("click", handleTableAction);
      else console.warn("Results table body not found for action listener.");

      // Mobile menu, header scroll, back-to-top - remain the same
      if (dom.mobileMenuToggle && dom.navMenu) {
        dom.mobileMenuToggle.addEventListener("click", () =>
          toggleMobileMenu()
        );
        document.addEventListener("click", (event) => {
          const navWrapper = document.querySelector(".mobile-nav-wrapper");
          if (
            navWrapper &&
            navWrapper.classList.contains("active") &&
            !navWrapper.contains(event.target) &&
            !dom.mobileMenuToggle.contains(event.target)
          ) {
            toggleMobileMenu(false);
          }
        });
      } else {
        console.warn("Mobile menu toggle or nav menu element not found.");
      }
      if (dom.header) {
        window.addEventListener("scroll", () => {
          dom.header.classList.toggle("header-scrolled", window.scrollY > 50);
        });
      }
      const backToTopButton = document.querySelector(".back-to-top");
      if (backToTopButton) {
        window.addEventListener("scroll", () => {
          backToTopButton.classList.toggle("visible", window.scrollY > 300);
        });
        backToTopButton.addEventListener("click", () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      }
      console.log("Event listeners setup complete.");
    } catch (error) {
      logError("Error setting up event listeners: " + error.message, error);
    }
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    console.log("Form submitted. Triggering API fetch.");
    // Keep basic validation
    clearFormErrors();
    if (!validateForm()) {
        updateResultsStatus("Please correct the highlighted errors.", "error");
        const firstErrorField = dom.filterForm.querySelector('[aria-invalid="true"], .input-error, .choices.input-error');
        firstErrorField?.focus();
        return;
    }
    // Call the new API fetch function for page 1
    fetchResultsFromAPI(1);
  }

  function handleClearFilters() {
    // ... (Keep this function largely the same - it resets form fields)
    console.log("Clearing filters...");
    if (!dom.filterForm) return;
    dom.filterForm.reset();
    // Reset Choices.js fields
    if (state.instituteChoices) {
      state.instituteChoices.clearStore();
      state.instituteChoices.clearInput();
      state.instituteChoices.setChoiceByValue(""); // Reset to placeholder
    }
    if (state.programChoices) {
      state.programChoices.clearStore();
      state.programChoices.clearInput();
      state.programChoices.setChoiceByValue(""); // Reset to placeholder
    }
    clearFormErrors();

    // Clear results state
    state.filteredData = []; // Clear current page data
    state.currentPage = 1;
    state.totalPages = 0;

    // Update UI
    if (dom.resultsBody) dom.resultsBody.innerHTML = ""; // Clear table body
    if (dom.resultsSection) dom.resultsSection.style.display = "none"; // Hide results
    if (dom.paginationControls) dom.paginationControls.innerHTML = ""; // Clear pagination
    if (dom.paginationControls) dom.paginationControls.style.display = "none"; // Hide pagination
    if (dom.downloadButton) dom.downloadButton.disabled = true; // Disable download

    updateResultsStatus(
      'Filters cleared. Enter Rank, select Category, and click "Predict College".',
      "info"
    );
    dom.rankInput?.focus(); // Focus rank input
    console.log("Filters cleared.");
  }

  // MODIFIED: handleDownload now triggers a separate fetch for all data
  function handleDownload() {
    console.log("Download requested...");
    if (state.totalPages === 0 || state.filteredData.length === 0) { // Check if any results were ever loaded
        alert("No results available to download.");
        return;
    }
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF || typeof window.jspdf.autoTable === 'undefined') {
        logError("jsPDF or jsPDF-AutoTable library not loaded correctly.", null);
        alert("Error: PDF generation library not loaded. Cannot download.");
        return;
    }

    // Trigger fetchResultsFromAPI with the 'fetchAllForDownload' flag
    // This will fetch *all* matching data from the backend
    fetchResultsFromAPI(1, true); // Page number doesn't matter here
    // The actual PDF generation will happen inside fetchResultsFromAPI's success handler for this specific call
  }

  // NEW: Separate function to generate PDF after fetching all data
  function generateAndDownloadPdf(allResultsData, filters) {
    console.log(`Generating PDF for ${allResultsData.length} results...`);
    if (allResultsData.length === 0) {
        alert("No data fetched for PDF generation.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    try {
        const headers = ["Institute", "Program", "Quota", "Seat Type", "Gender", "Year", "Round", "Opening Rank", "Closing Rank"];
        const body = allResultsData.map(row => [
            row.institute || "-",
            row.program_name || "-",
            row.quota || "-",
            row.seat_type || "-",
            row.gender || "-",
            row.year || "-",
            row.round || "-",
            row.opening_rank ?? "-", // Use ?? for null/undefined
            row.closing_rank ?? "-", // Use ?? for null/undefined
        ]);

        // Add title and filter info (same as before)
        doc.setFontSize(16);
        doc.text("College Prediction Results", 40, 40);
        doc.setFontSize(9);
        let filterText = `Rank: ${filters.rank || 'N/A'}, Category: ${filters.seatType}`;
        // Add other filters...
        if (filters.institute) filterText += `, Inst: ${filters.institute}`;
        if (filters.program) filterText += `, Prog: ${filters.program}`;
        // ... (add other active filters)
        doc.text(filterText, 40, 55, { maxWidth: doc.internal.pageSize.width - 80 });

        // Add table (same as before)
        doc.autoTable({
            head: [headers],
            body: body,
            startY: 70,
            theme: "grid",
            headStyles: { fillColor: [30, 41, 59], textColor: 255 },
            styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
            columnStyles: { /* Adjust widths as needed */
                 0: { cellWidth: 110 }, 1: { cellWidth: 130 }, /*...*/ 8: {cellWidth: 50}
            },
            didDrawPage: function (data) { // Footer
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text("Motivation Kaksha College Predictor", data.settings.margin.left, doc.internal.pageSize.height - 10);
                doc.text(`Page ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - data.settings.margin.right - 30, doc.internal.pageSize.height - 10);
            },
        });

        doc.save("MotivationKaksha_Predictions.pdf");
        console.log("PDF Generated successfully.");

    } catch (error) {
        logError("Error generating PDF: " + error.message, error);
        alert("An error occurred while generating the PDF. Please try again.");
    }
    // Loading state for the download button is handled in fetchResultsFromAPI's finally block
  }


  function handleTableAction(event) {
    const button = event.target.closest(".action-btn");
    if (!button) return;

    const action = button.dataset.action;
    const rowId = button.dataset.id; // This ID should be a unique identifier from the backend row data

    if (!rowId) {
        console.warn("Action button clicked without a data-id.");
        return;
    }
    console.log(`Table action '${action}' triggered for row ID: ${rowId}`);

    // Find the data for the clicked row *from the current page's data*
    const rowData = state.filteredData.find(row => String(row.id) === String(rowId)); // Ensure type match if needed

    switch (action) {
        case "view-trend":
            if (rowData) {
                showTrendModal(rowData); // Pass the row data directly
            } else {
                console.warn(`Data for row ID ${rowId} not found in current page data.`);
                // Optionally: Fetch the specific row data via API if needed, though less common for trends
                 alert("Could not find data for this row to show trend. It might be on another page.");
            }
            break;
        case "toggle-save":
            if (rowData) {
                toggleSaveCollege(rowData, button); // Pass rowData to save more details
            } else {
                 console.warn(`Data for row ID ${rowId} not found in current page data. Cannot toggle save state display correctly.`);
                 // Allow saving the ID anyway, but the button state might not update if row isn't visible
                 toggleSaveCollege({ id: rowId }, button); // Save at least the ID
            }
            break;
        case "remove-saved-item": // Action from the saved modal
             // Find the corresponding button in the main results table (if it exists on the current page)
             const mainTableButton = dom.resultsBody?.querySelector(`.save-btn[data-id="${rowId}"]`);
             // Call toggleSaveCollege to update localStorage and potentially the main button state
             toggleSaveCollege({ id: rowId }, mainTableButton); // Pass main button if found
             // Remove the item visually from the modal list
             button.closest(".saved-item")?.remove();
             // Update modal view if list becomes empty
             if (state.savedColleges.length === 0) {
                 updateSavedCollegesModalList();
             }
            break;
        default:
            console.warn("Unknown table action:", action);
    }
  }

  function toggleMobileMenu(forceState = null) {
    // ... (Keep this function exactly as it was)
    if (!dom.mobileMenuToggle || !dom.navMenu) return;
    const wrapper = document.querySelector(".mobile-nav-wrapper");
    if (!wrapper) {
      console.warn("Mobile nav wrapper not found.");
      return;
    }
    const isActive = wrapper.classList.contains("active");
    const shouldBeActive = forceState !== null ? forceState : !isActive;
    wrapper.classList.toggle("active", shouldBeActive);
    dom.mobileMenuToggle.classList.toggle("active", shouldBeActive);
    dom.mobileMenuToggle.setAttribute("aria-expanded", String(shouldBeActive));
    console.log("Mobile menu toggled:", shouldBeActive);
  }

  function scrollToResults() {
    // ... (Keep this function exactly as it was)
    if (dom.resultsSection && dom.resultsSection.style.display !== "none") {
      dom.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // --- Form Validation and Error Handling ---
  // Keep validateForm, displayError, clearError, clearFormErrors, disableForm
  // These are useful for client-side UX before hitting the API.
  function validateForm() {
    let isValid = true;
    clearFormErrors(); // Clear previous errors first

    // Rank validation
    if (!dom.rankInput || !dom.rankInput.value) {
        isValid = false;
        displayError(dom.rankInput, "Your Rank is required.");
    } else {
        const rankValue = parseInt(dom.rankInput.value, 10);
        if (isNaN(rankValue) || rankValue < 1) {
            isValid = false;
            displayError(dom.rankInput, "Please enter a valid positive rank number.");
        }
    }

    // Seat Type (Category) validation - Assuming this is mandatory
    if (!dom.seatTypeSelect || !dom.seatTypeSelect.value) {
        isValid = false;
        displayError(dom.seatTypeSelect, "Category is required.");
    }

    // Add other mandatory field checks if necessary

    console.log("Form validation result:", isValid);
    return isValid;
  }

  function displayError(fieldElement, message) {
    // ... (Keep this function exactly as it was)
     if (!fieldElement) return;
    const errorId = fieldElement.getAttribute("aria-describedby");
    let errorElement = errorId ? document.getElementById(errorId) : null;
    // Find sibling or ancestor's error message container if direct ID fails
    if (!errorElement) {
      errorElement = fieldElement.nextElementSibling;
      if (!errorElement || !errorElement.classList.contains("error-message")) {
        errorElement = fieldElement
          .closest(".filter-section") // Adjust selector if structure differs
          ?.querySelector(".error-message");
      }
    }
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block"; // Make sure it's visible
    } else {
      console.warn("Could not find error element for:", fieldElement.id);
      // Optionally add a fallback error display method here
    }
    fieldElement.setAttribute("aria-invalid", "true");
    // Handle Choices.js wrapper styling
    if (fieldElement.choicesInstance && fieldElement.parentElement.classList.contains("choices")) {
      fieldElement.parentElement.classList.add("input-error");
    } else {
      fieldElement.classList.add("input-error");
    }
  }

  function clearError(fieldElement) {
    // ... (Keep this function exactly as it was)
     if (!fieldElement) return;
    const errorId = fieldElement.getAttribute("aria-describedby");
    let errorElement = errorId ? document.getElementById(errorId) : null;
    // Find sibling or ancestor's error message container
    if (!errorElement) {
      errorElement = fieldElement.nextElementSibling;
      if (!errorElement || !errorElement.classList.contains("error-message")) {
        errorElement = fieldElement
          .closest(".filter-section")
          ?.querySelector(".error-message");
      }
    }
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.style.display = "none"; // Hide the error message
    }
    fieldElement.removeAttribute("aria-invalid");
    // Handle Choices.js wrapper styling
     if (fieldElement.choicesInstance && fieldElement.parentElement.classList.contains("choices")) {
      fieldElement.parentElement.classList.remove("input-error");
    } else {
      fieldElement.classList.remove("input-error");
    }
  }

  function clearFormErrors() {
    // ... (Keep this function exactly as it was)
     dom.filterForm
      ?.querySelectorAll(".input-error, [aria-invalid='true']")
      .forEach((el) => {
        // Check if it's a Choices.js wrapper or a standard input/select
        if (el.classList.contains("choices")) {
          const selectInside = el.querySelector("select");
          if (selectInside) clearError(selectInside);
        } else {
          clearError(el);
        }
      });
    // Also hide any general form error message container if you have one
    const formError = document.getElementById("form-error"); // Example ID
    if (formError) formError.style.display = "none";
  }

  function disableForm() {
    // ... (Keep this function exactly as it was)
    try {
      dom.filterForm
        ?.querySelectorAll("select, input, button")
        .forEach((el) => (el.disabled = true));
      // Disable Choices.js instances
      if (state.instituteChoices) state.instituteChoices.disable();
      if (state.programChoices) state.programChoices.disable();
      console.log("Form disabled.");
    } catch (e) {
      logError("Error disabling form: " + e.message, e);
    }
  }

  // REMOVED: filterAndDisplayResults() - Replaced by fetchResultsFromAPI()

  function getFilterValues() {
    // ... (Keep this function largely the same, but use state for Choices values)
    const rankValue = dom.rankInput?.value ? parseInt(dom.rankInput.value, 10) : null;
    const seatTypeValue = dom.seatTypeSelect?.value || ""; // Mandatory

    return {
      year: dom.yearSelect?.value || "",
      // Get value from Choices instance if available, otherwise fallback to select
      institute: (state.instituteChoices ? state.instituteChoices.getValue(true) : dom.instituteSelect?.value) || "",
      round: dom.roundSelect?.value || "",
      quota: dom.quotaSelect?.value || "",
      seatType: seatTypeValue, // Renamed from 'category' for clarity if needed
      gender: dom.genderSelect?.value || "",
      program: (state.programChoices ? state.programChoices.getValue(true) : dom.programSelect?.value) || "",
      rank: (rankValue && !isNaN(rankValue) && rankValue > 0) ? rankValue : null,
    };
  }

  // REMOVED: calculateLowerMargin() - This logic belongs on the backend (SQL query or API logic)
  // REMOVED: applyFilters() - Filtering and sorting happen on the backend

  // --- UI Updates ---

  // MODIFIED: updateResultsTable renders data from state.filteredData (current page)
  function updateResultsTable() {
    if (!dom.resultsBody) {
        logError("Cannot update results table: Table body element not found.", null);
        return;
    }
    console.log(`Updating results table for page ${state.currentPage}. Data count: ${state.filteredData.length}`);
    dom.resultsBody.innerHTML = ""; // Clear previous page results

    const pageData = state.filteredData; // Use the data fetched for the current page

    if (pageData.length === 0) {
        // Message is handled by updateResultsStatus based on total count
        console.log("No data for the current page/filter.");
        return;
    }

    const fragment = document.createDocumentFragment();
    pageData.forEach((row) => {
        // Generate a unique client-side ID if backend doesn't provide one suitable for direct use
        // Or better: Ensure backend sends a reliable unique 'id' field per row
        const rowId = row.id || `${row.institute}-${row.program_name}-${row.quota}-${row.seat_type}-${row.gender}-${row.year}-${row.round}`; // Fallback ID generation

        // Check if saved (using the consistent ID)
        const isSaved = state.savedColleges.some(saved => saved.id === rowId);

        const tr = document.createElement("tr");
        const detailsText = `${row.Quota} | ${row.seat_type} | ${row.Year} R${row.Round} | ${row.Gender}`;
        // Ensure all fields exist or provide defaults
        tr.innerHTML = `
            <td data-label="Institute & Details" title="${row.Institute || 'N/A'}\n${detailsText}">
                <div class="institute-name">${row.Institute|| 'N/A'}</div>
                <small class="row-details">${detailsText}</small>
            </td>
            <td data-label="Program Name" title="${row.program_name || 'N/A'}">${row.program_name || 'N/A'}</td>
            <td data-label="Opening Rank" class="rank-col">${row.opening_rank ?? '-'}</td>
            <td data-label="Closing Rank" class="rank-col">${row.closing_rank ?? '-'}</td>
            <td data-label="Actions" class="actions-col">
                <button class="action-btn trend-btn" data-action="view-trend" data-id="${rowId}" title="View Rank Trend" aria-label="View rank trend for ${row.institute} - ${row.program_name}">
                    <i class="fas fa-chart-line" aria-hidden="true"></i>
                </button>
                <button class="action-btn save-btn ${isSaved ? "saved" : ""}" data-action="toggle-save" data-id="${rowId}" title="${isSaved ? "Remove from Saved" : "Save this option"}" aria-label="${isSaved ? "Remove" : "Save"} ${row.institute} - ${row.program_name}">
                    <i class="${isSaved ? "fas fa-star" : "far fa-star"}" aria-hidden="true"></i>
                </button>
            </td>
        `;
        fragment.appendChild(tr);
    });
    dom.resultsBody.appendChild(fragment);
    console.log(`Rendered ${pageData.length} rows for page ${state.currentPage}.`);
  }

  // REMOVED: getPageData() - We only store the current page's data now

  // MODIFIED: renderPagination uses state.totalPages set by the API response
  function renderPagination() {
    // ... (Keep the rendering logic, but it uses state.totalPages)
    if (!dom.paginationControls) {
      console.warn("Pagination controls element not found.");
      return;
    }
    dom.paginationControls.innerHTML = ""; // Clear existing controls
    dom.paginationControls.style.display = state.totalPages > 1 ? "flex" : "none"; // Show only if multiple pages

    if (state.totalPages <= 1) return; // No need to render if only one page or less

    const maxPages = config.paginationMaxPagesToShow;
    const currentPage = state.currentPage;
    const totalPages = state.totalPages;

    const createButton = (text, pageNum, isActive = false, isDisabled = false, isEllipsis = false) => {
      const element = isEllipsis ? document.createElement("span") : document.createElement("button");
      element.className = isEllipsis ? "pagination-ellipsis" : "page-button";
      element.textContent = text;

      if (!isEllipsis) {
        element.type = "button";
        element.disabled = isDisabled;
        if (isActive) element.classList.add("active");
        if (!isDisabled && pageNum) {
          element.dataset.page = pageNum;
          // IMPORTANT: Attach event listener to call goToPage, which now fetches data
          element.addEventListener("click", () => goToPage(pageNum));
        }
        // Add ARIA labels for accessibility
        if (pageNum === currentPage - 1 && !isDisabled) element.setAttribute("aria-label", "Previous Page");
        else if (pageNum === currentPage + 1 && !isDisabled) element.setAttribute("aria-label", "Next Page");
        else if (pageNum && !isActive) element.setAttribute("aria-label", `Go to page ${pageNum}`);
        if (isActive) element.setAttribute("aria-current", "page");
      } else {
        element.setAttribute("aria-hidden", "true"); // Ellipsis is decorative
      }
      return element;
    };

    // Previous Button
    dom.paginationControls.appendChild(createButton("« Prev", currentPage - 1, false, currentPage === 1));

    // Page Number Buttons (with ellipsis logic)
    if (totalPages <= maxPages) {
      // Show all pages if total is less than or equal to max
      for (let i = 1; i <= totalPages; i++) {
        dom.paginationControls.appendChild(createButton(String(i), i, i === currentPage));
      }
    } else {
      // Complex case: Use ellipsis
      const wingSize = Math.max(1, Math.floor((maxPages - 3) / 2)); // Pages around current page (-1 for first, -1 for last, -1 for current = -3)
      const showStartEllipsis = currentPage > 2 + wingSize;
      const showEndEllipsis = currentPage < totalPages - 1 - wingSize;

      // First page
      dom.paginationControls.appendChild(createButton("1", 1, 1 === currentPage));

      // Start ellipsis
      if (showStartEllipsis) {
        dom.paginationControls.appendChild(createButton("...", null, false, true, true));
      }

      // Calculate page range to display
      let startPage = Math.max(2, currentPage - wingSize);
      let endPage = Math.min(totalPages - 1, currentPage + wingSize);

      // Adjust range if near the beginning or end
      if (currentPage <= 1 + wingSize) { // Near start
         endPage = Math.min(totalPages - 1, maxPages - 2); // Show enough pages towards the end
      }
      if (currentPage >= totalPages - wingSize) { // Near end
         startPage = Math.max(2, totalPages - maxPages + 3); // Show enough pages towards the start
      }


      // Middle page numbers
      for (let i = startPage; i <= endPage; i++) {
        dom.paginationControls.appendChild(createButton(String(i), i, i === currentPage));
      }

      // End ellipsis
      if (showEndEllipsis) {
        dom.paginationControls.appendChild(createButton("...", null, false, true, true));
      }

      // Last page
      dom.paginationControls.appendChild(createButton(String(totalPages), totalPages, totalPages === currentPage));
    }

    // Next Button
    dom.paginationControls.appendChild(createButton("Next »", currentPage + 1, false, currentPage === totalPages));

    console.log(`Pagination rendered for ${totalPages} pages.`);
  }

  // MODIFIED: goToPage now fetches data for the target page via API
  function goToPage(pageNum) {
    if (pageNum < 1 || pageNum > state.totalPages || pageNum === state.currentPage) {
      console.log(`goToPage: Invalid page number ${pageNum} or already on page.`);
      return; // Don't fetch if invalid or same page
    }
    console.log(`Navigating to page ${pageNum}. Fetching data...`);
    // Don't update state.currentPage here yet. Let fetchResultsFromAPI handle it on success.
    fetchResultsFromAPI(pageNum);
    // Optional: Scroll to top of results after page change is initiated
     if (dom.resultsSection.style.display === "block") {
      // Maybe scroll slightly less aggressively than on initial submit
      // dom.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      window.scrollTo({ top: dom.resultsSection.offsetTop - (dom.header?.offsetHeight || 70), behavior: 'smooth' });
     }
  }

  function setButtonLoading(button, isLoading, loadingText = null) {
    // ... (Keep this function exactly as it was)
    if (!button) return;
    if (isLoading) {
      button.classList.add("btn--loading");
      button.disabled = true;
      if (!button.dataset.originalContent) {
        button.dataset.originalContent = button.innerHTML; // Store original content
      }
      // Set loading content (spinner or text)
      button.innerHTML = loadingText
        ? `<span>${loadingText}</span>`
        : '<span class="btn-spinner"></span>'; // Use your spinner class
    } else {
      button.classList.remove("btn--loading");
      button.disabled = false;
      // Restore original content if stored
      if (button.dataset.originalContent) {
        button.innerHTML = button.dataset.originalContent;
        delete button.dataset.originalContent; // Clean up dataset
      }
    }
  }

  function updateResultsStatus(message, type = "info") {
    // ... (Keep this function exactly as it was)
    if (!dom.resultsStatus) return;
    dom.resultsStatus.textContent = message;
    // Reset classes and apply the correct one
    dom.resultsStatus.className = "message"; // Base class
    switch (type) {
      case "error":
        dom.resultsStatus.classList.add("error-message"); // Your error style class
        break;
      case "success":
        dom.resultsStatus.classList.add("success-message"); // Your success style class
        break;
      case "info":
      default:
        dom.resultsStatus.classList.add("info-message"); // Your info style class
        break;
    }
    // Ensure status is visible only when results section is
    dom.resultsStatus.style.display = dom.resultsSection?.style.display === "block" ? "block" : "none";
  }

  function updateCurrentYear() {
    // ... (Keep this function exactly as it was)
    if (dom.currentYearSpan) {
      dom.currentYearSpan.textContent = new Date().getFullYear();
    }
  }

  function updateSavedCountDisplay() {
    // ... (Keep this function exactly as it was)
    const count = state.savedColleges.length;
    if (dom.savedCountSpan) dom.savedCountSpan.textContent = String(count);
    if (dom.savedCountSpanMobile) dom.savedCountSpanMobile.textContent = String(count);

    // Add/remove class for visual indication (e.g., highlight button if count > 0)
    dom.viewSavedButton?.classList.toggle("has-saved-items", count > 0);
    dom.viewSavedButtonMobile?.classList.toggle("has-saved-items", count > 0);
  }

  // --- Trend Modal ---

  // MODIFIED: showTrendModal takes rowData object and calls API
  async function showTrendModal(rowData) {
    // Check prerequisites (libs, DOM elements)
    if (typeof Chart === 'undefined') {
        logError("Chart.js library is not loaded.", null);
        alert("Could not display trend: Charting library missing.");
        return;
    }
    if (!dom.trendModal || !dom.trendInfo || !dom.trendModalTitle || !dom.trendError || !dom.trendChartCanvas) {
        logError("Trend modal DOM elements are missing.", null);
        return;
    }
    if (!rowData || !rowData.Institute || !rowData.program_name) { // Use Institute (capital I)
      logError("Invalid row data provided for trend modal.", null);
      return;
    }

    
    const cleanRowData = {
        institute: rowData.institute || rowData.Institute,
        program_name: rowData.program_name,
        quota: rowData.quota || rowData.Quota,
        seat_type: rowData.seat_type,
        gender: rowData.gender || rowData.Gender,
        round: rowData.round || rowData.Round,
        year: rowData.year || rowData.Year
    };

    // Show modal elements immediately, display loading state
    dom.trendModalTitle.textContent = `Loading Trend Data...`;
    dom.trendInfo.innerHTML = `
        <strong>Institute:</strong> ${cleanRowData.institute}<br>
        <strong>Program:</strong> ${cleanRowData.program_name}<br>
        <strong>Details:</strong> ${cleanRowData.quota} | ${cleanRowData.seat_type} | 
        ${cleanRowData.gender} | Round ${cleanRowData.round}
    `;
    dom.trendError.textContent = "";
    dom.trendError.style.display = "none";
    dom.trendChartCanvas.style.display = "none"; // Hide chart initially
    if (state.trendChartInstance) { // Destroy old chart if exists
        try { state.trendChartInstance.destroy(); } catch (e) {}
        state.trendChartInstance = null;
    }
    dom.trendModal.classList.add("show");
    dom.trendModal.style.display = "flex";
    dom.trendModal.setAttribute("aria-hidden", "false");
    dom.trendModal.querySelector(".modal-close")?.focus();

    // Get user rank from input
    const currentUserRank = dom.rankInput?.value ? parseInt(dom.rankInput.value, 10) : null;
    const validUserRank = (currentUserRank && !isNaN(currentUserRank) && currentUserRank > 0) ? currentUserRank : null;

    // Fetch trend data from API
    const trendDataPoints = await fetchTrendDataFromAPI(cleanRowData);

    // Update modal content after data arrives
    dom.trendModalTitle.textContent = `Closing Rank Trend`; // Set final title

    if (!trendDataPoints || trendDataPoints.length === 0) {
        console.log("No trend data received from API or API call failed.");
        dom.trendError.textContent = "No historical trend data available for this specific combination.";
        dom.trendError.style.display = "block";
        dom.trendChartCanvas.style.display = "none";
    } else {
        // Check if there's enough data to plot (at least one point needed if user rank is present)
        const validHistoricalPoints = trendDataPoints.filter(p =>
            (p.opening_rank != null && p.opening_rank !== '-') ||
            (p.closing_rank != null && p.closing_rank !== '-')
        ).length;

        if (validHistoricalPoints === 0 && !validUserRank) {
             console.log("Not enough valid historical points and no user rank.");
             dom.trendError.textContent = "Not enough historical data points available.";
             dom.trendError.style.display = "block";
             dom.trendChartCanvas.style.display = "none";
        } else if (validHistoricalPoints < 2 && !validUserRank) {
             console.log("Only one data point, showing info instead of line chart");
             // Optionally display the single data point info instead of an error
             const point = trendDataPoints[0];
             dom.trendError.innerHTML = `Only one data point found for ${point.year}:<br> Opening: ${point.opening_rank ?? '-'}, Closing: ${point.closing_rank ?? '-'}`;
             dom.trendError.style.display = "block";
             dom.trendChartCanvas.style.display = "none";
        } else {
             console.log("Sufficient data found. Rendering trend chart.");
             dom.trendError.style.display = "none";
             dom.trendChartCanvas.style.display = "block";
             renderTrendChart(trendDataPoints, validUserRank, rowData); // Pass original rowData for context if needed
        }
    }
}


  // MODIFIED: renderTrendChart takes data from API, parses ranks carefully
  function renderTrendChart(apiData, userRank, baseRowData) { // Added baseRowData for context
    console.log("Rendering trend chart. API Data:", apiData, "User Rank:", userRank);
    if (typeof Chart === 'undefined' || !dom.trendChartCanvas) {
        logError("Chart.js library or canvas element not available.", null);
        return;
    }

    const ctx = dom.trendChartCanvas.getContext("2d");

    // Destroy previous chart instance if it exists
    if (state.trendChartInstance) {
        try {
            state.trendChartInstance.destroy();
        } catch (e) {
            console.warn("Error destroying previous chart instance:", e);
        }
        state.trendChartInstance = null;
    }

    // Prepare data for Chart.js
    const labels = apiData.map(item => item.year).sort((a, b) => a - b); // Ensure years are sorted

    // Helper to parse rank values robustly (handles null, undefined, '-', 'P', etc.)
    const parseRank = (rankValue) => {
        if (rankValue === null || rankValue === undefined || String(rankValue).trim() === "-") {
            return null; // Treat '-', null, undefined as missing data for the chart
        }
        const rankStr = String(rankValue).replace("P", "").trim(); // Remove 'P' if present
        const rank = parseInt(rankStr, 10);
        return isNaN(rank) ? null : rank; // Return null if parsing fails
    };

    const openingRanks = labels.map(year => {
        const point = apiData.find(item => item.year == year);
        return point ? parseRank(point.opening_rank) : null;
    });
    const closingRanks = labels.map(year => {
        const point = apiData.find(item => item.year == year);
        return point ? parseRank(point.closing_rank) : null;
    });

    // Check if there's any valid data to plot
    const hasOpeningData = openingRanks.some(r => r !== null);
    const hasClosingData = closingRanks.some(r => r !== null);

    if (!hasOpeningData && !hasClosingData && userRank === null) {
        logError("No valid rank data or user rank found for trend chart.", null);
        if (dom.trendError) {
            dom.trendError.textContent = "No rank data available for this trend.";
            dom.trendError.style.display = "block";
        }
        dom.trendChartCanvas.style.display = "none";
        return; // Stop rendering if no data at all
    } else {
         // Ensure error is hidden and canvas is shown if we proceed
         if (dom.trendError) dom.trendError.style.display = "none";
         dom.trendChartCanvas.style.display = "block";
    }


    const datasets = [];
    // Add Opening Rank dataset if data exists
    if (hasOpeningData) {
        datasets.push({
            label: "Opening Rank",
            data: openingRanks,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.1,
            fill: false,
            spanGaps: false, // Don't connect points with null data between them
            pointStyle: 'circle',
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: "rgb(59, 130, 246)",
        });
    }

    // Add Closing Rank dataset if data exists
    if (hasClosingData) {
        datasets.push({
            label: "Closing Rank",
            data: closingRanks,
            borderColor: "rgb(245, 158, 11)",
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            tension: 0.1,
            fill: false,
            spanGaps: false,
            pointStyle: 'rect',
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: "rgb(245, 158, 11)",
        });
    }

    // Add User Rank line if provided
    if (userRank !== null) {
        datasets.push({
            label: "Your Rank",
            data: Array(labels.length).fill(userRank), // Straight line at user's rank
            borderColor: config.userRankLineColor || "rgb(239, 68, 68)",
            backgroundColor: "transparent",
            borderWidth: 2,
            borderDash: [5, 5], // Dashed line
            pointRadius: 0, // No points on this line
            tension: 0,
            fill: false,
        });
    }

    // Set Chart.js defaults (colors, etc.) - same as before
    Chart.defaults.color = 'var(--text-secondary)'; // Use your CSS variables
    Chart.defaults.borderColor = 'rgba(203, 213, 225, 0.2)'; // Use your CSS variables

    // Create the chart instance
    try {
        state.trendChartInstance = new Chart(ctx, {
            type: "line",
            data: { labels: labels, datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { // Y-axis configuration (Rank)
                        title: { display: true, text: "Rank", color: 'var(--text-primary)' },
                        ticks: {
                             color: 'var(--text-secondary)',
                             // Format large numbers (e.g., 15000 -> 15k)
                             callback: function(value) {
                                 if (value >= 1000000) return (value / 1000000) + 'M';
                                 if (value >= 1000) return (value / 1000) + 'k';
                                 return value;
                             }
                        },
                        grid: { color: 'rgba(203, 213, 225, 0.15)', borderColor: 'rgba(203, 213, 225, 0.2)' },
                    },
                    x: { // X-axis configuration (Year)
                        title: { display: true, text: "Year", color: 'var(--text-primary)' },
                        ticks: { color: 'var(--text-secondary)' },
                        grid: { color: 'rgba(203, 213, 225, 0.15)', borderColor: 'rgba(203, 213, 225, 0.2)' },
                    },
                },
                plugins: {
                    legend: { position: "top", labels: { color: 'var(--text-primary)' } },
                    tooltip: {
                        backgroundColor: 'var(--dark-gray)', // Use CSS vars
                        titleColor: 'var(--yellow)',
                        bodyColor: 'var(--text-primary)',
                        borderColor: 'var(--medium-gray)',
                        borderWidth: 1,
                        // Filter out 'Your Rank' from tooltips
                        filter: function(tooltipItem) {
                           return tooltipItem.dataset.label !== 'Your Rank';
                        },
                        callbacks: {
                            // Display original rank string (e.g., with 'P') in tooltip
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label === 'Your Rank') return null; // Skip 'Your Rank' line

                                if (label) { label += ': '; }

                                // Find the original data point for the hovered year
                                const yearLabel = context.label;
                                const originalDataPoint = apiData.find(d => d.year == yearLabel);
                                let originalRank = '-'; // Default if not found

                                if (originalDataPoint) {
                                    originalRank = (context.dataset.label === 'Opening Rank')
                                        ? (originalDataPoint.opening_rank ?? '-') // Use original value
                                        : (originalDataPoint.closing_rank ?? '-'); // Use original value
                                }
                                label += originalRank;
                                return label;
                            }
                        }
                    },
                },
                interaction: { mode: 'index', intersect: false }, // Show tooltips for all datasets on hover
            },
        });
        console.log("Chart rendered successfully.");
    } catch (chartError) {
        logError("Error rendering Chart:" + chartError.message, chartError);
        if (dom.trendError) {
            dom.trendError.textContent = "Failed to render chart.";
            dom.trendError.style.display = "block";
        }
        dom.trendChartCanvas.style.display = "none";
    }
  }

  // --- Save/Favorite System ---
  // Keep loadSavedColleges, saveCollegesToStorage.
  // MODIFIED: toggleSaveCollege stores more info.
  // MODIFIED: updateSavedCollegesModalList uses stored info.
  // Keep handleClearSaved.

  function loadSavedColleges() {
    try {
      const saved = localStorage.getItem(config.localStorageKey);
      // Parse JSON, ensure it's an array, default to empty array if invalid
      state.savedColleges = saved ? (Array.isArray(JSON.parse(saved)) ? JSON.parse(saved) : []) : [];
      console.log(`loadSavedColleges: Loaded ${state.savedColleges.length} items.`);
       // Basic validation of loaded items (check for required 'id' field)
       state.savedColleges = state.savedColleges.filter(item => item && item.id);
       if (saved && state.savedColleges.length !== JSON.parse(saved).length) {
           console.warn("Some invalid items removed from saved colleges during load.");
           saveCollegesToStorage(); // Re-save the cleaned list
       }
    } catch (error) {
      logError("Error loading saved colleges from localStorage: " + error.message, error);
      state.savedColleges = []; // Reset to empty array on error
      try { // Attempt to clear potentially corrupted data
        localStorage.removeItem(config.localStorageKey);
      } catch (removeError) {
        console.error("Failed to remove corrupt localStorage item:", removeError);
      }
    }
  }

  function saveCollegesToStorage() {
    try {
      // Ensure we are saving an array of objects with at least an 'id'
      const validSavedColleges = state.savedColleges.filter(item => item && item.id);
      localStorage.setItem(config.localStorageKey, JSON.stringify(validSavedColleges));
      console.log(`${validSavedColleges.length} saved items stored.`);
      if (validSavedColleges.length !== state.savedColleges.length) {
          console.warn("Attempted to save invalid items. Only valid items stored.");
          state.savedColleges = validSavedColleges; // Update state to match storage
      }
    } catch (e) {
      logError("Error saving to localStorage: " + e.message, e);
      // Alert user about potential storage issue
      alert("Could not save changes. Local storage might be full or disabled.");
    }
  }

  // MODIFIED: Now stores an object with key details, not just the ID
  function toggleSaveCollege(rowData, buttonElement) {
      if (!rowData || !rowData.id) {
          console.warn("toggleSaveCollege called with invalid rowData or missing ID.");
          return;
      }

      const rowId = rowData.id;
      const index = state.savedColleges.findIndex(item => item.id === rowId);
      let wasSaved = index > -1;

      if (wasSaved) {
          // Remove from saved list
          state.savedColleges.splice(index, 1);
          console.log(`Removed saved item: ${rowId}`);
      } else {
          // Add to saved list - store key details for modal display
          const savedItem = {
              id: rowData.id,
              institute: rowData.institute || "N/A",
              program_name: rowData.program_name || "N/A",
              quota: rowData.quota || "N/A",
              seat_type: rowData.seat_type || "N/A",
              gender: rowData.gender || "N/A",
              year: rowData.year || "N/A",
              round: rowData.round || "N/A",
              opening_rank: rowData.opening_rank ?? "-",
              closing_rank: rowData.closing_rank ?? "-",
          };
          state.savedColleges.push(savedItem);
          console.log(`Saved item:`, savedItem);
      }

      saveCollegesToStorage(); // Persist changes to localStorage
      updateSavedCountDisplay(); // Update counter in header/nav

      // Update the button's visual state (if buttonElement is provided)
      if (buttonElement) {
          const icon = buttonElement.querySelector("i");
          buttonElement.classList.toggle("saved", !wasSaved);
          buttonElement.title = !wasSaved ? "Remove from Saved" : "Save this option";

          // Update ARIA label for accessibility
          const currentAriaLabel = buttonElement.getAttribute("aria-label") || "";
          // Attempt to preserve the base name if possible
          const baseAriaLabel = currentAriaLabel.replace(/^(Save|Remove)\s*/, "").trim() || `${rowData.institute} - ${rowData.program_name}`;
          buttonElement.setAttribute("aria-label", `${!wasSaved ? "Remove" : "Save"} ${baseAriaLabel}`);

          // Update icon class
          if (icon) {
              icon.classList.toggle("fas", !wasSaved); // Solid star when saved
              icon.classList.toggle("far", wasSaved); // Regular star when not saved
          }
      }
  }


  function showSavedCollegesModal() {
    // ... (Keep this function exactly as it was)
    if (!dom.savedCollegesModal) {
      logError("Saved colleges modal element not found.", null);
      return;
    }
    updateSavedCollegesModalList(); // Populate the list before showing
    dom.savedCollegesModal.classList.add("show");
    dom.savedCollegesModal.style.display = "flex"; // Or block, depending on CSS
    dom.savedCollegesModal.setAttribute("aria-hidden", "false");
    // Focus the close button or the list container for accessibility
    dom.savedCollegesModal.querySelector(".modal-close")?.focus();
  }

  // MODIFIED: Uses the detailed objects stored in state.savedColleges
  function updateSavedCollegesModalList() {
    if (!dom.savedCollegesList || !dom.clearSavedButton) {
        logError("Saved colleges list or clear button element not found in modal.", null);
        return;
    }
    dom.savedCollegesList.innerHTML = ""; // Clear current list

    if (state.savedColleges.length === 0) {
        dom.savedCollegesList.innerHTML = `<p class="no-saved-message">You haven't saved any college options yet.</p>`;
        dom.clearSavedButton.style.display = "none"; // Hide clear button if empty
        return;
    }

    // Show clear button if list has items
    dom.clearSavedButton.style.display = "block"; // Or "inline-block", etc.

    const fragment = document.createDocumentFragment();
    state.savedColleges.forEach((savedData) => {
        // Now 'savedData' is the object with details stored via toggleSaveCollege
        const itemDiv = document.createElement("div");
        itemDiv.className = "saved-item"; // CSS class for styling saved items

        // Construct inner HTML using the stored details
        // Use nullish coalescing (??) or || for default values
        const detailsLine1 = `${savedData.quota ?? 'N/A'} | ${savedData.seat_type ?? 'N/A'} | ${savedData.gender ?? 'N/A'}`;
        const detailsLine2 = `Year: ${savedData.year ?? 'N/A'} R${savedData.round ?? 'N/A'} | Rank: ${savedData.opening_rank ?? '-'} - ${savedData.closing_rank ?? '-'}`;

        itemDiv.innerHTML = `
            <div class="saved-item-details">
                <strong>${savedData.institute ?? 'Unknown Institute'}</strong>
                <span>${savedData.program_name ?? 'Unknown Program'}</span>
                <small>${detailsLine1}</small>
                <small>${detailsLine2}</small>
            </div>
            <button class="action-btn remove-saved-btn" data-action="remove-saved-item" data-id="${savedData.id}" title="Remove this saved option" aria-label="Remove ${savedData.institute} - ${savedData.program_name}">
                <i class="fas fa-trash-alt" aria-hidden="true"></i>
            </button>
        `;

        // Add event listener *directly* to the remove button inside the modal item
        const removeButton = itemDiv.querySelector(".remove-saved-btn");
        if(removeButton){
            removeButton.addEventListener("click", handleTableAction);
        }

        fragment.appendChild(itemDiv);
    });

    dom.savedCollegesList.appendChild(fragment);
  }


  function handleClearSaved() {
    // ... (Keep this function exactly as it was, but ensure it updates UI correctly)
     if (state.savedColleges.length === 0) return; // Nothing to clear

    // Confirmation dialog
    if (confirm("Are you sure you want to clear ALL saved college options? This cannot be undone.")) {
        console.log("Clearing all saved colleges.");
        const clearedIds = state.savedColleges.map(item => item.id); // Get IDs before clearing

        // Clear state and storage
        state.savedColleges = [];
        saveCollegesToStorage();

        // Update UI elements
        updateSavedCollegesModalList(); // Clears the modal list display
        updateSavedCountDisplay(); // Resets the counter in nav/header

        // Update buttons in the main results table (if they are currently visible)
        clearedIds.forEach((id) => {
            const btn = dom.resultsBody?.querySelector(`.action-btn.save-btn[data-id="${id}"]`);
            // If the button exists and is marked as 'saved', toggle its state visually
            if (btn && btn.classList.contains("saved")) {
                 // We don't have the full rowData here easily, but can still update the button state
                 toggleSaveCollege({ id: id }, btn); // This will set it to unsaved state
            }
        });

        console.log("All saved colleges cleared.");
        // Optional: Show a confirmation message to the user
        // alert("All saved options cleared.");
    }
  }

  // --- Modal Handling ---
  function closeModal() {
    // ... (Keep this function exactly as it was)
    console.log("Closing modal...");
    const modals = document.querySelectorAll(".modal.show"); // Find all currently shown modals
    modals.forEach((modal) => {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true"); // Hide from screen readers

        // Delay hiding with display:none to allow fade-out animation
        setTimeout(() => {
            modal.style.display = "none";

            // Specific cleanup for trend modal: Destroy chart instance
            if (modal.id === "trend-modal" && state.trendChartInstance) {
                try {
                    state.trendChartInstance.destroy();
                    state.trendChartInstance = null; // Clear reference
                    console.log("Trend chart instance destroyed.");
                } catch (e) {
                    console.warn("Error destroying chart instance on modal close:", e);
                }
            }
        }, 300); // Match animation duration (e.g., 0.3s)
    });
  }

  // --- Start Application ---
  main(); // Initialize the application

}); // End DOMContentLoaded