// 날짜별 Todo 리스트 객체
let todosByDate = {};

// 오늘 날짜 기본값
function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
let selectedDate = getToday();

// 요소 선택
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

// 날짜 선택 input 추가
let dateInput = document.createElement('input');
dateInput.type = 'date';
dateInput.value = selectedDate;
dateInput.className = 'mb-4 w-full border rounded px-3 py-2';
form.parentNode.insertBefore(dateInput, form);

dateInput.onchange = function() {
  selectedDate = dateInput.value;
  renderTodos();
};

// 반복 주기 옵션 추가
let repeatSelect = document.createElement('select');
repeatSelect.className = 'mb-4 w-full border rounded px-3 py-2';
['반복 없음', '매일', '매주', '매월'].forEach(opt => {
  let o = document.createElement('option');
  o.value = opt;
  o.textContent = opt;
  repeatSelect.appendChild(o);
});
form.parentNode.insertBefore(repeatSelect, form);

// Todo 렌더링 함수
function renderTodos() {
  list.innerHTML = '';
  const todos = todosByDate[selectedDate] || [];
  todos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between bg-gray-50 px-4 py-2 rounded shadow-sm';
    
    const span = document.createElement('span');
    span.textContent = todo.text + (todo.repeat && todo.repeat !== '반복 없음' ? ` (${todo.repeat})` : '');
    if (todo.completed) {
      span.className = 'line-through text-gray-400';
    }
    span.onclick = () => toggleTodo(idx);
    span.classList.add('cursor-pointer');

    const btn = document.createElement('button');
    btn.textContent = '삭제';
    btn.className = 'text-red-500 hover:text-red-700 font-semibold';
    btn.onclick = (e) => {
      e.stopPropagation();
      if (todo.repeat && todo.repeat !== '반복 없음') {
        if (confirm('이 반복 할 일을 모든 날짜에서 삭제할까요?')) {
          deleteAllRepeats(todo.text, todo.repeat);
          return;
        }
      }
      deleteTodo(idx);
    };

    li.appendChild(span);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

// localStorage 키
// const STORAGE_KEY = 'todosByDate_v1';

// 저장 함수
// function saveTodos() {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(todosByDate));
// }
// 불러오기 함수
// function loadTodos() {
//   const data = localStorage.getItem(STORAGE_KEY);
//   if (data) {
//     todosByDate = JSON.parse(data);
//   }
// }

// Todo 추가
form.onsubmit = function(e) {
  e.preventDefault();
  const text = input.value.trim();
  const repeat = repeatSelect.value;
  if (text) {
    if (!todosByDate[selectedDate]) todosByDate[selectedDate] = [];
    todosByDate[selectedDate].push({ text, completed: false, repeat });
    // 반복 할 일 자동 생성
    if (repeat !== '반복 없음') {
      let nextDate = new Date(selectedDate);
      for (let i = 1; i <= 6; i++) { // 6회 반복 예시
        if (repeat === '매일') nextDate.setDate(nextDate.getDate() + 1);
        if (repeat === '매주') nextDate.setDate(nextDate.getDate() + 7);
        if (repeat === '매월') nextDate.setMonth(nextDate.getMonth() + 1);
        const dStr = nextDate.toISOString().slice(0, 10);
        if (!todosByDate[dStr]) todosByDate[dStr] = [];
        todosByDate[dStr].push({ text, completed: false, repeat });
      }
    }
    input.value = '';
    repeatSelect.value = '반복 없음';
    // saveTodos(); // 저장하지 않음
    renderTodos();
  }
};

// Todo 삭제
function deleteTodo(idx) {
  todosByDate[selectedDate].splice(idx, 1);
  // saveTodos(); // 저장하지 않음
  renderTodos();
}

// Todo 완료 토글
function toggleTodo(idx) {
  todosByDate[selectedDate][idx].completed = !todosByDate[selectedDate][idx].completed;
  // saveTodos(); // 저장하지 않음
  renderTodos();
}

// 반복 할 일 전체 삭제 함수
function deleteAllRepeats(text, repeat) {
  for (const date in todosByDate) {
    todosByDate[date] = (todosByDate[date] || []).filter(
      t => !(t.text === text && t.repeat === repeat)
    );
    if (todosByDate[date].length === 0) {
      delete todosByDate[date];
    }
  }
  // saveTodos(); // 저장하지 않음
  renderTodos();
}

// 페이지 로드시 기존 todos 불러오기 및 렌더링
// loadTodos(); // 불러오지 않음
renderTodos();
