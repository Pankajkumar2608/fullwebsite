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
  fetch(`/Combined.csv${cacheBustingParam}`)
    .then(response => response.text())
    .then(data => {
      csvData = parseCsv(data);
      filteredData = [...csvData];
      updateResultTable(getPageData());
      updatePageInfo();

      // Hide the loading bar once data is loaded
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

    values.push(currentField.trim()); // Push the last field

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
// Add an event listener to the document to show the pop-up when the page loads
document.addEventListener("DOMContentLoaded", function() {
  // Show the pop-up
  document.getElementById("popup").style.display = "block";
  
  // Add an event listener to the close button to hide the pop-up when clicked
  document.getElementById("close-popup").addEventListener("click", function() {
    document.getElementById("popup").style.display = "none";
  });
});



function populateFilterOptions() {
  const yearSelect = document.getElementById('year');
  const instituteNameInput = document.getElementById('institute_name');
  const roundNoSelect = document.getElementById('round_no');
  const quotaSelect = document.getElementById('quota');
  const seatTypeSelect = document.getElementById('seat_type');
  const genderSelect = document.getElementById('gender');
  const programNameSelect = document.getElementById('program_name');

  populateSelect(yearSelect, ['All', '2023', '2022', '2021']);
  instituteNameInput.value = '';
  populateSelect(roundNoSelect, ['All', '1', '2']);
  populateSelect(quotaSelect, ['AI', 'OS', 'HS']);
  populateSelect(seatTypeSelect, ['All', 'OPEN', 'OPEN (PwD)', 'EWS', 'EWS (PwD)', 'OBC-NCL', 'OBC-NCL (PwD)', 'SC', 'SC (PwD)', 'ST', 'ST (PwD)']);
  populateSelect(genderSelect, ['All', 'Gender-Neutral', 'Female-only (including Supernumerary)']);
  populateSelect(programNameSelect, ['All', 'Civil Engineering (4 Years, Bachelor of Technology)', 'Civil Engineering and M. Tech. in Structural Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))', 'aerospace', 'chemical', 'civil', 'computer', 'electrical', 'mechanical', 'metallurgical', 'biotechnology', 'physics', 'mathematics', 'chemistry', 'environmental', 'management', 'humanities']);
}

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
  const closingRank = document.getElementById('your_rank').value;
  filteredData = csvData.slice();
  if (year !== 'All') {
      filteredData = filteredData.filter(row => row.year === year);
  }
  
  if (instituteName) {
    let userInput = instituteName.toLowerCase().trim(); // Store original input
  
    // Replace abbreviations in user input
    userInput = userInput.replace(/\biit\b/g, "indian institute of technology");
    userInput = userInput.replace(/\bnit\b/g, "national institute of technology");
  
    const userInputWords = userInput.split(/\s+/); // Split expanded input
  
    filteredData = filteredData.filter(row => {
      const instituteWords = row.institute.toLowerCase().split(/\s+/);
  
      // Check if all expanded user input words are present in the institute name
      return userInputWords.every(userInputWord => 
        instituteWords.some(instituteWord => instituteWord.includes(userInputWord))
      );
    });
  }
  if (roundNo !== 'All') {
      filteredData = filteredData.filter(row => row.round.includes(roundNo));
  }
  if (quota !== 'AI') {
      filteredData = filteredData.filter(row => row.quota === quota);
  }
  if (seatType !== 'All') {
      filteredData = filteredData.filter(row => row.seat_type === seatType);
  }
  if (gender !== 'All') {
      filteredData = filteredData.filter(row => row.gender === gender);
  }
  if (programName !== 'All') {
      filteredData = filteredData.filter(row => row.program_name.toLowerCase().includes(programName.toLowerCase()));
  }
  if (closingRank) {
      const rank = parseInt(closingRank);
      const minRank = Math.max(1, rank - 5000);
      const maxRank = rank + 10000;
      filteredData = filteredData.filter(row => {
          const rowRank = parseInt(row.closing_rank);
          return rowRank >= minRank && rowRank <= maxRank;
      }).sort((a, b) => parseInt(a.closing_rank) - parseInt(b.closing_rank));
  }
  currentPage = 1;
  updateResultTable(getPageData(filteredData));
  updatePageInfo();
}
function getPageData(data = filteredData) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
}

function populateSelect(select, options) {
  select.innerHTML = '';
  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.textContent = option;
    select.appendChild(optionElement);
  });
}
function getCollegeSlug(collegeName) {
  // 1. Replace full occurrences of "Indian Institute of Technology" and "National Institute of Technology" FIRST
  collegeName = collegeName.replace("Indian Institute of Technology", "IIT");
  collegeName = collegeName.replace("National Institute of Technology", "NIT");

  // 2. THEN convert to lowercase and replace spaces with hyphens
  return collegeName.toLowerCase().replace(/\s+/g, '-');
}

function updateResultTable(data) {
  const resultBody = document.getElementById('result-body');
  resultBody.innerHTML = '';

  data.forEach(row => {
    const tr = document.createElement('tr');

    // Create a link for the institute name
    const instituteLink = document.createElement('a');
    instituteLink.href = `https://www.collegepravesh.com/engineering-colleges/${getCollegeSlug(row.institute)}/`;
    instituteLink.textContent = row.institute;
    instituteLink.target = "_blank"; // Open link in a new tab

    // Create the table cell and append the link to it
    const instituteCell = document.createElement('td');
    instituteCell.appendChild(instituteLink); // <-- Add this line
    tr.appendChild(instituteCell);


    const programNameCell = document.createElement('td');
    programNameCell.textContent = row.program_name;
    tr.appendChild(programNameCell);

    const quotaCell = document.createElement('td');
    quotaCell.textContent = row.quota;
    tr.appendChild(quotaCell);

    const seatTypeCell = document.createElement('td');
    seatTypeCell.textContent = row.seat_type;
    tr.appendChild(seatTypeCell);

    const genderCell = document.createElement('td');
    genderCell.textContent = row.gender;
    tr.appendChild(genderCell);

    const openingRankCell = document.createElement('td');
    openingRankCell.textContent = row.opening_rank;
    tr.appendChild(openingRankCell);

    const closingRankCell = document.createElement('td');
    closingRankCell.textContent = row.closing_rank;
    tr.appendChild(closingRankCell);

    const yearCell = document.createElement('td');
    yearCell.textContent = row.year;
    tr.appendChild(yearCell);

    const roundCell = document.createElement('td');
    roundCell.textContent = row.round;
    tr.appendChild(roundCell);

    const probabilityCell = document.createElement('td');
    const userRank = document.getElementById('your_rank').value;
    if (userRank) {
      const userRankValue = parseInt(userRank);
      const closingRankValue = parseInt(row.closing_rank);
      let probability = 0;
      if (userRankValue <= closingRankValue) {
        probability = 100;
      } else {
        probability = Math.round((1 - (userRankValue - closingRankValue) / 1000) * 100);
      }
      probabilityCell.textContent = `${probability}%`;
    } else {
      probabilityCell.textContent = '-';
    }
    tr.appendChild(probabilityCell);

    resultBody.appendChild(tr);
  });

  updatePaginationButtons();
}


function updatePaginationButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage * itemsPerPage >= filteredData.length;
}

function updatePageInfo() {
  const pageInfo = document.getElementById('page-info');
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}



