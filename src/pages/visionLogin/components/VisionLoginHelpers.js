export const parseJwtSafely = (token) => {
  try {
    let base64Url = token.split(".")[1];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) { 
        base64 += "="; 
    }
    return JSON.parse(atob(base64));
  } catch (e) {
    console.error("Error reading token safely", e);
    return null;
  }
};

export const validateLoginFormFields = (email, password) => {
  let errors = {};
  let isValid = true;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim() || !emailRegex.test(email)) {
    errors.email = "يرجى إدخال بريد إلكتروني صحيح للمركز";
    isValid = false;
  }
  
  if (!password.trim()) {
    errors.password = "يرجى إدخال كلمة المرور";
    isValid = false;
  }

  return { isValid, errors };
};

export const validatePasswordChangeFields = (password, newPassword, confirmPassword) => {
  let errors = {};
  let isValid = true;
  
  if (!password.trim()) {
    errors.currentPassword = "يرجى إدخال كلمة المرور الحالية";
    isValid = false;
  }
  
  if (!newPassword.trim() || newPassword.length < 6) {
    errors.newPassword = "يجب أن تتكون كلمة المرور من 6 خانات على الأقل";
    isValid = false;
  }
  
  if (!confirmPassword.trim() || newPassword !== confirmPassword) {
    errors.confirmPassword = "كلمتا المرور غير متطابقتين";
    isValid = false;
  }

  return { isValid, errors };
};