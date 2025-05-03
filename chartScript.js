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

document.getElementById('file-input').addEventListener('change', (event) => {
    const input = event.target;
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

        // 👇 Весь твой код оставляем без изменений внутри
        json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        lastFilledDate = null;

        drawChart(filterData("Общий", null, null));
        updateSummaries();

        //-------------------------------------->
        // 👉 Считаем сумму после загрузки файла
        if (lastFilledDate) {
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

            document.getElementById('s-column-sum').innerText = `${sColumnSum.toFixed(2)}`;
            console.log(sColumnSum.toFixed(2));
        }



        if (lastFilledDate) {
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
                    const val = parseFloat(row[19]);
                    if (!isNaN(val)) {
                        sColumnSum += val;
                    }
                }
            }

            document.getElementById('s-column-sum1').innerText = `${sColumnSum.toFixed(2)}`;
            console.log(sColumnSum.toFixed(2));
        }




        if (lastFilledDate) {
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
                    const val = parseFloat(row[20]);
                    if (!isNaN(val)) {
                        sColumnSum += val;
                    }
                }
            }

            document.getElementById('s-column-sum2').innerText = `${sColumnSum.toFixed(2)}`;
            console.log(sColumnSum.toFixed(2));
        }


        if (lastFilledDate) {
            let ishlabChiqarishSum = 0;
            let birjagaYuklashSum = 0;
            let eksportSum = 0;

            for (let i = 1; i < json.length; i++) {
                const row = json[i];
                if (!row || !row[0]) continue;

                const excelDate = row[0];
                const dateCell = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
                if (isNaN(dateCell)) continue;

                // Только за последний заполненный день
                if (
                    dateCell.getDate() === lastFilledDate.getDate() &&
                    dateCell.getMonth() === lastFilledDate.getMonth() &&
                    dateCell.getFullYear() === lastFilledDate.getFullYear()
                ) {
                    const category = row[3];
                    const value = parseFloat(row[7]); // колонка H

                    if (category === "Ишлаб чиқариш" && !isNaN(value)) {
                        ishlabChiqarishSum += value;
                    }

                    if (category === "Биржага юклаш" && !isNaN(value)) {
                        birjagaYuklashSum += value;
                    }
                    if (category === "Экспорт" && !isNaN(value)) {
                        eksportSum += value;
                    }
                }
            }

            document.getElementById('sum-text').innerText = `${ishlabChiqarishSum.toFixed(2)}`;
            document.getElementById('sum-text1').innerText = `${birjagaYuklashSum.toFixed(2)}`;
            document.getElementById('sum-text2').innerText = `${eksportSum.toFixed(2)}`;
            console.log("Ишлаб чиқариш сумма:", ishlabChiqarishSum);
            console.log("Биржага юклаш сумма:", birjagaYuklashSum);
            console.log("Экспорт:", eksportSum);
        }


        let uzbekneftgazSum = 0;
        let otherSum = 0;

        for (let i = 1; i < json.length; i++) {
            const row = json[i];
            if (!row || !row[2] || !row[3]) continue;

            const company = row[2]; // колонка C
            const category = row[3]; // колонка D
            const value = parseFloat(row[7]); // колонка H

            if (category === "Ишлаб чиқариш" && !isNaN(value)) {
                if (company === "Ўзбекнефтгаз") {
                    uzbekneftgazSum += value;
                } else {
                    otherSum += value;
                }
            }
        }

        document.getElementById('uzbekneftgazsum').innerText = `${uzbekneftgazSum.toFixed(0)}`;
        document.getElementById('other-sum').innerText = `${otherSum.toFixed(0)}`;
        console.log("Ўзбекнефтгаз сумма:", uzbekneftgazSum);
        console.log("Бошқа компаниялар сумма:", otherSum);



        //--------------------------< ТАБЛИЦА FACTORY-TABLE >------------------------------------------//


        let lastDate = "";
        for (let i = 1; i < json.length; i++) {
            const row = json[i];
            const date = row[0];
            if (date) lastDate = date;
        }

        let companiesSet = new Set();
        for (let i = 1; i < json.length; i++) {
            const row = json[i];
            if (row[0] === lastDate && row[1]) {
                companiesSet.add(row[1]);
            }
        }

        let companies = Array.from(companiesSet);
        let tableRows = "";

        companies.forEach(company => {
            for (let i = 1; i < json.length; i++) {
                const row = json[i];
                if (row[1] === company) {
                    const colF = row[5] || "";
                    const colG = row[6] || "";
                    const colH = row[7] || "";
                    const colQ = row[16] || "";
                    const colR = row[17] || "";
                    const companyType = row[2] || ""; // колонка C

                    tableRows += `
                    <tr data-company-type="${companyType}">
                        <td>${company}</td>
                        <td>${colF}</td>
                        <td>${colG}</td>
                        <td>${colH}</td>
                        <td>${colQ}</td>
                        <td>${colR}</td>
                    </tr>
                    `;
                    break;
                }
            }
        });

        document.getElementById("company-table-body").innerHTML = tableRows;




        document.getElementById("factory_date").addEventListener("click", () => {
            const selectedDate = getSelectedDate();
            if (!selectedDate) {
                alert("Пожалуйста, выберите дату через календарь.");
                return;
            }

            // Преобразуем выбранную дату в Excel-формат (число дней с 1899-12-30)
            const targetExcelDate = Math.floor((selectedDate.getTime() / 86400000) + 25569);

            let companiesSet = new Set();
            for (let i = 1; i < json.length; i++) {
                const row = json[i];
                if (row[0] === targetExcelDate && row[1]) {
                    companiesSet.add(row[1]);
                }
            }

            const companies = Array.from(companiesSet);
            let tableRows = "";

            companies.forEach(company => {
                for (let i = 1; i < json.length; i++) {
                    const row = json[i];
                    if (row[0] === targetExcelDate && row[1] === company) {
                        const colF = row[5] || "";
                        const colG = row[6] || "";
                        const colH = row[7] || "";
                        const colQ = row[16] || "";
                        const colR = row[17] || "";

                        const companyType = row[2] || ""; // колонка C

                        tableRows += `
                        <tr data-company-type="${companyType}">
                            <td>${company}</td>
                            <td>${colF}</td>
                            <td>${colG}</td>
                            <td>${colH}</td>
                            <td>${colQ}</td>
                            <td>${colR}</td>
                        </tr>
                        `;
                        break;
                    }
                }
            });

            document.getElementById("company-table-body").innerHTML = tableRows;


            // Этот код добавляй ВНУТРИ обработчика кнопки #factory_date — после отрисовки таблицы
            let ishlabChiqarishSum = 0;
            let birjagaYuklashSum = 0;
            let eksportSum = 0;
            let sColumnSum = 0;

            for (let i = 1; i < json.length; i++) {
                const row = json[i];
                if (!row || !row[0]) continue;

                const excelDate = row[0];
                const dateCell = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
                if (isNaN(dateCell)) continue;

                if (
                    dateCell.getDate() === selectedDate.getDate() &&
                    dateCell.getMonth() === selectedDate.getMonth() &&
                    dateCell.getFullYear() === selectedDate.getFullYear()
                ) {
                    const category = row[3];
                    const value = parseFloat(row[7]); // H колонка

                    if (category === "Ишлаб чиқариш" && !isNaN(value)) {
                        ishlabChiqarishSum += value;
                    }
                    if (category === "Биржага юклаш" && !isNaN(value)) {
                        birjagaYuklashSum += value;
                    }
                    if (category === "Экспорт" && !isNaN(value)) {
                        eksportSum += value;
                    }

                    const sVal = parseFloat(row[18]); // S колонка
                    if (!isNaN(sVal)) {
                        sColumnSum += sVal;
                    }
                }
            }

            document.getElementById('sum-text').innerText = ishlabChiqarishSum.toFixed(2);
            document.getElementById('sum-text1').innerText = birjagaYuklashSum.toFixed(2);
            document.getElementById('sum-text2').innerText = eksportSum.toFixed(2);
            document.getElementById('s-column-sum').innerText = sColumnSum.toFixed(2);

        });





        // Храним текущий фильтр
        let currentFilter = "summary";

        document.getElementById("summary").addEventListener("click", () => {
            currentFilter = "summary";
            updateTableByFilter();
        });

        document.getElementById("neft").addEventListener("click", () => {
            currentFilter = "neft";
            updateTableByFilter();
        });

        document.getElementById("xk").addEventListener("click", () => {
            currentFilter = "xk";
            updateTableByFilter();
        });

        function updateTableByFilter() {
            const rows = document.querySelectorAll("#company-table-body tr");
            rows.forEach(row => {
                const cells = row.querySelectorAll("td");
                const companyType = row.getAttribute("data-company-type");

                if (currentFilter === "summary" ||
                    (currentFilter === "neft" && companyType === "Ўзбекнефтгаз") ||
                    (currentFilter === "xk" && companyType === "Хорижий ва ҚК")) {
                    // Активная строка
                    row.classList.remove("faded");
                    for (let i = 1; i < cells.length; i++) {
                        if (cells[i].getAttribute("data-original")) {
                            cells[i].textContent = cells[i].getAttribute("data-original");
                        }
                    }
                } else {
                    // Потухшая строка
                    row.classList.add("faded");
                    for (let i = 1; i < cells.length; i++) {
                        if (!cells[i].getAttribute("data-original")) {
                            cells[i].setAttribute("data-original", cells[i].textContent);
                        }
                        cells[i].textContent = "-";
                    }
                }
            });
        }
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

    // 🔹 Проверка: если ничего не выбрано или специально указано "не выбрано"
    if (!dateStr || dateStr.toLowerCase() === "не выбрано") return null;

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
        } else {
            // Если нет фильтра по дате, обновляем последнюю заполненную дату
            lastFilledDate = dateCell;
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
        titleTextStyle: { color: '#ffffff', fontSize: 16 },
        isStacked: false,
        areaOpacity: 0.2 // это делает "тень" под линиями
    };


    const chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}

