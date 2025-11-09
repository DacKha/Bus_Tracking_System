export const validators = {
  required: (value: any, fieldName: string): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} không được để trống`;
    }
    return null;
  },

  email: (value: string): string | null => {
    if (!value) return 'Email không được để trống';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Email không hợp lệ';
    }
    return null;
  },

  phone: (value: string): string | null => {
    if (!value) return null;
    const phoneWithoutSpaces = value.replace(/\s/g, '');
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneWithoutSpaces)) {
      return 'Số điện thoại phải có 10-11 chữ số';
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName} phải có ít nhất ${min} ký tự`;
    }
    return null;
  },

  maxLength: (value: string, max: number, fieldName: string): string | null => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName} không được quá ${max} ký tự`;
    }
    return null;
  },

  number: (value: any, fieldName: string): string | null => {
    if (value === '' || value === null || value === undefined) return null;
    if (isNaN(Number(value))) {
      return `${fieldName} phải là số`;
    }
    return null;
  },

  min: (value: number, min: number, fieldName: string): string | null => {
    if (value === null || value === undefined) return null;
    if (value < min) {
      return `${fieldName} phải lớn hơn hoặc bằng ${min}`;
    }
    return null;
  },

  max: (value: number, max: number, fieldName: string): string | null => {
    if (value === null || value === undefined) return null;
    if (value > max) {
      return `${fieldName} phải nhỏ hơn hoặc bằng ${max}`;
    }
    return null;
  },

  url: (value: string): string | null => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'URL không hợp lệ';
    }
  },

  date: (value: string, fieldName: string): string | null => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return `${fieldName} không hợp lệ`;
    }
    return null;
  },

  time: (value: string): string | null => {
    if (!value) return null;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      return 'Giờ không hợp lệ (HH:MM)';
    }
    return null;
  },

  match: (value: string, matchValue: string, fieldName: string): string | null => {
    if (value !== matchValue) {
      return `${fieldName} không khớp`;
    }
    return null;
  },

  busNumber: (value: string): string | null => {
    if (!value) return 'Biển số xe không được để trống';
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    const busNumberRegex = /^[0-9]{2}[A-Z]{1,2}[0-9]{4,5}$/;
    if (!busNumberRegex.test(cleaned)) {
      return 'Biển số xe không hợp lệ (VD: 29A12345)';
    }
    return null;
  },

  studentCode: (value: string): string | null => {
    if (!value) return 'Mã học sinh không được để trống';
    const codeRegex = /^[A-Z0-9]{6,10}$/i;
    if (!codeRegex.test(value)) {
      return 'Mã học sinh phải từ 6-10 ký tự (chữ và số)';
    }
    return null;
  }
};

export const validateField = (
  fieldName: string,
  value: any,
  rules: Array<(value: any) => string | null>
): string | null => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};

export const validateForm = (
  data: Record<string, any>,
  validationRules: Record<string, Array<(value: any) => string | null>>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  Object.keys(validationRules).forEach((fieldName) => {
    const rules = validationRules[fieldName];
    const value = data[fieldName];
    const error = validateField(fieldName, value, rules);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
