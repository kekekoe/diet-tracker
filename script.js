let editDate = '';
let editIndex = -1;
let currentEditElement = null;
let currentEditDate = '';
let currentEditId = -1;

document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    loadSavedWeightData();
    document.querySelector('.container .textCals').addEventListener('click', handleButtonClick);
});

function addFood() {
    const foodInput = document.getElementById('foodInput').value;
    if (foodInput.trim() === '') return;

    const date = new Date();
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const time = `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
    const id = Date.now(); 
    const entry = { id, text: `${time} - ${foodInput}` };

    let savedEntries = JSON.parse(localStorage.getItem('dailyTrackerEntries')) || {};
    if (!savedEntries[formattedDate]) {
        savedEntries[formattedDate] = [];
    }

    savedEntries[formattedDate].push(entry);
    localStorage.setItem('dailyTrackerEntries', JSON.stringify(savedEntries));

    document.getElementById('foodInput').value = '';

    updateDailyTracker();
}

function addExercise() {
    const exerciseCaloriesInput = document.getElementById('caloriesBurned').value;
    if (exerciseCaloriesInput.trim() === '' || isNaN(exerciseCaloriesInput)) return;

    const date = new Date();
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const time = `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
    const caloriesBurned = parseInt(exerciseCaloriesInput);
    const id = Date.now(); 
    const entry = { id, text: `${time} - exercise: -${caloriesBurned}cals` };

    let savedEntries = JSON.parse(localStorage.getItem('dailyTrackerEntries')) || {};
    if (!savedEntries[formattedDate]) {
        savedEntries[formattedDate] = [];
    }

    savedEntries[formattedDate].push(entry);
    localStorage.setItem('dailyTrackerEntries', JSON.stringify(savedEntries));

    document.getElementById('caloriesBurned').value = '';

    updateDailyTracker();
    updateReports();
}

let expandedMonths = new Set();  

