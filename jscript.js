let csvData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 20;
const background = document.querySelector('.background');
const loadingDiv = document.getElementById('loading');

document.addEventListener('DOMContentLoaded', () => {
  fetchCSVData();
  addFilterEventListeners();
  addPaginationEventListeners();
  populateFilterOptions();
  updatePageInfo();
});

function fetchCSVData() {
  const cacheBustingParam = `?v=${Date.now()}`;
  fetch(`/Combined_josaa(in).csv${cacheBustingParam}`)
    .then(response => response.text())
    .then(data => {
      csvData = parseCsv(data);
      filteredData = [...csvData];
      updateResultTable(getPageData());
      updatePageInfo();

      loadingDiv.style.display = 'none';
    });
}

function parseCsv(data) {
  const rows = data.split('\n');
  return rows.slice(1).map(row => {
    let inQuotes = false;
    let currentField = '';
    const values = [];

    for (let i = 0; i < row.length; i++) {
      const char = row[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }

    values.push(currentField.trim());

    return {
      institute: values[0],
      program_name: values[1],
      quota: values[2],
      seat_type: values[3],
      gender: values[4],
      opening_rank: values[5],
      closing_rank: values[6],
      year: values[7],
      round: values[8]
    };
  });
}

function populateFilterOptions() {
  const yearSelect = document.getElementById('year');
  const roundNoSelect = document.getElementById('round_no');
  

  yearSelect.addEventListener('change', () => {
    const selectedYear = yearSelect.value;
    if (selectedYear === '2024') {
      populateSelect(roundNoSelect, ['1', '2', '3', '4', '5']);
    } else {
      populateSelect(roundNoSelect, ['1', '2', '3', '4', '5', '6']);
    }
  });

  populateSelect(yearSelect, ['2024', '2023','2022', '2021', '2020']);
  populateSelect(roundNoSelect, ['1', '2', '3', '4', '5']); // Default for 2024
}
const instituteNameInput = document.getElementById('institute_name');
const quotaSelect = document.getElementById('quota');
const seatTypeSelect = document.getElementById('seat_type');
const genderSelect = document.getElementById('gender');
const programNameSelect = document.getElementById('program_name');
instituteNameInput.value = '';
populateSelect(quotaSelect, ['AI', 'OS', 'HS']);
populateSelect(seatTypeSelect, [ 'OPEN', 'OPEN (PwD)', 'EWS', 'EWS (PwD)', 'OBC-NCL', 'OBC-NCL (PwD)', 'SC', 'SC (PwD)', 'ST', 'ST (PwD)']);
populateSelect(genderSelect, ['Gender-Neutral', 'Female-only (including Supernumerary)']);
populateSelect(programNameSelect, ['All','Civil Engineering (4 Years, Bachelor of Technology)', 'Civil Engineering and M. Tech. in Structural Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))', 'aerospace', 'chemical', 'civil', 'computer', 'electrical', 'mechanical', 'metallurgical', 'biotechnology', 'physics', 'mathematics', 'chemistry', 'environmental', 'management', 'humanities']);

function addFilterEventListeners() {
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.addEventListener('click', filterAndUpdateResults);
}

function addPaginationEventListeners() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updateResultTable(getPageData());
      updatePageInfo();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentPage * itemsPerPage < filteredData.length) {
      currentPage++;
      updateResultTable(getPageData());
      updatePageInfo();
    }
  });
}

function filterAndUpdateResults() {
  const year = document.getElementById('year').value;
  const instituteName = document.getElementById('institute_name').value;
  const roundNo = document.getElementById('round_no').value;
  const quota = document.getElementById('quota').value;
  const seatType = document.getElementById('seat_type').value;
  const gender = document.getElementById('gender').value;
  const programName = document.getElementById('program_name').value;

  
  if (!year || !roundNo || !quota || !seatType || !gender || !programName) {
    alert('Please fill all the required fields.');
    return;
  }

  filteredData = csvData.slice();
  if (year) filteredData = filteredData.filter(row => row.year === year);
  if (instituteName) {
    let userInput = instituteName.toLowerCase().trim(); 
  
    // Replace abbreviations in user input
    userInput = userInput.replace(/\biit\b/g, "indian institute of technology");
    userInput = userInput.replace(/\bnit\b/g, "national institute of technology");
  
    const userInputWords = userInput.split(/\s+/); 
  
    filteredData = filteredData.filter(row => {
      const instituteWords = row.institute.toLowerCase().split(/\s+/);
      return userInputWords.every(userInputWord => 
        instituteWords.some(instituteWord => instituteWord.includes(userInputWord))
      );
    });
  }
  if (roundNo) filteredData = filteredData.filter(row => row.round === roundNo);
  if (quota) filteredData = filteredData.filter(row => row.quota === quota);
  if (seatType) filteredData = filteredData.filter(row => row.seat_type === seatType);
  if (gender) filteredData = filteredData.filter(row => row.gender === gender);
  if (programName !== 'All') {
    filteredData = filteredData.filter(row => row.program_name.toLowerCase().includes(programName.toLowerCase()));
  }

  currentPage = 1;
  updateResultTable(getPageData(filteredData));
  updatePageInfo();
}

function updateResultTable(data) {
  const resultBody = document.getElementById('result-body');
  resultBody.innerHTML = '';

  data.forEach(row => {
    const tr = document.createElement('tr');
    

    const instituteCell = document.createElement('td');
    instituteCell.textContent = row.institute;
    tr.appendChild(instituteCell);

    const programNameCell = document.createElement('td');
    programNameCell.textContent = row.program_name;
    tr.appendChild(programNameCell);

    const openingRankCell = document.createElement('td');
    openingRankCell.textContent = row.opening_rank;
    tr.appendChild(openingRankCell);

    const closingRankCell = document.createElement('td');
    closingRankCell.textContent = row.closing_rank;
    tr.appendChild(closingRankCell);

    resultBody.appendChild(tr);
  });

  updatePaginationButtons();
}

function populateSelect(select, options) {
  select.innerHTML = '<option value="">Select</option>';
  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.textContent = option;
    select.appendChild(optionElement);
  });
}

function getPageData(data = filteredData) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
}

function updatePageInfo() {
  const pageInfo = document.getElementById('page-info');
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function updatePaginationButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage * itemsPerPage >= filteredData.length;
}
