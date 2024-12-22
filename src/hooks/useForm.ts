import { useState, useCallback, useEffect } from 'react';

type ValidationRule<T> = (value: T) => string | undefined;

interface FieldConfig<T> {
  initialValue: T;
  validate?: ValidationRule<T>;
}

type FormConfig<T> = {
  [K in keyof T]: FieldConfig<T[K]>;
};

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
}

export function useForm<T extends Record<string, any>>(config: FormConfig<T>) {
  const [formState, setFormState] = useState<FormState<T>>(() => {
    const initialValues = Object.keys(config).reduce((acc, key) => {
      acc[key as keyof T] = config[key as keyof T].initialValue;
      return acc;
    }, {} as T);

    return {
      values: initialValues,
      errors: {},
      touched: {},
      isValid: true,
      isDirty: false,
    };
  });

  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      const fieldConfig = config[name];
      if (fieldConfig.validate) {
        return fieldConfig.validate(value);
      }
      return undefined;
    },
    [config]
  );

  const validateForm = useCallback(() => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(config).forEach((key) => {
      const error = validateField(key as keyof T, formState.values[key as keyof T]);
      if (error) {
        errors[key as keyof T] = error;
        isValid = false;
      }
    });

    setFormState((prev) => ({
      ...prev,
      errors,
      isValid,
    }));

    return isValid;
  }, [config, formState.values, validateField]);

  useEffect(() => {
    validateForm();
  }, [formState.values, validateForm]);

  const handleChange = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      setFormState((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          [name]: value,
        },
        isDirty: true,
        touched: {
          ...prev.touched,
          [name]: true,
        },
      }));
    },
    []
  );

  const handleBlur = useCallback((name: keyof T) => {
    setFormState((prev) => ({
      ...prev,
      touched: {
        ...prev.touched,
        [name]: true,
      },
    }));
  }, []);

  const reset = useCallback(() => {
    const initialValues = Object.keys(config).reduce((acc, key) => {
      acc[key as keyof T] = config[key as keyof T].initialValue;
      return acc;
    }, {} as T);

    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: true,
      isDirty: false,
    });
  }, [config]);

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    handleChange,
    handleBlur,
    reset,
    validateForm,
  };
}

// Example usage:
/*
interface LoginForm {
  email: string;
  password: string;
}

const {
  values,
  errors,
  touched,
  isValid,
  handleChange,
  handleBlur,
  reset
} = useForm<LoginForm>({
  email: {
    initialValue: '',
    validate: (value) => {
      if (!value) return 'Email is required';
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        return 'Invalid email address';
      }
    }
  },
  password: {
    initialValue: '',
    validate: (value) => {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
    }
  }
});
*/ 