function updateDailyTracker() {
    const dailyTrackerContainer = document.querySelector('.container .textCals');
    let savedEntries = getSavedEntries();
    let savedWeights = getSavedWeights();

    dailyTrackerContainer.innerHTML = '';
    
    const months = {};
    Object.keys(savedEntries).forEach(date => {
        const [month, day, year] = date.split('/');
        const monthYear = `${year}-${month}`; 

        if (!months[monthYear]) {
            months[monthYear] = { entries: [], mostRecentDate: date };
        }

        months[monthYear].entries.push({ date, entries: savedEntries[date] });
        if (new Date(date) > new Date(months[monthYear].mostRecentDate)) {
            months[monthYear].mostRecentDate = date;
        }
    });

    const sortedMonths = Object.keys(months).sort((a, b) => new Date(months[b].mostRecentDate) - new Date(months[a].mostRecentDate));

    if (sortedMonths.length === 0) {
        dailyTrackerContainer.innerHTML = '<p>no entries found . . . ໒꒰ྀིっ -｡꒱ྀི১ </p>';
        return;
    }

    sortedMonths.forEach(monthYear => {
        const [year, month] = monthYear.split('-');
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
        const monthHeaderText = `${monthName} ${year}`;
        
        const monthHeader = document.createElement('div');
        monthHeader.className = 'monthHeader';
        monthHeader.innerHTML = `
            <div style="display: flex; align-items: center; font-style: italic; font-size: large; margin-top: 5px; margin-bottom: 15px;">
                ${monthHeaderText}
                <svg class="expandCollapseIcon" style="cursor: pointer; margin-left: 10px;" xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 0 24 24" width="22px" fill="#000">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M7 10l5 5 5-5H7z"/> 
                </svg>
            </div>
        `;

        const monthEntriesContainer = document.createElement('div');
        monthEntriesContainer.className = 'monthEntriesContainer';
        
        if (expandedMonths.has(monthYear)) {
            monthEntriesContainer.style.display = 'block';
            monthHeader.querySelector('.expandCollapseIcon').innerHTML = '<path d="M0 0h24v24H0z" fill="none"/><path d="M19 13H5v-2h14v2z"/>';
        } else {
            monthEntriesContainer.style.display = 'none';
        }

        const sortedDates = months[monthYear].entries.sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedDates.forEach(({ date, entries }) => {
            const weightDisplay = savedWeights[date] ? `${savedWeights[date].weight}kg` : 'no weight data';
            const dateHeaderText = `${date}: ${weightDisplay}`;

            const dateHeader = document.createElement('p');
            dateHeader.innerText = dateHeaderText;
            dateHeader.style.fontStyle = 'italic';
            dateHeader.style.fontSize = 'large';
            dateHeader.style.marginBottom = '-5px';
            dateHeader.style.marginTop = '5px';
            dateHeader.style.marginLeft= '15px'
            dateHeader.className = 'dateHeader';

            monthEntriesContainer.appendChild(dateHeader);

            const dateEntriesContainer = document.createElement('div');
            dateEntriesContainer.className = 'dateEntriesContainer';

            entries.reverse().forEach(entry => {
                const entryContainer = document.createElement('div');
                entryContainer.className = 'entryContainer';

                const entryContent = document.createElement('div');
                entryContent.className = 'entryContent';
                entryContent.innerHTML = `<p>${entry.text}</p>`;
                entryContent.style.marginBottom = '-10px';
                entryContent.style.marginLeft = '30px';

                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'buttonContainer';
                buttonContainer.innerHTML = `
                    <button class="editButton" data-id="${entry.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed">
                            <path d="M3 17.25V21h3.75L15 14.25l-3.75-3.75L3 17.25zM15.28 6.72l1.48 1.48-6.3 6.3-1.48-1.48 6.3-6.3zM16.89 4.5l1.59 1.59c.25.25.39.58.39.93s-.14.68-.39.93l-7.38 7.38-1.56-1.56 7.38-7.38c.25-.25.58-.39.93-.39s.68.14.93.39z"/>
                        </svg>
                    </button>
                    <button class="deleteButton" data-id="${entry.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2-14h8V4H8v1zm2 10h-2v-6h2v6zm4-6h-2v6h2v-6zm4-1h-1V3H5v1H4v2h16V4h-1v1z"/>
                        </svg>
                    </button>
                `;

                buttonContainer.querySelector('.editButton').onclick = () => editEntry(date, entry.id, entry.text, entryContainer);
                buttonContainer.querySelector('.deleteButton').onclick = () => deleteEntry(date, entry.id);

                entryContainer.appendChild(entryContent);
                entryContainer.appendChild(buttonContainer);

                dateEntriesContainer.appendChild(entryContainer);
            });

            monthEntriesContainer.appendChild(dateEntriesContainer);
        });

        dailyTrackerContainer.appendChild(monthHeader);
        dailyTrackerContainer.appendChild(monthEntriesContainer);

        monthHeader.querySelector('.expandCollapseIcon').onclick = () => {
            const isCollapsed = monthEntriesContainer.style.display === 'none';
            monthEntriesContainer.style.display = isCollapsed ? 'block' : 'none';

            monthHeader.querySelector('.expandCollapseIcon').innerHTML = isCollapsed
                ? '<path d="M0 0h24v24H0z" fill="none"/><path d="M19 13H5v-2h14v2z"/>'
                : '<path d="M0 0h24v24H0z" fill="none"/><path d="M7 10l5 5 5-5H7z"/>';

            if (isCollapsed) {
                expandedMonths.add(monthYear);
            } else {
                expandedMonths.delete(monthYear);
            }
        };
    });
}

function editEntry(date, id, text, entryContainer) {
    editDate = date;
    editIndex = id;
    const [time, entryText] = text.split(' - ');
    currentEditElement = { time, text: entryText };

    document.getElementById('editTextArea').value = currentEditElement.text;
    
    const editForm = document.getElementById('editForm');
    entryContainer.insertAdjacentElement('afterend', editForm);
    editForm.style.display = 'block';
}

function saveEdit() {
    const editTextArea = document.getElementById('editTextArea');
    let savedEntries = JSON.parse(localStorage.getItem('dailyTrackerEntries')) || {};

    if (editDate && editIndex > -1 && currentEditElement) {
        const updatedEntry = `${currentEditElement.time} - ${editTextArea.value}`;
        savedEntries[editDate] = savedEntries[editDate].map(entry =>
            entry.id === editIndex ? { id: entry.id, text: updatedEntry } : entry
        );
        localStorage.setItem('dailyTrackerEntries', JSON.stringify(savedEntries));

        document.getElementById('editForm').style.display = 'none';
        updateDailyTracker();
        updateReports();
    }
}

