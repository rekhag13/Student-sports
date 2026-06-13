/**
 * =========================================================
 * STUDENT SPORTS MANAGEMENT SYSTEM (script.js)
 * =========================================================
 * 
 * This file handles all the interactive logic of our application.
 * It holds functions for CRUD operations, calculating metrics,
 * searching, filtering, and saving data persistency inside the 
 * browser's LocalStorage.
 * 
 * Detailed line-by-line comments are included to help beginners
 * understand standard modern JavaScript conventions.
 */

// --- 1. INITIAL SPORTS DATA (SEED DATA) ---
// We define a default array of students. If a user opens the app for the 
// first time, these records will seed the dashboard so it starts fully populated.
const INITIAL_STUDENTS = [
  { id: "STU-1001", name: "Rahul Sharma", gradeClass: "Class 10-A", sportName: "Cricket", score: 92 },
  { id: "STU-1002", name: "Sarah Jenkins", gradeClass: "Class 12-B", sportName: "Football", score: 85 },
  { id: "STU-1003", name: "David Miller", gradeClass: "Class 11-C", sportName: "Basketball", score: 78 },
  { id: "STU-1004", name: "Priya Patel", gradeClass: "Class 10-B", sportName: "Badminton", score: 95 },
  { id: "STU-1005", name: "Marc Tremblay", gradeClass: "Class 11-A", sportName: "Volleyball", score: 62 },
  { id: "STU-1006", name: "Emily Watson", gradeClass: "Class 12-A", sportName: "Football", score: 48 },
  { id: "STU-1007", name: "Anil Kumar", gradeClass: "Class 9-B", sportName: "Cricket", score: 74 },
  { id: "STU-1008", name: "Chloe Dupont", gradeClass: "Class 10-C", sportName: "Tennis", score: 88 }
];

// --- 2. STATE VARIABLES ---
// These variables maintain the current interactive states of the application.
let students = [];             // Will hold the active list of student records
let editingStudentId = null;   // Keeps track of the ID of the student we are editing (null means 'Add Mode')
let activeSportFilter = "All"; // Active category selected for viewing (All, Football, Cricket, etc.)

// --- 3. DOM ELEMENTS SETUP ---
// We query and register elements from index.html so our JS can read or edit them.
document.addEventListener("DOMContentLoaded", () => {
  // Initialize App
  initApp();
  
  // Bind standard layout event listeners
  setupEventListeners();
});

/**
 * Loads student records from browser LocalStorage, or fallback seeds.
 */
function initApp() {
  // Try retrieving existing records from localStorage
  const storedData = localStorage.getItem("sports_students");
  
  if (storedData) {
    // If found, parse the JSON string back into a real JavaScript Array
    students = JSON.parse(storedData);
  } else {
    // If opening for the very first time, use our pre-defined seed data
    students = [...INITIAL_STUDENTS];
    saveToLocalStorage();
  }
  
  // Trigger UI rendering loops
  renderDashboard();
}

/**
 * Returns a human-readable grade and color badge based on score.
 * A beginner friendly grading scale function.
 */
