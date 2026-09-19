

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const errorMessage = document.getElementById("errorMessage");
const currentDate = document.getElementById("currentDate");
const filterButtons = document.querySelectorAll(".filter-btn");


let tasks = [];
let currentFilter = "all";

function displayCurrentDate() {
    const today = new Date();

    currentDate.textContent = today.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}


function saveTasks() {
    localStorage.setItem("dailyTasks", JSON.stringify(tasks));
}


function loadTasks() {
    const storedTasks = localStorage.getItem("dailyTasks");

    if (!storedTasks) {
        renderTasks();
        return;
    }

    try {
        const parsed = JSON.parse(storedTasks);

        tasks = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        tasks = [];
    }

    renderTasks();
}


function renderTasks() {

    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (currentFilter === "pending") {
        filteredTasks = tasks.filter(task => !task.completed);
    }

    if (currentFilter === "completed") {
        filteredTasks = tasks.filter(task => task.completed);
    }

    emptyMessage.classList.toggle(
        "d-none",
        filteredTasks.length !== 0
    );

    filteredTasks.forEach(task => {

        const taskElement = document.createElement("div");

        taskElement.className = "task-item";

        taskElement.innerHTML = `
            <div class="task-left">

                <input
                    type="checkbox"
                    class="form-check-input task-checkbox"
                    data-id="${task.id}"
                    ${task.completed ? "checked" : ""}
                >

                <span
                    class="task-title ${task.completed ? "completed" : ""}"
                >
                    ${escapeHTML(task.title)}
                </span>

            </div>

            <div class="task-actions">

                <button
                    class="btn btn-sm btn-outline-secondary edit-btn"
                    data-id="${task.id}"
                >
                    Edit
                </button>

                <button
                    class="btn btn-sm btn-outline-danger delete-btn"
                    data-id="${task.id}"
                >
                    Delete
                </button>

            </div>
        `;

        taskList.appendChild(taskElement);
    });
}

// ===============================
// Add Task
// ===============================

function addTask() {

    const title = taskInput.value.trim();

    if (title === "") {
        errorMessage.classList.remove("d-none");
        taskInput.focus();
        return;
    }

    errorMessage.classList.add("d-none");

    const newTask = {
        id: Date.now(),
        title: title,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();

    taskInput.value = "";

    renderTasks();

    taskInput.focus();
}

// ===============================
// Toggle Task
// ===============================

function updateTask(id, mutator) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return mutator(task);
        }
        return task;
    });
}

function saveAndRender() {
    saveTasks();
    renderTasks();
}

function getTaskElement(selector) {
    return document.querySelector(selector)?.closest(".task-item");
}

function toggleTask(id) {
    updateTask(id, task => ({
        ...task,
        completed: !task.completed
    }));

    saveAndRender();
}



function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    const taskElement = getTaskElement(`.task-checkbox[data-id="${id}"]`);

    if (!taskElement) return;

    taskElement.innerHTML = `
        <div class="task-left">

            <input
                type="text"
                class="form-control edit-input"
                value="${escapeHTML(task.title)}"
            >

        </div>

        <div class="task-actions">

            <button
                class="btn btn-sm btn-success save-btn"
                data-id="${id}"
            >
                Save
            </button>

            <button
                class="btn btn-sm btn-secondary cancel-btn"
                data-id="${id}"
            >
                Cancel
            </button>

        </div>
    `;
}



function saveEditedTask(id) {

    const taskElement = getTaskElement(`.save-btn[data-id="${id}"]`);

    if (!taskElement) return;

    const input = taskElement.querySelector(".edit-input");

    const newTitle = input.value.trim();

    if (newTitle === "") {
        input.focus();
        return;
    }

    updateTask(id, task => ({
        ...task,
        title: newTitle
    }));

    saveAndRender();
}

// ===============================
// Delete Task
// ===============================

function deleteTask(id) {

    tasks = tasks.filter(task => task.id !== id);

    saveAndRender();
}



function cancelEdit() {
    renderTasks();
}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    addTask();
});



taskList.addEventListener("click", function(event) {

    const id = Number(event.target.dataset.id);

    if (event.target.classList.contains("edit-btn")) {
        editTask(id);
    }

    if (event.target.classList.contains("delete-btn")) {
        deleteTask(id);
    }

    if (event.target.classList.contains("save-btn")) {
        saveEditedTask(id);
    }

    if (event.target.classList.contains("cancel-btn")) {
        cancelEdit();
    }
});



taskList.addEventListener("change", function(event) {

    if (event.target.classList.contains("task-checkbox")) {

        const id = Number(event.target.dataset.id);

        toggleTask(id);
    }
});

filterButtons.forEach(button => {

    button.addEventListener("click", function() {

        currentFilter = this.dataset.filter;

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        renderTasks();
    });
});



displayCurrentDate();

loadTasks();