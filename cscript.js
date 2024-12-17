
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
  fetch(`/new csab final(in).csv${cacheBustingParam}`)
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
      populateSelect(roundNoSelect, ['1', '2']);
    } else {
      populateSelect(roundNoSelect, ['1', '2']);
    }
  });

  populateSelect(yearSelect, ['2024', '2023','2022', '2021']);
  populateSelect(roundNoSelect, ['1', '2']); 
}
const instituteNameInput = document.getElementById('institute_name');
const quotaSelect = document.getElementById('quota');
const seatTypeSelect = document.getElementById('seat_type');
const genderSelect = document.getElementById('gender');
const programNameSelect = document.getElementById('program_name');
const closingRank = document.getElementById('closing_rank');


populateSelect(instituteNameInput, ["All","Dr. B R Ambedkar National Institute of Technology, Jalandhar",
  "Malaviya National Institute of Technology Jaipur",
  "Maulana Azad National Institute of Technology Bhopal",
  "Motilal Nehru National Institute of Technology Allahabad",
  "National Institute of Technology  Agartala",
  "National Institute of Technology Calicut",
  "National Institute of Technology Delhi",
  "National Institute of Technology Durgapur",
  "National Institute of Technology Goa",
  "National Institute of Technology Hamirpur",
  "National Institute of Technology Karnataka, Surathkal",
  "National Institute of Technology Meghalaya",
  "National Institute of Technology Nagaland",
  "National Institute of Technology Patna",
  "National Institute of Technology Puducherry",
  "National Institute of Technology Raipur",
  "National Institute of Technology Sikkim",
  "National Institute of Technology Arunachal Pradesh ",
  "National Institute of Technology, Jamshedpur",
  "National Institute of Technology, Kurukshetra",
  "National Institute of Technology, Manipur",
  "National Institute of Technology, Mizoram",
  "National Institute of Technology, Rourkela",
  "National Institute of Technology, Silchar",
  "National Institute of Technology, Srinagar",
  "National Institute of Technology, Tiruchirappalli",
  "National Institute of Technology, Uttarakhand",
  "National Institute of Technology, Warangal",
  "Sardar Vallabhbhai National Institute of Technology, Surat",
  "Visvesvaraya National Institute of Technology, Nagpur",
  "National Institute of Technology, Andhra Pradesh",
  "Indian Institute of Engineering Science and Technology, Shibpur",
  "Atal Bihari Vajpayee Indian Institute of Information Technology &amp; Management Gwalior",
  "Indian Institute of Information Technology (IIIT)Kota, Rajasthan",
  "Indian Institute of Information Technology Guwahati",
  "Indian Institute of Information Technology(IIIT) Kalyani, West Bengal",
  "Indian Institute of Information Technology(IIIT) Kilohrad, Sonepat, Haryana",
  "Indian Institute of Information Technology(IIIT) Una, Himachal Pradesh",
  "Indian Institute of Information Technology (IIIT), Sri City, Chittoor",
  "Indian Institute of Information Technology(IIIT), Vadodara, Gujrat",
  "Indian Institute of Information Technology, Allahabad",
  "Indian Institute of Information Technology, Design &amp; Manufacturing, Kancheepuram",
  "Pt. Dwarka Prasad Mishra Indian Institute of Information Technology, Design &amp; Manufacture Jabalpur",
  "Indian Institute of Information Technology  Manipur",
  "Indian Institute of Information Technology Tiruchirappalli",
  "Indian Institute of Information Technology Lucknow",
  "Indian Institute of Information Technology(IIIT) Dharwad ",
  "Indian Institute of Information Technology Design &amp; Manufacturing Kurnool, Andhra Pradesh",
  "Indian Institute of Information Technology(IIIT) Kottayam",
  "Indian Institute of Information Technology (IIIT) Ranchi",
  "Indian Institute of Information Technology (IIIT) Nagpur",
  "Indian Institute of Information Technology (IIIT) Pune",
  "Indian Institute of Information Technology Bhagalpur",
  "Indian Institute of Information Technology Bhopal",
  "Indian Institute of Information Technology Surat",
  "Indian Institute of Information Technology, Agartala",
  "Indian institute of information technology, Raichur, Karnataka",
  "Indian Institute of Information Technology, Vadodara International Campus Diu (IIITVICD)",
  "Assam University, Silchar",
  "Birla Institute of Technology, Mesra,  Ranchi",
  "Gurukula Kangri Vishwavidyalaya, Haridwar",
  "Indian Institute of Carpet Technology,  Bhadohi",
  "Institute of Infrastructure, Technology, Research and Management-Ahmedabad",
  "Institute of Technology, Guru Ghasidas Vishwavidyalaya (A Central University), Bilaspur, (C.G.)",
  "J.K. Institute of Applied Physics &amp; Technology, Department of Electronics &amp; Communication, University of Allahabad- Allahabad",
  "National Institute of Electronics and Information Technology, Aurangabad (Maharashtra)",
  "National Institute of Advanced Manufacturing Technology, Ranchi",
  "Sant Longowal Institute of Engineering and Technology",
  "Mizoram University, Aizawl",
  "School of Engineering, Tezpur University, Napaam, Tezpur",
  "School of Planning &amp; Architecture, Bhopal",
  "School of Planning &amp; Architecture, New Delhi",
  "School of Planning &amp; Architecture: Vijayawada",
  "Shri Mata Vaishno Devi University, Katra, Jammu &amp; Kashmir",
  "International Institute of Information Technology, Naya Raipur",
  "University of Hyderabad",
  "Punjab Engineering College, Chandigarh",
  "Jawaharlal Nehru University, Delhi",
  "International Institute of Information Technology, Bhubaneswar",
  "Central institute of Technology Kokrajar, Assam",
  "Puducherry Technological University, Puducherry",
  "Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal",
  "Central University of Rajasthan, Rajasthan",
  "National Institute of Food Technology Entrepreneurship and Management, Kundli",
  "National Institute of Food Technology Entrepreneurship and Management, Thanjavur",
  "North Eastern Regional Institute of Science and Technology, Nirjuli-791109 (Itanagar),Arunachal Pradesh"])
