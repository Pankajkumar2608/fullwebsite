// Cache DOM elements
const elements = {
  yearSelect: document.getElementById('year'),
  roundNoSelect: document.getElementById('round_no'),
  quotaSelect: document.getElementById('quota'),
  seatTypeSelect: document.getElementById('seat_type'),
  genderSelect: document.getElementById('gender'),
  programNameSelect: document.getElementById('program_name'),
  searchInput: document.getElementById('collegeSearch'),
  suggestionsList: document.getElementById('suggestions'),
  submitBtn: document.getElementById('submit-btn'),
  downloadBtn: document.getElementById('downloadBtn'),
  resultBody: document.getElementById('result-body'),
  yourRank: document.getElementById('your_rank')
};

// Constants
const CONFIG = {
  itemsPerPage: 1000,
  apiEndpoint: 'https://60cc5f2b-203d-486f-88f9-53a070052c8e-00-210snj9zzv69v.pike.replit.dev',
  debounceDelay: 300,
  pdfConfig: {
    headerColor: [230, 203, 48],
    textColor: [0, 0, 0],
    rowHeight: 10
  }
};

// State management
const state = {
  filteredData: [],
  currentPage: 1
};

// Initialize the application
document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
  setupFilterOptions();
  setupEventListeners();
  setupSearchAutocomplete();
}

function setupFilterOptions() {
  const options = {
    years: ['2024', '2023', '2022', '2021'],
    quota: ['AI', 'OS', 'HS'],
    seatType: ['OPEN', 'OPEN (PwD)', 'EWS', 'EWS (PwD)', 'OBC-NCL', 'OBC-NCL (PwD)', 'SC', 'SC (PwD)', 'ST', 'ST (PwD)'],
    gender: ['Gender-Neutral', 'Female-only (including Supernumerary)'],
    programs: [
      'Civil Engineering (4 Years, Bachelor of Technology)',
      'Civil Engineering and M. Tech. in Structural Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))',
      'Aerospace Engineering (4 Years, Bachelor of Technology)',
      'chemical',
      'Computer Science and Engineering (4 Years, Bachelor of Technology)',
      'Electrical Engineering (4 Years, Bachelor of Technology)',
      'Electronics and Communication Engineering (4 Years, Bachelor of Technology)',
      'mechanical',
      'metallurgical',
      'biotechnology',
      'Engineering Physics (4 Years, Bachelor of Technology)',
      'Mathematics (4 Years, Bachelor of Technology)',
      'chemistry',
      'environmental',
      'management',
      'humanities'
    ]
  };

  populateSelect(elements.yearSelect, options.years);
  populateSelect(elements.quotaSelect, options.quota);
  populateSelect(elements.seatTypeSelect, options.seatType);
  populateSelect(elements.genderSelect, options.gender);
  populateSelect(elements.programNameSelect, options.programs);

  // Handle year-specific round numbers
  elements.yearSelect.addEventListener('change', () => {
    const rounds = elements.yearSelect.value === '2024' ? ['1', '2', '3', '4', '5'] : ['1', '2', '3', '4', '5', '6'];
    populateSelect(elements.roundNoSelect, rounds);
  });
  populateSelect(elements.roundNoSelect, ['1', '2', '3', '4', '5']);
}

function setupEventListeners() {
  elements.submitBtn.addEventListener("click", handleSubmit);
  elements.downloadBtn.addEventListener("click", handleDownload);
}

