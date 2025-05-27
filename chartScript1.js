google.charts.load('current', { packages: ['corechart'] });


let selectedCategory = 'Ишлаб чиқариш';
console.log("selectedCategory: " + selectedCategory);
document.querySelectorAll('.dobichabtn').forEach(button => {
    button.addEventListener('click', () => {
        selectedCategory = button.getAttribute('data-category');
        console.log("Нажата категория:", selectedCategory); // <--- добавь это для проверки
        updateSummaries(); // вызывает нужную функцию
        updateCategorySums();
    });
});


document.getElementById('last-day-btn').addEventListener('click', () => {
    selectedPeriod = 'day';
    updateSummaries();
    updateCategorySums();
    updateDonutChart('day');
});

document.getElementById('last-month-btn').addEventListener('click', () => {
    selectedPeriod = 'month';
    updateSummaries();
    updateCategorySums();
    updateDonutChart('month');
});

document.getElementById('last-year-btn').addEventListener('click', () => {
    selectedPeriod = 'year';
    updateSummaries();
    updateCategorySums();
    updateDonutChart('year');
});

let currentCategory = "Ишлаб чиқариш"; // По умолчанию
let currentPeriod = "day"; // По умолчанию — last-day-btn

function updateDonutChart() {
    let uzbekneftgazSum = 0;
    let otherSum = 0;

    if (!lastFilledDate) {
        document.getElementById('uzbekneftgazsum').innerText = '0';
        document.getElementById('other-sum').innerText = '0';
        document.querySelector('.donut .center').innerText = '0';
        return;
    }

    const lastDay = lastFilledDate.getDate();
    const lastMonth = lastFilledDate.getMonth();
    const lastYear = lastFilledDate.getFullYear();

    for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (!row || row.length < 8 || !row[0] || !row[2] || !row[3]) continue;

        const excelDate = row[0];
        const dateCell = new Date((excelDate - 25569) * 86400 * 1000);
        if (isNaN(dateCell)) continue;

        const company = row[2].trim();
        const category = row[3].trim();
        const value = parseFloat(row[7]) || 0;

        if (category !== currentCategory) continue;

        const rowDay = dateCell.getDate();
        const rowMonth = dateCell.getMonth();
        const rowYear = dateCell.getFullYear();

        let match = false;
        if (currentPeriod === 'day' && rowYear === lastYear && rowMonth === lastMonth && rowDay === lastDay) {
            match = true;
        } else if (currentPeriod === 'month' && rowYear === lastYear && rowMonth === lastMonth) {
            match = true;
        } else if (currentPeriod === 'year' && rowYear === lastYear) {
            match = true;
        }

        if (match && !isNaN(value)) {
            if (company === "Ўзбекнефтгаз") {
                uzbekneftgazSum += value;
            } else if (company === "Хорижий ва ҚК") {
                otherSum += value;
            }
        }
    }

    function formatNumber(num) {
        if (num >= 1000) {
            if (num % 1000 === 0) {
                // Ровное число тысяч
                return (num / 1000) + ' т.';
            } else {
                // Не ровное — с одним десятичным знаком
                return (num / 1000).toFixed(1) + ' т.';
            }
        } else {
            // Меньше 1000 — показываем с 1 знаком после запятой для day, иначе без десятичных
            return currentPeriod === 'day' ? num.toFixed(1) : Math.round(num).toString();
        }
    }

    document.getElementById('uzbekneftgazsum').innerText = formatNumber(uzbekneftgazSum);
    document.getElementById('other-sum').innerText = formatNumber(otherSum);
    document.querySelector('.donut .center').innerText = formatNumber(uzbekneftgazSum + otherSum);
}

// dobichabtn — выбираем категорию
document.querySelectorAll(".dobichabtn").forEach(button => {
    button.addEventListener("click", () => {
        currentCategory = button.dataset.category?.trim() || button.innerText.trim();
        updateDonutChart();
    });
});

// Кнопки периода
document.getElementById("last-day-btn")?.addEventListener("click", () => {
    currentPeriod = "day";
    updateDonutChart();
});
document.getElementById("last-month-btn")?.addEventListener("click", () => {
    currentPeriod = "month";
    updateDonutChart();
});
document.getElementById("last-year-btn")?.addEventListener("click", () => {
    currentPeriod = "year";
    updateDonutChart();
});
document.querySelectorAll(".dobichabtn").forEach(button => {
    button.addEventListener("click", () => {
        currentCategory = button.dataset.category?.trim() || button.innerText.trim();
        updateDonutChart();

        // Меняем заголовок
        const titleMap = {
            "Ишлаб чиқариш": "Ишлаб чикариш",
            "Биржага юклаш": "Биржага юклаш",
            "Экспорт": "Экспорт",
            "Кун бошида колдик": "Кун бошида колдик"
        };

        const newTitle = titleMap[currentCategory] || "Олтингугурт улуши";
        document.getElementById("donut-title").innerText = newTitle;
    });
});

