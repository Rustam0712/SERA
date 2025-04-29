google.charts.load('current', { packages: ['corechart'] });

function updateSummaries() {
    if (!lastFilledDate) {
        document.getElementById('day-plan').innerText = '0';
        document.getElementById('day-actual').innerText = '0';
        document.getElementById('day-mid').innerText = '0'; // Mid для дня
        document.getElementById('month-plan').innerText = '0';
        document.getElementById('month-actual').innerText = '0';
        document.getElementById('month-mid').innerText = '0'; // Mid для месяца
        document.getElementById('year-plan').innerText = '0';
        document.getElementById('year-actual').innerText = '0';
        document.getElementById('year-mid').innerText = '0'; // Mid для года
        return;
    }

    let dayPlan = 0, dayActual = 0, dayMid = 0; // Добавляем переменную для mid
    let monthPlan = 0, monthActual = 0, monthMid = 0; // Добавляем переменную для mid
    let yearPlan = 0, yearActual = 0, yearMid = 0; // Добавляем переменную для mid

    const lastDay = lastFilledDate.getDate();
    const lastMonth = lastFilledDate.getMonth();
    const lastYear = lastFilledDate.getFullYear();

    for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (!row || !row[0]) continue;

        const excelDate = row[0];
        const dateCell = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
        if (isNaN(dateCell)) continue;

        const plan = parseFloat(row[6]) || 0;   // G колонка
        const actual = parseFloat(row[7]) || 0; // H колонка
        const mid = parseFloat(row[8]) || 0;   // I колонка (mid)

        if (dateCell.getFullYear() === lastYear) {
            yearPlan += plan;
            yearActual += actual;
            yearMid += mid; // Добавляем для года

            if (dateCell.getMonth() === lastMonth) {
                monthPlan += plan;
                monthActual += actual;
                monthMid += mid; // Добавляем для месяца

                if (dateCell.getDate() === lastDay) {
                    dayPlan += plan;
                    dayActual += actual;
                    dayMid += mid; // Добавляем для дня
                }
            }
        }
    }

    console.log(`Сумма за день: План=${dayPlan}, Факт=${dayActual}, Mid=${dayMid}`);
    console.log(`Сумма за месяц: План=${monthPlan}, Факт=${monthActual}, Mid=${monthMid}`);
    console.log(`Сумма за год: План=${yearPlan}, Факт=${yearActual}, Mid=${yearMid}`);

    document.getElementById('day-plan').innerText = dayPlan.toFixed(2);
    document.getElementById('day-actual').innerText = dayActual.toFixed(2);
    document.getElementById('day-mid').innerText = dayMid.toFixed(2); // Обновляем mid для дня

    document.getElementById('month-plan').innerText = monthPlan.toFixed(2);
    document.getElementById('month-actual').innerText = monthActual.toFixed(2);
    document.getElementById('month-mid').innerText = monthMid.toFixed(2); // Обновляем mid для месяца

    document.getElementById('year-plan').innerText = yearPlan.toFixed(2);
    document.getElementById('year-actual').innerText = yearActual.toFixed(2);
    document.getElementById('year-mid').innerText = yearMid.toFixed(2); // Обновляем mid для года
}



let json = [];
let lastFilledDate = null;

document.getElementById('upload-btn').addEventListener('click', () => {
    const input = document.getElementById('file-input');
    if (!input.files.length) {
        alert('Пожалуйста, выберите файл Excel.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheet = workbook.Sheets['Сера'];
        if (!sheet) {
            alert("Лист 'Сера' не найден в Excel-файле.");
            return;
        }

        json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        lastFilledDate = null;

        drawChart(filterData("Общий", null, null));
        updateSummaries(); // <<< ВОТ ЭТО ОБЯЗАТЕЛЬНО ДОБАВЬ
    };


    reader.readAsArrayBuffer(input.files[0]);
});

// ✅ Фильтрация при выборе категории и компании
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        const company = document.getElementById('company-select').value;
        const selectedDate = getSelectedDate();

        const { map2024, map2025 } = filterData(company, category, selectedDate);
        drawChart({ map2024, map2025 });
    });
});

// 📅 Выбор даты через календарь
function getSelectedDate() {
    const dateStr = document.getElementById('date-picker')?.value;
    if (!dateStr) return null;

    const [day, month, year] = dateStr.split('.');
    return new Date(`${year}-${month}-${day}`);
}

// 📊 Фильтрация данных
function filterData(companyFilter, categoryFilter, selectedDate = null, startDate = null, endDate = null) {
    const map2025 = new Map();
    const map2024 = new Map();
    lastFilledDate = null;

    for (let i = 1; i < json.length; i += 21) {
        const row = json[i];
        if (!row || !row[0]) continue;

        const excelDate = row[0];
        const dateCell = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
        if (isNaN(dateCell)) continue;

        // 🔥 Фильтрация по выбранной дате или диапазону
        if (selectedDate) {
            if (
                dateCell.getFullYear() !== selectedDate.getFullYear() ||
                dateCell.getMonth() !== selectedDate.getMonth() ||
                dateCell.getDate() !== selectedDate.getDate()
            ) continue;
        } else if (startDate && endDate) {
            if (dateCell < startDate || dateCell > endDate) continue;
        }

        let sum2025 = 0;
        let sum2024 = 0;

        for (let j = 0; j < 21; j++) {
            const current = json[i + j];
            const company = current?.[1];
            const category = current?.[3];
            const value2025 = current?.[7];
            const value2024 = current?.[5];

            const companyMatches = companyFilter === "Общий" || company === companyFilter;
            const categoryMatches = !categoryFilter || category === categoryFilter;

            if (companyMatches && categoryMatches) {
                const n25 = typeof value2025 === 'number' ? value2025 : parseFloat(value2025);
                if (!isNaN(n25)) sum2025 += n25;

                const n24 = typeof value2024 === 'number' ? value2024 : parseFloat(value2024);
                if (!isNaN(n24)) sum2024 += n24;
            }
        }

        if (sum2025 > 0 || sum2024 > 0) {
            const key = `${dateCell.getMonth() + 1}-${dateCell.getDate()}`;
            if (sum2025 > 0) map2025.set(key, sum2025);
            if (sum2024 > 0) map2024.set(key, sum2024);
            lastFilledDate = dateCell;
        }
    }

    return { map2024, map2025 };
}

