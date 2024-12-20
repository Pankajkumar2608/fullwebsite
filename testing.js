import axios from "axios";
const populateSelect = (selectElement, options) => {
    selectElement.innerHTML = '<option value="">Select</option>';
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option;
      selectElement.appendChild(optionElement);
    });
  };




function filterData(){
    const Year = document.getElementById('year').value;
    const round = document.getElementById('round_no').value;
    const institute = document.getElementById('institute_name').value;
    const quota = document.getElementById('quota').value;
    const SeatType = document.getElementById('seat_type').value;
    const gender = document.getElementById('gender').value;
    const AcademicProgramName = document.getElementById('program_name').value;
    const userRank = document.getElementById('your_rank').value;

    axios.post('https://7edcacd9-2aea-46d0-93e6-b4fdfcd57d9d-00-2wkn1xpm2v4pu.sisko.replit.dev/filter',{Year,round,institute,userRank,quota,SeatType,gender,AcademicProgramName}).then(response => {
        const filterData = response.data.filteredData;
        const table = document.getElementById('result-table');
        table.innerHTML = '';
        filterData.forEach(filterData => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${filterData.institute}</td>
                <td>${filterData.AcademicProgramName}</td>
                <td>${filterData.opening_rank}</td>
                <td>${filterData.closing_rank}</td>
            `;
            table.appendChild(row);
        })

    })

}

function populateFilterOptions() {
    const yearSelect = document.getElementById('year');
    const roundNoSelect = document.getElementById('round_no');
    
  
    yearSelect.addEventListener('change', () => {
      const selectedYear = yearSelect.value;
      if (selectedYear === '2024') {
        populateSelect(roundNoSelect, ['1', '2','3','4','5']);
      } else {
        populateSelect(roundNoSelect, ['1', '2','3','4','5','6']);
      }
    });
  
    populateSelect(yearSelect, ['2024', '2023','2022', '2021']);
    populateSelect(roundNoSelect, ['1', '2','3','4','5']); 
  }
  const instituteNameInput = document.getElementById('institute_name');
  const quotaSelect = document.getElementById('quota');
  const seatTypeSelect = document.getElementById('seat_type');
  const genderSelect = document.getElementById('gender');
  const programNameSelect = document.getElementById('program_name');
  const closingRank = document.getElementById('closing_rank');
  
  
  populateSelect(instituteNameInput,  [
    "ALL",
    "Indian Institute of Technology Bhubaneswar",
    "Indian Institute of Technology Bombay",
    "Indian Institute of Technology Mandi",
    "Indian Institute of Technology Delhi",
    "Indian Institute of Technology Indore",
    "Indian Institute of Technology Kharagpur",
    "Indian Institute of Technology Hyderabad",
    "Indian Institute of Technology Jodhpur",
    "Indian Institute of Technology Kanpur",
    "Indian Institute of Technology Madras",
    "Indian Institute of Technology Gandhinagar",
    "Indian Institute of Technology Patna",
    "Indian Institute of Technology Roorkee",
    "Indian Institute of Technology (ISM) Dhanbad",
    "Indian Institute of Technology Ropar",
    "Indian Institute of Technology (BHU) Varanasi",
    "Indian Institute of Technology Guwahati",
    "Indian Institute of Technology Bhilai",
    "Indian Institute of Technology Goa",
    "Indian Institute of Technology Palakkad",
    "Indian Institute of Technology Tirupati",
    "Indian Institute of Technology Jammu",
    "Indian Institute of Technology Dharwad",
    "Dr. B R Ambedkar National Institute of Technology, Jalandhar",
    "Malaviya National Institute of Technology Jaipur",
    "Maulana Azad National Institute of Technology Bhopal",
    "Motilal Nehru National Institute of Technology Allahabad",
    "National Institute of Technology Agartala",
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
    "National Institute of Technology Arunachal Pradesh",
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
    "Atal Bihari Vajpayee Indian Institute of Information Technology & Management Gwalior",
    "Indian Institute of Information Technology (IIIT)Kota, Rajasthan",
    "Indian Institute of Information Technology Guwahati",
    "Indian Institute of Information Technology(IIIT) Kalyani, West Bengal",
    "Indian Institute of Information Technology(IIIT) Kilohrad, Sonepat, Haryana",
    "Indian Institute of Information Technology(IIIT) Una, Himachal Pradesh",
    "Indian Institute of Information Technology (IIIT), Sri City, Chittoor",
    "Indian Institute of Information Technology(IIIT), Vadodara, Gujrat",
    "Indian Institute of Information Technology, Allahabad",
    "Indian Institute of Information Technology, Design & Manufacturing, Kancheepuram",
    "Pt. Dwarka Prasad Mishra Indian Institute of Information Technology, Design & Manufacture Jabalpur",
    "Indian Institute of Information Technology Manipur",
    "Indian Institute of Information Technology Tiruchirappalli",
    "Indian Institute of Information Technology Lucknow",
    "Indian Institute of Information Technology(IIIT) Dharwad",
    "Indian Institute of Information Technology Design & Manufacturing Kurnool, Andhra Pradesh",
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
    "Birla Institute of Technology, Mesra, Ranchi",
    "Gurukula Kangri Vishwavidyalaya, Haridwar",
    "Indian Institute of Carpet Technology, Bhadohi",
    "Institute of Infrastructure, Technology, Research and Management-Ahmedabad",
    "Institute of Technology, Guru Ghasidas Vishwavidyalaya (A Central University), Bilaspur, (C.G.)",
    "J.K. Institute of Applied Physics & Technology, Department of Electronics & Communication, University of Allahabad- Allahabad",
    "National Institute of Electronics and Information Technology, Aurangabad (Maharashtra)",
    "National Institute of Advanced Manufacturing Technology, Ranchi",
    "Sant Longowal Institute of Engineering and Technology",
    "Mizoram University, Aizawl",
    "School of Engineering, Tezpur University, Napaam, Tezpur",
    "School of Planning & Architecture, Bhopal",
    "School of Planning & Architecture, New Delhi",
    "School of Planning & Architecture: Vijayawada",
    "Shri Mata Vaishno Devi University, Katra, Jammu & Kashmir",
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
    "North Eastern Regional Institute of Science and Technology, Nirjuli-791109 (Itanagar), Arunachal Pradesh",
    "Indian Institute of Handloom Technology(IIHT), Varanasi",
    "Chhattisgarh Swami Vivekanada Technical University, Bhilai (CSVTU Bhilai)",
    "Institute of Chemical Technology, Mumbai: Indian Oil Odisha Campus, Bhubaneswar",
    "North-Eastern Hill University, Shillong",
    "Central University of Jammu",
    "Institute of Engineering and Technology, Dr. H. S. Gour University. Sagar (A Central University)",
    "Central University of Haryana",
    "Birla Institute of Technology, Deoghar Off-Campus",
    "Birla Institute of Technology, Patna Off-Campus",
    "Indian Institute of Handloom Technology, Salem"
  ]);
  populateSelect(quotaSelect, [ 'AI','OS', 'HS']);
  populateSelect(seatTypeSelect, [ 'OPEN', 'OPEN (PwD)', 'EWS', 'EWS (PwD)', 'OBC-NCL', 'OBC-NCL (PwD)', 'SC', 'SC (PwD)', 'ST', 'ST (PwD)']);
  populateSelect(genderSelect, ['Gender-Neutral', 'Female-only (including Supernumerary)']);
  populateSelect(programNameSelect, ['All','Civil Engineering (4 Years, Bachelor of Technology)', 'Civil Engineering and M. Tech. in Structural Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))', 'Aerospace Engineering (4 Years, Bachelor of Technology)', 'chemical', 'Computer Science and Engineering (4 Years, Bachelor of Technology)', 'Electrical Engineering (4 Years, Bachelor of Technology)','Electronics and Communication Engineering (4 Years, Bachelor of Technology)', 'mechanical', 'metallurgical', 'biotechnology', 'Engineering Physics (4 Years, Bachelor of Technology)', 'Mathematics (4 Years, Bachelor of Technology)', 'chemistry', 'environmental', 'management', 'humanities']);
  

  const filterButton = document.getElementById('filter-button');
    filterButton.addEventListener('click', filterData);