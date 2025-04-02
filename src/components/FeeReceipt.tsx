
import React, { useRef } from 'react';
import { format } from 'date-fns';
import { Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeeEntry, Student } from '@/utils/studentData';

interface FeeReceiptProps {
  student: Student;
  feeData: FeeEntry;
  selectedDeposit: {
    amount: number;
    date: string;
  };
  sessionPeriod: string;
  feePeriod: string;
  numberOfMonths: string;
}

// Function to convert numbers to words
const numberToWords = (num: number): string => {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  const convertLessThanOneThousand = (n: number): string => {
    if (n < 20) {
      return units[n];
    }
    
    const digit = n % 10;
    const ten = Math.floor(n / 10) % 10;
    const hundred = Math.floor(n / 100);
    
    let result = '';
    
    if (hundred > 0) {
      result += units[hundred] + ' Hundred';
      if (n % 100 !== 0) {
        result += ' ';
      }
    }
    
    if (ten > 1) {
      result += tens[ten];
      if (digit > 0) {
        result += ' ' + units[digit];
      }
    } else {
      result += units[10 * ten + digit];
    }
    
    return result;
  };
  
  let result = '';
  
  if (num < 0) {
    return 'Negative ' + numberToWords(Math.abs(num));
  }
  
  if (num < 1000) {
    return convertLessThanOneThousand(num);
  }
  
  const thousands = Math.floor(num / 1000);
  
  if (thousands > 0) {
    result += convertLessThanOneThousand(thousands) + ' Thousand';
    if (num % 1000 !== 0) {
      result += ' ';
    }
  }
  
  result += convertLessThanOneThousand(num % 1000);
  
  return result;
};