function renderEndOfDayTable() {
    if (selectedCategory !== 'Кун охирида колдик') return;
    if (!lastFilledDate) return;

    const lastDay = lastFilledDate.getDate();
    const lastMonth = lastFilledDate.getMonth();
    const lastYear = lastFilledDate.getFullYear();

    const companyData = {};

    for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (!row || !row[0]) continue;

        const date = new Date((row[0] - 25569) * 86400 * 1000);
        if (isNaN(date)) continue;

        let match = false;
        if (currentPeriod === 'day') {
            match = date.getFullYear() === lastYear &&
                date.getMonth() === lastMonth &&
                date.getDate() === lastDay;
        } else if (currentPeriod === 'month') {
            match = date.getFullYear() === lastYear &&
                date.getMonth() === lastMonth;
        } else if (currentPeriod === 'year') {
            match = date.getFullYear() === lastYear;
        }

        if (match) {
            const companyName = row[1]; // колонка B
            const endValue = parseFloat(row[19]) || 0; // колонка T — индекс 19

            if (companyName) {
                if (!companyData[companyName]) {
                    companyData[companyName] = 0;
                }
                companyData[companyName] += endValue;
            }
        }
    }

    // Обновляем заголовки таблицы
    const tableHead = document.querySelector(".factory-table thead");
    tableHead.innerHTML = `
        <tr>
            <th>Корхона номи</th>
            <th>Кун охирида колдик</th>
        </tr>
    `;

    // Заполняем тело таблицы
    const tbody = document.getElementById("company-table-body");
    tbody.innerHTML = "";

    for (const [company, value] of Object.entries(companyData)) {
        tbody.innerHTML += `
            <tr>
                <td>${company}</td>
                <td>${value.toFixed(2)}</td>
            </tr>
        `;
    }

    console.log("Таблица обновлена: Кун охирида колдик (" + currentPeriod + ")");
}




function renderStartOfDayTable() {
    if (selectedCategory !== 'Кун бошида колдик') return;
    if (!lastFilledDate) return;

    const lastDay = lastFilledDate.getDate();
    const lastMonth = lastFilledDate.getMonth();
    const lastYear = lastFilledDate.getFullYear();

    const companyData = {};

    for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (!row || !row[0]) continue;

        const date = new Date((row[0] - 25569) * 86400 * 1000);
        if (isNaN(date)) continue;

        let match = false;
        if (currentPeriod === 'day') {
            match = date.getFullYear() === lastYear &&
                date.getMonth() === lastMonth &&
                date.getDate() === lastDay;
        } else if (currentPeriod === 'month') {
            match = date.getFullYear() === lastYear &&
                date.getMonth() === lastMonth;
        } else if (currentPeriod === 'year') {
            match = date.getFullYear() === lastYear;
        }

        if (match) {
            const companyName = row[1]; // колонка B
            const startValue = parseFloat(row[18]) || 0; // колонка S (индекс 18)

            if (companyName) {
                if (!companyData[companyName]) {
                    companyData[companyName] = 0;
                }
                companyData[companyName] += startValue;
            }
        }
    }

    // Обновляем заголовок таблицы
    const tableHead = document.querySelector(".factory-table thead");
    tableHead.innerHTML = `
        <tr>
            <th>Корхона номи</th>
            <th>Кун бошида колдик</th>
        </tr>
    `;

    // Заполняем тело таблицы
    const tbody = document.getElementById("company-table-body");
    tbody.innerHTML = "";

    for (const [company, value] of Object.entries(companyData)) {
        tbody.innerHTML += `
            <tr>
                <td>${company}</td>
                <td>${value.toFixed(2)}</td>
            </tr>
        `;
    }

    console.log("Таблица обновлена: Кун бошида колдик (" + currentPeriod + ")");
}

function restoreFactoryTableHeader() {
    const tableHead = document.querySelector(".factory-table thead");
    tableHead.innerHTML = `
        <tr>
            <th>Корхона номи</th>
            <th>Олдинги кун амалда</th>
            <th>Режа</th>
            <th>Амалда</th>
            <th>+/-</th>
            <th>+/- олдинги кун</th>
        </tr>
    `;
}



function updateCategorySums() {
    const ids = [
        's-column-sum', 's-column-sum1', 's-column-sum2',
        'sum-text', 'sum-text1', 'sum-text2'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = '0';
    });

    let sumStart = 0, sumEnd = 0, sumLoss = 0;
    let sumIshlab = 0, sumBirja = 0, sumExport = 0;

    const lastDay = lastFilledDate.getDate();
    const lastMonth = lastFilledDate.getMonth();
    const lastYear = lastFilledDate.getFullYear();

    for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (!row || row.length < 21 || !row[0]) continue;

        const category = (row[3] || '').trim();
        const company = (row[2] || '').trim();
        const excelDate = row[0];
        const dateCell = new Date((excelDate - 25569) * 86400 * 1000);
        if (isNaN(dateCell)) continue;

        const rowYear = dateCell.getFullYear();
        const rowMonth = dateCell.getMonth();
        const rowDay = dateCell.getDate();

        if (!(rowYear === lastYear && rowMonth === lastMonth && rowDay === lastDay)) continue;

        if (selectedCompanyType !== "all" && company !== selectedCompanyType) continue;

        // Остатки
        if (category === 'Кун бошида колдик') {
            sumStart += parseFloat(row[18]) || 0;
        }
        if (category === 'Кун охирида колдик') {
            sumEnd += parseFloat(row[19]) || 0;
        }
        if (category === 'Технологик юкотиш') {
            sumLoss += parseFloat(row[20]) || 0;
        }

        // Производство, экспорт, биржа — колонка H (index 7)
        const actual = parseFloat(row[7]) || 0;
        if (category === 'Ишлаб чиқариш') {
            sumIshlab += actual;
        } else if (category === 'Биржага юклаш') {
            sumBirja += actual;
        } else if (category === 'Экспорт') {
            sumExport += actual;
        }
    }

    document.getElementById('s-column-sum').innerText = sumStart.toFixed(2);
    document.getElementById('s-column-sum1').innerText = sumEnd.toFixed(2);
    document.getElementById('s-column-sum2').innerText = sumLoss.toFixed(2);

    document.getElementById('sum-text').innerText = sumIshlab.toFixed(2);
    document.getElementById('sum-text1').innerText = sumBirja.toFixed(2);
    document.getElementById('sum-text2').innerText = sumExport.toFixed(2);
}

