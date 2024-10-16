/**
 * Adds a new task to the specified quadrant.
 * @param {string} quadrant - The ID of the quadrant to add the task to.
 * @param {string} task - The task to be added.
 */
function addTask(quadrant, task) {
    const list = document.getElementById(`${quadrant}-list`);
    const li = document.createElement('li');
    li.textContent = task;
    list.appendChild(li);

    // Save tasks to localStorage
    saveTasks();
}

// Load tasks from localStorage on startup
document.addEventListener('DOMContentLoaded', () => {
    const quadrants = ['urgent-important', 'not-urgent-important', 'urgent-not-important', 'not-urgent-not-important'];
    
    quadrants.forEach(quadrant => {
        const tasks = JSON.parse(localStorage.getItem(quadrant) || '[]');
        const list = document.getElementById(`${quadrant}-list`);
        
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task;
            list.appendChild(li);
        });
    });

    // Add these new event listeners
    document.getElementById('toggle-panel').addEventListener('click', togglePanel);
    document.getElementById('add-task-button').addEventListener('click', addNewTask);
});

/**
 * Saves all tasks to localStorage before the window is closed.
 * This ensures that tasks persist between sessions.
 */
window.addEventListener('beforeunload', () => {
    const quadrants = ['urgent-important', 'not-urgent-important', 'urgent-not-important', 'not-urgent-not-important'];
    
    quadrants.forEach(quadrant => {
        const list = document.getElementById(`${quadrant}-list`);
        const tasks = Array.from(list.children).map(li => li.textContent);
        localStorage.setItem(quadrant, JSON.stringify(tasks));
    });
});

/**
 * Toggles the visibility of the add task panel.
 */
function togglePanel() {
    const panel = document.getElementById('add-task-panel');
    panel.classList.toggle('collapsed');
}

/**
 * Adds a new task based on the input and checkbox states.
 */
function addNewTask() {
    const taskInput = document.getElementById('new-task-input');
    const urgentCheckbox = document.getElementById('urgent-checkbox');
    const importantCheckbox = document.getElementById('important-checkbox');
    
    const task = taskInput.value.trim();
    if (task) {
        let quadrant = '';
        if (urgentCheckbox.checked && importantCheckbox.checked) {
            quadrant = 'urgent-important';
        } else if (urgentCheckbox.checked && !importantCheckbox.checked) {
            quadrant = 'urgent-not-important';
        } else if (!urgentCheckbox.checked && importantCheckbox.checked) {
            quadrant = 'not-urgent-important';
        } else {
            quadrant = 'not-urgent-not-important';
        }
        
        addTask(quadrant, task);
        taskInput.value = '';
        urgentCheckbox.checked = false;
        importantCheckbox.checked = false;
    }
}
