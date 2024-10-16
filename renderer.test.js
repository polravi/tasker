// Mock the DOM elements and localStorage
document.body.innerHTML = `
  <div id="urgent-important">
    <ul id="urgent-important-list"></ul>
    <input type="text" id="urgent-important-input">
  </div>
  <div id="not-urgent-important">
    <ul id="not-urgent-important-list"></ul>
    <input type="text" id="not-urgent-important-input">
  </div>
  <div id="urgent-not-important">
    <ul id="urgent-not-important-list"></ul>
    <input type="text" id="urgent-not-important-input">
  </div>
  <div id="not-urgent-not-important">
    <ul id="not-urgent-not-important-list"></ul>
    <input type="text" id="not-urgent-not-important-input">
  </div>
`;

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

// Import the functions to test
const fs = require('fs');
const path = require('path');
const rendererCode = fs.readFileSync(path.resolve(__dirname, 'renderer.js'), 'utf8');
eval(rendererCode);

describe('Eisenhower Matrix Functions', () => {
  beforeEach(() => {
    // Clear the DOM and localStorage before each test
    document.querySelectorAll('ul').forEach(ul => ul.innerHTML = '');
    localStorage.clear();
  });

  test('addTask adds a task to the correct quadrant', () => {
    const quadrant = 'urgent-important';
    const input = document.getElementById(`${quadrant}-input`);
    input.value = 'Test task';

    addTask(quadrant);

    const list = document.getElementById(`${quadrant}-list`);
    expect(list.children.length).toBe(1);
    expect(list.children[0].textContent).toBe('Test task');
    expect(input.value).toBe('');
  });

  test('addTask does not add empty tasks', () => {
    const quadrant = 'urgent-important';
    const input = document.getElementById(`${quadrant}-input`);
    input.value = '   ';

    addTask(quadrant);

    const list = document.getElementById(`${quadrant}-list`);
    expect(list.children.length).toBe(0);
  });

  test('DOMContentLoaded event loads tasks from localStorage', () => {
    const quadrant = 'urgent-important';
    localStorage.setItem(quadrant, JSON.stringify(['Task 1', 'Task 2']));

    // Simulate DOMContentLoaded event
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const list = document.getElementById(`${quadrant}-list`);
    expect(list.children.length).toBe(2);
    expect(list.children[0].textContent).toBe('Task 1');
    expect(list.children[1].textContent).toBe('Task 2');
  });

  test('beforeunload event saves tasks to localStorage', () => {
    const quadrant = 'urgent-important';
    const list = document.getElementById(`${quadrant}-list`);
    
    // Add some tasks
    ['Task 1', 'Task 2'].forEach(task => {
      const li = document.createElement('li');
      li.textContent = task;
      list.appendChild(li);
    });

    // Simulate beforeunload event
    window.dispatchEvent(new Event('beforeunload'));

    const savedTasks = JSON.parse(localStorage.getItem(quadrant));
    expect(savedTasks).toEqual(['Task 1', 'Task 2']);
  });
});