populateSelect(quotaSelect, [ 'AI','OS', 'HS']);
populateSelect(seatTypeSelect, [ 'OPEN', 'OPEN (PwD)', 'EWS', 'EWS (PwD)', 'OBC-NCL', 'OBC-NCL (PwD)', 'SC', 'SC (PwD)', 'ST', 'ST (PwD)']);
populateSelect(genderSelect, ['Gender-Neutral', 'Female-only (including Supernumerary)']);
populateSelect(programNameSelect, ['All','Civil Engineering (4 Years, Bachelor of Technology)', 'Civil Engineering and M. Tech. in Structural Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))', 'Aerospace Engineering (4 Years, Bachelor of Technology)', 'chemical', 'Computer Science and Engineering (4 Years, Bachelor of Technology)', 'Electrical Engineering (4 Years, Bachelor of Technology)','Electronics and Communication Engineering (4 Years, Bachelor of Technology)', 'mechanical', 'metallurgical', 'biotechnology', 'Engineering Physics (4 Years, Bachelor of Technology)', 'Mathematics (4 Years, Bachelor of Technology)', 'chemistry', 'environmental', 'management', 'humanities']);

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

  // Ensure all fields are required
  // if (!year || !roundNo || !quota || !seatType || !gender || !programName) {
  //   alert('Please fill all the required fields.');
  //   return;
  // }

  filteredData = csvData.slice();
  if (year) filteredData = filteredData.filter(row => row.year === year);
  if (instituteName && instituteName !== 'All') {
    let userInput = instituteName.toLowerCase().trim(); // Store original input
  
    // Replace abbreviations in user input
    userInput = userInput.replace(/\biit\b/g, "indian institute of technology");
    userInput = userInput.replace(/\bnit\b/g, "national institute of technology");
  
    const userInputWords = userInput.split(/\s+/); // Split expanded input
  
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
  if (programName &&programName !== 'All') {
    filteredData = filteredData.filter(row => row.program_name.toLowerCase().includes(programName.toLowerCase()));
  }
  if (closingRank) {
    const rank = parseInt(closingRank);
    const minRank = Math.max(1, rank - 1500);
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
