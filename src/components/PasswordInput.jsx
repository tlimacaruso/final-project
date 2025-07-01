import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { validatePassword, getPasswordStrength } from  '../services/passwordValidation';
import './Register.css';

const PasswordInput = ({
    value,
    onChange,
    onValidationChange,
    placeholder = "Palavra-passe",
    showStrength = true,
    showRequirements = true
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const validation = validatePassword(value);
    const strength = getPasswordStrength(value);

    React.useEffect(() => {
        if(onValidationChange) {
            onValidationChange(validation)
        }
    }, [validation.isValid, onValidationChange]);

    const requirements = [
        { text: "Min. 8 characters", met: value.length >= 8 },
        { text: "At least 1 capital letter", met: /[A-Z]/.test(value) },
        { text: "At least 1 number", met: /[0-9]/.test(value) }
      ];

      return (
        <div className="password-input-container">
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className={`password-input ${!validation.isValid && value.length > 0 ? 'invalid' : ''}`}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {showStrength && value.length > 0 && (
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className="strength-fill"
                  style={{ 
                    width: `${(requirements.filter(r => r.met).length / requirements.length) * 100}%`,
                    backgroundColor: strength.color 
                  }}
                />
              </div>
              <span className="strength-text" style={{ color: strength.color }}>
                {strength.text}
              </span>
            </div>
          )}
          
          {showRequirements && (isFocused || (!validation.isValid && value.length > 0)) && (
            <div className="password-requirements">
              <p>A palavra-passe deve conter:</p>
              <ul>
                {requirements.map((req, index) => (
                  <li 
                    key={index} 
                    className={req.met ? 'requirement-met' : 'requirement-unmet'}
                  >
                    {req.met ? '✓' : '○'} {req.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {validation.errors.length > 0 && value.length > 0 && !isFocused && (
            <div className="password-errors">
              {validation.errors.map((error, index) => (
                <p key={index} className="error-message">{error}</p>
              ))}
            </div>
          )}
        </div>
      );
    };
    
    export default PasswordInput;