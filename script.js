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

    const sortedDates = Object.keys(savedEntries).sort((a, b) => new Date(b) - new Date(a));

    sortedDates.forEach(date => {
        const dateHeader = document.createElement('p');
        dateHeader.innerText = `${date}`;
        dateHeader.style.fontWeight = 'bold';
        dateHeader.className = 'dateHeader'; 

        dailyTrackerContainer.appendChild(dateHeader);

        const dateEntriesContainer = document.createElement('div');
        dateEntriesContainer.className = 'dateEntriesContainer';

        savedEntries[date].reverse().forEach((entry, index) => {
            const entryContainer = document.createElement('div');
            entryContainer.className = 'entryContainer';

            const entryContent = document.createElement('div');
            entryContent.className = 'entryContent';
            entryContent.innerHTML = `
                <p>${entry.text}</p>
            `;

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'buttonContainer';
            buttonContainer.innerHTML = `
                <button class="editButton">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                        <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                    </svg>
                </button>
                <button class="deleteButton">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                        <path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z"/>
                    </svg>
                </button>
            `;

            buttonContainer.querySelector('.editButton').onclick = () => editEntry(date, index, entry.text, entryContainer);
            buttonContainer.querySelector('.deleteButton').onclick = () => deleteEntry(date, index);

            entryContainer.appendChild(entryContent);
            entryContainer.appendChild(buttonContainer);

            dateEntriesContainer.appendChild(entryContainer);
        });

        dailyTrackerContainer.appendChild(dateEntriesContainer);
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

const TDEE = 1596; 
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

    let savedExercises = JSON.parse(localStorage.getItem('exerciseEntries')) || {};
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    const caloriesBurned = savedExercises[formattedDate] || 0;
    const totalCaloriesConsumed = calculateTotalCaloriesConsumed();
    const caloriesLost = TDEE - totalCaloriesConsumed;
    const caloriesLeft = calorieLimit - totalCaloriesConsumed;

    document.getElementById('totalCaloriesConsumed').innerText = `total calories consumed today: ${totalCaloriesConsumed}`;
    document.getElementById('caloriesLost').innerText = `total daily energy expenditure: ${caloriesLost}`;
    document.getElementById('caloriesLeft').innerText = `calories left: ${caloriesLeft}`;
    document.getElementById('caloriesBurned').innerText = `calories burned from exercise: ${caloriesBurned}`;

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

    const sortedDates = Object.keys(savedWeights).sort((a, b) => new Date(b) - new Date(a));

    sortedDates.forEach(date => {
        const entry = savedWeights[date];
        const weightEntry = document.createElement('p');
        weightEntry.innerText = `${date}: ${entry.weight}kg, bmi ${entry.bmi}`;
        weightContainer.appendChild(weightEntry);
    });
}

function loadSavedWeightData() {
    updateWeightTracker();
}

function addExercise() {
    const exerciseCaloriesInput = document.getElementById('caloriesBurned').value;

    if (exerciseCaloriesInput.trim() === '' || isNaN(exerciseCaloriesInput)) return;

    const date = new Date();
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const caloriesBurned = parseInt(exerciseCaloriesInput);

    let savedExercises = JSON.parse(localStorage.getItem('exerciseEntries')) || {};
    savedExercises[formattedDate] = caloriesBurned; 
    localStorage.setItem('exerciseEntries', JSON.stringify(savedExercises));

    document.getElementById('caloriesBurned').value = '';
}

function clearCaloriesBurned() {
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    
    let savedExercises = JSON.parse(localStorage.getItem('exerciseEntries')) || {};
    delete savedExercises[formattedDate]; 
    localStorage.setItem('exerciseEntries', JSON.stringify(savedExercises));
    
    updateReports();
}
