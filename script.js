document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    document.getElementById('startDate').valueAsDate = new Date();

    // Initialize state
    let amortizationSchedule = [];
    let payment = 0;
    let totalInterest = 0;

    // Form submission handler
    document.getElementById('loanForm').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateLoan();
    });

    // Reset button handler
    document.getElementById('resetBtn').addEventListener('click', resetCalculator);

    // Download button handler
    document.getElementById('downloadBtn').addEventListener('click', downloadSchedule);

    function calculateLoan() {
        // Get input values
        const principal = parseFloat(document.getElementById('loanAmount').value);
        const annualRate = parseFloat(document.getElementById('interestRate').value);
        const years = parseInt(document.getElementById('loanTerm').value);
        const frequency = document.getElementById('paymentFrequency').value;

        // Validate inputs
        if (!principal || !annualRate || !years) {
            alert('Please fill in all required fields');
            return;
        }

        if (principal <= 0 || annualRate <= 0 || years <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        // Calculate payment frequency
        let numberOfPayments;
        let ratePerPeriod;

        switch(frequency) {
            case 'annually':
                numberOfPayments = years;
                ratePerPeriod = annualRate / 100;
                break;
            case 'quarterly':
                numberOfPayments = years * 4;
                ratePerPeriod = annualRate / 400;
                break;
            default: // monthly
                numberOfPayments = years * 12;
                ratePerPeriod = annualRate / 1200;
        }

        // Calculate payment using the loan amortization formula
        payment = (principal * ratePerPeriod * Math.pow(1 + ratePerPeriod, numberOfPayments)) / 
                 (Math.pow(1 + ratePerPeriod, numberOfPayments) - 1);

        // Calculate amortization schedule
        let balance = principal;
        totalInterest = 0;
        amortizationSchedule = [];

        for (let i = 1; i <= numberOfPayments; i++) {
            const interest = balance * ratePerPeriod;
            const principalPaid = payment - interest;
            balance = Math.max(0, balance - principalPaid);
            totalInterest += interest;

            amortizationSchedule.push({
                paymentNumber: i,
                payment: payment,
                principalPaid: principalPaid,
                interestPaid: interest,
                remainingBalance: balance
            });
        }

        displayResults();
    }

    function displayResults() {
        // Show results section
        document.getElementById('results').classList.remove('hidden');

        // Update summary cards
        document.getElementById('monthlyPayment').textContent = formatCurrency(payment);
        document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);

        // Update amortization table
        const tableBody = document.getElementById('amortizationTable');
        tableBody.innerHTML = '';

        amortizationSchedule.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.paymentNumber}</td>
                <td>${formatCurrency(row.payment)}</td>
                <td>${formatCurrency(row.principalPaid)}</td>
                <td>${formatCurrency(row.interestPaid)}</td>
                <td>${formatCurrency(row.remainingBalance)}</td>
            `;
            tableBody.appendChild(tr);
        });

        // Scroll to results
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }

    function resetCalculator() {
        // Reset form and state
        document.getElementById('loanForm').reset();
        document.getElementById('startDate').valueAsDate = new Date();
        document.getElementById('results').classList.add('hidden');
        amortizationSchedule = [];
        payment = 0;
        totalInterest = 0;
    }

    function downloadSchedule() {
        // Create CSV content
        const headers = ['Payment #,Payment,Principal,Interest,Remaining Balance\n'];
        const csvContent = amortizationSchedule.map(row => 
            `${row.paymentNumber},${row.payment.toFixed(2)},${row.principalPaid.toFixed(2)},${row.interestPaid.toFixed(2)},${row.remainingBalance.toFixed(2)}`
        ).join('\n');

        // Create and download file
        const blob = new Blob([headers + csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'amortization-schedule.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    function formatCurrency(number) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    }
});
