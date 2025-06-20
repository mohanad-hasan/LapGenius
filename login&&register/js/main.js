// Start switch between login and register
const loginSection = document.querySelector('.login');
const registerSection = document.querySelector('.register');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
function showSection(sectionToShow, sectionToHide) {
    sectionToHide.classList.remove('visible-section');
    sectionToHide.classList.add('hidden-section');
    sectionToShow.classList.remove('hidden-section');
    sectionToShow.classList.add('visible-section');
}
showRegisterBtn.addEventListener('click', () => {
    showSection(registerSection, loginSection);
});
showLoginBtn.addEventListener('click', () => {
    showSection(loginSection, registerSection);
});
// تأكيد الوضع الابتدائي عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    loginSection.classList.add('visible-section');
    registerSection.classList.add('hidden-section');
});
// End switch between login and register

// Start error and success message in login and register
function clearMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    const successMessages = document.querySelectorAll('.success-message');
    errorMessages.forEach(msg => {
        msg.style.display = 'none';
        msg.textContent = '';
    });
    successMessages.forEach(msg => {
        msg.style.display = 'none';
        msg.textContent = '';
    });
    // إزالة أي حدود حمراء
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('input-error');
    });
}
// التحقق من صحة البريد الإلكتروني
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}
// معالجة تسجيل الدخول
const loginForm = document.querySelector('.login-form');
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessages();
    
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;
    let isValid = true;   
    // التحقق من البريد الإلكتروني
    if (!email) {
        document.getElementById('email-login-error').textContent = 'يرجى إدخال البريد الإلكتروني';
        document.getElementById('email-login-error').style.display = 'block';
        document.getElementById('email-login').classList.add('input-error');
        isValid = false;
    } else if (!validateEmail(email)) {
        document.getElementById('email-login-error').textContent = 'البريد الإلكتروني غير صحيح';
        document.getElementById('email-login-error').style.display = 'block';
        document.getElementById('email-login').classList.add('input-error');
        isValid = false;
    }
    // التحقق من كلمة المرور
    if (!password) {
        document.getElementById('password-login-error').textContent = 'يرجى إدخال كلمة المرور';
        document.getElementById('password-login-error').style.display = 'block';
        document.getElementById('password-login').classList.add('input-error');
        isValid = false;
    } else {
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
    if (password.length < 8 || !hasUppercase || !hasLowercase || !hasNumber) {
        let errorMsg = 'كلمة المرور يجب أن تحتوي على:\n';
        if (password.length < 8) errorMsg += '- 8 أحرف على الأقل\n';
        if (!hasUppercase) errorMsg += '- حرف كبير واحد على الأقل (A-Z)\n';
        if (!hasLowercase) errorMsg += '- حرف صغير واحد على الأقل (a-z)\n';
        if (!hasNumber) errorMsg += '- رقم واحد على الأقل (0-9)';
        document.getElementById('password-login-error').textContent = errorMsg;
        document.getElementById('password-login-error').style.display = 'block';
        document.getElementById('password-login').classList.add('input-error');
        isValid = false;
        }
    }
    if (isValid) {
        // هنا يمكنك إضافة كود الإرسال إلى الخادم
        document.getElementById('login-success').textContent = 'تم تسجيل الدخول بنجاح!';
        document.getElementById('login-success').style.display = 'block';
        
        // إعادة تعيين النموذج
        loginForm.reset();
    }
});
// معالجة إنشاء الحساب
const registerForm = document.querySelector('.register-form');
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessages();
    
    const name = document.getElementById('name-register').value;
    const email = document.getElementById('email-register').value;
    const password = document.getElementById('password-register').value;
    const rePassword = document.getElementById('re-password').value;
    let isValid = true; 
    // التحقق من الاسم
    if (!name) {
        document.getElementById('name-register-error').textContent = 'يرجى إدخال اسم المستخدم';
        document.getElementById('name-register-error').style.display = 'block';
        document.getElementById('name-register').classList.add('input-error');
        isValid = false;
    }
    // التحقق من البريد الإلكتروني
    if (!email) {
        document.getElementById('email-register-error').textContent = 'يرجى إدخال البريد الإلكتروني';
        document.getElementById('email-register-error').style.display = 'block';
        document.getElementById('email-register').classList.add('input-error');
        isValid = false;
    } else if (!validateEmail(email)) {
        document.getElementById('email-register-error').textContent = 'البريد الإلكتروني غير صحيح';
        document.getElementById('email-register-error').style.display = 'block';
        document.getElementById('email-register').classList.add('input-error');
        isValid = false;
    }
    // التحقق من كلمة المرور
    if (!password) {
        document.getElementById('password-register-error').textContent = 'يرجى إدخال كلمة المرور';
        document.getElementById('password-register-error').style.display = 'block';
        document.getElementById('password-register').classList.add('input-error');
        isValid = false;
    } else {
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (password.length < 8 || !hasUppercase || !hasLowercase || !hasNumber) {
            let errorMsg = 'كلمة المرور يجب أن تحتوي على:\n';
            if (password.length < 8) errorMsg += '- 8 أحرف على الأقل\n';
            if (!hasUppercase) errorMsg += '- حرف كبير واحد على الأقل (A-Z)\n';
            if (!hasLowercase) errorMsg += '- حرف صغير واحد على الأقل (a-z)\n';
            if (!hasNumber) errorMsg += '- رقم واحد على الأقل (0-9)';
            document.getElementById('password-register-error').textContent = errorMsg;
            document.getElementById('password-register-error').style.display = 'block';
            document.getElementById('password-register').classList.add('input-error');
            isValid = false;
        }
    }
    // التحقق من تطابق كلمة المرور
    if (password !== rePassword) {
        document.getElementById('re-password-error').textContent = 'كلمة المرور غير متطابقة';
        document.getElementById('re-password-error').style.display = 'block';
        document.getElementById('re-password').classList.add('input-error');
        isValid = false;
    }
    if (isValid) {
        // هنا يمكنك إضافة كود الإرسال إلى الخادم
        document.getElementById('register-success').textContent = 'تم إنشاء الحساب بنجاح! سيتم توجيهك إلى صفحة تسجيل الدخول';
        document.getElementById('register-success').style.display = 'block';   
        // إعادة تعيين النموذج
        registerForm.reset();
        // الانتقال إلى صفحة تسجيل الدخول بعد 3 ثواني
        setTimeout(() => {
            showSection(loginSection, registerSection);
        }, 3000);
    }
});
// إضافة تحقق أثناء الكتابة
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function() {
        this.classList.remove('input-error');
        const errorElement = document.getElementById(`${this.id}-error`);
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
    });
});
// End error and success in login and register