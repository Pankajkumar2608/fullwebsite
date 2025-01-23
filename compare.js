document.addEventListener("DOMContentLoaded", () => {
  const colleges = [
    "IIT Bhubaneswar",
    "IIT Bombay",
    "IIT Mandi",
    "IIT Delhi",
    "IIT Goa",
    "IIT Palakkad",
    "IIT Tirupati",
    "IIT Madras",
    "IIT Guwahati",
    "IIT Indore",
    "IIT Kanpur",
    "IIT Jodhpur",
    "IIT Kharagpur",
    "IIT Hyderabad",
    "IIT Patna",
    "IIT Ropar",
    "IIT Roorkee",
    "IIT (BHU) Varanasi",
    "IIT Jammu",
    "IIT Bhilai",
    "IIT Dharwad",
    "IIT (ISM) Dhanbad",
    "IIT Gandhinagar",
    "NIT Jallandhar",
    "NIT Jaipur",
    "NIT Bhopal",
    "NIT Allahabad",
    "NIT Mizoram",
    "NIT Warangal",
    "NIT Arunachal Pradesh",
    "NIT Silchar",
    "NIT Patna",
    "NIT Calicut",
    "NIT Raipur",
    "NIT Delhi",
    "NIT Goa",
    "NIT Hamirpur",
    "NIT Kurukshetra",
    "NIT Srinagar",
    "NIT Jamshedpur",
    "NIT Manipur",
    "NIT Meghalaya",
    "NIT Nagaland",
    "NIT Rourkela",
    "NIT Puducherry",
    "NIT Surathkal",
    "NIT Sikkim",
    "NIT Trichy",
    "NIT Agartala",
    "NIT Uttarakhand",
    "NIT Durgapur",
    "NIT Surat",
    "NIT Nagpur",
    "NIT Tadepalligudam",
    "NIT Andhra Pradesh",
    "IIIT Gwalior",
    "IIIT Allahabad",
    "IIITDM Jabalpur",
    "IIITDM Kancheepuram",
    "IIIT Sri City",
    "IIIT Guwahati",
    "IIIT Vadodara",
    "IIIT Kota",
    "IIIT Tiruchirappalli",
    "IIIT Una",
    "IIIT Sonepat",
    "IIIT Kalyani",
    "IIIT Lucknow",
    "IIIT Dharwad",
    "IIIT Kurnool",
    "IIIT Kottayam",
    "IIIT Manipur",
    "IIIT Nagpur",
    "IIIT Pune",
    "IIIT Ranchi",
    "IIIT Bangalore",
    "IIIT Bhubaneswar",
    "IIIT Kerala",
    "IIIT Naya Raipur",
    "IIITDM Jabalpur",
  ];

  

  function populateDropdowns() {
    const collegeSelects = document.querySelectorAll(".college-select");
    

    collegeSelects.forEach((select) => {
      colleges.forEach((college) => {
        const option = document.createElement("option");
        option.value = college;
        option.textContent = college;
        select.appendChild(option);
      });
    });
  }

  populateDropdowns();

  eventListener();
});


function eventListener() {
  const compareBtn = document.getElementById("submit-btn");
  compareBtn.addEventListener("click", compareColleges);
}
function showLoading(isLoading){
  const loader = document.getElementById("loader");
  if(isLoading){
    loader.style.display = "block";
    loader.innerHTML = "Loading...";
  }
  else{
    loader.style.display = "none";
  }

}

function compareColleges() {
  const collegeName1 = document.getElementById("college1").value;
  const collegeName2 = document.getElementById("college2").value;
  if (!collegeName1 || !collegeName2) {
    alert("Please select both colleges");
    return;
  }
  if(collegeName1===collegeName2){
    alert("Please select different colleges");
    return;
  }
  showLoading(true);
  
  
  

  axios
    .post(
      "https://comparecollegeapi.onrender.com/colleges",
      {
        collegeName1,
        collegeName2,
      }
    )
    .then((response) => {
      const filterdata1 = response.data.college1;
      const filteredData2 = response.data.college2;
      showLoading(false);

      updateUI(filterdata1, filteredData2);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      showLoading(false);
    });
}



function updateUI(filterdata1, filteredData2) {
  const spanPlacmentRate1 = document.getElementById("placement1");
  const spanPlacmentRate2 = document.getElementById("placement2");
  const spanPackage = document.getElementById("package1");
  const spanPackage2 = document.getElementById("package2");

  spanPlacmentRate1.textContent = `Placement Rate: ${filterdata1["Placement Rate (%)"]} `;
  spanPlacmentRate2.textContent = `Placement Rate: ${filteredData2["Placement Rate (%)"]} `;
  spanPackage.textContent = `Avg Package: ${filterdata1["Average Package (LPA)"]} `;
  spanPackage2.textContent = `Avg Package: ${filteredData2["Average Package (LPA)"]} `;
  const collegeName1 = document.getElementById("college1").value;
  const collegeName2 = document.getElementById("college2").value;

  const comparisonBody = document.getElementById("comparison-body");
  showLoading(false);
  
  comparisonBody.innerHTML = `
      <thead>
            <tr>
                <th>Metrics</th>
                <th>${collegeName1}</th>
                <th>${collegeName2}</th>           
            </tr>
                        
       </thead>
      
      <tr>
        <td>NIRF Ranking</td>
        <td>${filterdata1["NIRF Rank"]}</td>
        <td>${filteredData2["NIRF Rank"]}</td>
      </tr>
      <tr>
        <td>Placement Rate</td>
        <td>${filterdata1["Placement Rate (%)"]}</td>
        <td>${filteredData2["Placement Rate (%)"]}</td>
      </tr>
      <tr>
        <td>Average Package (LPA)</td>
        <td>${filterdata1["Average Package (LPA)"]}</td>
        <td>${filteredData2["Average Package (LPA)"]}</td>
      </tr>
      <tr>
        <td>Location</td>
        <td>${filterdata1["Location"]}</td>
        <td>${filteredData2["Location"]}</td>
      </tr>
      <tr>
        <td>Highest Package (LPA)</td>
        <td>${filterdata1["Highest Package (LPA)"]}</td>
        <td>${filteredData2["Highest Package (LPA)"]}</td>
      </tr>
      <tr>
        <td>Facilities</td>
        <td>${filterdata1["Facilities"]}</td>
        <td>${filteredData2["Facilities"]}</td>
      </tr>
      <tr>
        <td>Reddit Review</td>
        <td>${filterdata1["Reddit Review"]}</td>
        <td>${filteredData2["Reddit Review"]}</td>
      </tr>
    `;
}