function deleteEntry(date, id) {
    let savedEntries = JSON.parse(localStorage.getItem('dailyTrackerEntries')) || {};

    if (savedEntries[date]) {
        savedEntries[date] = savedEntries[date].filter(entry => entry.id !== id);

        if (savedEntries[date].length === 0) {
            delete savedEntries[date];
        }

        localStorage.setItem('dailyTrackerEntries', JSON.stringify(savedEntries));

        updateDailyTracker();
        updateReports();
    }
}

function cancelEdit() {
    document.getElementById('editForm').style.display = 'none';
}

const heightInMeters = 1.49;

function addWeight() {
    const weightInput = document.getElementById('weightInput').value;
    if (weightInput.trim() === '') return;

    const date = new Date();
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const weight = parseFloat(weightInput);
    const bmi = calculateBMI(weight);

    let savedWeights = JSON.parse(localStorage.getItem('weightEntries')) || {};
    if (!savedWeights[formattedDate]) {
        savedWeights[formattedDate] = { weight: weight, bmi: bmi };
    } else {
        savedWeights[formattedDate] = { weight: weight, bmi: bmi };
    }

    localStorage.setItem('weightEntries', JSON.stringify(savedWeights));

    document.getElementById('weightInput').value = '';

    updateWeightTracker();
}

function calculateBMI(weight) {
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
}

function updateWeightTracker() {
    const weightContainer = document.querySelector('.container.weight .weightEntries');
    let savedWeights = JSON.parse(localStorage.getItem('weightEntries')) || {};

    weightContainer.innerHTML = '';

    const sortedDates = Object.keys(savedWeights).sort((a, b) => new Date(b) - new Date(a));

    sortedDates.forEach(date => {
        const entry = savedWeights[date];
        const weightEntry = document.createElement('p');
        weightEntry.innerText = `${date}: ${entry.weight}kg, bmi ${entry.bmi}`;
        weightContainer.appendChild(weightEntry);
    });
}

const TDEE = 1554; 

function updateReports() {
    const now = new Date();
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const formattedDateTime = now.toLocaleDateString('en-US', options).replace(',', '');

    document.getElementById('dateTime').innerText = `as of ${formattedDateTime}`;

    let savedEntries = getSavedEntries();
    let savedWeights = getSavedWeights();
    
    const latestWeightEntryDate = Object.keys(savedWeights).pop() || '';
    const latestWeightEntry = savedWeights[latestWeightEntryDate] || { weight: '--', bmi: '--' };

    document.getElementById('currentWeight').innerText = `cw: ${latestWeightEntry.weight}kg`;
    document.getElementById('currentBMI').innerText = `cbmi: ${latestWeightEntry.bmi}`;

    const goalWeight = getGoalWeight(); 
    document.getElementById('goalWeight').innerText = `gw: ${goalWeight}kg`;

    const weightToLose = goalWeight - parseFloat(latestWeightEntry.weight || 0);
    document.getElementById('kgToLose').innerText = `kg to lose: ${weightToLose.toFixed(1)}`;

    const totalCaloriesConsumed = calculateTotalCaloriesConsumed();
    const totalExerciseCalories = calculateTotalExerciseCalories();
    const netCalories = totalCaloriesConsumed - totalExerciseCalories;
    const caloriesLost = TDEE - netCalories; 
    const caloriesLeft = getCalorieLimit() - totalCaloriesConsumed + totalExerciseCalories; 

    document.getElementById('totalCaloriesConsumed').innerText = `total calories consumed today: ${totalCaloriesConsumed}`;
    document.getElementById('caloriesLost').innerText = `caloric deficit/surplus: ${caloriesLost}`;
    document.getElementById('caloriesLeft').innerText = `calories left: ${caloriesLeft}`;
    document.getElementById('caloriesBurned').innerText = `calories burned from exercise: ${totalExerciseCalories}`;
    document.getElementById('calorieLimit').innerText = `calorie limit: ${getCalorieLimit()}`;
    document.getElementById('stepsTakenToday').innerText = `steps taken today: ${calculateTotalSteps()}`;
}