const FeeReceipt: React.FC<FeeReceiptProps> = ({ 
  student, 
  feeData, 
  selectedDeposit,
  sessionPeriod,
  feePeriod,
  numberOfMonths
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  
  // Calculate total fees
  const totalOneTimeFees = feeData 
    ? feeData.registrationFee + feeData.admissionFee + feeData.annualCharges 
    : 0;
  
  const totalMonthlyFees = feeData
    ? feeData.monthlyFees.reduce((sum, fee) => sum + fee.amount, 0)
    : 0;
  
  const grandTotal = totalOneTimeFees + totalMonthlyFees;
  
  const totalDeposits = feeData
    ? feeData.deposits.reduce((sum, deposit) => sum + deposit.amount, 0)
    : 0;
  
  const duesAmount = grandTotal - totalDeposits;
  
  // Convert amount to words
  const amountInWords = numberToWords(selectedDeposit.amount);
  
  const handlePrint = () => {
    const printContent = receiptRef.current;
    const originalContents = document.body.innerHTML;
    
    if (printContent) {
      const WinPrint = window.open('', '', 'width=1000,height=900');
      
      if (WinPrint) {
        WinPrint.document.write(`
          <html>
            <head>
              <title>Fee Receipt</title>
              <style>
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #000; padding: 8px; }
                th { text-align: left; }
                .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .logo { text-align: right; }
                .logo img { max-width: 150px; }
                .title { text-align: center; font-weight: bold; margin: 10px 0; }
                .school-info { margin-bottom: 10px; }
                .signature { text-align: right; margin-top: 30px; }
                .payment-method { margin-top: 20px; }
                @media print {
                  @page { size: auto; margin: 10mm; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        
        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
      }
    }
  };

  const handleDownload = () => {
    const receipt = receiptRef.current;
    if (!receipt) return;

    // Create a new window for printing
    const printWindow = window.open('', '', 'width=1000,height=900');
    if (!printWindow) {
      alert('Please allow popups to download the receipt');
      return;
    }

    // Write the receipt content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Receipt - ${student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 8px; }
            th { text-align: left; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .logo { text-align: right; }
            .logo img { max-width: 150px; }
            .title { text-align: center; font-weight: bold; margin: 10px 0; }
            .school-info { margin-bottom: 10px; }
            .signature { text-align: right; margin-top: 30px; }
            .payment-method { margin-top: 20px; }
            @media print {
              @page { size: auto; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          ${receipt.innerHTML}
          <script>
            // Automatically trigger the save dialog
            document.addEventListener('DOMContentLoaded', function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 100);
              }, 500);
            });
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
  };
  
  return (
    <div className="mt-4">
      <div className="flex gap-2 mb-4">
        <Button onClick={handlePrint} className="w-full">
          <Printer className="h-4 w-4 mr-2" /> Print Receipt
        </Button>
        <Button onClick={handleDownload} variant="outline" className="w-full">
          <Download className="h-4 w-4 mr-2" /> Download PDF
        </Button>
      </div>
      
      <div ref={receiptRef} className="border p-4 rounded-md bg-white text-black">
        <div className="header flex justify-between items-center mb-4">
          <div className="school-info">
            <div className="font-bold">Little Palms Kindergarten Dasaya</div>
            <div>Near Monte Cafe, DAV College, Dasaya</div>
            <div>Tel.: 01883-503529</div>
            <div>Email: <a href="mailto:little.palms.kindergarten@gmail.com">little.palms.kindergarten@gmail.com</a></div>
            <div>Website:</div>
          </div>
          <div className="logo">
            <img src="/lovable-uploads/33b39d2e-29d4-4460-acfb-0d6e948b4181.png" alt="Little Palms Logo" className="w-32" />
          </div>
        </div>
        
        <div className="title text-center font-bold my-2">FEE RECEIPT</div>
        
        <table className="w-full border-collapse mb-4">
          <tbody>
            <tr>
              <td className="border p-2">First Name</td>
              <td className="border p-2">{student.name.split(' ')[0]}</td>
              <td className="border p-2">Last Name</td>
              <td className="border p-2">{student.name.split(' ').slice(1).join(' ')}</td>
            </tr>
            <tr>
              <td className="border p-2">Father's Name</td>
              <td className="border p-2">{student.fatherName || '-'}</td>
              <td className="border p-2">Mother's Name</td>
              <td className="border p-2">{student.motherName || '-'}</td>
            </tr>
            <tr>
              <td className="border p-2">Grade</td>
              <td className="border p-2">{student.class || '-'}</td>
              <td className="border p-2">Date Of Birth</td>
              <td className="border p-2">{student.dateOfBirth ? format(new Date(student.dateOfBirth), 'do MMMM yyyy') : '-'}</td>
            </tr>
            <tr>
              <td className="border p-2">Session Period</td>
              <td className="border p-2">{sessionPeriod}</td>
              <td className="border p-2">Date Of Receipt</td>
              <td className="border p-2">{selectedDeposit.date ? format(new Date(selectedDeposit.date), 'do MMMM, yyyy') : format(new Date(), 'do MMMM, yyyy')}</td>
            </tr>
            <tr>
              <td className="border p-2">Fee Period</td>
              <td className="border p-2">{feePeriod}</td>
              <td className="border p-2">No. Of Months</td>
              <td className="border p-2">{numberOfMonths}</td>
            </tr>
          </tbody>
        </table>
        
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr>
              <th className="border p-2">Particulars</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Deposited</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Tuition Fee</td>
              <td className="border p-2">{totalMonthlyFees}</td>
              <td className="border p-2">{selectedDeposit.date ? format(new Date(selectedDeposit.date), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')}</td>
              <td className="border p-2">{selectedDeposit.amount}</td>
            </tr>
            <tr>
              <td className="border p-2">Any Due</td>
              <td className="border p-2">{duesAmount > 0 ? duesAmount : '-'}</td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
            </tr>
            <tr>
              <td className="border p-2">Total</td>
              <td className="border p-2">{grandTotal}</td>
              <td className="border p-2"></td>
              <td className="border p-2">{selectedDeposit.amount}</td>
            </tr>
            <tr>
              <td colSpan={4} className="border p-2">Total Amount Paid: {selectedDeposit.amount}</td>
            </tr>
            <tr>
              <td colSpan={4} className="border p-2">Amount Due: {duesAmount > 0 ? duesAmount : 'Nil'}</td>
            </tr>
            <tr>
              <td colSpan={4} className="border p-2">Received with thanks Rs. {amountInWords} Only</td>
            </tr>
          </tbody>
        </table>
        
        <div className="payment-method">
          <div className="flex items-center space-x-4">
            <span>Cheque □</span>
            <span>UPI □</span>
            <span>Cash □</span>
          </div>
        </div>
        
        <div className="signature mt-6 text-right">
          <div>Signature/Stamp</div>
        </div>
      </div>
    </div>
  );
};

export default FeeReceipt;
