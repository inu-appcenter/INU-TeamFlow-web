import { colleges } from '@/constants/departments';

export const getDepartmentName = (departmentEnum: string): string => {
  for (const college of colleges) {
    const dept = college.departments.find((d) => d.value === departmentEnum);
    if (dept) return dept.name;
  }
  return departmentEnum;
};
