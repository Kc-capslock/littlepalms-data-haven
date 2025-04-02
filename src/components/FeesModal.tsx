
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format, parse } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  FeeEntry, 
  MonthlyFee, 
  Deposit, 
  getFeeEntryByStudentId, 
  updateFeeEntry, 
  addMonthlyFee, 
  addDeposit, 
  calculateTotalFees, 
  calculateTotalDeposits, 
  calculateDues,
  initializeFeeEntry,
  generateId,
  getStudentById
} from '@/utils/studentData';
import { CalendarIcon, CheckCircle, XCircle, PlusCircle, Receipt, Save, Trash2 } from 'lucide-react';
import FeeReceipt from './FeeReceipt';

interface FeesModalProps {
  studentId: string;
  studentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FeesModal = ({ studentId, studentName, open, onOpenChange }: FeesModalProps) => {
  const [feeData, setFeeData] = useState<FeeEntry | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [newMonthlyFee, setNewMonthlyFee] = useState({
    month: format(new Date(), 'yyyy-MM'),
    amount: 0
  });
  const [newDeposit, setNewDeposit] = useState({
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    remarks: ''
  });
  const [activeTab, setActiveTab] = useState('fees');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState<string | null>(null);
  const [monthlyFeeToDelete, setMonthlyFeeToDelete] = useState<string | null>(null);
  const [deleteMonthlyFeeConfirmOpen, setDeleteMonthlyFeeConfirmOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [sessionPeriod, setSessionPeriod] = useState('01-04-2024 - 31-03-2025');
  const [feePeriod, setFeePeriod] = useState('01-04-2024 - 30-04-2024');
  const [numberOfMonths, setNumberOfMonths] = useState('One (1)');

  const refreshFeeData = () => {
    const data = getFeeEntryByStudentId(studentId);
    if (data) {
      setFeeData(data);
    } else {
      const newData = initializeFeeEntry(studentId);
      setFeeData(newData);
    }
    
    const studentData = getStudentById(studentId);
    setStudent(studentData);
  };

  useEffect(() => {
    if (open && studentId) {
      refreshFeeData();
    }
  }, [studentId, open]);

  const handleSaveOneTimeFees = () => {
    if (!feeData) return;
    
    updateFeeEntry(studentId, {
      registrationFee: feeData.registrationFee,
      admissionFee: feeData.admissionFee,
      annualCharges: feeData.annualCharges
    });
    
    toast.success('Fees updated successfully');
    refreshFeeData();
  };

  const handleAddMonthlyFee = () => {
    if (!newMonthlyFee.month || newMonthlyFee.amount <= 0) {
      toast.error('Please provide valid month and amount');
      return;
    }
    
    const result = addMonthlyFee(studentId, newMonthlyFee.month, newMonthlyFee.amount);
    
    if (result) {
      toast.success('Monthly fee added successfully');
      setNewMonthlyFee({
        month: format(new Date(), 'yyyy-MM'),
        amount: 0
      });
      refreshFeeData();
    } else {
      toast.error('Failed to add monthly fee');
    }
  };

  const handleAddDeposit = () => {
    if (newDeposit.amount <= 0 || !newDeposit.date) {
      toast.error('Please provide valid amount and date');
      return;
    }
    
    const result = addDeposit(
      studentId, 
      newDeposit.amount, 
      newDeposit.date, 
      newDeposit.remarks
    );
    
    if (result) {
      toast.success('Deposit added successfully');
      setNewDeposit({
        amount: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
        remarks: ''
      });
      refreshFeeData();
    } else {
      toast.error('Failed to add deposit');
    }
  };

  const handleRemoveDeposit = (depositId: string) => {
    setDepositToDelete(depositId);
    setDeleteConfirmOpen(true);
  };

  const handleRemoveMonthlyFee = (feeId: string) => {
    setMonthlyFeeToDelete(feeId);
    setDeleteMonthlyFeeConfirmOpen(true);
  };

  const confirmDeleteDeposit = () => {
    if (!feeData || !depositToDelete) return;

    const updatedDeposits = feeData.deposits.filter(deposit => deposit.id !== depositToDelete);
    
    updateFeeEntry(studentId, { deposits: updatedDeposits });
    toast.success('Deposit removed successfully');
    refreshFeeData();
    
    setDeleteConfirmOpen(false);
    setDepositToDelete(null);
  };

  const confirmDeleteMonthlyFee = () => {
    if (!feeData || !monthlyFeeToDelete) return;

    const updatedMonthlyFees = feeData.monthlyFees.filter(fee => fee.id !== monthlyFeeToDelete);
    
    updateFeeEntry(studentId, { monthlyFees: updatedMonthlyFees });
    toast.success('Monthly fee removed successfully');
    refreshFeeData();
    
    setDeleteMonthlyFeeConfirmOpen(false);
    setMonthlyFeeToDelete(null);
  };

  const handleFeeInputChange = (field: keyof FeeEntry, value: number) => {
    if (!feeData) return;
    
    setFeeData(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const formatMonthName = (monthStr: string) => {
    try {
      return format(parse(monthStr, 'yyyy-MM', new Date()), 'MMMM yyyy');
    } catch (e) {
      return monthStr;
    }
  };

  // Calculate totals
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

  const toggleMonthlyFeePaid = (monthlyFeeId: string) => {
    if (!feeData) return;
    
    const updatedMonthlyFees = feeData.monthlyFees.map(fee => {
      if (fee.id === monthlyFeeId) {
        return { ...fee, paid: !fee.paid };
      }
      return fee;
    });
    
    updateFeeEntry(studentId, { monthlyFees: updatedMonthlyFees });
    refreshFeeData();
  };

  const handleSelectDeposit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setActiveTab('receipt');
  };

  if (!feeData) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full md:max-w-[800px] sm:max-w-full overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Fees Statement</SheetTitle>
            <SheetDescription>
              Student: {studentName} (ID: {studentId})
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="fees" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="fees">Fee Details</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              {selectedDeposit && <TabsTrigger value="receipt">Receipt</TabsTrigger>}
            </TabsList>

            <TabsContent value="fees" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">One-Time Fees</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationFee">Registration Fee</Label>
                    <Input
                      id="registrationFee"
                      type="number"
                      min="0"
                      value={feeData.registrationFee}
                      onChange={(e) => handleFeeInputChange('registrationFee', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admissionFee">Admission Fee</Label>
                    <Input
                      id="admissionFee"
                      type="number"
                      min="0"
                      value={feeData.admissionFee}
                      onChange={(e) => handleFeeInputChange('admissionFee', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualCharges">Annual Charges</Label>
                    <Input
                      id="annualCharges"
                      type="number"
                      min="0"
                      value={feeData.annualCharges}
                      onChange={(e) => handleFeeInputChange('annualCharges', Number(e.target.value))}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveOneTimeFees}>
                  <Save className="h-4 w-4 mr-2" />
                  Save One-Time Fees
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Monthly Fees</h3>
                  <div className="flex items-center gap-2">
                    <Input
                      type="month"
                      className="w-40"
                      value={newMonthlyFee.month}
                      onChange={(e) => setNewMonthlyFee({...newMonthlyFee, month: e.target.value})}
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="Amount"
                      className="w-32"
                      value={newMonthlyFee.amount || ''}
                      onChange={(e) => setNewMonthlyFee({...newMonthlyFee, amount: Number(e.target.value)})}
                    />
                    <Button size="sm" onClick={handleAddMonthlyFee}>
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feeData.monthlyFees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                            No monthly fees added yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        feeData.monthlyFees
                          .sort((a, b) => a.month.localeCompare(b.month))
                          .map((fee) => (
                            <TableRow key={fee.id}>
                              <TableCell>{formatMonthName(fee.month)}</TableCell>
                              <TableCell className="text-right">${fee.amount.toFixed(2)}</TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleMonthlyFeePaid(fee.id)}
                                  className={fee.paid ? "text-green-500" : "text-red-500"}
                                >
                                  {fee.paid ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-destructive hover:text-destructive-foreground"
                                  onClick={() => handleRemoveMonthlyFee(fee.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-medium">Total Monthly Fees</TableCell>
                        <TableCell className="text-right font-medium">${totalMonthlyFees.toFixed(2)}</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deposits" className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Deposits</h3>
                  <div className="flex flex-col md:flex-row gap-2">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Amount"
                      className="w-full md:w-32"
                      value={newDeposit.amount || ''}
                      onChange={(e) => setNewDeposit({...newDeposit, amount: Number(e.target.value)})}
                    />
                    <Input
                      type="date"
                      className="w-full md:w-40"
                      value={newDeposit.date}
                      onChange={(e) => setNewDeposit({...newDeposit, date: e.target.value})}
                    />
                    <Input
                      placeholder="Remarks"
                      className="w-full md:w-40"
                      value={newDeposit.remarks}
                      onChange={(e) => setNewDeposit({...newDeposit, remarks: e.target.value})}
                    />
                    <Button size="sm" onClick={handleAddDeposit}>
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead className="w-36">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feeData.deposits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                            No deposits recorded yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        feeData.deposits
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((deposit) => (
                            <TableRow key={deposit.id}>
                              <TableCell>
                                {format(new Date(deposit.date), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell className="text-right">${deposit.amount.toFixed(2)}</TableCell>
                              <TableCell>{deposit.remarks || '-'}</TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSelectDeposit(deposit)}
                                  >
                                    <Receipt className="h-4 w-4 mr-1" />
                                    Receipt
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:text-destructive-foreground"
                                    onClick={() => handleRemoveDeposit(deposit.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-medium">Total Deposits</TableCell>
                        <TableCell className="text-right font-medium">${totalDeposits.toFixed(2)}</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Fee Summary</h3>
                <div className="border rounded-md p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Registration Fee:</div>
                    <div className="text-right">${feeData.registrationFee.toFixed(2)}</div>
                    
                    <div className="font-medium">Admission Fee:</div>
                    <div className="text-right">${feeData.admissionFee.toFixed(2)}</div>
                    
                    <div className="font-medium">Annual Charges:</div>
                    <div className="text-right">${feeData.annualCharges.toFixed(2)}</div>
                    
                    <div className="font-medium">Total One-Time Fees:</div>
                    <div className="text-right">${totalOneTimeFees.toFixed(2)}</div>
                    
                    <div className="font-medium pt-2 border-t">Total Monthly Fees:</div>
                    <div className="text-right pt-2 border-t">${totalMonthlyFees.toFixed(2)}</div>
                    
                    <div className="font-medium text-lg pt-2 border-t">Grand Total:</div>
                    <div className="text-right text-lg font-bold pt-2 border-t">${grandTotal.toFixed(2)}</div>
                    
                    <div className="font-medium pt-2 border-t">Total Deposits:</div>
                    <div className="text-right pt-2 border-t">${totalDeposits.toFixed(2)}</div>
                    
                    <div className="font-medium text-lg pt-2 border-t">Dues:</div>
                    <div className={`text-right text-lg font-bold pt-2 border-t ${duesAmount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      ${duesAmount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Receipt Configuration Fields */}
                <div className="border rounded-md p-4 space-y-4 mt-6">
                  <h4 className="font-medium text-base">Receipt Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionPeriod">Session Period</Label>
                      <Input
                        id="sessionPeriod"
                        value={sessionPeriod}
                        onChange={(e) => setSessionPeriod(e.target.value)}
                        placeholder="e.g., 01-04-2024 - 31-03-2025"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feePeriod">Fee Period</Label>
                      <Input
                        id="feePeriod"
                        value={feePeriod}
                        onChange={(e) => setFeePeriod(e.target.value)}
                        placeholder="e.g., 01-04-2024 - 30-04-2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numberOfMonths">Number of Months</Label>
                      <Input
                        id="numberOfMonths"
                        value={numberOfMonths}
                        onChange={(e) => setNumberOfMonths(e.target.value)}
                        placeholder="e.g., One (1)"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      To print a receipt, go to the Deposits tab and click the Receipt button next to a deposit.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="receipt" className="space-y-6">
              {selectedDeposit && student ? (
                <FeeReceipt 
                  student={student}
                  feeData={feeData}
                  selectedDeposit={{
                    amount: selectedDeposit.amount,
                    date: selectedDeposit.date
                  }}
                  sessionPeriod={sessionPeriod}
                  feePeriod={feePeriod}
                  numberOfMonths={numberOfMonths}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Please select a deposit to generate a receipt.
                </div>
              )}
            </TabsContent>
          </Tabs>

          <SheetFooter className="mt-6">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Deposit Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deposit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this deposit? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDepositToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDeposit} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Monthly Fee Confirmation Dialog */}
      <AlertDialog open={deleteMonthlyFeeConfirmOpen} onOpenChange={setDeleteMonthlyFeeConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Monthly Fee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this monthly fee? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMonthlyFeeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMonthlyFee} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FeesModal;