function updateSummaries() {
    // ⛔ Прерываем обновление, если выбрана одна из специальных категорий
    if (selectedCategory === "Кун бошида колдик" || selectedCategory === "Кун охирида колдик") {
        return;
    }
    if (!lastFilledDate) {
        ['day-plan', 'day-actual', 'day-mid',
            'month-plan', 'month-actual', 'month-mid',
            'year-plan', 'year-actual', 'year-mid'
        ].forEach(id => {
            document.getElementById(id).innerHTML = '0';
            document.getElementById(id).style.color = 'white';
        });
        return;
    }



    restoreFactoryTableHeader(); // восстанавливаем стандартный заголовок таблицы

    let dayPlan = 0, dayActual = 0, dayMid = 0;
    let monthPlan = 0, monthActual = 0, monthMid = 0;
    let yearPlan = 0, yearActual = 0, yearMid = 0;

    const lastDay = lastFilledDate.getDate();
    const lastMonth = lastFilledDate.getMonth();
    const lastYear = lastFilledDate.getFullYear();

    for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (!row || row.length < 9 || !row[0]) continue;
    
        if ((row[3] || '').trim() !== selectedCategory) continue;
        if (selectedCompanyType !== "all" && (row[2] || '').trim() !== selectedCompanyType) continue;
    
        const excelDate = row[0];
        const dateCell = new Date((excelDate - 25569) * 86400 * 1000);
        if (isNaN(dateCell)) continue;
    
        const plan = parseFloat(row[6]) || 0;
        const actual = parseFloat(row[7]) || 0;
        const mid = parseFloat(row[8]) || 0;
    
        const rowYear = dateCell.getFullYear();
        const rowMonth = dateCell.getMonth();
        const rowDay = dateCell.getDate();
    
        if (rowYear === lastYear) {
            yearPlan += plan;
            yearActual += actual;
            yearMid += mid;
        }
    
        if (rowYear === lastYear && rowMonth === lastMonth) {
            monthPlan += plan;
            monthActual += actual;
            monthMid += mid;
        }
    
        if (rowYear === lastYear && rowMonth === lastMonth && rowDay === lastDay) {
            dayPlan += plan;
            dayActual += actual;
            dayMid += mid;
        }
    }
    

    setPlainValue('day-plan', dayPlan);
    setPlainValue('day-actual', dayActual);
    setMidValue('day-mid', dayMid);

    setPlainValue('month-plan', monthPlan);
    setPlainValue('month-actual', monthActual);
    setMidValue('month-mid', monthMid);

    setPlainValue('year-plan', yearPlan);
    setPlainValue('year-actual', yearActual);
    setMidValue('year-mid', yearMid);
}


// Функция без треугольников, белый текст
function setPlainValue(elementId, value) {
    const element = document.getElementById(elementId);
    element.innerText = value.toFixed(2);
    element.style.color = 'white';
}

// Только для mid — с цветом и ▲/▼
function setMidValue(elementId, value) {
    const element = document.getElementById(elementId);
    const rounded = value.toFixed(2);

    if (value > 0) {
        element.innerHTML = `<span style="color:green">${rounded} ▲</span>`;
    } else if (value < 0) {
        element.innerHTML = `<span style="color:red">${rounded} ▼</span>`;
    } else {
        element.innerHTML = `<span style="color:white">${rounded}</span>`;
    }
}






let json = [];
let lastFilledDate = null;

document.addEventListener("DOMContentLoaded", () => {
    fetch("sera.xlsx")
        .then(response => {
            if (!response.ok) {
                throw new Error("Не удалось загрузить файл sera.xlsx");
            }
            return response.arrayBuffer();
        })
        .then(data => {
            const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });

            const sheet = workbook.Sheets['СУГ'];
            if (!sheet) {
                alert("Лист 'СУГ' не найден в Excel-файле.");
                return;
            }

            // 👇 Весь твой код внутри — без изменений
            json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            lastFilledDate = null;

            drawChart(filterData("Общий", null, null));
            updateSummaries();
            updateCategorySums();
            al();
        })
        .catch(error => {
            alert("Ошибка при загрузке Excel: " + error.message);
            console.error(error);
        });
});