function calculateTotalCaloriesConsumed() {
    let savedEntries = JSON.parse(localStorage.getItem('dailyTrackerEntries')) || {};
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    let totalCalories = 0;

    if (savedEntries[formattedDate]) {
        savedEntries[formattedDate].forEach(entry => {
            if (!entry.text.includes("exercise")) { 
                const calories = extractFoodCalories(entry.text);
                if (!isNaN(calories)) {
                    totalCalories += calories;
                }
            }
        });
    }

    return totalCalories;
}

function calculateTotalExerciseCalories() {
    let savedEntries = JSON.parse(localStorage.getItem('dailyTrackerEntries')) || {};
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    let totalExerciseCalories = 0;

    if (savedEntries[formattedDate]) {
        savedEntries[formattedDate].forEach(entry => {
            if (entry.text.includes("exercise")) {  
                const calories = extractExerciseCalories(entry.text);
                if (!isNaN(calories)) {
                    totalExerciseCalories += calories;
                }
            }
        });
    }

    return totalExerciseCalories;
}

function extractFoodCalories(text) {
    const match = text.match(/(\d+)cals?/i);
    return match ? parseInt(match[1], 10) : 0;
}

function extractExerciseCalories(text) {
    const match = text.match(/(\d+)cals?/i);
    return match ? parseInt(match[1], 10) : 0;
}

document.addEventListener('DOMContentLoaded', () => {
    updateReports();
});

function loadSavedWeightData() {
    updateWeightTracker();
}

function loadSavedData() {
    updateDailyTracker();
    updateReports();
}

function getSavedEntries() {
    return JSON.parse(localStorage.getItem('dailyTrackerEntries')) || {};
}

function getSavedWeights() {
    return JSON.parse(localStorage.getItem('weightEntries')) || {};
}

function addSteps() {
    const stepsInput = document.getElementById('stepsTaken').value;
    if (stepsInput.trim() === '' || isNaN(stepsInput)) return;

    const date = new Date();
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const stepsTaken = parseInt(stepsInput);
    const id = Date.now();
    const entry = { id, text: `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()} - steps: ${stepsTaken}` };

    let savedEntries = JSON.parse(localStorage.getItem('dailyTrackerEntries')) || {};
    if (!savedEntries[formattedDate]) {
        savedEntries[formattedDate] = [];
    }

    savedEntries[formattedDate].push(entry);
    localStorage.setItem('dailyTrackerEntries', JSON.stringify(savedEntries));

    document.getElementById('stepsTaken').value = '';

    updateDailyTracker();
    updateReports();
}

function calculateTotalSteps() {
    let savedEntries = JSON.parse(localStorage.getItem('dailyTrackerEntries')) || {};
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    let totalSteps = 0;

    if (savedEntries[formattedDate]) {
        savedEntries[formattedDate].forEach(entry => {
            if (entry.text.includes("steps:")) {
                const steps = extractSteps(entry.text);
                if (!isNaN(steps)) {
                    totalSteps += steps;
                }
            }
        });
    }

    return totalSteps;
}

function extractSteps(text) {
    const match = text.match(/steps:\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
}

function addGoalWeight() {
    const goalWeightInput = document.getElementById('enterNewGoalWeight').value;
    if (goalWeightInput.trim() === '' || isNaN(goalWeightInput)) return;

    const goalWeight = parseFloat(goalWeightInput);
    localStorage.setItem('goalWeight', goalWeight);

    document.getElementById('enterNewGoalWeight').value = '';
    updateReports();
}

function addNewCalorieLimit() {
    const calorieLimitInput = document.getElementById('newCalorieLimit').value;
    if (calorieLimitInput.trim() === '' || isNaN(calorieLimitInput)) return;

    const calorieLimit = parseInt(calorieLimitInput, 10);
    localStorage.setItem('calorieLimit', calorieLimit);

    document.getElementById('newCalorieLimit').value = '';
    updateReports();
}

function getGoalWeight() {
    return parseFloat(localStorage.getItem('goalWeight')) || 35; 
}

function getCalorieLimit() {
    return parseInt(localStorage.getItem('calorieLimit')) || 700;
}
