let editDate = '';
let editIndex = -1;
let currentEditElement = null;

document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
});

function addFood() {
    const foodInput = document.getElementById('foodInput').value;
    if (foodInput.trim() === '') return;

    const date = new Date();
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const time = `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
    const entry = `${time} - ${foodInput}`;

    let savedEntries = JSON.parse(localStorage.getItem('dailyTrackerEntries')) || {};
    if (!savedEntries[formattedDate]) {
        savedEntries[formattedDate] = [];
    }

    savedEntries[formattedDate].push({ text: entry });
    localStorage.setItem('dailyTrackerEntries', JSON.stringify(savedEntries));

    document.getElementById('foodInput').value = '';

    updateDailyTracker();
}

function updateDailyTracker() {
    const dailyTrackerContainer = document.querySelector('.container.daily .textCals');
    let savedEntries = JSON.parse(localStorage.getItem('dailyTrackerEntries')) || {};

    dailyTrackerContainer.innerHTML = '';

    Object.keys(savedEntries).forEach(date => {
        const dateHeader = document.createElement('p');
        dateHeader.innerText = `Date: ${date}`;
        dateHeader.style.fontWeight = 'bold';
        dailyTrackerContainer.appendChild(dateHeader);

        savedEntries[date].forEach((entry, index) => {
            const entryContainer = document.createElement('div');
            entryContainer.className = 'entryContainer';

            const p = document.createElement('p');
            p.innerText = entry.text;
            entryContainer.appendChild(p);

            const editButton = document.createElement('button');
            editButton.innerText = 'Edit';
            editButton.onclick = () => editEntry(date, index, entry.text, entryContainer);
            entryContainer.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Delete';
            deleteButton.onclick = () => deleteEntry(date, index);
            entryContainer.appendChild(deleteButton);

            dailyTrackerContainer.appendChild(entryContainer);
        });
    });
}

function editEntry(date, index, entryText, entryContainer) {
    const editForm = document.getElementById('editForm');
    const editTextArea = document.getElementById('editTextArea');
    
    editDate = date;
    editIndex = index;

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
        savedEntries[editDate][editIndex].text = updatedEntry;
        localStorage.setItem('dailyTrackerEntries', JSON.stringify(savedEntries));

        document.getElementById('editForm').style.display = 'none';
        updateDailyTracker();
    }
}

function cancelEdit() {
    document.getElementById('editForm').style.display = 'none';
}

function loadSavedData() {
    updateDailyTracker();
}

function deleteEntry(date, index) {
    let savedEntries = JSON.parse(localStorage.getItem('dailyTrackerEntries')) || {};

    if (savedEntries[date]) {
        savedEntries[date].splice(index, 1); 
        
        if (savedEntries[date].length === 0) {
            delete savedEntries[date];
        }

        localStorage.setItem('dailyTrackerEntries', JSON.stringify(savedEntries));

        updateDailyTracker();
    }
}

const heightInMeters = 1.49;

document.addEventListener('DOMContentLoaded', () => {
    loadSavedWeightData();
});

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

const TDEE = 1569; 
const calorieLimit = 995; 

function updateReports() {
    const now = new Date();
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const formattedDateTime = now.toLocaleDateString('en-US', options).replace(',', '');
    
    document.getElementById('dateTime').innerText = `as of ${formattedDateTime}:`;

    let savedWeights = JSON.parse(localStorage.getItem('weightEntries')) || {};
    let lastEntry = Object.keys(savedWeights).pop();
    let entry = savedWeights[lastEntry] || { weight: '--', bmi: '--' };
    
    document.getElementById('currentWeight').innerText = `cw: ${entry.weight}kg`;
    document.getElementById('currentBMI').innerText = `cbmi: ${entry.bmi}`;

    const goalWeight = 35; 
    const weightToLose = goalWeight - parseFloat(entry.weight || 0);
    document.getElementById('kgToLose').innerText = `kg to lose: ${weightToLose.toFixed(1)}`;

    const totalCaloriesConsumed = calculateTotalCaloriesConsumed();
    const caloriesLost = TDEE - totalCaloriesConsumed;
    const caloriesLeft = calorieLimit - totalCaloriesConsumed;

    document.getElementById('totalCaloriesConsumed').innerText = `total calories consumed today: ${totalCaloriesConsumed}`;
    document.getElementById('caloriesLost').innerText = `calories burned: ${caloriesLost}`;
    document.getElementById('caloriesLeft').innerText = `calories left: ${caloriesLeft}`;
}

function calculateTotalCaloriesConsumed() {
    let savedEntries = JSON.parse(localStorage.getItem('dailyTrackerEntries')) || {};
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    let totalCalories = 0;

    if (savedEntries[formattedDate]) {
        savedEntries[formattedDate].forEach(entry => {
            const calories = extractCalories(entry.text);
            if (!isNaN(calories)) {
                totalCalories += calories;
            }
        });
    }

    return totalCalories;
}

function extractCalories(text) {
    const match = text.match(/(\d+)cals?/i); 
    return match ? parseInt(match[1], 10) : 0;
}

document.addEventListener('DOMContentLoaded', () => {
    updateReports();
});

function updateWeightTracker() {
    const weightContainer = document.querySelector('.container.weight .weightEntries');
    let savedWeights = JSON.parse(localStorage.getItem('weightEntries')) || {};

    weightContainer.innerHTML = '';

    Object.keys(savedWeights).forEach(date => {
        const entry = savedWeights[date];
        const weightEntry = document.createElement('p');
        weightEntry.innerText = `${date}: ${entry.weight}kg, bmi ${entry.bmi}`;
        weightContainer.appendChild(weightEntry);
    });
}

function loadSavedWeightData() {
    updateWeightTracker();
}

