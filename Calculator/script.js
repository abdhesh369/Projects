let currentOperand = '0';
let previousOperand = '';
let operation = null;
let shouldResetScreen = false;

const currentOperandElement = document.querySelector('.current-operand');
const previousOperandElement = document.querySelector('.previous-operand');
const buttons = document.querySelectorAll('.btn');

function updateDisplay() {
    currentOperandElement.textContent = formatNumber(currentOperand);
    if (operation != null) {
        previousOperandElement.textContent = `${formatNumber(previousOperand)} ${getOperationSymbol(operation)}`;
    } else {
        previousOperandElement.textContent = '';
    }
}

function formatNumber(num) {
    if (num === '' || num === '-') return num;
    const float = parseFloat(num);
    if (isNaN(float)) return '0';

    if (Math.abs(float) >= 1e12 || (Math.abs(float) < 1e-6 && float !== 0)) {
        return float.toExponential(4);
    }

    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

function getOperationSymbol(op) {
    const symbols = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷'
    };
    return symbols[op] || op;
}

function appendNumber(number) {
    if (shouldResetScreen) {
        currentOperand = '';
        shouldResetScreen = false;
    }

    if (number === '.') {
        if (currentOperand.includes('.')) return;
        if (currentOperand === '' || currentOperand === '0') {
            currentOperand = '0.';
            updateDisplay();
            return;
        }
    }

    if (currentOperand === '0' && number !== '.') {
        currentOperand = number;
    } else {
        if (currentOperand.replace('.', '').length >= 12) return;
        currentOperand += number;
    }

    updateDisplay();
}

function chooseOperation(op) {
    if (currentOperand === '' && previousOperand === '') return;

    if (previousOperand !== '' && currentOperand !== '' && !shouldResetScreen) {
        calculate();
    }

    operation = op;
    previousOperand = currentOperand || previousOperand;
    currentOperand = '';
    shouldResetScreen = false;

    updateDisplay();
}

function calculate() {
    if (operation === null || previousOperand === '') return;

    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand) || 0;
    let result;

    switch (operation) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                result = 'Error';
            } else {
                result = prev / current;
            }
            break;
        default:
            return;
    }

    if (typeof result === 'number') {
        result = Math.round(result * 1e10) / 1e10;
    }

    currentOperand = result.toString();
    operation = null;
    previousOperand = '';
    shouldResetScreen = true;

    updateDisplay();
}

function calculatePercent() {
    if (currentOperand === '' || currentOperand === '0') return;

    const current = parseFloat(currentOperand);

    if (previousOperand !== '' && operation) {
        const prev = parseFloat(previousOperand);
        currentOperand = ((prev * current) / 100).toString();
    } else {
        currentOperand = (current / 100).toString();
    }

    updateDisplay();
}

function deleteNumber() {
    if (shouldResetScreen) {
        currentOperand = '0';
        shouldResetScreen = false;
    } else if (currentOperand.length === 1 || currentOperand === 'Error') {
        currentOperand = '0';
    } else {
        currentOperand = currentOperand.slice(0, -1);
    }
    updateDisplay();
}

function clearAll() {
    currentOperand = '0';
    previousOperand = '';
    operation = null;
    shouldResetScreen = false;
    updateDisplay();
}

function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
        existingRipple.remove();
    }

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

function handleButtonClick(event) {
    const button = event.currentTarget;
    const action = button.dataset.action;
    const value = button.dataset.value;

    createRipple(event);

    switch (action) {
        case 'number':
            appendNumber(value);
            break;
        case 'operator':
            chooseOperation(value);
            break;
        case 'calculate':
            calculate();
            break;
        case 'clear':
            clearAll();
            break;
        case 'delete':
            deleteNumber();
            break;
        case 'percent':
            calculatePercent();
            break;
    }
}

function handleKeyboard(event) {
    if (event.key >= '0' && event.key <= '9') {
        appendNumber(event.key);
    } else if (event.key === '.') {
        appendNumber('.');
    } else if (event.key === '+' || event.key === '-' || event.key === '*' || event.key === '/') {
        chooseOperation(event.key);
    } else if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        calculate();
    } else if (event.key === 'Escape' || event.key === 'c' || event.key === 'C') {
        clearAll();
    } else if (event.key === 'Backspace') {
        deleteNumber();
    } else if (event.key === '%') {
        calculatePercent();
    }
}

buttons.forEach(button => {
    button.addEventListener('click', handleButtonClick);
});

document.addEventListener('keydown', handleKeyboard);

updateDisplay();
