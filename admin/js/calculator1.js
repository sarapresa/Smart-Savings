const calculate = document.getElementById("calculate")
calculate.addEventListener("click", setValues)

const borderColor1 = "rgb(217,79,92)"
const backgroundColor1 = "rgba(217, 79, 92, 0.2)"

const chartID = document.getElementById("graph").getContext("2d")
let graphic = new Chart(chartID, {
    type: "bar",
    data: {
        labels: (months = ["Months"]),
        datasets: [
            {
                label: "Balance Accumulation",
                data: [0],
                backgroundColor: [backgroundColor1],
                borderColor: [borderColor1],
                borderWidth: 2,
                borderRadius: 15,
            },
        ],
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    },
})

function setValues() {
    let initialValue = Number(document.getElementById("initialValue").value)
    let monthlyInvestment = Number(document.getElementById("monthlyInvestment").value)
    let annualInterest = Number(document.getElementById("annualInterest").value)
    let months = Number(document.getElementById("months").value)
    let years = Number(document.getElementById("years").value) // Adicionado
    let totalValue = document.getElementById("totalValue")
    let investedValue = document.getElementById("investedValue")
    let totalInterested = document.getElementById("totalInterested")
    let totalMonths = years * 12 + months

    calculator(initialValue, monthlyInvestment, annualInterest, totalMonths, totalValue, investedValue, totalInterested)
}

function calculator(initialValue, monthlyInvestment, annualInterest, months, totalValue, investedValue, totalInterested) {
    let totalAmount = initialValue
    let totalInvested = initialValue
    let totalInterest = Number()
    let dividend = Number()
    let accumulatedInterestedArr = []
    let totalAmountArr = []
    let totalInvestedArr = []
    let dividendMonthArr = []
    let monthlyInterest = annualInterest / 12 / 100

    if (document.getElementById("months").value == "") {
        resetTable(false)
    } else {
        resetTable(true)
    }

    for (i = 0; i < months; i++) {
        dividend = totalAmount * monthlyInterest
        dividendMonthArr[i] = dividend.toFixed(2)

        if (accumulatedInterestedArr.length < 1) {
            accumulatedInterestedArr[i] = dividend
        } else {
            accumulatedInterestedArr[i] = dividend + accumulatedInterestedArr[i - 1]
        }

        totalAmount += dividend + monthlyInvestment
        totalAmountArr[i] = totalAmount.toFixed(2)

        totalInvested += monthlyInvestment
        totalInvestedArr[i] = totalInvested.toFixed(2)

        totalInterest += dividend
    }

    totalValue.innerHTML = totalAmount.toFixed(2) + " €"
    investedValue.innerHTML = totalInvested.toFixed(2) + " €"
    totalInterested.innerHTML = totalInterest.toFixed(2) + " €"

    list()
    graph(totalAmountArr, months)

    function list() {
        let line = 1

        for (i = 0; i < months; i++) {
            let table = document.getElementById("interestTable")

            let newLine = table.insertRow(line)

            let cell1 = newLine.insertCell(0)
            let cell2 = newLine.insertCell(1)
            let cell3 = newLine.insertCell(2)
            let cell4 = newLine.insertCell(3)
            let cell5 = newLine.insertCell(4)

            cell1.innerHTML = i + 1
            cell2.innerHTML = dividendMonthArr[i]
            cell3.innerHTML = accumulatedInterestedArr[i].toFixed(2)
            cell4.innerHTML = totalInvestedArr[i]
            cell5.innerHTML = totalAmountArr[i]

            line++
        }
    }
}
function graph(totalAmountArr, months) {
    let time = []
    for (i = -1; i < months; i++) {
        time[i] = i + 1
    }
    if (time.length == 0) {
        time[0] = "Months"
    }
    graphic.destroy()
    graphic = new Chart(chartID, {
        type: "bar",
        data: {
            labels: time,
            datasets: [
                {
                    label: "Balance Accumulation",
                    data: totalAmountArr,
                    backgroundColor: [backgroundColor1],
                    borderColor: [borderColor1],
                    borderWidth: 2,
                    borderRadius: 15,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    })
}

document.getElementById("reset").addEventListener("click", function () {
    graph(0, 0)
    resetTable(false)
    document.getElementById("initialValue").value = ""
    document.getElementById("monthlyInvestment").value = ""
    document.getElementById("annualInterest").value = ""
    document.getElementById("months").value = ""
    document.getElementById("totalValue").innerText = "0.00 €"
    document.getElementById("investedValue").innerText = "0.00 €"
    document.getElementById("totalInterested").innerText = "0.00 €"
})

function resetTable(bool) {
    let newCalcultion = bool

    document.getElementById("interestTable").innerHTML = `
    <tr>
        <th>Months</th>
        <th>Interest of the Month</th>
        <th>Accumulated Interest</th>
        <th>Total Invested</th>
        <th>Total Accumulated</th>
    </tr>`

    if (newCalcultion == false) {
        document.getElementById("interestTable").innerHTML += `
        <tr>
            <td> 0 </td>
            <td> 0 </td>
            <td> 0 </td>
            <td> 0 </td>
            <td> 0 </td>
        </tr>
        `
    }
}

document.getElementById("exportButton").addEventListener("click", handleExport)

function handleExport() {
    const exportFormat = document.getElementById("export").value

    if (exportFormat === "csv") {
        exportToCSV()
    } else if (exportFormat === "json") {
        exportToJSON()
    } else if (exportFormat === "pdf") {
        exportToPDF()
    }
}

function exportToCSV() {
    const table = document.getElementById("interestTable")
    const csvRows = Array.from(table.rows).map((row) =>
        Array.from(row.cells)
            .map((cell) => cell.innerText)
            .join(",")
    )
    const csv = csvRows.join("\n")

    exportData(csv, "Interest Table.csv", "text/csv")
}

function exportToJSON() {
    const table = document.getElementById("interestTable")
    const jsonData = Array.from(table.rows)
        .slice(1)
        .map((row) => ({
            Months: row.cells[0].innerText,
            "Interest of the Month": row.cells[1].innerText,
            "Accumulated Interest": row.cells[2].innerText,
            "Total Invested": row.cells[3].innerText,
            "Total Accumulated": row.cells[4].innerText,
        }))

    const jsonString = JSON.stringify(jsonData, null, 2)
    exportData(jsonString, "Interest Data.json", "application/json")
}

async function exportToPDF() {
    const element = document.getElementById("CalculatorData")
    const options = {
        margin: 1,
        filename: "Interest Data",
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: "mm", format: "a1", orientation: "portrait" },
    }

    await html2pdf(element, options)
}

function exportData(data, filename, type) {
    const blob = new Blob([data], { type: type })
    const link = document.createElement("a")
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
