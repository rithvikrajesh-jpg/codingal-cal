class Calculator {
    constructor(historyElement, outputElement) {
        this.historyElement = historyElement;
        this.outputElement = outputElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
        this.updateDisplay();
    }

    delete() {
        if (this.currentOperand === '0' || this.shouldResetScreen) return;
        if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '' && this.previousOperand === '') {
             if (operation === 'subtract') {
                 // Allow starting with negative number
                 this.currentOperand = '-';
                 this.updateDisplay();
             }
             return;
        }
        
        if (this.currentOperand === '') {
             this.operation = operation;
             return;
        }
        
        if (this.currentOperand === '-') return; // Only a minus sign

        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case 'add':
                computation = prev + current;
                break;
            case 'subtract':
                computation = prev - current;
                break;
            case 'multiply':
                computation = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    alert("Cannot divide by zero");
                    this.clear();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Deal with floating point precision issues (e.g. 0.1 + 0.2 = 0.3)
        computation = Math.round(computation * 100000000000) / 100000000000;
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    applyPercent() {
        if (this.currentOperand === '' || this.currentOperand === '-') return;
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        
        this.currentOperand = (current / 100).toString();
        this.shouldResetScreen = true; // after doing percent, entering a number might start fresh
    }

    getDisplayNumber(number) {
        if (number === '-') return '-';
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        if (this.currentOperand === '') {
            // If there's an operation but no current operand
            if (this.operation && this.previousOperand !== '') {
                 this.outputElement.innerText = this.getDisplayNumber(this.previousOperand);
            } else {
                 this.outputElement.innerText = '0';
            }
        } else {
           this.outputElement.innerText = this.getDisplayNumber(this.currentOperand); 
        }

        if (this.operation != null) {
            const opSymbol = this.getOperationSymbol(this.operation);
            this.historyElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${opSymbol}`;
        } else {
            this.historyElement.innerText = '';
        }

        this.updateActiveOperator();
    }

    getOperationSymbol(action) {
        switch (action) {
            case 'add': return '+';
            case 'subtract': return '−';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '';
        }
    }

    updateActiveOperator() {
        operatorButtons.forEach(button => {
            if (button.dataset.action === this.operation && this.currentOperand === '') {
                button.classList.add('is-active');
            } else {
                button.classList.remove('is-active');
            }
        });
    }
}

const numberButtons = document.querySelectorAll('.number');
const operatorButtons = document.querySelectorAll('.operator');
const actionButtons = document.querySelectorAll('.action');
const equalButton = document.querySelector('.equals');
const historyElement = document.getElementById('history');
const outputElement = document.getElementById('output');

const calculator = new Calculator(historyElement, outputElement);

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.number);
        calculator.updateDisplay();
    });
});

operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.action);
        calculator.updateDisplay();
    });
});

actionButtons.forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'clear') {
            calculator.clear();
        } else if (action === 'delete') {
            calculator.delete();
        } else if (action === 'percent') {
            calculator.applyPercent();
        }
        calculator.updateDisplay();
    });
});

equalButton.addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
});

// Add keyboard support
document.addEventListener('keydown', e => {
    if (e.key >= 0 && e.key <= 9) {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    if (e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    if (e.key === '=' || e.key === 'Enter') {
        e.preventDefault();
        calculator.compute();
        calculator.updateDisplay();
    }
    if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        let action;
        if (e.key === '+') action = 'add';
        if (e.key === '-') action = 'subtract';
        if (e.key === '*') action = 'multiply';
        if (e.key === '/') action = 'divide';
        calculator.chooseOperation(action);
        calculator.updateDisplay();
    }
});
