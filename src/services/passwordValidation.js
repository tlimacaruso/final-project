export const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("Password must have at least 8 characters.");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Password mjst have at least one capital letter.");
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least a number.");
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };
  
  export const getPasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { level: 'weak', text: 'Fraca', color: '#ff4444' };
    if (strength <= 3) return { level: 'medium', text: 'Média', color: '#ffaa00' };
    if (strength <= 4) return { level: 'strong', text: 'Forte', color: '#44ff44' };
    return { level: 'very-strong', text: 'Muito Forte', color: '#00aa00' };
  };