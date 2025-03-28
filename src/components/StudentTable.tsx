
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Student } from '@/utils/studentData';
import { format } from 'date-fns';
import FeesModal from './FeesModal';

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

const StudentTable = ({ students, onEdit, onDelete }: StudentTableProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFeesModal, setShowFeesModal] = useState(false);
  const [feesStudentId, setFeesStudentId] = useState<string | null>(null);
  const [feesStudentName, setFeesStudentName] = useState<string>('');

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this student record?")) {
      onDelete(id);
      toast.success("Student record deleted successfully");
    }
  };

  const handleOpenFeesModal = (student: Student) => {
    setFeesStudentId(student.id);
    setFeesStudentName(student.name);
    setShowFeesModal(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <div className="rounded-md border shadow-sm overflow-hidden animate-fadeIn">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead className="w-[80px]">Class</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center p-8 text-muted-foreground">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow 
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student);
                    setShowDetails(true);
                  }}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.contactNumber}</TableCell>
                  <TableCell>{formatDate(student.dateOfBirth)}</TableCell>
                  <TableCell>{student.class || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenFeesModal(student);
                        }}
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(student);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(student.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedStudent && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedStudent.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">ID:</span>
                <span className="col-span-3">{selectedStudent.id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">DOB:</span>
                <span className="col-span-3">{formatDate(selectedStudent.dateOfBirth)}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">Contact:</span>
                <span className="col-span-3">{selectedStudent.contactNumber}</span>
              </div>
              {selectedStudent.fatherName && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Father's Name:</span>
                  <span className="col-span-3">{selectedStudent.fatherName}</span>
                </div>
              )}
              {selectedStudent.motherName && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Mother's Name:</span>
                  <span className="col-span-3">{selectedStudent.motherName}</span>
                </div>
              )}
              {selectedStudent.address && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Address:</span>
                  <span className="col-span-3">{selectedStudent.address}</span>
                </div>
              )}
              {selectedStudent.emergencyContact && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Emergency:</span>
                  <span className="col-span-3">{selectedStudent.emergencyContact}</span>
                </div>
              )}
              {selectedStudent.enrollmentDate && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Enrolled:</span>
                  <span className="col-span-3">{formatDate(selectedStudent.enrollmentDate)}</span>
                </div>
              )}
              {selectedStudent.class && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Class:</span>
                  <span className="col-span-3">{selectedStudent.class}</span>
                </div>
              )}
              {selectedStudent.notes && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium">Notes:</span>
                  <span className="col-span-3">{selectedStudent.notes}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDetails(false)}
              >
                Close
              </Button>
              <Button onClick={() => {
                setShowDetails(false);
                onEdit(selectedStudent);
              }}>
                Edit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {feesStudentId && (
        <FeesModal
          studentId={feesStudentId}
          studentName={feesStudentName}
          open={showFeesModal}
          onOpenChange={setShowFeesModal}
        />
      )}
    </>
  );
};

export default StudentTable;
