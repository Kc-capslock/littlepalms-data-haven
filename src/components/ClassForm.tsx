
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Class, generateId } from '@/utils/studentData';
import { toast } from 'sonner';

interface ClassFormProps {
  classInfo?: Class;
  onSubmit: (classInfo: Class) => void;
  onCancel: () => void;
}

const ClassForm = ({ classInfo, onSubmit, onCancel }: ClassFormProps) => {
  const [formData, setFormData] = useState<Class>({
    id: '',
    name: '',
    capacity: 20,
    teacher: '',
    description: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Class, string>>>({});

  useEffect(() => {
    if (classInfo) {
      // Edit mode - populate form with class data
      setFormData(classInfo);
    } else {
      // Create mode - set a new ID
      setFormData(prev => ({ ...prev, id: generateId() }));
    }
  }, [classInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'capacity') {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        setFormData(prev => ({ ...prev, [name]: numValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is modified
    if (errors[name as keyof Class]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Class, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Class name is required";
    }
    
    if (formData.capacity <= 0) {
      newErrors.capacity = "Capacity must be greater than 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
      toast.success(classInfo ? "Class updated successfully" : "Class added successfully");
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-slideUp">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="id">Class ID</Label>
          <Input
            id="id"
            name="id"
            value={formData.id}
            readOnly
            className="bg-muted"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">Class Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter class name"
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Enter maximum students"
            min="1"
            className={errors.capacity ? "border-destructive" : ""}
          />
          {errors.capacity && <p className="text-destructive text-xs">{errors.capacity}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="teacher">Teacher</Label>
          <Input
            id="teacher"
            name="teacher"
            value={formData.teacher || ""}
            onChange={handleChange}
            placeholder="Enter teacher name"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Enter class description"
          className="min-h-[80px]"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{classInfo ? "Update Class" : "Add Class"}</Button>
      </div>
    </form>
  );
};

export default ClassForm;
