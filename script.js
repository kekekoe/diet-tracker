document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    loadSavedWeightData();
    updateReports();
    console.log('weight.html script loaded');
    updateWeightTracker();
});

let editDate = '';
let editIndex = -1;
let currentEditElement = null;

function addFood() {
    const foodInput = document.getElementById('foodInput').value;
    if (foodInput.trim() === '') return;

    const date = new Date();
    const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
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
    const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
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

function updateDailyTracker() {
    const dailyTrackerContainer = document.querySelector('.container .textCals');
    let savedEntries = JSON.parse(localStorage.getItem('dailyTrackerEntries')) || {};

    dailyTrackerContainer.innerHTML = '';
    const sortedDates = Object.keys(savedEntries).sort((a, b) => new Date(b) - new Date(a));

    sortedDates.forEach(date => {
        const dateHeader = document.createElement('p');
        dateHeader.innerText = `${date}:`;
        dateHeader.style.fontStyle = 'italic';
        dateHeader.style.fontSize = 'large';
        dateHeader.style.marginBottom = '0px';
        dateHeader.style.marginTop = '20px';
        dateHeader.className = 'dateHeader';

        dailyTrackerContainer.appendChild(dateHeader);

        const dateEntriesContainer = document.createElement('div');
        dateEntriesContainer.className = 'dateEntriesContainer';

        savedEntries[date].reverse().forEach(entry => {
            const entryContainer = document.createElement('div');
            entryContainer.className = 'entryContainer';

            const entryContent = document.createElement('div');
            entryContent.className = 'entryContent';
            entryContent.innerHTML = `<p>${entry.text}</p>`;

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

        dailyTrackerContainer.appendChild(dateEntriesContainer);
    });
}

function editEntry(date, id, entryText, entryContainer) {
    const editForm = document.getElementById('editForm');
    const editTextArea = document.getElementById('editTextArea');

    editDate = date;
    editIndex = id;

    const [time, ...textParts] = entryText.split(' - ');
    const newText = textParts.join(' - ');

    editForm.style.top = `${entryContainer.offsetTop}px`;
    editForm.style.left = `${entryContainer.offsetLeft}px`;
    editTextArea.value = newText;
    editForm.style.display = 'block';

    currentEditElement = {
        container: entryContainer,
        time: time
    };
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

const TDEE = 1596;
const calorieLimit = 995;

function updateReports() {
    const now = new Date();
    const formattedDateTime = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    document.getElementById('dateTime').innerText = `as of ${formattedDateTime}:`;

    let savedWeights = JSON.parse(localStorage.getItem('weightEntries')) || [];
    let lastEntry = savedWeights.pop() || { weight: '--', bmi: '--' };

    document.getElementById('currentWeight').innerText = `cw: ${lastEntry.weight}kg`;
    document.getElementById('currentBMI').innerText = `cbmi: ${lastEntry.bmi}`;

    const goalWeight = 35;
    const weightToLose = goalWeight - parseFloat(lastEntry.weight || 0);
    document.getElementById('kgToLose').innerText = `kg to lose: ${weightToLose.toFixed(1)}`;

    const totalCaloriesConsumed = calculateTotalCaloriesConsumed();
    const totalExerciseCalories = calculateTotalExerciseCalories();
    const netCalories = totalCaloriesConsumed + totalExerciseCalories;
    const caloriesLost = TDEE - netCalories;
    const caloriesLeft = calorieLimit - netCalories;

    document.getElementById('totalCaloriesConsumed').innerText = `total calories consumed today: ${totalCaloriesConsumed}`;
    document.getElementById('caloriesLost').innerText = `total daily energy expenditure: ${caloriesLost}`;
    document.getElementById('caloriesLeft').innerText = `calories left: ${caloriesLeft}`;
    document.getElementById('caloriesBurned').innerText = `calories burned from exercise: ${totalExerciseCalories}`;
    document.getElementById('calorieLimit').innerText = `calorie limit: ${calorieLimit}`;
}

function calculateTotalCaloriesConsumed() {
    let savedEntries = JSON.parse(localStorage.getItem('dailyTrackerEntries')) || {};
    const today = new Date();
    const formattedDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
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
    const formattedDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
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
    const match = text.match(/(-\d+)cals?/i);
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

const heightInMeters = 1.49;

function addWeight() {
    const weightInput = document.getElementById('weightInput').value;

    if (weightInput.trim() === '') return;

    const date = new Date();
    const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    const weight = parseFloat(weightInput);
    const bmi = calculateBMI(weight);

    let savedWeights = JSON.parse(localStorage.getItem('weightEntries')) || [];

    const existingIndex = savedWeights.findIndex(entry => entry.date === formattedDate);
    if (existingIndex > -1) {
        savedWeights[existingIndex] = { date: formattedDate, weight: weight, bmi: bmi };
    } else {
        savedWeights.push({ date: formattedDate, weight: weight, bmi: bmi });
    }

    localStorage.setItem('weightEntries', JSON.stringify(savedWeights));
    document.getElementById('weightInput').value = '';

    updateWeightTracker();
}

function calculateBMI(weight) {
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
}

function updateWeightTracker() {
    const weightContainer = document.querySelector('.weightEntries');

    if (!weightContainer) {
        return;
    }

    let savedWeights = JSON.parse(localStorage.getItem('weightEntries')) || [];

    weightContainer.innerHTML = '';

    savedWeights.reverse().forEach(entry => {
        const weightEntry = document.createElement('p');
        weightEntry.innerText = `${entry.date}: ${entry.weight}kg, bmi ${entry.bmi || '--'}`;
        weightContainer.appendChild(weightEntry);
    });
}

