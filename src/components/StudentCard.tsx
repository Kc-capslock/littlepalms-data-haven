
import { useState } from 'react';
import { MoreHorizontal, User, Phone, Calendar, Edit, Trash2, UserCheck, DollarSign } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Student } from '@/utils/studentData';
import { format } from 'date-fns';

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

const StudentCard = ({ student, onEdit, onDelete }: StudentCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this student record?")) {
      onDelete(student.id);
      toast.success("Student record deleted successfully");
    }
  };

  // Format date of birth for display
  const formattedDob = (() => {
    try {
      return format(new Date(student.dateOfBirth), 'MMMM d, yyyy');
    } catch (e) {
      return student.dateOfBirth;
    }
  })();

  // Calculate balance
  const calculateBalance = (): number => {
    const paidAmount = student.feesPaid || 0;
    const totalAmount = student.totalFees || 0;
    return totalAmount - paidAmount;
  };

  return (
    <Card className="overflow-hidden hover-scale glass-card animate-fadeIn">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{student.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(student)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-1 pb-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="mr-2 h-4 w-4" />
            <span className="font-medium">ID:</span> <span className="ml-1">{student.id}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="mr-2 h-4 w-4" />
            <span className="font-medium">Contact:</span> <span className="ml-1">{student.contactNumber}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="font-medium">DOB:</span> <span className="ml-1">{formattedDob}</span>
          </div>
          {student.class && (
            <div className="flex items-center text-sm text-muted-foreground">
              <UserCheck className="mr-2 h-4 w-4" />
              <span className="font-medium">Class:</span> <span className="ml-1">{student.class}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="mr-2 h-4 w-4" />
            <span className="font-medium">Balance:</span> 
            <span className={`ml-1 ${calculateBalance() > 0 ? 'text-red-500' : ''}`}>
              ${calculateBalance().toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{student.name}</DialogTitle>
              <DialogDescription>Student ID: {student.id}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">DOB:</span>
                <span className="col-span-3">{formattedDob}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">Contact:</span>
                <span className="col-span-3">{student.contactNumber}</span>
              </div>
              {student.fatherName && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Father's Name:</span>
                  <span className="col-span-3">{student.fatherName}</span>
                </div>
              )}
              {student.motherName && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Mother's Name:</span>
                  <span className="col-span-3">{student.motherName}</span>
                </div>
              )}
              {student.address && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Address:</span>
                  <span className="col-span-3">{student.address}</span>
                </div>
              )}
              {student.emergencyContact && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Emergency:</span>
                  <span className="col-span-3">{student.emergencyContact}</span>
                </div>
              )}
              {student.enrollmentDate && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Enrolled:</span>
                  <span className="col-span-3">{student.enrollmentDate}</span>
                </div>
              )}
              {student.class && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Class:</span>
                  <span className="col-span-3">{student.class}</span>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">Fees Paid:</span>
                <span className="col-span-3">${(student.feesPaid || 0).toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">Total Fees:</span>
                <span className="col-span-3">${(student.totalFees || 0).toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">Balance:</span>
                <span className={`col-span-3 ${calculateBalance() > 0 ? 'text-red-500' : ''}`}>
                  ${calculateBalance().toFixed(2)}
                </span>
              </div>
              {student.notes && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Notes:</span>
                  <span className="col-span-3">{student.notes}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => onEdit(student)}>Edit Student</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default StudentCard;
