document.addEventListener('DOMContentLoaded', () => {
    const tableData = JSON.parse(localStorage.getItem('tableData')) || [];

    function getCellValue(cellName) {
        const colLetter = cellName[0].toUpperCase();
        const rowIndex = parseInt(cellName.slice(1), 10) - 1;
        const colIndex = colLetter.charCodeAt(0) - 65;

        if (tableData[rowIndex] && tableData[rowIndex][colIndex] !== undefined) {
            return tableData[rowIndex][colIndex];
        }
        return '';
    }

    document.querySelectorAll('[data-cell]').forEach(el => {
        const cell = el.getAttribute('data-cell');
        el.textContent = getCellValue(cell);
    });
});

function updateDonut() {
    const leftEl = document.querySelector('.left');
    const rightEl = document.querySelector('.right');
    const centerEl = document.querySelector('.center');
    const donut = document.querySelector('.donut');

    const leftValue = parseInt(leftEl.textContent) || 0;
    const rightValue = parseInt(rightEl.textContent) || 0;
    const total = leftValue + rightValue;

    if (total > 0) {
        const leftPercentage = (leftValue / total) * 100;
        const rightPercentage = (rightValue / total) * 100;

        donut.style.background = `conic-gradient(#0088cc 0% ${rightPercentage}%, #00c37e ${rightPercentage}% 100%)`;
        centerEl.textContent = total;
    }
}

updateDonut();

const observer = new MutationObserver(updateDonut);
const config = { characterData: true, childList: true, subtree: true };
observer.observe(document.querySelector('.left'), config);
observer.observe(document.querySelector('.right'), config);

// Инициализация flatpickr календаря
flatpickr("#datePicker", {
    dateFormat: "d.m.Y", // как в Excel — дд.мм.гггг
    maxDate: "today",
    locale: {
        firstDayOfWeek: 1,
        weekdays: {
            shorthand: ['Якш', 'Душ', 'Сеш', 'Чор', 'Пай', 'Жум', 'Шан'],
            longhand: ['Якшанба', 'Душанба', 'Сешанба', 'Чоршанба', 'Пайшанба', 'Жума', 'Шанба']
        },
        months: {
            shorthand: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
            longhand: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
        }
    },
    onChange: function (selectedDates, dateStr, instance) {
        console.log("Выбрана дата:", dateStr);
        // 👉 Здесь дальше ты можешь использовать dateStr для фильтрации
        // например, фильтровать по строкам в localStorage
    }
});


document.addEventListener('DOMContentLoaded', () => {
    let json = [
        // Пример данных
        ['2025-04-26', 'data1', 'Ўзбекнефтгаз', 0, 0, 0, 100, 200],
        ['2025-04-25', 'data2', 'Компания 1', 0, 0, 0, 120, 250],
        ['2025-04-26', 'data3', 'Ўзбекнефтгаз', 0, 0, 0, 110, 300],
        ['2025-04-24', 'data4', 'Компания 2', 0, 0, 0, 130, 270],
        ['2025-04-23', 'data5', 'Ўзбекнефтгаз', 0, 0, 0, 140, 350],
        // Ваши реальные данные будут загружаться сюда
    ];

    let lastDaySumUzbekneftgaz = 0;
    let lastDaySumOthers = 0;
    let lastMonthSumUzbekneftgaz = 0;
    let lastMonthSumOthers = 0;
    let lastYearSumUzbekneftgaz = 0;
    let lastYearSumOthers = 0;

    // Функция для извлечения даты из строки Excel (дд.мм.гг)
    function parseDate(dateStr) {
        const [day, month, year] = dateStr.split('.');
        return new Date(`20${year}-${month}-${day}`);
    }

    // Функция для получения последней даты из таблицы (в конце таблицы)
    function getLastDate() {
        const lastRow = json[json.length - 1];
        return parseDate(lastRow[0]);  // Возвращаем дату из первой колонки
    }

    // Функция для фильтрации и суммирования данных по дате (день, месяц или год)
    function calculateSums(filterType) {
        const lastDate = getLastDate(); // Получаем последнюю дату в таблице

        // Переменные для хранения сумм
        let sumForUzbekneftgaz = 0;
        let sumForOthers = 0;

        json.forEach(row => {
            const rowDate = parseDate(row[0]);
            const valueInH = parseFloat(row[7]) || 0; // Значение в колонке H
            const companyName = row[2];  // Значение в колонке C

            let isMatch = false;

            // Смотрим, подходит ли дата по фильтру
            if (filterType === 'day') {
                // Сравниваем только с самой последней датой
                if (rowDate.toDateString() === lastDate.toDateString()) {
                    isMatch = true;
                }
            } else if (filterType === 'month') {
                // Фильтруем по месяцу и году
                if (rowDate.getMonth() === lastDate.getMonth() && rowDate.getFullYear() === lastDate.getFullYear()) {
                    isMatch = true;
                }
            } else if (filterType === 'year') {
                // Фильтруем по году
                if (rowDate.getFullYear() === lastDate.getFullYear()) {
                    isMatch = true;
                }
            }

            if (isMatch) {
                console.log(`Данные по дате: ${row[0]} - ${companyName} - ${valueInH}`);
                if (companyName === 'Ўзбекнефтгаз') {
                    sumForUzbekneftgaz += valueInH;
                } else {
                    sumForOthers += valueInH;
                }
            }
        });

        console.log('Сумма для Ўзбекнефтгаз:', sumForUzbekneftgaz);
        console.log('Сумма для других:', sumForOthers);

        return { sumForUzbekneftgaz, sumForOthers };
    }

    // Функция для обновления данных на странице
    function updateDisplayData(filterType) {
        const { sumForUzbekneftgaz, sumForOthers } = calculateSums(filterType);

        // Обновляем summary
        document.getElementById('uzbekneftgaz-summary').innerText = `${Math.floor(sumForUzbekneftgaz)}`;
        document.getElementById('other-summary').innerText = `${Math.floor(sumForOthers)}`;

        // Обновляем пончик (left и right)
        document.getElementById('uzbekneftgazsum').innerText = `${Math.floor(sumForUzbekneftgaz)}`;
        document.getElementById('other-sum').innerText = `${Math.floor(sumForOthers)}`;
    }

    // Кнопки периодов — обновляют и summary, и пончик
    document.getElementById('last-day-btn').addEventListener('click', () => {
        updateDisplayData('day');
    });

    document.getElementById('last-month-btn').addEventListener('click', () => {
        updateDisplayData('month');
    });

    document.getElementById('last-year-btn').addEventListener('click', () => {
        updateDisplayData('year');
    });

    // Изначально показываем данные за последний день
    updateDisplayData('day');
});

document.getElementById('last-day-btn').addEventListener('click', () => {
    updateFactoryTableByPeriod('day');
});

document.getElementById('last-month-btn').addEventListener('click', () => {
    updateFactoryTableByPeriod('month');
});

document.getElementById('last-year-btn').addEventListener('click', () => {
    updateFactoryTableByPeriod('year');
});

window.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('date-picker');
    const today = new Date();
    const formatted = today.toLocaleDateString('ru-RU'); // формат: дд.мм.гггг
    input.value = formatted;
});