function al() {
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
    document.getElementById("start-of-day-btn").addEventListener("click", () => {
        console.log("Нажата кнопка Кун бошида колдик");
        renderStartOfDayTable(); // вызываем отрисовку таблицы
        startDonut();
    });
    document.getElementById("end-of-day-btn").addEventListener("click", () => {
        console.log("Нажата кнопка Кун охирида колдик");
        renderEndOfDayTable(); // вызываем отрисовку таблицы
        endDonut();
    });

    function startDonut() {
        if (selectedCategory !== 'Кун бошида колдик') return;
        console.log("Selected Category: " + selectedCategory);
        let uzbekneftgazSum = 0;
        let otherSum = 0;

        if (!lastFilledDate) {
            document.getElementById('uzbekneftgazsum').innerText = '0';
            document.getElementById('other-sum').innerText = '0';
            document.querySelector('.donut .center').innerText = '0';
            return;
        }

        const lastDay = lastFilledDate.getDate();
        const lastMonth = lastFilledDate.getMonth();
        const lastYear = lastFilledDate.getFullYear();

        for (let i = 1; i < json.length; i++) {
            const row = json[i];
            if (!row || row.length < 19 || !row[0] || !row[2]) continue;

            const excelDate = row[0];
            const dateCell = new Date((excelDate - 25569) * 86400 * 1000);
            if (isNaN(dateCell)) continue;

            const companyType = row[2].trim(); // колонка C
            const startOfDayValue = parseFloat(row[18]) || 0; // колонка S

            const rowDay = dateCell.getDate();
            const rowMonth = dateCell.getMonth();
            const rowYear = dateCell.getFullYear();

            let match = false;
            if (currentPeriod === 'day' && rowYear === lastYear && rowMonth === lastMonth && rowDay === lastDay) {
                match = true;
            } else if (currentPeriod === 'month' && rowYear === lastYear && rowMonth === lastMonth) {
                match = true;
            } else if (currentPeriod === 'year' && rowYear === lastYear) {
                match = true;
            }

            if (match && !isNaN(startOfDayValue)) {
                if (companyType === "Ўзбекнефтгаз") {
                    uzbekneftgazSum += startOfDayValue;
                } else if (companyType === "Хорижий ва ҚК") {
                    otherSum += startOfDayValue;
                }
            }
        }

        function formatNumber(num) {
            if (num >= 1000) {
                if (num % 1000 === 0) {
                    return (num / 1000) + ' т.';
                } else {
                    return (num / 1000).toFixed(1) + ' т.';
                }
            } else {
                return num.toFixed(0);
            }
        }

        document.getElementById('uzbekneftgazsum').innerText = formatNumber(uzbekneftgazSum);
        document.getElementById('other-sum').innerText = formatNumber(otherSum);
        document.querySelector('.donut .center').innerText = formatNumber(uzbekneftgazSum + otherSum);
    }

    function startTechLossDonut() {
        if (selectedCategory !== 'Технологик юкотиш') return;
        if (!lastFilledDate) {
            document.getElementById('uzbekneftgazsum').innerText = '0';
            document.getElementById('other-sum').innerText = '0';
            document.querySelector('.donut .center').innerText = '0';
            return;
        }

        let uzbekneftgazSum = 0;
        let otherSum = 0;

        const lastDay = lastFilledDate.getDate();
        const lastMonth = lastFilledDate.getMonth();
        const lastYear = lastFilledDate.getFullYear();

        for (let i = 1; i < json.length; i++) {
            const row = json[i];
            if (!row || row.length < 21 || !row[0] || !row[2]) continue;

            const excelDate = row[0];
            const dateCell = new Date((excelDate - 25569) * 86400 * 1000);
            if (isNaN(dateCell)) continue;

            const companyType = row[2].trim(); // колонка C
            const techLossValue = parseFloat(row[20]) || 0; // колонка U (индекс 20)

            const rowDay = dateCell.getDate();
            const rowMonth = dateCell.getMonth();
            const rowYear = dateCell.getFullYear();

            let match = false;
            if (currentPeriod === 'day' && rowYear === lastYear && rowMonth === lastMonth && rowDay === lastDay) {
                match = true;
            } else if (currentPeriod === 'month' && rowYear === lastYear && rowMonth === lastMonth) {
                match = true;
            } else if (currentPeriod === 'year' && rowYear === lastYear) {
                match = true;
            }

            if (match && !isNaN(techLossValue)) {
                if (companyType === "Ўзбекнефтгаз") {
                    uzbekneftgazSum += techLossValue;
                } else if (companyType === "Хорижий ва ҚК") {
                    otherSum += techLossValue;
                }
            }
        }

        const format = currentPeriod === 'day' ? (v) => v.toFixed(0) : (v) => v.toFixed(0);

        document.getElementById('uzbekneftgazsum').innerText = format(uzbekneftgazSum);
        document.getElementById('other-sum').innerText = format(otherSum);
        document.querySelector('.donut .center').innerText = format(uzbekneftgazSum + otherSum);
    }

    function renderTechLossTable() {
        if (selectedCategory !== 'Технологик юкотиш') return;
        if (!lastFilledDate) return;

        const lastDay = lastFilledDate.getDate();
        const lastMonth = lastFilledDate.getMonth();
        const lastYear = lastFilledDate.getFullYear();

        const companyData = {};

        for (let i = 1; i < json.length; i++) {
            const row = json[i];
            if (!row || !row[0]) continue;

            const date = new Date((row[0] - 25569) * 86400 * 1000);
            if (isNaN(date)) continue;

            let match = false;
            if (currentPeriod === 'day') {
                match = date.getFullYear() === lastYear &&
                    date.getMonth() === lastMonth &&
                    date.getDate() === lastDay;
            } else if (currentPeriod === 'month') {
                match = date.getFullYear() === lastYear &&
                    date.getMonth() === lastMonth;
            } else if (currentPeriod === 'year') {
                match = date.getFullYear() === lastYear;
            }

            if (match) {
                const companyName = row[1]; // колонка B
                const techLossValue = parseFloat(row[20]) || 0; // колонка U (индекс 20)

                if (companyName) {
                    if (!companyData[companyName]) {
                        companyData[companyName] = 0;
                    }
                    companyData[companyName] += techLossValue;
                }
            }
        }

        // Обновляем заголовок таблицы
        const tableHead = document.querySelector(".factory-table thead");
        tableHead.innerHTML = `
            <tr>
                <th>Корхона номи</th>
                <th>Технологик юкотиш</th>
            </tr>
        `;

        // Заполняем тело таблицы
        const tbody = document.getElementById("company-table-body");
        tbody.innerHTML = "";

        for (const [company, value] of Object.entries(companyData)) {
            tbody.innerHTML += `
                <tr>
                    <td>${company}</td>
                    <td>${value.toFixed(2)}</td>
                </tr>
            `;
        }

        console.log("Таблица обновлена: Технологик юкотиш (" + currentPeriod + ")");
    }

    // Обработчик нажатия кнопки "Технологик юкотиш"
    document.getElementById('tech-missed').addEventListener('click', () => {
        selectedCategory = 'Технологик юкотиш';
        startTechLossDonut();
        renderTechLossTable();
    });


    function endDonut() {
        if (selectedCategory !== 'Кун охирида колдик') return;
        console.log("Selected Category: " + selectedCategory);
        let uzbekneftgazSum = 0;
        let otherSum = 0;

        if (!lastFilledDate) {
            document.getElementById('uzbekneftgazsum').innerText = '0';
            document.getElementById('other-sum').innerText = '0';
            document.querySelector('.donut .center').innerText = '0';
            return;
        }

        const lastDay = lastFilledDate.getDate();
        const lastMonth = lastFilledDate.getMonth();
        const lastYear = lastFilledDate.getFullYear();

        for (let i = 1; i < json.length; i++) {
            const row = json[i];
            if (!row || row.length < 19 || !row[0] || !row[2]) continue;

            const excelDate = row[0];
            const dateCell = new Date((excelDate - 25569) * 86400 * 1000);
            if (isNaN(dateCell)) continue;

            const companyType = row[2].trim(); // колонка C
            const endOfDayValue = parseFloat(row[19]) || 0; // колонка T (индекс 19)

            const rowDay = dateCell.getDate();
            const rowMonth = dateCell.getMonth();
            const rowYear = dateCell.getFullYear();

            let match = false;
            if (currentPeriod === 'day' && rowYear === lastYear && rowMonth === lastMonth && rowDay === lastDay) {
                match = true;
            } else if (currentPeriod === 'month' && rowYear === lastYear && rowMonth === lastMonth) {
                match = true;
            } else if (currentPeriod === 'year' && rowYear === lastYear) {
                match = true;
            }

            if (match && !isNaN(endOfDayValue)) {
                if (companyType === "Ўзбекнефтгаз") {
                    uzbekneftgazSum += endOfDayValue;
                } else if (companyType === "Хорижий ва ҚК") {
                    otherSum += endOfDayValue;
                }
            }
        }

        function formatNumber(num) {
            if (num >= 1000) {
                if (num % 1000 === 0) {
                    return (num / 1000) + ' т.';
                } else {
                    return (num / 1000).toFixed(1) + ' т.';
                }
            } else {
                return num.toFixed(0);
            }
        }

        document.getElementById('uzbekneftgazsum').innerText = formatNumber(uzbekneftgazSum);
        document.getElementById('other-sum').innerText = formatNumber(otherSum);
        document.querySelector('.donut .center').innerText = formatNumber(uzbekneftgazSum + otherSum);
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

    if (selectedCategory == "Кун бошида колдик" || selectedCategory == "Кун охирида колдик") {
        const el = document.getElementById('uzbekneftgazsum');
        el.style.fontSize = '18px';
        const el1 = document.getElementById('other-sum');
        el1.style.fontSize = '18px';
    }

    function updateSumsByPeriod(period) {
        if (!lastFilledDate || json.length === 0) return;

        const lastYear = lastFilledDate.getFullYear();
        const lastMonth = lastFilledDate.getMonth();
        const lastDay = lastFilledDate.getDate();

        let sum18 = 0; // Кун бошида колдик (колонка S)
        let sum19 = 0; // Кун охирида колдик (колонка T)
        let sum20 = 0; // Технологик юкотиш (колонка U)

        let ishlabChiqarishSum = 0;
        let birjagaYuklashSum = 0;
        let eksportSum = 0;

        for (let i = 1; i < json.length; i++) {
            const row = json[i];
            if (!row || !row[0]) continue;

            const excelDate = row[0];
            const dateCell = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
            if (isNaN(dateCell)) continue;

            const sameDay = dateCell.getFullYear() === lastYear && dateCell.getMonth() === lastMonth && dateCell.getDate() === lastDay;
            const sameMonth = dateCell.getFullYear() === lastYear && dateCell.getMonth() === lastMonth;
            const sameYear = dateCell.getFullYear() === lastYear;

            let match = false;
            if (period === 'day' && sameDay) match = true;
            if (period === 'month' && sameMonth) match = true;
            if (period === 'year' && sameYear) match = true;

            if (match) {
                // S, T, U колонки
                sum18 += parseFloat(row[18]) || 0;
                sum19 += parseFloat(row[19]) || 0;
                sum20 += parseFloat(row[20]) || 0;

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

        // Обновление значений в DOM
        document.getElementById('s-column-sum').innerText = sum18.toFixed(2);
        document.getElementById('s-column-sum1').innerText = sum19.toFixed(2);
        document.getElementById('s-column-sum2').innerText = sum20.toFixed(2);

        document.getElementById('sum-text').innerText = ishlabChiqarishSum.toFixed(2);
        document.getElementById('sum-text1').innerText = birjagaYuklashSum.toFixed(2);
        document.getElementById('sum-text2').innerText = eksportSum.toFixed(2);
    }

    document.getElementById("last-day-btn").addEventListener("click", function () {
        updateFactoryTableByPeriod("day");
        updateSumsByPeriod("day"); // 👈 добавлено
        currentPeriod = 'day';
        startDonut();
        endDonut();
        renderEndOfDayTable();
        renderStartOfDayTable();
        startTechLossDonut();
        renderTechLossTable();
        if (selectedCategory == "Кун бошида колдик" || selectedCategory == "Кун охирида колдик") {
            const el = document.getElementById('uzbekneftgazsum');
            el.style.fontSize = '18px';
            const el1 = document.getElementById('other-sum');
            el1.style.fontSize = '18px';
        }
    });

    document.getElementById("last-month-btn").addEventListener("click", function () {
        updateFactoryTableByPeriod("month");
        updateSumsByPeriod("month"); // 👈 добавлено
        currentPeriod = 'month';
        startDonut();
        endDonut();
        renderEndOfDayTable();
        renderStartOfDayTable();
        startTechLossDonut();
        renderTechLossTable();
        if (selectedCategory == "Кун бошида колдик" || selectedCategory == "Кун охирида колдик") {
            const el = document.getElementById('uzbekneftgazsum');
            el.style.fontSize = '18px';
            const el1 = document.getElementById('other-sum');
            el1.style.fontSize = '18px';
        }
    });

    document.getElementById("last-year-btn").addEventListener("click", function () {
        updateFactoryTableByPeriod("year");
        updateSumsByPeriod("year"); // 👈 добавлено
        currentPeriod = 'year';
        startDonut();
        endDonut();
        renderEndOfDayTable();
        renderStartOfDayTable();
        startTechLossDonut();
        renderTechLossTable();

        if (selectedCategory == "Кун бошида колдик" || selectedCategory == "Кун охирида колдик") {
            const el = document.getElementById('uzbekneftgazsum');
            el.style.fontSize = '18px';
            const el1 = document.getElementById('other-sum');
            el1.style.fontSize = '18px';
        }
    });
    if (selectedCategory !== "Кун бошида колдик" || selectedCategory !== "Кун охирида колдик") {
        const el = document.getElementById('uzbekneftgazsum');
        el.style.fontSize = '24px';
        const el1 = document.getElementById('other-sum');
        el1.style.fontSize = '24px';
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
                const colF = row[23] || "";
                const colG = row[6] || "";
                const colH = row[7] || "";
                const colQ = row[16] || "";
                const colR = formatMidValue(row[24]) || "";
                const companyType = row[2] || ""; // колонка C
                console.log('ColF: ', colF, ', ColR: ', colR);

                const formattedColF = typeof colF === "number" ? colF.toFixed(2) : colF;
                const formattedColG = typeof colG === "number" ? colG.toFixed(2) : colG;
                const formattedColH = typeof colH === "number" ? colH.toFixed(2) : colH;
                const formattedColQ = typeof colQ === "number" ? colQ.toFixed(2) : colQ;
                const formattedColR = typeof colR === "number" ? colR.toFixed(2) : colR;

                tableRows += `
                <tr data-company-type="${companyType}">
                    <td>${company}</td>
                    <td>${formattedColF}</td>
                    <td>${formattedColG}</td>
                    <td>${formattedColH}</td>
                    <td>${formattedColQ}</td>
                    <td>${formattedColR}</td>
                </tr>
            `;
                break;
            }
        }
    });

    document.getElementById("company-table-body").innerHTML = tableRows;


    // ✅ Список компаний из изображения
    const companyList = [
        "SANEG МЧЖ",
        "Муборак ГҚИЗ",
        "Шўртан НГҚЧБ",
        "Шўртан ГКМ МЧЖ",
        "Бухоро НҚИЗ МЧЖ",
        "LUKOIL МЧЖ",
        "New silk road oil & gas МЧЖ"
    ];

    // ✅ Функция обновления factory-table по категории
    // ✅ Функция обновления factory-table по категории
    function updateFactoryTableByCategory(categoryName) {
        let companiesSet = new Set(companyList);
        let tableRows = "";

        const latestDate = (() => {
            let lastDate = null;
            for (let i = 1; i < json.length; i++) {
                const row = json[i];
                if (row[0]) lastDate = row[0];
            }
            return lastDate;
        })();

        companiesSet.forEach(company => {
            for (let i = 1; i < json.length; i++) {
                const row = json[i];
                if (
                    row[0] === latestDate &&
                    row[1] === company &&
                    row[3] === categoryName
                ) {
                    const colF = row[23] || "";
                    const colG = row[6] || "";
                    const colH = row[7] || "";
                    const colQ = row[16] || "";
                    const colR = formatMidValue(row[24]) || "";
                    const companyType = row[2] || ""; // колонка C
                    console.log('ColF: ', colF, ', ColR: ', colR);

                    // Применяем .toFixed(2) для числовых значений
                    const formattedColF = typeof colF === "number" ? colF.toFixed(2) : colF;
                    const formattedColG = typeof colG === "number" ? colG.toFixed(2) : colG;
                    const formattedColH = typeof colH === "number" ? colH.toFixed(2) : colH;
                    const formattedColQ = typeof colQ === "number" ? colQ.toFixed(2) : colQ;
                    const formattedColR = typeof colR === "number" ? colR.toFixed(2) : colR;

                    tableRows += `
                <tr data-company-type="${companyType}">
                    <td>${company}</td>
                    <td>${formattedColF}</td>
                    <td>${formattedColG}</td>
                    <td>${formattedColH}</td>
                    <td>${formattedColQ}</td>
                    <td>${formattedColR}</td>
                </tr>
            `;
                    break;
                }
            }
        });

        document.getElementById("company-table-body").innerHTML = tableRows;
    }


    // ✅ Подключение обработчиков к кнопкам
    const categoryButtons = document.querySelectorAll(".category-btn.dobichabtn");
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            const category = button.getAttribute("data-category");
            updateFactoryTableByCategory(category);
        });
    });

    function formatMidValue(value) {
        const num = parseFloat(value);
        const formatted = isNaN(num) ? "0.00" : num.toFixed(2);

        if (num > 0) {
            return `<span style="color:green">${formatted} ▲</span>`;
        } else if (num < 0) {
            return `<span style="color:red">${formatted} ▼</span>`;
        } else {
            return `<span style="color:white">${formatted}</span>`;
        }
    }




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
        const header = json[0];
        const targetColumnIndex = header.indexOf("бир кун олдин +/-"); // будет 24
        const formatNumber = value => {
            const num = parseFloat(value);
            return (!isNaN(num) ? num.toFixed(2) : (value ?? ""));
        };

        companies.forEach(company => {
            for (let i = 1; i < json.length; i++) {
                const row = json[i];
                if (row[0] === targetExcelDate && row[1] === company) {
                    const colF = formatNumber(row[23]);
                    const colG = formatNumber(row[6]);
                    const colH = formatNumber(row[7]);
                    const colQ = formatMidValue(row[16]);
                    const colR = formatMidValue(row[24]);
                    const companyType = row[2] || "";

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



    function updateSummariesWithCategory(selectedCategory) {
        if (!lastFilledDate) return;

        let dayPlan = 0, dayActual = 0, dayMid = 0;
        let monthPlan = 0, monthActual = 0, monthMid = 0;
        let yearPlan = 0, yearActual = 0, yearMid = 0;

        const lastDay = lastFilledDate.getDate();
        const lastMonth = lastFilledDate.getMonth();
        const lastYear = lastFilledDate.getFullYear();

        for (let i = 1; i < json.length; i++) {
            const row = json[i];
            if (!row || !row[0] || row[3] !== selectedCategory) continue;

            const excelDate = row[0];
            const dateCell = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
            if (isNaN(dateCell)) continue;

            const plan = parseFloat(row[6]) || 0;
            const actual = parseFloat(row[7]) || 0;
            const mid = parseFloat(row[8]) || 0;

            if (dateCell.getFullYear() === lastYear) {
                yearPlan += plan;
                yearActual += actual;
                yearMid += mid;

                if (dateCell.getMonth() === lastMonth) {
                    monthPlan += plan;
                    monthActual += actual;
                    monthMid += mid;

                    if (dateCell.getDate() === lastDay) {
                        dayPlan += plan;
                        dayActual += actual;
                        dayMid += mid;
                    }
                }
            }
        }

        document.getElementById('day-plan').innerText = dayPlan.toFixed(2);
        document.getElementById('day-actual').innerText = dayActual.toFixed(2);
        document.getElementById('day-mid').innerText = dayMid.toFixed(2);

        document.getElementById('month-plan').innerText = monthPlan.toFixed(2);
        document.getElementById('month-actual').innerText = monthActual.toFixed(2);
        document.getElementById('month-mid').innerText = monthMid.toFixed(2);

        document.getElementById('year-plan').innerText = yearPlan.toFixed(2);
        document.getElementById('year-actual').innerText = yearActual.toFixed(2);
        document.getElementById('year-mid').innerText = yearMid.toFixed(2);
    }


    document.querySelectorAll('.dobichabtn').forEach(button => {
        button.addEventListener('click', () => {
            const selectedCategory = button.dataset.category;
            updateSummariesWithCategory(selectedCategory);
        });
    });

    function generateFactoryTable() {
        let tableRows = "";

        companies.forEach(company => {
            for (let i = 1; i < json.length; i++) {
                const row = json[i];
                if (row[1] === company) {
                    const colF = row[23] || "";
                    const colG = row[6] || "";
                    const colH = row[7] || "";
                    const colQ = row[16] || "";
                    const colR = formatMidValue(row[24]) || "";
                    const companyType = row[2] || ""; // колонка C

                    const formattedColF = typeof colF === "number" ? colF.toFixed(2) : colF;
                    const formattedColG = typeof colG === "number" ? colG.toFixed(2) : colG;
                    const formattedColH = typeof colH === "number" ? colH.toFixed(2) : colH;
                    const formattedColQ = typeof colQ === "number" ? colQ.toFixed(2) : colQ;
                    const formattedColR = typeof colR === "number" ? colR.toFixed(2) : colR;

                    tableRows += `
                        <tr data-company-type="${companyType}">
                            <td>${company}</td>
                            <td>${formattedColF}</td>
                            <td>${formattedColG}</td>
                            <td>${formattedColH}</td>
                            <td>${formattedColQ}</td>
                            <td>${formattedColR}</td>
                        </tr>
                    `;
                    break;
                }
            }
        });

        document.getElementById("company-table-body").innerHTML = tableRows;
    }



    function applyCompanyFilter(filterType) {
        const rows = document.querySelectorAll("#company-table-body tr");

        rows.forEach(row => {
            const companyType = row.getAttribute("data-company-type");

            let shouldKeep = false;
            if (filterType === "neft") {
                shouldKeep = companyType === "Ўзбекнефтгаз";
            } else if (filterType === "xk") {
                shouldKeep = companyType === "Хорижий ва ҚК";
            } else if (filterType === "summary") {
                shouldKeep = true;
            }

            if (!shouldKeep) {
                row.remove(); // удаляем строку
            }
        });
    }
    function resetCompanyFilter() {
        generateFactoryTable(); // перерисовываем всё заново
    }

    

    document.querySelectorAll('.checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', function () {
            const wasActive = this.classList.contains('active');
            const filterType = this.id;
    
            resetCompanyFilter();
    
            document.querySelectorAll('.checkbox').forEach(btn => {
                btn.classList.remove('active');
                btn.classList.remove('disabled');
            });
    
            if (!wasActive) {
                this.classList.add('active');
    
                // Присваиваем тип компании для фильтрации
                selectedCompanyType = (filterType === "summary")
                    ? "all"
                    : (filterType === "neft" ? "Ўзбекнефтгаз" : "Хорижий ва ҚК");
    
                applyCompanyFilter(filterType);
            } else {
                selectedCompanyType = "all";
            }
    
            // ⬅️ Обязательно обновляем расчёты
            updateSummaries();
            updateCategorySums();
        });
    });
    
    
    
    // Функция sleep
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    
    
    








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
}

let selectedCompanyType = "all"; // "Ўзбекнефтгаз", "Хорижий ва ҚК", либо "all"
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
function drawChart({ map2024, map2025, lastFilledDate }) {
    const chartData = [['Дата', ' ', '2024', { type: 'string', role: 'annotation' }, '2025', { type: 'string', role: 'annotation' }]];
    const dateList = [];

    for (let m = 1; m <= 12; m++) {
        for (let d = 1; d <= 31; d++) {
            const key = `${m}-${d}`;
            const val2024 = map2024.has(key) ? map2024.get(key) : null;
            const val2025 = map2025.has(key) ? map2025.get(key) : null;

            if (val2024 !== null || val2025 !== null) {
                const date = new Date(2025, m - 1, d);
                if (!lastFilledDate || date <= lastFilledDate) {
                    dateList.push(date);

                    const showAnnotation = d % 5 === 0;
                    const anno2024 = showAnnotation && val2024 != null ? val2024.toFixed(0) : null;
                    const anno2025 = showAnnotation && val2025 != null ? val2025.toFixed(0) : null;

                    const maxVal = Math.max(val2024 ?? 0, val2025 ?? 0);

                    chartData.push([
                        date,
                        maxVal,
                        val2024 ?? 0, anno2024,
                        val2025 ?? 0, anno2025
                    ]);
                }
            }
        }
    }

    const data = google.visualization.arrayToDataTable(chartData);

    // Определяем формат вывода по оси X
    let formatPattern = 'LLLL'; // для года
    let ticks = [];

    if (dateList.length === 1) {
        formatPattern = 'd MMMM yyyy';
        ticks = [dateList[0]];
    } else {
        const first = dateList[0];
        const sameMonth = dateList.every(d => d.getMonth() === first.getMonth());
        const months = new Set(dateList.map(d => d.getMonth()));

        if (sameMonth) {
            formatPattern = 'dd.MM.yy';
            ticks = [...dateList];
        } else if (months.size <= 2) {
            formatPattern = 'dd.MM.yy';
            ticks = [...dateList];
        } else {
            const usedMonths = new Set();
            dateList.forEach(d => {
                const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
                if (!usedMonths.has(monthStart.getMonth())) {
                    ticks.push(monthStart);
                    usedMonths.add(monthStart.getMonth());
                }
            });
            formatPattern = 'LLLL';
        }
    }

    const options = {
        title: 'Сравнение за 2024 и 2025 гг.',
        curveType: 'function',
        legend: {
            position: 'bottom',
            textStyle: { color: '#ffffff' }
        },
        hAxis: {
            textStyle: { color: '#ffffff' },
            gridlines: {
                count: -1,
                color: '#4d4d4d'  // Твоя серая сетка
            },
            minorGridlines: {
                color: 'transparent'  // Убрать белые второстепенные линии
            },
            ticks: ticks,
            format: formatPattern
        },
        vAxis: {
            textPosition: 'none',
            gridlines: {
                color: '#4d4d4d'  // Твоя серая сетка
            },
            minorGridlines: {
                color: 'transparent'  // Убрать белые второстепенные линии
            }
        },        
        annotations: {
            alwaysOutside: true,
            textStyle: {
                fontSize: 14,
                color: '#ffffff',
                auraColor: 'none'
            }
        },
        colors: ['#2f2f2f', 'green', '#3366cc'],
        series: {
            0: { areaOpacity: 0.4, lineWidth: 0 }, // фон
            1: { areaOpacity: 0.2, lineWidth: 2 }, // 2024
            2: { areaOpacity: 0.2, lineWidth: 2 }  // 2025
        },
        animation: {
            duration: 1000,
            easing: 'out',
            startup: true
        },
        backgroundColor: 'transparent',
        titleTextStyle: { color: '#ffffff', fontSize: 16 },
        isStacked: false
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

    currentPeriod = 'day';
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
    currentPeriod = 'month';
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
    currentPeriod = 'year';
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

        // ✅ добавлено условие по колонке D: только "Ишлаб чиқариш"
        const category = row[3];
        const isProduction = category === "Ишлаб чиқариш";

        if (
            ((period === 'day' && sameDay) ||
                (period === 'month' && sameMonth) ||
                (period === 'year' && sameYear)) &&
            isProduction
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
        const companyRows = targetRows.filter(row => row[1] === company);

        let sumF = 0, sumG = 0, sumH = 0, sumQ = 0, sumR = 0;

        companyRows.forEach(row => {
            sumF += parseFloat(row[23]) || 0;
            sumG += parseFloat(row[6]) || 0;
            sumH += parseFloat(row[7]) || 0;
            sumQ += parseFloat(row[16]) || 0;
            sumR += parseFloat(row[24]) || 0;
        });

        const formattedSumF = sumF.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        const formattedSumG = sumG.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        const formattedSumH = sumH.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        const formattedSumQ = sumQ.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        const formattedSumR = sumR.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

        tableRows += `
            <tr>
                <td>${company}</td>
                <td>${formattedSumF}</td>
                <td>${formattedSumG}</td>
                <td>${formattedSumH}</td>
                <td>${formattedSumQ}</td>
                <td>${formattedSumR}</td>
            </tr>
        `;
    });

    document.getElementById("company-table-body").innerHTML = tableRows;
}


document.getElementById('last-day-btn').addEventListener('click', () => {
    updateFactoryTableByPeriod('day');
    currentPeriod = 'day';
});

document.getElementById('last-month-btn').addEventListener('click', () => {
    updateFactoryTableByPeriod('month');
    currentPeriod = 'month';
});

document.getElementById('last-year-btn').addEventListener('click', () => {
    updateFactoryTableByPeriod('year');
    currentCategory = 'year';
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
    currentPeriod = 'day';
});

document.getElementById('last-month-btn').addEventListener('click', () => {
    updateDonutValues('month');
    currentPeriod = 'month';
});

document.getElementById('last-year-btn').addEventListener('click', () => {
    updateDonutValues('year');
    currentPeriod = 'year';

});

// Инициализация при загрузке страницы
updateDonutValues('day');

document.getElementById('file-input').addEventListener('change', function () {
    // Название файла не будет отображаться
    console.log('Файл загружен, но не показывается в интерфейсе.');
});