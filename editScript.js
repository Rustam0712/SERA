    document.addEventListener('DOMContentLoaded', () => {
        const editTable = document.getElementById('editTable');
        const saveButton = document.getElementById('saveButton');
        const importButton = document.getElementById('importButton');
        const excelFileInput = document.getElementById('excelFile');

        let tableData = JSON.parse(localStorage.getItem('tableData')) || [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0]
        ];

        tableData.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            row.forEach((cell, colIndex) => {
                const td = document.createElement('td');
                td.contentEditable = true;
                td.textContent = cell;
                td.addEventListener('input', () => {
                    tableData[rowIndex][colIndex] = td.textContent;
                });
                tr.appendChild(td);
            });
            editTable.appendChild(tr);
        });

        saveButton.addEventListener('click', () => {
            localStorage.setItem('tableData', JSON.stringify(tableData));
        });

        importButton.addEventListener('click', () => {
            const file = excelFileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                    tableData = jsonData.slice(1); // Пропускаем заголовок
                    updateTable();
                    processTableData(); // 👈 Анализ после импорта
                };
                reader.readAsBinaryString(file);
            }
        });

        function updateTable() {
            editTable.innerHTML = '';
            tableData.forEach((row, rowIndex) => {
                const tr = document.createElement('tr');
                row.forEach((cell, colIndex) => {
                    const td = document.createElement('td');
                    td.contentEditable = true;
                    td.textContent = cell;
                    td.addEventListener('input', () => {
                        tableData[rowIndex][colIndex] = td.textContent;
                    });
                    tr.appendChild(td);
                });
                editTable.appendChild(tr);
            });
        }

        // 📊 Функция анализа Excel
        function processTableData() {
            console.log("🟢 Начинаем обработку данных Excel...");
            console.log("📋 Пример первых 5 строк:");
            console.log(tableData.slice(0, 5));

            function getDate(row) {
                const rawDate = row[0];
                console.log("🔍 Проверка даты:", rawDate);

                // Если дата в формате 'дд.мм.гг'
                if (typeof rawDate === 'string' && /^\d{2}\.\d{2}\.\d{2}$/.test(rawDate)) {
                    const [day, month, year] = rawDate.split('.');
                    const fullYear = '20' + year; // Добавляем "20" для года, чтобы получить 2025 вместо 25
                    const jsDate = new Date(`${fullYear}-${month}-${day}`);
                    return jsDate.toISOString().slice(0, 10); // Возвращаем дату в формате YYYY-MM-DD
                }

                // Оставшиеся проверки для других типов данных
                if (rawDate instanceof Date) return rawDate.toISOString().slice(0, 10);

                if (typeof rawDate === 'number') {
                    const date = XLSX.SSF.parse_date_code(rawDate);
                    if (date) {
                        const jsDate = new Date(date.y, date.m - 1, date.d);
                        return jsDate.toISOString().slice(0, 10);
                    }
                }

                if (typeof rawDate === 'string') {
                    const parsed = new Date(rawDate);
                    if (!isNaN(parsed)) return parsed.toISOString().slice(0, 10);
                }

                return null;
            }

            const dateGroups = {};
            tableData.forEach((row, i) => {
                const date = getDate(row);
                if (date) {
                    if (!dateGroups[date]) dateGroups[date] = [];
                    dateGroups[date].push(row);
                }
            });

            const sortedDates = Object.keys(dateGroups).sort((a, b) => new Date(a) - new Date(b));
            const lastDate = sortedDates.at(-1);
            const prevDate = sortedDates.at(-2);

            console.log("📅 Последняя дата:", lastDate);
            console.log("📅 Предыдущая дата:", prevDate);

            function sumColumn(rows, colIndex) {
                return rows.reduce((acc, row) => {
                    const val = parseFloat(row[colIndex]);
                    return acc + (isNaN(val) ? 0 : val);
                }, 0);
            }

            const lastSum = sumColumn(dateGroups[lastDate] || [], 7);
            const prevSum = sumColumn(dateGroups[prevDate] || [], 7);

            console.log(`📊 Сумма за ${lastDate}:`, lastSum);
            console.log(`📊 Сумма за ${prevDate}:`, prevSum);

            const testEl = document.getElementById('test');
            if (testEl) {
                testEl.textContent = `${lastDate} — ${lastSum}`;
            }
        }
    });
