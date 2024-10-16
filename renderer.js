/**
 * Adds a new task to the specified quadrant.
 * @param {string} quadrant - The ID of the quadrant to add the task to.
 * @param {string} task - The task to be added.
 */
function addTask(quadrant, task) {
    const list = document.getElementById(`${quadrant}-list`);
    const li = document.createElement('li');
    li.textContent = task;
    li.draggable = true;
    li.addEventListener('dragstart', drag);
    li.id = 'task-' + Date.now(); // Unique ID for each task
    list.appendChild(li);

    // Save tasks to localStorage
    saveTasks();
}

/**
 * Allows an element to receive dropped items.
 * @param {Event} ev - The dragover event.
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * Handles the start of a drag operation.
 * @param {Event} ev - The dragstart event.
 */
function drag(ev) {
    console.log('Drag started', ev.target.id);
    ev.dataTransfer.setData("text", ev.target.id);
}

/**
 * Handles the drop of an item.
 * @param {Event} ev - The drop event.
 */
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    console.log('Drop', data);
    ev.target.closest('.quadrant').querySelector('ul').appendChild(document.getElementById(data));

    // Save tasks to localStorage after moving
    saveTasks();
}

/**
 * Saves all tasks to localStorage.
 */
function saveTasks() {
    const tasks = {};
    document.querySelectorAll('.quadrant').forEach(quadrant => {
        const quadrantId = quadrant.id;
        const taskList = quadrant.querySelector('ul');
        tasks[quadrantId] = Array.from(taskList.children).map(li => li.textContent);
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Loads tasks from localStorage and populates the quadrants.
 */
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
    Object.entries(tasks).forEach(([quadrantId, taskList]) => {
        taskList.forEach(task => addTask(quadrantId, task));
    });
}

// Load tasks from localStorage on startup
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
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
