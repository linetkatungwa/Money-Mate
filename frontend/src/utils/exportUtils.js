/**
 * Export utilities for PDF and Excel generation
 */

/**
 * Export analytics data to PDF
 * @param {Object} reportData - The analytics report data
 * @param {Object} chartData - Chart data objects
 * @param {string} startDate - Start date filter
 * @param {string} endDate - End date filter
 */
export const exportToPDF = async (reportData, chartData, startDate, endDate) => {
  try {
    // Dynamically import jsPDF to avoid errors if not installed
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default || jsPDFModule;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.text('Money Mate - Financial Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Date range
    doc.setFontSize(10);
    const dateRange = startDate && endDate
      ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      : 'All Time';
    doc.text(`Period: ${dateRange}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Summary Section
    if (reportData && reportData.summary) {
      doc.setFontSize(16);
      doc.text('Financial Summary', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      const summaryY = yPosition;
      
      doc.text(`Total Income: ${formatCurrency(reportData.summary.totalIncome)}`, 20, summaryY);
      doc.text(`Total Expenses: ${formatCurrency(reportData.summary.totalExpense)}`, 20, summaryY + 8);
      doc.text(`Net Amount: ${formatCurrency(reportData.summary.netAmount)}`, 20, summaryY + 16);
      doc.text(`Total Transactions: ${reportData.summary.transactionCounts.total}`, 20, summaryY + 24);
      
      yPosition = summaryY + 35;
    }

    // Check if new page needed
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    // Expense Breakdown Section
    if (reportData && reportData.expenseBreakdown && reportData.expenseBreakdown.length > 0) {
      doc.setFontSize(16);
      doc.text('Expense Breakdown by Category', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      let tableY = yPosition;
      
      reportData.expenseBreakdown.slice(0, 10).forEach((item, index) => {
        if (tableY > pageHeight - 30) {
          doc.addPage();
          tableY = 20;
        }

        const percentage = reportData.summary.totalExpense > 0
          ? Math.round((item.amount / reportData.summary.totalExpense) * 100 * 10) / 10
          : 0;

        doc.text(`${index + 1}. ${item.category}`, 25, tableY);
        doc.text(formatCurrency(item.amount), 120, tableY);
        doc.text(`${item.count} transactions`, 160, tableY);
        doc.text(`${percentage}%`, 220, tableY);
        
        tableY += 8;
      });

      yPosition = tableY + 10;
    }

    // Check if new page needed
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    // Top Expenses Section
    if (reportData && reportData.topExpenses && reportData.topExpenses.length > 0) {
      doc.setFontSize(16);
      doc.text('Top Expenses', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      let expensesY = yPosition;
      
      reportData.topExpenses.slice(0, 10).forEach((expense, index) => {
        if (expensesY > pageHeight - 30) {
          doc.addPage();
          expensesY = 20;
        }

        doc.text(`${index + 1}. ${expense.description}`, 25, expensesY);
        doc.text(expense.category, 120, expensesY);
        doc.text(formatCurrency(expense.amount), 160, expensesY);
        doc.text(new Date(expense.date).toLocaleDateString(), 200, expensesY);
        
        expensesY += 8;
      });

      yPosition = expensesY + 10;
    }

    // Footer
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY, { align: 'center' });

    // Save the PDF
    const fileName = `Money_Mate_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('PDF export failed. Please ensure jspdf is installed: npm install jspdf');
  }
};

/**
 * Export analytics data to Excel
 * @param {Object} reportData - The analytics report data
 * @param {Object} chartData - Chart data objects
 * @param {string} startDate - Start date filter
 * @param {string} endDate - End date filter
 */
export const exportToExcel = async (reportData, chartData, startDate, endDate) => {
  try {
    // Dynamically import xlsx to avoid errors if not installed
    const XLSXModule = await import('xlsx');
    const XLSX = XLSXModule.default || XLSXModule;
    
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    if (reportData && reportData.summary) {
      const summaryData = [
        ['Financial Summary'],
        [''],
        ['Total Income', formatCurrency(reportData.summary.totalIncome)],
        ['Total Expenses', formatCurrency(reportData.summary.totalExpense)],
        ['Net Amount', formatCurrency(reportData.summary.netAmount)],
        [''],
        ['Transaction Counts'],
        ['Income Transactions', reportData.summary.transactionCounts.income],
        ['Expense Transactions', reportData.summary.transactionCounts.expense],
        ['Total Transactions', reportData.summary.transactionCounts.total],
        [''],
        ['Averages'],
        ['Average Income', formatCurrency(reportData.summary.avgIncome)],
        ['Average Expense', formatCurrency(reportData.summary.avgExpense)],
        [''],
        ['Date Range'],
        ['Start Date', startDate ? new Date(startDate).toLocaleDateString() : 'All Time'],
        ['End Date', endDate ? new Date(endDate).toLocaleDateString() : 'All Time'],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }

    // Expense Breakdown Sheet
    if (reportData && reportData.expenseBreakdown && reportData.expenseBreakdown.length > 0) {
      const expenseData = [
        ['Category', 'Amount', 'Count', 'Percentage']
      ];

      reportData.expenseBreakdown.forEach(item => {
        const percentage = reportData.summary.totalExpense > 0
          ? Math.round((item.amount / reportData.summary.totalExpense) * 100 * 10) / 10
          : 0;
        
        expenseData.push([
          item.category,
          item.amount,
          item.count,
          `${percentage}%`
        ]);
      });

      const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
      
      // Set column widths
      expenseSheet['!cols'] = [
        { wch: 25 }, // Category
        { wch: 15 }, // Amount
        { wch: 10 }, // Count
        { wch: 12 }  // Percentage
      ];

      XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expense Breakdown');
    }

    // Income Breakdown Sheet
    if (reportData && reportData.incomeBreakdown && reportData.incomeBreakdown.length > 0) {
      const incomeData = [
        ['Category', 'Amount', 'Count']
      ];

      reportData.incomeBreakdown.forEach(item => {
        incomeData.push([
          item.category,
          item.amount,
          item.count
        ]);
      });

      const incomeSheet = XLSX.utils.aoa_to_sheet(incomeData);
      
      // Set column widths
      incomeSheet['!cols'] = [
        { wch: 25 }, // Category
        { wch: 15 }, // Amount
        { wch: 10 }  // Count
      ];

      XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Income Breakdown');
    }

    // Top Expenses Sheet
    if (reportData && reportData.topExpenses && reportData.topExpenses.length > 0) {
      const topExpensesData = [
        ['Description', 'Category', 'Amount', 'Date']
      ];

      reportData.topExpenses.forEach(expense => {
        topExpensesData.push([
          expense.description,
          expense.category,
          expense.amount,
          new Date(expense.date).toLocaleDateString()
        ]);
      });

      const topExpensesSheet = XLSX.utils.aoa_to_sheet(topExpensesData);
      
      // Set column widths
      topExpensesSheet['!cols'] = [
        { wch: 30 }, // Description
        { wch: 20 }, // Category
        { wch: 15 }, // Amount
        { wch: 15 }  // Date
      ];

      XLSX.utils.book_append_sheet(workbook, topExpensesSheet, 'Top Expenses');
    }

    // Income vs Expense Sheet
    if (chartData && chartData.incomeVsExpense) {
      const incomeVsExpenseData = [
        ['Month', 'Income', 'Expenses', 'Net']
      ];

      chartData.incomeVsExpense.forEach(item => {
        incomeVsExpenseData.push([
          item.monthLabel,
          item.income,
          item.expense,
          item.net
        ]);
      });

      const incomeVsExpenseSheet = XLSX.utils.aoa_to_sheet(incomeVsExpenseData);
      
      // Set column widths
      incomeVsExpenseSheet['!cols'] = [
        { wch: 20 }, // Month
        { wch: 15 }, // Income
        { wch: 15 }, // Expenses
        { wch: 15 }  // Net
      ];

      XLSX.utils.book_append_sheet(workbook, incomeVsExpenseSheet, 'Income vs Expense');
    }

    // Spending Trends Sheet
    if (chartData && chartData.spendingTrends) {
      const trendsData = [
        ['Period', 'Amount', 'Count']
      ];

      chartData.spendingTrends.forEach(item => {
        trendsData.push([
          item.periodLabel,
          item.amount,
          item.count
        ]);
      });

      const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
      
      // Set column widths
      trendsSheet['!cols'] = [
        { wch: 20 }, // Period
        { wch: 15 }, // Amount
        { wch: 10 }  // Count
      ];

      XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Spending Trends');
    }

    // Save the Excel file
    const fileName = `Money_Mate_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Excel export failed. Please ensure xlsx is installed: npm install xlsx');
  }
};

/**
 * Helper function to format currency
 * @param {number} amount 
 * @returns {string}
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(amount);
};