// 📈 Отрисовка графика
function drawChart({ map2024, map2025 }) {
    const chartData = [['Дата', '2024', '2025']];

    for (let m = 1; m <= 12; m++) {
        for (let d = 1; d <= 31; d++) {
            const key = `${m}-${d}`;
            const val2024 = map2024.has(key) ? map2024.get(key) : null;
            const val2025 = map2025.has(key) ? map2025.get(key) : null;

            if (val2024 !== null || val2025 !== null) {
                const date = new Date(2025, m - 1, d);
                if (!lastFilledDate || date <= lastFilledDate) {
                    chartData.push([date, val2024 ?? 0, val2025 ?? 0]);
                }
            }
        }
    }

    const data = google.visualization.arrayToDataTable(chartData);

    const options = {
        title: 'Сравнение суточной добычи за 2024 и 2025 гг.',
        curveType: 'function',
        legend: {
            position: 'bottom',
            textStyle: { color: '#ffffff' }
        },
        hAxis: {
            format: 'MMM dd',
            gridlines: { count: 12, color: '#888888' },
            textStyle: { color: '#ffffff' }
        },
        vAxis: {
            gridlines: { color: '#888888' },
            textStyle: { color: '#ffffff' }
        },
        colors: ['#dc3912', '#3366cc'],
        animation: {
            duration: 1000,
            easing: 'out',
            startup: true
        },
        backgroundColor: 'transparent',
        titleTextStyle: { color: '#ffffff', fontSize: 16 }
    };

    const chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}

// 📅 flatpickr для выбора даты
flatpickr("#date-picker", {
    dateFormat: "d.m.Y",
    allowInput: true,
    maxDate: "today"
});

// 📅 Обработчики кнопок для последнего дня, месяца, года

document.getElementById('last-day-btn').addEventListener('click', () => {
    if (!lastFilledDate) {
        alert('Данные не загружены.');
        return;
    }
    const company = document.getElementById('company-select').value;
    const category = null;

    const startDate = new Date(lastFilledDate);
    const endDate = new Date(lastFilledDate);

    const { map2024, map2025 } = filterData(company, category, null, startDate, endDate);
    drawChart({ map2024, map2025 });
});

document.getElementById('last-month-btn').addEventListener('click', () => {
    if (!lastFilledDate) {
        alert('Данные не загружены.');
        return;
    }
    const company = document.getElementById('company-select').value;
    const category = null;

    const endDate = new Date(lastFilledDate);
    const startDate = new Date(lastFilledDate);
    startDate.setMonth(startDate.getMonth() - 1);

    const { map2024, map2025 } = filterData(company, category, null, startDate, endDate);
    drawChart({ map2024, map2025 });
});

document.getElementById('last-year-btn').addEventListener('click', () => {
    if (!lastFilledDate) {
        alert('Данные не загружены.');
        return;
    }
    const company = document.getElementById('company-select').value;
    const category = null;

    const endDate = new Date(lastFilledDate);
    const startDate = new Date(lastFilledDate);
    startDate.setFullYear(startDate.getFullYear() - 1);

    const { map2024, map2025 } = filterData(company, category, null, startDate, endDate);
    drawChart({ map2024, map2025 });
});

const { map2024, map2025 } = filterData(company, category, selectedDate);
// Вывести сумму в параграф
let totalSum = 0;
for (let value of map2025.values()) {
    totalSum += value;
}

//Сумма "Кун бошида колдик"
document.getElementById('sum-text').innerText = `Сумма за 2025: ${totalSum.toFixed(2)}`;

// 🔽 Дополнительно: Сумма чисел из колонки S (индекс 18) за последний день
let sColumnSum = 0;
for (let i = 1; i < json.length; i++) {
    const row = json[i];
    if (!row || !row[0]) continue;

    const excelDate = row[0];
    const dateCell = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
    if (isNaN(dateCell)) continue;

    if (
        dateCell.getDate() === lastFilledDate.getDate() &&
        dateCell.getMonth() === lastFilledDate.getMonth() &&
        dateCell.getFullYear() === lastFilledDate.getFullYear()
    ) {
        const val = parseFloat(row[18]);
        if (!isNaN(val)) {
            sColumnSum += val;
        }
    }
}

document.getElementById('s-column-sum').innerText = `Сумма по колонке S за ${lastFilledDate.toLocaleDateString('ru-RU')}: ${sColumnSum.toFixed(2)}`;
