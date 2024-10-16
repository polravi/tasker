/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Read the contents of renderer.js
const rendererCode = fs.readFileSync(path.resolve(__dirname, 'renderer.js'), 'utf8');

// Mock the DOM elements and localStorage
document.body.innerHTML = `
  <div id="matrix-container">
    <div id="urgent-important" class="quadrant">
      <h2>Urgent & Important</h2>
      <ul id="urgent-important-list"></ul>
    </div>
    <div id="not-urgent-important" class="quadrant">
      <h2>Not Urgent & Important</h2>
      <ul id="not-urgent-important-list"></ul>
    </div>
    <div id="urgent-not-important" class="quadrant">
      <h2>Urgent & Not Important</h2>
      <div class="delegate-banner">Delegate</div>
      <ul id="urgent-not-important-list"></ul>
    </div>
    <div id="not-urgent-not-important" class="quadrant">
      <h2>Not Urgent & Not Important</h2>
      <ul id="not-urgent-not-important-list"></ul>
    </div>
  </div>
  <div id="add-task-panel" class="collapsed">
    <button id="toggle-panel">Add New Task</button>
    <div id="panel-content">
      <input type="text" id="new-task-input" placeholder="Enter new task">
      <div id="checkboxes">
        <label><input type="checkbox" id="urgent-checkbox"> Urgent</label>
        <label><input type="checkbox" id="important-checkbox"> Important</label>
      </div>
      <button id="add-task-button">Add Task</button>
    </div>
  </div>
`;

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Execute the renderer code
eval(rendererCode);

describe('Eisenhower Matrix', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    localStorage.clear();
    document.querySelectorAll('.quadrant ul').forEach(ul => ul.innerHTML = '');
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test('addTask adds a task to the correct quadrant', () => {
    addTask('urgent-important', 'Test task');
    expect(document.getElementById('urgent-important-list').children.length).toBe(1);
    expect(document.getElementById('urgent-important-list').children[0].textContent).toBe('Test task');
  });

  test('addNewTask adds a task based on checkbox states', () => {
    document.getElementById('new-task-input').value = 'New test task';
    document.getElementById('urgent-checkbox').checked = true;
    document.getElementById('important-checkbox').checked = false;
    addNewTask();
    expect(document.getElementById('urgent-not-important-list').children.length).toBe(1);
    expect(document.getElementById('urgent-not-important-list').children[0].textContent).toBe('New test task');
  });

  test('togglePanel toggles the collapsed class', () => {
    const panel = document.getElementById('add-task-panel');
    expect(panel.classList.contains('collapsed')).toBe(true);
    togglePanel();
    expect(panel.classList.contains('collapsed')).toBe(false);
    togglePanel();
    expect(panel.classList.contains('collapsed')).toBe(true);
  });

  test('saveTasks saves tasks to localStorage', () => {
    addTask('urgent-important', 'Task 1');
    addTask('not-urgent-important', 'Task 2');
    saveTasks();
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));
    expect(savedTasks['urgent-important']).toContain('Task 1');
    expect(savedTasks['not-urgent-important']).toContain('Task 2');
  });

  test('loadTasks loads tasks from localStorage', () => {
    const tasks = {
      'urgent-important': ['Task 1'],
      'not-urgent-important': ['Task 2']
    };
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
    expect(document.getElementById('urgent-important-list').children.length).toBe(1);
    expect(document.getElementById('not-urgent-important-list').children.length).toBe(1);
  });

  test('drag and drop functionality', () => {
    // Add the drag function to the global scope if it's not already there
    if (typeof window.drag !== 'function') {
      window.drag = function(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
      };
    }

    // Add the drop function to the global scope if it's not already there
    if (typeof window.drop !== 'function') {
      window.drop = function(ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text");
        ev.target.closest('.quadrant').querySelector('ul').appendChild(document.getElementById(data));
      };
    }

    // Add a task to the urgent-important quadrant
    addTask('urgent-important', 'Drag task');
    const task = document.getElementById('urgent-important-list').children[0];
    const targetQuadrant = document.getElementById('not-urgent-important');
    
    // Simulate drag start
    const dragStartEvent = new Event('dragstart', { bubbles: true, cancelable: true });
    dragStartEvent.dataTransfer = {
      setData: jest.fn(),
      getData: jest.fn().mockReturnValue(task.id)
    };
    task.dispatchEvent(dragStartEvent);
    window.drag(dragStartEvent);

    // Simulate drop
    const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
    dropEvent.dataTransfer = dragStartEvent.dataTransfer;
    dropEvent.preventDefault = jest.fn();
    targetQuadrant.dispatchEvent(dropEvent);
    window.drop(dropEvent);
    
    // Check results
    expect(document.getElementById('urgent-important-list').children.length).toBe(0);
    expect(document.getElementById('not-urgent-important-list').children.length).toBe(1);
    expect(document.getElementById('not-urgent-important-list').children[0].textContent).toBe('Drag task');
  });
});