// Set up search autocomplete with debouncing
function setupSearchAutocomplete() {
  const debounceTimeout = {
    id: null
  };

  elements.searchInput.addEventListener('input', () => {
    const searchTerm = elements.searchInput.value.trim();
    
    if (searchTerm.length < 2) {
      elements.suggestionsList.innerHTML = '';
      return;
    }

    clearTimeout(debounceTimeout.id);
    debounceTimeout.id = setTimeout(async () => {
      try {
        const response = await fetch(`${CONFIG.apiEndpoint}/suggest?term=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const suggestions = await response.json();
        elements.suggestionsList.innerHTML = suggestions
          .map(suggestion => `<li class="suggestion-item">${suggestion}</li>`)
          .join('');
      } catch (error) {
        console.error('Search suggestion error:', error);
        elements.suggestionsList.innerHTML = '';
      }
    }, CONFIG.debounceDelay);
  });

  elements.suggestionsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('suggestion-item')) {
      elements.searchInput.value = e.target.textContent;
      elements.suggestionsList.innerHTML = '';
    }
  });
}

async function handleSubmit() {
  const formData = {
    Year: elements.yearSelect.value,
    institute: elements.searchInput.value,
    round: elements.roundNoSelect.value,
    quota: elements.quotaSelect.value,
    SeatType: elements.seatTypeSelect.value,
    gender: elements.genderSelect.value,
    AcademicProgramName: elements.programNameSelect.value,
    userRank: elements.yourRank.value
  };

  // Validation
  const requiredFields = ['Year', 'quota', 'SeatType', 'gender', 'userRank'];
  const missingField = requiredFields.find(field => !formData[field]);
  if (missingField) {
    alert(`Please enter ${missingField.toLowerCase()}`);
    return;
  }

  // Show loading state
  elements.resultBody.innerHTML = '<tr><td colspan="4"><img src="https://media.tenor.com/LMz_TrIOxV8AAAAM/mr-bean-mrbean.gif" alt="Loading..."></td></tr>';

  try {
    const response = await axios.post(`${CONFIG.apiEndpoint}/filter`, formData);
    state.filteredData = response.data.filterData || [];
    
    if (state.filteredData.length === 0) {
      elements.resultBody.innerHTML = '<tr><td colspan="4">No results found</td></tr>';
      return;
    }

    state.currentPage = 1;
    updateResultTable(getPageData());
  } catch (error) {
    console.error('Filter error:', error);
    elements.resultBody.innerHTML = '<tr><td colspan="4">Error fetching data. Please try again.</td></tr>';
  }
}

function getPageData() {
  const startIndex = (state.currentPage - 1) * CONFIG.itemsPerPage;
  const endIndex = startIndex + CONFIG.itemsPerPage;
  return state.filteredData.slice(startIndex, endIndex);
}

function updateResultTable(data) {
  if (!Array.isArray(data)) {
    console.error('Invalid data format:', data);
    return;
  }

  elements.resultBody.innerHTML = data
    .map(item => `
      <tr>
        <td>${item.institute || ''}</td>
        <td>${item['Academic Program Name'] || ''}</td>
        <td>${item['Opening Rank'] || ''}</td>
        <td>${item['Closing Rank'] || ''}</td>
      </tr>
    `)
    .join('');
}

function handleDownload() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Helper function for text wrapping
    const splitText = (text, maxWidth) => doc.splitTextToSize(text || '', maxWidth);

    // Header
    doc.setFillColor(...CONFIG.pdfConfig.headerColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255);
    doc.setFontSize(24);
    doc.text('Motivation Kaksha- College Predictor', 15, 20);
    doc.setFontSize(14);
    doc.text(`College Predictor Results - Rank: ${elements.yourRank.value}`, 15, 35);

    // Table headers
    doc.setTextColor(...CONFIG.pdfConfig.textColor);
    doc.setFillColor(...CONFIG.pdfConfig.headerColor);
    doc.rect(10, 45, pageWidth - 20, 10, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    
    const headers = ['Institute Name', 'Program Name', 'Opening', 'Closing'];
    const headerPositions = [15, 70, 140, 170];
    headers.forEach((header, i) => doc.text(header, headerPositions[i], 52));

    // Content
    let y = 65;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    state.filteredData.forEach((item, index) => {
      if (y > 280) {
        doc.addPage();
        y = 30;
      }

      // Alternate row backgrounds
      if (index % 2 === 0) {
        doc.setFillColor(252, 252, 252);
        doc.rect(10, y - 5, pageWidth - 20, CONFIG.pdfConfig.rowHeight, 'F');
      }

      const institute = splitText(item.institute, 50);
      const program = splitText(item['Academic Program Name'], 65);
      
      doc.text(institute, 15, y);
      doc.text(program, 70, y);
      doc.text(String(item['Opening Rank']), 140, y);
      doc.text(String(item['Closing Rank']), 170, y);

      y += Math.max(institute.length, program.length) * 5 + 5;
    });

    // Footer
    addFooter(doc);
    
    doc.save('college-predictor-results-by-motivationkaksha.pdf');
  } catch (error) {
    console.error('PDF Generation Error:', error);
    alert('Error generating PDF. Please try again.');
  }
}

function addFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, 190, 290, null, null, 'right');
    doc.text('Generated by Motivation Kaksha Predictor made by pankaj', 15, 290);
  }
}

function populateSelect(select, options) {
  select.innerHTML = '<option value="">Select</option>' + 
    options.map(option => `<option value="${option}">${option}</option>`).join('');
}