// 📅 flatpickr для выбора даты
flatpickr("#date-picker", {
    dateFormat: "d.m.Y",
    allowInput: true,
    defaultDate: null,
    onReady: function (selectedDates, dateStr, instance) {
        instance.input.placeholder = "не выбрано";
    },
});

document.getElementById("cclear").addEventListener("click", () => {
    const dateInput = document.getElementById("date-picker");
    if (dateInput._flatpickr) {
        dateInput._flatpickr.clear(); // Очищает выбранную дату
    }
    dateInput.value = ""; // На всякий случай принудительно очищаем
    lastFilledDate = null;

    // 🔄 Повторный вызов основного рендера без фильтрации по дате
    const selectedCategory = getCurrentCategory();     // твоя функция выбора типа (Ишлаб чикариш и т.д.)
    const selectedCompany = getCurrentCompany();       // твоя функция выбора компании (summary, neft, xk)

    renderTable(selectedCompany, selectedCategory, null); // без selectedDate
    renderChart(selectedCompany, selectedCategory, null); // если используешь для графика

    console.log("Дата сброшена, график и таблица обновлены.");
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
document.getElementById('sum-text').innerText = `${totalSum.toFixed(2)}`;





function updateFactoryTableByPeriod(period) {
    if (!lastFilledDate || json.length === 0) return;

    const targetRows = [];
    const lastYear = lastFilledDate.getFullYear();
    const lastMonth = lastFilledDate.getMonth();
    const lastDay = lastFilledDate.getDate();

    for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (!row || !row[0]) continue;

        const excelDate = row[0];
        const dateCell = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
        if (isNaN(dateCell)) continue;

        const sameDay = dateCell.getFullYear() === lastYear && dateCell.getMonth() === lastMonth && dateCell.getDate() === lastDay;
        const sameMonth = dateCell.getFullYear() === lastYear && dateCell.getMonth() === lastMonth;
        const sameYear = dateCell.getFullYear() === lastYear;

        if (
            (period === 'day' && sameDay) ||
            (period === 'month' && sameMonth) ||
            (period === 'year' && sameYear)
        ) {
            targetRows.push(row);
        }
    }

    // Сбор компаний
    const companiesSet = new Set();
    targetRows.forEach(row => {
        if (row[1]) companiesSet.add(row[1]); // колонка B
    });

    const companies = Array.from(companiesSet);
    let tableRows = "";

    companies.forEach(company => {
        // собираем все строки этой компании
        const companyRows = targetRows.filter(row => row[1] === company);

        // суммируем нужные значения
        let sumF = 0, sumG = 0, sumH = 0, sumQ = 0, sumR = 0;

        companyRows.forEach(row => {
            sumF += parseFloat(row[5]) || 0;
            sumG += parseFloat(row[6]) || 0;
            sumH += parseFloat(row[7]) || 0;
            sumQ += parseFloat(row[16]) || 0;
            sumR += parseFloat(row[17]) || 0;
        });

        tableRows += `
            <tr>
                <td>${company}</td>
                <td>${sumF.toFixed(2)}</td>
                <td>${sumG.toFixed(2)}</td>
                <td>${sumH.toFixed(2)}</td>
                <td>${sumQ.toFixed(2)}</td>
                <td>${sumR.toFixed(2)}</td>
            </tr>
        `;
    });

    document.getElementById("company-table-body").innerHTML = tableRows;
}
document.getElementById('last-day-btn').addEventListener('click', () => {
    updateFactoryTableByPeriod('day');
});

document.getElementById('last-month-btn').addEventListener('click', () => {
    updateFactoryTableByPeriod('month');
});

document.getElementById('last-year-btn').addEventListener('click', () => {
    updateFactoryTableByPeriod('year');
});




//---------------------------------------------< SORT BY CHECKBOX >------------------------------------------------

function updateDonutValues(filterType) {
    const lastDate = getLastDate(); // Последняя дата в json

    let uzbSum = 0;
    let otherSum = 0;

    json.forEach(row => {
        const rowDate = parseDate(row[0]);
        const value = parseFloat(row[7]) || 0;
        const company = row[2];

        let match = false;

        if (filterType === 'day') {
            match = rowDate.toDateString() === lastDate.toDateString();
        } else if (filterType === 'month') {
            match = rowDate.getMonth() === lastDate.getMonth() &&
                rowDate.getFullYear() === lastDate.getFullYear();
        } else if (filterType === 'year') {
            match = rowDate.getFullYear() === lastDate.getFullYear();
        }

        if (match) {
            if (company === 'Ўзбекнефтгаз') {
                uzbSum += value;
            } else {
                otherSum += value;
            }
        }
    });

    document.getElementById('uzbekneftgazsum').textContent = Math.floor(uzbSum);
    document.getElementById('other-sum').textContent = Math.floor(otherSum);

    // updateDonut вызовется сам через MutationObserver
}

// Привязка кнопок только к пончику
document.getElementById('last-day-btn').addEventListener('click', () => {
    updateDonutValues('day');
});

document.getElementById('last-month-btn').addEventListener('click', () => {
    updateDonutValues('month');
});

document.getElementById('last-year-btn').addEventListener('click', () => {
    updateDonutValues('year');
});

// Инициализация при загрузке страницы
updateDonutValues('day');
