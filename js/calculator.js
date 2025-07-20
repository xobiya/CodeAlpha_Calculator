const display = document.getElementById("display");
const historyLog = document.getElementById("history-log");
let memory = 0;
let lastOperation = null;
let waitingForOperand = false;

// Button press animation
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', function() {
    this.classList.add('button-press');
    setTimeout(() => {
      this.classList.remove('button-press');
    }, 200);
  });
});

function append(val) {
  if (waitingForOperand) {
    display.value = '';
    waitingForOperand = false;
  }
  
  // Prevent multiple decimals ponits
  if (val === '.' && display.value.includes('.')) return;
  
  // Handle percentage
  if (val === '%' && display.value) {
    display.value = parseFloat(display.value) / 100;
    return;
  }
  
  display.value += val;
}

function clearDisplay() {
  display.value = "";
  waitingForOperand = false;
}

function deleteLast() {
  display.value = display.value.slice(0, -1);
}

function calculate() {
  try {
    let expression = display.value;
    // Replace x^y with ** for exponentiation
    expression = expression.replace(/\^/g, '**');
    
    // Handle factorial if present
    if (expression.includes('!')) {
      const num = parseFloat(expression.replace('!', ''));
      if (num < 0) throw "Invalid input";
      const result = factorial(num);
      addToHistory(`${num}! = ${result}`);
      display.value = result;
      return;
    }
    
    const result = Function('"use strict";return (' + expression + ')')();
    const formattedResult = Number.isInteger(result) ? result : parseFloat(result.toFixed(8));
    
    addToHistory(`${expression} = ${formattedResult}`);
    display.value = formattedResult;
    lastOperation = expression;
    waitingForOperand = true;
  } catch (e) {
    display.value = "Error";
    setTimeout(() => {
      if (lastOperation) {
        display.value = lastOperation;
      } else {
        clearDisplay();
      }
    }, 1000);
  }
}

function scientific(func) {
  try {
    let val = parseFloat(display.value);
    let result = 0;
    let expression = '';
    
    switch (func) {
      case "sin": 
        result = Math.sin(val * Math.PI / 180); // Convert to radians if needed
        expression = `sin(${val})`;
        break;
      case "cos": 
        result = Math.cos(val * Math.PI / 180);
        expression = `cos(${val})`;
        break;
      case "tan": 
        result = Math.tan(val * Math.PI / 180);
        expression = `tan(${val})`;
        break;
      case "log": 
        result = Math.log10(val);
        expression = `log(${val})`;
        break;
      case "ln": 
        result = Math.log(val);
        expression = `ln(${val})`;
        break;
      case "sqrt": 
        result = Math.sqrt(val);
        expression = `√(${val})`;
        break;
      case "square": 
        result = Math.pow(val, 2);
        expression = `(${val})²`;
        break;
      case "pow":
        if (!display.value.includes('^')) {
          display.value += '^';
          return;
        }
        break;
      case "fact":
        if (val < 0) throw "Invalid input";
        result = factorial(val);
        expression = `${val}!`;
        break;
    }
    
    if (func !== "pow") {
      result = Number.isInteger(result) ? result : parseFloat(result.toFixed(8));
      addToHistory(`${expression} = ${result}`);
      display.value = result;
      waitingForOperand = true;
    }
  } catch (e) {
    display.value = "Error";
    setTimeout(clearDisplay, 1000);
  }
}

function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Memory functions
function memoryStore() {
  if (display.value) {
    memory = parseFloat(display.value);
    showToast('Value stored in memory');
  }
}

function memoryRecall() {
  display.value = memory;
}

function memoryClear() {
  memory = 0;
  showToast('Memory cleared');
}

function memoryAdd() {
  if (display.value) {
    memory += parseFloat(display.value);
    showToast('Value added to memory');
  }
}

function memorySubtract() {
  if (display.value) {
    memory -= parseFloat(display.value);
    showToast('Value subtracted from memory');
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = 'var(--op-bg)';
  toast.style.color = 'white';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = 'var(--border-radius)';
  toast.style.zIndex = '1000';
  toast.style.boxShadow = 'var(--shadow)';
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s';
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem('calculatorTheme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

function addToHistory(entry) {
  let history = JSON.parse(localStorage.getItem("calcHistory") || "[]");
  history.unshift(entry);
  if (history.length > 10) history.pop();
  localStorage.setItem("calcHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("calcHistory") || "[]");
  historyLog.innerHTML = history.map(e => `<div class="history-entry">${e}</div>`).join("");
}

function clearHistory() {
  localStorage.removeItem("calcHistory");
  renderHistory();
}

// Keyboard support
document.addEventListener("keydown", function (e) {
  if (e.key.match(/[0-9+\-*/.%^!]/)) append(e.key);
  if (e.key === "Enter" || e.key === "=") calculate();
  if (e.key === "Backspace") deleteLast();
  if (e.key === "Escape") clearDisplay();
});

// Load theme preference
if (localStorage.getItem('calculatorTheme') === 'dark') {
  document.body.classList.add('dark');
}

// Load history on start
renderHistory();