function calculateGradeAndResult(score) {
  let gradeLetter = "F";
  let resultStatus = "Fail";
  let colorClass = "bg-rose-50 text-rose-700 border-rose-200";
  
  if (score >= 90) {
    gradeLetter = "A";
    resultStatus = "Pass";
    colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (score >= 75) {
    gradeLetter = "B";
    resultStatus = "Pass";
    colorClass = "bg-teal-50 text-teal-700 border-teal-200";
  } else if (score >= 60) {
    gradeLetter = "C";
    resultStatus = "Pass";
    colorClass = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (score >= 50) {
    gradeLetter = "D";
    resultStatus = "Pass";
    colorClass = "bg-orange-50 text-orange-700 border-orange-200";
  }
  
  return { gradeLetter, resultStatus, colorClass };
}

/**
 * Returns a colorful icon badge SVG representative of the sport
 */
function getSportIconHTML(sport) {
  const s = sport.toLowerCase();
  if (s.includes("foot")) {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">⚽ Football</span>`;
  } else if (s.includes("crick")) {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">🏏 Cricket</span>`;
  } else if (s.includes("basket")) {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">🏀 Basketball</span>`;
  } else if (s.includes("volley")) {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">🏐 Volleyball</span>`;
  } else if (s.includes("badmin") || s.includes("tennis")) {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">🏸 ${sport}</span>`;
  }
  // Standard default sport fallback badge
  return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">🏆 ${sport}</span>`;
}

/**
 * Updates statistical metrics and tables in the HTML DOM view.
 */
function renderDashboard() {
  // 1. Calculate Statistics
  const totalCount = students.length;
  
  // Calculate Average score. If there are no students, average is 0 to prevent NaN.
  const averageScore = totalCount > 0 
    ? Math.round(students.reduce((sum, stu) => sum + stu.score, 0) / totalCount) 
    : 0;
    
  // Find highest score student and details
  let topStudentName = "N/A";
  let topStudentScore = 0;
  if (totalCount > 0) {
    const topStuObj = students.reduce((max, current) => (current.score > max.score ? current : max), students[0]);
    topStudentName = topStuObj.name;
    topStudentScore = topStuObj.score;
  }
  
  // Calculate Pass Rate Percentage (students whose score is >= 50)
  const passedCount = students.filter(stu => stu.score >= 50).length;
  const passPercent = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  // 2. Push Statistic Values into the UI Cards
  document.getElementById("statTotalStudents").innerText = totalCount;
  document.getElementById("statAverageScore").innerText = `${averageScore}%`;
  document.getElementById("statTopScorer").innerText = topStudentName;
  document.getElementById("statTopScoreBadge").innerText = topStudentScore > 0 ? `${topStudentScore} pts` : "0 pts";
  document.getElementById("statPassRate").innerText = `${passPercent}%`;
  
  // Update the progress bars or radial items inside stats card
  const progressRatioEl = document.getElementById("statPassProgressWidth");
  if(progressRatioEl) {
    progressRatioEl.style.width = `${passPercent}%`;
  }

  // Count active players per specific sports for dashboard decorative display
  const countSport = (sport) => students.filter(st => st.sportName.toLowerCase().includes(sport.toLowerCase())).length;
  document.getElementById("footballCount").innerText = `${countSport("foot")} Registered`;
  document.getElementById("cricketCount").innerText = `${countSport("crick")} Registered`;
  document.getElementById("basketballCount").innerText = `${countSport("basket")} Registered`;
  document.getElementById("volleyballCount").innerText = `${countSport("volley")} Registered`;

  // 3. Render Student Records Table
  renderStudentTable();
}

/**
 * Live renders table list with active search search terms and select filter queries.
 */
function renderStudentTable() {
  const tableBody = document.getElementById("studentTableBody");
  const mobileList = document.getElementById("mobileStudentList");
  
  // Get active user text query and convert to lowercase for case-insensitivity
  const searchInput = document.getElementById("searchBar").value.trim().toLowerCase();
  
  // Filter student registry dynamic array
  const filteredStudents = students.filter(stu => {
    // Match 1: Sport name selection logic
    const matchesSport = activeSportFilter === "All" || stu.sportName.toLowerCase() === activeSportFilter.toLowerCase();
    
    // Match 2: Text string lookups on Student Name or Student ID
    const matchesSearch = stu.name.toLowerCase().includes(searchInput) || 
                          stu.id.toLowerCase().includes(searchInput);
                          
    return matchesSport && matchesSearch;
  });

  // Clear existing static table elements inside HTML anchors
  tableBody.innerHTML = "";
  mobileList.innerHTML = "";

  // Show "No Records Found" helper message if matching results list is fully empty
  if (filteredStudents.length === 0) {
    const noRecordsHTML = `
      <tr>
        <td colspan="7" class="py-12 text-center text-slate-400 font-medium">
          <div class="flex flex-col items-center justify-center gap-2">
            <span class="text-3xl">🔍</span>
            <p>No matching student records found</p>
            <p class="text-xs text-slate-400">Try adjusting your filters or typing different keywords</p>
          </div>
        </td>
      </tr>
    `;
    tableBody.innerHTML = noRecordsHTML;
    
    mobileList.innerHTML = `
      <div class="p-8 text-center text-slate-400 text-sm font-medium">
        No matching records found
      </div>
    `;
    return;
  }

  // Iterate over matching records and construct beautiful tabular blocks
  filteredStudents.forEach(stu => {
    const { gradeLetter, resultStatus, colorClass } = calculateGradeAndResult(stu.score);
    const sportBadgeHtml = getSportIconHTML(stu.sportName);

    // Desktop table row construction
    const rowHTML = `
      <tr class="hover:bg-slate-50 border-b border-slate-100 transition-colors">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 font-mono-val">${stu.id}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-semibold text-slate-900">${stu.name}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">${stu.gradeClass}</td>
        <td class="px-6 py-4 whitespace-nowrap">${sportBadgeHtml}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-mono-val font-semibold text-slate-700">${stu.score}%</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2.5 py-1 text-xs font-bold rounded-md border ${colorClass}">
            Grade ${gradeLetter} (${resultStatus})
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div class="flex items-center gap-2">
            <button onclick="triggerReportCard('${stu.id}')" class="p-1 px-2.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md border border-indigo-200 transition-all flex items-center gap-1" title="View Report Card">
              📜 Report Card
            </button>
            <button onclick="startEditingStudent('${stu.id}')" class="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-md border border-transparent hover:border-amber-200 transition-all" title="Edit Student">
              ✏️
            </button>
            <button onclick="deleteStudent('${stu.id}')" class="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-md border border-transparent hover:border-rose-200 transition-all" title="Delete record">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", rowHTML);

    // Mobile grid card construction for seamless adaptive mobile rendering
    const cardHTML = `
      <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-3">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-xs font-mono-val font-bold text-indigo-600">${stu.id}</span>
            <h4 class="text-base font-bold text-slate-900 mt-0.5">${stu.name}</h4>
            <p class="text-xs text-slate-400 font-medium">${stu.gradeClass}</p>
          </div>
          <span class="px-2 py-0.5 text-xs font-bold rounded border ${colorClass}">
            ${gradeLetter} - ${resultStatus}
          </span>
        </div>
        
        <div class="flex items-center justify-between border-t border-slate-50 pt-3">
          <div class="flex items-center gap-2">
            ${sportBadgeHtml}
            <span class="text-xs font-mono-val font-bold text-slate-500">${stu.score}%</span>
          </div>
          
          <div class="flex items-center gap-1.5">
            <button onclick="triggerReportCard('${stu.id}')" class="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100" title="Report Card">📜 Card</button>
            <button onclick="startEditingStudent('${stu.id}')" class="p-1 text-amber-600 hover:bg-amber-50 rounded border border-slate-100">✏️</button>
            <button onclick="deleteStudent('${stu.id}')" class="p-1 text-rose-600 hover:bg-rose-50 rounded border border-slate-100">🗑️</button>
          </div>
        </div>
      </div>
    `;
    mobileList.insertAdjacentHTML("beforeend", cardHTML);
  });
}

/**
 * Configures the form element triggers and active interactive click listening elements.
 */
function setupEventListeners() {
  // 1. Hook up student submission form
  const studentForm = document.getElementById("studentForm");
  studentForm.addEventListener("submit", handleFormSubmission);

  // 2. Clear values button
  const formCancelBtn = document.getElementById("formCancelBtn");
  formCancelBtn.addEventListener("click", resetFormState);

  // 3. Search text dynamic key listener
  const searchBar = document.getElementById("searchBar");
  searchBar.addEventListener("input", renderStudentTable);

  // 4. Bind quick click listening actions to sport selector badges
  const filterElements = document.querySelectorAll(".sport-filter");
  filterElements.forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Remove styling visual emphasis from previously active tab items
      filterElements.forEach(el => {
        el.classList.remove("bg-slate-900", "text-white", "shadow-sm");
        el.classList.add("bg-white", "text-slate-600", "hover:bg-slate-50");
      });
      
      // Assign primary visual design to selected filter element
      btn.classList.remove("bg-white", "text-slate-600", "hover:bg-slate-50");
      btn.classList.add("bg-slate-900", "text-white", "shadow-sm");

      // Extract specific sports metric name and filter table rows
      activeSportFilter = btn.getAttribute("data-sport");
      renderStudentTable();
    });
  });

  // 5. Setup close handler on report card modal structure
  const clBtn = document.getElementById("closeModalBtn");
  if (clBtn) {
    clBtn.addEventListener("click", hideReportCardModal);
  }
}

/**
 * Handles Form submission for both CREATE and UPDATE action types.
 */
function handleFormSubmission(event) {
  // Prevent default HTML page refresh behavior during form submit
  event.preventDefault();

  // Retrieve value metrics from form inputs
  const studentIdInput = document.getElementById("studentId").value.trim().toUpperCase();
  const studentNameInput = document.getElementById("studentName").value.trim();
  const studentClassInput = document.getElementById("studentClass").value.trim();
  const studentSportSelect = document.getElementById("studentSport").value;
  const studentScoreInput = parseInt(document.getElementById("studentScore").value, 10);

  // Form Validation checks
  if (!studentIdInput || !studentNameInput || !studentClassInput || !studentSportSelect || isNaN(studentScoreInput)) {
    showToast("⚠️ Please fill out all required fields carefully", "error");
    return;
  }

  // Score constraint validation
  if (studentScoreInput < 0 || studentScoreInput > 100) {
    showToast("⚠️ Score must evaluate strictly between 0 and 100 max", "error");
    return;
  }

  if (editingStudentId === null) {
    // ---- CREATE MODE (Adding list entry) ----
    
    // Validate unique ID constraints to prevent duplicating student Primary keys
    const isDuplicate = students.some(stu => stu.id === studentIdInput);
    if (isDuplicate) {
      showToast("❌ Duplicate Key Error: Student ID already occupied", "error");
      return;
    }

    const newStudent = {
      id: studentIdInput,
      name: studentNameInput,
      gradeClass: studentClassInput,
      sportName: studentSportSelect,
      score: studentScoreInput
    };

    // Append to core list memory
    students.push(newStudent);
    showToast(`✅ Added registry for "${studentNameInput}" successfully!`, "success");

  } else {
    // ---- UPDATE/EDIT MODE (Saving inplace edit changes) ----
    
    // Identify index slot of edited item
    const index = students.findIndex(st => st.id === editingStudentId);
    if (index !== -1) {
      // Retain or rewrite attributes
      students[index].id = studentIdInput; // Allow updating ID safely
      students[index].name = studentNameInput;
      students[index].gradeClass = studentClassInput;
      students[index].sportName = studentSportSelect;
      students[index].score = studentScoreInput;

      showToast(`💾 Record for "${studentNameInput}" successfully updated!`, "success");
    } else {
      showToast("❌ Failed to relocate selected record index in state", "error");
    }
  }

  // Save changes and refresh visual updates
  saveToLocalStorage();
  renderDashboard();
  resetFormState();
}

/**
 * Prepares the form with active student data, transitioning form wrapper to "Editing Active" state.
 */
function startEditingStudent(id) {
  const targetStudent = students.find(st => st.id === id);
  if (!targetStudent) {
    showToast("❌ Error loading student data", "error");
    return;
  }

  // Lock edit state ID
  editingStudentId = id;

  // Insert targeted student metrics back into input fields
  document.getElementById("studentId").value = targetStudent.id;
  document.getElementById("studentName").value = targetStudent.name;
  document.getElementById("studentClass").value = targetStudent.gradeClass;
  document.getElementById("studentSport").value = targetStudent.sportName;
  document.getElementById("studentScore").value = targetStudent.score;

  // Visual layout feedback changes: Highlight form container with custom alert styles
  const formCard = document.getElementById("studentFormWrapper");
  formCard.classList.add("editing-active", "ring-2", "ring-amber-500/20");
  
  // Highlight title context and submit button text
  document.getElementById("formTitleText").innerText = "✏️ Edit Student Details";
  document.getElementById("formSubmitBtn").innerHTML = `Update Student Details 💾`;
  document.getElementById("formCancelBtn").classList.remove("hidden");

  // Scroll smoothly to form view on smaller responsive grids
  formCard.scrollIntoView({ behavior: "smooth" });
  
  showToast("📝 Loaded student record into form fields", "info");
}

/**
 * Handles deleting a student index.
 */
function deleteStudent(id) {
  const targetStudent = students.find(st => st.id === id);
  if (!targetStudent) return;

  // Trigger browser visual check
  const confirmResult = confirm(`Are you absolutely sure you want to permanently delete the sports record of ${targetStudent.name}?`);
  
  if (confirmResult) {
    // Filter out targeted record using modern JS array filter
    students = students.filter(st => st.id !== id);

    // If deleting the record we are currently editing, reset the edit state
    if (editingStudentId === id) {
      resetFormState();
    }

    saveToLocalStorage();
    renderDashboard();
    showToast(`🗑️ Sporter record of "${targetStudent.name}" deleted from registry`, "info");
  }
}

/**
 * Discharges active editing parameters and restores the form back to simple CREATE modes.
 */
function resetFormState() {
  editingStudentId = null;

  // Clear Form Input fields
  document.getElementById("studentForm").reset();

  // Reset descriptive title and layouts
  const formCard = document.getElementById("studentFormWrapper");
  formCard.classList.remove("editing-active", "ring-2", "ring-amber-500/20");
  
  document.getElementById("formTitleText").innerText = "➕ Add New Student Record";
  document.getElementById("formSubmitBtn").innerHTML = `Save Sporter Record ✨`;
  document.getElementById("formCancelBtn").classList.add("hidden");
}

/**
 * Saves variables state to LocalStorage
 */
function saveToLocalStorage() {
  localStorage.setItem("sports_students", JSON.stringify(students));
}

/**
 * Displays dynamic animated status message banners.
 */
function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toastContainer");
  
  // Create solid elements
  const toastItem = document.createElement("div");
  toastItem.className = `p-4 px-5 rounded-xl shadow-lg border text-sm font-semibold flex items-center justify-between gap-3 toast-slide-in mb-3 backdrop-blur-md`;

  // Apply colors depending on active alert types
  if (type === "success") {
    toastItem.className += " bg-emerald-50 text-emerald-800 border-emerald-100";
  } else if (type === "error") {
    toastItem.className += " bg-rose-50 text-rose-800 border-rose-100";
  } else {
    toastItem.className += " bg-indigo-50 text-indigo-800 border-indigo-100";
  }

  // Fill in active text markup
  toastItem.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 font-mono-val cursor-pointer">&times;</button>
  `;

  // Append new item to live parent container layout stack
  toastContainer.appendChild(toastItem);

  // Set timeout callback to trigger graceful slide out and cleanup
  setTimeout(() => {
    toastItem.classList.replace("toast-slide-in", "toast-fade-out");
    // Purge actual elements fully on animation callback end
    setTimeout(() => {
      toastItem.remove();
    }, 300);
  }, 3500);
}

/**
 * Formulate a narrative motivational quote based on student performance.
 */
function getSportCoachComment(name, sport, score) {
  const n = name.split(" ")[0]; // Get first name for friendly coach tone
  if (score >= 90) {
    return `Coach Comment: Absolutely outstanding! ${n} has shown elite capabilities and represents the true spirit of sportsmanship in ${sport}. Perfect candidate for the varsity development academy.`;
  } else if (score >= 75) {
    return `Coach Comment: Very impressive work! ${n} exercises highly valuable tactical skills in ${sport}. Demonstrates superb discipline and is an asset on any sporting field.`;
  } else if (score >= 60) {
    return `Coach Comment: Good effort. ${n} displays steady skill improvements and is finding reliable footing in ${sport}. Consistent practice will build the necessary confidence leading to championships.`;
  } else if (score >= 50) {
    return `Coach Comment: Fair performance. ${n} maintains functional fundamentals for ${sport} but needs wider development of baseline conditioning and tactical strategies. Keep pushing!`;
  }
  return `Coach Comment: Needs urgent guidance. ${n} struggles with baseline ${sport} coordination rules and practice stamina. Recommendation: Individualized mentoring and additional conditioning labs.`;
}

/**
 * Creates and loads card metrics into the viewer popup layout.
 */
function triggerReportCard(id) {
  const targetStudent = students.find(st => st.id === id);
  if (!targetStudent) return;

  const { gradeLetter, resultStatus } = calculateGradeAndResult(targetStudent.score);
  
  // Update modal contents fields
  document.getElementById("rcName").innerText = targetStudent.name;
  document.getElementById("rcId").innerText = targetStudent.id;
  document.getElementById("rcClass").innerText = targetStudent.gradeClass;
  document.getElementById("rcSport").innerText = targetStudent.sportName;
  document.getElementById("rcScore").innerText = `${targetStudent.score}%`;
  document.getElementById("rcGrade").innerText = gradeLetter;
  
  // Style the dynamic assessment badge based on result pass or fail
  const assessmentBadge = document.getElementById("rcResult");
  assessmentBadge.innerText = resultStatus;
  
  if (resultStatus === "Pass") {
    assessmentBadge.className = "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200";
  } else {
    assessmentBadge.className = "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200";
  }

  // Load custom coach quote elements
  document.getElementById("rcCoachStatement").innerText = getSportCoachComment(targetStudent.name, targetStudent.sportName, targetStudent.score);

  // Set local formatted timestamps
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  document.getElementById("rcDateStamp").innerText = currentDate;

  // Reveal Report Card Modal Layer overlay
  const modal = document.getElementById("reportCardModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  
  // Prevent root body layout scrollbar shifting during active overlays
  document.body.classList.add("overflow-hidden");
}

/**
 * Triggered by cancel click overlay on modal wrappers
 */
function hideReportCardModal() {
  const modal = document.getElementById("reportCardModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");
}

/**
 * Mock print utility trigger
 */
function printReportCard() {
  window.print();
}
