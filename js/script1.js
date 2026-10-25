// ---------- DATA ----------
// Each task: id (number), title (string), priority (string),
// hours (number), urgent (boolean), status (string)
let tasks = [
  { id: 1,  title: "Web Assignment 5",       priority: "high",   hours: 2,   urgent: true,  status: "progress" },
  { id: 2,  title: "COA assignment 8",        priority: "Medium",   hours: 1,   urgent: false,  status: "progress" },
  { id: 3,  title: "District Mathmatics study",         priority: "medium", hours: 2,   urgent: false, status: "todo" },
  { id: 4,  title: "COA study Quiz",     priority: "medium", hours: 4,   urgent: false, status: "todo" },
  { id: 5,  title: "Web study Quiz",  priority: "medium",    hours: 2, urgent: false, status: "todo" },
  { id: 6,  title: "Prepare Arabic lesson",       priority: "medium", hours: 1,   urgent: false, status: "done" },
  { id: 7,  title: "Kazakh languge study",       priority: "medium", hours: 2,   urgent: false, status: "done" },
  { id: 8,  title: "IFP final project",       priority: "high",   hours: 6,   urgent: true,  status: "todo" },
  { id: 9,  title: "IFP study Quize",  priority: "medium",    hours: 2, urgent: false, status: "done" },
  { id: 10, title: "COA presentaion",  priority: "low",    hours: 2, urgent: false, status: "done" },
];
 
let nextId = 11;          // id for the next new task
let searchText = "";      // current search text
let message = "";         // message shown to the user
const MAX_IN_PROGRESS = 3;
 
// The three sections in order
const columns = [
  { status: "todo",     title: "To do" },
  { status: "progress", title: "In progress" },
  { status: "done",     title: "Done" }
];
 
// ---------- PAGE ELEMENTS ----------
const addForm = document.getElementById("add-form");
const taskInput = document.getElementById("task-input");
const priorityInput = document.getElementById("priority-input");
const searchInput = document.getElementById("search-input");
const messageBox = document.getElementById("message");
const progressBox = document.getElementById("stats");
const board = document.getElementById("board");
 
// ---------- HELPER FUNCTIONS ----------
 
// Count how many tasks have a given status (uses our own loop)
function countByStatus(status) {
  let count = 0;
  for (const task of tasks) {
    if (task.status === status) {
      count++;
    }
  }
  return count;
}
 
// Total hours of all tasks that are done (our own loop)
function doneHours() {
  let total = 0;
  for (const task of tasks) {
    if (task.status === "done") {
      total = total + task.hours;
    }
  }
  return total;
}
 
// Move a task one step: direction is +1 (next) or -1 (back)
function moveTask(id, direction) {
  let task = null;
  for (const t of tasks) {
    if (t.id === id) {
      task = t;
    }
  }
 
  // find the position of the current section: 0, 1 or 2
  let position = 0;
  for (let i = 0; i < columns.length; i++) {
    if (columns[i].status === task.status) {
      position = i;
    }
  }
 
  const newStatus = columns[position + direction].status;
 
  // RULE: In progress can hold at most 3 cards
  if (newStatus === "progress" && countByStatus("progress") >= MAX_IN_PROGRESS) {
    message = "You can only have " + MAX_IN_PROGRESS + " tasks in progress. Finish one first!";
    return;
  }
 
  task.status = newStatus;
  message = "";
}
 
// ---------- RENDER ----------
 
function createCard(task, position) {
  const card = document.createElement("div");
  card.classList.add("card");
  if (task.status === "done") {
    card.classList.add("done");
  }
 
  const title = document.createElement("h3");
  title.textContent = task.title;
 
  const info = document.createElement("p");
  let infoText = task.priority + " priority, " + task.hours + " h";
  if (task.urgent) {
    const urgentspan = document.createElement("span");
    urgentspan.classList.add("urgent");
    urgentspan.textContent = " urgent!";
    info.append(urgentspan);
  }
  
  card.append(title, info);
 
  // Back button (not for the first section)
  if (position > 0) {
    const backBtn = document.createElement("button");
    backBtn.textContent = "← " + columns[position - 1].title;
    backBtn.dataset.id = task.id;
    backBtn.dataset.direction = -1;
    if(backBtn.textContent === "← In progress"){//give styling
      backBtn.classList.add("btn", "btn-outline-warning");
    }
    else if(backBtn.textContent === "← To do"){//give styling
       backBtn.classList.add("btn", "btn-outline-danger","mb-2");
    }
    card.append(backBtn);
  }
 
  // Next button (not for the last section)
  if (position < columns.length - 1) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = columns[position + 1].title + " →";
    nextBtn.dataset.id = task.id;
    nextBtn.dataset.direction = 1;
    if(nextBtn.textContent === "In progress →"){//give styling
      nextBtn.classList.add("btn", "btn-outline-warning");
    }
    else if(nextBtn.textContent === "Done →"){//give styling
       nextBtn.classList.add("btn", "btn-outline-success");
    }
    card.append(nextBtn);
  }
 
  return card;
}
 
function render() {
  // 1. message
  messageBox.textContent = message;
 
  // 2. progress bar
  const total = tasks.length;
  const done = countByStatus("done");
  let percent = 0;
  if (total > 0) {
    percent = Math.round((done / total) * 100);
  }
 
  progressBox.textContent = "";
  const progressText = document.createElement("div");
  progressText.textContent =
    done + " of " + total + " done (" + percent + "%), " + doneHours() + " hours studied";
  const bar = document.createElement("div");
  bar.classList.add("progress-bar");
  const fill = document.createElement("div");
  fill.classList.add("progress-fill");
  fill.style.width = percent + "%";
  bar.append(fill);
  progressBox.append(progressText, bar);
 
  // 3. columns (sections)
  board.textContent = "";
 
  for (let i = 0; i < columns.length; i++) {
    const column = document.createElement("div");
    column.classList.add("column", "col-" + columns[i].status);
 
    const heading = document.createElement("h2");
    heading.textContent = columns[i].title;
    column.append(heading);
 
    let cardsShown = 0;
 
    for (const task of tasks) {
      // only tasks of this section that match the search
      const matches = task.title.toLowerCase().includes(searchText.toLowerCase());
      if (task.status === columns[i].status && matches) {
        column.append(createCard(task, i));
        cardsShown++;
      }
    }
 
    // message when nothing is found
    if (cardsShown === 0) {
      const empty = document.createElement("p");
      empty.classList.add("empty-text");
      if (searchText !== "") {
        empty.textContent = "Nothing found.";
      } else {
        empty.textContent = "No tasks here yet.";
      }
      column.append(empty);
    }
 
    board.append(column);
  }
}
 
// ---------- EVENTS ----------
 
// Add a new task (goes to "To do")
addForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (text === "") {
    return;
  }
 
  tasks.push({
    id: nextId,
    title: text,
    priority: priorityInput.value,
    hours: 1,
    urgent: priorityInput.value === "high",
    status: "todo"
  });
  nextId++;
  message = "";
  taskInput.value = "";
  render();
});
 
// Search
searchInput.addEventListener("input", function () {
  searchText = searchInput.value;
  render();
});
 
// ONE listener on the board for all buttons (event delegation)
board.addEventListener("click", function (event) {
  const button = event.target;
  if (button.dataset.direction === undefined) {
    return; // clicked something that is not a move button
  }
  moveTask(Number(button.dataset.id), Number(button.dataset.direction));
  render();
});
 
// ---------- START ----------
render();